import { Component, Input } from '@angular/core';
import { IconComponent } from '../../shared/icon.component';
import { AUTH_COPY } from './auth-copy.data';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [IconComponent],
  template: `
    <div class="al-canvas" [class.al--ready]="ready" [class.al--solo]="!showPanel">
      <div class="al-stage">
        <section class="al-card al-form-pane">
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
          </div>
        </section>

        @if (showPanel) {
          <aside class="al-card al-visual" aria-hidden="true">
            <img
              class="al-visual-img"
              [src]="panelImage"
              width="1600"
              height="1200"
              alt=""
              decoding="async"
            />
            <div class="al-visual-scrim"></div>
            <div class="al-visual-copy">
              <p class="al-visual-eye">LegalStation</p>
              <p class="al-visual-line">Tus trámites, sin filas, ni papeleo</p>
            </div>
          </aside>
        }
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    /* Lienzo: margen chico para que se lean las cartas */
    .al-canvas {
      display: grid;
      place-items: stretch;
      min-height: calc(100dvh - var(--header-height, 3.75rem));
      padding: clamp(0.65rem, 1.6vw, 1rem);
      background: var(--bg, #f7f6f3);
      box-sizing: border-box;
    }

    /* Escenario: dos cartas casi a pantalla completa */
    .al-stage {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
      gap: clamp(0.55rem, 1.1vw, 0.85rem);
      width: 100%;
      max-width: 92rem;
      margin-inline: auto;
      min-height: calc(100dvh - var(--header-height, 3.75rem) - 2 * clamp(0.65rem, 1.6vw, 1rem));
    }

    .al--solo .al-stage {
      grid-template-columns: minmax(0, 28rem);
      justify-content: center;
      max-width: none;
      min-height: auto;
      align-content: center;
    }

    /* Carta compartida */
    .al-card {
      border: 1px solid var(--border);
      border-radius: var(--radius-xl, 20px);
      box-shadow: var(--shadow-md);
      overflow: hidden;
      min-width: 0;
      min-height: 0;
    }

    .al-form-pane {
      display: grid;
      place-items: center;
      padding: clamp(1.5rem, 4vw, 3rem) clamp(1.25rem, 4vw, 3.25rem);
      background: var(--surface, #fff);
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
      transition: opacity 280ms var(--ease, ease), transform 280ms var(--ease, ease);
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
        opacity 320ms var(--ease, ease) 50ms,
        transform 320ms var(--ease, ease) 50ms;
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

    .al-visual {
      position: relative;
      background: #1a2e2c;
    }

    .al-visual-img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
      display: block;
    }

    .al-visual-scrim {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        160deg,
        color-mix(in srgb, var(--primary) 28%, transparent) 0%,
        rgb(15 25 24 / 0.25) 45%,
        rgb(15 25 24 / 0.55) 100%
      );
      pointer-events: none;
    }

    .al-visual-copy {
      position: absolute;
      left: clamp(1.5rem, 4vw, 2.75rem);
      right: clamp(1.5rem, 4vw, 2.75rem);
      bottom: clamp(1.75rem, 5vw, 3rem);
      color: #fff;
      z-index: 1;
    }

    .al-visual-eye {
      margin: 0 0 0.45rem;
      font-size: 0.75rem;
      font-weight: 650;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      opacity: 0.85;
    }

    .al-visual-line {
      margin: 0;
      max-width: 16ch;
      font-family: var(--font-display);
      font-size: clamp(1.55rem, 2.8vw, 2.15rem);
      font-weight: 600;
      letter-spacing: -0.03em;
      line-height: 1.2;
      text-wrap: balance;
    }

    @media (max-width: 900px) {
      .al-canvas {
        padding: 0;
        background: var(--surface, #fff);
      }

      .al-stage,
      .al--solo .al-stage {
        grid-template-columns: 1fr;
        gap: 0;
        max-width: none;
        min-height: calc(100dvh - var(--header-height, 3.75rem));
      }

      .al-card {
        border: 0;
        border-radius: 0;
        box-shadow: none;
      }

      .al-visual {
        display: none;
      }

      .al-form-pane {
        padding-block: clamp(1.75rem, 6vw, 3rem);
        min-height: calc(100dvh - var(--header-height, 3.75rem));
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .al-brand,
      .al-body {
        opacity: 1;
        transform: none;
        transition: none;
      }
    }
  `],
})
export class AuthLayoutComponent {
  /** Right visual panel (desktop). Hidden on mobile. */
  @Input() showPanel = true;
  @Input() ready = true;
  @Input() panelImage = '/images/auth-panel.jpg';

  readonly copy = AUTH_COPY;
}
