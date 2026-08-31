import { Component, Input, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService, CaseItem } from '../core/api.service';
import { ProductFlowShellComponent } from './product-flow-shell.component';
import { productThemeFromCase } from './product-sites.data';

export type MeetingMode = 'consultation' | 'notary';

@Component({
  selector: 'app-virtual-meeting',
  standalone: true,
  imports: [RouterLink, ProductFlowShellComponent],
  template: `
    @if (caseItem) {
      <app-product-flow-shell
        [theme]="theme"
        [crumb]="[{ label: 'LegalStation', link: '/' }, { label: 'Expediente #' + caseItem.id, link: '/caso/' + caseItem.id }, { label: title }]"
        [eyebrow]="mode === 'consultation' ? 'Consulta virtual' : 'Reunión notarial'"
        [title]="title"
        [subtitle]="subtitle"
      >
        <div class="vm-layout">
          <section class="vm-video pf-card lp-lift">
            <div class="vm-video-frame" [class.live]="phase === 'live'" [class.done]="phase === 'completed'">
              @if (phase === 'scheduled') {
                <div class="vm-placeholder">
                  <span class="vm-icon">{{ mode === 'consultation' ? '👨‍⚖️' : '🏛️' }}</span>
                  <p>Sala lista — presiona «Unirse» para iniciar la demo.</p>
                  <p class="pf-muted">{{ hostName }} · {{ scheduledLabel }}</p>
                </div>
              } @else if (phase === 'live') {
                <div class="vm-live">
                  <div class="vm-participant main">
                    <span>{{ hostName }}</span>
                    <small>{{ mode === 'consultation' ? 'Abogado' : 'Notario' }}</small>
                  </div>
                  <div class="vm-participant pip">
                    <span>Tú</span>
                    <small>Cliente</small>
                  </div>
                  <div class="vm-live-badge">EN VIVO · mock</div>
                </div>
              } @else {
                <div class="vm-placeholder done">
                  <span class="vm-icon">✓</span>
                  <p>{{ completedMessage }}</p>
                </div>
              }
            </div>
            <div class="vm-controls">
              @if (phase === 'scheduled') {
                <button type="button" class="lp-btn lp-btn-primary" (click)="join()" [disabled]="busy">
                  Unirse a la {{ mode === 'consultation' ? 'consulta' : 'reunión' }}
                </button>
              } @else if (phase === 'live') {
                <button type="button" class="lp-btn lp-btn-outline" (click)="end()" [disabled]="busy">Finalizar</button>
              } @else {
                <a [routerLink]="['/caso', caseItem.id]" class="lp-btn lp-btn-primary">Volver al expediente</a>
              }
            </div>
          </section>

          <aside class="vm-side">
            <div class="pf-card lp-lift">
              <h3>Chat demo</h3>
              <div class="vm-chat">
                @for (m of chat; track m.at) {
                  <div class="vm-msg" [class.host]="m.from === 'host'">
                    <strong>{{ m.from === 'host' ? hostName : 'Tú' }}</strong>
                    <p>{{ m.text }}</p>
                    <small>{{ m.at }}</small>
                  </div>
                }
              </div>
            </div>
            <div class="pf-card lp-lift">
              <h3>Documentos</h3>
              <ul class="vm-docs">
                <li>Expediente #{{ caseItem.id }}</li>
                <li>{{ caseItem.product }}</li>
                <li>{{ caseItem.status_label }}</li>
                @if (mode === 'notary') {
                  <li>Minuta lista para comparecencia</li>
                } @else {
                  <li>Revisión pre-firma</li>
                }
              </ul>
            </div>
          </aside>
        </div>
      </app-product-flow-shell>
    }
  `,
  styles: [`
    .vm-layout {
      display: grid;
      grid-template-columns: 1.4fr 0.9fr;
      gap: 1rem;
      align-items: start;
    }

    .vm-video-frame {
      min-height: 320px;
      border-radius: var(--lp-radius-sm);
      background: linear-gradient(145deg, #1a1f2e, #2d3548);
      display: grid;
      place-items: center;
      color: white;
      position: relative;
      overflow: hidden;
    }

    .vm-video-frame.live { background: linear-gradient(145deg, #0f2a28, #1a4038); }

    .vm-placeholder {
      text-align: center;
      padding: 2rem;
      max-width: 28rem;
    }

    .vm-icon { font-size: 2.5rem; display: block; margin-bottom: 0.75rem; }

    .vm-live {
      width: 100%;
      height: 100%;
      min-height: 320px;
      position: relative;
      padding: 1rem;
    }

    .vm-participant {
      border-radius: var(--lp-radius-sm);
      padding: 1rem;
      background: rgb(255 255 255 / 0.08);
      border: 1px solid rgb(255 255 255 / 0.12);
    }

    .vm-participant.main {
      width: 100%;
      min-height: 220px;
      display: grid;
      place-content: center;
      text-align: center;
    }

    .vm-participant.pip {
      position: absolute;
      bottom: 1rem;
      right: 1rem;
      width: 120px;
      text-align: center;
      font-size: 0.85rem;
    }

    .vm-participant small { display: block; opacity: 0.75; margin-top: 0.25rem; }

    .vm-live-badge {
      position: absolute;
      top: 1rem;
      left: 1rem;
      background: #c0392b;
      font-size: 0.72rem;
      font-weight: 700;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
    }

    .vm-controls {
      display: flex;
      gap: 0.75rem;
      margin-top: 1rem;
      flex-wrap: wrap;
    }

    .vm-chat {
      display: grid;
      gap: 0.65rem;
      max-height: 220px;
      overflow: auto;
    }

    .vm-msg {
      padding: 0.55rem 0.75rem;
      border-radius: var(--lp-radius-sm);
      background: var(--lp-bg-soft);
      font-size: 0.88rem;
    }

    .vm-msg.host { background: var(--lp-accent-soft); }
    .vm-msg p { margin: 0.2rem 0; }
    .vm-msg small { color: var(--lp-ink-muted); font-size: 0.72rem; }

    .vm-docs {
      margin: 0;
      padding-left: 1.1rem;
      font-size: 0.88rem;
      color: var(--lp-ink-muted);
      display: grid;
      gap: 0.35rem;
    }

    @media (max-width: 860px) {
      .vm-layout { grid-template-columns: 1fr; }
    }
  `],
})
export class VirtualMeetingComponent implements OnInit {
  @Input() caseId = 0;
  @Input() mode: MeetingMode = 'consultation';

