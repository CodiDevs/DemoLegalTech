import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { getProductSite, ProductSiteConfig, setActiveProduct, CANONICAL_SLOGAN, getProductQuestionnairePath } from '../../shared/product-sites.data';
import { AuthService } from '../../core/auth.service';
import { ElasticGalleryComponent } from '../saas/elastic-gallery.component';
import { LandingStatisticsComponent } from '../saas/landing-statistics.component';
import { IconComponent, IconName } from '../../shared/icon.component';
import { CaseProgressComponent } from '../../shared/case-progress.component';
import { buildMarketingProgressStages, CaseProgressStage } from '../../shared/case-progress.model';

const PRODUCT_FLOW_ICONS: IconName[] = [
  'clipboard',
  'credit-card',
  'folder',
  'video',
  'signature',
  'building',
];

@Component({
  selector: 'app-product-landing',
  standalone: true,
  imports: [
    RouterLink,
    ElasticGalleryComponent,
    LandingStatisticsComponent,
    IconComponent,
    CaseProgressComponent,
  ],
  template: `
    @if (site) {
      <div
        class="landing-page ps-landing"
        [class.traslado360-landing]="site.slug === 'traslado360'"
        [class.bienraiz360-landing]="site.slug === 'bienraiz360'"
        [style.--lp-accent]="site.accent"
        [style.--lp-accent-deep]="site.accentDeep"
        [style.--lp-accent-soft]="site.accentSoft"
        [style.--lp-accent-ink]="site.accentDeep"
        [style.--lp-bg]="site.bg"
        [style.--lp-bg-soft]="site.bgSoft"
      >
        <nav class="lp-shell lp-crumb crumb-row" aria-label="Dónde estás">
          <a routerLink="/">LegalStation</a>
          <app-icon name="chevron-right" [size]="14" />
          <span aria-current="page">{{ site.name }}</span>
        </nav>

        <div class="lp-slogan-band">
          <p class="lp-shell">{{ slogan }}</p>
        </div>

        <section class="ps-hero lp-section soft">
          <div class="lp-shell ps-hero-grid">
            <div class="ps-hero-copy">
              <p class="lp-eyebrow">{{ site.name }} · pagas una sola vez</p>
              <h1>{{ site.heroTitle }} <span class="lp-highlight">{{ site.heroHighlight }}</span></h1>
              <p class="ps-lede">{{ site.heroLede }}</p>
              <span class="ps-badge">Un solo pago · sin cuotas mensuales</span>
              <div class="ps-cta-row">
                <a href="#" (click)="startEvaluation($event)" class="lp-btn lp-btn-primary">
                  Evaluar mi caso
                  <app-icon name="arrow-right" [size]="16" />
                </a>
                <a href="#flujo" class="lp-btn lp-btn-outline">Ver cómo funciona</a>
              </div>
            </div>
            <div class="ps-mock-ui">
              <div class="ps-mock-bar">
                <span></span><span></span><span></span>
                <strong>{{ site.name }} — expediente de ejemplo</strong>
              </div>
              <div class="ps-mock-body">
                @for (s of site.workflow.slice(0, 4); track s.n) {
                  <div class="ps-mock-step" [class.active]="s.n === 2">
                    <span class="ps-mock-num">{{ s.n }}</span>
                    <div>
                      <strong>{{ s.title }}</strong>
                      <small>{{ s.screen }}</small>
                    </div>
                  </div>
                }
              </div>
              <img [src]="site.heroImage" [alt]="site.name" class="ps-mock-bg" loading="lazy" />
            </div>
          </div>
        </section>

        <section class="lp-section" id="flujo">
          <div class="lp-shell">
            <div class="lp-section-head">
              <p class="lp-eyebrow">Así funciona</p>
              <h2>Seis pasos, <span class="lp-highlight">un solo expediente.</span></h2>
              <p>El mismo recorrido de LegalStation, adaptado a {{ site.name }}.</p>
            </div>
            <app-case-progress
              variant="marketing"
              layout="auto"
              [interactive]="true"
              [stages]="journeyStages"
              [focusIndex]="activeStep - 1"
              ariaLabel="Recorrido del trámite"
              (stageSelect)="onJourneySelect($event.index)"
            />
          </div>
        </section>

        <section class="lp-section soft">
          <div class="lp-shell">
            <div class="lp-section-head">
              <p class="lp-eyebrow">En números</p>
              <h2>Confianza <span class="lp-highlight">medible.</span></h2>
            </div>
            <app-landing-statistics theme="divorcio" [stats]="site.stats" />
          </div>
        </section>

        <section class="lp-section">
          <div class="lp-shell">
            <div class="lp-section-head">
              <p class="lp-eyebrow">Producto en acción</p>
              <h2>Pantallas reales <span class="lp-highlight">del trámite.</span></h2>
            </div>
            <app-elastic-gallery theme="divorcio" [items]="site.gallery" />
          </div>
        </section>

        <section class="lp-section soft">
          <div class="lp-shell">
            <div class="lp-testimonials">
              @for (t of site.testimonials; track t.author) {
                <blockquote class="ps-quote">
                  <p>"{{ t.quote }}"</p>
                  <footer>{{ t.author }} · {{ t.role }}</footer>
                </blockquote>
              }
            </div>
          </div>
        </section>

        <section class="lp-section" id="precios">
          <div class="lp-shell">
            <div class="lp-section-head">
              <p class="lp-eyebrow">Pagas una sola vez</p>
              <h2>Precios claros <span class="lp-highlight">sin cuotas mensuales.</span></h2>
              <p>Pagas un solo importe por tu trámite. La licencia LegalStation es solo para bufetes.</p>
            </div>
            <div class="lp-pricing">
              @for (plan of site.plans; track plan.name) {
                <article class="lp-plan lp-lift" [class.featured]="plan.featured">
                  <span class="lp-plan-tag" [class.is-spacer]="!plan.featured">Recomendado</span>
                  <h3>{{ plan.name }}</h3>
                  <p class="lp-muted">{{ plan.audience }}</p>
                  <div class="lp-plan-price">\${{ plan.price }}<small> pago único</small></div>
                  <ul>
                    @for (item of plan.items; track item) { <li>{{ item }}</li> }
                  </ul>
                  @if (plan.featured) {
                    <a href="#" (click)="startEvaluation($event)" class="lp-btn lp-btn-primary">Evaluar mi caso</a>
                  } @else {
                    <button type="button" class="lp-btn lp-btn-outline" disabled>Necesita revisión previa</button>
                  }
                </article>
              }
            </div>
          </div>
        </section>

        <section class="lp-cta-panel">
          <div class="lp-shell">
            <div class="lp-cta-inner">
              <p class="lp-cta-eyebrow">{{ site.name }} listo</p>
              <h2>{{ site.ctaTitle }}</h2>
              <p>Contestas el cuestionario en minutos, creas tu cuenta, haces un solo pago, subes tus documentos, hablas con tu abogado, firmas y cierras en la notaría.</p>
              <div class="lp-cta-buttons">
                <a href="#" (click)="startEvaluation($event)" class="lp-cta-primary">Evaluar mi caso</a>
                <a routerLink="/" class="lp-cta-ghost">Volver a LegalStation</a>
              </div>
            </div>
          </div>
        </section>
      </div>
    }
  `,
  styles: [`
    .ps-landing {
      overflow-x: hidden;
    }

    .crumb-row {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      flex-wrap: wrap;
    }

    .ps-badge {
      display: inline-block;
      margin-top: var(--space-3);
      font-size: var(--text-xs);
      font-weight: 700;
      letter-spacing: var(--tracking-wide);
      text-transform: uppercase;
      padding: var(--space-1) var(--space-2);
      border-radius: var(--radius-full);
      background: var(--lp-accent-soft);
      color: var(--lp-accent-deep);
    }

    .ps-hero-grid {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1.05fr);
      gap: clamp(var(--space-5), 4vw, var(--space-7));
      align-items: center;
    }

    .ps-hero-copy {
      min-width: 0;
    }

    .ps-hero-copy h1 {
      font-size: clamp(var(--text-2xl), 3.2vw, var(--text-4xl));
      margin: var(--space-2) 0;
      max-width: 16ch;
    }

    .ps-lede {
      color: var(--text-muted);
      line-height: var(--leading-normal);
      max-width: 38ch;
    }

    .ps-cta-row {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-3);
      margin-top: var(--space-5);
    }

    .ps-hero .ps-mock-ui {
      max-height: 420px;
    }

    .ps-timeline {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: var(--space-3);
    }

    .ps-timeline-item {
      text-align: left;
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
      padding: var(--space-4);
      background: var(--surface);
      cursor: pointer;
      font: inherit;
      display: grid;
      grid-template-columns: 2.5rem minmax(0, 1fr);
      gap: var(--space-3);
      align-items: start;
      width: 100%;
      min-width: 0;
      transition:
        border-color var(--dur-fast) var(--ease),
        box-shadow var(--dur-fast) var(--ease);
    }

    .ps-timeline-item.active,
    .ps-timeline-item:hover {
      border-color: var(--lp-accent);
      box-shadow: var(--shadow-md);
    }

    .ps-timeline-num {
      width: 2.25rem;
      height: 2.25rem;
      border-radius: var(--radius-full);
      display: grid;
      place-items: center;
      font-weight: 700;
      background: var(--lp-accent-soft);
      color: var(--lp-accent-deep);
    }

    .ps-timeline-item h3 {
      margin: 0 0 var(--space-1);
      font-size: var(--text-base);
    }

    .ps-timeline-item p {
      margin: 0;
      font-size: var(--text-sm);
      color: var(--text-muted);
      line-height: var(--leading-snug);
    }

    .ps-preview h3 {
      font-size: clamp(var(--text-lg), 2vw, var(--text-xl));
      margin: var(--space-1) 0 var(--space-2);
    }

    .ps-screen-tag {
      display: inline-block;
      margin-top: var(--space-1);
      font-size: var(--text-xs);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: var(--tracking-wide);
      color: var(--lp-accent-ink);
    }

    .ps-preview {
      margin-top: var(--space-5);
      padding: var(--space-5);
      border-radius: var(--radius-xl);
      background: var(--bg-subtle);
      border: 1px solid var(--border);
    }

    .lp-testimonials {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-4);
    }

    .ps-quote {
      margin: 0;
      padding: var(--space-5);
      border-radius: var(--radius-xl);
      background: var(--surface);
      border: 1px solid var(--border);
    }

    .ps-quote p {
      margin: 0 0 var(--space-3);
      font-style: italic;
      line-height: var(--leading-normal);
    }

    .ps-quote footer {
      font-size: var(--text-sm);
      color: var(--text-muted);
      font-weight: 600;
    }

    @media (max-width: 1024px) {
      .ps-timeline { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }

    @media (max-width: 900px) {
      .ps-hero-grid { grid-template-columns: 1fr; }
      .ps-mock-ui { max-height: none; }
      .lp-testimonials { grid-template-columns: 1fr; }
    }

    @media (max-width: 640px) {
      .ps-timeline { grid-template-columns: 1fr; }
      .ps-hero-copy h1 { max-width: none; }
      .ps-mock-bar strong { margin-left: 0; width: 100%; }
    }
  `],
})
export class ProductLandingComponent implements OnInit {
  site: ProductSiteConfig | null = null;
  activeStep = 1;
  journeyStages: CaseProgressStage[] = [];
  slogan = CANONICAL_SLOGAN;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public auth: AuthService,
  ) {}

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug') || '';
    if (slug === 'divorcio360') {
      void this.router.navigate(['/productos/divorcio360']);
      return;
    }
    this.site = getProductSite(slug);
    if (!this.site) {
      void this.router.navigate(['/']);
      return;
    }
    setActiveProduct(this.site.id);
    this.rebuildJourney();
  }

  onJourneySelect(index: number): void {
    this.activeStep = index + 1;
    this.rebuildJourney();
  }

  private rebuildJourney(): void {
    if (!this.site) {
      this.journeyStages = [];
      return;
    }
    const steps = this.site.workflow.map((step, index) => ({
      id: String(step.n),
      n: step.n,
      title: step.title,
      desc: step.desc,
      icon: PRODUCT_FLOW_ICONS[index] || ('flag' as IconName),
      screen: step.screen,
    }));
    this.journeyStages = buildMarketingProgressStages(steps, this.activeStep - 1);
  }

  startEvaluation(event: Event): void {
    event.preventDefault();
    if (!this.site) return;
    void this.router.navigateByUrl(getProductQuestionnairePath(this.site.slug));
  }
}
