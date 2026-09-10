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
        <h3 class="chart-title">Ingresos mensuales</h3>
        @if (points.length) {
          <p class="chart-latest">
            <span class="chart-latest-value">\${{ latest | number:'1.0-0' }}</span>
            <span class="chart-latest-label">último mes</span>
          </p>
        }
      </header>

      <svg
        class="chart-svg"
        [attr.viewBox]="'0 0 ' + width + ' ' + height"
        preserveAspectRatio="none"
        role="img"
        [attr.aria-label]="ariaLabel"
      >
        @for (y of gridYs; track y) {
          <line
            [attr.x1]="padX"
            [attr.x2]="width - padX"
            [attr.y1]="y"
            [attr.y2]="y"
            class="chart-grid"
          />
        }

        <path [attr.d]="areaPath" class="chart-area" />
        <path [attr.d]="linePath" class="chart-line" fill="none" />

        @for (p of plotted; track p.label) {
          <circle
            [attr.cx]="p.x"
            [attr.cy]="p.y"
            r="3.5"
            class="chart-dot"
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
      display: block;
      width: 100%;
    }

    .chart-wrap { display: grid; gap: var(--space-4); }

    .chart-head {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: var(--space-4);
      flex-wrap: wrap;
    }

    .chart-title {
      margin: 0;
      font-size: var(--text-lg);
      font-weight: 600;
      color: var(--text);
    }

    .chart-latest { margin: 0; text-align: right; }

    .chart-latest-value {
      display: block;
      font-size: var(--text-xl);
      font-weight: 600;
      font-variant-numeric: tabular-nums;
      color: var(--text);
    }

    .chart-latest-label {
      font-size: var(--text-xs);
      color: var(--text-muted);
    }

    .chart-svg {
      width: 100%;
      height: 220px;
      overflow: visible;
    }

    .chart-grid {
      stroke: var(--border);
      stroke-width: 1;
    }

    .chart-area {
      fill: var(--primary);
      fill-opacity: 0.08;
    }

    .chart-line {
      stroke: var(--primary);
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .chart-dot {
      fill: var(--primary);
    }

    .chart-dot:hover {
      fill: var(--text);
    }

    .chart-labels {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(0, 1fr));
      gap: var(--space-1);
      font-size: var(--text-xs);
      color: var(--text-muted);
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

  linePath = '';
  areaPath = '';
  plotted: { label: string; x: number; y: number }[] = [];
  gridYs: number[] = [];
  latest = 0;

  get ariaLabel(): string {
    if (!this.points.length) {
      return 'Gráfico de ingresos mensuales. Sin datos.';
    }
    const first = this.points[0].label;
    const last = this.points[this.points.length - 1].label;
    return `Gráfico de ingresos mensuales de ${first} a ${last}. Último valor: ${this.latest} dólares.`;
  }

  ngOnChanges(): void {
    this.build();
  }

  private build(): void {
    if (!this.points.length) {
      this.linePath = '';
      this.areaPath = '';
      this.plotted = [];
      this.gridYs = [];
      this.latest = 0;
      return;
    }

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

    this.gridYs = [0.25, 0.5, 0.75].map((r) => this.padY + innerH * r);

    this.linePath = this.plotted
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
      .join(' ');
    const base = this.height - this.padY;
    const first = this.plotted[0];
    const last = this.plotted[this.plotted.length - 1];
    this.areaPath = `${this.linePath} L ${last.x} ${base} L ${first.x} ${base} Z`;
  }
}
