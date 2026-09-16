import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LEGALSTATION_CATALOG, ProductCatalogEntry, setActiveProduct } from '../../shared/product-sites.data';
import { IconComponent } from '../../shared/icon.component';
import { LandingFaqComponent } from '../../shared/ui/landing-faq.component';
import { MarketingHeroComponent } from './marketing-hero.component';
import { StationPreviewComponent } from './station-preview.component';
import {
  LEGALSTATION_FAQ,
  LEGALSTATION_PLANS,
  LEGALSTATION_SERVICE_PLANS,
  LEGALSTATION_WORKFLOW,
  PricingMode,
} from './saas-landing.data';

@Component({
  selector: 'app-saas-landing',
  standalone: true,
  imports: [
    RouterLink,
    MarketingHeroComponent,
    IconComponent,
    LandingFaqComponent,
    StationPreviewComponent,
  ],
  template: `
    <div class="landing-page legalstation-landing">
      <!-- 1. Hero Minimalista -->
      <app-marketing-hero
        titleLine1="Expedientes civiles, resueltos."
        lede="El cuestionario abre el expediente. Documentos y firma siguen en el mismo folio."
        primaryCta="Iniciar un trámite"
        [pickService]="true"
        secondaryCta="Acceso profesional"
        [showSecondary]="true"
      />

      <!-- 2. Catálogo de Trámites Civiles Estandarizados -->
      <section class="landing-section" id="catalogo" aria-labelledby="cat-heading">
        <div class="landing-shell">
          <header class="section-head">
            <h2 id="cat-heading" class="section-title">Trámites estandarizados. Listos para despacho.</h2>
          </header>

          <div class="catalog-grid">
            @for (p of liveProducts; track p.id) {
              <article class="catalog-card" [class.is-lead]="p.id === 'divorcio360'">
                <div class="card-top">
                  <div class="card-tag">{{ productCategory(p.id) }}</div>
                  <h3 class="card-title">{{ p.name }}</h3>
                  <p class="card-tagline">{{ p.tagline }}</p>

                  @if (p.id === 'divorcio360') {
                    <ul class="card-features">
                      @for (f of p.features; track f) {
                        <li>{{ f }}</li>
                      }
                    </ul>
                  }
                </div>

                <div class="card-bottom">
                  <div class="card-meta tabular">
                    <span class="meta-item">{{ productPrice(p.id) }}</span>
                  </div>
                  <a
                    [routerLink]="p.route"
                    class="btn w-full product-btn"
                    [class.btn-primary]="p.id === 'divorcio360'"
                    [class.btn-secondary]="p.id !== 'divorcio360'"
                    (click)="armProduct(p)"
                  >
                    <span>{{ p.id === 'divorcio360' ? 'Abrir Divorcio360' : 'Ver trámite' }}</span>
                    <app-icon name="arrow-right" [size]="14" />
                  </a>
                </div>
              </article>
            }
          </div>
        </div>
      </section>

      <!-- 3. Ciclo del Expediente (Estaciones Pinned con Scroll continuo) -->
      <section class="stations-pinned-track" id="flujo" #stationsTrack aria-labelledby="flujo-heading">
        <div class="stations-sticky-scene">
          <div class="landing-shell w-full">
            <header class="section-head section-head--compact">
              <h2 id="flujo-heading" class="section-title">Cinco estaciones. Despacho continuo.</h2>
            </header>

            <div class="journey-split">
              <nav class="journey-nav" role="tablist" aria-label="Estaciones del trámite">
                @for (step of workflow; track step.id; let i = $index) {
                  <button
                    type="button"
                    class="journey-step-btn"
                    [class.is-active]="journeyFocus === i"
                    (click)="selectStation(i)"
                    role="tab"
                    [attr.aria-selected]="journeyFocus === i"
                    [attr.aria-controls]="'station-preview-panel'"
                  >
                    <span class="step-rail" aria-hidden="true">
                      <span class="step-dot"></span>
                    </span>
                    <div class="step-text">
                      <strong class="step-title">{{ step.title }}</strong>
                      @if (journeyFocus === i) {
                        <p class="step-desc">{{ step.desc }}</p>
                      }
                    </div>
                  </button>
                }
              </nav>

              <div class="journey-preview-wrap" id="station-preview-panel" role="tabpanel">
                <app-station-preview
                  [stationIndex]="journeyFocus"
                  (selectStation)="selectStation($event)"
                />
              </div>
            </div>

            <!-- Indicador sutil de progreso de la sección -->
            <div class="track-progress" aria-hidden="true">
              <div class="track-progress-bar" [style.--p]="trackProgress / 100"></div>
            </div>
          </div>
        </div>
      </section>

      <!-- 4. Marco Legal y Cumplimiento Notarial -->
      <section class="landing-section" id="seguridad" aria-labelledby="seguridad-heading">
        <div class="landing-shell">
          <header class="section-head">
            <h2 id="seguridad-heading" class="section-title">Validez plena en sede notarial y judicial.</h2>
          </header>

          <div class="pillars-grid">
            <article class="pillar-card pillar-card--lead">
              <h3 class="pillar-title">Firma electrónica avanzada</h3>
              <p class="pillar-text">
                Compatibilidad nativa con certificados acreditados (BCE, Security Data, Consejo de la Judicatura). Misma validez legal y probatoria que la firma manuscrita.
              </p>
            </article>

            <article class="pillar-card">
              <span class="pillar-icon" aria-hidden="true">
                <app-icon name="clipboard" [size]="20" />
              </span>
              <h3 class="pillar-title">Validación documental</h3>
              <p class="pillar-text">
                Verificación preliminar de partidas de matrimonio, cédulas y certificados de gravamen para asegurar la admisibilidad notarial sin errores de digitación.
              </p>
            </article>

            <article class="pillar-card">
              <span class="pillar-icon" aria-hidden="true">
                <app-icon name="shield" [size]="20" />
              </span>
              <h3 class="pillar-title">Cadena de custodia</h3>
              <p class="pillar-text">
                Sellado de tiempo en cada actuación procesal y registro ordenado de intervenciones de operadores.
              </p>
            </article>
          </div>
        </div>
      </section>

      <!-- 5. Precios: honorarios de servicios o licencia B2B -->
      <section class="landing-section subtle" id="precios" aria-labelledby="precios-heading">
        <div class="landing-shell">
          <header class="section-head">
            <h2 id="precios-heading" class="section-title">
              {{ pricingMode === 'servicios' ? 'Honorarios claros por cada trámite.' : 'Precios claros según la escala de tu bufete.' }}
            </h2>
            <p class="section-lede">
              @if (pricingMode === 'servicios') {
                Pago único del cliente al iniciar el expediente. Sin suscripción. La licencia del bufete es aparte.
              } @else {
                Suscripción mensual para operadores del bufete. El cliente final abona los honorarios profesionales por trámite.
              }
            </p>
          </header>

          <div class="pricing-toggle" role="tablist" aria-label="Tipo de precios">
            <button
              type="button"
              role="tab"
              class="pricing-toggle-btn"
              [class.is-active]="pricingMode === 'servicios'"
              [attr.aria-selected]="pricingMode === 'servicios'"
              id="precios-tab-servicios"
              (click)="setPricingMode('servicios')"
            >
              Servicios
            </button>
            <button
              type="button"
              role="tab"
              class="pricing-toggle-btn"
              [class.is-active]="pricingMode === 'licenciamiento'"
              [attr.aria-selected]="pricingMode === 'licenciamiento'"
              id="precios-tab-licenciamiento"
              (click)="setPricingMode('licenciamiento')"
            >
              Licenciamiento
            </button>
          </div>

          @if (pricingMode === 'servicios') {
            <div class="pricing-grid" role="tabpanel" aria-labelledby="precios-tab-servicios">
              @for (svc of servicePlans; track svc.id) {
                <article class="plan-card" [class.is-featured]="svc.featured">
                  @if (svc.featured) {
                    <p class="plan-mark">Referencia</p>
                  }
                  <div class="plan-head">
                    <span class="plan-tag">{{ svc.tag }}</span>
                    <h3 class="plan-name">{{ svc.name }}</h3>
                    <p class="plan-audience">{{ svc.audience }}</p>
                    <div class="plan-price tabular">
                      <span class="plan-currency">$</span>{{ svc.price }}<small class="plan-period">único</small>
                    </div>
                  </div>

                  <ul class="plan-items">
                    @for (item of svc.items; track item) {
                      <li>{{ item }}</li>
                    }
                  </ul>

                  <div class="plan-cta">
                    <a
                      [routerLink]="svc.route"
                      class="btn w-full"
                      [class.btn-primary]="svc.featured"
                      [class.btn-secondary]="!svc.featured"
                      (click)="armProductById(svc.id)"
                    >
                      Ver {{ svc.name }}
                    </a>
                  </div>
                </article>
              }
            </div>
          } @else {
            <div class="pricing-grid" role="tabpanel" aria-labelledby="precios-tab-licenciamiento">
              @for (plan of plans; track plan.name) {
                <article class="plan-card" [class.is-featured]="plan.featured">
                  @if (plan.featured) {
                    <p class="plan-mark">Recomendado</p>
                  }
                  <div class="plan-head">
                    <span class="plan-tag">{{ plan.tag }}</span>
                    <h3 class="plan-name">{{ plan.name }}</h3>
                    <p class="plan-audience">{{ plan.audience }}</p>
                    <div class="plan-price tabular">
                      <span class="plan-currency">$</span>{{ plan.price }}<small class="plan-period">/mes</small>
                    </div>
                  </div>

                  <ul class="plan-items">
                    @for (item of plan.items; track item) {
                      <li>{{ item }}</li>
                    }
                  </ul>

                  <div class="plan-cta">
                    @if (plan.name === 'Enterprise') {
                      <button type="button" class="btn btn-secondary w-full" (click)="notify('Enterprise')">
                        Solicitar consulta
                      </button>
                    } @else {
                      <a
                        routerLink="/auth"
                        [queryParams]="{ returnUrl: '/abogado/fase2/billing' }"
                        class="btn w-full"
                        [class.btn-primary]="plan.featured"
                        [class.btn-secondary]="!plan.featured"
                      >
                        Contratar {{ plan.name }}
                      </a>
                    }
                  </div>
                </article>
              }
            </div>
          }
        </div>
      </section>

      <!-- 6. Preguntas Frecuentes -->
      <section class="landing-section" id="faq" aria-labelledby="faq-heading">
        <div class="landing-shell">
          <header class="section-head">
            <h2 id="faq-heading" class="section-title">Preguntas frecuentes.</h2>
          </header>

          <app-landing-faq [items]="faq" />
        </div>
      </section>

      @if (toast) {
        <div class="lp-toast toast-fade" role="status" aria-live="polite">{{ toast }}</div>
      }
    </div>
  `,
  styles: [`
    .legalstation-landing {
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
      overflow-x: clip;
    }

    .landing-shell {
      max-width: 1140px;
      margin: 0 auto;
      padding: 0 var(--space-5);
    }

    .landing-section {
      padding-block: clamp(4.5rem, 8vw, 7rem);
      border-top: 1px solid var(--border);
    }

    .landing-section.subtle {
      background: var(--bg-subtle);
    }

    .section-head {
      margin-bottom: var(--space-6);
      max-width: 46rem;
    }

    .section-title {
      margin: 0 0 var(--space-2);
      font-size: clamp(2rem, 3.6vw, 2.75rem);
      font-weight: 650;
      letter-spacing: -0.03em;
      line-height: 1.12;
      color: var(--text);
    }

    .section-head:not(:has(.section-lede)) .section-title {
      margin-bottom: 0;
    }

    .section-lede {
      margin: 0;
      font-size: var(--text-base);
      color: var(--text-secondary);
      line-height: var(--leading-normal);
    }

    /* Catálogo */
    .catalog-grid {
      display: grid;
      grid-template-columns: minmax(0, 1.5fr) minmax(0, 0.92fr) minmax(0, 0.92fr);
      gap: var(--space-5);
      align-items: stretch;
    }

    .catalog-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: var(--space-5);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: var(--space-5);
      box-shadow: var(--shadow-sm);
      transition:
        border-color 280ms var(--ease-out),
        box-shadow 280ms var(--ease-out);
    }

    .catalog-card.is-lead {
      padding: var(--space-6);
      border-color: color-mix(in srgb, var(--primary) 28%, var(--border));
      background: color-mix(in srgb, var(--primary) 5%, var(--surface));
    }

    .catalog-card:hover {
      border-color: color-mix(in srgb, var(--primary) 40%, var(--border));
      box-shadow: var(--shadow-md);
    }

    .card-tag {
      font-size: var(--text-xs);
      font-weight: 650;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      margin-bottom: var(--space-2);
    }

    .card-title {
      font-size: var(--text-xl);
      font-weight: 650;
      letter-spacing: -0.02em;
      color: var(--text);
      margin: 0 0 var(--space-2);
    }

    .catalog-card.is-lead .card-title {
      font-size: var(--text-2xl);
    }

    .card-tagline {
      font-size: var(--text-sm);
      color: var(--text-secondary);
      line-height: var(--leading-normal);
      margin: 0 0 var(--space-4);
    }

    .card-features {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    .card-features li {
      font-size: var(--text-xs);
      color: var(--text-secondary);
      line-height: 1.4;
    }

    .card-bottom {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
      padding-top: var(--space-4);
      border-top: 1px solid var(--border);
    }

    .card-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: var(--text-xs);
      color: var(--text-muted);
      font-weight: 500;
    }

    .product-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-2);
      text-decoration: none;
    }

    /* 3. Pinned Scroll Track de las Cinco Estaciones */
    .stations-pinned-track {
      position: relative;
      height: 380vh;
    }

    @media (max-width: 900px) {
      .catalog-grid {
        grid-template-columns: 1fr;
      }

      .stations-pinned-track {
        height: auto;
      }
    }

    .stations-sticky-scene {
      position: sticky;
      top: var(--header-height, 4rem);
      height: calc(100vh - var(--header-height, 4rem));
      min-height: 600px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      background: var(--bg-subtle);
      border-top: 1px solid var(--border);
      border-bottom: 1px solid var(--border);
      overflow: hidden;
      padding: var(--space-4) 0;
    }

    @media (max-width: 900px) {
      .stations-sticky-scene {
        position: relative;
        top: 0;
        height: auto;
        min-height: 0;
        padding-block: clamp(3rem, 6vw, 5rem);
      }
    }

    .stations-sticky-scene .landing-shell {
      max-width: 1240px;
      margin: 0 auto;
      padding: 0 var(--space-5);
      width: 100%;
    }

    .section-head--compact {
      margin-bottom: clamp(1.75rem, 3vw, 2.5rem);
    }

    .journey-split {
      display: grid;
      grid-template-columns: minmax(240px, 300px) minmax(0, 1fr);
      gap: clamp(2rem, 4vw, 3.5rem);
      align-items: center;
    }

    @media (max-width: 900px) {
      .journey-split {
        grid-template-columns: 1fr;
        gap: var(--space-5);
      }
    }

    .journey-nav {
      display: flex;
      flex-direction: column;
      gap: 0;
      position: relative;
    }

    .journey-step-btn {
      position: relative;
      display: grid;
      grid-template-columns: 12px 1fr;
      align-items: start;
      column-gap: var(--space-3);
      padding: var(--space-3) 0;
      border: none;
      background: transparent;
      text-align: left;
      cursor: pointer;
      font-family: inherit;
      width: 100%;
    }

    .step-rail {
      display: flex;
      justify-content: center;
      padding-top: 0.45rem;
      position: relative;
      height: 100%;
    }

    .journey-step-btn:not(:last-child) .step-rail::after {
      content: '';
      position: absolute;
      top: 1.1rem;
      bottom: -0.75rem;
      left: 50%;
      width: 1px;
      transform: translateX(-50%);
      background: var(--border);
    }

    .journey-step-btn.is-active:not(:last-child) .step-rail::after {
      background: color-mix(in srgb, var(--primary) 35%, var(--border));
    }

    .step-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--border-strong);
      transition:
        background 280ms var(--ease-out),
        box-shadow 280ms var(--ease-out),
        transform 280ms var(--ease-out);
    }

    .journey-step-btn.is-active .step-dot {
      background: var(--primary);
      transform: scale(1.15);
      box-shadow: 0 0 0 4px color-mix(in srgb, var(--primary) 18%, transparent);
    }

    .step-text {
      flex: 1;
      min-width: 0;
      padding-bottom: var(--space-1);
    }

    .step-title {
      font-size: var(--text-sm);
      font-weight: 550;
      color: var(--text-secondary);
      letter-spacing: -0.01em;
      transition:
        color 280ms var(--ease-out),
        font-weight 280ms var(--ease-out);
    }

    .journey-step-btn.is-active .step-title {
      color: var(--text);
      font-weight: 650;
    }

    .step-desc {
      margin: var(--space-1) 0 0;
      font-size: var(--text-sm);
      color: var(--text-secondary);
      line-height: 1.5;
      max-width: 28ch;
      animation: stepMetaIn 420ms var(--ease-out) both;
    }

    @keyframes stepMetaIn {
      from {
        opacity: 0;
        transform: translateY(6px);
        filter: blur(2px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
        filter: blur(0);
      }
    }

    .journey-preview-wrap {
      width: 100%;
      min-width: 0;
    }

    /* Barra sutil de progreso de scroll */
    .track-progress {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: var(--border);
    }

    .track-progress-bar {
      height: 100%;
      background: var(--primary);
      transform: scaleX(var(--p, 0));
      transform-origin: left center;
      transition: transform var(--dur-fast) var(--ease-out);
    }

    /* Pilares de Cumplimiento / Seguridad */
    .pillars-grid {
      display: grid;
      grid-template-columns: minmax(0, 1.35fr) minmax(0, 1fr);
      gap: var(--space-5);
      align-items: stretch;
    }

    .pillar-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: var(--space-5);
      box-shadow: var(--shadow-sm);
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    .pillar-card--lead {
      grid-row: span 2;
      justify-content: center;
      padding: var(--space-6);
      background: var(--bg-subtle);
    }

    .pillar-icon {
      display: inline-grid;
      place-items: center;
      width: 40px;
      height: 40px;
      border-radius: var(--radius-md);
      background: var(--primary-subtle);
      color: var(--primary);
      margin-bottom: var(--space-1);
    }

    .pillar-title {
      font-size: var(--text-base);
      font-weight: 650;
      color: var(--text);
      margin: 0;
    }

    .pillar-card--lead .pillar-title {
      font-size: var(--text-xl);
      letter-spacing: -0.03em;
    }

    .pillar-text {
      font-size: var(--text-sm);
      color: var(--text-secondary);
      line-height: var(--leading-normal);
      margin: 0;
    }

    @media (max-width: 800px) {
      .pillars-grid {
        grid-template-columns: 1fr;
      }

      .pillar-card--lead {
        grid-row: auto;
      }
    }

    /* Precios */
    .pricing-toggle {
      display: inline-flex;
      align-items: center;
      gap: 2px;
      padding: 3px;
      margin: 0 0 var(--space-7);
      background: var(--bg-subtle);
      border: 1px solid var(--border);
      border-radius: var(--radius-full);
      box-shadow: var(--shadow-sm);
      max-width: 100%;
    }

    .pricing-toggle-btn {
      appearance: none;
      border: 0;
      background: transparent;
      color: var(--text-secondary);
      font-family: inherit;
      font-size: var(--text-sm);
      font-weight: 600;
      letter-spacing: -0.01em;
      padding: 0.55rem 1.15rem;
      border-radius: var(--radius-full);
      cursor: pointer;
      transition:
        color var(--dur-fast) var(--ease-out),
        background-color var(--dur-fast) var(--ease-out),
        box-shadow var(--dur-fast) var(--ease-out);
    }

    .pricing-toggle-btn:hover {
      color: var(--text);
    }

    .pricing-toggle-btn.is-active {
      background: var(--surface);
      color: var(--text);
      box-shadow: var(--shadow-sm);
    }

    .pricing-toggle-btn:focus-visible {
      outline: 2px solid var(--primary);
      outline-offset: 2px;
    }

    .pricing-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: var(--space-5);
      align-items: stretch;
      animation: pricing-panel-in var(--dur-cine, 560ms) var(--ease-out) both;
    }

    @keyframes pricing-panel-in {
      from {
        opacity: 0;
        transform: translateY(10px);
        filter: blur(4px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
        filter: blur(0);
      }
    }

    .plan-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: var(--space-5);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: var(--space-5);
      box-shadow: var(--shadow-sm);
      position: relative;
      transition: border-color 280ms var(--ease-out), box-shadow 280ms var(--ease-out);
    }

    .plan-card.is-featured {
      background: color-mix(in srgb, var(--primary) 7%, var(--surface));
      border-color: var(--primary);
      box-shadow: var(--shadow-md);
    }

    .plan-mark {
      margin: 0 0 var(--space-2);
      font-family: var(--font-sans);
      font-size: var(--text-xs);
      font-weight: 550;
      letter-spacing: 0.01em;
      color: var(--primary);
    }

    .plan-tag {
      font-size: var(--text-xs);
      font-weight: 650;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .plan-name {
      font-size: var(--text-2xl);
      font-weight: 700;
      color: var(--text);
      letter-spacing: -0.02em;
      margin: var(--space-1) 0 var(--space-1);
    }

    .plan-audience {
      font-size: var(--text-xs);
      color: var(--text-secondary);
      margin: 0;
    }

    .plan-price {
      font-size: var(--text-3xl);
      font-weight: 700;
      color: var(--text);
      letter-spacing: -0.02em;
      margin-top: var(--space-3);
    }

    .plan-currency {
      font-size: var(--text-xl);
      font-weight: 500;
      vertical-align: super;
      margin-right: 2px;
    }

    .plan-period {
      font-size: var(--text-sm);
      font-weight: 400;
      color: var(--text-muted);
      margin-left: 2px;
    }

    .plan-items {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    .plan-items li {
      font-size: var(--text-sm);
      color: var(--text-secondary);
    }

    .w-full {
      width: 100%;
    }

    .tabular {
      font-variant-numeric: tabular-nums;
    }

    .toast-fade {
      opacity: 1;
    }
  `],
})
export class SaasLandingComponent implements AfterViewInit, OnDestroy {
  toast = '';
  liveProducts = LEGALSTATION_CATALOG.filter((p) => p.live);
  workflow = LEGALSTATION_WORKFLOW;
  journeyFocus = 0;
  pricingMode: PricingMode = 'licenciamiento';
  plans = LEGALSTATION_PLANS;
  servicePlans = LEGALSTATION_SERVICE_PLANS;
  faq = LEGALSTATION_FAQ;
  trackProgress = 0;
  @ViewChild('stationsTrack') stationsTrack?: ElementRef<HTMLElement>;
  private scrollListener?: () => void;
  private isManualScrolling = false;
  private toastTimer?: ReturnType<typeof setTimeout>;

