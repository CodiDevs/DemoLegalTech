import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { MarketingHeroComponent, HeroStat } from './marketing-hero.component';
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
  live: boolean;
  route?: string;
  icon: LandingIconName;
  pillDesc: string;
  iconBg: string;
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
        lede="LegalStation conecta intake, expediente, firma y operador en una sola plataforma. El cliente final paga por trámite — sin membresía; tu bufete opera con licencia mensual."
        primaryCta="Comenzar"
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
                  <a [routerLink]="activeProduct.route" class="lp-link">Explorar {{ activeProduct.name }} →</a>
                } @else {
                  <button type="button" class="lp-link" (click)="notify(activeProduct.name)">Solicitar acceso demo →</button>
                }
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
            <p class="lp-eyebrow">Catálogo LegalStation</p>
            <h2>Un ecosistema legal. <span class="lp-highlight">Seis productos conectados.</span></h2>
            <p>
              Cada vertical tiene intake, expediente y operador — sin pegar sistemas distintos.
              Divorcio360 está en vivo; el resto se presenta como producto terminado en esta demo.
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
                  @if (p.live && p.route) {
                    <a [routerLink]="p.route" class="lp-btn lp-btn-primary">Abrir producto →</a>
                  } @else {
                    <button type="button" class="lp-btn lp-btn-outline" (click)="notify(p.name)">Explorar demo →</button>
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
            <article class="lp-value lp-lift">
              <h3>Construido con abogados</h3>
              <p>Flujos diseñados con operadores reales: revisión documental, minuta, firma y notaría.</p>
            </article>
            <article class="lp-value lp-lift">
              <h3>Licencia para bufetes</h3>
              <p>Suscripción mensual solo para operadores y firmas — no para el cliente final de cada trámite.</p>
            </article>
            <article class="lp-value lp-lift">
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
            <p class="lp-cta-eyebrow">Listo cuando tú lo estés</p>
            <h2>¿Listo para transformar tu operación legal?</h2>
            <p>Únete a más de 120 firmas demo que gestionan trámites con LegalStation. Diseñado para accesibilidad y escala.</p>
            <div class="lp-cta-buttons">
              <a routerLink="/productos/divorcio360" class="lp-cta-primary">Comenzar hoy</a>
              <a routerLink="/auth" class="lp-cta-ghost">Agendar demo</a>
            </div>
          </div>
        </div>
      </section>

      @if (toast) { <div class="lp-toast">{{ toast }}</div> }
    </div>
  `,
  styles: [`
    .legalstation-landing {
      --lp-accent: #4455c4;
      --lp-accent-deep: #3344a8;
      --lp-accent-soft: #eef0fb;
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

  heroStats: HeroStat[] = [
    { value: '6', label: 'Productos conectados', icon: 'folder' },
    { value: '120+', label: 'Firmas demo', icon: 'users' },
    { value: '10', label: 'Estados por expediente', icon: 'file' },
  ];

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
      iconBg: '#e8efe6',
      showcaseDesc: 'Intake con cuestionario inteligente, pago, expediente de 10 estados y firma — el flujo completo en vivo.',
      showcaseImage: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1400&q=80',
      tagline: 'Mutuo consentimiento con intake, pago y expediente trazable.',
      image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=80',
      features: ['Cuestionario inteligente', '10 estados de trámite', 'Firma y minuta mock'],
      live: true, route: '/productos/divorcio360',
    },
    {
      id: 'traslado360', name: 'Traslado360', icon: 'file',
      pillDesc: 'Traslado de vehículo',
      iconBg: '#e8f4f8',
      showcaseDesc: 'Mutuo acuerdo, pago único, documentos y reunión virtual con notario — traslado de dominio vehicular demo.',
      showcaseImage: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=1400&q=80',
      tagline: 'Traslado vehicular con acuerdo mutuo y firma notarial.',
      image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=800&q=80',
      features: ['Sitio producto completo', 'Pago único mock', 'Consulta + notaría virtual'],
      live: true, route: '/productos/traslado360',
    },
    {
      id: 'bienraiz360', name: 'BienRaiz360', icon: 'building',
      pillDesc: 'Traslado de inmueble',
      iconBg: '#f0ebe3',
      showcaseDesc: 'Traslado de dominio de terreno o inmueble — ambas partes de acuerdo, reunión virtual con notario.',
      showcaseImage: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1400&q=80',
      tagline: 'Traslado de bienes inmuebles con comparecencia digital.',
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80',
      features: ['Sitio producto completo', 'Honorario único', 'Expediente trazable'],
      live: true, route: '/productos/bienraiz360',
    },
    {
      id: 'signdesk', name: 'SignDesk', icon: 'pen',
      pillDesc: 'Firma ECI integrada',
      iconBg: '#f5ebe3',
      showcaseDesc: 'Sobres de firma, auditoría legal y plantillas reutilizables — hub de firma acreditada para documentos.',
      showcaseImage: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=1400&q=80',
      tagline: 'Hub de firma electrónica para documentos legales.',
      image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=800&q=80',
      features: ['Sobre de firma', 'Auditoría legal', 'Plantillas reutilizables'],
      live: false,
    },
    {
      id: 'matterflow', name: 'MatterFlow', icon: 'folder',
      pillDesc: 'CRM de expedientes',
      iconBg: '#e3eef5',
      showcaseDesc: 'Bandeja operador, alertas SLA, pipeline kanban y notas visibles al cliente en un solo panel.',
      showcaseImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1400&q=80',
      tagline: 'Bandeja, SLA y pipeline para operadores jurídicos.',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
      features: ['Vista kanban', 'Alertas SLA', 'Notas al cliente'],
      live: false,
    },
    {
      id: 'compliancehub', name: 'ComplianceHub', icon: 'shield',
      pillDesc: 'Cumplimiento LOPDP',
      iconBg: '#e3f5ef',
      showcaseDesc: 'Consentimiento en registro, trazas de acceso y exportes de auditoría para cumplimiento demo.',
      showcaseImage: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1400&q=80',
      tagline: 'Consentimiento, retención y exportes de cumplimiento.',
      image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
      features: ['Registro LOPDP', 'Trazas de acceso', 'Reportes demo'],
      live: false,
    },
    {
      id: 'notarylink', name: 'NotaryLink', icon: 'building',
      pillDesc: 'Agenda notarial EC',
      iconBg: '#f0ebe3',
      showcaseDesc: 'Directorio de notarías, comparecencia y sync SATJE mock — seguimiento hasta acta emitida.',
      showcaseImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1400&q=80',
      tagline: 'Agenda, comparecencia y seguimiento de actas.',
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
      features: ['Directorio notarías', 'Estado comparecencia', 'Sync SATJE mock'],
      live: false,
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
    { name: 'Starter', audience: 'Bufete pequeño — licencia operador', price: 99, items: ['1 producto activo', '3 usuarios operador', 'Link a clientes incluido', '15% comisión demo por venta'], featured: false },
    { name: 'Professional', audience: 'Equipo en crecimiento', price: 249, items: ['3 productos live', '10 usuarios', 'SLA y notificaciones', 'Link personalizado + comisión', 'SATJE sync demo'], featured: true },
    { name: 'Enterprise', audience: 'Multi-sede', price: 599, items: ['Productos ilimitados', 'SSO demo', 'Comisión negociable', 'White-label ready'], featured: false },
  ];

  enterprise = [
    { title: 'Aislamiento completo', desc: 'Infraestructura dedicada — tus datos separados del resto de tenants demo.' },
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
