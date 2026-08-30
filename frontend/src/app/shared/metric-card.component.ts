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
    .metric { display: grid; gap: 0.25rem; }
    .metric strong { font-family: var(--font-display); font-size: 1.8rem; line-height: 1.1; }
    .metric span { color: var(--ink-soft); font-size: 0.85rem; }
    .hint { font-style: normal; font-size: 0.75rem; color: var(--ok); font-weight: 600; }
  `]
})
export class MetricCardComponent {
  @Input({ required: true }) value!: string | number;
  @Input({ required: true }) label!: string;
  @Input() hint = '';
}
