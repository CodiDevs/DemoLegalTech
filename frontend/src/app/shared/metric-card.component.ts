import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-metric-card',
  standalone: true,
  template: `
    <div class="metric panel">
      <strong>{{ value }}</strong>
      <span>{{ label }}</span>
      @if (hint) { <em class="hint">{{ hint }}</em> }
    </div>
  `,
  styles: [`
    .metric {
      display: grid;
      gap: var(--space-1);
      padding: var(--space-4);
    }
    .metric strong {
      font-weight: 650;
      font-size: var(--text-3xl);
      line-height: var(--leading-tight);
      letter-spacing: var(--tracking-tight);
      font-variant-numeric: tabular-nums;
    }
    .metric span {
      color: var(--text-secondary);
      font-size: var(--text-sm);
      line-height: var(--leading-snug);
    }
    .hint {
      font-style: normal;
      font-size: var(--text-xs);
      font-weight: 600;
      color: var(--success);
    }
  `]
})
export class MetricCardComponent {
  @Input({ required: true }) value!: string | number;
  @Input({ required: true }) label!: string;
  @Input() hint = '';
}
