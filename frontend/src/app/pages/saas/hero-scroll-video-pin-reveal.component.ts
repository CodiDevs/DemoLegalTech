import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AuthService } from '../../core/auth.service';
import {
  PRODUCT_SITES,
  getMarketingPrimaryAction,
} from '../../shared/product-sites.data';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-hero-scroll-video-pin-reveal',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="hsvr-root" #root>
      <section class="hsvr-benefit" #benefitRef>
        <div class="hsvr-benefit-inner">
          <div class="hsvr-headline-wrap">
            <h1
              class="hsvr-headline"
              #paraRef
              aria-label="Tu trámite con un plan claro de principio a fin"
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
            } @else if (!auth.isLoggedIn) {
              <a
                routerLink="/auth"
                [queryParams]="authQuery"
                class="hsvr-btn hsvr-btn-outline"
              >Ingresar</a>
            }
          </div>
        </div>

        <div class="hsvr-video-section">
          <div class="hsvr-video-wrap" #videoWrapperRef>
            <div class="hsvr-video-underlay" aria-hidden="true"></div>
            <div class="hsvr-video-box" #videoBoxRef>
              <p
                class="hsvr-video-headline"
                [attr.aria-label]="videoOverlayLabel"
              >
                @for (word of videoOverlayWords; track word) {
                  <span class="video-reveal-word">{{ word }}</span>
                }
              </p>
              <div class="hsvr-mock" aria-hidden="true">
                <div class="hsvr-mock-bar">
                  <span></span><span></span><span></span>
                  <strong>{{ site.name }} · expediente de ejemplo</strong>
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

    .hsvr-headline-wrap {
      width: 100%;
      margin-bottom: 1.5rem;
    }

    .hsvr-headline {
      margin: 0;
      max-width: 15ch;
      font-family: var(--font-display);
      font-size: clamp(2.35rem, 6vw, 4.75rem);
      font-weight: 600;
      line-height: 1.04;
      letter-spacing: -0.04em;
      color: var(--text-inverse);
      text-wrap: balance;
    }

    :host ::ng-deep .reveal-word,
    .reveal-word {
      display: inline-block;
      transform-origin: left center;
      margin-right: 0.22em;
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
      inset: 0;
      z-index: 1;
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
    }

    .hsvr-mock {
      width: min(36rem, calc(100% - 3rem));
      border-radius: var(--radius-lg);
      border: 1px solid color-mix(in srgb, var(--primary-border) 38%, transparent);
      background: color-mix(in srgb, var(--surface-inverse) 88%, var(--primary));
      box-shadow: none;
      overflow: hidden;
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
    }

    :host ::ng-deep .pin-spacer {
      background-color: var(--surface-inverse) !important;
    }

    @media (max-width: 639px) {
      .hsvr-mock { width: min(100% - 1.5rem, 28rem); }
      .hsvr-mock-bar strong { margin-left: 0.5rem; }
    }

    @media (prefers-reduced-motion: reduce) {
      .hsvr-btn { transition: none; }
      .hsvr-mock-step { transition: none; }
      .reveal-word,
      .video-reveal-word {
        opacity: 1;
        transform: none;
        filter: none;
      }
    }
  `],
})
export class HeroScrollVideoPinRevealComponent implements AfterViewInit, OnDestroy {
  @Input() authQuery: Record<string, string> = {
    product: 'divorcio360',
    returnUrl: '/productos/divorcio360',
  };
  @Input() subText =
    'Evalúa si tu caso encaja y recorre una demostración del expediente, los documentos y la firma.';

  readonly site = PRODUCT_SITES['divorcio360'];

  @ViewChild('root') rootRef?: ElementRef<HTMLElement>;
  @ViewChild('benefitRef') benefitRef?: ElementRef<HTMLElement>;
  @ViewChild('paraRef') paraRef?: ElementRef<HTMLElement>;
  @ViewChild('videoWrapperRef') videoWrapperRef?: ElementRef<HTMLElement>;
  @ViewChild('videoBoxRef') videoBoxRef?: ElementRef<HTMLElement>;

  headlineWords = [
    'Tu', 'trámite', 'con', 'un', 'plan', 'claro', 'de', 'principio', 'a', 'fin',
  ];

  videoOverlayWords = [
    'Seguimiento', 'claro', 'en', 'cada', 'etapa.',
  ];

  videoOverlayLabel = 'Seguimiento claro en cada etapa';

  private gsapCtx?: gsap.Context;
  private gsapMedia?: ReturnType<typeof gsap.matchMedia>;
  private reducedMotion = false;

  constructor(public auth: AuthService) {}

  get primaryAction() {
    return getMarketingPrimaryAction(this.auth.user()?.role ?? null, 'divorcio360');
  }

  ngAfterViewInit(): void {
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (this.reducedMotion) {
      this.showStaticFallback();
      return;
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.initGsap();
        setTimeout(() => ScrollTrigger.refresh(), 100);
      });
    });
  }

  ngOnDestroy(): void {
    this.gsapMedia?.revert();
    this.gsapCtx?.revert();
  }

  private showStaticFallback(): void {
    const words = this.paraRef?.nativeElement.querySelectorAll('.reveal-word');
    words?.forEach((el) => {
      (el as HTMLElement).style.opacity = '1';
      (el as HTMLElement).style.transform = 'none';
    });
    if (this.videoBoxRef?.nativeElement) {
      this.videoBoxRef.nativeElement.style.clipPath = 'none';
    }
    this.rootRef?.nativeElement.querySelectorAll('.video-reveal-word').forEach((el) => {
      (el as HTMLElement).style.opacity = '1';
      (el as HTMLElement).style.transform = 'none';
    });
  }

  private initGsap(): void {
    const root = this.rootRef?.nativeElement;
    const benefit = this.benefitRef?.nativeElement;
    const para = this.paraRef?.nativeElement;
    const videoWrapper = this.videoWrapperRef?.nativeElement;
    const videoBox = this.videoBoxRef?.nativeElement;

    if (!root || !benefit || !para || !videoWrapper || !videoBox) return;

    const paintPinDark = (self: ScrollTrigger) => {
      const st = self as ScrollTrigger & { spacer?: HTMLElement; pin?: HTMLElement };
      if (st.spacer) st.spacer.style.backgroundColor = 'var(--surface-inverse)';
      if (st.pin) st.pin.style.backgroundColor = 'var(--surface-inverse)';
    };

    this.gsapCtx = gsap.context(() => {
      const words = Array.from(para.querySelectorAll('.reveal-word'));

      if (words.length) {
        gsap.from(words, {
          opacity: 0,
          yPercent: 12,
          stagger: 0.035,
          duration: 0.42,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: para,
            start: 'top 82%',
            once: true,
          },
        });
      }

      this.gsapMedia = gsap.matchMedia();

      const addMockPin = (startCircle: string, endPx: string, scrub: number) => {
        gsap.set(videoBox, { clipPath: startCircle });

        const videoWords = Array.from(videoBox.querySelectorAll('.video-reveal-word'));
        if (videoWords.length) {
          gsap.set(videoWords, { opacity: 0, yPercent: 18 });
        }

        const mockSteps = Array.from(videoBox.querySelectorAll('.hsvr-mock-step'));

        const vpTl = gsap.timeline({
          scrollTrigger: {
            trigger: videoWrapper,
            start: 'top top',
            end: endPx,
            scrub,
            pin: true,
            pinSpacing: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onRefresh: paintPinDark,
            onToggle: paintPinDark,
          },
        });

        vpTl.fromTo(
          videoBox,
          { clipPath: startCircle },
          { clipPath: 'circle(150% at 50% 50%)', ease: 'none' },
          0,
        );

        if (videoWords.length) {
          vpTl.to(
            videoWords,
            {
              opacity: 1,
              yPercent: 0,
              stagger: 0.08,
              ease: 'power2.out',
              duration: 0.35,
            },
            0.28,
          );
        }

        mockSteps.forEach((stepEl, i) => {
          vpTl.call(
            () => {
              mockSteps.forEach((el) => el.classList.remove('active'));
              stepEl.classList.add('active');
            },
            [],
            0.18 + i * 0.1,
          );
        });
      };

      this.gsapMedia.add(
        '(max-width: 639.9px)',
        () => addMockPin('circle(22% at 50% 50%)', '+=420', 0.85),
      );
      this.gsapMedia.add(
        '(min-width: 640px) and (max-width: 1023.9px)',
        () => addMockPin('circle(14% at 50% 50%)', '+=650', 0.95),
      );
      this.gsapMedia.add(
        '(min-width: 1024px)',
        () => addMockPin('circle(10% at 50% 50%)', '+=900', 1),
      );
    }, root);

    ScrollTrigger.refresh();
  }
}
