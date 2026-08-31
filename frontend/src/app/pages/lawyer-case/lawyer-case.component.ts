import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ApiService } from '../../core/api.service';
import { ConfirmService } from '../../core/confirm.service';
import { StatusBadgeComponent } from '../../shared/status-badge.component';

const Q_LABELS: Record<string, string> = {
  both_want_divorce: 'Ambos desean divorciarse',
  marriage_in_ecuador: 'Matrimonio registrado en Ecuador',
  have_children: 'Tienen hijos',
  minor_dependents: 'Hijos menores o dependientes',
  custody_regulated: 'Alimentos, tenencia y visitas regulados',
  has_mediation_acta: 'Acta de mediación o resolución judicial',
  someone_abroad: 'Alguno reside fuera del Ecuador',
  have_assets: 'Bienes adquiridos durante matrimonio',
  conjugal_society: 'Sociedad conyugal',
  ids_valid: 'Identificación vigente ambas partes',
  want_liquidate_assets: 'Desean liquidar bienes',
  city: 'Ciudad',
};

const STATE_KEYS = ['01','02','03','04','05','06','07','08','09','10'];
const STATE_LABELS: Record<string, string> = {
  '01': 'Info recibida', '02': 'Docs pendientes', '03': 'Revisión', '04': 'Docs preparados',
  '05': 'Firmas', '06': 'Notaría', '07': 'Comparecencia', '08': 'Acta', '09': 'Registro', '10': 'Finalizado',
};

type Tab = 'resumen' | 'docs' | 'minuta' | 'firmas' | 'historial';

