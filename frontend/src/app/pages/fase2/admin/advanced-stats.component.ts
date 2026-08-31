import {
  Component, ElementRef, OnInit, ViewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../core/api.service';
import { IconComponent } from '../../../shared/icon.component';
import { ClippedAreaChartComponent, ChartPoint } from './clipped-area-chart.component';
import { TimelineAnimationDirective } from './timeline-animation.directive';

interface KpiCard {
  label: string;
  value: string;
  change: string;
  status: 'up' | 'down';
}

@Component({
  selector: 'app-advanced-stats',
  standalone: true,
  imports: [
    RouterLink,
    IconComponent,
    ClippedAreaChartComponent,
    TimelineAnimationDirective,
  ],
  template: `
    <section #root class="adv-stats-root">
      <header class="adv-top">
        <h1>Resumen del bufete</h1>
        <a routerLink="/abogado" class="adv-cta">
          <app-icon name="folder" [size]="16" />
          Ir a mis casos
        </a>
      </header>

      <div class="adv-inner">
        <div class="adv-grid">
          <div
            appTimelineAnimation
            [animationNum]="1"
            [timelineRoot]="root"
            class="adv-card adv-chart-card"
          >
            <app-clipped-area-chart [points]="chartPoints" />
          </div>

          <div class="adv-side">
            <div
              appTimelineAnimation
              [animationNum]="2"
              [timelineRoot]="root"
              class="adv-card adv-goal-card"
            >
              <div>
                <p class="adv-eyebrow">Objetivo principal</p>
                <h4 class="adv-goal-title">Trámites digitales completos</h4>
              </div>
              <div class="adv-goal-body">
                <div class="adv-goal-row">
                  <span class="adv-goal-pct">{{ digitalPct }}%</span>
                  <span class="adv-goal-target">Meta: 90%</span>
                </div>
                <div class="adv-progress-track">
                  <div class="adv-progress-fill" [style.width.%]="digitalPct"></div>
                </div>
              </div>
            </div>

            <div
              appTimelineAnimation
              [animationNum]="3"
              [timelineRoot]="root"
              class="adv-card adv-growth-card"
            >
              <div class="adv-growth-head">
                <span class="adv-growth-icon" aria-hidden="true">
                  <app-icon name="users" [size]="20" />
                </span>
                <h4>Nuevos clientes</h4>
              </div>
              <p class="adv-growth-copy">
                Captación orgánica al alza
                <strong>{{ clientGrowthPct }}%</strong>
                respecto al trimestre anterior.
              </p>
            </div>
          </div>
        </div>

        <div class="adv-kpi-grid">
          @for (kpi of kpis; track kpi.label; let i = $index) {
            <div
              appTimelineAnimation
              [animationNum]="4 + i"
              [timelineRoot]="root"
              class="adv-card adv-kpi"
              [class.is-up]="kpi.status === 'up'"
              [class.is-down]="kpi.status === 'down'"
            >
              <p class="adv-kpi-label">{{ kpi.label }}</p>
              <div class="adv-kpi-row">
                <p class="adv-kpi-value">{{ kpi.value }}</p>
                <span class="adv-kpi-change" [class.up]="kpi.status === 'up'" [class.down]="kpi.status === 'down'">
                  {{ kpi.change }}
                </span>
              </div>
            </div>
          }
        </div>
      </div>
    </section>
  `,
  styles: [`
    :host {
      --adv-fg: var(--text);
      --adv-muted: var(--text-muted);
      --adv-border: var(--border);
      --adv-surface: var(--surface);
      display: block;
    }

    .adv-stats-root {
      display: flex;
      flex-direction: column;
      gap: var(--space-6);
      padding-block: var(--space-2) var(--space-6);
    }

    .adv-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-4);
      flex-wrap: wrap;
    }

    .adv-top h1 {
      margin: 0;
      font-size: var(--text-2xl);
      font-weight: 700;
      letter-spacing: -0.02em;
    }

    .adv-cta {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      padding: 0.55rem 1rem;
      border-radius: var(--radius-lg);
      background: var(--primary);
      color: #fff;
      font-size: var(--text-sm);
      font-weight: 600;
      text-decoration: none;
    }

    .adv-cta:hover {
      background: var(--primary-hover);
      color: #fff;
    }

    .adv-inner {
      max-width: 72rem;
      width: 100%;
    }

    .adv-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: var(--space-6);
    }

    @media (min-width: 1024px) {
      .adv-grid { grid-template-columns: 2fr 1fr; }
    }

    .adv-side {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    .adv-card {
      border-radius: 1.5rem;
      border: 1px solid var(--adv-border);
      background: var(--adv-surface);
    }

    .adv-chart-card {
      padding: var(--space-6);
    }

    .adv-goal-card {
      padding: var(--space-5);
      background: linear-gradient(155deg, var(--primary-subtle) 0%, var(--surface) 72%);
      color: var(--text);
      border-color: var(--primary-border);
      box-shadow: var(--shadow-md);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 11rem;
    }

    .adv-goal-card .adv-eyebrow {
      color: var(--primary-hover);
    }

    .adv-goal-title {
      margin: 0;
      font-size: var(--text-xl);
      font-weight: 700;
      letter-spacing: -0.02em;
      color: var(--text);
    }

    .adv-goal-body { margin-top: var(--space-6); }

    .adv-goal-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: var(--space-2);
    }

    .adv-eyebrow {
      margin: 0 0 var(--space-2);
      font-size: 0.625rem;
      font-weight: 700;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--adv-muted);
    }

    .adv-goal-pct {
      font-size: var(--text-3xl);
      font-weight: 600;
      letter-spacing: -0.03em;
      color: var(--primary);
    }

    .adv-goal-target {
      font-size: var(--text-xs);
      color: var(--text-secondary);
      margin-bottom: 0.15rem;
    }

    .adv-progress-track {
      width: 100%;
      height: 6px;
      border-radius: var(--radius-full);
      background: color-mix(in srgb, var(--primary-border) 55%, var(--surface));
      overflow: hidden;
    }

    .adv-progress-fill {
      height: 100%;
      border-radius: inherit;
      background: linear-gradient(90deg, var(--primary), var(--primary-hover));
      transition: width 1s cubic-bezier(0.22, 1, 0.36, 1) 0.4s;
    }

    .adv-growth-card {
      padding: var(--space-5);
      flex: 1;
    }

    .adv-growth-head {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      margin-bottom: var(--space-4);
    }

    .adv-growth-head h4 {
      margin: 0;
      font-size: var(--text-base);
      font-weight: 700;
      color: var(--adv-fg);
    }

    .adv-growth-icon {
      display: grid;
      place-items: center;
      width: 2rem;
      height: 2rem;
      border-radius: var(--radius-md);
      border: 1px solid var(--adv-border);
      background: #fff;
      color: var(--adv-fg);
    }

    .adv-growth-copy {
      margin: 0;
      font-size: var(--text-sm);
      line-height: 1.55;
      color: var(--adv-muted);
    }

    .adv-growth-copy strong {
      color: var(--adv-fg);
      font-weight: 600;
    }

    .adv-kpi-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--space-4);
      padding-top: var(--space-6);
    }

    @media (min-width: 768px) {
      .adv-kpi-grid { grid-template-columns: repeat(4, 1fr); }
    }

    .adv-kpi {
      padding: var(--space-5);
      transition: border-color 0.2s ease, background 0.2s ease;
    }

    .adv-kpi.is-up:hover {
      border-color: var(--primary-border);
      background: var(--primary-subtle);
    }

    .adv-kpi.is-down:hover {
      border-color: color-mix(in srgb, var(--danger) 35%, var(--border));
      background: color-mix(in srgb, var(--danger) 8%, var(--surface));
    }

    .adv-kpi-label {
      margin: 0 0 var(--space-2);
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--adv-muted);
    }

    .adv-kpi-row {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: var(--space-2);
    }

    .adv-kpi-value {
      margin: 0;
      font-size: var(--text-2xl);
      font-weight: 800;
      letter-spacing: -0.03em;
      color: var(--adv-fg);
      font-variant-numeric: tabular-nums;
    }

    .adv-kpi-change {
      font-size: var(--text-xs);
      font-weight: 700;
      padding: 0.15rem 0.4rem;
      border-radius: var(--radius-sm);
    }

    .adv-kpi-change.up {
      color: var(--primary-hover);
      background: var(--primary-subtle);
    }

    .adv-kpi-change.down {
      color: var(--danger);
      background: color-mix(in srgb, var(--danger) 10%, var(--surface));
    }

    :host ::ng-deep .adv-stat-animate {
      opacity: 0;
      transform: translateY(18px);
      transition:
        opacity 0.65s cubic-bezier(0.22, 1, 0.36, 1),
        transform 0.65s cubic-bezier(0.22, 1, 0.36, 1);
    }

    :host ::ng-deep .adv-stats-root.is-visible .adv-stat-animate {
      opacity: 1;
      transform: none;
    }

    :host ::ng-deep .adv-stats-root.is-visible .adv-stat-animate[data-anim='1'] { transition-delay: 0.05s; }
    :host ::ng-deep .adv-stats-root.is-visible .adv-stat-animate[data-anim='2'] { transition-delay: 0.12s; }
    :host ::ng-deep .adv-stats-root.is-visible .adv-stat-animate[data-anim='3'] { transition-delay: 0.19s; }
    :host ::ng-deep .adv-stats-root.is-visible .adv-stat-animate[data-anim='4'] { transition-delay: 0.26s; }
    :host ::ng-deep .adv-stats-root.is-visible .adv-stat-animate[data-anim='5'] { transition-delay: 0.33s; }
    :host ::ng-deep .adv-stats-root.is-visible .adv-stat-animate[data-anim='6'] { transition-delay: 0.4s; }
    :host ::ng-deep .adv-stats-root.is-visible .adv-stat-animate[data-anim='7'] { transition-delay: 0.47s; }
  `],
})
export class AdvancedStatsComponent implements OnInit {
  @ViewChild('root') rootRef?: ElementRef<HTMLElement>;

  chartPoints: ChartPoint[] = [];
  kpis: KpiCard[] = [];
  digitalPct = 82;
  clientGrowthPct = 24;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.mockMetrics().subscribe((d) => this.applyMetrics(d));
  }

  private applyMetrics(data: any): void {
    const m = data?.metrics ?? {};
    const ingreso = m.ingreso_mes_usd ?? 18420;
    const activos = m.casos_activos ?? 0;
    const finalizados = m.casos_finalizados ?? 0;
    const conversion = m.conversion_cuestionario ?? 0.61;
    const tiempo = m.tiempo_promedio_dias ?? 18.4;
    const finishRate = Math.round(conversion * 100);

    this.chartPoints = this.buildChartSeries(ingreso, data?.revenue_breakdown);
    this.digitalPct = Math.min(95, Math.max(55, finishRate + 21));
    this.clientGrowthPct = Math.round(conversion * 40);

    this.kpis = [
      {
        label: 'Ingresos del mes',
        value: `$${this.formatNum(ingreso)}`,
        change: '+12.5%',
        status: 'up',
      },
      {
        label: 'Casos activos',
        value: this.formatNum(activos),
        change: activos > 0 ? '+4.2%' : '0%',
        status: 'up',
      },
      {
        label: 'Tiempo de resolución',
        value: `${Math.round(tiempo)} días`,
        change: '-8.1%',
        status: 'down',
      },
      {
        label: 'Tasa de finalización',
        value: `${finishRate}%`,
        change: finalizados > 0 ? '+0.4%' : '—',
        status: 'up',
      },
    ];
  }

  private buildChartSeries(current: number, breakdown?: any[]): ChartPoint[] {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago'];
    const factors = [0.55, 0.62, 0.68, 0.71, 0.78, 0.82, 0.91, 1];
    let series = months.map((label, i) => ({
      label,
      value: Math.round(current * factors[i]),
    }));

    if (breakdown?.length) {
      const total = breakdown.reduce((s: number, r: any) => s + (r.amount_usd ?? 0), 0);
      if (total > 0) {
        series[series.length - 1].value = total;
      }
    }

    return series;
  }

  private formatNum(n: number): string {
    return new Intl.NumberFormat('en-US').format(Math.round(n));
  }
}