  constructor(private router: Router) {}

  ngAfterViewInit(): void {
    this.initTrackScroll();
  }

  private initTrackScroll(): void {
    const handler = () => {
      if (!this.stationsTrack || this.isManualScrolling) return;
      if (window.innerWidth <= 900) return;

      const el = this.stationsTrack.nativeElement;
      const rect = el.getBoundingClientRect();
      const headerOffset = 64;
      const totalScrollable = rect.height - window.innerHeight;
      if (totalScrollable <= 0) return;

      const scrolled = headerOffset - rect.top;
      const totalPinnedScroll = totalScrollable + headerOffset;

      if (scrolled <= 0) {
        if (this.journeyFocus !== 0) this.journeyFocus = 0;
        this.trackProgress = 0;
        return;
      }
      if (scrolled >= totalPinnedScroll) {
        if (this.journeyFocus !== this.workflow.length - 1) {
          this.journeyFocus = this.workflow.length - 1;
        }
        this.trackProgress = 100;
        return;
      }

      const progress = Math.max(0, Math.min(1, scrolled / totalPinnedScroll));
      this.trackProgress = Math.round(progress * 100);

      const count = this.workflow.length;
      const index = Math.min(count - 1, Math.floor(progress * count));
      if (index !== this.journeyFocus) {
        this.journeyFocus = index;
      }
    };

    this.scrollListener = handler;
    window.addEventListener('scroll', handler, { passive: true });
  }

