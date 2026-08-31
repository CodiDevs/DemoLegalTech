import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { MarketingHeroComponent } from './marketing-hero.component';
import { LandingIconComponent, LandingIconName } from './landing-icon.component';
import { ElasticGalleryComponent, GalleryItem } from './elastic-gallery.component';
import { LandingStatisticsComponent, StatItem } from './landing-statistics.component';
import { LEGALSTATION_CLIENT_GALLERY, LEGALSTATION_PLATFORM_STATS } from './saas-landing.data';

interface Product {
  id: string;
  name: string;
  tagline: string;
  image: string;
  showcaseImage: string;
  showcaseDesc: string;
  features: string[];
  route: string;
  icon: LandingIconName;
  pillDesc: string;
}

@Component({
  selector: 'app-saas-landing',
  standalone: true,
  imports: [RouterLink, MarketingHeroComponent, LandingIconComponent, ElasticGalleryComponent, LandingStatisticsComponent],
  styleUrls: ['../../../styles/landing-shared.scss'],
  template: `
    <div class="landing-page legalstation-landing">
      <app-marketing-hero
        theme="legalstation"
        titleLine1="Ahorra horas con"
        titleHighlight="tecnología legal multi-trámite."
        subtitle="Servicios jurídicos al mismo costo, sin filas ni trámites."
        lede="LegalStation conecta intake, expediente, firma y operador en una sola plataforma. El cliente final paga por trámite, sin membresía; tu bufete opera con licencia mensual."
        primaryCta="Comenzar"
        primaryRoute="/cuestionario"
        [showSecondary]="false"
        [images]="heroImages"
      />

      <section class="lp-trust lp-shell">
        <p>Divorcio360 está en vivo. Traslado360 y BienRaiz360 tienen sitio y cuestionario en esta demo.</p>
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
                <span class="lp-tool-icon">
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
                <a [routerLink]="activeProduct.route" class="lp-link">Ver {{ activeProduct.name }}</a>
              </div>
              <div class="lp-carousel-panel">
                <div class="lp-carousel-controls">
                  <button type="button" class="lp-carousel-nav" (click)="prevSlide()" aria-label="Anterior">‹</button>
                  <button type="button" class="lp-carousel-nav" (click)="nextSlide()" aria-label="Siguiente">›</button>
                </div>
                <div class="lp-carousel-frame">
                  <img
                    [src]="activeProduct.showcaseImage"
                    [alt]="'Vista demo de ' + activeProduct.name"
                    loading="lazy"
                  />
                </div>
                <div class="lp-carousel-dots">
                  @for (p of products; track p.id; let i = $index) {
                    <button
                      type="button"
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
            <h2>Tres trámites <span class="lp-highlight">en esta demo.</span></h2>
            <p>
              Divorcio360, Traslado360 y BienRaiz360. El resto de la plataforma (firma, CRM, LOPDP, agenda notarial) no se vende como producto aparte aquí.
            </p>
          </div>
          <div class="lp-product-grid">
            @for (p of products; track p.id) {
            <article class="lp-product-card lp-lift">
                <img [src]="p.image" [alt]="p.name" loading="lazy" />
                <div class="lp-product-body">
                  <h3>{{ p.name }}</h3>
                  <p>{{ p.tagline }}</p>
                  <ul class="lp-list-tt">
                    @for (f of p.features; track f) { <li>{{ f }}</li> }
                  </ul>
                  <a [routerLink]="p.route" class="lp-btn lp-btn-outline">Ver producto</a>
                </div>
              </article>
            }
          </div>
        </div>
      </section>

      <section class="lp-section">
        <div class="lp-shell">
          <div class="lp-section-head">
            <h2>Tecnología legal construida para <span class="lp-highlight">acceso y escala.</span></h2>
            <p>
              LegalStation es la capa SaaS sobre la que CodiDevs despliega verticales como Divorcio360: mismo login, mismos roles, misma trazabilidad.
            </p>
          </div>
          <div class="lp-values">
            <article class="lp-value lp-lift">
              <h3>Construido con abogados</h3>
              <p>Flujos diseñados con operadores reales: revisión documental, minuta, firma y notaría.</p>
            </article>
            <article class="lp-value lp-lift">
              <h3>Licencia para bufetes</h3>
              <p>Suscripción mensual solo para operadores y firmas, no para el cliente final de cada trámite.</p>
            </article>
            <article class="lp-value lp-lift">
              <h3>Hecho para crecer</h3>
              <p>Multi-tenant, multi-producto y LOPDP demo, sin la complejidad de un ERP legal legacy.</p>
            </article>
          </div>
        </div>
      </section>

      <section class="lp-section soft">
        <div class="lp-shell">
          <div class="lp-section-head">
            <h2>Del intake al cierre en <span class="lp-highlight">un solo lugar.</span></h2>
            <p>Ciclo completo del expediente integrado en la plataforma.</p>
          </div>
          <div class="lp-steps">
            @for (s of workflow; track s.title) {
              <article class="lp-step lp-lift">
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
            <h2>Simplifica la carga legal <span class="lp-highlight">de rutina.</span></h2>
            <p>Trazabilidad, honorarios claros y roles de demostración en un solo login.</p>
          </div>
          <app-landing-statistics theme="legalstation" [stats]="platformStats" />
        </div>
      </section>

      <section class="lp-section soft">
        <div class="lp-shell">
          <div class="lp-section-head">
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
            <p>Solo abogados y operadores. El cliente final paga honorarios por trámite, no esta licencia.</p>
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
            <h2>Despliegues a medida, <span class="lp-highlight">en tus términos.</span></h2>
            <p>
              Para firmas con requisitos estrictos de datos: instancia dedicada, SSO y SLA demo.
            </p>
            <button type="button" class="lp-btn lp-btn-primary" (click)="notify('Enterprise')">Solicitar consulta</button>
          </div>
          <div class="lp-enterprise-grid">
            @for (e of enterprise; track e.title) {
              <article class="lp-value lp-lift">
                <h3>{{ e.title }}</h3>
                <p>{{ e.desc }}</p>
              </article>
            }
          </div>
        </div>
      </section>

      <section class="lp-cta-panel">
        <div class="lp-shell">
          <div class="lp-cta-inner">
            <h2>Empieza por Divorcio360, el producto en vivo.</h2>
            <p>Cuestionario, pago, expediente y firma en un solo flujo demo.</p>
            <div class="lp-cta-buttons">
              <a routerLink="/cuestionario" class="lp-cta-primary">Comenzar</a>
              <a routerLink="/auth" class="lp-cta-ghost">Ingresar</a>
            </div>
          </div>
        </div>
      </section>

      @if (toast) { <div class="lp-toast">{{ toast }}</div> }
    </div>
  `,
  styles: [`
    .legalstation-landing {
      --lp-accent: var(--brand);
      --lp-accent-deep: var(--brand-deep);
      --lp-accent-soft: oklch(0.94 0.03 190);
    }

    .lp-muted { color: var(--lp-ink-muted); font-size: 0.9rem; margin: 0; }

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
  `]
})
export class SaasLandingComponent {
  toast = '';
  activeSlide = 0;
  platformStats: StatItem[] = LEGALSTATION_PLATFORM_STATS;
  clientGallery: GalleryItem[] = LEGALSTATION_CLIENT_GALLERY;

