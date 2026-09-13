import {
  Component,
  ElementRef,
  Input,
  ViewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import {
  PRODUCT_SITES,
  getMarketingPrimaryAction,
} from '../../shared/product-sites.data';
import { DemoDocumentStackComponent } from '../../shared/demo/demo-document-stack.component';
import { ScrollSceneDirective } from '../../shared/motion/scroll-scene.directive';

export function activeStepFromProgress(progress: number, count: number): number {
  if (count <= 1) return 0;
  const t = Math.min(1, Math.max(0, progress));
  return Math.round(t * (count - 1));
}

function syncMockSteps(steps: Element[], progress: number): void {
  if (!steps.length) return;
  const idx = activeStepFromProgress(progress, steps.length);
  steps.forEach((el, i) => el.classList.toggle('active', i === idx));
}

@Component({
  selector: 'app-hero-scroll-video-pin-reveal',
  standalone: true,
  imports: [RouterLink, DemoDocumentStackComponent, ScrollSceneDirective],
  template: `
    <div class="hsvr-root" #root>
      <section class="hsvr-benefit" #benefitRef>
        <div class="hsvr-benefit-inner">
          <p class="hsvr-brand">Divorcio360</p>
          <div class="hsvr-headline-wrap">
            <h1
              class="hsvr-headline"
              #paraRef
              aria-label="Mutuo acuerdo. Un expediente claro."
            >
              @for (word of headlineWords; track word) {
                <span class="reveal-word">{{ word }}</span>
              }
            </h1>
          </div>

          <p class="hsvr-sub">{{ subText }}</p>

          <div class="hsvr-cta">
            <a [routerLink]="primaryAction.path" class="hsvr-btn hsvr-btn-primary">
              {{ primaryAction.label }}
            </a>

            @if (auth.isLoggedIn && auth.user()?.role === 'cliente') {
              <a href="#flujo" class="hsvr-btn hsvr-btn-outline">Cómo funciona</a>
            }
          </div>
        </div>

        <div class="hsvr-video-section">
          <div
            class="hsvr-video-wrap"
            #videoWrapperRef
            appScrollScene
            [appScrollScenePin]="true"
            appScrollSceneEnd="+=260%"
            (sceneProgress)="onPinProgress($event)"
          >
            <div class="hsvr-video-underlay" #underlayRef aria-hidden="true"></div>
            <div class="hsvr-video-box" #videoBoxRef>
              <div class="hsvr-cover" #coverRef aria-hidden="true"></div>
              <app-demo-document-stack class="hsvr-orbit" variant="orbit" />
              <p
                class="hsvr-video-headline"
                [attr.aria-label]="videoOverlayLabel"
              >
                @for (word of videoOverlayWords; track word) {
                  <span class="video-reveal-word">{{ word }}</span>
                }
              </p>
              <div class="hsvr-mock" #mockRef aria-hidden="true">
                <div class="hsvr-mock-bar">
                  <span></span><span></span><span></span>
                  <strong>{{ site.name }} · expediente</strong>
                </div>
                <div class="hsvr-mock-body">
                  @for (s of site.workflow; track s.n) {
                    <div class="hsvr-mock-step" [class.active]="s.n === 1">
                      <span class="hsvr-mock-num">{{ s.n }}</span>
                      <div>
                        <strong>{{ s.title }}</strong>
                        <small>{{ s.screen }}</small>
                      </div>
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100vw;
      max-width: 100vw;
      margin-left: calc(50% - 50vw);
      margin-right: calc(50% - 50vw);
    }

    .hsvr-root,
    .hsvr-benefit,
    .hsvr-benefit-inner,
    .hsvr-video-section,
    .hsvr-video-wrap,
    .hsvr-video-underlay,
    .hsvr-video-box {
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
      padding-bottom: 1rem;
    }

    .hsvr-benefit-inner {
      min-height: min(42rem, calc(100svh - var(--header-height)));
      max-width: 64rem;
      margin: 0 auto;
      padding: clamp(3.5rem, 8vw, 6rem) 1.25rem 3rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      position: relative;
      z-index: 2;
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
      flex-wrap: wrap;
      gap: 0.75rem;
      justify-content: center;
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

    .hsvr-video-section {
      position: relative;
      width: 100%;
    }

    .hsvr-video-wrap {
      width: 100%;
      height: 100svh;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
    }

    .hsvr-video-underlay {
      position: absolute;
      inset: -8%;
      z-index: 1;
      background:
        radial-gradient(ellipse 70% 50% at 50% 40%, color-mix(in srgb, var(--primary) 22%, transparent), transparent 62%);
      pointer-events: none;
      will-change: transform;
    }

    .hsvr-video-box {
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1.25rem;
      z-index: 2;
      padding: clamp(1.25rem, 4vw, 2.5rem) 1.25rem 3.5rem;
      box-sizing: border-box;
      clip-path: circle(10% at 50% 50%);
    }

    .hsvr-cover {
      position: absolute;
      inset: 18%;
      border-radius: 50%;
      background: #2f6f68;
      z-index: 1;
      pointer-events: none;
      transform: scale(1);
      transform-origin: 50% 50%;
    }

    .hsvr-orbit {
      position: absolute;
      inset: 8% 12%;
      z-index: 1;
      opacity: 0.55;
      pointer-events: none;
    }

    .hsvr-mock {
      position: relative;
      z-index: 3;
      width: min(36rem, calc(100% - 3rem));
      border-radius: var(--radius-lg);
      border: 1px solid color-mix(in srgb, var(--primary-border) 38%, transparent);
      background: color-mix(in srgb, var(--surface-inverse) 88%, var(--primary));
      box-shadow: none;
      overflow: hidden;
      transform: scale(0.3);
      transform-origin: 50% 50%;
    }

    .hsvr-mock-bar {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.75rem 1rem;
      background: color-mix(in srgb, var(--surface-inverse) 70%, black);
      border-bottom: 1px solid color-mix(in srgb, var(--text-inverse) 8%, transparent);
    }

    .hsvr-mock-bar span {
      width: 0.55rem;
      height: 0.55rem;
      border-radius: var(--radius-full);
      background: var(--primary);
      opacity: 0.55;
    }

    .hsvr-mock-bar strong {
      margin-left: auto;
      font-size: 0.72rem;
      font-weight: 600;
      color: color-mix(in srgb, var(--text-inverse) 55%, transparent);
    }

    .hsvr-mock-body {
      display: grid;
      gap: 0.45rem;
      padding: 0.85rem;
    }

    .hsvr-mock-step {
      display: grid;
      grid-template-columns: 2rem 1fr;
      gap: 0.75rem;
      align-items: center;
      padding: 0.55rem 0.75rem;
      border-radius: var(--radius-md);
      background: color-mix(in srgb, var(--text-inverse) 4%, transparent);
      border: 1px solid color-mix(in srgb, var(--text-inverse) 8%, transparent);
      color: var(--text-inverse);
      transition:
        border-color var(--dur-base) var(--ease),
        background var(--dur-base) var(--ease);
    }

    .hsvr-mock-step.active {
      border-color: var(--primary);
      background: color-mix(in srgb, var(--primary) 16%, transparent);
    }

    .hsvr-mock-num {
      width: 1.75rem;
      height: 1.75rem;
      border-radius: var(--radius-full);
      display: grid;
      place-items: center;
      font-size: 0.72rem;
      font-weight: 700;
      background: color-mix(in srgb, var(--primary) 22%, transparent);
      color: var(--primary-border);
    }

    .hsvr-mock-step small {
      display: block;
      color: color-mix(in srgb, var(--text-inverse) 50%, transparent);
      font-size: 0.72rem;
    }

    .hsvr-video-headline {
      margin: 0;
      max-width: 16ch;
      font-family: var(--font-display);
      font-size: clamp(1.35rem, 3.2vw, 2.35rem);
      font-weight: 600;
      line-height: 1.12;
      letter-spacing: -0.03em;
      color: var(--text-inverse);
      text-align: center;
      text-wrap: balance;
      flex-shrink: 0;
    }

    :host ::ng-deep .video-reveal-word,
    .video-reveal-word {
      display: inline-block;
      transform-origin: center center;
      margin-right: 0.2em;
      opacity: 0;
    }

    :host ::ng-deep .pin-spacer {
      background-color: var(--surface-inverse) !important;
    }

    @media (max-width: 639.9px) {
      .hsvr-video-box { clip-path: circle(22% at 50% 50%); }
      .hsvr-mock { width: min(100% - 1.5rem, 28rem); }
      .hsvr-mock-bar strong { margin-left: 0.5rem; }
    }
  `],
})
export class HeroScrollVideoPinRevealComponent {
  @Input() authQuery: Record<string, string> = {
    product: 'divorcio360',
    returnUrl: '/productos/divorcio360',
  };
  @Input() subText =
    'Evalúa si tu caso encaja. Luego documentos, consulta, firma y cierre en un solo expediente.';

