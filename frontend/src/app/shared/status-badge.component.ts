import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  template: `<span class="badge" [class]="variant">{{ label }}</span>`,
  styles: [`
    .badge {
      display: inline-flex;
      align-items: center;
      gap: var(--space-1);
      font-size: var(--text-xs);
      font-weight: 600;
      line-height: 1.4;
      padding: var(--space-1) var(--space-3);
      border-radius: var(--radius-full);
      border: 1px solid var(--border);
      background: var(--bg-muted);
      color: var(--text-secondary);
      white-space: nowrap;
    }
    .badge.ok {
      background: var(--success-subtle);
      border-color: var(--success-border);
      color: var(--success);
    }
    .badge.warn {
      background: var(--warning-subtle);
      border-color: var(--warning-border);
      color: var(--warning);
    }
    .badge.bad {
      background: var(--danger-subtle);
      border-color: var(--danger-border);
      color: var(--danger);
    }
    .badge.info {
      background: var(--info-subtle);
      border-color: var(--info-border);
      color: var(--info);
    }
  `]
})
export class StatusBadgeComponent {
  @Input({ required: true }) label!: string;
  @Input() variant: 'default' | 'warn' | 'ok' | 'bad' | 'info' = 'default';
}
