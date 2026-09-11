import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import {
  PRODUCT_SITES,
  getMarketingPrimaryAction,
  setActiveProduct,
} from '../../shared/product-sites.data';
import { HeroScrollVideoPinRevealComponent } from './hero-scroll-video-pin-reveal.component';
import { LandingStatisticsComponent } from './landing-statistics.component';
import { ElasticGalleryComponent } from './elastic-gallery.component';
import { IconComponent, IconName } from '../../shared/icon.component';
import { CaseProgressComponent } from '../../shared/case-progress.component';
import { buildMarketingProgressStages, CaseProgressStage } from '../../shared/case-progress.model';

const DIVORCIO_FLOW_ICONS: IconName[] = [
  'clipboard',
  'check-circle',
  'folder',
  'video',
  'signature',
  'building',
];

@Component({
  selector: 'app-divorcio-landing',
  standalone: true,
  imports: [
    RouterLink,
    HeroScrollVideoPinRevealComponent,
    LandingStatisticsComponent,
    ElasticGalleryComponent,
    IconComponent,
    CaseProgressComponent,
  ],
  template: `
    <div class="landing-page divorcio-landing">
      <nav class="lp-shell lp-crumb" aria-label="Ruta de navegación">
        <a routerLink="/">LegalStation</a>
        <app-icon name="chevron-right" [size]="14" />
        <span>Divorcio360</span>
      </nav>

      <app-hero-scroll-video-pin-reveal />

      <section class="lp-section lp-chapter lp-reveal" id="sistema">
        <div class="lp-shell">
          <div class="lp-chapter-head lp-section-head">
            <p class="lp-eyebrow">El sistema</p>
            <h2>Un expediente compartido. <span class="lp-highlight">Acciones visibles.</span></h2>
            <p>Cliente y operador trabajan sobre la misma información, sin herramientas sueltas.</p>
          </div>
          <div class="lp-values lp-values--rules dv-principles">
            @for (v of site.values ?? []; track v.title; let i = $index) {
              <article class="lp-value" [style.--i]="i">
                <h3>{{ v.title }}</h3>
                <p>{{ v.desc }}</p>
              </article>
            }
          </div>
        </div>
      </section>

      <section class="lp-section soft lp-chapter lp-reveal" id="flujo">
        <div class="lp-shell">
          <div class="lp-chapter-head lp-section-head">
            <p class="lp-eyebrow">El flujo</p>
            <h2>Seis pasos. <span class="lp-highlight">Un recorrido.</span></h2>
            <p>De la calificación a la notaría, sin saltar entre sistemas.</p>
          </div>
          <app-case-progress
            variant="marketing"
            layout="auto"
            [interactive]="true"
            [stages]="journeyStages"
            [focusIndex]="journeyFocus"
            ariaLabel="Recorrido Divorcio360"
            (stageSelect)="onJourneySelect($event.index)"
          />
        </div>
      </section>

      <section class="lp-section lp-chapter lp-reveal" id="capacidades">
        <div class="lp-shell">
          <div class="lp-chapter-head lp-section-head">
            <p class="lp-eyebrow">La prueba</p>
            <h2>Capacidades del recorrido</h2>
            <p>Lo esencial del producto, medido en etapas, expediente y honorario de referencia.</p>
          </div>
          <app-landing-statistics theme="divorcio" variant="band" [stats]="site.stats" />
        </div>
      </section>

      <section class="lp-section soft lp-chapter lp-reveal" id="en-accion">
        <div class="lp-shell">
          <div class="lp-chapter-head lp-section-head">
            <p class="lp-eyebrow">En acción</p>
            <h2>El producto en pantalla</h2>
            <p>Cuestionario y expediente: el mismo idioma visual que el trámite real.</p>
          </div>
          <app-elastic-gallery theme="divorcio" [items]="site.gallery" defaultActive="01" />
        </div>
      </section>

      <section class="lp-section lp-chapter lp-reveal" id="precios">
        <div class="lp-shell">
          <div class="lp-section-head">
            <p class="lp-eyebrow">Precio</p>
            <h2>Un valor orientativo, <span class="lp-highlight">sin suscripción.</span></h2>
            <p>Honorario de referencia para el recorrido completo. No incluye gastos notariales.</p>
          </div>
          <div class="lp-pricing">
            @for (plan of site.plans; track plan.name) {
              <article class="lp-plan lp-lift" [class.featured]="plan.featured">
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
            Si el resultado no encaja en este recorrido, no se genera un cobro automático.
          </p>
        </div>
      </section>

      <section class="lp-cta-panel lp-reveal">
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

    .divorcio-landing .lp-section {
      padding-block: clamp(4.5rem, 9vw, 7.5rem);
    }

    .divorcio-landing .lp-section-head {
      margin-inline: 0;
      margin-bottom: clamp(2rem, 4vw, 3.25rem);
      text-align: left;
      max-width: 40rem;
    }

    .divorcio-landing .lp-eyebrow {
      margin-bottom: 0.85rem;
      font-size: 0.78rem;
      font-weight: 650;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--primary);
    }

    .divorcio-landing .lp-section-head h2 {
      font-family: var(--font-sans);
      font-size: clamp(2rem, 4.4vw, 3.35rem);
      font-weight: 650;
      line-height: 1.1;
      letter-spacing: -0.035em;
      max-width: 16ch;
    }

    .divorcio-landing .lp-section-head p {
      max-width: 34rem;
      font-size: clamp(1.02rem, 1.6vw, 1.15rem);
      line-height: 1.65;
      color: var(--text-secondary);
    }

    .divorcio-landing .lp-pricing {
      grid-template-columns: minmax(0, 28rem);
      max-width: 28rem;
      margin-inline: 0;
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

    .divorcio-landing .lp-value h3 {
      font-family: var(--font-sans);
      font-size: 1.35rem;
      font-weight: 650;
      letter-spacing: -0.02em;
    }

    .dv-principles {
      grid-template-columns: minmax(0, 1.35fr) minmax(0, 0.82fr) minmax(0, 0.82fr);
    }

    .dv-principles .lp-value:first-child {
      padding-right: 2rem;
    }

    .divorcio-landing .lp-cta-inner {
      background: var(--primary-hover);
      text-align: left;
      padding-block: clamp(3rem, 6vw, 4.5rem);
    }

    .divorcio-landing .lp-cta-inner h2 {
      font-family: var(--font-sans);
      font-size: clamp(1.85rem, 3.5vw, 2.75rem);
      font-weight: 650;
      letter-spacing: -0.03em;
      max-width: 16ch;
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
      margin-top: var(--space-4);
    }

    #sistema,
    #flujo,
    #capacidades,
    #en-accion,
    #precios {
      scroll-margin-top: 5.5rem;
    }

    @media (max-width: 960px) {
      .dv-principles { grid-template-columns: 1fr; }
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
        padding-block: var(--space-8);
      }

      .divorcio-landing .lp-section-head h2 {
        max-width: none;
      }
    }
  `]
})
export class DivorcioLandingComponent implements OnInit, AfterViewInit, OnDestroy {
  readonly site = PRODUCT_SITES['divorcio360'];
  journeyFocus = 0;
  journeyStages: CaseProgressStage[] = [];
  private io?: IntersectionObserver;

  constructor(public auth: AuthService, private host: ElementRef<HTMLElement>) {}

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
    this.rebuildJourney();
  }

  ngAfterViewInit(): void {
    const nodes = this.host.nativeElement.querySelectorAll('.lp-reveal');
    this.io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('is-in-view');
          this.io?.unobserve(entry.target);
        }
        if (![...nodes].some((el) => !el.classList.contains('is-in-view'))) {
          this.io?.disconnect();
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.12 },
    );
    nodes.forEach((el) => this.io!.observe(el));
  }

  ngOnDestroy(): void {
    this.io?.disconnect();
  }

  onJourneySelect(index: number): void {
    this.journeyFocus = index;
    this.rebuildJourney();
  }

  private rebuildJourney(): void {
    const steps = this.site.workflow.map((step, index) => ({
      id: String(step.n),
      n: step.n,
      title: step.title,
      desc: step.desc,
      icon: DIVORCIO_FLOW_ICONS[index] || ('flag' as IconName),
      screen: step.screen,
    }));
    this.journeyStages = buildMarketingProgressStages(steps, this.journeyFocus);
  }
}