  readonly site = PRODUCT_SITES['divorcio360'];

  @ViewChild('videoBoxRef') videoBoxRef?: ElementRef<HTMLElement>;
  @ViewChild('underlayRef') underlayRef?: ElementRef<HTMLElement>;
  @ViewChild('coverRef') coverRef?: ElementRef<HTMLElement>;
  @ViewChild('mockRef') mockRef?: ElementRef<HTMLElement>;

  headlineWords = [
    'Mutuo', 'acuerdo.', 'Un', 'expediente', 'claro.',
  ];

  videoOverlayWords = [
    'Cada', 'etapa,', 'visible.',
  ];

  videoOverlayLabel = 'Cada etapa, visible';

  constructor(public auth: AuthService) {}

  get primaryAction() {
    return getMarketingPrimaryAction(this.auth.user()?.role ?? null, 'divorcio360');
  }

  onPinProgress(progress: number): void {
    const t = Math.min(1, Math.max(0, progress));
    const box = this.videoBoxRef?.nativeElement;
    const cover = this.coverRef?.nativeElement;
    const mock = this.mockRef?.nativeElement;
    const underlay = this.underlayRef?.nativeElement;
    const startR = window.matchMedia('(max-width: 639.9px)').matches
      ? 22
      : window.matchMedia('(max-width: 1023.9px)').matches
        ? 14
        : 10;
    if (box) {
      box.style.clipPath = `circle(${startR + t * (150 - startR)}% at 50% 50%)`;
      const words = Array.from(box.querySelectorAll<HTMLElement>('.video-reveal-word'));
      words.forEach((el, i) => {
        const local = Math.min(1, Math.max(0, (t - 0.28 - i * 0.08) / 0.35));
        el.style.opacity = String(local);
        el.style.transform = `translateY(${(1 - local) * 18}%)`;
      });
      syncMockSteps(Array.from(box.querySelectorAll('.hsvr-mock-step')), t);
    }
    if (cover) {
      cover.style.transform = `scale(${1 + t * 11})`;
      cover.style.opacity = String(1 - t);
    }
    if (mock) {
      const s = 0.3 + Math.min(1, Math.max(0, (t - 0.18) / 0.82)) * 0.7;
      mock.style.transform = `scale(${s})`;
    }
    if (underlay) {
      underlay.style.transform = `translateY(${-6 + t * 14}%)`;
    }
  }
}
