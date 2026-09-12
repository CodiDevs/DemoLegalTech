import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnDestroy,
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
    <div class="mk-scene" #sceneRef [style.--mk-p]="progress">
      <section
        class="mk-hero mk-sticky"
        [class.mk-hero--static]="useStaticFallback"
        [style.--mk-poster]="'url(' + posterSrc + ')'"
      >
        @if (!useStaticFallback) {
          <video
            #videoRef
            class="mk-video mk-plane-library"
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

        <div class="mk-content mk-wordmark-mask">
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

        <div class="mk-dossier-float">
          <app-demo-case-window mode="overview" [activeStep]="2" />
        </div>
      </section>
    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; }

    .mk-hero {
      position: relative;
      isolation: isolate;
      display: grid;
      place-items: center;
      min-height: 100svh;
      overflow: hidden;
      color: var(--text-inverse);
      background-color: var(--surface-inverse);
      background-image: var(--mk-poster);
      background-size: cover;
      background-position: center;
    }

    .mk-video {
      position: absolute;
      inset: -6%;
      z-index: 0;
      width: 112%;
      height: 112%;
      object-fit: cover;
      pointer-events: none;
      animation: mk-drift 28s var(--ease-out) alternate infinite;
    }

    .mk-overlay {
      position: absolute;
      inset: 0;
      z-index: 1;
      background:
        linear-gradient(
          105deg,
          rgb(18 24 22 / 0.88) 0%,
          rgb(18 24 22 / 0.42) 46%,
          rgb(18 24 22 / 0.28) 100%
        );
    }

    .mk-content {
      position: relative;
      z-index: 2;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      text-align: left;
      width: min(100%, var(--container-max));
      padding: clamp(2rem, 6vw, 4rem) clamp(1rem, 4vw, 1.5rem);
      justify-self: start;
    }

    .mk-brand {
      display: inline-flex;
      align-items: center;
      gap: clamp(0.65rem, 1.5vw, 1rem);
      margin: 0 0 clamp(1rem, 2.5vw, 1.5rem);
    }

    .mk-brand-mark {
      width: clamp(2rem, 4vw, 2.75rem);
      height: clamp(2rem, 4vw, 2.75rem);
      filter: brightness(0) invert(1);
      opacity: 0.95;
    }

    .mk-brand-name {
      margin: 0;
      font-family: var(--font-display);
      font-size: clamp(3.2rem, 10vw, 6rem);
      font-weight: 600;
      line-height: 0.9;
      letter-spacing: -0.045em;
      color: var(--text-inverse);
      text-shadow: 0 18px 48px rgb(0 0 0 / 0.45);
    }

    .mk-slogan {
      margin: 0 0 clamp(1.75rem, 4vw, 2.5rem);
      max-width: 22ch;
      font-family: var(--font-sans);
      font-size: clamp(1rem, 2vw, 1.25rem);
      font-weight: 500;
      line-height: 1.4;
      color: color-mix(in srgb, var(--text-inverse) 88%, transparent);
      text-shadow: 0 10px 28px rgb(0 0 0 / 0.4);
    }

    .mk-cta {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-3);
    }

    .mk-cta-btn,
    .mk-cta-secondary { text-decoration: none; gap: var(--space-2); }

    .mk-cta-btn {
      background: var(--primary);
      border: 1px solid var(--primary);
      color: var(--text-on-primary);
    }

    .mk-cta-btn:hover {
      background: var(--primary-hover);
      border-color: var(--primary-hover);
      color: var(--text-on-primary);
    }

    .mk-cta-secondary {
      background: transparent;
      border-color: color-mix(in srgb, var(--text-inverse) 42%, transparent);
      color: var(--text-inverse);
    }

    .mk-brand, .mk-slogan, .mk-cta {
      animation: mk-in var(--dur-cine) var(--ease-out) both;
    }
    .mk-slogan { animation-delay: 140ms; }
    .mk-cta { animation-delay: 260ms; }

    @keyframes mk-in {
      from { opacity: 0; transform: translateY(16px); filter: blur(8px); }
      to { opacity: 1; transform: none; filter: blur(0); }
    }

    @keyframes mk-drift {
      from { transform: scale(1.06) translateY(0); }
      to { transform: scale(1.12) translateY(-2.4%); }
    }

    @media (max-height: 720px) {
      .mk-brand-name { font-size: clamp(2.4rem, 7vw, 3.8rem); }
      .mk-slogan { margin-bottom: 1rem; }
    }

    @media (max-width: 560px) {
      .mk-cta { width: 100%; flex-direction: column; align-items: stretch; }
      .mk-cta .btn { justify-content: center; width: 100%; }
      .mk-content { align-items: center; text-align: center; justify-self: center; }
    }
  `],
})
export class MarketingHeroComponent implements AfterViewInit, OnDestroy {
  @Input() primaryCta = 'Abrir Divorcio360';
  @Input() secondaryCta = 'Cómo funciona';
  @Input() primaryRoute = '/productos/divorcio360';
  @Input() primaryFragment = '';
  @Input() showSecondary = false;
  @Input() secondaryAuthQuery: Record<string, string> = { returnUrl: '/' };

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
  progress = 0;
  private playAttempt = 0;
  private onScroll = () => this.syncProgress();

  @ViewChild('videoRef') videoRef?: ElementRef<HTMLVideoElement>;
  @ViewChild('sceneRef') sceneEl?: ElementRef<HTMLElement>;

  constructor(public auth: AuthService, private cdr: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    this.tryPlay();
    window.addEventListener('scroll', this.onScroll, { passive: true });
    this.syncProgress();
  }

  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.onScroll);
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

  private syncProgress(): void {
    const el = this.sceneEl?.nativeElement;
    if (!el) return;
    const total = el.offsetHeight - window.innerHeight;
    const p = total <= 0 ? 0 : Math.min(1, Math.max(0, -el.getBoundingClientRect().top / total));
    if (Math.abs(p - this.progress) < 0.008) return;
    this.progress = p;
    this.cdr.detectChanges();
  }
}
