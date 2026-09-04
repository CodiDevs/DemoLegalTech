import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { PRODUCT_SITES, setActiveProduct, getProductQuestionnairePath } from '../../shared/product-sites.data';
import { HeroScrollVideoPinRevealComponent } from './hero-scroll-video-pin-reveal.component';
import { CinematicLogoCloudComponent, LogoCloudClient } from './cinematic-logo-cloud.component';
import { LandingStatisticsComponent } from './landing-statistics.component';
import { IconComponent } from '../../shared/icon.component';

@Component({
  selector: 'app-divorcio-landing',
  standalone: true,
  imports: [RouterLink, HeroScrollVideoPinRevealComponent, CinematicLogoCloudComponent, LandingStatisticsComponent, IconComponent],
  template: `
    <div class="landing-page divorcio-landing">
      <nav class="lp-shell lp-crumb" aria-label="Ruta de navegación">
        <a routerLink="/">LegalStation</a>
        <app-icon name="chevron-right" [size]="14" />
        <span>Divorcio360</span>
      </nav>

      <app-hero-scroll-video-pin-reveal />

      <section class="lp-tools-band">
        <div class="lp-shell">
          <div class="lp-action">
            <p class="lp-action-label">Míralo en acción</p>
            <div class="lp-carousel-layout">
              <div class="lp-carousel-copy">
                <h3>Expediente Divorcio360</h3>
                <p>Timeline del expediente, documentos, firma electrónica y mensajes LegalStation. Todo en un solo flujo demo.</p>
                <a (click)="startEvaluation($event)" href="#" class="lp-link">
                  Evaluar mi caso
                  <app-icon name="arrow-right" [size]="16" />
                </a>
              </div>
              <div class="ps-mock-ui">
                <div class="ps-mock-bar">
                  <span></span><span></span><span></span>
                  <strong>{{ site.name }} — expediente de ejemplo</strong>
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
          </div>
        </div>
      </section>

      <section class="lp-section soft" id="flujo">
        <div class="lp-shell">
          <div class="lp-section-head">
            <p class="lp-eyebrow">Un flujo Divorcio360</p>
            <h2>Seis pasos conectados. <span class="lp-highlight">Un solo expediente.</span></h2>
            <p>Desde la calificación hasta la notaría, sin saltar entre herramientas.</p>
          </div>
          <div #stepsRoot class="lp-steps" [class.lp-steps-in]="stepsRevealed">
            @for (s of site.workflow; track s.title; let i = $index) {
              <article class="lp-step" [style.--lp-i]="i">
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
            <p class="lp-eyebrow">¿Por qué Divorcio360?</p>
            <h2>Diseñado para <span class="lp-highlight">firmas y clientes.</span></h2>
          </div>
          <div class="lp-values">
            @for (v of site.values ?? []; track v.title) {
              <article class="lp-value">
                <h3>{{ v.title }}</h3>
                <p>{{ v.desc }}</p>
              </article>
            }
          </div>
        </div>
      </section>

      <section class="lp-section soft" id="capacidades">
        <div class="lp-shell">
          <div class="lp-section-head">
            <p class="lp-eyebrow">Capacidades</p>
            <h2>Todo lo que necesitas <span class="lp-highlight">en un trámite.</span></h2>
          </div>
          <app-landing-statistics theme="divorcio" [stats]="site.stats" />
        </div>
      </section>

      <section class="lp-section">
        <div class="lp-shell">
          <div class="lp-section-head">
            <p class="lp-eyebrow">Clientes demo</p>
            <h2>Confianza de <span class="lp-highlight">firmas y familias.</span></h2>
          </div>
          <app-cinematic-logo-cloud theme="divorcio" variant="grid" [clients]="clientLogos" />
        </div>
      </section>

      <section class="lp-section soft" id="precios">
        <div class="lp-shell">
          <div class="lp-section-head">
            <p class="lp-eyebrow">Pago por trámite</p>
            <h2>Honorarios claros <span class="lp-highlight">sin suscripción.</span></h2>
            <p>Un solo pago por caso: no hay membresía mensual para el cliente final.</p>
          </div>
          <div class="lp-pricing">
            @for (plan of site.plans; track plan.name) {
              <article class="lp-plan lp-lift" [class.featured]="plan.featured">
                @if (plan.featured) { <span class="lp-plan-tag">Más común</span> }
                <h3>{{ plan.name }}</h3>
                <p class="lp-muted">{{ plan.audience }}</p>
                @if (plan.price === 0) {
                  <div class="lp-plan-price">Sin costo</div>
                } @else {
                  <div class="lp-plan-price">\${{ plan.price }}<small>+</small></div>
                }
                <ul>
                  @for (item of plan.items; track item) { <li>{{ item }}</li> }
                </ul>
                @if (plan.featured) {
                  <a (click)="startEvaluation($event)" href="#" class="lp-btn lp-btn-primary">Evaluar mi caso</a>
                } @else {
                  <a (click)="startEvaluation($event)" href="#" class="lp-btn lp-btn-tertiary">Evaluar mi caso</a>
                }
              </article>
            }
          </div>
        </div>
      </section>

      <section class="lp-cta-panel">
        <div class="lp-shell">
          <div class="lp-cta-inner">
            <p class="lp-cta-eyebrow">Listo cuando tú lo estés</p>
            <h2>{{ site.ctaTitle }}</h2>
            <p>Responde el cuestionario en minutos. Si calificas, continúas con registro, pago y expediente digital.</p>
            <div class="lp-cta-buttons">
              <a (click)="startEvaluation($event)" href="#" class="lp-cta-primary">Evaluar mi caso</a>
              <a routerLink="/" class="lp-cta-ghost">Volver a LegalStation</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .divorcio-landing {
      --lp-accent: #4a9e96;
      --lp-accent-deep: #3a827b;
      --lp-accent-soft: #e8f6f4;
      --lp-accent-ink: #2e6e67;
      --lp-bg: #f7fcfb;
      --lp-bg-soft: #eef8f6;
    }

    .lp-tools-band {
      background: var(--lp-bg-soft);
      padding: 2.5rem 0 4rem;
      border-top: 1px solid var(--lp-border);
    }
  `]
})
export class DivorcioLandingComponent implements OnInit, AfterViewInit, OnDestroy {
  readonly site = PRODUCT_SITES['divorcio360'];

