import { Component, Input } from '@angular/core';

export interface ProgressStep {
  id: string;
  label: string;
}

@Component({
  selector: 'app-progress-steps',
  standalone: true,
  template: `
    <div class="steps" role="list">
      @for (step of steps; track step.id; let i = $index) {
        <div class="step" role="listitem"
          [class.done]="i < activeIndex"
          [class.active]="i === activeIndex">
          <span class="dot">{{ i + 1 }}</span>
          <span class="label">{{ step.label }}</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .steps { display: flex; gap: 0.35rem; flex-wrap: wrap; margin-bottom: 1rem; }
    .step {
      display: flex; align-items: center; gap: 0.35rem;
      padding: 0.35rem 0.65rem; border-radius: 999px;
      border: 1px solid var(--line); font-size: 0.78rem; font-weight: 600;
      color: var(--ink-soft); background: white;
    }
    .step.done { border-color: oklch(0.55 0.12 150 / 0.4); color: var(--ok); }
    .step.active { border-color: var(--brand); color: var(--brand-deep); background: oklch(0.94 0.02 210); }
    .dot {
      width: 1.25rem; height: 1.25rem; border-radius: 50%;
      display: grid; place-items: center; font-size: 0.7rem;
      background: var(--line);
    }
    .step.done .dot { background: var(--ok); color: white; }
    .step.active .dot { background: var(--brand); color: white; }
    .label { white-space: nowrap; }
  `]
})
export class ProgressStepsComponent {
  @Input({ required: true }) steps!: ProgressStep[];
  @Input() activeIndex = 0;
}
