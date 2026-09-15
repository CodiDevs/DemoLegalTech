import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  ViewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { IconComponent } from '../../shared/icon.component';
import { DemoCaseWindowComponent } from '../../shared/demo/demo-case-window.component';

interface HeroAction {
  label: string;
  route: string;
  query?: Record<string, string>;
}

@Component({
  selector: 'app-marketing-hero',
  standalone: true,
  imports: [RouterLink, IconComponent, DemoCaseWindowComponent],
  template: `
    <div class="mk-scene">
      <section
        class="mk-hero mk-sticky"
        [class.mk-hero--static]="useStaticFallback"
        [style.--mk-poster]="'url(' + posterSrc + ')'"
      >
        @if (!useStaticFallback) {
          <video
            #videoRef
            class="mk-video"
            [attr.poster]="posterSrc"
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
            (loadeddata)="tryPlay()"
            (error)="onVideoError()"
          >
            <source [src]="videoSrc" type="video/mp4" />
          </video>
        }

        <div class="mk-overlay" aria-hidden="true"></div>

        <div class="mk-layout">
          <div class="mk-content mk-wordmark-mask">
            <div class="mk-brand" aria-label="LegalStation">
              <img
                class="mk-brand-mark"
                src="/brand/legalstation-mark.svg"
                width="32"
                height="32"
                alt=""
                aria-hidden="true"
              />
              <span class="mk-brand-title">LegalStation</span>
            </div>

            <h1 class="mk-brand-name">
              {{ titleLine1 || 'Expedientes civiles, resueltos.' }}
            </h1>

            <p class="mk-slogan">
              {{ lede || 'Cuestionario, documentos, firma y notaría en un solo expediente.' }}
            </p>

            <div class="mk-cta">
              @if (useFragment) {
                <a
                  class="btn btn-primary btn-lg mk-cta-btn"
                  [href]="'#' + primaryFragment"
                  (click)="scrollToSection($event, primaryFragment)"
                >
                  <span>{{ primaryLabel }}</span>
                  <app-icon name="arrow-right" [size]="16" />
                </a>
              } @else {
                <a class="btn btn-primary btn-lg mk-cta-btn" [routerLink]="primaryLink">
                  <span>{{ primaryLabel }}</span>
                  <app-icon name="arrow-right" [size]="16" />
                </a>
              }

              @if (secondaryAction) {
                <a
                  [routerLink]="secondaryAction.route"
                  [queryParams]="secondaryAction.query"
                  class="btn btn-secondary btn-lg mk-cta-secondary"
                >{{ secondaryAction.label }}</a>
              }
            </div>
          </div>

          <div class="mk-dossier-float">
            <app-demo-case-window mode="overview" [activeStep]="2" />
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; }

    .mk-hero {
      position: relative;
      isolation: isolate;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100svh;
      padding-block: clamp(4rem, 10vh, 7rem);
      overflow: hidden;
      color: var(--text-inverse);
      background-color: #121413;
      background-image: var(--mk-poster);
      background-size: cover;
      background-position: center;
    }

    .mk-video {
      position: absolute;
      inset: 0;
      z-index: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      opacity: 0;
      pointer-events: none;
    }

    .mk-overlay {
      position: absolute;
      inset: 0;
      z-index: 1;
      background: linear-gradient(
        180deg,
        rgb(18 20 19 / 0.65) 0%,
        rgb(18 20 19 / 0.85) 100%
      );
      pointer-events: none;
    }

    .mk-layout {
      position: relative;
      z-index: 2;
      display: grid;
      grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.95fr);
      gap: clamp(2.5rem, 6vw, 5rem);
      align-items: center;
      width: min(100%, var(--container-max));
      padding-inline: clamp(1.25rem, 4vw, 2.5rem);
      margin: 0 auto;
    }

    .mk-content {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      text-align: left;
    }

    .mk-brand {
      display: inline-flex;
      align-items: center;
      gap: 0.65rem;
      margin-bottom: clamp(1rem, 2vw, 1.5rem);
    }

    .mk-brand-mark {
      width: 32px;
      height: 32px;
      filter: brightness(0) invert(1);
      opacity: 0.92;
    }

    .mk-brand-title {
      font-family: var(--font-display);
      font-size: var(--text-xl);
      font-weight: 600;
      letter-spacing: -0.02em;
      color: var(--text-inverse);
    }

    .mk-brand-name {
      margin: 0 0 clamp(1rem, 2vw, 1.5rem);
      font-family: var(--font-display);
      font-size: clamp(2.8rem, 6vw, 4.6rem);
      font-weight: 600;
      line-height: 1.04;
      letter-spacing: -0.04em;
      color: var(--text-inverse);
      text-shadow: 0 10px 30px rgb(0 0 0 / 0.35);
    }

    .mk-slogan {
      margin: 0 0 clamp(1.75rem, 3.5vw, 2.5rem);
      max-width: 46ch;
      font-family: var(--font-sans);
      font-size: clamp(1.05rem, 1.8vw, 1.25rem);
      font-weight: 400;
      line-height: 1.55;
      color: color-mix(in srgb, var(--text-inverse) 84%, transparent);
    }

    .mk-cta {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--space-3);
    }

    .mk-cta-btn,
    .mk-cta-secondary {
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      padding: 0.85rem 1.6rem;
      border-radius: var(--radius-md);
      font-size: var(--text-base);
      font-weight: 600;
      transition: all var(--dur-fast, 180ms) var(--ease-out);
    }

    .mk-cta-btn {
      background: var(--primary);
      border: 1px solid var(--primary);
      color: var(--text-on-primary);
    }

    .mk-cta-btn:hover {
      background: var(--primary-hover);
      border-color: var(--primary-hover);
      color: var(--text-on-primary);
      transform: translateY(-1px);
    }

    .mk-cta-secondary {
      background: transparent;
      border: 1px solid color-mix(in srgb, var(--text-inverse) 30%, transparent);
      color: var(--text-inverse);
    }

    .mk-cta-secondary:hover {
      background: color-mix(in srgb, var(--text-inverse) 10%, transparent);
      border-color: color-mix(in srgb, var(--text-inverse) 50%, transparent);
      color: var(--text-inverse);
    }

    /* Right column: Dossier Case Window */
    .mk-dossier-float {
      position: relative !important;
      right: auto !important;
      bottom: auto !important;
      width: 100% !important;
      max-width: 30rem;
      margin: 0 auto;
    }

    /* Cinematic animations (always-on) */
    .mk-brand,
    .mk-brand-name,
    .mk-slogan,
    .mk-cta {
      animation: mk-in var(--dur-cine) var(--ease-out) both;
    }
    .mk-brand-name { animation-delay: 80ms; }
    .mk-slogan { animation-delay: 160ms; }
    .mk-cta { animation-delay: 240ms; }
    .mk-dossier-float {
      animation: mk-float-in var(--dur-cine) var(--ease-out) 140ms both;
    }

    @keyframes mk-in {
      from { opacity: 0; transform: translateY(14px); filter: blur(4px); }
      to { opacity: 1; transform: none; filter: blur(0); }
    }

    @keyframes mk-float-in {
      from { opacity: 0; transform: translateY(18px) scale(0.98); filter: blur(6px); }
      to { opacity: 1; transform: none; filter: blur(0); }
    }

    @media (max-width: 960px) {
      .mk-hero {
        padding-block: clamp(3rem, 6vh, 4.5rem);
      }
      .mk-layout {
        grid-template-columns: 1fr;
        gap: 2.5rem;
      }
      .mk-dossier-float {
        max-width: 26rem;
      }
    }

    @media (max-width: 560px) {
      .mk-cta {
        flex-direction: column;
        align-items: stretch;
      }
      .mk-cta .btn {
        justify-content: center;
        width: 100%;
      }
    }
  `],
})
export class MarketingHeroComponent implements AfterViewInit {
  @Input() primaryCta = 'Abrir Divorcio360';
  @Input() secondaryCta = 'Cómo funciona';
  @Input() primaryRoute = '/productos/divorcio360';
  @Input() primaryFragment = '';
  @Input() showSecondary = false;
  @Input() secondaryAuthQuery: Record<string, string> = {};

