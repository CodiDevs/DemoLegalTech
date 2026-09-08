import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../core/api.service';
import { IconComponent } from '../../../shared/icon.component';
import { StatusBadgeComponent } from '../../../shared/status-badge.component';

interface AdminMetrics {
  casos_activos?: number;
  casos_finalizados?: number;
  ingreso_mes_usd?: number;
  tiempo_promedio_dias?: number;
}

interface RecentCase {
  id: number;
  client: string;
  status: string;
  status_label: string;
  days: number;
}

interface RevenueRow {
  product: string;
  amount_usd: number;
  cases: number;
}

interface FunnelStep {
  step: string;
  count: number;
}

interface ActivityItem {
  at: string;
  text: string;
}

@Component({
  selector: 'app-advanced-stats',
  standalone: true,
  imports: [RouterLink, IconComponent, StatusBadgeComponent],
  styleUrls: ['../fase2-shared.scss'],
  template: `
    <section class="adv-root" [attr.aria-busy]="loading">
      <header class="adv-head">
        <div>
          <h1>Resumen del bufete</h1>
          <p class="muted">
            Demo de Fase 2 con las cifras del bufete. Los conteos de casos salen de este entorno.
            Ingresos y tiempos son datos de demostración.
          </p>
        </div>
        <a routerLink="/abogado" class="btn btn-primary">
          <app-icon name="folder" [size]="16" />
          Ir a mis casos
        </a>
      </header>

      @if (loading) {
        <div class="panel fase2-state-loading" role="status">
          <span class="spinner" aria-hidden="true"></span>
          <span>Cargando el resumen del bufete…</span>
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
      } @else if (!metrics) {
        <div class="panel fase2-empty">
          <span class="empty-icon">
            <app-icon name="chart" [size]="22" />
          </span>
          <h2>Sin cifras para mostrar</h2>
          <p>La petición respondió pero no trajo métricas del bufete.</p>
        </div>
      } @else {
        <dl class="adv-metrics">
          <div>
            <dt>Casos activos</dt>
            <dd class="tabular">{{ formatCount(metrics.casos_activos) }}</dd>
          </div>
          <div>
            <dt>Casos cerrados</dt>
            <dd class="tabular">{{ formatCount(metrics.casos_finalizados) }}</dd>
          </div>
          <div>
            <dt>Ingreso del mes <span class="adv-demo">(demo)</span></dt>
            <dd class="tabular">{{ formatUsd(metrics.ingreso_mes_usd) }}</dd>
          </div>
          <div>
            <dt>Tiempo medio <span class="adv-demo">(demo)</span></dt>
            <dd class="tabular">{{ formatDays(metrics.tiempo_promedio_dias) }}</dd>
          </div>
        </dl>

        <section class="fase2-section" aria-labelledby="adv-casos-h">
          <h2 id="adv-casos-h">Casos recientes</h2>
          @if (!cases.length) {
            <div class="panel fase2-empty">
              <span class="empty-icon">
                <app-icon name="inbox" [size]="22" />
              </span>
              <p>No hay casos recientes en este entorno.</p>
            </div>
          } @else {
            <div class="panel adv-table-wrap">
              <table>
                <caption class="sr-only">Casos recientes: cliente, estado, días y enlace al expediente</caption>
                <thead>
                  <tr>
                    <th scope="col">Cliente</th>
                    <th scope="col">Estado</th>
                    <th scope="col">Días</th>
                    <th scope="col">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  @for (c of cases; track c.id) {
                    <tr>
                      <td>
                        <span class="adv-client">{{ c.client }}</span>
                        <a class="adv-id" [routerLink]="['/abogado/caso', c.id]">#{{ c.id }}</a>
                      </td>
                      <td>
                        <app-status-badge [label]="c.status_label || c.status" [variant]="statusVariant(c.status)" />
                      </td>
                      <td class="tabular">{{ formatCount(c.days) }}</td>
                      <td>
                        <a class="adv-open" [routerLink]="['/abogado/caso', c.id]">
                          Abrir
                          <app-icon name="arrow-right" [size]="16" />
                        </a>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </section>

        @if (revenue.length) {
          <section class="fase2-section" aria-labelledby="adv-rev-h">
            <h2 id="adv-rev-h">Ingresos por producto</h2>
            <p class="muted">Cifras de demostración.</p>
            <div class="panel adv-table-wrap">
              <table>
                <caption class="sr-only">Ingresos de demostración por producto, importe y número de casos</caption>
                <thead>
                  <tr>
                    <th scope="col">Producto</th>
                    <th scope="col" class="adv-num">Importe</th>
                    <th scope="col" class="adv-num">Casos</th>
                  </tr>
                </thead>
                <tbody>
                  @for (row of revenue; track row.product) {
                    <tr>
                      <td>{{ row.product }}</td>
                      <td class="tabular adv-num">{{ formatUsd(row.amount_usd) }}</td>
                      <td class="tabular adv-num">{{ formatCount(row.cases) }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </section>
        }

        @if (funnel.length) {
          <section class="fase2-section" aria-labelledby="adv-funnel-h">
            <h2 id="adv-funnel-h">Embudo</h2>
            <p class="muted">Cifras de demostración.</p>
            <ol class="panel adv-list">
              @for (step of funnel; track step.step) {
                <li>
                  <span>{{ step.step }}</span>
                  <span class="tabular">{{ formatCount(step.count) }}</span>
                </li>
              }
            </ol>
          </section>
        }

        @if (activity.length) {
          <section class="fase2-section" aria-labelledby="adv-act-h">
            <h2 id="adv-act-h">Actividad reciente</h2>
            <p class="muted">Eventos de demostración.</p>
            <ul class="panel adv-list">
              @for (item of activity; track $index) {
                <li>
                  <time [attr.datetime]="item.at">{{ formatWhen(item.at) }}</time>
                  <span>{{ item.text }}</span>
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

    .adv-root {
      display: flex;
      flex-direction: column;
      gap: var(--space-5);
      padding-block: var(--space-2) var(--space-6);
    }

    .adv-head {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: var(--space-4);
      flex-wrap: wrap;
    }

    .adv-head h1 {
      margin: 0 0 var(--space-2);
      font-size: var(--text-2xl);
      font-weight: 700;
    }

    .adv-head .muted {
      margin: 0;
      max-width: 52ch;
      font-size: var(--text-sm);
    }

    .adv-metrics {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-5) var(--space-8);
      margin: 0;
      padding: var(--space-4) 0;
      border-top: 1px solid var(--border);
      border-bottom: 1px solid var(--border);
    }

    .adv-metrics div { min-width: 7.5rem; }

    .adv-metrics dt {
      margin: 0 0 var(--space-1);
      font-size: var(--text-sm);
      font-weight: 500;
      color: var(--text-secondary);
    }

    .adv-metrics dd {
      margin: 0;
      font-size: var(--text-xl);
      font-weight: 650;
      color: var(--text);
    }

    .adv-demo {
      font-weight: 400;
      color: var(--text-muted);
    }

    .tabular { font-variant-numeric: tabular-nums; }

    .adv-table-wrap {
      padding: 0;
      overflow-x: auto;
      border-radius: var(--radius-lg);
    }

    table {
      width: 100%;
      min-width: 32rem;
      border-collapse: collapse;
      font-size: var(--text-sm);
    }

    th, td {
      padding: var(--space-3) var(--space-4);
      text-align: left;
      border-bottom: 1px solid var(--border);
      vertical-align: middle;
    }

    th {
      font-size: var(--text-sm);
      font-weight: 600;
      color: var(--text-muted);
      background: var(--bg-subtle);
      white-space: nowrap;
    }

    tbody tr:hover { background: var(--bg-subtle); }
    tbody tr:last-child td { border-bottom: 0; }

    .adv-num { text-align: right; }

    .adv-client {
      display: block;
      font-weight: 600;
    }

    .adv-id {
      font-variant-numeric: tabular-nums;
      font-size: var(--text-xs);
      color: var(--text-muted);
      text-decoration: none;
    }

    .adv-id:hover { color: var(--primary); }

    .adv-id:focus-visible,
    .adv-open:focus-visible {
      outline: 2px solid var(--focus-ring);
      outline-offset: 2px;
    }

    .adv-open {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      min-height: 2.75rem;
      font-weight: 600;
      color: var(--primary);
      text-decoration: none;
    }

    .adv-open:hover { color: var(--primary-hover); }

    .adv-list {
      list-style: none;
      margin: 0;
      padding: 0;
      border-radius: var(--radius-lg);
      overflow: hidden;
    }

    .adv-list li {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: var(--space-4);
      padding: var(--space-3) var(--space-4);
      border-bottom: 1px solid var(--border);
      font-size: var(--text-sm);
    }

    .adv-list li:last-child { border-bottom: 0; }

    .adv-list time {
      flex: 0 0 7.5rem;
      color: var(--text-muted);
      font-variant-numeric: tabular-nums;
    }

    .fase2-section .muted {
      margin: 0 0 var(--space-3);
      font-size: var(--text-sm);
    }

    .fase2-empty p { margin: 0; }

    @media (max-width: 640px) {
      table { min-width: 28rem; }
      .adv-list time { flex-basis: 100%; }
      .adv-list li { flex-wrap: wrap; }
    }
  `],
})
export class AdvancedStatsComponent implements OnInit {
  // ponytail: API has no monthly series. Chart dropped; revenue table is the figure.
  loading = true;
  error = false;
  metrics: AdminMetrics | null = null;
  cases: RecentCase[] = [];
  revenue: RevenueRow[] = [];
  funnel: FunnelStep[] = [];
  activity: ActivityItem[] = [];

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
        this.cases = Array.isArray(data?.recent_cases) ? data.recent_cases : [];
        this.revenue = Array.isArray(data?.revenue_breakdown) ? data.revenue_breakdown : [];
        this.funnel = Array.isArray(data?.funnel) ? data.funnel : [];
        this.activity = Array.isArray(data?.activity)
          ? data.activity.map((item: ActivityItem) => ({
              ...item,
              text: String(item?.text ?? '').replace(/\s*\u2014\s*/g, ': '),
            }))
          : [];
        this.loading = false;
      },
      error: () => {
        this.metrics = null;
        this.cases = [];
        this.revenue = [];
        this.funnel = [];
        this.activity = [];
        this.loading = false;
        this.error = true;
      },
    });
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

  formatDays(n: unknown): string {
    if (n == null || n === '') return '-';
    const v = Number(n);
    if (Number.isNaN(v)) return '-';
    const label = new Intl.NumberFormat('es-EC', { maximumFractionDigits: 1 }).format(v);
    return `${label} días`;
  }

  formatWhen(iso: string): string {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '-';
    return new Intl.DateTimeFormat('es-EC', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  }

  statusVariant(status: string): 'warn' | 'ok' | 'info' | 'default' {
    if (status === '03') return 'warn';
    if (status === '10') return 'ok';
    if (status === '04' || status === '05') return 'info';
    return 'default';
  }
}
