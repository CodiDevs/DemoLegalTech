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

gsap.registerPlugin(ScrollTrigger);

export interface HeroTagItem {
  text: string;
  background: string;
  color?: string;
}

@Component({
  selector: 'app-hero-scroll-video-pin-reveal',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="hsvr-root" #root>
      <section class="hsvr-intro">
        <p class="hsvr-intro-eyebrow">Divorcio360 · by LegalStation</p>
        <p class="hsvr-intro-line">Un trámite notarial claro, trazable y sin fricción.</p>
      </section>

      <section class="hsvr-benefit" #benefitRef>
        <div class="hsvr-benefit-inner">
          <div class="hsvr-headline-wrap">
            <p class="hsvr-headline" #paraRef aria-label="Tu trámite con un plan claro de principio a fin">
              @for (word of headlineWords; track word) {
                <span class="reveal-word">{{ word }}</span>
              }
            </p>
          </div>

          <div class="hsvr-tags">
            @for (tag of tags; track tag.text; let i = $index) {
              <div
                class="hsvr-tag"
                [style.background]="tag.background"
                [style.color]="tag.color || '#ffffff'"
              >{{ tag.text }}</div>
            }
          </div>

          <p class="hsvr-sub">{{ subText }}</p>

          <div class="hsvr-cta">
            @if (auth.isLoggedIn && auth.user()?.role === 'cliente') {
              <a routerLink="/cliente" class="hsvr-btn hsvr-btn-primary">Mi expediente</a>
              <a routerLink="/productos/divorcio360" class="hsvr-btn hsvr-btn-outline">Volver a Divorcio360</a>
            } @else if (auth.isLoggedIn) {
              <a routerLink="/abogado" class="hsvr-btn hsvr-btn-primary">Panel operador</a>
            } @else {
              <a routerLink="/cuestionario" class="hsvr-btn hsvr-btn-primary">Comenzar cuestionario</a>
              <a routerLink="/auth" [queryParams]="authQuery" class="hsvr-btn hsvr-btn-outline">Ingresar</a>
            }
          </div>
        </div>

        <div class="hsvr-video-section">
          <div class="hsvr-video-wrap" #videoWrapperRef>
            <div class="hsvr-video-underlay" aria-hidden="true"></div>
            <div class="hsvr-video-box" #videoBoxRef>
              <video
                #videoRef
                autoplay
                muted
                loop
                playsinline
                preload="auto"
                [src]="videoSrc"
                aria-label="Recorrido visual Divorcio360"
              ></video>
              <div class="hsvr-video-overlay" aria-hidden="false">
                <p
                  class="hsvr-video-headline"
                  [attr.aria-label]="videoOverlayLabel"
                >
                  @for (word of videoOverlayWords; track word) {
                    <span class="video-reveal-word">{{ word }}</span>
                  }
                </p>
              </div>
              <div class="hsvr-video-caption">
                <span>Expediente demo · 10 estados · firma mock</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="hsvr-outro">
        <p>Del cuestionario al cierre notarial,<br />en un solo flujo.</p>
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

    .hsvr-root {
      background: #0d0f0d;
      color: #f3f4f6;
      overflow-x: hidden;
      font-family: 'Inter', system-ui, sans-serif;
    }

    .hsvr-intro,
    .hsvr-benefit,
    .hsvr-benefit-inner,
    .hsvr-video-section,
    .hsvr-video-wrap,
    .hsvr-video-underlay,
    .hsvr-video-box,
    .hsvr-outro {
      background: #0d0f0d;
    }

    .hsvr-intro {
      min-height: 100vh;
      min-height: 100svh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 2rem 1.5rem;
    }

    .hsvr-intro-eyebrow {
      margin: 0 0 1rem;
      font-size: 0.72rem;
      font-weight: 600;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: #6b9088;
    }

    .hsvr-intro-line {
      margin: 0;
      font-size: clamp(1.75rem, 4.5vw, 3.5rem);
      font-weight: 700;
      letter-spacing: -0.03em;
      line-height: 1.12;
      max-width: 16ch;
    }

    .hsvr-benefit {
      position: relative;
      width: 100%;
      min-height: 140vh;
      padding-bottom: 4rem;
    }

    .hsvr-benefit-inner {
      max-width: 64rem;
      margin: 0 auto;
      padding: 4rem 1.25rem 2rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      position: relative;
      z-index: 2;
    }

    .hsvr-headline-wrap {
      width: 100%;
      margin-bottom: 2rem;
    }

    .hsvr-headline {
      margin: 0;
      font-size: clamp(2rem, 5vw, 4.5rem);
      font-weight: 800;
      line-height: 1.05;
      letter-spacing: -0.04em;
      overflow: visible;
    }

    :host ::ng-deep .reveal-word,
    .reveal-word {
      display: inline-block;
      transform-origin: left center;
      margin-right: 0.22em;
      will-change: transform, opacity;
    }

    .hsvr-tags {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 0.65rem 0.85rem;
      max-width: 48rem;
      margin: 0.5rem auto 1.5rem;
    }

    .hsvr-tag {
      padding: 0.55rem 1.1rem;
      border-radius: 999px;
      font-size: clamp(0.85rem, 1.8vw, 1.15rem);
      font-weight: 600;
      letter-spacing: -0.01em;
      opacity: 0;
      clip-path: polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%);
      box-shadow: 0 12px 32px rgb(0 0 0 / 0.25);
    }

    .hsvr-sub {
      margin: 0 0 1.35rem;
      max-width: 38rem;
      font-size: clamp(0.95rem, 1.5vw, 1.2rem);
      line-height: 1.65;
      color: #a1a1aa;
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
      padding: 0.85rem 1.45rem;
      border-radius: 999px;
      font-weight: 600;
      font-size: 0.95rem;
      text-decoration: none;
      transition: transform 0.15s ease;
    }

    .hsvr-btn:hover { transform: translateY(-1px); }

    .hsvr-btn-primary {
      background: #4a9e96;
      color: white;
      box-shadow: 0 10px 24px rgb(74 158 150 / 0.35);
    }

    .hsvr-btn-outline {
      border: 1.5px solid rgb(255 255 255 / 0.35);
      color: white;
      background: rgb(255 255 255 / 0.06);
    }

    .hsvr-video-section {
      position: relative;
      width: 100%;
    }

    .hsvr-video-wrap {
      width: 100%;
      height: 100vh;
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
      align-items: center;
      justify-content: center;
      z-index: 2;
      will-change: clip-path;
    }

    .hsvr-video-box video {
      width: 100%;
      height: 100%;
      object-fit: cover;
      background: #0d0f0d;
    }

    .hsvr-video-overlay {
      position: absolute;
      inset: 0;
      z-index: 4;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: clamp(1rem, 4vw, 2.5rem);
      pointer-events: none;
      text-align: center;
    }

    .hsvr-video-headline {
      margin: 0;
      max-width: 16ch;
      font-size: clamp(1.6rem, 4.2vw, 3.5rem);
      font-weight: 800;
      line-height: 1.06;
      letter-spacing: -0.04em;
      color: white;
      text-shadow: 0 2px 28px rgb(0 0 0 / 0.55);
    }

    :host ::ng-deep .video-reveal-word,
    .video-reveal-word {
      display: inline-block;
      transform-origin: center center;
      margin-right: 0.2em;
      will-change: transform, opacity;
    }

    .hsvr-video-caption {
      position: absolute;
      left: clamp(1rem, 4vw, 2.5rem);
      bottom: clamp(1rem, 4vw, 2.5rem);
      z-index: 3;
      font-size: 0.78rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: rgb(255 255 255 / 0.75);
    }

    .hsvr-outro {
      min-height: 100vh;
      min-height: 100svh;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 2rem 1.5rem;
    }

    .hsvr-outro p {
      margin: 0;
      font-size: clamp(1.75rem, 4.5vw, 3.5rem);
      font-weight: 700;
      letter-spacing: -0.03em;
      line-height: 1.12;
    }

    :host ::ng-deep .pin-spacer {
      background-color: #0d0f0d !important;
    }

    @media (max-width: 639px) {
      .hsvr-benefit { min-height: 120vh; }
    }
  `],
})
export class HeroScrollVideoPinRevealComponent implements AfterViewInit, OnDestroy {
  @Input() videoSrc =
    'https://res.cloudinary.com/dsuwzuaxp/video/upload/856381-hd_1920_1080_30fps_gsq11b.mp4';
  @Input() authQuery: Record<string, string> = {
    product: 'divorcio360',
    returnUrl: '/productos/divorcio360',
  };
  @Input() subText =
    'Calificación inteligente, expediente trazable y firma — sin fricción para firmas y clientes.';

  @ViewChild('root') rootRef?: ElementRef<HTMLElement>;
  @ViewChild('benefitRef') benefitRef?: ElementRef<HTMLElement>;
  @ViewChild('paraRef') paraRef?: ElementRef<HTMLElement>;
  @ViewChild('videoWrapperRef') videoWrapperRef?: ElementRef<HTMLElement>;
  @ViewChild('videoBoxRef') videoBoxRef?: ElementRef<HTMLElement>;
  @ViewChild('videoRef') videoRef?: ElementRef<HTMLVideoElement>;

  headlineWords = [
    'Tu', 'trámite', 'con', 'un', 'plan', 'claro', 'de', 'principio', 'a', 'fin',
  ];

  videoOverlayWords = [
    'Cinco', 'pasos,', 'un', 'expediente,', 'cero', 'llamadas', 'innecesarias.',
  ];

  videoOverlayLabel = 'Cinco pasos, un expediente, cero llamadas innecesarias';

  tags: HeroTagItem[] = [
    { text: 'Cuestionario', background: '#3a827b', color: '#ffffff' },
    { text: 'Expediente', background: '#4a9e96', color: '#ffffff' },
    { text: 'Firma demo', background: '#e8f6f4', color: '#2a4542' },
    { text: '10 estados', background: '#2a4542', color: '#ffffff' },
  ];

  private gsapCtx?: gsap.Context;
  private reducedMotion = false;

  constructor(public auth: AuthService) {}

  ngAfterViewInit(): void {
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const video = this.videoRef?.nativeElement;
    if (video) {
      video.muted = true;
      void video.play().catch(() => {});
    }

    if (this.reducedMotion) {
      this.showStaticFallback();
      return;
    }

    // Defer until layout is stable (pin-spacer math needs real dimensions).
    requestAnimationFrame(() => {
      requestAnimationFrame(() => this.initGsap());
    });
  }

  ngOnDestroy(): void {
    this.gsapCtx?.revert();
    ScrollTrigger.getAll().forEach((t) => t.kill());
  }

  private showStaticFallback(): void {
    const words = this.paraRef?.nativeElement.querySelectorAll('.reveal-word');
    words?.forEach((el) => {
      (el as HTMLElement).style.opacity = '1';
      (el as HTMLElement).style.transform = 'none';
    });
    this.rootRef?.nativeElement.querySelectorAll('.hsvr-tag').forEach((el) => {
      (el as HTMLElement).style.opacity = '1';
      (el as HTMLElement).style.clipPath = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)';
    });
    if (this.videoBoxRef?.nativeElement) {
      this.videoBoxRef.nativeElement.style.clipPath = 'circle(150% at 50% 50%)';
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
      if (st.spacer) st.spacer.style.backgroundColor = '#0d0f0d';
      if (st.pin) st.pin.style.backgroundColor = '#0d0f0d';
    };

    this.gsapCtx = gsap.context(() => {
      const words = Array.from(para.querySelectorAll('.reveal-word'));
      if (words.length) {
        gsap.set(words, { opacity: 0, rotate: 8, yPercent: 30 });
      }

      const tagNodes = Array.from(root.querySelectorAll('.hsvr-tag'));

      const revealTl = gsap.timeline({
        scrollTrigger: {
          trigger: benefit,
          start: 'top 70%',
          end: 'top -10%',
          scrub: 1.5,
        },
      });

      if (words.length) {
        revealTl.to(words, {
          stagger: 0.2,
          opacity: 1,
          rotate: 0,
          yPercent: 0,
          ease: 'power1.inOut',
        });
      }

      tagNodes.forEach((tagEl) => {
        revealTl.to(
          tagEl,
          {
            duration: 1,
            opacity: 1,
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
            ease: 'circ.out',
          },
          '>-0.4',
        );
      });

      const mm = gsap.matchMedia();

      const addVideoPin = (startCircle: string, endPx: string, scrub: number) => {
        gsap.set(videoBox, { clipPath: startCircle });

        const videoWords = Array.from(videoBox.querySelectorAll('.video-reveal-word'));
        if (videoWords.length) {
          gsap.set(videoWords, { opacity: 0, rotate: 10, yPercent: 45, scale: 0.9 });
        }

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
              rotate: 0,
              yPercent: 0,
              scale: 1,
              stagger: 0.12,
              ease: 'power2.out',
              duration: 0.45,
            },
            0.42,
          );
        }
      };

      mm.add('(max-width: 639.9px)', () => addVideoPin('circle(18% at 50% 50%)', '+=1500', 1.2));
      mm.add('(min-width: 640px) and (max-width: 1023.9px)', () => addVideoPin('circle(12% at 50% 50%)', '+=2000', 1.3));
      mm.add('(min-width: 1024px)', () => addVideoPin('circle(8% at 50% 50%)', '+=2500', 1.5));
    }, root);

    ScrollTrigger.refresh();
  }
}
