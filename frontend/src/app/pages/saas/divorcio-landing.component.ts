import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import {
  PRODUCT_SITES,
  getMarketingPrimaryAction,
  setActiveProduct,
} from '../../shared/product-sites.data';
import { HeroScrollVideoPinRevealComponent } from './hero-scroll-video-pin-reveal.component';
import { LandingStatisticsComponent } from './landing-statistics.component';
import { IconComponent } from '../../shared/icon.component';

@Component({
  selector: 'app-divorcio-landing',
  standalone: true,
  imports: [RouterLink, HeroScrollVideoPinRevealComponent, LandingStatisticsComponent, IconComponent],
  template: `
    <div class="landing-page divorcio-landing">
      <nav class="lp-shell lp-crumb" aria-label="Ruta de navegación">
        <a routerLink="/">LegalStation</a>
        <app-icon name="chevron-right" [size]="14" />
        <span>Divorcio360</span>
      </nav>

      <app-hero-scroll-video-pin-reveal />

      <section class="lp-section soft" id="flujo">
        <div class="lp-shell">
          <div class="lp-section-head">
            <h2>Seis pasos conectados. <span class="lp-highlight">Un solo expediente.</span></h2>
            <p>Desde la calificación hasta la notaría, sin saltar entre herramientas.</p>
          </div>
          <div #stepsRoot class="lp-steps lp-steps--flow" [class.lp-steps-in]="stepsRevealed">
            @for (s of site.workflow; track s.title; let i = $index) {
              <article class="lp-step" [style.--lp-i]="i">
                <div class="lp-step-num">{{ s.n }}</div>
                <h3>{{ s.title }}</h3>
                <p>{{ s.desc }}</p>
              </article>
            }
          </div>
        </div>
      </section>

      <section class="lp-section">
        <div class="lp-shell">
          <div class="lp-section-head">
            <h2>Diseñado para <span class="lp-highlight">firmas y clientes.</span></h2>
          </div>
          <div class="lp-values lp-values--rules">
            @for (v of site.values ?? []; track v.title) {
              <article class="lp-value">
                <h3>{{ v.title }}</h3>
                <p>{{ v.desc }}</p>
              </article>
            }
          </div>
        </div>
      </section>

      <section class="lp-section soft" id="capacidades">
        <div class="lp-shell">
          <div class="lp-section-head">
            <h2>Qué muestra esta demostración</h2>
          </div>
          <app-landing-statistics theme="divorcio" variant="band" [stats]="site.stats" />
        </div>
      </section>

      <section class="lp-section soft" id="precios">
        <div class="lp-shell">
          <div class="lp-section-head">
            <h2>Un valor orientativo, sin suscripción</h2>
            <p>El monto mostrado pertenece a la demostración y no constituye una cotización.</p>
          </div>
          <div class="lp-pricing">
            @for (plan of site.plans; track plan.name) {
              <article class="lp-plan lp-lift" [class.featured]="plan.featured">
                @if (plan.featured) { <span class="lp-plan-tag">Más común</span> }
                <h3>{{ plan.name }}</h3>
                <p class="lp-muted">{{ plan.audience }}</p>
                @if (plan.price === 0) {
                  <div class="lp-plan-price">Sin costo</div>
                } @else {
                  <div class="lp-plan-price">\${{ plan.price }}<small>+</small></div>
                }
                <ul>
                  @for (item of plan.items; track item) { <li>{{ item }}</li> }
                </ul>
                <a [routerLink]="primaryAction.path" class="lp-btn lp-btn-primary">
                  {{ primaryAction.label }}
                </a>
              </article>
            }
          </div>
          <p class="lp-price-note">
            Si el resultado no encaja en este recorrido, la demostración no genera un cobro automático.
          </p>
        </div>
      </section>

      <section class="lp-cta-panel">
        <div class="lp-shell">
          <div class="lp-cta-inner">
            <h2>{{ ctaTitle }}</h2>
            <p>{{ ctaBody }}</p>
            <div class="lp-cta-buttons">
              <a [routerLink]="primaryAction.path" class="lp-cta-primary">
                {{ primaryAction.label }}
              </a>
              <a routerLink="/" class="lp-cta-ghost">Volver a LegalStation</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .divorcio-landing {
      --lp-accent: var(--primary);
      --lp-accent-deep: var(--primary-hover);
      --lp-accent-soft: var(--primary-subtle);
      --lp-accent-ink: var(--primary-hover);
      --lp-bg: var(--bg);
      --lp-bg-soft: var(--bg-subtle);
      background: var(--lp-bg);
    }

    .divorcio-landing::before {
      content: none;
    }

    .divorcio-landing .lp-section-head {
      margin-inline: 0;
      text-align: left;
    }

    .divorcio-landing .lp-pricing {
      grid-template-columns: minmax(0, 44rem);
      justify-content: start;
    }

    .divorcio-landing .lp-plan,
    .divorcio-landing .lp-cta-inner {
      border-radius: var(--radius-lg);
      box-shadow: none;
    }

    .divorcio-landing .lp-plan.featured {
      outline: 0;
      border-color: var(--primary-border);
    }

    .divorcio-landing .lp-lift:hover {
      transform: none;
      box-shadow: none;
      border-color: var(--primary-border);
    }

    .divorcio-landing .lp-steps--flow .lp-step::after {
      background: var(--lp-border);
    }

    .divorcio-landing .lp-cta-inner {
      background: var(--primary-hover);
      text-align: left;
    }

    .divorcio-landing .lp-cta-inner::before,
    .divorcio-landing .lp-cta-inner::after {
      display: none;
    }

    .divorcio-landing .lp-cta-buttons {
      justify-content: flex-start;
    }

    .lp-price-note {
      color: var(--text-muted);
      font-size: var(--text-sm);
    }

    #flujo,
    #capacidades,
    #precios {
      scroll-margin-top: 5.5rem;
    }

    @media (max-width: 720px) {
      .divorcio-landing .lp-steps--flow .lp-step {
        display: grid;
        grid-template-columns: 2rem 1fr;
        column-gap: var(--space-3);
        align-items: start;
      }

      .divorcio-landing .lp-step-num {
        grid-row: 1 / span 2;
        margin: 0;
      }

      .divorcio-landing .lp-section {
        padding-block: var(--space-7);
      }
    }
  `]
})
export class DivorcioLandingComponent implements OnInit, AfterViewInit, OnDestroy {
  readonly site = PRODUCT_SITES['divorcio360'];

