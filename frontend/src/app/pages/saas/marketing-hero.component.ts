import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';

export interface HeroStat {
  value: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-marketing-hero',
  standalone: true,
  imports: [RouterLink],
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
      --mk-accent: var(--brand);
      --mk-accent-deep: var(--brand-deep);
      --mk-accent-soft: oklch(0.94 0.03 190);
    }

    :host(.theme-divorcio), .theme-divorcio {
      --mk-accent: var(--brand);
      --mk-accent-deep: var(--brand-deep);
      --mk-accent-soft: oklch(0.94 0.03 190);
    }

    .mk-hero {
      overflow-x: clip;
      background: var(--paper);
      padding: clamp(2rem, 5vw, 4rem) 0 clamp(2.5rem, 4vw, 3.5rem);
      font-family: var(--font-body);
    }

    .theme-divorcio.mk-hero {
      background: linear-gradient(180deg, var(--paper) 0%, white 100%);
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
      color: var(--ink);
      margin: 0 0 1rem;
    }

    .mk-accent { color: var(--mk-accent); }

    .mk-sub {
      font-size: clamp(1.05rem, 2vw, 1.25rem);
      font-weight: 700;
      color: var(--ink);
      margin: 0 0 0.85rem;
    }

    .mk-lede {
      font-size: 1.05rem;
      line-height: 1.65;
      color: var(--ink-soft);
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
      color: var(--ink);
      border: 1.5px solid var(--line);
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
      color: var(--ink);
    }

    .mk-stat span {
      font-size: 0.82rem;
      color: var(--ink-soft);
    }

    .mk-collage {
      position: relative;
      min-height: 420px;
      overflow: hidden;
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
      .mk-collage { min-height: 280px; max-width: min(420px, 100%); margin: 0 auto; }
    }

    @media (max-width: 480px) {
      .mk-hero-copy h1 { font-size: clamp(1.85rem, 9vw, 2.5rem); }
      .mk-collage { min-height: 200px; }
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
