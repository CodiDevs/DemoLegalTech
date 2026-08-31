import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { ProductFlowShellComponent } from '../../shared/product-flow-shell.component';
import { StatusBadgeComponent } from '../../shared/status-badge.component';

@Component({
  selector: 'app-notary-panel',
  standalone: true,
  imports: [RouterLink, ProductFlowShellComponent, StatusBadgeComponent],
  template: `
    <app-product-flow-shell
      theme="legalstation"
      [crumb]="[{ label: 'LegalStation', link: '/' }, { label: 'Panel notario' }]"
      eyebrow="Notaría demo"
      title="Bandeja notarial"
      subtitle="Aprueba documentos, comparecencia y acta — rol notario."
    >
      @if (!cases.length) {
        <div class="pf-card"><p class="pf-muted">Sin expedientes pendientes — envía un caso a notaría desde el panel abogado.</p></div>
      }
      @for (c of cases; track c.id) {
        <article class="pf-card lp-lift">
          <div style="display:flex;justify-content:space-between;gap:1rem;flex-wrap:wrap;align-items:start">
            <div>
              <span class="pf-badge">{{ c.product }}</span>
              <h2 style="margin:0.5rem 0">Expediente #{{ c.id }} · {{ c.client_name }}</h2>
              <p class="pf-muted">{{ c.status_label }} · {{ c.city }}</p>
              @if (c.appointment_at) {
                <p class="pf-muted">Cita: {{ c.appointment_at }}</p>
              }
            </div>
            <app-status-badge [label]="c.status_label" variant="info" />
          </div>
          <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-top:1rem">
            @if (c.status === '06' || c.status === '05') {
              <button type="button" class="lp-btn lp-btn-primary" (click)="act(c.id, 'approve_documents')">Aprobar documentos</button>
            }
            @if (c.status === '07') {
              <button type="button" class="lp-btn lp-btn-primary" (click)="act(c.id, 'complete_meeting')">Comparecencia completada</button>
            }
            @if (c.status === '08') {
              <button type="button" class="lp-btn lp-btn-primary" (click)="act(c.id, 'emit_acta')">Emitir acta</button>
            }
            <a [routerLink]="['/caso', c.id]" class="lp-btn lp-btn-outline">Ver expediente</a>
          </div>
        </article>
      }
    </app-product-flow-shell>
  `,
})
export class NotaryPanelComponent implements OnInit {
  cases: any[] = [];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.api.listCases().subscribe((c) => this.cases = c);
  }

  act(id: number, action: string): void {
    this.api.notaryAction(id, action).subscribe(() => this.load());
  }
}