  @ViewChild('stepsRoot') stepsRoot?: ElementRef<HTMLElement>;
  stepsRevealed = false;
  private stepsObserver?: IntersectionObserver;

  constructor(public auth: AuthService) {}

  get primaryAction() {
    return getMarketingPrimaryAction(this.auth.user()?.role ?? null, 'divorcio360');
  }

  get ctaTitle(): string {
    if (this.auth.isLoggedIn && this.auth.user()?.role === 'cliente') return 'Tu expediente sigue abierto';
    if (this.auth.isLoggedIn) return 'Sigue los casos desde el panel';
    return this.site.ctaTitle;
  }

  get ctaBody(): string {
    if (this.auth.isLoggedIn && this.auth.user()?.role === 'cliente') {
      return 'Revisa estados, documentos y mensajes en el mismo seguimiento que ve tu operador.';
    }
    if (this.auth.isLoggedIn) {
      return 'Bandeja, documentos y firma documental: el mismo expediente que ve el cliente.';
    }
    return 'Responde el cuestionario en minutos. Si calificas, continúas con registro, pago y expediente digital.';
  }

  ngOnInit(): void {
    setActiveProduct('divorcio360');
  }

  ngAfterViewInit(): void {
    const el = this.stepsRoot?.nativeElement;
    const reduce = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !el || typeof IntersectionObserver === 'undefined') {
      this.stepsRevealed = true;
      return;
    }

    this.stepsObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          this.stepsRevealed = true;
          this.stepsObserver?.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    this.stepsObserver.observe(el);
  }

  ngOnDestroy(): void {
    this.stepsObserver?.disconnect();
  }
}
