import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import {
  getDivorcioFormAction,
  getMarketingPrimaryAction,
} from '../../shared/product-sites.data';

@Component({
  selector: 'app-hero-scroll-video-pin-reveal',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="hsvr-root">
      <section class="hsvr-benefit">
        <div class="hsvr-benefit-inner">
          <p class="hsvr-brand">Divorcio360</p>
          <div class="hsvr-headline-wrap">
            <h1
              class="hsvr-headline"
              aria-label="Mutuo acuerdo. Un expediente claro."
            >
              @for (word of headlineWords; track word) {
                <span class="reveal-word">{{ word }}</span>
              }
            </h1>
          </div>

          <p class="hsvr-sub">{{ subText }}</p>

          @if (sessionAction || formAction) {
            <div class="hsvr-cta">
              @if (sessionAction) {
                <a [routerLink]="sessionAction.path" class="hsvr-btn hsvr-btn-outline">
                  {{ sessionAction.label }}
                </a>
              }
              @if (formAction) {
                <a
                  [routerLink]="formAction.path"
                  [queryParams]="formAction.query"
                  class="hsvr-btn hsvr-btn-primary hsvr-cta-primary"
                >{{ formAction.label }}</a>
              }
            </div>
          }
        </div>
      </section>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      max-width: 100%;
      min-width: 0;
    }

    .hsvr-root,
    .hsvr-benefit,
    .hsvr-benefit-inner {
      background: var(--surface-inverse);
    }

    .hsvr-root {
      color: var(--text-inverse);
      overflow-x: hidden;
      font-family: var(--font-sans);
    }

    .hsvr-benefit {
      position: relative;
      width: 100%;
    }

    .hsvr-benefit-inner {
      min-height: min(42rem, calc(100svh - var(--header-height)));
      max-width: 64rem;
      margin: 0 auto;
      padding: clamp(3.5rem, 8vw, 6rem) 1.25rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
    }

    .hsvr-brand {
      margin: 0 0 1.25rem;
      font-family: var(--font-display);
      font-size: clamp(1.35rem, 2.4vw, 1.85rem);
      font-weight: 600;
      letter-spacing: -0.03em;
      color: var(--primary-border);
    }

    .hsvr-headline-wrap {
      width: 100%;
      margin-bottom: 1.35rem;
    }

    .hsvr-headline {
      margin: 0 auto;
      max-width: 12ch;
      font-family: var(--font-display);
      font-size: clamp(2.75rem, 7vw, 5.25rem);
      font-weight: 600;
      line-height: 1.02;
      letter-spacing: -0.045em;
      color: var(--text-inverse);
      text-wrap: balance;
    }

    :host ::ng-deep .reveal-word,
    .reveal-word {
      display: inline-block;
      opacity: 1;
      transform-origin: left center;
      margin-right: 0.22em;
      animation: hsvr-word-in 420ms var(--ease-out) both;
    }

    .reveal-word:nth-child(2) { animation-delay: 35ms; }
    .reveal-word:nth-child(3) { animation-delay: 70ms; }
    .reveal-word:nth-child(4) { animation-delay: 105ms; }
    .reveal-word:nth-child(5) { animation-delay: 140ms; }

    @keyframes hsvr-word-in {
      from { transform: translateY(12%); }
      to { transform: none; }
    }

    .hsvr-sub {
      margin: 0 0 1.5rem;
      max-width: 38rem;
      font-size: clamp(1rem, 1.5vw, 1.15rem);
      line-height: 1.6;
      color: color-mix(in srgb, var(--text-inverse) 78%, transparent);
    }

    .hsvr-cta {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
    }

    .hsvr-btn {
      display: inline-flex;
      align-items: center;
      min-height: var(--control-height);
      padding: 0 var(--space-5);
      border-radius: var(--radius-md);
      font-weight: 600;
      font-size: var(--text-sm);
      text-decoration: none;
      transition:
        background var(--dur-fast) var(--ease),
        border-color var(--dur-fast) var(--ease),
        color var(--dur-fast) var(--ease);
    }

    .hsvr-btn-primary {
      background: var(--primary-hover);
      color: var(--text-on-primary);
    }

    .hsvr-btn-primary:hover {
      background: var(--primary-active);
    }

    .hsvr-btn-outline {
      border: 1px solid color-mix(in srgb, var(--text-inverse) 48%, transparent);
      color: var(--text-inverse);
      background: transparent;
    }

    .hsvr-btn-outline:hover {
      background: color-mix(in srgb, var(--text-inverse) 8%, transparent);
    }

    .hsvr-btn:focus-visible {
      outline: 2px solid var(--primary-border);
      outline-offset: 3px;
    }
  `],
})
export class HeroScrollVideoPinRevealComponent {
  @Input() subText =
    'Evalúa si tu caso encaja. Luego documentos, consulta, firma y cierre en un solo expediente.';

  headlineWords = [
    'Mutuo', 'acuerdo.', 'Un', 'expediente', 'claro.',
  ];

  constructor(public auth: AuthService) {}

  get sessionAction() {
    const role = this.auth.user()?.role ?? null;
    if (role !== 'cliente') return null;
    return getMarketingPrimaryAction(role, 'divorcio360');
  }

  get formAction() {
    return getDivorcioFormAction(this.auth.user()?.role ?? null);
  }
}
