import { Component, Input } from '@angular/core';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-scheduled-meeting-card',
  standalone: true,
  imports: [DatePipe],
  template: `
    <div class="scheduled-card" role="status">
      @if (pendingRequest) {
        <p class="scheduled-title">Consulta solicitada</p>
        @if (subtitle) {
          <p class="scheduled-sub">{{ subtitle }}</p>
        }
        <p class="scheduled-note">Tu abogado te contactará por correo para coordinar fecha y enlace de la videollamada.</p>
      } @else {
        <p class="scheduled-title">
          Cita agendada: {{ scheduledAt | date:'short' }}
        </p>
        @if (subtitle) {
          <p class="scheduled-sub">{{ subtitle }}</p>
        }
        <p class="scheduled-note">Recibirás el enlace en tu correo antes de la cita.</p>
      }
    </div>
  `,
  styles: [`
    .scheduled-card {
      padding: var(--space-4) var(--space-5);
      border: 1px dashed var(--success-border, oklch(0.72 0.06 165));
      border-radius: var(--radius-lg);
      background: var(--success-subtle, oklch(0.97 0.02 165));
    }

    .scheduled-title {
      margin: 0;
      font-size: var(--text-base);
      font-weight: 650;
      color: var(--text);
    }

    .scheduled-sub {
      margin: var(--space-2) 0 0;
      font-size: var(--text-sm);
      color: var(--text-secondary);
    }

    .scheduled-note {
      margin: var(--space-2) 0 0;
      font-size: var(--text-sm);
      color: var(--text-secondary);
      line-height: var(--leading-normal);
    }
  `],
})
export class ScheduledMeetingCardComponent {
  @Input({ required: true }) scheduledAt!: string;
  @Input() subtitle = '';
  @Input() pendingRequest = false;
}
