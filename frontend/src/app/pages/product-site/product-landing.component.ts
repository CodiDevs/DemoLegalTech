import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  getProductSite,
  ProductSiteConfig,
  setActiveProduct,
  getMarketingPrimaryAction,
} from '../../shared/product-sites.data';
import { AuthService } from '../../core/auth.service';
import { IconComponent } from '../../shared/icon.component';
import { CinematicSceneComponent } from '../../shared/motion/cinematic-scene.component';
import { DemoCaseWindowComponent, DemoCaseMode } from '../../shared/demo/demo-case-window.component';

const FLOW_MODES: DemoCaseMode[] = ['overview', 'payment', 'documents', 'signature'];

@Component({
  selector: 'app-product-landing',
  standalone: true,
  imports: [
    RouterLink,
    IconComponent,
    CinematicSceneComponent,
    DemoCaseWindowComponent,
  ],
  template: `
    @if (site) {
      <div class="landing-page product-landing">
        <nav class="lp-shell lp-crumb" aria-label="Ruta de navegación">
          <a routerLink="/">LegalStation</a>
          <app-icon name="chevron-right" [size]="14" />
          <span>{{ site.name }}</span>
        </nav>

        <app-cinematic-scene sceneId="hero" [act]="1" theme="cream">
          <div class="pl-hero">
            <div class="pl-hero-copy">
              <h1>{{ headline }}</h1>
              <p class="cine-lede">{{ site.heroLede }}</p>
              <a [routerLink]="primaryAction.path" class="lp-btn lp-btn-primary">
                {{ primaryAction.label }}
              </a>
            </div>
            <div class="pl-hero-folio">
              <app-demo-case-window mode="overview" />
            </div>
          </div>
        </app-cinematic-scene>

        <app-cinematic-scene sceneId="flujo" [act]="2" theme="cream">
          <h2 class="cine-title">Cuestionario, pago, documentos y firma.</h2>
          <div class="ls-journey">
            <div class="pl-flow-switch">
              @for (step of site.workflow; track step.n; let i = $index) {
                @if (i < 4) {
                  <button type="button" class="lp-btn lp-btn-outline" (click)="journeyFocus = i">
                    {{ step.screen }}
                  </button>
                }
              }
            </div>
            <div class="ls-journey-preview">
              <app-demo-case-window [mode]="flowMode" [activeStep]="journeyFocus + 1" />
            </div>
          </div>
        </app-cinematic-scene>

        <app-cinematic-scene sceneId="precios" [act]="2" theme="cream">
          <div class="dv-price-stage">
            <p class="amount">\${{ site.price }}</p>
            <h2 class="cine-title">{{ ctaTitle }}</h2>
            <p class="cine-lede">{{ ctaBody }} No incluye gastos notariales.</p>
            <a [routerLink]="primaryAction.path" class="lp-btn lp-btn-primary lp-cta-primary">
              {{ primaryAction.label }}
            </a>
            <a routerLink="/" class="lp-cta-ghost">Volver a LegalStation</a>
          </div>
        </app-cinematic-scene>
      </div>
    }
  `,
  styles: [`
    .product-landing { background: var(--bg); }

    .pl-hero {
      display: grid;
      grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
      gap: clamp(2rem, 5vw, 4rem);
      align-items: center;
    }

    .pl-hero-copy h1 {
      margin: 0 0 var(--space-4);
      font-family: var(--font-display);
      font-size: clamp(2.4rem, 5vw, 3.8rem);
      font-weight: 600;
      letter-spacing: -0.035em;
      line-height: 1.06;
      text-wrap: balance;
      max-width: 14ch;
    }

    .pl-hero-copy .cine-lede {
      margin-bottom: var(--space-5);
    }

    .pl-hero-folio {
      width: 100%;
      max-width: 30rem;
      margin-inline: auto;
    }

    .pl-flow-switch {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin: 0 0 1.5rem;
    }

    #hero, #flujo, #precios { scroll-margin-top: 5.5rem; }

    @media (max-width: 900px) {
      .pl-hero {
        grid-template-columns: 1fr;
        gap: var(--space-6);
      }

      .pl-hero-copy h1 { max-width: none; }
    }
  `],
})
export class ProductLandingComponent implements OnInit {
  site: ProductSiteConfig | null = null;
  journeyFocus = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public auth: AuthService,
  ) {}

  get headline(): string {
    if (!this.site) return '';
    return `${this.site.heroTitle} ${this.site.heroHighlight}`.trim();
  }

  get primaryAction() {
    return getMarketingPrimaryAction(this.auth.user()?.role ?? null, this.site?.id || 'traslado360');
  }

  get flowMode(): DemoCaseMode {
    return FLOW_MODES[Math.min(this.journeyFocus, FLOW_MODES.length - 1)];
  }

  get ctaTitle(): string {
    if (this.auth.isLoggedIn && this.auth.user()?.role === 'cliente') return 'Tu expediente sigue abierto';
    if (this.auth.isLoggedIn) return 'Sigue los casos desde el panel';
    return this.site?.ctaTitle || '';
  }

  get ctaBody(): string {
    if (this.auth.isLoggedIn && this.auth.user()?.role === 'cliente') {
      return 'Revisa estados, documentos y mensajes en el mismo seguimiento que ve tu operador.';
    }
    if (this.auth.isLoggedIn) {
      return 'Bandeja, documentos y firma documental: el mismo expediente que ve el cliente.';
    }
    return 'Responde el cuestionario de ejemplo. Si calificas, continúas con registro, pago y expediente digital.';
  }

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
}
