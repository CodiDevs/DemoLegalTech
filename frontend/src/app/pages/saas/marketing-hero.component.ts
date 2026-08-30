import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { LandingIconComponent, LandingIconName } from './landing-icon.component';

export interface HeroStat {
  value: string;
  label: string;
  icon: LandingIconName;
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
            {{ titleLine1 }}<br />
            <span class="mk-accent">{{ titleHighlight }}</span>
          </h1>
          <p class="mk-sub">{{ subtitle }}</p>
          <p class="mk-lede">{{ lede }}</p>
          <div class="mk-cta">
            @if (auth.user()?.role === 'abogado') {
              <a routerLink="/abogado" class="mk-btn mk-btn-primary">{{ primaryCta }}</a>
              <a routerLink="/fase2/admin" class="mk-btn mk-btn-outline">Ver Fase 2</a>
            } @else if (auth.user()?.role === 'cliente') {
              @if (primaryFragment) {
                <a href="#" class="mk-btn mk-btn-primary" (click)="scrollToSection($event, primaryFragment)">{{ primaryCta }}</a>
              } @else {
                <a [routerLink]="primaryRoute" class="mk-btn mk-btn-primary">{{ primaryCta }}</a>
              }
              @if (showSecondary && secondaryCta === 'Volver a Divorcio360') {
                <a routerLink="/productos/divorcio360" class="mk-btn mk-btn-outline">{{ secondaryCta }}</a>
              } @else if (showSecondary) {
                <a routerLink="/cliente" class="mk-btn mk-btn-outline">Mi expediente</a>
              }
            } @else if (auth.isLoggedIn) {
              @if (primaryFragment) {
                <a href="#" class="mk-btn mk-btn-primary" (click)="scrollToSection($event, primaryFragment)">{{ primaryCta }}</a>
              } @else {
                <a [routerLink]="primaryRoute" class="mk-btn mk-btn-primary">{{ primaryCta }}</a>
              }
              @if (showSecondary && secondaryCta === 'Volver a Divorcio360') {
                <a routerLink="/productos/divorcio360" class="mk-btn mk-btn-outline">{{ secondaryCta }}</a>
              }
            } @else {
              @if (primaryFragment) {
                <a href="#" class="mk-btn mk-btn-primary" (click)="scrollToSection($event, primaryFragment)">{{ primaryCta }}</a>
              } @else {
                <a [routerLink]="primaryRoute" class="mk-btn mk-btn-primary">{{ primaryCta }}</a>
              }
              @if (showSecondary) {
                <a routerLink="/auth" [queryParams]="secondaryAuthQuery" class="mk-btn mk-btn-outline">{{ secondaryCta }}</a>
              }
            }
          </div>
          <div class="mk-stats">
            @for (s of stats; track s.label) {
              <div class="mk-stat">
                <span class="mk-stat-icon"><app-landing-icon [name]="s.icon" [size]="18" /></span>
                <div>
                  <strong>{{ s.value }}</strong>
                  <span>{{ s.label }}</span>
                </div>
              </div>
            }
          </div>
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
      --mk-accent: #4455c4;
      --mk-accent-deep: #3344a8;
      --mk-accent-soft: #eef0fb;
    }

    :host(.theme-divorcio), .theme-divorcio {
      --mk-accent: #4a9e96;
      --mk-accent-deep: #3a827b;
      --mk-accent-soft: #e8f6f4;
    }

    .mk-hero {
      background: #fdfcfa;
      padding: clamp(2rem, 5vw, 4rem) 0 clamp(2.5rem, 4vw, 3.5rem);
      font-family: 'Inter', system-ui, sans-serif;
    }

    .theme-divorcio.mk-hero {
      background: linear-gradient(180deg, #f7fcfb 0%, #ffffff 100%);
    }

    .mk-hero-shell {
      max-width: 1320px;
      margin: 0 auto;
      padding: 0 clamp(1.25rem, 3vw, 2.5rem);
      display: grid;
      grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
      gap: clamp(2rem, 4vw, 3rem);
      align-items: center;
    }

    .mk-hero-copy h1 {
      font-size: clamp(2.5rem, 5.5vw, 4rem);
      font-weight: 700;
      line-height: 1.05;
      letter-spacing: -0.04em;
      color: #2a3148;
      margin: 0 0 1rem;
    }

    .mk-accent { color: var(--mk-accent); }

    .mk-sub {
      font-size: clamp(1.05rem, 2vw, 1.25rem);
      font-weight: 700;
      color: #2a3148;
      margin: 0 0 0.85rem;
    }

    .mk-lede {
      font-size: 1.05rem;
      line-height: 1.65;
      color: #5c6478;
      max-width: 52ch;
      margin: 0 0 1.75rem;
    }

    .mk-cta {
      display: flex;
      flex-wrap: wrap;
      gap: 0.85rem;
      margin-bottom: 2rem;
    }

    .mk-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.88rem 1.5rem;
      border-radius: 999px;
      font-weight: 600;
      font-size: 0.95rem;
      text-decoration: none;
      border: 0;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }

    .mk-btn:hover { transform: translateY(-1px); }

    .mk-btn-primary {
      background: var(--mk-accent);
      color: white;
      box-shadow: 0 10px 24px color-mix(in srgb, var(--mk-accent) 35%, transparent);
    }

    .mk-btn-outline {
      background: transparent;
      color: #2a3148;
      border: 1.5px solid #d8d2ca;
    }

    .mk-btn-outline:hover { border-color: var(--mk-accent); color: var(--mk-accent); }

    .mk-stats {
      display: flex;
      flex-wrap: wrap;
      gap: 1.25rem 1.75rem;
    }

    .mk-stat {
      display: flex;
      align-items: center;
      gap: 0.65rem;
    }

    .mk-stat-icon {
      width: 2.25rem;
      height: 2.25rem;
      border-radius: 999px;
      background: var(--mk-accent-soft);
      color: var(--mk-accent);
      display: grid;
      place-items: center;
    }

    .mk-stat strong {
      display: block;
      font-size: 1rem;
      color: #2a3148;
    }

    .mk-stat span {
      font-size: 0.82rem;
      color: #8a827a;
    }

    .mk-collage {
      position: relative;
      min-height: 420px;
    }

    .mk-collage img {
      position: absolute;
      object-fit: cover;
      border-radius: 18px;
      box-shadow: 0 20px 50px rgb(42 49 72 / 0.12);
    }

    .img-a {
      width: 58%;
      height: 52%;
      top: 8%;
      left: 0;
      z-index: 1;
    }

    .img-b {
      width: 48%;
      height: 44%;
      top: 0;
      right: 0;
      z-index: 2;
    }

    .img-c {
      width: 62%;
      height: 48%;
      bottom: 0;
      right: 8%;
      z-index: 3;
    }

    @media (max-width: 960px) {
      .mk-hero-shell { grid-template-columns: 1fr; }
      .mk-collage { min-height: 300px; max-width: 420px; margin: 0 auto; }
    }
  `],
})
export class MarketingHeroComponent {
  @Input() theme: 'legalstation' | 'divorcio' = 'legalstation';
  @Input() titleLine1 = 'Ahorra horas con';
  @Input() titleHighlight = 'tecnología legal multi-trámite.';
  @Input() subtitle = 'Herramientas enterprise. Precio SaaS accesible.';
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

  scrollToSection(event: Event, id: string): void {
    event.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
