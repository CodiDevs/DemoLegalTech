import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { IconComponent } from '../../shared/icon.component';
import { LandingIconName } from './landing-icon.component';

export interface HeroStat {
  value: string;
  label: string;
  icon: LandingIconName;
}

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
    <section class="mk-hero" [class.theme-divorcio]="theme === 'divorcio'">
      <div class="mk-hero-shell">
        <div class="mk-hero-copy">
          <h1>
            {{ titleLine1 }}
            <span class="mk-accent">{{ titleHighlight }}</span>
          </h1>

          <p class="mk-lede">{{ subtitle }}</p>

          <div class="mk-cta">
            @if (useFragment) {
              <a
                class="btn btn-primary btn-lg mk-cta-btn"
                [href]="'#' + primaryFragment"
                (click)="scrollToSection($event, primaryFragment)"
              >
                <span>{{ primaryLabel }}</span>
                <span class="mk-cta-chip" aria-hidden="true">
                  <app-icon name="arrow-right" [size]="16" />
                </span>
              </a>
            } @else {
              <a class="btn btn-primary btn-lg mk-cta-btn" [routerLink]="primaryLink">
                <span>{{ primaryLabel }}</span>
                <span class="mk-cta-chip" aria-hidden="true">
                  <app-icon name="arrow-right" [size]="16" />
                </span>
              </a>
            }

            @if (secondaryAction) {
              <a
                [routerLink]="secondaryAction.route"
                [queryParams]="secondaryAction.query"
                class="btn btn-secondary btn-lg"
              >{{ secondaryAction.label }}</a>
            }
          </div>
        </div>

        <div class="mk-visual">
          @if (images[0]) {
            <div class="mk-bezel">
              <img [src]="images[0]" alt="Trámite en línea LegalStation" loading="eager" />
            </div>
          }
        </div>
      </div>
    </section>
  `,
  styles: [`
    :host {
      display: block;
      --mk-accent: var(--primary);
      --mk-accent-soft: var(--primary-subtle);
    }

    :host(.theme-divorcio), .theme-divorcio {
      --mk-accent: var(--primary);
      --mk-accent-soft: var(--primary-subtle);
    }

    .mk-hero {
      display: grid;
      align-items: center;
      min-height: min(88dvh, 54rem);
      background: var(--bg);
      padding-block: var(--space-8) var(--space-9);
    }

    .mk-hero-shell {
      display: grid;
      grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
      gap: var(--space-8);
      align-items: center;
      max-width: var(--container-wide);
      margin-inline: auto;
      padding-inline: var(--container-pad);
    }

    .mk-hero-copy h1 {
      font-size: clamp(2.75rem, 6vw, 4.65rem);
      font-weight: 600;
      line-height: 0.98;
      letter-spacing: -0.04em;
      max-width: 11ch;
      margin: 0 0 var(--space-5);
      text-wrap: balance;
    }

    .mk-accent { color: var(--mk-accent); }

    .mk-lede {
      max-width: 38ch;
      margin: 0 0 var(--space-6);
      font-size: var(--text-lg);
      line-height: var(--leading-normal);
      color: var(--text-secondary);
    }

    .mk-cta {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-3);
    }

    .mk-cta a.btn {
      text-decoration: none;
      color: var(--btn-fg);
    }

    .mk-cta a.btn:hover {
      text-decoration: none;
      color: var(--btn-fg);
    }

    .mk-cta-btn {
      gap: var(--space-3);
      transition: transform 140ms var(--ease);
    }

    .mk-cta-btn:active {
      transform: scale(0.97);
    }

    .mk-cta-chip {
      display: grid;
      place-items: center;
      width: 1.75rem;
      height: 1.75rem;
      border-radius: var(--radius-md);
      background: color-mix(in srgb, #fff 18%, transparent);
      transition: transform var(--dur-base) var(--ease);
    }

    .mk-cta-btn:hover .mk-cta-chip {
      transform: translateX(3px);
    }

    .mk-bezel {
      padding: 0.4rem;
      border: 1px solid var(--border);
      border-radius: calc(var(--radius-lg) + 4px);
      background: var(--surface);
      box-shadow: var(--shadow-lg);
      overflow: hidden;
    }

    .mk-visual img {
      display: block;
      width: 100%;
      aspect-ratio: 4 / 5;
      object-fit: cover;
      border-radius: var(--radius-lg);
    }

    @media (prefers-reduced-motion: no-preference) {
      .mk-hero-copy h1 {
        animation: mk-in 0.52s var(--ease-out) both;
      }

      .mk-lede {
        animation: mk-in 0.48s var(--ease-out) 0.06s both;
      }

      .mk-cta {
        animation: mk-in 0.42s var(--ease-out) 0.12s both;
      }

      .mk-visual img {
        animation:
          mk-wipe 0.85s cubic-bezier(0.77, 0, 0.175, 1) both,
          mk-drift 28s var(--ease) 0.85s infinite alternate;
      }

      .mk-bezel:hover img {
        animation-play-state: paused;
      }
    }

    @keyframes mk-in {
      from { opacity: 0; transform: translateY(16px); }
      to { opacity: 1; transform: none; }
    }

    @keyframes mk-wipe {
      from { clip-path: inset(0 0 100% 0); }
      to { clip-path: inset(0 0 0 0); }
    }

    @keyframes mk-drift {
      from { transform: scale(1); }
      to { transform: scale(1.045); }
    }

    @media (prefers-reduced-motion: reduce) {
      .mk-hero-copy h1,
      .mk-lede,
      .mk-cta {
        animation: none;
      }

      .mk-cta-chip,
      .mk-cta-btn { transition: none; }
      .mk-cta-btn:hover .mk-cta-chip,
      .mk-cta-btn:active { transform: none; }
    }

    @media (max-width: 960px) {
      .mk-hero {
        min-height: 0;
        padding-block: var(--space-7);
      }

      .mk-hero-shell { grid-template-columns: 1fr; }
      .mk-visual { order: -1; max-width: 26rem; }
      .mk-hero-copy h1 { max-width: 14ch; }
    }

    @media (max-width: 560px) {
      .mk-hero { padding-block: var(--space-6); }
      .mk-visual img { aspect-ratio: 4 / 3; }
    }
  `],
})
export class MarketingHeroComponent {
  @Input() theme: 'legalstation' | 'divorcio' = 'legalstation';
  @Input() titleLine1 = 'Ahorra horas con';
  @Input() titleHighlight = 'tecnología legal multi-trámite.';
  @Input() subtitle = 'Herramientas enterprise. Precio SaaS accesible.';
  /** Se mantiene por compatibilidad: el hero solo muestra un párrafo para no sobrecargarlo. */
  @Input() lede = '';
  @Input() primaryCta = 'Comenzar';
  @Input() secondaryCta = 'Cómo funciona';
  @Input() primaryRoute = '/productos/divorcio360';
  @Input() primaryFragment = '';
  @Input() showSecondary = true;
  @Input() secondaryAuthQuery: Record<string, string> = { returnUrl: '/' };
  /** ponytail: unused — parent still binds [stats]; slice ships without fake KPIs. */
  @Input() stats: HeroStat[] = [];
  @Input() images: [string, string, string] = ['', '', ''];

  constructor(public auth: AuthService) {}

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
      return { label: 'Ver Fase 2', route: '/fase2/admin' };
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
    const reduce = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  }
}
