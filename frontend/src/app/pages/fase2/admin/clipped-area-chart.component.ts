import { Component, Input, OnChanges } from '@angular/core';
import { DecimalPipe } from '@angular/common';

export interface ChartPoint {
  label: string;
  value: number;
}

@Component({
  selector: 'app-clipped-area-chart',
  standalone: true,
  imports: [DecimalPipe],
  template: `
    <div class="chart-wrap">
      <header class="chart-head">
        <div>
          <p class="chart-eyebrow">Ingresos acumulados</p>
          <h3 class="chart-title">Evolución mensual</h3>
        </div>
        @if (latest) {
          <div class="chart-latest">
            <span class="chart-latest-value">\${{ latest | number:'1.0-0' }}</span>
            <span class="chart-latest-label">este mes</span>
          </div>
        }
      </header>

      <svg
        class="chart-svg"
        [attr.viewBox]="'0 0 ' + width + ' ' + height"
        preserveAspectRatio="none"
        role="img"
        aria-label="Gráfico de ingresos mensuales"
      >
        <defs>
          <linearGradient [attr.id]="gradientId" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="var(--adv-chart-fill)" stop-opacity="0.35" />
            <stop offset="100%" stop-color="var(--adv-chart-fill)" stop-opacity="0.02" />
          </linearGradient>
          <clipPath [attr.id]="clipId">
            <rect class="chart-clip-rect" [attr.width]="width" [attr.height]="height" />
          </clipPath>
        </defs>

        @for (y of gridYs; track y) {
          <line
            [attr.x1]="padX"
            [attr.x2]="width - padX"
            [attr.y1]="y"
            [attr.y2]="y"
            class="chart-grid"
          />
        }

        <g [attr.clip-path]="'url(#' + clipId + ')'">
          <path [attr.d]="areaPath" [attr.fill]="'url(#' + gradientId + ')'" class="chart-area" />
          <path [attr.d]="linePath" class="chart-line" fill="none" />
        </g>

        @for (p of plotted; track p.label; let i = $index) {
          <circle
            [attr.cx]="p.x"
            [attr.cy]="p.y"
            r="3.5"
            class="chart-dot"
            [style.animation-delay.s]="0.45 + i * 0.06"
          />
        }
      </svg>

      <div class="chart-labels">
        @for (p of points; track p.label) {
          <span>{{ p.label }}</span>
        }
      </div>
    </div>
  `,
  styles: [`
    :host {
      --adv-chart-fill: var(--primary, #4a9e96);
      display: block;
      width: 100%;
    }

    .chart-wrap { display: grid; gap: var(--space-4); }

    .chart-head {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: var(--space-4);
      flex-wrap: wrap;
    }

    .chart-eyebrow {
      margin: 0 0 var(--space-1);
      font-size: 0.625rem;
      font-weight: 700;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--adv-muted, #a1a1aa);
    }

    .chart-title {
      margin: 0;
      font-size: var(--text-xl);
      font-weight: 700;
      letter-spacing: -0.02em;
      color: var(--adv-fg, #18181b);
    }

    .chart-latest { text-align: right; }

    .chart-latest-value {
      display: block;
      font-size: var(--text-2xl);
      font-weight: 700;
      font-variant-numeric: tabular-nums;
      color: var(--adv-fg, #18181b);
    }

    .chart-latest-label {
      font-size: var(--text-xs);
      color: var(--adv-muted, #a1a1aa);
    }

    .chart-svg {
      width: 100%;
      height: 220px;
      overflow: visible;
    }

    .chart-grid {
      stroke: var(--adv-border, #e4e4e7);
      stroke-width: 1;
      stroke-dasharray: 4 4;
    }

    .chart-area {
      opacity: 0;
      animation: chart-area-in 1.1s ease 0.35s forwards;
    }

    .chart-line {
      stroke: var(--adv-chart-fill);
      stroke-width: 2.5;
      stroke-linecap: round;
      stroke-linejoin: round;
      stroke-dasharray: 1200;
      stroke-dashoffset: 1200;
      animation: chart-line-draw 1.4s ease 0.2s forwards;
    }

    .chart-dot {
      fill: var(--adv-chart-fill);
      opacity: 0;
      animation: chart-dot-in 0.4s ease forwards;
    }

    .chart-clip-rect {
      transform-origin: left center;
      transform: scaleX(0);
      animation: chart-clip-reveal 1.2s cubic-bezier(0.22, 1, 0.36, 1) 0.15s forwards;
    }

    @keyframes chart-clip-reveal {
      to { transform: scaleX(1); }
    }

    @keyframes chart-line-draw {
      to { stroke-dashoffset: 0; }
    }

    @keyframes chart-area-in {
      to { opacity: 1; }
    }

    @keyframes chart-dot-in {
      to { opacity: 1; }
    }

    .chart-labels {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(0, 1fr));
      gap: var(--space-1);
      font-size: 0.65rem;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--adv-muted, #a1a1aa);
      text-align: center;
    }
  `],
})
export class ClippedAreaChartComponent implements OnChanges {
  @Input() points: ChartPoint[] = [];

  readonly width = 640;
  readonly height = 220;
  readonly padX = 24;
  readonly padY = 24;
  readonly gradientId = `adv-grad-${Math.random().toString(36).slice(2, 9)}`;
  readonly clipId = `adv-clip-${Math.random().toString(36).slice(2, 9)}`;

  linePath = '';
  areaPath = '';
  plotted: { label: string; x: number; y: number }[] = [];
  gridYs: number[] = [];
  latest = 0;

  ngOnChanges(): void {
    this.build();
  }

  private build(): void {
    if (!this.points.length) return;
    this.latest = this.points[this.points.length - 1].value;

    const vals = this.points.map((p) => p.value);
    const min = Math.min(...vals) * 0.92;
    const max = Math.max(...vals) * 1.04;
    const innerW = this.width - this.padX * 2;
    const innerH = this.height - this.padY * 2;

    this.plotted = this.points.map((p, i) => {
      const x = this.padX + (i / Math.max(this.points.length - 1, 1)) * innerW;
      const y = this.padY + innerH - ((p.value - min) / (max - min || 1)) * innerH;
      return { label: p.label, x, y };
    });

    this.gridYs = [0.25, 0.5, 0.75].map(
      (r) => this.padY + innerH * r,
    );

    const line = this.plotted.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    this.linePath = this.smooth(line);
    const base = this.height - this.padY;
    const first = this.plotted[0];
    const last = this.plotted[this.plotted.length - 1];
    this.areaPath = `${this.linePath} L ${last.x} ${base} L ${first.x} ${base} Z`;
  }

  private smooth(linePath: string): string {
    if (this.plotted.length < 3) return linePath;
    const pts = this.plotted;
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] ?? pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] ?? p2;
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  }
}