@Component({
  selector: 'app-lawyer-case',
  standalone: true,
  imports: [FormsModule, RouterLink, DatePipe, DecimalPipe, StatusBadgeComponent],
  template: `
    @if (loadError) {
      <div class="wrap panel">
        <p class="err">{{ loadError }}</p>
        <p><a routerLink="/abogado">← Volver a bandeja</a></p>
      </div>
    } @else if (!ws) {
      <div class="wrap panel"><p class="muted">Cargando expediente…</p></div>
    } @else {
      <div class="wrap">
        <p class="muted"><a routerLink="/abogado">← Bandeja</a></p>

        <header class="case-header panel">
          <div class="case-title">
            <h1>Expediente <span class="mono">#{{ ws.case.id }}</span></h1>
            <p>{{ ws.case.client_name }} · {{ ws.case.city }} · \${{ ws.case.amount_cents / 100 | number:'1.2-2' }}</p>
          </div>
          <app-status-badge [label]="ws.case.status_label" [variant]="ws.case.status === '10' ? 'ok' : 'info'" />
          @if (satjeLinks.length) {
            <app-status-badge label="SATJE vinculado" variant="ok" />
          }
          <div class="state-bar">
            @for (s of STATE_KEYS; track s) {
              <span class="st" [class.done]="s <= ws.case.status" [class.cur]="s === ws.case.status" [title]="STATE_LABELS[s]">{{ s }}</span>
            }
          </div>
        </header>

            @if (ws.blockers.length) {
          <div class="panel blockers">
            <strong>Pendientes en esta etapa</strong>
            @if (ws.stage_hint) { <p class="muted flow-hint">{{ ws.stage_hint }}</p> }
            <ul>@for (b of ws.blockers; track b) { <li>{{ b }}</li> }</ul>
            @if (ws.case.status === '03') {
              <p class="muted flow-hint">Orden: 1) Ver y aprobar cada documento → 2) Subir minuta del notario → 3) Cliente sube documento firmado → 4) Confirmar firma.</p>
            }
          </div>
        }

        <div class="tabs">
          @for (t of tabDefs; track t.id) {
            <button type="button" class="btn btn-ghost" [class.on]="tab === t.id" (click)="tab = t.id">{{ t.label }}</button>
          }
        </div>

        <div class="layout">
          <section class="main stack">
            @if (tab === 'resumen') {
              <div class="panel">
                <button type="button" class="accordion" (click)="qOpen = !qOpen">
                  Cuestionario del cliente {{ qOpen ? '▾' : '▸' }}
                </button>
                @if (qOpen) {
                  <table class="qtable">
                    @for (row of qRows; track row.key) {
                      <tr><td>{{ row.label }}</td><td>{{ row.value }}</td></tr>
                    }
                  </table>
                }
              </div>
              <div class="panel">
                <h2>Resumen rápido</h2>
                <p class="muted">{{ ws.case.paid ? 'Pagado' : 'Sin pago' }} · {{ ws.documents.length }} documentos · {{ ws.signatures.length }} firmas</p>
              </div>
              @if (satjeLinks.length) {
                <div class="panel">
                  <h2>Vínculo SATJE</h2>
                  @for (l of satjeLinks; track l.cause_no) {
                    <p><strong>{{ l.label || l.cause_no }}</strong> · {{ l.court }}</p>
                  }
                </div>
              }
            }

            @if (tab === 'docs') {
              <div class="panel">
                <h2>Documentos del cliente</h2>
                @for (d of latestDocuments; track d.id) {
                  <div class="doc">
                    <div class="doc-info">
                      <div class="thumb" [class]="d.doc_type" aria-hidden="true">{{ docThumb(d.doc_type) }}</div>
                      <div>
                        <strong>{{ docLabel(d.doc_type) }}</strong> — {{ d.filename }}
                        <app-status-badge [label]="reviewLabel(d.review_status)" [variant]="reviewVariant(d.review_status)" />
                        @if (d.review_note) { <p class="muted">{{ d.review_note }}</p> }
                      </div>
                    </div>
                    <div class="doc-actions">
                      <a class="btn btn-ghost" [href]="d.url" target="_blank" (click)="markDocViewed(d.id)">Ver</a>
                      @if (d.review_status === 'pending') {
                      <button type="button" class="btn btn-primary"
                        [disabled]="!isDocViewed(d.id)"
                        [title]="!isDocViewed(d.id) ? 'Debes abrir el documento antes de aprobar' : ''"
                        (click)="confirmReview(d.id, 'approved')">Aprobar</button>
                      <button type="button" class="btn btn-ghost" (click)="rejectDoc(d)">Rechazar</button>
                      }
                    </div>
                  </div>
                }
                @if (!ws.documents.length) { <p class="muted">Sin documentos cargados.</p> }
              </div>
            }

            @if (tab === 'minuta') {
              <div class="panel">
                <h2>Minuta del trámite</h2>
                @if (ws.case.status === '02') {
                  <p class="muted">El cliente aún debe cargar documentos. Cuando estén en revisión (estado 03), podrás subir la minuta del notario.</p>
                } @else if (ws.case.status === '03' && hasPendingDocs) {
                  <p class="muted">Aprueba primero los documentos en la pestaña <strong>Documentos</strong>. Al aprobar el último, el expediente pasará automáticamente a estado 04.</p>
                }
                @if (ws.outputs.length) {
                  @for (o of ws.outputs; track o.id) {
                    <p><a [href]="o.url" target="_blank">{{ o.filename }}</a> · {{ o.created_at | date:'short' }}</p>
                  }
                } @else {
                  <p class="muted">Minuta del notario no cargada.</p>
                }
                @if (minutaOk) { <p class="ok">{{ minutaOk }}</p> }
                @if (minutaError) { <p class="err">{{ minutaError }}</p> }
                @if (canUploadMinuta) {
                  <label class="minuta-drop">
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" (change)="onMinutaFile($event)" [disabled]="minutaBusy" hidden />
                    <span>{{ minutaBusy ? 'Subiendo…' : 'Subir minuta del notario (PDF)' }}</span>
                  </label>
                } @else if (ws.case.status !== '02') {
                  <p class="muted">Subida disponible en revisión jurídica (03) o documentos preparados (04), con todos los documentos aprobados.</p>
                }
              </div>
            }

            @if (tab === 'firmas') {
              <div class="panel">
                <h2>Documentos firmados del cliente</h2>
                @if (ws.signatures.length) {
                  <p class="muted">Revisa el documento subido antes de confirmar en el panel derecho (estado 05).</p>
                  @for (s of ws.signatures; track s.id) {
                    <div class="sig">
                      @if (isPdfSig(s.image_url)) {
                        <a class="btn btn-ghost" [href]="s.image_url" target="_blank">Ver documento firmado</a>
                      } @else {
                        <img [src]="s.image_url" alt="documento firmado del cliente" />
                      }
                      <p class="muted">IP {{ s.ip }} · {{ s.signed_at | date:'medium' }}</p>
                    </div>
                  }
                } @else if (ws.case.status === '04' || ws.case.status === '05') {
                  <p class="muted">Sin documento firmado aún. El cliente puede subirlo desde su expediente; opcionalmente usa «Notificar al cliente».</p>
                } @else {
                  <p class="muted">Sin documentos firmados aún.</p>
                }
              </div>
            }

            @if (tab === 'historial') {
              <div class="panel">
                <h2>Historial del trámite</h2>
                <ul class="timeline">
                  @for (e of ws.events; track e.id) {
                    <li>
                      <span class="dot"></span>
                      <div>
                        <strong>{{ e.status_label || e.status }}</strong>
                        <span class="muted">{{ e.created_at | date:'short' }}</span>
                        <p>{{ e.note }}</p>
                      </div>
                    </li>
                  }
                </ul>
              </div>
              <div class="panel">
                <h2>Notas internas</h2>
                @for (n of ws.notes; track n.id) {
                  <div class="note"><strong>{{ n.author_name }}</strong> <span class="muted">{{ n.created_at | date:'short' }}</span><p>{{ n.body }}</p></div>
                }
                <div class="field"><label>Nueva nota</label><textarea rows="3" [(ngModel)]="noteBody"></textarea></div>
                <label class="check"><input type="checkbox" [(ngModel)]="noteVisibleToClient" /> Visible para el cliente</label>
                <button type="button" class="btn btn-ghost" (click)="addNote()">Guardar nota</button>
              </div>
            }
          </section>

          <aside class="side stack">
            <div class="panel actions-panel sticky">
              <h2>Próxima acción</h2>
              @for (a of ws.next_actions; track a.id) {
                <div class="action-block">
                  <p><strong>{{ a.label }}</strong></p>
                  @if (a.description) { <p class="muted">{{ a.description }}</p> }
                  @if (a.id === 'register_notary_send') {
                    <div class="field"><label>Notaría</label><input [(ngModel)]="notaryName" placeholder="Ej. Notaría 12 Quito" /></div>
                  }
                  @if (a.id === 'register_appointment') {
                    <div class="field"><label>Fecha comparecencia</label><input type="datetime-local" [(ngModel)]="appointmentAt" /></div>
                  }
                  <button type="button" class="btn btn-primary" (click)="confirmRunAction(a)" [disabled]="actionBusy">{{ a.label }}</button>
                </div>
              }
              @if (ws.case.status === '04' && !ws.signatures.length) {
                <p class="muted flow-hint">Estado 04: «Notificar al cliente» solo envía aviso — no cambia el estado. Confirma solo cuando veas la firma en la pestaña Firmas (estado 05).</p>
              }
              @if (ws.case.status === '05' && !ws.signatures.length) {
                <p class="muted flow-hint">Esperando firma virtual del cliente. Puede firmar solo desde su expediente.</p>
              }
              @if (ws.case.status === '04' && !hasMinutaOutput) {
                <p class="muted flow-hint">En estado 04: abre la pestaña <strong>Minuta</strong> y sube el PDF del notario. Luego podrás enviar a firma.</p>
              }
              @if (!ws.next_actions.length && ws.case.status !== '10') {
                <p class="muted">Completa los pendientes para habilitar la siguiente acción.</p>
              }
              @if (ws.case.status === '10') {
                <p class="ok">Trámite finalizado.</p>
              }
              @if (actionError) { <p class="err">{{ actionError }}</p> }
            </div>
          </aside>
        </div>
      </div>
    }
  `,
  styles: [`
    .wrap { padding-block: 0.5rem 2rem; }
    .case-header { display: grid; gap: 1rem; margin-bottom: 1rem; }
    .case-title h1 { margin: 0; font-size: 1.6rem; }
    .case-title p { margin: 0.25rem 0 0; color: var(--ink-soft); }
    .mono { font-family: ui-monospace, monospace; }
    .state-bar { display: flex; flex-wrap: wrap; gap: 0.25rem; }
    .st {
      font-family: ui-monospace, monospace; font-size: 0.68rem; font-weight: 700;
      width: 1.65rem; height: 1.65rem; display: grid; place-items: center;
      border-radius: 6px; background: var(--line); color: var(--ink-soft);
    }
    .st.done { background: oklch(0.92 0.04 150); color: var(--ok); }
    .st.cur { background: var(--brand); color: white; }
    .blockers { background: oklch(0.96 0.03 85); margin-bottom: 1rem; }
    .blockers ul { margin: 0.5rem 0 0; padding-left: 1.2rem; }
    .flow-hint { margin: 0.75rem 0 0; font-size: 0.88rem; line-height: 1.5; }
    .tabs { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 1rem; }
    .tabs .on { background: var(--brand); color: white; border-color: var(--brand); }
    .layout { display: grid; grid-template-columns: 1fr 340px; gap: 1.25rem; align-items: start; }
    .stack { display: grid; gap: 1rem; }
    .sticky { position: sticky; top: 5.5rem; }
    .accordion {
      width: 100%; text-align: left; background: none; border: 0; font-weight: 600;
      font-size: 1rem; cursor: pointer; padding: 0; font-family: var(--font-display);
    }
    .qtable { width: 100%; border-collapse: collapse; font-size: 0.92rem; margin-top: 0.75rem; }
    .qtable td { padding: 0.35rem 0; border-bottom: 1px solid var(--line); vertical-align: top; }
    .qtable td:first-child { width: 55%; color: var(--ink-soft); font-weight: 500; }
    .doc { border-top: 1px solid var(--line); padding: 0.75rem 0; display: flex; justify-content: space-between; gap: 0.75rem; flex-wrap: wrap; }
    .doc-info { display: flex; gap: 0.75rem; align-items: start; }
    .thumb {
      width: 48px; height: 48px; border-radius: 8px; display: grid; place-items: center;
      font-size: 0.75rem; font-weight: 700; color: white;
    }
    .thumb.cedula { background: var(--brand); }
    .thumb.partida { background: var(--accent); color: var(--ink); }
    .doc-actions { display: flex; gap: 0.4rem; flex-wrap: wrap; }
    .sig img { max-width: 180px; border: 1px solid var(--line); border-radius: 8px; background: white; }
    .minuta-drop {
      display: inline-flex; margin-top: 1rem; padding: 1rem 1.25rem;
      border: 2px dashed var(--line); border-radius: 10px; cursor: pointer;
      font-weight: 600; color: var(--brand);
    }
    .minuta-drop:hover { border-color: var(--brand); background: oklch(0.97 0.02 200); }
    .action-block { border-top: 1px solid var(--line); padding-top: 0.75rem; margin-top: 0.75rem; }
    .timeline { list-style: none; padding: 0; margin: 0; }
    .timeline li { display: flex; gap: 0.75rem; padding: 0.65rem 0; border-top: 1px solid var(--line); }
    .timeline li:first-child { border-top: 0; }
    .dot { width: 10px; height: 10px; border-radius: 50%; background: var(--brand); margin-top: 0.35rem; flex-shrink: 0; }
    .timeline p { margin: 0.25rem 0 0; font-size: 0.9rem; color: var(--ink-soft); }
    .note { border-top: 1px solid var(--line); padding: 0.6rem 0; }
    .check { display: flex; gap: 0.5rem; align-items: center; font-size: 0.88rem; margin: 0.5rem 0 0.75rem; }
    .err { color: var(--bad); } .ok { color: var(--ok); font-weight: 600; }
    @media (max-width: 900px) {
      .layout { grid-template-columns: 1fr; }
      .sticky { position: static; }
    }
  `]
})
export class LawyerCaseComponent implements OnInit {
  ws: any = null;
  loadError = '';
  noteBody = '';
  noteVisibleToClient = false;
  satjeLinks: any[] = [];
  notaryName = '';
  appointmentAt = '';
  actionBusy = false;
  actionError = '';
  minutaBusy = false;
  minutaError = '';
  minutaOk = '';
  qOpen = true;
  tab: Tab = 'resumen';
  viewedDocIds = new Set<number>();
  qRows: { key: string; label: string; value: string }[] = [];
  STATE_KEYS = STATE_KEYS;
  STATE_LABELS = STATE_LABELS;
  tabDefs: { id: Tab; label: string }[] = [
    { id: 'resumen', label: 'Resumen' },
    { id: 'docs', label: 'Documentos' },
    { id: 'minuta', label: 'Minuta' },
    { id: 'firmas', label: 'Firmas' },
    { id: 'historial', label: 'Historial' },
  ];

