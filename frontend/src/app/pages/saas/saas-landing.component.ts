import { AfterViewInit, Component, ElementRef, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LEGALSTATION_CATALOG, ProductCatalogEntry, getProductQuestionnairePath, setActiveProduct } from '../../shared/product-sites.data';
import { MarketingHeroComponent } from './marketing-hero.component';
import {
  LEGALSTATION_ENTERPRISE,
  LEGALSTATION_HERO_IMAGES,
  LEGALSTATION_PLANS,
  LEGALSTATION_WORKFLOW,
} from './saas-landing.data';
import { IconComponent } from '../../shared/icon.component';

@Component({
  selector: 'app-saas-landing',
  standalone: true,
  imports: [RouterLink, MarketingHeroComponent, IconComponent],
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
        [images]="heroImages"
      />

      <section class="lp-section soft" id="catalogo">
        <div class="lp-shell">
          <div class="lp-section-head">
            <h2>Trámites en vivo: <span class="lp-highlight">intake y expediente.</span></h2>
            <p>
              Divorcio360, Traslado360 y BienRaiz360 abren el cuestionario ahora.
              El resto aparece abajo como demo, todavía no en vivo.
            </p>
          </div>
          <div class="lp-product-grid ls-bento ls-choreo">
            @for (p of liveProducts; track p.id; let i = $index) {
              <article class="lp-product-card lp-lift" [style.--i]="i">
                <span class="lp-badge-live">En vivo</span>
                <img [src]="p.image" [alt]="p.name" loading="lazy" />
                <div class="lp-product-body">
                  <h3>{{ p.name }}</h3>
                  <p>{{ p.tagline }}</p>
                  <ul class="lp-list-tt">
                    @for (f of p.features; track f) { <li>{{ f }}</li> }
                  </ul>
                  <button type="button" class="lp-btn lp-btn-primary" (click)="openProduct(p)">
                    Abrir producto
                    <app-icon name="arrow-right" [size]="16" />
                  </button>
                </div>
              </article>
            }
          </div>

          <div class="soon-wrap">
            <h3>Próximamente</h3>
            <p class="lp-muted">Herramientas de la demo que aún no abren intake.</p>
            <ul class="lp-list-tt soon-list">
              @for (p of comingSoon; track p.id) {
                <li class="soon-item">
                  <span>
                    <strong>{{ p.name }}</strong>
                    <span class="lp-muted">: {{ p.pillDesc }}</span>
                  </span>
                  <button type="button" class="lp-btn lp-btn-outline" (click)="notify(p.name)">
                    Explorar demo
                  </button>
                </li>
              }
            </ul>
          </div>
        </div>
      </section>

      <section class="lp-section">
        <div class="lp-shell">
          <div class="lp-section-head">
            <h2>Intake, expediente y <span class="lp-highlight">operador.</span></h2>
            <p>El cliente llena el intake. El expediente junta pago y documentos. El operador revisa y cierra.</p>
          </div>
          <div class="lp-values lp-values--rules">
            <article class="lp-value">
              <h3>Intake</h3>
              <p>Cuestionario y clasificación del caso antes de pagar.</p>
            </article>
            <article class="lp-value">
              <h3>Expediente</h3>
              <p>Documentos, pago y mensajes en un solo lugar.</p>
            </article>
            <article class="lp-value">
              <h3>Operador</h3>
              <p>Revisión, minuta y aviso de estado al cliente.</p>
            </article>
          </div>
        </div>
      </section>

      <section class="lp-section soft">
        <div class="lp-shell">
          <div class="lp-section-head">
            <h2>Del intake al cierre, <span class="lp-highlight">cinco pasos.</span></h2>
            <p>Ciclo del expediente en la plataforma.</p>
          </div>
          <div class="lp-steps ls-choreo">
            @for (s of workflow; track s.title; let i = $index) {
              <article class="lp-step" [style.--i]="i">
                <div class="lp-step-num">{{ s.n }}</div>
                <h3>{{ s.title }}</h3>
                <p>{{ s.desc }}</p>
              </article>
            }
          </div>
        </div>
      </section>

      <section class="lp-section" id="precios">
        <div class="lp-shell">
          <div class="lp-section-head">
            <h2>Licencia demo para <span class="lp-highlight">operar la plataforma.</span></h2>
            <p>Tarifas de demostración para operadores. El cliente del trámite no paga esta licencia.</p>
          </div>
          <div class="pricing-lead">
            <article class="lp-plan featured">
              <span class="lp-plan-tag">Licencia demo</span>
              <h3>{{ featuredPlan.name }}</h3>
              <p class="lp-muted">{{ featuredPlan.audience }}</p>
              <div class="lp-plan-price">\${{ featuredPlan.price }}<small>/mes</small></div>
              <ul>
                @for (item of featuredPlan.items; track item) { <li>{{ item }}</li> }
              </ul>
              <a routerLink="/auth" [queryParams]="{ returnUrl: '/fase2/billing' }" class="lp-btn lp-btn-outline">Ver licencia demo</a>
            </article>
          </div>
          <p class="lp-muted other-plans">
            Otras licencias demo:
            @for (plan of otherPlans; track plan.name; let last = $last) {
              <a routerLink="/auth" [queryParams]="{ returnUrl: '/fase2/billing' }" class="lp-link">{{ plan.name }}</a>
              @if (!last) { <span aria-hidden="true">·</span> }
            }
          </p>
        </div>
      </section>

      <section class="lp-section soft">
        <div class="lp-shell lp-enterprise">
          <div class="lp-enterprise-copy">
            <h2>Enterprise en demo</h2>
            <p>
              Instancia dedicada, SSO y SLA de demostración para firmas que necesitan datos aislados.
              Consulta demo. No es un contrato.
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

      @if (toast) {
        <div class="lp-toast toast-fade" role="status" aria-live="polite">{{ toast }}</div>
      }
    </div>
  `,
  styles: [`
    .soon-wrap {
      margin-top: 2rem;
    }

    .soon-wrap h3 {
      margin-bottom: 0.35rem;
    }

    .soon-list {
      max-width: 42rem;
      margin-top: 0.75rem;
    }

    .soon-item {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 0.75rem 1rem;
      align-items: center;
    }

    .pricing-lead {
      display: grid;
      grid-template-columns: minmax(16rem, 26rem);
      justify-content: center;
    }

    .other-plans {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      align-items: center;
      gap: 0.35rem 0.85rem;
      margin-top: 1.25rem;
    }

    .lp-enterprise {
      display: grid;
      grid-template-columns: 1fr 1.2fr;
      gap: 2rem;
      align-items: start;
    }

    .lp-enterprise-copy h2 {
      font-size: clamp(1.5rem, 3vw, 2rem);
      margin: 0 0 0.85rem;
    }

    .lp-enterprise-copy p { margin-bottom: 1.25rem; }

    .lp-enterprise-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .toast-fade {
      opacity: 1;
      transition: opacity 180ms var(--ease), transform 180ms var(--ease);
    }

    @media (max-width: 960px) {
      .lp-enterprise { grid-template-columns: 1fr; }
    }

    @media (max-width: 720px) {
      .soon-item { grid-template-columns: 1fr; }
      .pricing-lead { grid-template-columns: minmax(0, 1fr); }
    }
  `]
})
export class SaasLandingComponent implements AfterViewInit, OnDestroy {
  toast = '';
  heroImages = LEGALSTATION_HERO_IMAGES;
  liveProducts = LEGALSTATION_CATALOG.filter((p) => p.live);
  comingSoon = LEGALSTATION_CATALOG.filter((p) => !p.live);
  workflow = LEGALSTATION_WORKFLOW;
  featuredPlan = LEGALSTATION_PLANS.find((p) => p.featured)!;
  otherPlans = LEGALSTATION_PLANS.filter((p) => !p.featured);
  enterprise = LEGALSTATION_ENTERPRISE;
  private io?: IntersectionObserver;

  constructor(private router: Router, private host: ElementRef<HTMLElement>) {}

  ngAfterViewInit(): void {
    const reduce = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    const nodes = this.host.nativeElement.querySelectorAll('.ls-choreo');
    this.io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('is-choreo');
          this.io?.unobserve(entry.target);
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.14 },
    );
    nodes.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const alreadyIn = rect.top < window.innerHeight * 0.88 && rect.bottom > 0;
      if (alreadyIn) return;
      this.io!.observe(el);
    });
  }

  ngOnDestroy(): void {
    this.io?.disconnect();
  }

  /** Siempre al cuestionario del producto seleccionado. */
  openProduct(p: ProductCatalogEntry): void {
    if (!p.route) return;
    setActiveProduct(p.id);
    void this.router.navigateByUrl(getProductQuestionnairePath(p.id));
  }

  notify(name: string): void {
    this.toast = `${name}: demo registrada. Te avisaremos (simulación)`;
    setTimeout(() => this.toast = '', 3500);
  }
}
