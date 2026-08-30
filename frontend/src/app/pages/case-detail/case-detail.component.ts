import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { DatePipe, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-case-detail',
  standalone: true,
  imports: [FormsModule, RouterLink, DecimalPipe, DatePipe],
  template: `
    @if (data) {
      <div class="shell wrap">
        <p class="muted">
          <a [routerLink]="auth.user()?.role === 'abogado' ? '/abogado' : '/cliente'">← Volver</a>
        </p>
        <h1>Expediente #{{ data.case.id }}</h1>
        <p class="lede">{{ data.case.client_name }} · <strong>{{ data.case.status_label }}</strong></p>

        @if (data.case.status === '03' && auth.user()?.role === 'cliente') {
          <div class="banner">Tu expediente está en revisión del abogado. Te notificaremos cuando avance.</div>
        }
        @if (data.case.status === '02' && hasRejectedDoc) {
          <div class="banner warn">Un documento fue rechazado. Vuelve a cargarlo desde Documentos.</div>
        }
        @if (data.case.status === '05' && auth.user()?.role === 'cliente') {
          <div class="banner">Tu minuta está lista. Por favor firma electrónicamente.</div>
        }

        <div class="layout">
          <section class="panel">
            <h2>Línea de estados</h2>
            <ol class="timeline">
              @for (key of stateKeys; track key) {
                <li [class.done]="key <= data.case.status" [class.current]="key === data.case.status">
                  <span class="num">{{ key }}</span>
                  <span>{{ data.states[key] }}</span>
                </li>
              }
            </ol>
          </section>

          <section class="stack">
            <div class="panel">
              <h2>Acciones</h2>
              <div class="actions">
                @if (!data.case.paid) {
                  <a class="btn btn-accent" [routerLink]="['/checkout', data.case.id]">Pagar</a>
                }
                <a class="btn btn-ghost" [routerLink]="['/upload', data.case.id]">Documentos</a>
                @if (data.case.status >= '04' || outputs.length) {
                  <a class="btn btn-ghost" [routerLink]="['/firma', data.case.id]">Firmar</a>
                }
              </div>
              <p class="muted">Monto: \${{ data.case.amount_cents / 100 | number:'1.2-2' }} · {{ data.case.paid ? 'Pagado' : 'Sin pago' }}</p>
            </div>

            <div class="panel">
              <h2>Mis documentos</h2>
              @if (!docs.length) { <p class="muted">Sin documentos cargados.</p> }
              @for (d of docs; track d.id) {
                <div class="doc-row">
                  <span>{{ d.doc_type === 'cedula' ? 'Cédula' : 'Partida' }} — {{ d.filename }}</span>
                  <span class="pill" [class]="d.review_status">{{ reviewLabel(d.review_status) }}</span>
                  @if (d.review_note && d.review_status === 'rejected') {
                    <p class="muted">{{ d.review_note }}</p>
                  }
                </div>
              }
            </div>

            @if (outputs.length) {
              <div class="panel">
                <h2>Minuta / documentos del trámite</h2>
                @for (o of outputs; track o.id) {
                  <p><a [href]="o.url" target="_blank">{{ o.filename }}</a></p>
                }
              </div>
            }

            <div class="panel">
              <h2>Historial</h2>
              <ul class="events">
                @for (e of data.events; track e.id) {
                  <li>
                    <strong>{{ e.status_label || e.status }}</strong>
                    <span class="muted">{{ e.created_at | date:'short' }}</span>
                    <p>{{ e.note }}</p>
                  </li>
                }
              </ul>
            </div>

            <div class="panel">
              <h2>Firmas</h2>
              @if (!signatures.length) { <p class="muted">Sin firmas aún.</p> }
              @for (s of signatures; track s.id) {
                <div class="sig">
                  <img [src]="s.image_url" alt="firma" />
                  <p>IP {{ s.ip }} · {{ s.signed_at | date:'medium' }}</p>
                </div>
              }
            </div>

            @if (clientMessages.length) {
              <div class="panel">
                <h2>Mensajes de LegalStation</h2>
                @for (n of clientMessages; track n.id) {
                  <div class="note">
                    <strong>{{ n.author_name }}</strong>
                    <span class="muted">{{ n.created_at | date:'short' }}</span>
                    <p>{{ n.body }}</p>
                  </div>
                }
              </div>
            }

            @if (data.notes.length && auth.user()?.role === 'abogado') {
              <div class="panel">
                <h2>Notas internas</h2>
                @for (n of data.notes; track n.id) {
                  <div class="note">
                    <strong>{{ n.author_name }}</strong>
                    <span class="muted">{{ n.created_at | date:'short' }}</span>
                    <p>{{ n.body }}</p>
                  </div>
                }
              </div>
            }
          </section>
        </div>
      </div>
    }
  `,
  styles: [`
    .wrap { padding-block: 2rem 3rem; }
    .lede { margin-bottom: 1rem; color: var(--ink-soft); }
    .banner { padding: 0.85rem 1rem; border-radius: 10px; background: oklch(0.94 0.03 210); margin-bottom: 1rem; }
    .banner.warn { background: oklch(0.95 0.04 85); }
    .layout { display: grid; grid-template-columns: 0.9fr 1.1fr; gap: 1.25rem; }
    .timeline { list-style: none; padding: 0; margin: 0; display: grid; gap: 0.45rem; }
    .timeline li {
      display: grid; grid-template-columns: 2.2rem 1fr; gap: 0.5rem; align-items: center;
      color: var(--ink-soft); opacity: 0.55;
    }
    .timeline li.done { opacity: 1; color: var(--ink); }
    .timeline li.current .num { background: var(--brand); color: white; }
    .num {
      width: 2rem; height: 2rem; border-radius: 999px; display: grid; place-items: center;
      font-size: 0.75rem; font-weight: 700; background: var(--line);
    }
    .actions { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.75rem; }
    .events, .note { list-style: none; padding: 0; }
    .events li, .note, .doc-row { border-top: 1px solid var(--line); padding: 0.75rem 0; }
    .sig img { max-width: 200px; border: 1px solid var(--line); border-radius: 8px; background: white; }
    .pill { font-size: 0.72rem; font-weight: 600; padding: 0.15rem 0.45rem; border-radius: 999px; margin-left: 0.5rem; }
    .pill.pending { background: oklch(0.93 0.03 85); }
    .pill.approved { background: oklch(0.93 0.04 150); color: var(--ok); }
    .pill.rejected { background: oklch(0.93 0.04 25); color: var(--bad); }
    @media (max-width: 860px) { .layout { grid-template-columns: 1fr; } }
  `]
})
export class CaseDetailComponent implements OnInit {
  data: any = null;
  docs: any[] = [];
  outputs: any[] = [];
  signatures: any[] = [];
  clientMessages: any[] = [];
  stateKeys = ['01','02','03','04','05','06','07','08','09','10'];

  constructor(private route: ActivatedRoute, private api: ApiService, public auth: AuthService) {}

  ngOnInit(): void { this.reload(); }

  reload(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.api.getCase(id).subscribe((d) => {
      this.data = d;
      this.clientMessages = d.client_messages || [];
    });
    this.api.listDocs(id).subscribe((d) => this.docs = d);
    this.api.listOutputs(id).subscribe((o) => this.outputs = o);
    this.api.listSignatures(id).subscribe((s) => this.signatures = s);
  }

  get hasRejectedDoc(): boolean {
    return this.docs.some((d) => d.review_status === 'rejected');
  }

  reviewLabel(s: string): string {
    return { pending: 'En revisión', approved: 'Aprobado', rejected: 'Rechazado' }[s] || s;
  }
}