  constructor(private route: ActivatedRoute, private api: ApiService, private confirm: ConfirmService) {}

  get canUploadMinuta(): boolean {
    if (!this.ws) return false;
    const st = this.ws.case?.status;
    if (st !== '03' && st !== '04') return false;
    return !this.hasPendingDocs;
  }

  get hasPendingDocs(): boolean {
    return this.latestDocuments.some((d: any) => d.review_status === 'pending' || d.review_status === 'rejected');
  }

  /** Solo la versión más reciente por tipo — evita duplicados al reemplazar archivos. */
  get latestDocuments(): any[] {
    const docs = this.ws?.documents || [];
    const byType = new Map<string, any>();
    for (const d of docs) {
      const prev = byType.get(d.doc_type);
      if (!prev || d.id > prev.id) byType.set(d.doc_type, d);
    }
    return Array.from(byType.values()).sort((a, b) => a.id - b.id);
  }

  docThumb(type: string): string {
    const map: Record<string, string> = {
      cedula: 'CI', partida: 'PM', matricula: 'MV', titulo: 'TI', acuerdo: 'AC',
    };
    return map[type] || type.slice(0, 2).toUpperCase();
  }

  get hasMinutaOutput(): boolean {
    return (this.ws?.outputs || []).some((o: any) => o.output_type === 'minuta');
  }

