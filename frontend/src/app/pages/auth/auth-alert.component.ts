import { Component, Input } from '@angular/core';
import { IconComponent } from '../../shared/icon.component';

@Component({
  selector: 'app-auth-alert',
  standalone: true,
  imports: [IconComponent],
  template: `
    <div class="auth-alert" [attr.data-tone]="tone" role="alert">
      <app-icon [name]="tone === 'success' ? 'check-circle' : 'alert-triangle'" [size]="18" />
      <div class="auth-alert-body">
        @if (title) {
          <strong>{{ title }}</strong>
        }
        <span>{{ message }}</span>
      </div>
    </div>
  `,
  styles: [`
    .auth-alert {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      margin-bottom: 1rem;
      padding: 0.85rem 1rem;
      border-radius: var(--radius-md);
      border: 1px solid var(--danger-border);
      background: var(--danger-subtle);
      color: var(--danger);
      font-size: var(--text-sm);
      line-height: 1.45;
    }

    .auth-alert[data-tone='success'] {
      border-color: var(--success-border, #b7d7c4);
      background: var(--success-subtle, #eef7f1);
      color: var(--success, #2f7d51);
    }

    .auth-alert-body {
      display: grid;
      gap: 0.15rem;
      min-width: 0;
    }

    .auth-alert strong {
      font-weight: 650;
      color: inherit;
    }
  `],
})
export class AuthAlertComponent {
  @Input({ required: true }) message!: string;
  @Input() title = '';
  @Input() tone: 'danger' | 'success' = 'danger';
}
