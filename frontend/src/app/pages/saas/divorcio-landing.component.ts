import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import {
  PRODUCT_SITES,
  getMarketingPrimaryAction,
  setActiveProduct,
} from '../../shared/product-sites.data';
import { HeroScrollVideoPinRevealComponent } from './hero-scroll-video-pin-reveal.component';
import { IconComponent } from '../../shared/icon.component';
import { CinematicSceneComponent } from '../../shared/motion/cinematic-scene.component';
import { DemoCaseWindowComponent, DemoCaseMode } from '../../shared/demo/demo-case-window.component';
import { DemoDocumentStackComponent } from '../../shared/demo/demo-document-stack.component';

const FLOW_MODES: DemoCaseMode[] = ['overview', 'payment', 'documents', 'signature'];

@Component({
  selector: 'app-divorcio-landing',
  standalone: true,
  imports: [
    RouterLink,
    HeroScrollVideoPinRevealComponent,
    IconComponent,
    CinematicSceneComponent,
    DemoCaseWindowComponent,
    DemoDocumentStackComponent,
  ],
  template: `
    <div class="landing-page divorcio-landing">
      <nav class="lp-shell lp-crumb" aria-label="Ruta de navegación">
        <a routerLink="/">LegalStation</a>
        <app-icon name="chevron-right" [size]="14" />
        <span>Divorcio360</span>
      </nav>

      <app-hero-scroll-video-pin-reveal />

      <app-cinematic-scene sceneId="sistema" [act]="2" theme="cream">
        <p class="cine-kicker">Un expediente</p>
        <h2 class="cine-title">Cliente y abogado, misma cámara</h2>
        <div class="dv-split">
          <article>
            <p class="cine-kicker">Cliente</p>
            <h3>{{ site.values?.[0]?.title }}</h3>
            <p>{{ site.values?.[0]?.desc }}</p>
            <p>{{ site.values?.[1]?.desc }}</p>
          </article>
          <article>
            <p class="cine-kicker">Abogado</p>
            <h3>{{ site.values?.[2]?.title }}</h3>
            <p>{{ site.values?.[2]?.desc }}</p>
            <p>Bandeja, documentos y minuta sobre el mismo folio que ve el cliente.</p>
          </article>
        </div>
      </app-cinematic-scene>

      <app-cinematic-scene sceneId="evidencia" [act]="2" theme="ink">
        <p class="cine-kicker">Cada etapa deja evidencia</p>
        <h2 class="cine-title">{{ site.stats[0].value }} · {{ site.stats[2].value }}</h2>
        <p class="cine-lede">{{ site.stats[0].detail }} Honorario de referencia {{ site.stats[2].value }}.</p>
        <app-demo-document-stack variant="archive" />
      </app-cinematic-scene>

      <app-cinematic-scene sceneId="flujo" [act]="2" theme="cream">
        <p class="cine-kicker">Todo el recorrido</p>
        <h2 class="cine-title">Cuestionario, pago, docs y firma. Un marco.</h2>
        <div class="dv-flow-switch">
          @for (step of site.workflow; track step.n; let i = $index) {
            @if (i < 4) {
              <button type="button" class="lp-btn lp-btn-outline" (click)="journeyFocus = i">
                {{ step.screen }}
              </button>
            }
          }
        </div>
        <app-demo-case-window [mode]="flowMode" [activeStep]="journeyFocus + 1" />
      </app-cinematic-scene>

      <app-cinematic-scene sceneId="precios" [act]="2" theme="cream">
        <div class="dv-price-stage">
          <p class="cine-kicker">Empieza aquí</p>
          <p class="amount">$349</p>
          <h2 class="cine-title">{{ ctaTitle }}</h2>
          <p class="cine-lede">{{ ctaBody }} No incluye gastos notariales.</p>
          <a [routerLink]="primaryAction.path" class="lp-btn lp-btn-primary lp-cta-primary">
            {{ primaryAction.label }}
          </a>
          <a routerLink="/" class="lp-cta-ghost">Volver a LegalStation</a>
        </div>
      </app-cinematic-scene>
    </div>
  `,
  styles: [`
    .divorcio-landing { background: var(--bg); }
    .dv-flow-switch {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin: 0 0 1.5rem;
    }
    .dv-split h3 {
      font-family: var(--font-sans);
      font-size: clamp(1.6rem, 3vw, 2.2rem);
      letter-spacing: -0.03em;
      margin: 0 0 0.75rem;
    }
    #sistema, #flujo, #evidencia, #precios { scroll-margin-top: 5.5rem; }
  `],
})
export class DivorcioLandingComponent implements OnInit, AfterViewInit, OnDestroy {
  readonly site = PRODUCT_SITES['divorcio360'];
  journeyFocus = 0;
  private io?: IntersectionObserver;

  constructor(public auth: AuthService, private host: ElementRef<HTMLElement>) {}

  get primaryAction() {
    return getMarketingPrimaryAction(this.auth.user()?.role ?? null, 'divorcio360');
  }

  get flowMode(): DemoCaseMode {
    return FLOW_MODES[Math.min(this.journeyFocus, FLOW_MODES.length - 1)];
  }

  get ctaTitle(): string {
    if (this.auth.isLoggedIn && this.auth.user()?.role === 'cliente') return 'Tu expediente sigue abierto';
    if (this.auth.isLoggedIn) return 'Sigue los casos desde el panel';
    return this.site.ctaTitle;
  }

  get ctaBody(): string {
    if (this.auth.isLoggedIn && this.auth.user()?.role === 'cliente') {
      return 'Revisa estados, documentos y mensajes en el mismo seguimiento que ve tu operador.';
    }
    if (this.auth.isLoggedIn) {
      return 'Bandeja, documentos y firma documental: el mismo expediente que ve el cliente.';
    }
    return 'Responde el cuestionario en minutos. Si calificas, continúas con registro, pago y expediente digital.';
  }

  ngOnInit(): void {
    setActiveProduct('divorcio360');
  }

  ngAfterViewInit(): void {
    const nodes = this.host.nativeElement.querySelectorAll('.lp-reveal');
    this.io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('is-in-view');
          this.io?.unobserve(entry.target);
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.12 },
    );
    nodes.forEach((el) => this.io!.observe(el));
  }

  ngOnDestroy(): void {
    this.io?.disconnect();
  }
}
