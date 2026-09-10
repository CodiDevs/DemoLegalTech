import { AfterViewInit, Component, ElementRef, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LEGALSTATION_CATALOG, ProductCatalogEntry, getProductQuestionnairePath, setActiveProduct } from '../../shared/product-sites.data';
import { IconComponent } from '../../shared/icon.component';
import { LandingFaqComponent } from '../../shared/ui/landing-faq.component';
import { ShineBorderComponent } from '../../shared/ui/shine-border.component';
import { TiltCardComponent } from '../../shared/ui/tilt-card.component';
import { MarketingHeroComponent } from './marketing-hero.component';
import {
  LEGALSTATION_ENTERPRISE,
  LEGALSTATION_FAQ,
  LEGALSTATION_PLANS,
  LEGALSTATION_WORKFLOW,
} from './saas-landing.data';

@Component({
  selector: 'app-saas-landing',
  standalone: true,
  imports: [
    RouterLink,
    MarketingHeroComponent,
    IconComponent,
    TiltCardComponent,
    ShineBorderComponent,
    LandingFaqComponent,
  ],
  template: `
    <div class="landing-page legalstation-landing">
      <app-marketing-hero
        primaryCta="Ver qué puedo tramitar"
        primaryFragment="catalogo"
        [showSecondary]="false"
      />

      <section class="lp-section soft" id="catalogo">
        <div class="lp-shell">
          <div class="lp-section-head">
            <p class="lp-eyebrow">Productos</p>
            <h2>Trámites en vivo</h2>
            <p>
              Divorcio360, Traslado360 y BienRaiz360 abren el cuestionario ahora.
              El resto aparece como próximos lanzamientos.
            </p>
          </div>
          <div class="lp-product-grid ls-product-grid ls-choreo">
            @for (p of liveProducts; track p.id; let i = $index) {
              <app-tilt-card class="ls-tilt-slot" [style.--i]="i" [attr.data-product]="p.id">
                <article class="lp-product-card ls-product-card">
                  <span class="lp-badge-live">En vivo</span>
                  <img class="tilt-z-media" [src]="p.image" [alt]="p.name" loading="lazy" />
                  <div class="lp-product-body tilt-z-copy">
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
              </app-tilt-card>
            }
          </div>

          <div class="soon-wrap">
            <h3>Próximamente</h3>
            <p class="lp-muted">Herramientas en preparación que aún no abren intake.</p>
            <ul class="lp-list-tt soon-list">
              @for (p of comingSoon; track p.id) {
                <li class="soon-item">
                  <span>
                    <strong>{{ p.name }}</strong>
                    <span class="lp-muted">: {{ p.pillDesc }}</span>
                  </span>
                  <button type="button" class="lp-btn lp-btn-outline" (click)="notify(p.name)">
                    Explorar
                  </button>
                </li>
              }
            </ul>
          </div>
        </div>
      </section>

      <section class="lp-section" id="flujo">
        <div class="lp-shell">
          <div class="lp-section-head">
            <p class="lp-eyebrow">Recorrido</p>
            <h2>Del intake al cierre</h2>
            <p>Cinco pasos del expediente en la plataforma.</p>
          </div>
          <div class="lp-steps ls-steps ls-choreo">
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

      <section class="lp-section soft" id="precios">
        <div class="lp-shell">
          <div class="lp-section-head">
            <p class="lp-eyebrow">Licencias</p>
            <h2>Licencia para operar la plataforma</h2>
            <p>Tarifas para operadores. El cliente del trámite no paga esta licencia.</p>
          </div>
          <div class="ls-pricing-grid">
            @for (plan of plans; track plan.name) {
              @if (plan.featured) {
                <app-shine-border class="ls-shine-slot">
                  <article class="lp-plan ls-plan-card featured">
                    <span class="lp-plan-tag">Más popular</span>
                    <h3>{{ plan.name }}</h3>
                    <p class="lp-muted">{{ plan.audience }}</p>
                    <div class="lp-plan-price">\${{ plan.price }}<small>/mes</small></div>
                    <ul>
                      @for (item of plan.items; track item) { <li>{{ item }}</li> }
                    </ul>
                    <a
                      routerLink="/auth"
                      [queryParams]="{ returnUrl: '/abogado/fase2/billing' }"
                      class="lp-btn lp-btn-primary"
                    >Ver licencia</a>
                  </article>
                </app-shine-border>
              } @else {
                <article class="lp-plan ls-plan-card">
                  <span class="lp-plan-tag is-spacer">Más popular</span>
                  <h3>{{ plan.name }}</h3>
                  <p class="lp-muted">{{ plan.audience }}</p>
                  <div class="lp-plan-price">\${{ plan.price }}<small>/mes</small></div>
                  <ul>
                    @for (item of plan.items; track item) { <li>{{ item }}</li> }
                  </ul>
                  <a
                    routerLink="/auth"
                    [queryParams]="{ returnUrl: '/abogado/fase2/billing' }"
                    class="lp-btn lp-btn-outline"
                  >Ver licencia</a>
                </article>
              }
            }
          </div>
        </div>
      </section>

      <section class="lp-section" id="faq">
        <div class="lp-shell">
          <div class="lp-section-head">
            <p class="lp-eyebrow">Preguntas</p>
            <h2>Antes de empezar</h2>
            <p>Respuestas cortas sobre trámites, cuenta, documentos y seguimiento.</p>
          </div>
          <app-landing-faq [items]="faq" />
        </div>
      </section>

      <section class="lp-section soft" id="enterprise">
        <div class="lp-shell lp-enterprise">
          <div class="lp-enterprise-copy">
            <p class="lp-eyebrow">Enterprise</p>
            <h2>Para firmas que necesitan aislamiento</h2>
            <p>
              Instancia dedicada, SSO y SLA para firmas que necesitan datos aislados.
              Solicita una consulta comercial.
            </p>
            <button type="button" class="lp-btn lp-btn-primary" (click)="notify('Enterprise')">Solicitar consulta</button>
          </div>
          <div class="lp-enterprise-grid">
            @for (e of enterprise; track e.title) {
              <article class="lp-value ls-enterprise-card">
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
      margin-top: clamp(2rem, 4vw, 2.75rem);
      padding-top: clamp(1.5rem, 3vw, 2rem);
      border-top: 1px solid var(--border);
    }

    .soon-wrap h3 {
      margin: 0 0 0.35rem;
      font-family: var(--font-display);
      font-size: 1.25rem;
      font-weight: 600;
    }

    .soon-list {
      max-width: 44rem;
      margin-top: 0.85rem;
    }

    .soon-item {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 0.75rem 1rem;
      align-items: center;
      padding-block: 0.85rem;
      border-bottom: 1px solid var(--border);
    }

    .soon-item:last-child {
      border-bottom: 0;
    }

    .ls-pricing-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 1.25rem;
      align-items: stretch;
    }

    .ls-shine-slot,
    .ls-tilt-slot {
      display: block;
      height: 100%;
      min-width: 0;
    }

    .ls-plan-card {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .ls-plan-card .lp-btn {
      margin-top: auto;
      align-self: stretch;
      justify-content: center;
    }

    .lp-enterprise {
      display: grid;
      grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.15fr);
      gap: clamp(1.75rem, 4vw, 3rem);
      align-items: start;
    }

    .lp-enterprise-copy h2 {
      font-family: var(--font-display);
      font-size: clamp(1.75rem, 3.5vw, 2.5rem);
      font-weight: 600;
      letter-spacing: -0.03em;
      margin: 0 0 0.85rem;
      max-width: 16ch;
    }

    .lp-enterprise-copy p {
      margin-bottom: 1.25rem;
      max-width: 36rem;
    }

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
      .ls-pricing-grid { grid-template-columns: 1fr; }
    }

    @media (max-width: 720px) {
      .soon-item { grid-template-columns: 1fr; }
      .lp-enterprise-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class SaasLandingComponent implements AfterViewInit, OnDestroy {
  toast = '';
  liveProducts = LEGALSTATION_CATALOG.filter((p) => p.live);
  comingSoon = LEGALSTATION_CATALOG.filter((p) => !p.live);
  workflow = LEGALSTATION_WORKFLOW;
  plans = LEGALSTATION_PLANS;
  enterprise = LEGALSTATION_ENTERPRISE;
  faq = LEGALSTATION_FAQ;
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

  openProduct(p: ProductCatalogEntry): void {
    if (!p.route) return;
    setActiveProduct(p.id);
    void this.router.navigateByUrl(getProductQuestionnairePath(p.id));
  }

  notify(name: string): void {
    this.toast = `${name}: solicitud registrada. Te contactaremos pronto.`;
    setTimeout(() => this.toast = '', 3500);
  }
}
