import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { getProductSite, ProductSiteConfig, setActiveProduct, CANONICAL_SLOGAN, getProductQuestionnairePath } from '../../shared/product-sites.data';
import { AuthService } from '../../core/auth.service';
import { ElasticGalleryComponent } from '../saas/elastic-gallery.component';
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
              <h1>{{ site.heroTitle }} <span class="lp-highlight">{{ site.heroHighlight }}</span></h1>
              <p class="ps-lede">{{ site.heroLede }}</p>
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
                <strong>{{ site.name }}</strong>
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
              <h2>Seis pasos, <span class="lp-highlight">un solo expediente.</span></h2>
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
              <h2>Pantallas reales <span class="lp-highlight">del trámite.</span></h2>
            </div>
            <app-elastic-gallery theme="divorcio" [items]="site.gallery" />
          </div>
        </section>

        <section class="lp-section" id="precios">
          <div class="lp-shell">
            <div class="lp-section-head">
              <h2>Precios claros <span class="lp-highlight">sin cuotas mensuales.</span></h2>
            </div>
            <div class="lp-pricing">
              @for (plan of site.plans; track plan.name) {
                <article class="lp-plan lp-lift" [class.featured]="plan.featured">
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
              <h2>{{ site.ctaTitle }}</h2>
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
      min-width: 0;
    }

    .crumb-row {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      flex-wrap: wrap;
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
      max-width: 22ch;
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

    @media (max-width: 900px) {
      .ps-hero-grid { grid-template-columns: 1fr; }
      .ps-mock-ui { max-height: none; }
    }

    @media (max-width: 640px) {
      .ps-hero-copy h1 { max-width: none; }
      .ps-mock-bar strong { width: 100%; }
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
