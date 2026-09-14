import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ApiService } from '../../core/api.service';
import { ConfirmService } from '../../core/confirm.service';
import { StatusBadgeComponent } from '../../shared/status-badge.component';
import { IconComponent } from '../../shared/icon.component';
import { signatureChannelLabel } from '../../shared/esign';

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
  city: 'Ubicación',
  country: 'País',
  province: 'Provincia',
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
  imports: [FormsModule, RouterLink, DatePipe, DecimalPipe, StatusBadgeComponent, IconComponent],
  template: `
    @if (loadError) {
      <article class="case case-state">
        <p class="err">{{ loadError }}</p>
        <a class="back-link" routerLink="/abogado"><app-icon name="arrow-left" [size]="16" />Volver a bandeja</a>
      </article>
    } @else if (!ws) {
      <article class="case case-state"><p class="muted">Cargando expediente…</p></article>
    } @else {
      <article class="case">
        <a class="back-link" routerLink="/abogado"><app-icon name="arrow-left" [size]="16" />Bandeja</a>

        <header class="case-head">
          <div class="case-head-row">
            <h1>Expediente <span class="mono">#{{ ws.case.id }}</span></h1>
            <div class="case-badges">
              <app-status-badge [label]="ws.case.status_label" [variant]="ws.case.status === '10' ? 'ok' : 'info'" />
              @if (satjeLinks.length) {
                <app-status-badge label="SATJE vinculado" variant="ok" />
              }
            </div>
          </div>
          <p class="meta">{{ ws.case.client_name }} · {{ ws.case.city }} · \${{ ws.case.amount_cents / 100 | number:'1.2-2' }}</p>
          <ol class="progress" aria-label="Etapa del trámite">
            @for (s of STATE_KEYS; track s) {
              <li
                class="st"
                [class.done]="s <= ws.case.status"
                [class.cur]="s === ws.case.status"
                [title]="STATE_LABELS[s]"
              >{{ s }}</li>
            }
          </ol>
          <span class="case-rule" aria-hidden="true"></span>
        </header>

        <nav class="tabs" role="tablist" aria-label="Secciones del expediente">
          @for (t of tabDefs; track t.id) {
            <button
              type="button"
              role="tab"
              class="tab"
              [class.on]="tab === t.id"
              [attr.aria-selected]="tab === t.id"
              (click)="tab = t.id"
            >{{ t.label }}</button>
          }
        </nav>

        <div class="case-body">
          <section class="case-panel" role="tabpanel">
            @if (tab === 'resumen') {
              <button type="button" class="accordion" (click)="qOpen = !qOpen">
                Cuestionario del cliente
                <app-icon [name]="qOpen ? 'chevron-down' : 'chevron-right'" [size]="16" />
              </button>
              @if (qOpen) {
                <table class="qtable">
                  @for (row of qRows; track row.key) {
                    <tr><td>{{ row.label }}</td><td>{{ row.value }}</td></tr>
                  }
                </table>
              }
              <p class="meta-line">{{ ws.case.paid ? 'Pagado' : 'Sin pago' }} · {{ ws.documents.length }} documentos · {{ ws.signatures.length }} firmas</p>
              @if (satjeLinks.length) {
                <div class="satje-block">
                  <h2>Vínculo SATJE</h2>
                  @for (l of satjeLinks; track l.cause_no) {
                    <p><strong>{{ l.label || l.cause_no }}</strong> · {{ l.court }}</p>
                  }
                </div>
              }
            }

            @if (tab === 'docs') {
              <h2>Documentos del cliente</h2>
              @for (d of latestDocuments; track d.id) {
                <div class="doc">
                  <div class="doc-info">
                    <span class="thumb" [class]="d.doc_type" aria-hidden="true">{{ docThumb(d.doc_type) }}</span>
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
            }

            @if (tab === 'minuta') {
              <h2>Minuta y acta notarial</h2>
              <p class="muted flow-note">
                La notaría envía la minuta y el acta al abogado por fuera de la plataforma.
                <strong>Tú, como abogado, subes aquí el PDF</strong> para que el cliente pueda revisarlo y firmar.
              </p>
              @if (ws.case.status === '02') {
                <p class="muted">El cliente aún debe cargar documentos. Cuando estén en revisión (estado 03), podrás subir la minuta recibida de la notaría.</p>
              } @else if (ws.case.status === '03' && hasPendingDocs) {
                <p class="muted">Aprueba primero los documentos en la pestaña <strong>Documentos</strong>. Al aprobar el último, el expediente pasará automáticamente a estado 04.</p>
              }
              @if (ws.outputs.length) {
                @for (o of ws.outputs; track o.id) {
                  <p><a [href]="o.url" target="_blank">{{ o.filename }}</a> · {{ o.created_at | date:'short' }}</p>
                }
              } @else {
                <p class="muted">Minuta / acta notarial no cargada aún.</p>
              }
              @if (minutaOk) { <p class="ok">{{ minutaOk }}</p> }
              @if (minutaError) { <p class="err">{{ minutaError }}</p> }
              @if (canUploadMinuta) {
                <label class="minuta-drop">
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" (change)="onMinutaFile($event)" [disabled]="minutaBusy" hidden />
                  <span>{{ minutaBusy ? 'Subiendo…' : 'Subir minuta o acta (PDF)' }}</span>
                </label>
              } @else if (ws.case.status !== '02') {
                <p class="muted">Subida disponible en revisión jurídica (03) o documentos preparados (04), con todos los documentos aprobados.</p>
              }
            }

            @if (tab === 'firmas') {
              <h2>Documentos firmados del cliente</h2>
              @if (ws.signatures.length) {
                <p class="muted">Revisa el documento (subido por el cliente o firma LegalStation) antes de confirmar en el panel derecho (estado 05).</p>
                @for (s of ws.signatures; track s.id) {
                  <div class="sig">
                    @if (isPdfSig(s.image_url)) {
                      <a class="btn btn-ghost" [href]="s.image_url" target="_blank">Ver documento firmado</a>
                    } @else {
                      <img [src]="s.image_url" alt="documento firmado del cliente" />
                    }
                    <p class="muted">{{ sigChannel(s) }} · IP {{ s.ip }} · {{ s.signed_at | date:'medium' }}</p>
                  </div>
                }
              } @else if (ws.case.status === '04' || ws.case.status === '05') {
                <p class="muted">Sin documento firmado aún. El cliente puede subirlo desde su expediente; opcionalmente usa «Notificar al cliente».</p>
              } @else {
                <p class="muted">Sin documentos firmados aún.</p>
              }
            }

            @if (tab === 'historial') {
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
              <h2 class="notes-h">Notas internas</h2>
              @for (n of ws.notes; track n.id) {
                <div class="note"><strong>{{ n.author_name }}</strong> <span class="muted">{{ n.created_at | date:'short' }}</span><p>{{ n.body }}</p></div>
              }
              <div class="field"><label>Nueva nota</label><textarea rows="3" [(ngModel)]="noteBody"></textarea></div>
              <label class="check"><input type="checkbox" [(ngModel)]="noteVisibleToClient" /> Visible para el cliente</label>
              <button type="button" class="btn btn-ghost" (click)="addNote()">Guardar nota</button>
            }
          </section>

          <aside class="case-rail">
            @if (ws.blockers.length) {
              <section class="rail-blockers">
                <strong>Pendientes</strong>
                @if (ws.stage_hint) { <p class="muted flow-hint">{{ ws.stage_hint }}</p> }
                <ul>@for (b of ws.blockers; track b) { <li>{{ b }}</li> }</ul>
                @if (ws.case.status === '03') {
                  <p class="muted flow-hint flow-order">
                    Orden: 1) Aprobar docs <app-icon name="arrow-right" [size]="12" />
                    2) Minuta <app-icon name="arrow-right" [size]="12" />
                    3) Firma cliente <app-icon name="arrow-right" [size]="12" />
                    4) Confirmar.
                  </p>
                }
              </section>
            }
            <section class="rail-actions sticky">
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
            </section>
          </aside>
        </div>
      </article>
    }
  `,
  styles: [`
    :host { display: block; }

    .case {
      padding-block: 0 var(--space-6);
      animation: case-in 360ms var(--ease-out) both;
    }

    .case-state {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: var(--space-5);
    }

    .back-link {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      margin-bottom: var(--space-3);
      font-size: var(--text-sm);
      color: var(--text-secondary);
      text-decoration: none;
    }
    .back-link:hover { color: var(--primary); }

    .case-head {
      margin-bottom: var(--space-4);
      animation: case-head-in 480ms var(--ease-out) both;
    }

    .case-head-row {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: var(--space-3) var(--space-4);
      flex-wrap: wrap;
    }

    .case-head h1 {
      margin: 0;
      font-family: var(--font-display);
      font-size: clamp(1.45rem, 2vw, 1.85rem);
      font-weight: 600;
      letter-spacing: -0.03em;
      line-height: 1.15;
      color: var(--text);
    }

    .mono { font-variant-numeric: tabular-nums; }

    .case-badges {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
      align-items: center;
    }

    .meta {
      margin: var(--space-2) 0 0;
      color: var(--text-secondary);
      font-size: var(--text-sm);
      line-height: 1.45;
    }

    .progress {
      display: flex;
      flex-wrap: wrap;
      gap: 0.2rem;
      list-style: none;
      margin: var(--space-3) 0 0;
      padding: 0;
    }

    .st {
      font-variant-numeric: tabular-nums;
      font-size: 0.62rem;
      font-weight: 700;
      width: 1.4rem;
      height: 1.4rem;
      display: grid;
      place-items: center;
      border-radius: var(--radius-sm);
      background: var(--bg-muted);
      color: var(--text-muted);
    }
    .st.done { background: var(--success-subtle); color: var(--success); }
    .st.cur { background: var(--primary); color: white; }

    .case-rule {
      display: block;
      position: relative;
      height: 1px;
      margin-top: var(--space-4);
      background: var(--border);
      transform-origin: left center;
      animation: case-rule-in 560ms var(--ease-out) both;
      animation-delay: 80ms;
    }
    .case-rule::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      width: 2.5rem;
      height: 100%;
      background: var(--primary);
    }

    .tabs {
      display: flex;
      flex-wrap: wrap;
      gap: 0.25rem;
      margin-bottom: var(--space-4);
      border-bottom: 1px solid var(--border);
      padding-bottom: 0;
    }

    .tab {
      appearance: none;
      border: 0;
      background: transparent;
      padding: var(--space-2) var(--space-3);
      font: inherit;
      font-size: var(--text-sm);
      font-weight: 600;
      color: var(--text-secondary);
      cursor: pointer;
      border-radius: var(--radius-sm) var(--radius-sm) 0 0;
      margin-bottom: -1px;
      border-bottom: 2px solid transparent;
      transition: color 180ms var(--ease-out), border-color 180ms var(--ease-out), background 180ms var(--ease-out);
    }
    .tab:hover { color: var(--text); background: var(--bg-muted); }
    .tab.on {
      color: var(--primary);
      border-bottom-color: var(--primary);
      background: transparent;
    }
    .tab:focus-visible {
      outline: 2px solid var(--focus-ring);
      outline-offset: 2px;
    }

    .case-body {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 280px;
      gap: var(--space-4);
      align-items: start;
    }

    .case-panel {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: var(--space-4) var(--space-5);
      min-width: 0;
    }

    .case-panel h2 {
      margin: 0 0 var(--space-3);
      font-size: var(--text-base);
      font-weight: 650;
    }

    .notes-h { margin-top: var(--space-5); }

    .case-rail {
      display: grid;
      gap: var(--space-3);
      animation: case-rail-in 420ms var(--ease-out) both;
      animation-delay: 60ms;
    }

    .rail-blockers,
    .rail-actions {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: var(--space-4);
    }

    .rail-blockers {
      background: var(--warning-subtle);
      border-color: var(--warning-border);
    }

    .rail-blockers strong {
      font-size: var(--text-sm);
      display: block;
      margin-bottom: var(--space-1);
    }

    .rail-blockers ul {
      margin: var(--space-2) 0 0;
      padding-left: 1.1rem;
      font-size: var(--text-sm);
      line-height: 1.4;
    }

    .rail-actions h2 {
      margin: 0;
      font-size: var(--text-sm);
      font-weight: 650;
    }

    .sticky {
      position: sticky;
      top: calc(var(--header-height) + var(--space-4));
    }

    .flow-hint {
      margin: var(--space-2) 0 0;
      font-size: var(--text-xs);
      line-height: 1.45;
    }
    .flow-hint app-icon { vertical-align: -0.15em; }
    .flow-order { margin-top: var(--space-3); }

    .accordion {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-2);
      width: 100%;
      text-align: left;
      background: none;
      border: 0;
      font-weight: 650;
      font-size: var(--text-base);
      color: var(--text);
      cursor: pointer;
      padding: 0;
    }

    .qtable {
      width: 100%;
      border-collapse: collapse;
      font-size: var(--text-sm);
      margin-top: var(--space-3);
    }
    .qtable td {
      padding: 0.25rem 0;
      border-bottom: 1px solid var(--border);
      vertical-align: top;
    }
    .qtable td:first-child {
      width: 55%;
      color: var(--text-secondary);
      font-weight: 500;
    }

    .meta-line {
      margin: var(--space-4) 0 0;
      padding-top: var(--space-3);
      border-top: 1px solid var(--border);
      font-size: var(--text-sm);
      color: var(--text-secondary);
    }

    .satje-block {
      margin-top: var(--space-4);
      padding-top: var(--space-3);
      border-top: 1px solid var(--border);
    }
    .satje-block h2 { margin-bottom: var(--space-2); }
    .satje-block p { margin: 0.25rem 0; font-size: var(--text-sm); }

    .doc {
      border-top: 1px solid var(--border);
      padding: var(--space-3) 0;
      display: flex;
      justify-content: space-between;
      gap: var(--space-3);
      flex-wrap: wrap;
    }
    .doc:first-of-type { border-top: 0; padding-top: 0; }
    .doc-info { display: flex; gap: var(--space-3); align-items: start; min-width: 0; }
    .thumb {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-sm);
      display: grid;
      place-items: center;
      font-size: 0.7rem;
      font-weight: 700;
      color: white;
      flex-shrink: 0;
      background: var(--primary);
    }
    .thumb.partida { background: var(--warning-subtle); color: var(--text); border: 1px solid var(--border); }
    .doc-actions { display: flex; gap: var(--space-2); flex-wrap: wrap; }

    .sig img {
      max-width: 180px;
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      background: var(--surface);
    }

    .minuta-drop {
      display: inline-flex;
      margin-top: var(--space-4);
      padding: var(--space-4) var(--space-5);
      border: 2px dashed var(--border);
      border-radius: var(--radius-md);
      cursor: pointer;
      font-weight: 600;
      color: var(--primary);
      transition: border-color 180ms var(--ease-out), background 180ms var(--ease-out);
    }
    .minuta-drop:hover {
      border-color: var(--primary);
      background: var(--primary-subtle);
    }

    .action-block {
      border-top: 1px solid var(--border);
      padding-top: var(--space-3);
      margin-top: var(--space-3);
    }
    .action-block:first-of-type {
      border-top: 0;
      padding-top: var(--space-2);
      margin-top: var(--space-2);
    }

    .timeline { list-style: none; padding: 0; margin: 0; }
    .timeline li {
      display: flex;
      gap: var(--space-3);
      padding: var(--space-3) 0;
      border-top: 1px solid var(--border);
    }
    .timeline li:first-child { border-top: 0; }
    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--primary);
      margin-top: 0.4rem;
      flex-shrink: 0;
    }
    .timeline p {
      margin: 0.2rem 0 0;
      font-size: var(--text-sm);
      color: var(--text-secondary);
    }

    .note {
      border-top: 1px solid var(--border);
      padding: var(--space-3) 0;
    }
    .check {
      display: flex;
      gap: var(--space-2);
      align-items: center;
      font-size: var(--text-sm);
      margin: var(--space-2) 0 var(--space-3);
    }

    .err { color: var(--danger); }
    .ok { color: var(--success); font-weight: 600; }
    .flow-note { margin: 0 0 var(--space-3); font-size: var(--text-sm); }

    @keyframes case-in {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: none; }
    }
    @keyframes case-head-in {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: none; }
    }
    @keyframes case-rule-in {
      from { opacity: 0; transform: scaleX(0.35); }
      to { opacity: 1; transform: scaleX(1); }
    }
    @keyframes case-rail-in {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: none; }
    }

    @media (max-width: 900px) {
      .case-body { grid-template-columns: 1fr; }
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

  sigChannel(s: { channel?: string }): string {
    return signatureChannelLabel(s.channel);
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
