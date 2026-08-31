import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { LandingIconComponent, LandingIconName } from './landing-icon.component';

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
  imports: [RouterLink, LandingIconComponent],
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
              <a href="#" class="btn btn-primary btn-lg" (click)="scrollToSection($event, primaryFragment)">
                {{ primaryCta }}
              </a>
            } @else {
              <a [routerLink]="primaryLink" class="btn btn-primary btn-lg">{{ primaryCta }}</a>
            }

            @if (secondaryAction) {
              <a
                [routerLink]="secondaryAction.route"
                [queryParams]="secondaryAction.query"
                class="btn btn-secondary btn-lg"
              >{{ secondaryAction.label }}</a>
            }
          </div>

          @if (visibleStats.length) {
            <ul class="mk-stats">
              @for (s of visibleStats; track s.label) {
                <li>
                  <app-landing-icon [name]="s.icon" [size]="16" />
                  <strong>{{ s.value }}</strong>
                  <span>{{ s.label }}</span>
                </li>
              }
            </ul>
          }
        </div>

        <div class="mk-collage" aria-hidden="true">
          <img class="img-a" [src]="images[0]" alt="" loading="eager" />
          <img class="img-b" [src]="images[1]" alt="" loading="lazy" />
          <img class="img-c" [src]="images[2]" alt="" loading="lazy" />
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
      background: var(--bg);
      padding-block: var(--space-8) var(--space-7);
    }

    .mk-hero-shell {
      display: grid;
      grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
      gap: var(--space-7);
      align-items: center;
      max-width: var(--container-wide);
      margin-inline: auto;
      padding-inline: var(--container-pad);
    }

    .mk-hero-copy h1 {
      font-size: clamp(2.25rem, 4.5vw, 3.5rem);
      font-weight: 700;
      line-height: 1.06;
      letter-spacing: -0.035em;
      max-width: 22ch;
      margin: 0 0 var(--space-4);
    }

    .mk-accent { color: var(--mk-accent); }

    .mk-lede {
      max-width: 46ch;
      margin: 0 0 var(--space-6);
      font-size: var(--text-lg);
      line-height: var(--leading-normal);
      color: var(--text-secondary);
    }

    .mk-cta {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-3);
      margin-bottom: var(--space-6);
    }

    /* Métricas de apoyo: presentes pero deliberadamente discretas */
    .mk-stats {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-3) var(--space-5);
      list-style: none;
      margin: 0;
      padding: var(--space-4) 0 0;
      border-top: 1px solid var(--border);
    }

    .mk-stats li {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      font-size: var(--text-sm);
    }

    .mk-stats app-landing-icon { color: var(--mk-accent); }
    .mk-stats strong { font-weight: 650; color: var(--text); }
    .mk-stats span { color: var(--text-muted); }

    .mk-collage {
      position: relative;
      min-height: 26rem;
    }

    .mk-collage img {
      position: absolute;
      object-fit: cover;
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-lg);
    }

    .img-a { width: 58%; height: 52%; top: 8%; left: 0; z-index: 1; }
    .img-b { width: 48%; height: 44%; top: 0; right: 0; z-index: 2; }
    .img-c { width: 62%; height: 48%; bottom: 0; right: 8%; z-index: 3; }

    @media (max-width: 960px) {
      .mk-hero-shell { grid-template-columns: 1fr; }

      .mk-collage {
        order: -1;
        min-height: 18rem;
        max-width: 26rem;
        margin-inline: auto;
      }
    }

    @media (max-width: 560px) {
      .mk-hero { padding-block: var(--space-6); }
      .mk-collage { min-height: 14rem; }
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
  @Input() stats: HeroStat[] = [];
  @Input() images: [string, string, string] = ['', '', ''];

  constructor(public auth: AuthService) {}

  private get role(): string | undefined {
    return this.auth.user()?.role;
  }

  get useFragment(): boolean {
    return !!this.primaryFragment && this.role !== 'abogado';
  }

  get primaryLink(): string {
    return this.role === 'abogado' ? '/abogado' : this.primaryRoute;
  }

  get secondaryAction(): HeroAction | null {
    if (this.role === 'abogado') {
      return { label: 'Ver Fase 2', route: '/fase2/admin' };
    }
    if (!this.showSecondary) return null;

    if (this.secondaryCta === 'Volver a Divorcio360') {
      return { label: this.secondaryCta, route: '/productos/divorcio360' };
    }
    if (this.role === 'cliente') {
      return { label: 'Mi expediente', route: '/cliente' };
    }
    if (this.auth.isLoggedIn) return null;

    return { label: this.secondaryCta, route: '/auth', query: this.secondaryAuthQuery };
  }

  /** Tres métricas como máximo: más de eso compite con el mensaje principal. */
  get visibleStats(): HeroStat[] {
    return this.stats.slice(0, 3);
  }

  scrollToSection(event: Event, id: string): void {
    event.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