  @ViewChild('stepsRoot') stepsRoot?: ElementRef<HTMLElement>;
  stepsRevealed = false;
  private stepsObserver?: IntersectionObserver;

  clientLogos: LogoCloudClient[] = [
    { name: 'LegalStation', tone: 'accent' },
    { name: 'Divorcio360', tone: 'bold' },
    { name: 'Bufete Ruiz & Cía.', tone: 'serif' },
    { name: 'Estudio Pérez Lara', tone: 'default' },
    { name: 'Mendoza Legal', tone: 'lowercase' },
    { name: 'Vega & Asociados', tone: 'wide' },
    { name: 'Corporativo EC', tone: 'bold' },
    { name: 'Alfaro Abogados', tone: 'default' },
    { name: 'PayPhone demo', tone: 'wide' },
    { name: 'SATJE de demostración', tone: 'serif' },
    { name: 'SignDesk', tone: 'default' },
    { name: 'CodiDevs', tone: 'accent' },
  ];

  constructor(public auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    setActiveProduct('divorcio360');
  }

  ngAfterViewInit(): void {
    const el = this.stepsRoot?.nativeElement;
    const reduce = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !el || typeof IntersectionObserver === 'undefined') {
      this.stepsRevealed = true;
      return;
    }

    this.stepsObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          this.stepsRevealed = true;
          this.stepsObserver?.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    this.stepsObserver.observe(el);
  }

  ngOnDestroy(): void {
    this.stepsObserver?.disconnect();
  }

  startEvaluation(event: Event): void {
    event.preventDefault();
    void this.router.navigateByUrl(getProductQuestionnairePath('divorcio360'));
  }
}