  ngOnDestroy(): void {
    if (this.scrollListener) {
      window.removeEventListener('scroll', this.scrollListener);
    }
    if (this.toastTimer !== undefined) clearTimeout(this.toastTimer);
  }

  selectStation(index: number): void {
    if (index < 0 || index >= this.workflow.length) return;
    this.journeyFocus = index;

    if (this.stationsTrack && window.innerWidth > 900) {
      this.isManualScrolling = true;
      const el = this.stationsTrack.nativeElement;
      const rect = el.getBoundingClientRect();
      const headerOffset = 64;
      const totalScrollable = rect.height - window.innerHeight;
      const totalPinnedScroll = totalScrollable + headerOffset;
      if (totalPinnedScroll > 0) {
        const segmentProgress = (index + 0.5) / this.workflow.length;
        const targetScrollY = window.scrollY + rect.top - headerOffset + segmentProgress * totalPinnedScroll;
        window.scrollTo({ top: targetScrollY, behavior: 'smooth' });
      }
      setTimeout(() => {
        this.isManualScrolling = false;
      }, 500);
    }
  }

  productCategory(id: string): string {
    switch (id) {
      case 'divorcio360': return 'Civil & Familia';
      case 'traslado360': return 'Vehicular & Civil';
      case 'bienraiz360': return 'Inmobiliario & Notarial';
      default: return 'Trámite civil';
    }
  }

  productPrice(id: string): string {
    switch (id) {
      case 'divorcio360': return 'Honorario $349';
      case 'traslado360': return 'Honorario $199';
      case 'bienraiz360': return 'Honorario $299';
      default: return 'Tarifa regulada';
    }
  }

  setPricingMode(mode: PricingMode): void {
    this.pricingMode = mode;
  }

  armProductById(id: string): void {
    const product = this.liveProducts.find((p) => p.id === id) ?? null;
    this.armProduct(product);
  }

  armProduct(p: ProductCatalogEntry | null): void {
    if (!p?.route) return;
    setActiveProduct(p.id);
  }

  openProduct(p: ProductCatalogEntry | null): void {
    if (!p?.route) return;
    this.armProduct(p);
    void this.router.navigateByUrl(p.route);
  }

  notify(name: string): void {
    if (this.toastTimer !== undefined) clearTimeout(this.toastTimer);
    this.toast = `${name}: solicitud registrada. Te contactaremos pronto.`;
    this.toastTimer = setTimeout(() => {
      this.toast = '';
      this.toastTimer = undefined;
    }, 3500);
  }
}
