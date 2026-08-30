import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  template: `<span class="badge" [class]="variant">{{ label }}</span>`,
  styles: [`
    .badge {
      font-size: 0.72rem; font-weight: 600; padding: 0.15rem 0.5rem;
      border-radius: 999px; background: var(--line); white-space: nowrap;
    }
    .badge.warn { background: oklch(0.92 0.05 85); color: oklch(0.45 0.08 55); }
    .badge.ok { background: oklch(0.92 0.04 150); color: var(--ok); }
    .badge.bad { background: oklch(0.92 0.04 25); color: var(--bad); }
    .badge.info { background: oklch(0.92 0.04 210); color: var(--brand-deep); }
  `]
})
export class StatusBadgeComponent {
  @Input({ required: true }) label!: string;
  @Input() variant: 'default' | 'warn' | 'ok' | 'bad' | 'info' = 'default';
}
