import { Component, OnInit, ViewChild } from '@angular/core';
import { Observable, of } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { ProductFlowShellComponent } from '../../shared/product-flow-shell.component';
import { MeetingSchedulerComponent } from '../../shared/meeting-scheduler.component';
import { ScheduledMeetingCardComponent } from '../../shared/scheduled-meeting-card.component';
import { CaseProgressComponent } from '../../shared/case-progress.component';
import { buildCaseProgressStages, CaseProgressStage } from '../../shared/case-progress.model';
import { getProductSite, productThemeFromCase } from '../../shared/product-sites.data';

interface CaseAction {
  label: string;
  link: (string | number)[];
  primary: boolean;
}

@Component({
  selector: 'app-case-detail',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    DecimalPipe,
    DatePipe,
    ProductFlowShellComponent,
    MeetingSchedulerComponent,
    ScheduledMeetingCardComponent,
    CaseProgressComponent,
  ],
  template: `
    @if (data) {
      <app-product-flow-shell
        [theme]="theme"
        [crumb]="crumb"
        eyebrow="Expediente digital"
        [title]="'Caso #' + data.case.id"
        [subtitle]="data.case.client_name + ' · ' + data.case.status_label"
      >

        @if (data.case.status === '03' && auth.user()?.role === 'cliente') {
          <div class="banner">Tu expediente está en revisión del abogado. Te notificaremos cuando avance.</div>
        }
        @if (data.case.status === '02' && hasRejectedDoc) {
          <div class="banner warn">Un documento fue rechazado. Vuelve a cargarlo desde Documentos.</div>
        }
        @if (data.case.sign_hint && auth.user()?.role === 'cliente') {
          <div class="banner" [class.warn]="!data.case.can_sign">{{ data.case.sign_hint }}</div>
        }

        <div class="layout">
          <section class="panel">
            <h2>Línea de estados</h2>
            <app-case-progress
              variant="case"
              layout="vertical"
              [stages]="progressStages"
              ariaLabel="Línea de estados del expediente"
            />
          </section>

          <section class="stack">
            @if (data.case.status >= '03' && auth.user()?.role === 'cliente') {
              <div class="pf-card lp-lift meet-section">
                <h2>Consulta con abogado</h2>
                @if (data.case.consultation_at) {
                  <app-scheduled-meeting-card
                    [scheduledAt]="data.case.consultation_at"
                    [pendingRequest]="data.case.consultation_at === 'requested'"
                    subtitle="Consulta con abogado"
                  />
                } @else {
                  <p class="pf-muted">Elige fecha y hora. Te enviaremos el enlace de la videollamada por correo.</p>
                  <app-meeting-scheduler
                    #consultScheduler
                    [storageKey]="consultStorageKey"
                    confirmLabel="Confirmar consulta"
                    scheduledSubtitle="Consulta con abogado"
                    [saveFn]="consultSaveFn"
                    (scheduled)="reload()"
                  />
                }
              </div>
            }

            <div class="panel actions-panel">
              <h2>Acciones</h2>
              <div class="actions-grid" [class.is-solo]="availableActions.length === 1">
                @for (action of availableActions; track action.label) {
                  <a
                    [routerLink]="action.link"
                    class="lp-btn action-btn"
                    [class.lp-btn-primary]="action.primary"
                    [class.lp-btn-outline]="!action.primary"
                    [class.action-btn-lg]="availableActions.length === 1"
                  >{{ action.label }}</a>
                }
              </div>
              <p class="actions-meta muted">
                Monto: \${{ data.case.amount_cents / 100 | number:'1.2-2' }} · {{ data.case.paid ? 'Pagado' : 'Sin pago' }}
              </p>
            </div>

            <div class="panel">
              <h2>Mis documentos</h2>
              @if (!docs.length) { <p class="muted">Sin documentos cargados.</p> }
              @for (d of docs; track d.id) {
                <div class="doc-row">
                  <span>{{ docLabel(d.doc_type) }} — {{ d.filename }}</span>
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
      </app-product-flow-shell>
    }
  `,
  styles: [`
    .wrap { padding-block: 2rem 3rem; }
    .lede { margin-bottom: 1rem; color: var(--ink-soft); }
    .banner { padding: 0.85rem 1rem; border-radius: 10px; background: oklch(0.94 0.03 210); margin-bottom: 1rem; }
    .banner.warn { background: oklch(0.95 0.04 85); }
    .layout { display: grid; grid-template-columns: 0.9fr 1.1fr; gap: 1.25rem; }
    .actions-panel { text-align: center; }
    .actions-panel h2 { text-align: left; margin-bottom: var(--space-4); }
    .actions-grid {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      align-items: center;
      gap: var(--space-3);
      margin-bottom: var(--space-4);
    }
    .actions-grid.is-solo {
      flex-direction: column;
    }
    .action-btn {
      text-decoration: none;
      min-width: 9rem;
    }
    .action-btn-lg {
      min-width: min(100%, 18rem);
      padding: 0.9rem 1.75rem;
      font-size: var(--text-base);
      font-weight: 600;
      justify-content: center;
    }
    .actions-meta {
      margin: 0;
      padding-top: var(--space-3);
      border-top: 1px solid var(--border);
      font-size: var(--text-sm);
    }
    .meet-section { margin-top: 1rem; display: grid; gap: var(--space-3); }
    .meet-section h2 { margin: 0; font-size: var(--text-lg); }
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
  @ViewChild('consultScheduler') consultScheduler?: MeetingSchedulerComponent;

  data: any = null;
  docs: any[] = [];
  outputs: any[] = [];
  signatures: any[] = [];
  clientMessages: any[] = [];
  progressStages: CaseProgressStage[] = [];
  consultStorageKey = '';
  theme = productThemeFromCase();

  consultSaveFn = (at: string): Observable<unknown> => {
    if (!this.data?.case?.id) return of(null);
    return this.api.scheduleConsultation(this.data.case.id, at);
  };

  constructor(private route: ActivatedRoute, private api: ApiService, public auth: AuthService) {}

  get crumb(): { label: string; link?: string }[] {
    const site = getProductSite(this.data?.case?.product || '');
    const base = [{ label: 'LegalStation', link: '/' }];
    if (site) {
      return [...base, { label: site.name, link: '/productos/' + site.slug }, { label: 'Expediente #' + this.data.case.id }];
    }
    return [...base, { label: 'Expediente #' + (this.data?.case?.id || '') }];
  }

  ngOnInit(): void { this.reload(); }

  reload(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.consultStorageKey = `ls_meeting_case_${id}`;
    this.api.getCase(id).subscribe((d) => {
      this.data = d;
      this.theme = productThemeFromCase(d.case?.product);
      this.clientMessages = d.client_messages || [];
      this.progressStages = buildCaseProgressStages(
        d.case?.status || '01',
        d.states || {},
        d.events || [],
      );
    });
    this.api.listDocs(id).subscribe((d) => this.docs = d);
    this.api.listOutputs(id).subscribe((o) => this.outputs = o);
    this.api.listSignatures(id).subscribe((s) => this.signatures = s);
  }

  get availableActions(): CaseAction[] {
    if (!this.data?.case) return [];
    const c = this.data.case;
    const isClient = this.auth.user()?.role === 'cliente';
    const actions: CaseAction[] = [];

    if (!c.paid) {
      actions.push({ label: 'Pagar trámite', link: ['/checkout', c.id], primary: true });
    }
    actions.push({ label: 'Subir documentos', link: ['/upload', c.id], primary: false });
    if (c.can_sign && isClient) {
      actions.push({
        label: c.has_signature ? 'Volver a firmar' : 'Firmar minuta',
        link: ['/firma', c.id],
        primary: true,
      });
    }
    if (c.status >= '03' && isClient && c.consultation_at && c.consultation_at !== 'requested') {
      actions.push({ label: 'Entrar a la consulta', link: ['/consulta', c.id], primary: false });
    }

    if (actions.length === 1) {
      actions[0].primary = true;
    } else {
      const primaryCount = actions.filter((a) => a.primary).length;
      if (primaryCount === 0 && actions.length) {
        actions[0].primary = true;
      }
    }

    return actions;
  }

  get hasRejectedDoc(): boolean {
    return this.docs.some((d) => d.review_status === 'rejected');
  }

  get hasSignature(): boolean {
    return this.data?.case?.has_signature || this.signatures.length > 0;
  }

  reviewLabel(s: string): string {
    return { pending: 'En revisión', approved: 'Aprobado', rejected: 'Rechazado' }[s] || s;
  }

  docLabel(type: string): string {
    const labels: Record<string, string> = {
      cedula: 'Cédula', partida: 'Partida', matricula: 'Matrícula', titulo: 'Título', acuerdo: 'Acuerdo mutuo',
    };
    return labels[type] || type;
  }
}

