import { AfterViewInit, Component, ElementRef, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LEGALSTATION_CATALOG, ProductCatalogEntry, setActiveProduct } from '../../shared/product-sites.data';
import { IconComponent } from '../../shared/icon.component';
import { LandingFaqComponent } from '../../shared/ui/landing-faq.component';
import { MarketingHeroComponent } from './marketing-hero.component';
import { CinematicSceneComponent } from '../../shared/motion/cinematic-scene.component';
import { DemoCaseWindowComponent, DemoCaseMode } from '../../shared/demo/demo-case-window.component';
import { DemoDocumentStackComponent } from '../../shared/demo/demo-document-stack.component';
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
    LandingFaqComponent,
    CinematicSceneComponent,
    DemoCaseWindowComponent,
    DemoDocumentStackComponent,
  ],
  template: `
    <div class="landing-page legalstation-landing">
      <app-marketing-hero
        primaryCta="Abrir Divorcio360"
        primaryRoute="/productos/divorcio360"
        [showSecondary]="false"
      />

      <app-cinematic-scene sceneId="catalogo" [act]="1" theme="cream">
        <div class="ls-hero-product lp-reveal">
          <div>
            <p class="cine-kicker">En vivo</p>
            <h2 class="cine-title">Divorcio360 abre el expediente</h2>
            <p class="cine-lede">{{ featuredProduct?.tagline }}</p>
            <ul class="lp-list-tt">
              @for (f of featuredProduct?.features; track f) { <li>{{ f }}</li> }
            </ul>
            <a
              [routerLink]="featuredProduct?.route"
              class="lp-btn lp-btn-primary ls-hero-cta"
              (click)="armProduct(featuredProduct)"
            >
              Abrir {{ featuredProduct?.name }}
              <app-icon name="arrow-right" [size]="16" />
            </a>
          </div>
          <div>
            <app-demo-document-stack variant="stack" />
            <app-demo-case-window class="ls-feature" mode="overview" [activeStep]="3" />
          </div>
        </div>
      </app-cinematic-scene>

      <app-cinematic-scene [act]="1" theme="ink">
        <p class="cine-kicker">También en vivo</p>
        <h2 class="cine-title">Otras ventanas del mismo sistema</h2>
        <div class="ls-side-windows ls-choreo lp-reveal">
          @for (p of supportingProducts; track p.id; let i = $index) {
            <article class="ls-offset-window" [style.--i]="i" [attr.data-product]="p.id">
              <span class="lp-badge-live">En vivo</span>
              <h3>{{ p.name }}</h3>
              <p>{{ p.tagline }}</p>
              <ul class="lp-list-tt">
                @for (f of p.features; track f) { <li>{{ f }}</li> }
              </ul>
              <a [routerLink]="p.route" class="lp-btn lp-btn-primary" (click)="armProduct(p)">
                Abrir producto
              </a>
            </article>
          }
        </div>
        <div class="soon-wrap">
          <h3>Próximamente</h3>
          <ul class="lp-list-tt soon-list">
            @for (p of comingSoon; track p.id) {
              <li class="soon-item">
                <span><strong>{{ p.name }}</strong>: {{ p.pillDesc }}</span>
                <button type="button" class="lp-btn lp-btn-outline" (click)="notify(p.name)">Explorar</button>
              </li>
            }
          </ul>
        </div>
      </app-cinematic-scene>

      <app-cinematic-scene sceneId="flujo" [act]="1" theme="cream">
        <p class="cine-kicker">Recorrido</p>
        <h2 class="cine-title">Cinco estaciones. Un expediente.</h2>
        <p class="cine-lede">El dossier avanza por recepción, documentos, revisión, firma y cierre.</p>
        <div class="ls-rail ls-choreo lp-reveal" role="list">
          @for (step of workflow; track step.id; let i = $index) {
            <button
              type="button"
              class="ls-station"
              role="listitem"
              [attr.aria-current]="journeyFocus === i ? 'step' : null"
              (click)="onJourneySelect(i)"
            >
              <span class="cine-kicker">0{{ step.n }}</span>
              <h3>{{ step.title }}</h3>
              <p>{{ step.desc }}</p>
            </button>
          }
        </div>
        <app-demo-case-window [mode]="journeyMode" [activeStep]="journeyFocus + 1" />
      </app-cinematic-scene>

      <app-cinematic-scene sceneId="precios" [act]="1" theme="cream">
        <p class="cine-kicker">Licencia</p>
        <div class="ls-license-plate">
          <p class="cine-kicker">Más usada</p>
          <h2>{{ featuredPlan.name }}</h2>
          <p>{{ featuredPlan.audience }}</p>
          <div class="price">\${{ featuredPlan.price }}<small>/mes</small></div>
          <ul>
            @for (item of featuredPlan.items; track item) { <li>{{ item }}</li> }
          </ul>
          <a
            routerLink="/auth"
            [queryParams]="{ returnUrl: '/abogado/fase2/billing' }"
            class="lp-btn lp-btn-primary"
          >Ver licencia</a>
        </div>
        <div class="ls-plan-type">
          @for (plan of sidePlans; track plan.name) {
            <article>
              <div>
                <h3>{{ plan.name }}</h3>
                <p class="lp-muted">{{ plan.audience }}</p>
              </div>
              <strong>\${{ plan.price }}</strong>
            </article>
          }
        </div>
      </app-cinematic-scene>

      <app-cinematic-scene sceneId="faq" [act]="1">
        <p class="cine-kicker">Preguntas</p>
        <h2 class="cine-title">Antes de empezar</h2>
        <app-landing-faq [items]="faq" />
      </app-cinematic-scene>

      <app-cinematic-scene sceneId="enterprise" [act]="1" theme="ink">
        <p class="cine-kicker">Enterprise</p>
        <h2 class="cine-title">Aislamiento para firmas</h2>
        <p class="cine-lede">Instancia dedicada, SSO y SLA. Solicita una consulta comercial.</p>
        <button type="button" class="lp-btn lp-btn-primary" (click)="notify('Enterprise')">Solicitar consulta</button>
        <div class="lp-enterprise-grid" style="margin-top:2rem">
          @for (e of enterprise; track e.title) {
            <article>
              <h3>{{ e.title }}</h3>
              <p>{{ e.desc }}</p>
            </article>
          }
        </div>
      </app-cinematic-scene>

      <app-cinematic-scene [act]="1" theme="cream">
        <div class="ls-close-cta lp-reveal">
          <p class="cine-kicker">Cierre</p>
          <h2 class="cine-title">El expediente vuelve a la portada</h2>
          <p class="cine-lede">Abre Divorcio360 y recorre el trámite como una sola película.</p>
          <a routerLink="/productos/divorcio360" class="lp-btn lp-btn-primary ls-hero-cta" (click)="armProduct(featuredProduct)">
            Abrir Divorcio360
          </a>
        </div>
      </app-cinematic-scene>

      @if (toast) {
        <div class="lp-toast toast-fade" role="status" aria-live="polite">{{ toast }}</div>
      }
    </div>
  `,
  styles: [`
    .legalstation-landing { background: var(--bg); }
    .ls-hero-product app-demo-case-window { display: block; margin-top: 1.5rem; }
    .ls-offset-window h3 {
      margin: 0.5rem 0 0.65rem;
      font-family: var(--font-sans);
      font-size: clamp(1.8rem, 3vw, 2.6rem);
      letter-spacing: -0.03em;
    }
    .ls-license-plate h2 {
      margin: 0 0 0.4rem;
      font-family: var(--font-sans);
      font-size: clamp(2rem, 4vw, 3rem);
    }
    .ls-license-plate .price small { font-size: 1.1rem; margin-left: 0.35rem; }
    .soon-wrap { margin-top: 2.5rem; }
    .soon-item {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 0.75rem;
      padding-block: 0.85rem;
      border-bottom: 1px solid color-mix(in srgb, #fff 12%, transparent);
    }
    .toast-fade { opacity: 1; }
    .lp-enterprise-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    @media (max-width: 720px) {
      .soon-item, .lp-enterprise-grid { grid-template-columns: 1fr; }
    }
  `],
})
export class SaasLandingComponent implements AfterViewInit, OnDestroy {
  toast = '';
  liveProducts = LEGALSTATION_CATALOG.filter((p) => p.live);
  featuredProduct = this.liveProducts.find((p) => p.id === 'divorcio360') ?? null;
  supportingProducts = this.liveProducts.filter((p) => p.id !== 'divorcio360');
  comingSoon = LEGALSTATION_CATALOG.filter((p) => !p.live);
  workflow = LEGALSTATION_WORKFLOW;
  journeyFocus = 1;
  plans = LEGALSTATION_PLANS;
  featuredPlan = LEGALSTATION_PLANS.find((p) => p.featured) ?? LEGALSTATION_PLANS[1];
  sidePlans = LEGALSTATION_PLANS.filter((p) => !p.featured);
  enterprise = LEGALSTATION_ENTERPRISE;
  faq = LEGALSTATION_FAQ;
  private io?: IntersectionObserver;
  private toastTimer?: ReturnType<typeof setTimeout>;

  constructor(private router: Router, private host: ElementRef<HTMLElement>) {}

  get journeyMode(): DemoCaseMode {
    if (this.journeyFocus <= 1) return 'overview';
    if (this.journeyFocus === 2) return 'documents';
    if (this.journeyFocus === 3) return 'signature';
    return 'payment';
  }

  ngAfterViewInit(): void {
    const nodes = this.host.nativeElement.querySelectorAll('.ls-choreo, .lp-reveal');
    let remaining = 0;
    this.io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('is-choreo', 'is-in-view');
          this.io?.unobserve(entry.target);
          remaining -= 1;
          if (remaining <= 0) this.io?.disconnect();
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.14 },
    );
    nodes.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const alreadyIn = rect.top < window.innerHeight * 0.88 && rect.bottom > 0;
      if (alreadyIn) {
        el.classList.add('is-choreo', 'is-in-view');
        return;
      }
      remaining += 1;
      this.io!.observe(el);
    });
    if (remaining <= 0) this.io.disconnect();
  }

  ngOnDestroy(): void {
    this.io?.disconnect();
    if (this.toastTimer !== undefined) clearTimeout(this.toastTimer);
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

  onJourneySelect(index: number): void {
    this.journeyFocus = index;
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