  caseItem: CaseItem | null = null;
  theme = productThemeFromCase();
  phase: 'scheduled' | 'live' | 'completed' = 'scheduled';
  busy = false;
  chat: { from: 'host' | 'client'; text: string; at: string }[] = [];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    if (!this.caseId) return;
    this.api.getCase(this.caseId).subscribe((d) => {
      this.caseItem = d.case;
      this.theme = productThemeFromCase(this.caseItem?.product);
      if (this.mode === 'consultation' && d.case?.consultation_at) {
        this.phase = 'completed';
      }
      if (this.mode === 'notary' && d.case?.appointment_at) {
        this.phase = 'scheduled';
      }
      this.seedChat();
    });
  }

  get title(): string {
    return this.mode === 'consultation' ? 'Consulta con abogado' : 'Reunión notarial virtual';
  }

  get subtitle(): string {
    return this.mode === 'consultation'
      ? 'Revisión del expediente por videollamada — demo sin WebRTC real.'
      : 'Comparecencia notarial simulada tras la firma.';
  }

  get hostName(): string {
    return this.mode === 'consultation' ? 'Dr. Pérez · Abogado' : (this.caseItem?.notary_name || 'Notaría LegalStation Demo');
  }

  get scheduledLabel(): string {
    if (this.mode === 'notary' && this.caseItem?.appointment_at) {
      return this.caseItem.appointment_at;
    }
    return 'Disponible ahora (demo)';
  }

  get completedMessage(): string {
    return this.mode === 'consultation'
      ? 'Consulta completada — puedes continuar con la firma.'
      : 'Reunión notarial finalizada — expediente en cierre.';
  }

  join(): void {
    this.phase = 'live';
    this.chat.push({
      from: 'host',
      text: this.mode === 'consultation'
        ? 'Buenos días — revisemos juntos su expediente antes de la firma.'
        : 'Bienvenido a la comparecencia notarial demo.',
      at: this.timeNow(),
    });
  }

  end(): void {
    if (!this.caseItem) return;
    this.busy = true;
    const finish = () => {
      this.phase = 'completed';
      this.busy = false;
      this.chat.push({
        from: 'host',
        text: this.mode === 'consultation'
          ? 'Todo en orden. Proceda a firmar cuando esté listo.'
          : 'Acta registrada en demo — gracias por su comparecencia.',
        at: this.timeNow(),
      });
    };
    if (this.mode === 'consultation') {
      this.api.completeConsultation(this.caseItem.id).subscribe({
        next: () => finish(),
        error: () => finish(),
      });
    } else {
      finish();
    }
  }

  private seedChat(): void {
    this.chat = [{
      from: 'host',
      text: 'Sala de demo LegalStation — sin audio/video real.',
      at: '09:00',
    }];
  }

  private timeNow(): string {
    return new Date().toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' });
  }
}
