import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  Input,
  ViewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { IconComponent } from '../../shared/icon.component';
import { DemoCaseWindowComponent } from '../../shared/demo/demo-case-window.component';
import {
  LEGALSTATION_CATALOG,
  ProductCatalogEntry,
  getProductQuestionnairePath,
  setActiveProduct,
} from '../../shared/product-sites.data';

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
              {{ titleLine1 || 'Cuestionario, documentos, firma y ya estás divorciado!' }}
            </h1>

            <p class="mk-slogan">
              {{ lede || 'Nunca fué tan fácil y rápido divorciarte!' }}
            </p>

            <div class="mk-cta">
              @if (pickService) {
                <div class="mk-cta-pick">
                  <button
                    type="button"
                    class="btn btn-primary btn-lg mk-cta-btn"
                    [attr.aria-expanded]="servicesOpen"
                    aria-haspopup="menu"
                    aria-controls="mk-service-menu"
                    (click)="toggleServices()"
                  >
                    <span>{{ primaryCta }}</span>
                    <span class="mk-cta-chevron" [class.is-open]="servicesOpen" aria-hidden="true">
                      <app-icon name="chevron-down" [size]="16" />
                    </span>
                  </button>
                  @if (servicesOpen) {
                    <ul id="mk-service-menu" class="mk-service-menu" role="menu">
                      @for (p of liveServices; track p.id) {
                        <li role="none">
                          <a
                            role="menuitem"
                            class="mk-service-item"
                            [routerLink]="questionnairePath(p.id)"
                            (click)="pickServiceId(p.id)"
                          >
                            <strong>{{ p.name }}</strong>
                            <span>{{ p.pillDesc }}</span>
                          </a>
                        </li>
                      }
                    </ul>
                  }
                </div>
              } @else if (useFragment) {
                <a
                  class="btn btn-primary btn-lg mk-cta-btn"
                  [href]="'#' + primaryFragment"
                  (click)="scrollToSection($event, primaryFragment)"
                >
                  <span>{{ primaryCta }}</span>
                  <app-icon name="arrow-right" [size]="16" />
                </a>
              } @else {
                <a class="btn btn-primary btn-lg mk-cta-btn" [routerLink]="primaryRoute">
                  <span>{{ primaryCta }}</span>
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
            <app-demo-case-window mode="overview" />
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; }

    .mk-hero.mk-sticky {
      position: relative;
      isolation: isolate;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100svh;
      padding-block: clamp(4rem, 10vh, 7rem);
      overflow: visible;
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

    .mk-content.mk-wordmark-mask {
      position: relative;
      z-index: 4;
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

    .mk-cta-pick {
      position: relative;
    }

    .mk-cta-chevron {
      display: inline-flex;
      transition: transform 180ms var(--ease-out);
    }

    .mk-cta-chevron.is-open {
      transform: rotate(180deg);
    }

    .mk-service-menu {
      position: absolute;
      top: calc(100% + 0.5rem);
      left: 0;
      z-index: var(--z-dropdown);
      min-width: min(20.5rem, 78vw);
      margin: 0;
      padding: var(--space-2);
      list-style: none;
      background: var(--surface);
      color: var(--text);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-md);
      animation: mk-in 320ms var(--ease-out);
    }

    .mk-service-item {
      display: grid;
      gap: 0.15rem;
      padding: 0.7rem 0.85rem;
      border-radius: var(--radius-md);
      color: var(--text);
      text-decoration: none;
    }

    .mk-service-item:hover,
    .mk-service-item:focus-visible {
      background: var(--primary-subtle);
      outline: none;
    }

    .mk-service-item strong {
      font-weight: 650;
    }

    .mk-service-item span {
      font-size: var(--text-sm);
      color: var(--text-secondary);
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
      transition:
        background-color var(--dur-fast, 180ms) var(--ease-out),
        border-color var(--dur-fast, 180ms) var(--ease-out),
        color var(--dur-fast, 180ms) var(--ease-out),
        transform var(--dur-fast, 180ms) var(--ease-out);
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
      .mk-cta .btn,
      .mk-cta-pick {
        width: 100%;
      }
      .mk-cta .btn {
        justify-content: center;
      }
      .mk-service-menu {
        right: 0;
        min-width: 0;
        width: 100%;
      }
    }
  `],
})
export class MarketingHeroComponent implements AfterViewInit {
  @Input() primaryCta = 'Iniciar un trámite';
  @Input() secondaryCta = 'Cómo funciona';
  @Input() primaryRoute = '/cuestionario';
  @Input() primaryFragment = '';
  @Input() pickService = true;
  @Input() showSecondary = false;
  @Input() secondaryAuthQuery: Record<string, string> = {};

  @Input() titleLine1 = '';
  @Input() lede = '';

  readonly videoSrc = '/videos/legalstation-hero.mp4';
  readonly posterSrc = '/videos/legalstation-hero-poster.jpg';

  useStaticFallback = false;
  servicesOpen = false;
  readonly liveServices: ProductCatalogEntry[] = LEGALSTATION_CATALOG.filter((p) => p.live);
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

  /* El CTA primario del hero es la accion de la pagina en todos los roles. Antes forzaba el
     atajo del rol, y en el inicio un cliente veia "Mis expedientes" aca y "Mi expediente" en
     el secundario: dos botones casi iguales, los dos a /cliente y ninguno al formulario. El
     atajo del rol vive en la barra (shell), que es donde corresponde. */

  get secondaryAction(): HeroAction | null {
    if (!this.showSecondary) return null;
    if (this.role === 'abogado') {
      return { label: 'Ver Fase 2', route: '/abogado/fase2/admin' };
    }
    if (this.secondaryCta === 'Volver a Divorcio360') {
      return { label: this.secondaryCta, route: '/productos/divorcio360' };
    }
    if (this.role === 'cliente') {
      return { label: 'Mis expedientes', route: '/cliente' };
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

  questionnairePath(id: string): string {
    return getProductQuestionnairePath(id);
  }

  toggleServices(): void {
    this.servicesOpen = !this.servicesOpen;
  }

  pickServiceId(id: string): void {
    setActiveProduct(id);
    this.servicesOpen = false;
  }

  @HostListener('document:click', ['$event'])
  closeServices(event: MouseEvent): void {
    if (!this.servicesOpen) return;
    const node = event.target as HTMLElement | null;
    if (node?.closest('.mk-cta-pick')) return;
    this.servicesOpen = false;
  }

  @HostListener('document:keydown.escape')
  closeServicesOnEscape(): void {
    this.servicesOpen = false;
  }
}
