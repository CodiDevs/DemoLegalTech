import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { getProductSite, ProductSiteConfig, setActiveProduct, CANONICAL_SLOGAN, getProductQuestionnairePath } from '../../shared/product-sites.data';
import { AuthService } from '../../core/auth.service';
import { ElasticGalleryComponent } from '../saas/elastic-gallery.component';
import { LandingStatisticsComponent } from '../saas/landing-statistics.component';
import { IconComponent } from '../../shared/icon.component';

@Component({
  selector: 'app-product-landing',
  standalone: true,
  imports: [RouterLink, ElasticGalleryComponent, LandingStatisticsComponent, IconComponent],
  template: `
    @if (site) {
      <div
        class="landing-page ps-landing"
        [class.traslado360-landing]="site.slug === 'traslado360'"
        [class.bienraiz360-landing]="site.slug === 'bienraiz360'"
        [style.--lp-accent]="site.accent"
        [style.--lp-accent-deep]="site.accentDeep"
        [style.--lp-accent-soft]="site.accentSoft"
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
            <div class="ps-mock-ui lp-lift">
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
              <p>El mismo recorrido de Divorcio360, adaptado a {{ site.name }}.</p>
            </div>
            <div class="ps-timeline">
              @for (s of site.workflow; track s.n) {
                <button type="button" class="ps-timeline-item lp-lift" [class.active]="activeStep === s.n" (click)="activeStep = s.n">
                  <span class="ps-timeline-num">{{ s.n }}</span>
                  <div>
                    <h3>{{ s.title }}</h3>
                    <p>{{ s.desc }}</p>
                    <span class="ps-screen-tag">{{ s.screen }}</span>
                  </div>
                </button>
              }
            </div>
            @if (previewStep) {
              <div class="ps-preview lp-lift">
                <p class="lp-eyebrow">Vista previa · paso {{ previewStep.n }}</p>
                <h3>{{ previewStep.title }} — {{ previewStep.screen }}</h3>
                <p>{{ previewStep.desc }}</p>
              </div>
            }
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
                <blockquote class="ps-quote lp-lift">
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
                  @if (plan.featured) { <span class="lp-plan-tag">Recomendado</span> }
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
              <h2>{{ site.slug === 'bienraiz360' ? '¿Listo para tu traslado de inmueble?' : '¿Listo para tu traslado?' }}</h2>
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

    .ps-mock-ui {
      position: relative;
      border-radius: var(--radius-xl);
      overflow: hidden;
      border: 1px solid var(--border);
      background: var(--surface);
      min-height: 280px;
      max-height: 420px;
      width: 100%;
      max-width: 100%;
    }

    .ps-mock-bar {
      display: flex;
      align-items: center;
      gap: var(--space-1);
      padding: var(--space-3) var(--space-4);
      background: var(--bg-subtle);
      border-bottom: 1px solid var(--border);
      font-size: var(--text-xs);
      flex-wrap: wrap;
    }

    .ps-mock-bar strong {
      margin-left: auto;
      font-size: var(--text-xs);
      font-weight: 600;
      color: var(--text-muted);
    }

    .ps-mock-bar span {
      width: 0.55rem;
      height: 0.55rem;
      border-radius: var(--radius-full);
      background: var(--lp-accent);
      opacity: 0.45;
    }

    .ps-mock-body {
      position: relative;
      z-index: 1;
      padding: var(--space-4);
      display: grid;
      gap: var(--space-2);
    }

    .ps-mock-step {
      display: grid;
      grid-template-columns: 2rem 1fr;
      gap: var(--space-3);
      align-items: center;
      padding: var(--space-2) var(--space-3);
      border-radius: var(--radius-lg);
      background: rgb(255 255 255 / 0.92);
      border: 1px solid var(--border);
    }

    .ps-mock-step.active {
      border-color: var(--lp-accent);
      box-shadow: 0 0 0 2px var(--lp-accent-soft);
    }

    .ps-mock-num {
      width: 1.75rem;
      height: 1.75rem;
      border-radius: var(--radius-full);
      display: grid;
      place-items: center;
      font-size: var(--text-xs);
      font-weight: 700;
      background: var(--lp-accent-soft);
      color: var(--lp-accent-deep);
    }

    .ps-mock-step small {
      display: block;
      color: var(--text-muted);
      font-size: var(--text-xs);
    }

    .ps-mock-bg {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      opacity: 0.12;
      pointer-events: none;
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
      color: var(--lp-accent-deep);
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
  }

  get previewStep() {
    return this.site?.workflow.find((w) => w.n === this.activeStep);
  }

  startEvaluation(event: Event): void {
    event.preventDefault();
    if (!this.site) return;
    void this.router.navigateByUrl(getProductQuestionnairePath(this.site.slug));
  }
}
