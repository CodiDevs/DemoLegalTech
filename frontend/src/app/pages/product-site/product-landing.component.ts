import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { getProductSite, ProductSiteConfig, setActiveProduct, CANONICAL_SLOGAN } from '../../shared/product-sites.data';
import { ElasticGalleryComponent } from '../saas/elastic-gallery.component';
import { LandingStatisticsComponent } from '../saas/landing-statistics.component';

@Component({
  selector: 'app-product-landing',
  standalone: true,
  imports: [RouterLink, ElasticGalleryComponent, LandingStatisticsComponent],
  styleUrls: ['../../../styles/landing-shared.scss'],
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
        <p class="lp-shell lp-crumb">
          <a routerLink="/">LegalStation</a> › {{ site.name }}
        </p>

        <div class="lp-slogan-band">
          <p class="lp-shell">{{ slogan }}</p>
        </div>

        <section class="ps-hero lp-section soft">
          <div class="lp-shell ps-hero-grid">
            <div class="ps-hero-copy">
              <p class="lp-eyebrow">{{ site.name }} · pago único</p>
              <h1>{{ site.heroTitle }} <span class="lp-highlight">{{ site.heroHighlight }}</span></h1>
              <p class="ps-lede">{{ site.heroLede }}</p>
              <span class="ps-badge">Pago único · sin suscripción</span>
              <div class="ps-cta-row">
                <a [routerLink]="['/productos', site.slug, 'cuestionario']" class="lp-btn lp-btn-primary">Iniciar trámite →</a>
                <a href="#flujo" class="lp-btn lp-btn-outline">Ver flujo</a>
              </div>
            </div>
            <div class="ps-mock-ui lp-lift">
              <div class="ps-mock-bar">
                <span></span><span></span><span></span>
                <strong>{{ site.name }} — expediente demo</strong>
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
              <p class="lp-eyebrow">Flujo completo</p>
              <h2>Seis pasos conectados. <span class="lp-highlight">Un expediente.</span></h2>
              <p>Mismo recorrido que Divorcio360 — diseño y experiencia elevados para {{ site.name }}.</p>
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
              <h2>Pantallas reales <span class="lp-highlight">del flujo.</span></h2>
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
              <p class="lp-eyebrow">Pago por trámite</p>
              <h2>Honorarios claros <span class="lp-highlight">sin membresía.</span></h2>
              <p>Un solo cobro al cliente — la licencia LegalStation es solo para bufetes.</p>
            </div>
            <div class="lp-pricing">
              @for (plan of site.plans; track plan.name) {
                <article class="lp-plan lp-lift" [class.featured]="plan.featured">
                  @if (plan.featured) { <span class="lp-plan-tag">Recomendado</span> }
                  <h3>{{ plan.name }}</h3>
                  <p class="lp-muted">{{ plan.audience }}</p>
                  <div class="lp-plan-price">\${{ plan.price }}<small> único</small></div>
                  <ul>
                    @for (item of plan.items; track item) { <li>{{ item }}</li> }
                  </ul>
                  @if (plan.featured) {
                    <a [routerLink]="['/productos', site.slug, 'cuestionario']" class="lp-btn lp-btn-primary">Comenzar trámite</a>
                  } @else {
                    <button type="button" class="lp-btn lp-btn-outline" disabled>Evaluación previa</button>
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
              <p>Cuestionario en minutos → registro → pago único → documentos → consulta → firma → notaría.</p>
              <div class="lp-cta-buttons">
                <a [routerLink]="['/productos', site.slug, 'cuestionario']" class="lp-cta-primary">Iniciar cuestionario</a>
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

    .ps-badge {
      display: inline-block;
      margin-top: 0.75rem;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      padding: 0.25rem 0.6rem;
      border-radius: 999px;
      background: var(--lp-accent-soft);
      color: var(--lp-accent-deep);
    }

    .ps-hero-grid {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1.05fr);
      gap: clamp(1.5rem, 4vw, 2.5rem);
      align-items: center;
    }

    .ps-hero-copy {
      min-width: 0;
    }

    .ps-hero-copy h1 {
      font-size: clamp(1.65rem, 3.2vw, 2.45rem);
      margin: 0.5rem 0;
      max-width: 16ch;
    }

    .ps-lede {
      color: var(--lp-ink-muted);
      line-height: 1.6;
      max-width: 38ch;
    }

    .ps-cta-row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      margin-top: 1.25rem;
    }

    .ps-mock-ui {
      position: relative;
      border-radius: var(--lp-radius);
      overflow: hidden;
      border: 1px solid var(--lp-border);
      background: white;
      min-height: 280px;
      max-height: 420px;
      width: 100%;
      max-width: 100%;
    }

    .ps-mock-bar {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.65rem 1rem;
      background: var(--lp-bg-soft);
      border-bottom: 1px solid var(--lp-border);
      font-size: 0.78rem;
      flex-wrap: wrap;
    }

    .ps-mock-bar strong {
      margin-left: auto;
      font-size: 0.72rem;
      font-weight: 600;
      color: var(--lp-ink-muted);
    }

    .ps-mock-bar span {
      width: 0.55rem;
      height: 0.55rem;
      border-radius: 50%;
      background: var(--lp-accent);
      opacity: 0.45;
    }

    .ps-mock-body {
      position: relative;
      z-index: 1;
      padding: 1rem;
      display: grid;
      gap: 0.5rem;
    }

    .ps-mock-step {
      display: grid;
      grid-template-columns: 2rem 1fr;
      gap: 0.65rem;
      align-items: center;
      padding: 0.55rem 0.75rem;
      border-radius: var(--lp-radius-sm);
      background: rgb(255 255 255 / 0.92);
      border: 1px solid var(--lp-border);
    }

    .ps-mock-step.active {
      border-color: var(--lp-accent);
      box-shadow: 0 0 0 2px var(--lp-accent-soft);
    }

    .ps-mock-num {
      width: 1.75rem;
      height: 1.75rem;
      border-radius: 50%;
      display: grid;
      place-items: center;
      font-size: 0.75rem;
      font-weight: 700;
      background: var(--lp-accent-soft);
      color: var(--lp-accent-deep);
    }

    .ps-mock-step small { display: block; color: var(--lp-ink-muted); font-size: 0.75rem; }

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
      gap: 0.75rem;
    }

    .ps-timeline-item {
      text-align: left;
      border: 1px solid var(--lp-border);
      border-radius: var(--lp-radius);
      padding: 1rem;
      background: white;
      cursor: pointer;
      font: inherit;
      display: grid;
      grid-template-columns: 2.5rem minmax(0, 1fr);
      gap: 0.75rem;
      align-items: start;
      width: 100%;
      min-width: 0;
      transition: border-color 0.15s, box-shadow 0.15s;
    }

    .ps-timeline-item.active,
    .ps-timeline-item:hover {
      border-color: var(--lp-accent);
      box-shadow: var(--lp-shadow);
    }

    .ps-timeline-num {
      width: 2.25rem;
      height: 2.25rem;
      border-radius: 50%;
      display: grid;
      place-items: center;
      font-weight: 700;
      background: var(--lp-accent-soft);
      color: var(--lp-accent-deep);
    }

    .ps-timeline-item h3 { margin: 0 0 0.25rem; font-size: 0.95rem; }
    .ps-timeline-item p { margin: 0; font-size: 0.82rem; color: var(--lp-ink-muted); line-height: 1.45; }

    .ps-preview h3 {
      font-size: clamp(1.05rem, 2vw, 1.35rem);
      margin: 0.35rem 0 0.5rem;
    }

    .ps-screen-tag {
      display: inline-block;
      margin-top: 0.35rem;
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--lp-accent-deep);
    }

    .ps-preview {
      margin-top: 1.5rem;
      padding: 1.25rem 1.5rem;
      border-radius: var(--lp-radius);
      background: var(--lp-bg-soft);
      border: 1px solid var(--lp-border);
    }

    .lp-testimonials {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .ps-quote {
      margin: 0;
      padding: 1.25rem;
      border-radius: var(--lp-radius);
      background: white;
      border: 1px solid var(--lp-border);
    }

    .ps-quote p { margin: 0 0 0.75rem; font-style: italic; line-height: 1.55; }
    .ps-quote footer { font-size: 0.82rem; color: var(--lp-ink-muted); font-weight: 600; }

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

  constructor(private route: ActivatedRoute, private router: Router) {}

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
}
