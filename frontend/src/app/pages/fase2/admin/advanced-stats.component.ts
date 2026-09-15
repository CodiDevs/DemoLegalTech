import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../core/api.service';
import { IconComponent } from '../../../shared/icon.component';
import { WorkspaceHeadComponent } from '../../lawyer-panel/workspace-head.component';

interface AdminMetrics {
  casos_activos?: number;
  casos_finalizados?: number;
  ingreso_mes_usd?: number;
  tiempo_promedio_dias?: number;
  ticket_promedio_usd?: number;
  cobrado_usd?: number;
  pendiente_cobro_usd?: number;
  tasa_cobranza_pct?: number;
}

interface Bottleneck {
  stage: string;
  stage_code: string;
  count: number;
  avg_days: number;
  impact: 'high' | 'medium' | 'low';
  detail: string;
  action: string;
  action_url: string;
}

interface PriorityCase {
  id: number;
  client: string;
  service?: string;
  status: string;
  status_label: string;
  days: number;
  action_required?: boolean;
}

@Component({
  selector: 'app-advanced-stats',
  standalone: true,
  imports: [RouterLink, IconComponent, WorkspaceHeadComponent],
  styleUrls: ['../fase2-shared.scss'],
  template: `
    <section class="resumen" [attr.aria-busy]="loading">
      <app-workspace-head title="Resumen" [aside]="headAside" />

      @if (loading) {
        <div class="panel fase2-state-loading" role="status">
          <span class="spinner" aria-hidden="true"></span>
          <span>Cargando el mes…</span>
        </div>
      } @else if (error) {
        <div class="panel fase2-state-error" role="alert">
          <span class="state-icon">
            <app-icon name="alert-triangle" [size]="20" />
          </span>
          <div class="state-body">
            <strong>No se pudo cargar el resumen</strong>
            <p>El servidor no respondió. Vuelve a intentarlo.</p>
          </div>
          <button type="button" class="btn btn-secondary" (click)="load()">Volver a intentar</button>
        </div>
      } @else {
        <section class="work" aria-labelledby="work-title">
          <header class="block-head">
            <h2 id="work-title">Te toca</h2>
            <a routerLink="/abogado" class="quiet-link">Bandeja</a>
          </header>

          @if (!cases.length) {
            <p class="empty-line">Nada pendiente ahora.</p>
          } @else {
            <ul class="work-list">
              @for (c of cases; track c.id) {
                <li>
                  <a
                    class="work-row"
                    [class.is-late]="c.days >= 5"
                    [routerLink]="['/abogado/caso', c.id]"
                  >
                    <span class="work-id tabular">#{{ c.id }}</span>
                    <span class="work-who">
                      <strong>{{ c.client }}</strong>
                      <span>{{ c.service || defaultServiceFor(c.id) }}</span>
                    </span>
                    <span class="work-stage">{{ c.status_label || c.status }}</span>
                    <span class="work-wait tabular">{{ c.days }} {{ c.days === 1 ? 'día' : 'días' }}</span>
                  </a>
                </li>
              }
            </ul>
          }
        </section>

        @if (bottlenecks.length) {
          <section class="holds" aria-labelledby="holds-title">
            <h2 id="holds-title">Detenidos</h2>
            <ul class="hold-list">
              @for (b of bottlenecks; track b.stage) {
                <li>
                  <a class="hold-row" routerLink="/abogado" [queryParams]="holdQuery(b)">
                    <strong>{{ b.stage }}</strong>
                    <span class="tabular">{{ b.count }} · {{ b.avg_days }} días</span>
                  </a>
                </li>
              }
            </ul>
          </section>
        }
      }
    </section>
  `,
  styles: [`
    :host { display: block; }

    .resumen {
      display: grid;
      gap: var(--space-6);
      padding-block: var(--space-2) var(--space-6);
    }

    .block-head {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: var(--space-3);
      margin-bottom: var(--space-3);
    }

    .work h2,
    .holds h2 {
      margin: 0;
      font-size: var(--text-base);
      font-weight: 650;
    }

    .quiet-link {
      font-size: var(--text-sm);
      font-weight: 600;
      color: var(--primary);
      text-decoration: none;
    }
    .quiet-link:hover { text-decoration: underline; }

    .empty-line {
      margin: 0;
      font-size: var(--text-sm);
      color: var(--text-secondary);
    }

    .work-list,
    .hold-list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: grid;
      gap: var(--space-2);
    }

    .work-row,
    .hold-row {
      display: grid;
      gap: var(--space-4);
      align-items: center;
      padding: var(--space-3) var(--space-4);
      text-decoration: none;
      color: inherit;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-sm);
      animation: row-in 420ms var(--ease-out);
      transition:
        background 220ms var(--ease-out),
        border-color 220ms var(--ease-out);
    }

    .work-row {
      grid-template-columns: 4rem minmax(0, 1.2fr) minmax(0, 1fr) auto;
    }

    .hold-row {
      grid-template-columns: minmax(0, 1fr) auto;
    }

    .work-row:hover,
    .hold-row:hover,
    .work-row:focus-visible,
    .hold-row:focus-visible {
      background: color-mix(in srgb, var(--primary) 7%, var(--surface));
      border-color: color-mix(in srgb, var(--primary) 28%, var(--border));
    }

    .work-row:focus-visible,
    .hold-row:focus-visible {
      outline: 2px solid var(--focus-ring);
      outline-offset: 2px;
    }

    .work-row.is-late {
      background: var(--warning-subtle);
    }

    .work-id {
      font-size: var(--text-sm);
      font-weight: 650;
      color: var(--text-muted);
    }

    .work-who {
      display: grid;
      gap: 0.1rem;
      min-width: 0;
    }
    .work-who strong {
      font-size: var(--text-sm);
      font-weight: 650;
    }
    .work-who span {
      font-size: var(--text-xs);
      color: var(--text-secondary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .work-stage,
    .hold-row span {
      font-size: var(--text-xs);
      font-weight: 550;
      color: var(--text-secondary);
    }

    .work-wait {
      font-size: var(--text-xs);
      font-weight: 600;
      color: var(--text-muted);
      white-space: nowrap;
    }

    .hold-row strong {
      font-size: var(--text-sm);
      font-weight: 650;
    }

    .tabular { font-variant-numeric: tabular-nums; }

    @keyframes row-in {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: none; }
    }

    @media (max-width: 800px) {
      .work-row {
        grid-template-columns: 3.25rem minmax(0, 1fr);
        grid-template-areas:
          "id who"
          "id stage"
          "id wait";
        gap: var(--space-1) var(--space-3);
      }
      .work-id { grid-area: id; align-self: start; }
      .work-who { grid-area: who; }
      .work-stage { grid-area: stage; }
      .work-wait { grid-area: wait; }
    }
  `],
})
export class AdvancedStatsComponent implements OnInit {
  loading = true;
  error = false;
  metrics: AdminMetrics | null = null;
  cases: PriorityCase[] = [];
  bottlenecks: Bottleneck[] = [];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = false;
    this.api.mockMetrics().subscribe({
      next: (data) => {
        const m = data?.metrics;
        this.metrics = m && typeof m === 'object' && Object.keys(m).length ? m : null;

        this.cases = Array.isArray(data?.recent_cases)
          ? data.recent_cases.map((c: any) => ({
              id: c.id,
              client: c.client || 'Sin nombre',
              service: c.service || this.defaultServiceFor(c.id),
              status: c.status || '03',
              status_label: c.status_label || 'Revisión jurídica',
              days: typeof c.days === 'number' ? c.days : 2,
              action_required: c.action_required ?? true,
            }))
          : this.fallbackCases();

        this.bottlenecks = Array.isArray(data?.bottlenecks) && data.bottlenecks.length
          ? data.bottlenecks
          : this.fallbackBottlenecks();

        this.loading = false;
      },
      error: () => {
        this.metrics = null;
        this.cases = [];
        this.bottlenecks = [];
        this.loading = false;
        this.error = true;
      },
    });
  }

  get pendingActionCount(): number {
    return this.cases.filter((c) => c.action_required || c.days >= 4).length;
  }

  get headAside(): string {
    if (this.loading || this.error) return '';
    const parts: string[] = [];
    const money = this.metrics ? this.formatUsd(this.metrics.ingreso_mes_usd) : '';
    if (money && money !== '-') parts.push(money);
    const n = this.metrics?.casos_activos ?? this.cases.length;
    parts.push(n === 1 ? '1 activo' : `${this.formatCount(n)} activos`);
    if (this.pendingActionCount) {
      parts.push(
        this.pendingActionCount === 1
          ? '1 pendiente'
          : `${this.pendingActionCount} pendientes`,
      );
    }
    return parts.join(' · ');
  }

  holdQuery(b: Bottleneck): { estado?: string } {
    const code = (b.stage_code || '').trim();
    return code ? { estado: code } : {};
  }

  defaultServiceFor(id: number): string {
    const list = [
      'Divorcio mutuo acuerdo',
      'Traslado de dominio',
      'Poder notarial',
      'Disolución sociedad conyugal',
    ];
    return list[(id - 1) % list.length] || 'Trámite civil';
  }

  formatCount(n: unknown): string {
    if (n == null || n === '') return '-';
    const v = Number(n);
    if (Number.isNaN(v)) return '-';
    return new Intl.NumberFormat('es-EC').format(v);
  }

  formatUsd(n: unknown): string {
    if (n == null || n === '') return '-';
    const v = Number(n);
    if (Number.isNaN(v)) return '-';
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(v);
  }

  private fallbackBottlenecks(): Bottleneck[] {
    return [
      {
        stage: 'Firma de las partes',
        stage_code: '05',
        count: 8,
        avg_days: 6.4,
        impact: 'high',
        detail: 'Cónyuges con aviso de firma pendiente',
        action: 'Notificar partes',
        action_url: '/abogado',
      },
      {
        stage: 'Revisión jurídica',
        stage_code: '03',
        count: 5,
        avg_days: 3.8,
        impact: 'medium',
        detail: 'Documentos esperando aprobación',
        action: 'Revisar documentos',
        action_url: '/abogado',
      },
      {
        stage: 'Despacho notarial',
        stage_code: '06',
        count: 3,
        avg_days: 4.1,
        impact: 'medium',
        detail: 'Minutas en espera de turno',
        action: 'Verificar notaría',
        action_url: '/abogado',
      },
    ];
  }

  private fallbackCases(): PriorityCase[] {
    return [
      { id: 1, client: 'María Salazar', service: 'Divorcio mutuo acuerdo', status: '03', status_label: 'Revisión jurídica', days: 2, action_required: true },
      { id: 2, client: 'Carlos Mendoza', service: 'Traslado de dominio', status: '05', status_label: 'Firma de partes', days: 6, action_required: true },
      { id: 3, client: 'Elena Zambrano', service: 'Poder notarial', status: '06', status_label: 'En notaría', days: 3, action_required: false },
    ];
  }
}