  docLabel(type: string): string {
    const fromApi = (this.ws?.required_docs || []).find((d: { type: string; label: string }) => d.type === type);
    if (fromApi) return fromApi.label;
    const labels: Record<string, string> = {
      cedula: 'Cédula', partida: 'Partida', matricula: 'Matrícula', titulo: 'Título', acuerdo: 'Acuerdo mutuo',
    };
    return labels[type] || type;
  }

  ngOnInit(): void { this.reload(); }

  reload(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadError = '';
    this.ws = null;
    this.api.getLawyerWorkspace(id).subscribe({
      next: (w) => {
        this.ws = this.normalizeWorkspace(w);
        this.qRows = Object.entries(this.ws.questionnaire || {}).map(([key, val]) => ({
          key,
          label: Q_LABELS[key] || key,
          value: typeof val === 'boolean' ? (val ? 'Sí' : 'No') : String(val ?? '—'),
        }));
      },
      error: (e) => {
        this.loadError = e?.error?.error || 'No se pudo cargar el expediente';
      },
    });
    this.api.mockSatjeLinks(id).subscribe((d) => this.satjeLinks = d.links || []);
  }

  private normalizeWorkspace(w: any): any {
    return {
      ...w,
      blockers: w.blockers || [],
      documents: w.documents || [],
      signatures: w.signatures || [],
      outputs: w.outputs || [],
      events: w.events || [],
      notes: w.notes || [],
      next_actions: w.next_actions || [],
      required_docs: w.required_docs || [],
      stage_hint: w.stage_hint || '',
    };
  }

