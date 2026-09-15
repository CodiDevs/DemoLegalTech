import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../core/api.service';
import { IconComponent } from '../../../shared/icon.component';
import { StatusBadgeComponent } from '../../../shared/status-badge.component';
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

interface ServiceDemand {
  title: string;
  slug: string;
  cases: number;
  amount_usd: number;
  pct_share: number;
  avg_days: number;
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
  imports: [RouterLink, IconComponent, StatusBadgeComponent, WorkspaceHeadComponent],
  styleUrls: ['../fase2-shared.scss'],
  template: `
    <section class="resumen-container" [attr.aria-busy]="loading">
      <app-workspace-head title="Resumen" [aside]="headAside">
        <a routerLink="/abogado" class="btn btn-secondary btn-sm">
          <app-icon name="inbox" [size]="15" />
          Bandeja de casos
        </a>
        <a routerLink="/abogado/servicios" class="btn btn-secondary btn-sm">
          <app-icon name="briefcase" [size]="15" />
          Servicios
        </a>
      </app-workspace-head>

      @if (loading) {
        <div class="panel fase2-state-loading" role="status">
          <span class="spinner" aria-hidden="true"></span>
          <span>Cargando métricas operacionales del bufete…</span>
        </div>
      } @else if (error) {
        <div class="panel fase2-state-error" role="alert">
          <span class="state-icon">
            <app-icon name="alert-triangle" [size]="20" />
          </span>
          <div class="state-body">
            <strong>No se pudo cargar el resumen operacional</strong>
            <p>El servidor no respondió. Vuelve a intentarlo.</p>
          </div>
          <button type="button" class="btn btn-secondary" (click)="load()">Volver a intentar</button>
        </div>
      } @else {
        <!-- Fila 1: Métricas de Ventas y Rendimiento Operativo -->
        <section class="kpi-grid" aria-label="Métricas principales">
          <article class="kpi-card">
            <div class="kpi-top">
              <span class="kpi-label">Facturación del mes</span>
              <span class="kpi-icon" aria-hidden="true">
                <app-icon name="credit-card" [size]="16" />
              </span>
            </div>
            <div class="kpi-value tabular">{{ metrics ? formatUsd(metrics.ingreso_mes_usd) : 'Sin datos' }}</div>
            <div class="kpi-meta">
              @if (metrics) {
                <span class="kpi-highlight">{{ metrics.tasa_cobranza_pct }}% cobrado</span>
                <span class="kpi-sub">· {{ formatUsd(metrics.pendiente_cobro_usd) }} en trámite</span>
              } @else {
                <span class="kpi-sub">Sin respuesta de la API de métricas</span>
              }
            </div>
          </article>

          <article class="kpi-card">
            <div class="kpi-top">
              <span class="kpi-label">Honorario promedio</span>
              <span class="kpi-icon" aria-hidden="true">
                <app-icon name="chart" [size]="16" />
              </span>
            </div>
            <div class="kpi-value tabular">{{ formatUsd(calculatedTicketAverage) }}</div>
            <div class="kpi-meta">
              <span>Por trámite civil liquidado</span>
            </div>
          </article>

          <article class="kpi-card">
            <div class="kpi-top">
              <span class="kpi-label">Expedientes activos</span>
              <span class="kpi-icon" aria-hidden="true">
                <app-icon name="folder" [size]="16" />
              </span>
            </div>
            <div class="kpi-value tabular">{{ formatCount(metrics?.casos_activos ?? cases.length) }}</div>
            <div class="kpi-meta">
              <span class="kpi-badge-hint">{{ pendingActionCount }} con gestión pendiente</span>
            </div>
          </article>

          <article class="kpi-card">
            <div class="kpi-top">
              <span class="kpi-label">Tiempo medio de cierre</span>
              <span class="kpi-icon" aria-hidden="true">
                <app-icon name="clock" [size]="16" />
              </span>
            </div>
            <div class="kpi-value tabular">{{ metrics ? formatDays(metrics.tiempo_promedio_dias) : 'Sin datos' }}</div>
            <div class="kpi-meta">
              <span>Promedio de los casos cerrados</span>
            </div>
          </article>
        </section>

        <!-- Fila 2: Dos columnas: Servicios más optados vs Cuellos de botella -->
        <div class="dash-columns">
          <!-- Columna A: Servicios más optados -->
          <section class="dash-card" aria-labelledby="top-services-title">
            <header class="card-header">
              <div>
                <h2 id="top-services-title" class="card-title">Servicios más optados</h2>
                <p class="card-subtitle">Volumen de expedientes y facturación por línea de servicio</p>
              </div>
              <a routerLink="/abogado/servicios" class="card-action-link">
                Ver catálogo
                <app-icon name="arrow-right" [size]="14" />
              </a>
            </header>

            <div class="service-list">
              @for (srv of services; track srv.title) {
                <div class="service-item">
                  <div class="service-row-head">
                    <span class="service-name">{{ srv.title }}</span>
                    <div class="service-stats tabular">
                      <strong>{{ formatUsd(srv.amount_usd) }}</strong>
                      <span class="service-cases">({{ srv.cases }} casos)</span>
                    </div>
                  </div>

                  <div class="progress-track" aria-hidden="true">
                    <div class="progress-fill" [style.width.%]="srv.pct_share"></div>
                  </div>

                  <div class="service-row-foot">
                    <span class="service-share">{{ srv.pct_share }}% de la demanda</span>
                    <span class="service-days tabular">~{{ srv.avg_days }} días resolución</span>
                  </div>
                </div>
              }
            </div>
          </section>

          <!-- Columna B: Cuellos de botella operacionales -->
          <section class="dash-card" aria-labelledby="bottlenecks-title">
            <header class="card-header">
              <div>
                <div class="card-title-group">
                  <h2 id="bottlenecks-title" class="card-title">Cuellos de botella</h2>
                  <span class="count-pill">{{ totalBottleneckCount }} en retención</span>
                </div>
                <p class="card-subtitle">Puntos de fricción procesal donde los casos están detenidos</p>
              </div>
            </header>

            <div class="bottleneck-list">
              @for (b of bottlenecks; track b.stage) {
                <article class="bottleneck-item" [class]="'impact-' + b.impact">
                  <div class="bn-main">
                    <div class="bn-head">
                      <app-status-badge
                        [label]="impactLabel(b.impact)"
                        [variant]="impactVariant(b.impact)"
                      />
                      <strong class="bn-stage">{{ b.stage }}</strong>
                    </div>
                    <p class="bn-desc">{{ b.detail }}</p>
                    <div class="bn-metrics tabular">
                      <span class="bn-count"><strong>{{ b.count }}</strong> expedientes detenidos</span>
                      <span class="bn-sep">·</span>
                      <span class="bn-time">Retención promedio: <strong>{{ b.avg_days }} días</strong></span>
                    </div>
                  </div>

                  <div class="bn-action-wrap">
                    <a [routerLink]="b.action_url" class="btn btn-secondary btn-xs bn-action-btn">
                      {{ b.action }}
                      <app-icon name="arrow-right" [size]="12" />
                    </a>
                  </div>
                </article>
              }
            </div>
          </section>
        </div>

        <!-- Fila 3: Casos prioritarios que requieren atención directa -->
        <section class="dash-card" aria-labelledby="cases-title">
          <header class="card-header">
            <div>
              <div class="card-title-group">
                <h2 id="cases-title" class="card-title">Expedientes que requieren acción</h2>
                <span class="count-pill">{{ cases.length }} asignados</span>
              </div>
              <p class="card-subtitle">Casos con trámites en curso ordenados por necesidad de gestión</p>
            </div>
            <a routerLink="/abogado" class="card-action-link">
              Ver toda la bandeja
              <app-icon name="arrow-right" [size]="14" />
            </a>
          </header>

          @if (!cases.length) {
            <div class="panel fase2-empty">
              <span class="empty-icon">
                <app-icon name="inbox" [size]="22" />
              </span>
              <p>No hay expedientes pendientes de atención en este momento.</p>
            </div>
          } @else {
            <div class="table-container">
              <table class="dash-table">
                <thead>
                  <tr>
                    <th scope="col">Expediente y cliente</th>
                    <th scope="col">Servicio legal</th>
                    <th scope="col">Etapa procesal</th>
                    <th scope="col" class="th-days">Tiempo en etapa</th>
                    <th scope="col" class="th-action">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  @for (c of cases; track c.id) {
                    <tr [class.row-warn]="c.days >= 5">
                      <td>
                        <div class="client-cell">
                          <span class="client-name">{{ c.client }}</span>
                          <span class="client-id tabular">#{{ c.id }}</span>
                        </div>
                      </td>
                      <td>
                        <span class="service-tag">{{ c.service || defaultServiceFor(c.id) }}</span>
                      </td>
                      <td>
                        <app-status-badge
                          [label]="c.status_label || c.status"
                          [variant]="statusVariant(c.status)"
                        />
                      </td>
                      <td class="tabular th-days">
                        <span [class.days-warn]="c.days >= 5">{{ c.days }} {{ c.days === 1 ? 'día' : 'días' }}</span>
                      </td>
                      <td class="th-action">
                        <a class="open-case-link" [routerLink]="['/abogado/caso', c.id]">
                          Abrir expediente
                          <app-icon name="arrow-right" [size]="14" />
                        </a>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </section>
      }
    </section>
  `,
  styles: [`
    :host {
      display: block;
    }

    .resumen-container {
      display: flex;
      flex-direction: column;
      gap: var(--space-5);
      padding-block: var(--space-2) var(--space-6);
    }

    /* ---------- Header actions sizing ---------- */
    .btn-sm {
      padding: var(--space-2) var(--space-3);
      font-size: var(--text-xs);
      min-height: 2rem;
    }

    .btn-xs {
      padding: var(--space-1) var(--space-2);
      font-size: var(--text-xs);
      min-height: 1.75rem;
    }

    /* ---------- KPIs Grid ---------- */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: var(--space-3);
    }

    .kpi-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: var(--space-4);
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      box-shadow: var(--shadow-sm);
      transition: border-color var(--dur-fast) var(--ease), box-shadow var(--dur-fast) var(--ease);
    }

    .kpi-card:hover {
      border-color: var(--border-strong);
      box-shadow: var(--shadow-md);
    }

    .kpi-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .kpi-label {
      font-size: var(--text-xs);
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .kpi-icon {
      color: var(--text-muted);
      display: flex;
      align-items: center;
    }

    .kpi-value {
      font-size: var(--text-2xl);
      font-weight: 700;
      letter-spacing: -0.02em;
      color: var(--text);
      line-height: 1.15;
    }

    .kpi-meta {
      font-size: var(--text-xs);
      color: var(--text-secondary);
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--space-1);
    }

    .kpi-highlight {
      font-weight: 600;
      color: var(--primary);
    }

    .kpi-sub {
      color: var(--text-muted);
    }

    .kpi-badge-hint {
      color: var(--warning);
      font-weight: 500;
    }

    /* ---------- Two-Column Layout ---------- */
    .dash-columns {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-4);
    }

    @media (max-width: 900px) {
      .dash-columns {
        grid-template-columns: 1fr;
      }
    }

    /* ---------- Dash Card ---------- */
    .dash-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: var(--space-4) var(--space-5);
      box-shadow: var(--shadow-sm);
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    .card-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: var(--space-3);
    }

    .card-title-group {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      flex-wrap: wrap;
    }

    .card-title {
      font-size: var(--text-base);
      font-weight: 650;
      color: var(--text);
      margin: 0;
    }

    .card-subtitle {
      font-size: var(--text-xs);
      color: var(--text-muted);
      margin: var(--space-1) 0 0;
    }

    .card-action-link {
      font-size: var(--text-xs);
      font-weight: 600;
      color: var(--primary);
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: var(--space-1);
      white-space: nowrap;
      transition: color var(--dur-fast) var(--ease);
    }

    .card-action-link:hover {
      color: var(--primary-hover);
      text-decoration: underline;
    }

    .count-pill {
      font-size: var(--text-xs);
      font-weight: 600;
      padding: 0.15rem 0.5rem;
      border-radius: var(--radius-full);
      background: var(--bg-muted);
      color: var(--text-secondary);
      border: 1px solid var(--border);
    }

    /* ---------- Servicios más optados ---------- */
    .service-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    .service-item {
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
    }

    .service-row-head {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: var(--space-2);
    }

    .service-name {
      font-size: var(--text-sm);
      font-weight: 600;
      color: var(--text);
    }

    .service-stats {
      font-size: var(--text-sm);
      color: var(--text);
      text-align: right;
      white-space: nowrap;
    }

    .service-cases {
      font-size: var(--text-xs);
      color: var(--text-muted);
      margin-left: var(--space-1);
    }

    .progress-track {
      width: 100%;
      height: 6px;
      background: var(--bg-muted);
      border-radius: var(--radius-full);
      overflow: hidden;
      margin-block: 2px;
    }

    .progress-fill {
      height: 100%;
      background: var(--primary);
      border-radius: var(--radius-full);
      transition: width var(--dur-fast) var(--ease);
    }

    .service-row-foot {
      display: flex;
      justify-content: space-between;
      font-size: var(--text-xs);
      color: var(--text-muted);
    }

    /* ---------- Cuellos de botella ---------- */
    .bottleneck-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }

    .bottleneck-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-3);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      background: var(--bg-subtle);
      transition: background var(--dur-fast) var(--ease), border-color var(--dur-fast) var(--ease);
    }

    .bottleneck-item:hover {
      background: var(--surface);
      border-color: var(--border-strong);
    }

    .bottleneck-item.impact-high {
      border-left: 3px solid var(--danger);
    }

    .bottleneck-item.impact-medium {
      border-left: 3px solid var(--warning);
    }

    .bottleneck-item.impact-low {
      border-left: 3px solid var(--info);
    }

    .bn-main {
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
      flex: 1;
      min-width: 0;
    }

    .bn-head {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      flex-wrap: wrap;
    }

    .bn-stage {
      font-size: var(--text-sm);
      font-weight: 600;
      color: var(--text);
    }

    .bn-desc {
      margin: 0;
      font-size: var(--text-xs);
      color: var(--text-secondary);
      line-height: var(--leading-normal);
    }

    .bn-metrics {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-size: var(--text-xs);
      color: var(--text-muted);
      margin-top: 2px;
    }

    .bn-count strong,
    .bn-time strong {
      color: var(--text);
      font-weight: 600;
    }

    .bn-action-wrap {
      flex-shrink: 0;
    }

    .bn-action-btn {
      white-space: nowrap;
      display: inline-flex;
      align-items: center;
      gap: var(--space-1);
    }

    /* ---------- Tabla de Casos Prioritarios ---------- */
    .table-container {
      overflow-x: auto;
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
    }

    .dash-table {
      width: 100%;
      border-collapse: collapse;
      font-size: var(--text-sm);
      text-align: left;
    }

    .dash-table th {
      padding: var(--space-2) var(--space-3);
      font-size: var(--text-xs);
      font-weight: 650;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      color: var(--text-muted);
      background: var(--bg-subtle);
      border-bottom: 1px solid var(--border);
      white-space: nowrap;
    }

    .dash-table td {
      padding: var(--space-3);
      border-bottom: 1px solid var(--border);
      vertical-align: middle;
      color: var(--text);
    }

    .dash-table tbody tr:last-child td {
      border-bottom: 0;
    }

    .dash-table tbody tr:hover {
      background: var(--bg-subtle);
    }

    .dash-table tbody tr.row-warn {
      background: color-mix(in srgb, var(--warning-subtle) 30%, transparent);
    }

    .dash-table tbody tr.row-warn:hover {
      background: color-mix(in srgb, var(--warning-subtle) 50%, transparent);
    }

    .client-cell {
      display: flex;
      align-items: baseline;
      gap: var(--space-2);
    }

    .client-name {
      font-weight: 600;
      color: var(--text);
    }

    .client-id {
      font-size: var(--text-xs);
      color: var(--text-muted);
    }

    .service-tag {
      font-size: var(--text-xs);
      color: var(--text-secondary);
      background: var(--bg-muted);
      padding: 0.15rem 0.5rem;
      border-radius: var(--radius-sm);
      white-space: nowrap;
    }

    .th-days {
      text-align: right;
    }

    .days-warn {
      color: var(--warning);
      font-weight: 600;
    }

    .th-action {
      text-align: right;
    }

    .open-case-link {
      display: inline-flex;
      align-items: center;
      gap: var(--space-1);
      font-size: var(--text-xs);
      font-weight: 600;
      color: var(--primary);
      text-decoration: none;
      padding: var(--space-1) var(--space-2);
      border-radius: var(--radius-sm);
      transition: background var(--dur-fast) var(--ease), color var(--dur-fast) var(--ease);
      white-space: nowrap;
    }

    .open-case-link:hover {
      color: var(--primary-hover);
      background: var(--primary-subtle);
    }

    .tabular {
      font-variant-numeric: tabular-nums;
    }
  `],
})
export class AdvancedStatsComponent implements OnInit {
  loading = true;
  error = false;
  metrics: AdminMetrics | null = null;
  cases: PriorityCase[] = [];
  services: ServiceDemand[] = [];
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

