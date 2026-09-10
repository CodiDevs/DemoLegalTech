import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { ProductFlowShellComponent } from '../../shared/product-flow-shell.component';
import { StatusBadgeComponent } from '../../shared/status-badge.component';
import { IconComponent } from '../../shared/icon.component';

@Component({
  selector: 'app-notary-panel',
  standalone: true,
  imports: [RouterLink, ProductFlowShellComponent, StatusBadgeComponent, IconComponent],
  template: `
    <app-product-flow-shell
      theme="legalstation"
      [crumb]="[{ label: 'LegalStation', link: '/' }, { label: 'Panel notario' }]"
      eyebrow="Notaría"
      title="Bandeja notarial"
      subtitle="Aprueba documentos, comparecencia y acta — rol notario."
    >
      @if (loading) {
        <div class="panel state-loading" role="status">
          <span class="spinner" aria-hidden="true"></span>
          <span>Cargando la bandeja de firmas…</span>
        </div>
      } @else if (error) {
        <div class="panel state-error" role="alert">
          <span class="state-error-icon"><app-icon name="alert-triangle" [size]="20" /></span>
          <div class="state-error-body">
            <strong>No pudimos cargar los expedientes</strong>
            <p>La bandeja no respondió. Vuelve a intentarlo en unos segundos.</p>
          </div>
          <button type="button" class="btn btn-secondary" (click)="load()">Volver a intentar</button>
        </div>
      } @else if (!cases.length) {
        <div class="panel empty-state">
          <span class="empty-icon"><app-icon name="signature" [size]="22" /></span>
          <h2>No hay firmas pendientes</h2>
          <p>Te avisaremos cuando un expediente esté listo para firmar.</p>
        </div>
      } @else {
        <div class="queue">
          @for (c of cases; track c.id) {
            <article class="panel case">
              <div class="case-head">
                <div class="case-info">
                  <span class="product">{{ c.product }}</span>
                  <h2>Expediente #{{ c.id }} · {{ c.client_name }}</h2>
                  <p class="meta">
                    {{ c.city || 'Ciudad sin definir' }}
                    @if (c.appointment_at) { · Cita: {{ c.appointment_at }} }
                  </p>
                </div>
                <app-status-badge [label]="c.status_label" variant="info" />
              </div>

              <div class="case-actions">
                @if (c.status === '06' || c.status === '05') {
                  <button
                    type="button"
                    class="btn btn-primary"
                    [disabled]="acting === c.id"
                    (click)="act(c.id, 'approve_documents')"
                  >
                    @if (acting === c.id) { <span class="spinner" aria-hidden="true"></span> }
                    Aprobar documentos
                  </button>
                }
                @if (c.status === '07') {
                  <button
                    type="button"
                    class="btn btn-primary"
                    [disabled]="acting === c.id"
                    (click)="act(c.id, 'complete_meeting')"
                  >
                    @if (acting === c.id) { <span class="spinner" aria-hidden="true"></span> }
                    Comparecencia completada
                  </button>
                }
                @if (c.status === '08') {
                  <button
                    type="button"
                    class="btn btn-primary"
                    [disabled]="acting === c.id"
                    (click)="act(c.id, 'emit_acta')"
                  >
                    @if (acting === c.id) { <span class="spinner" aria-hidden="true"></span> }
                    Emitir acta
                  </button>
                }
                <a [routerLink]="['/caso', c.id]" class="btn btn-secondary">Ver expediente</a>
              </div>
            </article>
          }
        </div>
      }
    </app-product-flow-shell>
  `,
  styles: [`
    .queue { display: grid; gap: var(--space-3); }
    .case { display: grid; gap: var(--space-4); }
    .case-head {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: var(--space-4);
      flex-wrap: wrap;
    }
    .case-info { display: grid; gap: var(--space-1); }
    .case-info h2 { font-size: var(--text-lg); margin: 0; }
    .product {
      font-size: var(--text-xs);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: var(--tracking-wide);
      color: var(--primary);
    }
    .meta {
      margin: 0;
      font-size: var(--text-sm);
      color: var(--text-secondary);
    }
    .case-actions {
      display: flex;
      gap: var(--space-2);
      flex-wrap: wrap;
    }

    .state-loading {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      color: var(--text-secondary);
      font-size: var(--text-sm);
    }
    .state-error {
      display: flex;
      align-items: flex-start;
      gap: var(--space-3);
      flex-wrap: wrap;
      border-color: var(--danger-border);
      background: var(--danger-subtle);
    }
    .state-error-icon { color: var(--danger); display: grid; place-items: center; }
    .state-error-body { flex: 1; min-width: 14rem; }
    .state-error-body strong { display: block; font-weight: 650; }
    .state-error-body p {
      margin: var(--space-1) 0 0;
      font-size: var(--text-sm);
      color: var(--text-secondary);
    }

    .empty-state {
      display: grid;
      justify-items: center;
      gap: var(--space-3);
      text-align: center;
      padding: var(--space-7) var(--space-5);
    }
    .empty-icon {
      display: grid;
      place-items: center;
      width: 48px;
      height: 48px;
      border-radius: var(--radius-md);
      background: var(--bg-subtle);
      border: 1px solid var(--border);
      color: var(--text-muted);
    }
    .empty-state h2 { font-size: var(--text-lg); margin: 0; }
    .empty-state p {
      margin: 0;
      max-width: 46ch;
      color: var(--text-secondary);
      font-size: var(--text-sm);
    }
  `],
})
export class NotaryPanelComponent implements OnInit {
  cases: any[] = [];
  loading = false;
  error = false;
  acting: number | null = null;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = false;
    this.api.listCases().subscribe({
      next: (c) => {
        this.cases = c;
        this.loading = false;
      },
      error: () => {
        this.error = true;
        this.loading = false;
      },
    });
  }

  act(id: number, action: string): void {
    this.acting = id;
    this.api.notaryAction(id, action).subscribe({
      next: () => {
        this.acting = null;
        this.load();
      },
      error: () => {
        this.acting = null;
      },
    });
  }
}
