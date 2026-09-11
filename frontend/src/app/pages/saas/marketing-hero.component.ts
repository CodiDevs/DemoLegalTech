import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  ViewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { IconComponent } from '../../shared/icon.component';

interface HeroAction {
  label: string;
  route: string;
  query?: Record<string, string>;
}

@Component({
  selector: 'app-marketing-hero',
  standalone: true,
  imports: [RouterLink, IconComponent],
  template: `
    <section
      class="mk-hero"
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

      <div class="mk-content">
        <div class="mk-brand" aria-label="LegalStation">
          <img
            class="mk-brand-mark"
            src="/brand/legalstation-mark.svg"
            width="40"
            height="40"
            alt=""
            aria-hidden="true"
          />
          <h1 class="mk-brand-name">LegalStation</h1>
        </div>

        <p class="mk-slogan">Tus trámites, sin filas, ni papeleo</p>

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
    </section>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .mk-hero {
      position: relative;
      isolation: isolate;
      display: grid;
      place-items: center;
      min-height: calc(100dvh - var(--header-height));
      overflow: hidden;
      color: var(--text-inverse);
      background-color: var(--surface-inverse);
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
      pointer-events: none;
    }

    .mk-overlay {
      position: absolute;
      inset: 0;
      z-index: 1;
      background:
        linear-gradient(
          180deg,
          rgb(18 24 22 / 0.62) 0%,
          rgb(18 24 22 / 0.48) 45%,
          rgb(18 24 22 / 0.72) 100%
        );
    }

    .mk-content {
      position: relative;
      z-index: 2;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      width: min(100%, var(--container-max));
      padding: clamp(2rem, 6vw, 4rem) clamp(1rem, 4vw, 1.5rem);
    }

    .mk-brand {
      display: inline-flex;
      flex-direction: row;
      flex-wrap: nowrap;
      align-items: center;
      justify-content: center;
      gap: clamp(0.65rem, 1.5vw, 1rem);
      margin: 0 0 clamp(1rem, 2.5vw, 1.5rem);
      max-width: 100%;
    }

    .mk-brand-mark {
      width: clamp(2rem, 4vw, 2.75rem);
      height: clamp(2rem, 4vw, 2.75rem);
      flex: 0 0 auto;
      /* Teal SVG → light mark on dark hero */
      filter: brightness(0) invert(1);
      opacity: 0.95;
    }

    .mk-brand-name {
      margin: 0;
      flex: 0 1 auto;
      font-family: var(--font-display);
      font-size: clamp(2.5rem, 7.5vw, 5rem);
      font-weight: 600;
      line-height: 1;
      letter-spacing: -0.04em;
      color: var(--text-inverse);
      white-space: nowrap;
    }

    .mk-slogan {
      margin: 0 0 clamp(1.75rem, 4vw, 2.5rem);
      max-width: 28ch;
      font-family: var(--font-sans);
      font-size: clamp(1rem, 2vw, 1.2rem);
      font-weight: 500;
      line-height: 1.45;
      letter-spacing: -0.01em;
      color: color-mix(in srgb, var(--text-inverse) 82%, transparent);
      text-wrap: pretty;
    }

    .mk-cta {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-3);
      justify-content: center;
    }

    .mk-cta-btn,
    .mk-cta-secondary {
      text-decoration: none;
      gap: var(--space-2);
    }

    .mk-cta-btn {
      background: var(--primary);
      border: 1px solid var(--primary);
      color: var(--text-on-primary);
      box-shadow: none;
    }

    .mk-cta-btn:hover {
      background: var(--primary-hover);
      border-color: var(--primary-hover);
      color: var(--text-on-primary);
      text-decoration: none;
    }

    .mk-cta-secondary {
      background: transparent;
      border-color: color-mix(in srgb, var(--text-inverse) 42%, transparent);
      color: var(--text-inverse);
    }

    .mk-cta-secondary:hover {
      background: color-mix(in srgb, var(--text-inverse) 10%, transparent);
      color: var(--text-inverse);
      text-decoration: none;
    }

    .mk-brand,
    .mk-slogan,
    .mk-cta {
      animation: mk-in 0.5s var(--ease-out) both;
    }

    .mk-slogan { animation-delay: 0.06s; }
    .mk-cta { animation-delay: 0.12s; }

    @keyframes mk-in {
      from { opacity: 0; transform: translateY(12px); filter: blur(6px); }
      to { opacity: 1; transform: none; filter: blur(0); }
    }

    @media (max-width: 560px) {
      .mk-cta {
        width: 100%;
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
  @Input() primaryCta = 'Ver qué puedo tramitar';
  @Input() secondaryCta = 'Cómo funciona';
  @Input() primaryRoute = '/';
  @Input() primaryFragment = '';
  @Input() showSecondary = false;
  @Input() secondaryAuthQuery: Record<string, string> = { returnUrl: '/' };

  /** Kept for backward-compatible bindings from older callers. */
  @Input() theme: 'legalstation' | 'divorcio' = 'legalstation';
  @Input() titleLine1 = '';
  @Input() titleHighlight = '';
  @Input() subtitle = '';
  @Input() lede = '';
  @Input() stats: unknown[] = [];
  @Input() images: [string, string, string] = ['', '', ''];

  readonly videoSrc = '/videos/legalstation-hero.mp4';
  readonly posterSrc = '/videos/legalstation-hero-poster.jpg';

  useStaticFallback = false;

  @ViewChild('videoRef') videoRef?: ElementRef<HTMLVideoElement>;

  constructor(public auth: AuthService) {}

  ngAfterViewInit(): void {
    this.tryPlay();
  }

  tryPlay(): void {
    const el = this.videoRef?.nativeElement;
    if (!el || this.useStaticFallback) return;
    el.muted = true;
    const play = el.play();
    if (play && typeof play.catch === 'function') {
      play.catch(() => undefined);
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