  markDocViewed(docId: number): void {
    this.viewedDocIds.add(docId);
  }

  isDocViewed(docId: number): boolean {
    return this.viewedDocIds.has(docId);
  }

  isPdfSig(url: string): boolean {
    return /\.pdf(\?|$)/i.test(url || '');
  }

  onMinutaFile(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.minutaBusy = true;
    this.minutaError = '';
    this.minutaOk = '';
    this.api.uploadMinuta(this.ws.case.id, file).subscribe({
      next: () => {
        this.minutaBusy = false;
        this.minutaOk = 'Minuta del notario cargada correctamente.';
        this.tab = 'minuta';
        input.value = '';
        this.reload();
      },
      error: (e) => {
        this.minutaBusy = false;
        input.value = '';
        this.minutaError = e?.error?.error || e?.error?.blockers?.join(' · ') || 'Error al subir minuta';
      },
    });
  }

  async confirmReview(docId: number, status: 'approved' | 'rejected', note = ''): Promise<void> {
    const ok = await this.confirm.confirm('¿Aprobar este documento?', 'Confirmar aprobación');
    if (!ok) return;
    this.review(docId, status, note);
  }

  review(docId: number, status: 'approved' | 'rejected', note = ''): void {
    this.api.reviewDocument(this.ws.case.id, docId, status, note).subscribe({
      next: (w) => {
        this.ws = this.normalizeWorkspace(w);
        this.actionError = '';
        if (status === 'approved') this.viewedDocIds.add(docId);
      },
      error: (e) => this.actionError = e?.error?.error || 'Error al revisar',
    });
  }