  @Input() titleLine1 = '';
  @Input() lede = '';

  readonly videoSrc = '/videos/legalstation-hero.mp4';
  readonly posterSrc = '/videos/legalstation-hero-poster.jpg';

  useStaticFallback = false;
  private playAttempt = 0;

  @ViewChild('videoRef') videoRef?: ElementRef<HTMLVideoElement>;

  constructor(public auth: AuthService, private cdr: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    this.tryPlay();
  }

  tryPlay(): void {
    const el = this.videoRef?.nativeElement;
    if (!el || this.useStaticFallback) return;
    if (!el.paused && el.currentTime > 0) return;
    el.muted = true;
    const attempt = ++this.playAttempt;
    const play = el.play();
    if (play && typeof play.catch === 'function') {
      play.catch(() => {
        if (attempt !== this.playAttempt) return;
        const video = this.videoRef?.nativeElement;
        if (video && !video.paused) return;
        this.useStaticFallback = true;
        this.cdr.detectChanges();
      });
    }
  }

  onVideoError(): void {
    this.useStaticFallback = true;
  }

  private get role(): string | undefined {
    return this.auth.user()?.role;
  }

  get useFragment(): boolean {
    return !!this.primaryFragment && this.role !== 'abogado' && this.role !== 'cliente';
  }

  get primaryLink(): string {
    if (this.role === 'abogado') return '/abogado';
    if (this.role === 'cliente') return '/cliente';
    return this.primaryRoute;
  }

  get primaryLabel(): string {
    return this.role === 'cliente' ? 'Mis expedientes' : this.primaryCta;
  }

  get secondaryAction(): HeroAction | null {
    if (!this.showSecondary) return null;
    if (this.role === 'abogado') {
      return { label: 'Ver Fase 2', route: '/abogado/fase2/admin' };
    }
    if (this.secondaryCta === 'Volver a Divorcio360') {
      return { label: this.secondaryCta, route: '/productos/divorcio360' };
    }
    if (this.role === 'cliente') {
      return { label: 'Mi expediente', route: '/cliente' };
    }
    if (this.auth.isLoggedIn) return null;
    return { label: this.secondaryCta, route: '/auth', query: this.secondaryAuthQuery };
  }

  scrollToSection(event: Event, id: string): void {
    const el = document.getElementById(id);
    if (!el) return;
    event.preventDefault();
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
