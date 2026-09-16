import { Component, Input, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService, CaseItem } from '../core/api.service';
import { IconComponent } from './icon.component';
import { ProductFlowShellComponent } from './product-flow-shell.component';
import { ProgressStep } from './progress-steps.component';
import { buildClientFlowCrumb, getProductFlowMeta, productThemeFromCase, clientFlowStepIndex, setActiveProduct } from './product-sites.data';
import { ScheduledMeetingCardComponent } from './scheduled-meeting-card.component';

@Component({
  selector: 'app-virtual-meeting',
  standalone: true,
  imports: [RouterLink, ProductFlowShellComponent, IconComponent, ScheduledMeetingCardComponent],
  template: `
    @if (caseItem) {
      <app-product-flow-shell
        [theme]="theme"
        [crumb]="crumb"
        title="Consulta con abogado"
        [steps]="flowSteps"
        [activeStep]="consultStepIndex"
      >
        <div class="up-layout">
          <aside class="up-side lp-lift">
            <h3>Tu progreso</h3>
            <ul class="up-checklist">
              <li [class.done]="docsComplete">
                <span class="up-check-icon">
                  @if (docsComplete) { <app-icon name="check" [size]="16" /> }
                </span>
                <span>Documentos cargados</span>
              </li>
              <li [class.done]="consultationRequested">
                <span class="up-check-icon">
                  @if (consultationRequested) { <app-icon name="check" [size]="16" /> }
                </span>
                <span>Consulta solicitada</span>
              </li>
              <li [class.done]="consultationScheduled">
                <span class="up-check-icon">
                  @if (consultationScheduled) { <app-icon name="check" [size]="16" /> }
                </span>
                <span>Videollamada coordinada</span>
              </li>
            </ul>
            <p class="pf-muted" style="margin-top:1rem;font-size:0.82rem">
              Duración a coordinar con tu abogado
            </p>
          </aside>

          <div class="up-slots">
            <div class="pf-card lp-lift up-slot">
              <div class="up-slot-head">
                <h2>Consulta virtual</h2>
                <span class="up-slot-badge" [class]="statusBadgeClass">{{ statusBadgeLabel }}</span>
              </div>

              @if (consultationRequested) {
                <div class="consult-body">
                  <app-scheduled-meeting-card
                    [scheduledAt]="caseItem.consultation_at!"
                    [pendingRequest]="!consultationScheduled"
                  />
                </div>
              } @else {
                <div class="consult-request-zone">
                  <div class="up-drop-icon"><app-icon name="video" [size]="24" /></div>
                  <p class="consult-request-title">Habla con tu abogado por videollamada</p>
                  <p class="pf-muted consult-request-hint">
                    Envía la solicitud y te contactaremos por correo para confirmar la videollamada.
                  </p>
                  @if (error) { <p class="pf-err">{{ error }}</p> }
                  <button
                    type="button"
                    class="btn btn-primary"
                    [disabled]="busy"
                    (click)="requestConsult()"
                  >
                    @if (busy) { Enviando solicitud… }
                    @else { Solicitar consulta }
                  </button>
                </div>
              }
            </div>
          </div>
        </div>

        <div class="up-footer">
          <a class="btn btn-secondary" [routerLink]="['/caso', caseItem.id]">Ver expediente</a>
          <a class="btn btn-secondary" [routerLink]="['/upload', caseItem.id]">Volver a documentos</a>
        </div>
      </app-product-flow-shell>
    }
  `,
})
export class VirtualMeetingComponent implements OnInit {
  @Input() caseId = 0;

  caseItem: CaseItem | null = null;
  theme = productThemeFromCase();
  flowSteps: ProgressStep[] = [];
  consultStepIndex = 3;
  crumb: { label: string; link?: string }[] = [{ label: 'LegalStation', link: '/' }, { label: 'Consulta' }];
  docsComplete = false;
  busy = false;
  error = '';

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    if (!this.caseId) return;
    this.reload();
  }

  get consultationRequested(): boolean {
    return Boolean(this.caseItem?.consultation_at);
  }

  get consultationScheduled(): boolean {
    const at = this.caseItem?.consultation_at;
    return Boolean(at && at !== 'requested');
  }

  get statusBadgeLabel(): string {
    if (this.consultationScheduled) return 'Coordinada';
    if (this.consultationRequested) return 'Solicitada';
    return 'Pendiente';
  }

  get statusBadgeClass(): string {
    if (this.consultationScheduled) return 'ok';
    if (this.consultationRequested) return 'warn';
    return '';
  }

  requestConsult(): void {
    if (!this.caseItem || this.busy || this.consultationRequested) return;
    this.busy = true;
    this.error = '';
    this.api.requestConsultation(this.caseItem.id).subscribe({
      next: (c) => {
        this.busy = false;
        this.caseItem = c;
      },
      error: (e) => {
        this.busy = false;
        this.error = e?.error?.error || 'No pudimos enviar la solicitud. Inténtalo de nuevo.';
      },
    });
  }

  private reload(): void {
    this.api.getCase(this.caseId).subscribe((d) => {
      this.caseItem = d.case;
      setActiveProduct(this.caseItem?.product || 'divorcio360');
      this.theme = productThemeFromCase(this.caseItem?.product);
      const meta = getProductFlowMeta(this.caseItem?.product);
      this.flowSteps = meta.clientFlowSteps;
      this.consultStepIndex = clientFlowStepIndex(meta.flowSteps, 'call');
      this.crumb = buildClientFlowCrumb(this.caseItem?.product, 'Consulta', {
        caseId: this.caseItem!.id,
        includeExpediente: true,
      });
      const required = meta.docTypes.length;
      this.api.listDocs(this.caseId).subscribe((docs) => {
        this.docsComplete = required > 0 && docs.length >= required;
      });
    });
  }
}