  heroImages: [string, string, string] = [
    'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=80',
  ];

  get activeProduct(): Product {
    return this.products[this.activeSlide];
  }

  products: Product[] = [
    {
      id: 'divorcio360', name: 'Divorcio360', icon: 'scale',
      pillDesc: 'Contratos de divorcio notarial',
      showcaseDesc: 'Intake con cuestionario inteligente, pago, expediente de 10 estados y firma. El flujo completo en vivo.',
      showcaseImage: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1400&q=80',
      tagline: 'Mutuo consentimiento con intake, pago y expediente trazable.',
      image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=80',
      features: ['Cuestionario inteligente', '10 estados de trámite', 'Firma y minuta mock'],
      route: '/productos/divorcio360',
    },
    {
      id: 'traslado360', name: 'Traslado360', icon: 'file',
      pillDesc: 'Traslado de vehículo',
      showcaseDesc: 'Mutuo acuerdo, pago único, documentos y reunión virtual con notario. Traslado de dominio vehicular demo.',
      showcaseImage: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=1400&q=80',
      tagline: 'Traslado vehicular con acuerdo mutuo y firma notarial.',
      image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=800&q=80',
      features: ['Sitio producto completo', 'Pago único mock', 'Consulta + notaría virtual'],
      route: '/productos/traslado360',
    },
    {
      id: 'bienraiz360', name: 'BienRaiz360', icon: 'building',
      pillDesc: 'Traslado de inmueble',
      showcaseDesc: 'Traslado de dominio de terreno o inmueble. Ambas partes de acuerdo, reunión virtual con notario.',
      showcaseImage: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1400&q=80',
      tagline: 'Traslado de bienes inmuebles con comparecencia digital.',
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80',
      features: ['Sitio producto completo', 'Honorario único', 'Expediente trazable'],
      route: '/productos/bienraiz360',
    },
  ];

  workflow = [
    { n: 1, title: 'Intake', desc: 'Cuestionario y clasificación automática del caso.' },
    { n: 2, title: 'Expediente', desc: 'Documentos, pago y mensajes en un solo lugar.' },
    { n: 3, title: 'Revisión', desc: 'Operador aprueba, genera minuta y comunica al cliente.' },
    { n: 4, title: 'Firma', desc: 'Firma electrónica con evidencia y notificaciones.' },
    { n: 5, title: 'Cierre', desc: 'Notaría, registro y archivo con auditoría completa.' },
  ];

  plans = [
    { name: 'Starter', audience: 'Bufete pequeño, licencia operador', price: 99, items: ['1 producto activo', '3 usuarios operador', 'Link a clientes incluido', '15% comisión demo por venta'], featured: false },
    { name: 'Professional', audience: 'Equipo en crecimiento', price: 249, items: ['3 productos live', '10 usuarios', 'SLA y notificaciones', 'Link personalizado + comisión', 'SATJE sync demo'], featured: true },
    { name: 'Enterprise', audience: 'Multi-sede', price: 599, items: ['Productos ilimitados', 'SSO demo', 'Comisión negociable', 'White-label ready'], featured: false },
  ];

  enterprise = [
    { title: 'Aislamiento completo', desc: 'Infraestructura dedicada: tus datos separados del resto de tenants demo.' },
    { title: 'En tus términos', desc: 'On-prem o nube privada con SSO, logs y control administrativo.' },
    { title: 'White-label', desc: 'Marca y flujos adaptados a tu firma o grupo legal.' },
    { title: 'SLA y partnership', desc: 'Colaboración con tu equipo de TI y soporte prioritario demo.' },
  ];

  constructor(public auth: AuthService) {}

  selectSlide(i: number): void {
    this.activeSlide = i;
  }

  prevSlide(): void {
    this.activeSlide = (this.activeSlide - 1 + this.products.length) % this.products.length;
  }

  nextSlide(): void {
    this.activeSlide = (this.activeSlide + 1) % this.products.length;
  }

  notify(name: string): void {
    this.toast = `${name}: demo registrada — te avisaremos (simulación)`;
    setTimeout(() => this.toast = '', 3500);
  }
}