  async rejectDoc(d: any): Promise<void> {
    const note = await this.confirm.prompt('Describe el motivo del rechazo.', 'Rechazar documento');
    if (!note?.trim()) return;
    this.review(d.id, 'rejected', note.trim());
  }

  async confirmRunAction(a: { id: string; label: string }): Promise<void> {
    const isRevert = a.id === 'revert_step';
    const msg = isRevert
      ? '¿Revertir al estado anterior? Quedará registrado en el historial.'
      : `¿Confirmar acción: ${a.label}?`;
    const ok = await this.confirm.confirm(msg, isRevert ? 'Revertir estado' : 'Confirmar acción');
    if (!ok) return;
    this.runAction(a.id);
  }

  runAction(action: string): void {
    this.actionBusy = true;
    this.actionError = '';
    const payload: Record<string, string> = {};
    if (action === 'register_notary_send') payload['notary_name'] = this.notaryName;
    if (action === 'register_appointment') payload['appointment_at'] = this.appointmentAt;
    this.api.performCaseAction(this.ws.case.id, action, payload).subscribe({
      next: (w) => { this.ws = this.normalizeWorkspace(w); this.actionBusy = false; },
      error: (e) => {
        this.actionBusy = false;
        const err = e?.error;
        this.actionError = err?.blockers?.join(' · ') || err?.error || 'Acción bloqueada';
      },
    });
  }

  addNote(): void {
    if (!this.noteBody.trim()) return;
    this.api.addNote(this.ws.case.id, this.noteBody, this.noteVisibleToClient).subscribe(() => {
      this.noteBody = '';
      this.noteVisibleToClient = false;
      this.reload();
    });
  }

  reviewLabel(s: string): string {
    return { pending: 'Pendiente', approved: 'Aprobado', rejected: 'Rechazado' }[s] || s;
  }

  reviewVariant(s: string): 'warn' | 'ok' | 'bad' | 'default' {
    if (s === 'approved') return 'ok';
    if (s === 'rejected') return 'bad';
    return 'warn';
  }
}