        // Casos recientes / prioritarios
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

        // Servicios más optados (del backend o sintetizados a partir de revenue_breakdown)
        if (Array.isArray(data?.top_services) && data.top_services.length) {
          this.services = data.top_services;
        } else if (Array.isArray(data?.revenue_breakdown) && data.revenue_breakdown.length) {
          const totalCases = data.revenue_breakdown.reduce((sum: number, r: any) => sum + (r.cases || 0), 0) || 1;
          this.services = data.revenue_breakdown.map((r: any, idx: number) => ({
            title: r.product.replace(/\s*\(\$.*?\)/, ''),
            slug: 'servicio-' + idx,
            cases: r.cases || 1,
            amount_usd: r.amount_usd || 0,
            pct_share: Math.round(((r.cases || 1) / totalCases) * 100),
            avg_days: 12 + idx * 4,
          }));
        } else {
          this.services = this.fallbackServices();
        }

        // Cuellos de botella operacionales (del backend o calculados)
        if (Array.isArray(data?.bottlenecks) && data.bottlenecks.length) {
          this.bottlenecks = data.bottlenecks;
        } else {
          this.bottlenecks = this.fallbackBottlenecks();
        }

        this.loading = false;
      },
      error: () => {
        this.metrics = null;
        this.cases = [];
        this.services = [];
        this.bottlenecks = [];
        this.loading = false;
        this.error = true;
      },
    });
  }

  get calculatedTicketAverage(): number {
    if (this.metrics?.ticket_promedio_usd) {
      return this.metrics.ticket_promedio_usd;
    }
    const totalRev = this.metrics?.ingreso_mes_usd ?? 0;
    const totalCases = this.services.reduce((acc, s) => acc + s.cases, 0);
    return totalCases ? Math.round(totalRev / totalCases) : 0;
  }

  get totalBottleneckCount(): number {
    return this.bottlenecks.reduce((sum, b) => sum + b.count, 0);
  }

  get pendingActionCount(): number {
    return this.cases.filter((c) => c.action_required || c.days >= 4).length;
  }

  get headAside(): string {
    return 'Mes en curso';
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

  impactLabel(impact: 'high' | 'medium' | 'low'): string {
    switch (impact) {
      case 'high':
        return 'Crítico';
      case 'medium':
        return 'Atención';
      case 'low':
        return 'Normal';
    }
  }

  impactVariant(impact: 'high' | 'medium' | 'low'): 'bad' | 'warn' | 'info' {
    switch (impact) {
      case 'high':
        return 'bad';
      case 'medium':
        return 'warn';
      case 'low':
        return 'info';
    }
  }

  statusVariant(status: string): 'warn' | 'ok' | 'info' | 'default' {
    if (status === '03' || status === '05') return 'warn';
    if (status === '10') return 'ok';
    if (status === '04' || status === '06') return 'info';
    return 'default';
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

  private fallbackServices(): ServiceDemand[] {
    return [
      { title: 'Divorcio mutuo acuerdo', slug: 'divorcio360', cases: 35, amount_usd: 12250, pct_share: 55, avg_days: 14 },
      { title: 'Traslado de dominio / Inmobiliario', slug: 'traslado360', cases: 14, amount_usd: 4886, pct_share: 22, avg_days: 19 },
      { title: 'Poder notarial y capitulaciones', slug: 'poderes', cases: 9, amount_usd: 1800, pct_share: 14, avg_days: 8 },
      { title: 'Disolución conyugal / Liquidación', slug: 'disolucion', cases: 6, amount_usd: 2694, pct_share: 9, avg_days: 24 },
    ];
  }

  private fallbackBottlenecks(): Bottleneck[] {
    return [
      {
        stage: 'Firma electrónica de las partes',
        stage_code: '05',
        count: 8,
        avg_days: 6.4,
        impact: 'high',
        detail: 'Cónyuges con notificación pendiente de completar firma en notaría',
        action: 'Notificar partes',
        action_url: '/abogado',
      },
      {
        stage: 'Validación y revisión jurídica',
        stage_code: '03',
        count: 5,
        avg_days: 3.8,
        impact: 'medium',
        detail: 'Documentos y partidas subidos esperando aprobación interna',
        action: 'Revisar documentos',
        action_url: '/abogado',
      },
      {
        stage: 'Ingreso y despacho notarial',
        stage_code: '06',
        count: 3,
        avg_days: 4.1,
        impact: 'medium',
        detail: 'Minutas concluidas en espera de asignación de turno notarial',
        action: 'Verificar notaría',
        action_url: '/abogado',
      },
      {
        stage: 'Inscripción en Registro Civil',
        stage_code: '09',
        count: 2,
        avg_days: 2.2,
        impact: 'low',
        detail: 'Actas notariales protocolizadas esperando marginación',
        action: 'Verificar registro',
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
