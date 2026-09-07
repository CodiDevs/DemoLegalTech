import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { LEGALSTATION_CATALOG, ProductCatalogEntry, getProductQuestionnairePath, setActiveProduct } from '../../shared/product-sites.data';
import { MarketingHeroComponent } from './marketing-hero.component';
import { LandingIconComponent } from './landing-icon.component';
import { ElasticGalleryComponent, GalleryItem } from './elastic-gallery.component';
import { LandingStatisticsComponent, StatItem } from './landing-statistics.component';
import {
  LEGALSTATION_CLIENT_GALLERY,
  LEGALSTATION_ENTERPRISE,
  LEGALSTATION_HERO_IMAGES,
  LEGALSTATION_HERO_STATS,
  LEGALSTATION_PLANS,
  LEGALSTATION_PLATFORM_STATS,
  LEGALSTATION_WORKFLOW,
} from './saas-landing.data';
import { IconComponent } from '../../shared/icon.component';

@Component({
  selector: 'app-saas-landing',
  standalone: true,
  imports: [RouterLink, MarketingHeroComponent, LandingIconComponent, ElasticGalleryComponent, LandingStatisticsComponent, IconComponent],
  template: `
    <div class="landing-page legalstation-landing">
      <app-marketing-hero
        theme="legalstation"
        titleLine1="Tus trámites legales,"
        titleHighlight="sin filas ni papeleo."
        subtitle="Divorcios, traslados de vehículo y trámites de inmuebles, resueltos en línea y al mismo costo que hacerlos en persona. Pagas solo por el trámite que necesitas."
        primaryCta="Ver qué puedo tramitar"
        primaryFragment="catalogo"
        [showSecondary]="false"
        [stats]="heroStats"
        [images]="heroImages"
      />

      <section class="lp-trust lp-shell">
        <p>Más de <strong>120 firmas demo</strong> confían en LegalStation para su operación legal diaria</p>
      </section>

      <section class="lp-tools-band">
        <div class="lp-shell">
          <div class="lp-tool-grid">
            @for (p of products; track p.id; let i = $index) {
              <button
                type="button"
                class="lp-tool-card"
                [class.active]="activeSlide === i"
                (click)="selectSlide(i)"
              >
                <span class="lp-tool-icon" [style.background]="p.iconBg">
                  <app-landing-icon [name]="p.icon" [size]="20" />
                </span>
                <span class="lp-tool-text">
                  <strong>{{ p.name }}</strong>
                  <span>{{ p.pillDesc }}</span>
                </span>
              </button>
            }
          </div>

          <div class="lp-action">
            <p class="lp-action-label">Míralo en acción</p>
            <div class="lp-carousel-layout">
              <div class="lp-carousel-copy">
                <h3>{{ activeProduct.name }}</h3>
                <p>{{ activeProduct.showcaseDesc }}</p>
                @if (activeProduct.live && activeProduct.route) {
                  <button type="button" class="lp-link" (click)="openProduct(activeProduct)">
                    Explorar {{ activeProduct.name }}
                    <app-icon name="arrow-right" [size]="16" />
                  </button>
                } @else {
                  <button type="button" class="lp-link" (click)="notify(activeProduct.name)">
                    Solicitar acceso demo
                    <app-icon name="arrow-right" [size]="16" />
                  </button>
                }
              </div>
              <div class="lp-carousel-panel">
                <div class="lp-carousel-frame" [class.is-fading]="carouselFading">
                  <img
                    [src]="activeProduct.showcaseImage"
                    [alt]="'Vista demo de ' + activeProduct.name"
                    loading="lazy"
                  />
                </div>
                <div class="lp-carousel-dots" role="tablist" aria-label="Seleccionar producto">
                  @for (p of products; track p.id; let i = $index) {
                    <button
                      type="button"
                      role="tab"
                      [attr.aria-selected]="activeSlide === i"
                      [class.on]="activeSlide === i"
                      (click)="selectSlide(i)"
                      [attr.aria-label]="'Ver ' + p.name"
                    ></button>
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="lp-section soft" id="catalogo">
        <div class="lp-shell">
          <div class="lp-section-head">
            <p class="lp-eyebrow">Catálogo LegalStation</p>
            <h2>Un ecosistema legal. <span class="lp-highlight">Seis productos conectados.</span></h2>
            <p>
              Cada vertical tiene intake, expediente y operador — sin pegar sistemas distintos.
              Divorcio360, Traslado360 y BienRaiz360 están en vivo; el resto se presenta como producto terminado en esta demo.
            </p>
          </div>
          <div class="lp-product-grid">
            @for (p of products; track p.id) {
              <article class="lp-product-card lp-lift">
                @if (p.live) {
                  <span class="lp-badge-live">En vivo</span>
                } @else {
                  <span class="lp-badge-soon">Próximamente</span>
                }
                <img [src]="p.image" [alt]="p.name" loading="lazy" />
                <div class="lp-product-body">
                  <h3>{{ p.name }}</h3>
                  <p>{{ p.tagline }}</p>
                  <ul class="lp-list-tt">
                    @for (f of p.features; track f) { <li>{{ f }}</li> }
                  </ul>
                  @if (p.live && p.route) {
                    <button type="button" class="lp-btn lp-btn-primary" (click)="openProduct(p)">
                      Abrir producto
                      <app-icon name="arrow-right" [size]="16" />
                    </button>
                  } @else {
                    <button type="button" class="lp-btn lp-btn-outline" (click)="notify(p.name)">
                      Explorar demo
                      <app-icon name="arrow-right" [size]="16" />
                    </button>
                  }
                </div>
              </article>
            }
          </div>
        </div>
      </section>

      <section class="lp-section">
        <div class="lp-shell">
          <div class="lp-section-head">
            <p class="lp-eyebrow">¿Por qué LegalStation?</p>
            <h2>Tecnología legal construida para <span class="lp-highlight">acceso y escala.</span></h2>
            <p>
              LegalStation es la capa SaaS sobre la que CodiDevs despliega verticales como Divorcio360 —
              mismo login, mismos roles, misma trazabilidad.
            </p>
          </div>
          <div class="lp-values">
            <article class="lp-value">
              <h3>Construido con abogados</h3>
              <p>Flujos diseñados con operadores reales: revisión documental, minuta, firma y notaría.</p>
            </article>
            <article class="lp-value">
              <h3>Licencia para bufetes</h3>
              <p>Suscripción mensual solo para operadores y firmas — no para el cliente final de cada trámite.</p>
            </article>
            <article class="lp-value">
              <h3>Hecho para crecer</h3>
              <p>Multi-tenant, multi-producto y LOPDP demo — sin la complejidad de un ERP legal legacy.</p>
            </article>
          </div>
        </div>
      </section>

      <section class="lp-section soft">
        <div class="lp-shell">
          <div class="lp-section-head">
            <p class="lp-eyebrow">Un flujo conectado</p>
            <h2>Del intake al cierre en <span class="lp-highlight">un solo lugar.</span></h2>
            <p>Ciclo completo del expediente integrado en la plataforma.</p>
          </div>
          <div class="lp-steps">
            @for (s of workflow; track s.title) {
              <article class="lp-step">
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
            <p class="lp-eyebrow">Operación diaria</p>
            <h2>Simplifica la carga legal <span class="lp-highlight">de rutina.</span></h2>
            <p>Seis capacidades integradas en una plataforma fácil de usar.</p>
          </div>
          <app-landing-statistics theme="legalstation" [stats]="platformStats" />
        </div>
      </section>

      <section class="lp-section soft">
        <div class="lp-shell">
          <div class="lp-section-head">
            <p class="lp-eyebrow">En la práctica</p>
            <h2>Confianza de <span class="lp-highlight">firmas en la región.</span></h2>
          </div>
          <app-elastic-gallery theme="legalstation" [items]="clientGallery" defaultActive="02" />
        </div>
      </section>

      <section class="lp-section" id="precios">
        <div class="lp-shell">
          <div class="lp-section-head">
            <p class="lp-eyebrow">Licencia para bufetes</p>
            <h2>Opera LegalStation con <span class="lp-highlight">tu firma.</span></h2>
            <p>Solo abogados y operadores — el cliente final paga honorarios por trámite, no esta licencia.</p>
          </div>
          <div class="lp-pricing">
            @for (plan of plans; track plan.name) {
              <article class="lp-plan lp-lift" [class.featured]="plan.featured">
                @if (plan.featured) { <span class="lp-plan-tag">Más popular</span> }
                <h3>{{ plan.name }}</h3>
                <p class="lp-muted">{{ plan.audience }}</p>
                <div class="lp-plan-price">\${{ plan.price }}<small>/mes</small></div>
                <ul>
                  @for (item of plan.items; track item) { <li>{{ item }}</li> }
                </ul>
                <a routerLink="/auth" [queryParams]="{ returnUrl: '/fase2/billing' }" class="lp-btn lp-btn-outline">Ver licencia demo</a>
              </article>
            }
          </div>
        </div>
      </section>

      <section class="lp-section soft">
        <div class="lp-shell lp-enterprise">
          <div class="lp-enterprise-copy">
            <p class="lp-eyebrow">Organizaciones grandes</p>
            <h2>Despliegues a medida, <span class="lp-highlight">en tus términos.</span></h2>
            <p>
              Para firmas con requisitos estrictos de datos: instancia dedicada, SSO y SLA demo.
            </p>
            <button type="button" class="lp-btn lp-btn-primary" (click)="notify('Enterprise')">Solicitar consulta</button>
          </div>
          <div class="lp-enterprise-grid">
            @for (e of enterprise; track e.title) {
              <article class="lp-value">
                <h3>{{ e.title }}</h3>
                <p>{{ e.desc }}</p>
              </article>
            }
          </div>
        </div>
      </section>

      @if (toast) { <div class="lp-toast" role="status" aria-live="polite">{{ toast }}</div> }
    </div>
  `,
  styles: [`
    .lp-link {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
    }

    .lp-enterprise {
      display: grid;
      grid-template-columns: 1fr 1.2fr;
      gap: 2rem;
      align-items: start;
    }

    .lp-enterprise-copy h2 {
      font-size: clamp(1.5rem, 3vw, 2rem);
      margin: 0.5rem 0 0.85rem;
    }

    .lp-enterprise-copy p { margin-bottom: 1.25rem; }

    .lp-enterprise-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    @media (max-width: 960px) {
      .lp-enterprise { grid-template-columns: 1fr; }
    }

    .lp-tools-band {
      background: var(--lp-bg-soft);
      padding: 2.5rem 0 4rem;
      border-top: 1px solid var(--lp-border);
    }

    .lp-carousel-frame.is-fading img {
      opacity: 0.4;
    }

    .lp-carousel-frame img {
      transition: opacity 0.45s var(--ease-out, ease);
    }
  `]
})
export class SaasLandingComponent {
  toast = '';
  activeSlide = 0;
  carouselFading = false;
  platformStats: StatItem[] = LEGALSTATION_PLATFORM_STATS;
  clientGallery: GalleryItem[] = LEGALSTATION_CLIENT_GALLERY;
  heroStats = LEGALSTATION_HERO_STATS;
  heroImages = LEGALSTATION_HERO_IMAGES;
  products = LEGALSTATION_CATALOG;
  workflow = LEGALSTATION_WORKFLOW;
  plans = LEGALSTATION_PLANS;
  enterprise = LEGALSTATION_ENTERPRISE;

  get activeProduct(): ProductCatalogEntry {
    return this.products[this.activeSlide];
  }

  constructor(public auth: AuthService, private router: Router) {}

  /** Siempre al cuestionario del producto seleccionado. */
  openProduct(p: ProductCatalogEntry): void {
    if (!p.route) return;
    setActiveProduct(p.id);
    void this.router.navigateByUrl(getProductQuestionnairePath(p.id));
  }

  selectSlide(i: number): void {
    if (i === this.activeSlide) return;
    this.carouselFading = true;
    setTimeout(() => {
      this.activeSlide = i;
      this.carouselFading = false;
    }, 220);
  }

  notify(name: string): void {
    this.toast = `${name}: demo registrada — te avisaremos (simulación)`;
    setTimeout(() => this.toast = '', 3500);
  }
}
