import { Component, Input } from '@angular/core';
import { IconComponent } from '../../shared/icon.component';
import { ColophonComponent } from '../../shared/colophon.component';
import { AUTH_COPY, AUTH_NEXT_STEPS } from './auth-copy.data';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [IconComponent, ColophonComponent],
  template: `
    <div class="al-canvas" [class.al--ready]="ready" [class.al--solo]="!showPanel">
      <div class="al-stage">
        <section class="al-form-pane">
          <div class="al-form-inner">
            <header class="al-brand">
              <img
                class="al-mark"
                src="/brand/legalstation-mark.svg"
                width="36"
                height="36"
                alt=""
              />
              <p class="al-wordmark">{{ copy.brand }}</p>
            </header>

            <div class="al-body">
              <ng-content />
            </div>

            <p class="al-secure">
              <app-icon name="lock" [size]="14" />
              {{ copy.lockNote }}
            </p>

            <app-colophon density="folio" />
          </div>
        </section>

        @if (showPanel) {
          <aside class="al-acta" aria-hidden="true">
            <ol>
              @for (step of nextSteps; track step.title) {
                <li>
                  <p class="al-acta-title">{{ step.title }}</p>
                  <p class="al-acta-body">{{ step.body }}</p>
                </li>
              }
            </ol>
          </aside>
        }
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .al-canvas {
      display: grid;
      place-items: stretch;
      min-height: calc(100dvh - var(--header-height, 3.75rem));
      padding: clamp(0.65rem, 1.6vw, 1rem);
      background: var(--bg);
      box-sizing: border-box;
    }

    .al-stage {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
      gap: clamp(1.5rem, 4vw, 3.5rem);
      width: 100%;
      max-width: 64rem;
      margin-inline: auto;
      min-height: calc(100dvh - var(--header-height, 3.75rem) - 2 * clamp(0.65rem, 1.6vw, 1rem));
      align-items: center;
    }

    .al--solo .al-stage {
      grid-template-columns: minmax(0, 28rem);
      justify-content: center;
      max-width: none;
      min-height: auto;
      align-content: center;
    }

    .al-form-pane {
      display: grid;
      place-items: center;
      padding: clamp(1.25rem, 3vw, 2rem) 0;
      background: none;
      border: 0;
      box-shadow: none;
    }

    .al-form-inner {
      width: 100%;
      max-width: 24rem;
      display: grid;
      gap: 1.5rem;
    }

    .al-brand {
      display: grid;
      justify-items: center;
      gap: 0.65rem;
      text-align: center;
      opacity: 0;
      transform: translateY(8px);
    }

    .al--ready .al-brand {
      opacity: 1;
      transform: none;
      transition: opacity var(--dur-cine) var(--ease-out), transform var(--dur-cine) var(--ease-out);
    }

    .al-mark {
      display: block;
      width: 2.25rem;
      height: 2.25rem;
    }

    .al-wordmark {
      margin: 0;
      font-family: var(--font-display);
      font-size: clamp(1.65rem, 3vw, 2rem);
      font-weight: 650;
      letter-spacing: -0.03em;
      color: var(--text);
    }

    .al-body {
      opacity: 0;
      transform: translateY(10px);
    }

    .al--ready .al-body {
      opacity: 1;
      transform: none;
      transition:
        opacity var(--dur-cine) var(--ease-out) 50ms,
        transform var(--dur-cine) var(--ease-out) 50ms;
    }

    .al-secure {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
      margin: 0;
      font-size: var(--text-xs);
      color: var(--text-muted);
    }

    .al-form-inner > app-colophon {
      text-align: center;
    }

    .al-acta {
      padding: clamp(1.5rem, 4vw, 2.5rem) 0;
      border-left: 1px solid var(--border);
      padding-left: clamp(1.5rem, 4vw, 2.75rem);
    }

    .al-acta ol {
      list-style: none;
      margin: 0;
      padding: 0;
      display: grid;
      gap: var(--space-6);
    }

    .al-acta li {
      padding: 0;
    }

    .al-acta-title {
      margin: 0 0 var(--space-1);
      font-family: var(--font-sans);
      font-size: var(--text-sm);
      font-weight: 650;
      letter-spacing: -0.02em;
      color: var(--text);
    }

    .al-acta-body {
      margin: 0;
      max-width: 36ch;
      font-size: var(--text-sm);
      line-height: 1.55;
      color: var(--text-secondary);
    }

    @media (max-width: 900px) {
      .al-canvas {
        padding: 0;
        background: var(--bg);
      }

      .al-stage,
      .al--solo .al-stage {
        grid-template-columns: 1fr;
        gap: 0;
        max-width: none;
        min-height: calc(100dvh - var(--header-height, 3.75rem));
      }

      .al-acta {
        display: none;
      }

      .al-form-pane {
        padding-block: clamp(1.75rem, 6vw, 3rem);
        min-height: calc(100dvh - var(--header-height, 3.75rem));
      }
    }
  `],
})
export class AuthLayoutComponent {
  @Input() showPanel = true;
  @Input() ready = true;
  @Input() panelImage = '/images/auth-panel.jpg';

  readonly copy = AUTH_COPY;
  readonly nextSteps = AUTH_NEXT_STEPS;
}
