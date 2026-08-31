import { Component, Input } from '@angular/core';
import { IconComponent } from './icon.component';

export interface ProgressStep {
  id: string;
  label: string;
}

@Component({
  selector: 'app-progress-steps',
  standalone: true,
  imports: [IconComponent],
  template: `
    <div class="steps" role="list">
      @for (step of steps; track step.id; let i = $index) {
        <div class="step" role="listitem"
          [class.done]="i < activeIndex"
          [class.active]="i === activeIndex"
          [attr.aria-current]="i === activeIndex ? 'step' : null">
          <span class="dot">
            @if (i < activeIndex) {
              <app-icon name="check" [size]="12" [strokeWidth]="2.5" />
            } @else {
              {{ i + 1 }}
            }
          </span>
          <span class="label">{{ step.label }}</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .steps {
      display: flex;
      gap: var(--space-1);
      flex-wrap: wrap;
      margin-bottom: var(--space-4);
    }

    .step {
      display: flex;
      align-items: center;
      gap: var(--space-1);
      padding: var(--space-1) var(--space-3);
      border-radius: var(--radius-full);
      border: 1px solid var(--border);
      font-size: var(--text-xs);
      font-weight: 600;
      color: var(--text-secondary);
      background: var(--surface);
    }

    .step.done {
      border-color: var(--success-border);
      color: var(--success);
    }

    .step.active {
      border-color: var(--primary);
      color: var(--primary-hover);
      background: var(--primary-subtle);
    }

    .dot {
      width: 1.25rem;
      height: 1.25rem;
      border-radius: var(--radius-full);
      display: grid;
      place-items: center;
      font-size: var(--text-xs);
      background: var(--bg-muted);
      color: var(--text-secondary);
    }

    .step.done .dot {
      background: var(--success);
      color: var(--text-on-primary);
    }

    .step.active .dot {
      background: var(--primary);
      color: var(--text-on-primary);
    }

    .label { white-space: nowrap; }
  `]
})
export class ProgressStepsComponent {
  @Input({ required: true }) steps!: ProgressStep[];
  @Input() activeIndex = 0;
}
