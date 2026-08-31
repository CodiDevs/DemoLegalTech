import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { HeroScrollVideoPinRevealComponent } from './hero-scroll-video-pin-reveal.component';
import { LandingStatisticsComponent, StatItem } from './landing-statistics.component';

@Component({
  selector: 'app-divorcio-landing',
  standalone: true,
  imports: [RouterLink, HeroScrollVideoPinRevealComponent, LandingStatisticsComponent],
  styleUrls: ['../../../styles/landing-shared.scss'],
  template: `
    <div class="landing-page divorcio-landing">
      <p class="lp-shell lp-crumb"><a routerLink="/">LegalStation</a> › Divorcio360</p>

      <app-hero-scroll-video-pin-reveal />

      <section class="lp-tools-band">
        <div class="lp-shell">
          <div class="lp-action">
            <p class="lp-action-label">Míralo en acción</p>
            <div class="lp-carousel-layout">
              <div class="lp-carousel-copy">
                <h3>Expediente Divorcio360</h3>
                <p>Timeline del expediente, documentos, firma electrónica y mensajes LegalStation. Un solo flujo demo.</p>
                <a routerLink="/cuestionario" class="lp-link">Comenzar</a>
              </div>
              <div class="lp-carousel-panel">
                <div class="lp-carousel-frame">
                  <img
                    src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1400&q=80"
                    alt="Expediente Divorcio360, vista demo"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="lp-section soft" id="flujo">
        <div class="lp-shell">
          <div class="lp-section-head">
            <h2>Cinco pasos conectados. <span class="lp-highlight">Un solo expediente.</span></h2>
            <p>Desde la calificación hasta la notaría, sin saltar entre herramientas.</p>
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
            <h2>Diseñado para <span class="lp-highlight">firmas y clientes.</span></h2>
          </div>
          <div class="lp-values">
            @for (v of values; track v.title) {
              <article class="lp-value lp-lift">
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
            <h2>Tres cifras <span class="lp-highlight">de esta demo.</span></h2>
          </div>
          <app-landing-statistics theme="divorcio" [stats]="stats" />
        </div>
      </section>

      <section class="lp-section" id="precios">
        <div class="lp-shell">
          <div class="lp-section-head">
            <p class="lp-eyebrow">Pago por trámite</p>
            <h2>Honorarios claros <span class="lp-highlight">sin suscripción.</span></h2>
            <p>Un solo pago por caso. No hay membresía mensual para el cliente final.</p>
          </div>
          <div class="lp-pricing">
            @for (plan of plans; track plan.name) {
              <article class="lp-plan lp-lift" [class.featured]="plan.featured">
                @if (plan.featured) { <span class="lp-plan-tag">Más común</span> }
                <h3>{{ plan.name }}</h3>
                <p class="lp-muted">{{ plan.audience }}</p>
                <div class="lp-plan-price">\${{ plan.price }}<small>+</small></div>
                <ul>
                  @for (item of plan.items; track item) { <li>{{ item }}</li> }
                </ul>
                  <a routerLink="/cuestionario" class="lp-btn lp-btn-primary">Comenzar</a>
              </article>
            }
          </div>
        </div>
      </section>

      <section class="lp-cta-panel">
        <div class="lp-shell">
          <div class="lp-cta-inner">
            <h2>¿Listo para iniciar tu trámite?</h2>
            <p>Responde el cuestionario en minutos. Si calificas, continúas con registro, pago y expediente digital.</p>
            <div class="lp-cta-buttons">
              <a routerLink="/cuestionario" class="lp-cta-primary">Comenzar</a>
              <a routerLink="/" class="lp-cta-ghost">Volver a LegalStation</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .divorcio-landing {
      --lp-accent: var(--brand);
      --lp-accent-deep: var(--brand-deep);
      --lp-accent-soft: oklch(0.94 0.03 190);
      --lp-bg: var(--paper);
      --lp-bg-soft: oklch(0.94 0.012 210);
    }

    .lp-muted { color: var(--lp-ink-muted); font-size: 0.9rem; margin: 0; }

    .lp-tools-band {
      background: var(--lp-bg-soft);
      padding: 2.5rem 0 4rem;
      border-top: 1px solid var(--lp-border);
    }
  `]
})
export class DivorcioLandingComponent {
  stats: StatItem[] = [
    { label: 'Estados trazables', value: '10', detail: 'Timeline único para cliente y operador.', icon: 'file' },
    { label: 'Tiempo de intake', value: '5 min', detail: 'Cuestionario condicional con resultado inmediato.', icon: 'check' },
    { label: 'Honorarios desde', value: '$349', detail: 'Precio orientativo si calificas verde.', icon: 'scale' },
  ];

  workflow = [
    { n: 1, title: 'Calificar', desc: '12–15 preguntas con resultado verde, amarillo o rojo.' },
    { n: 2, title: 'Pagar', desc: 'Honorarios de demostración tras aptitud notarial. Pago único, sin suscripción.' },
    { n: 3, title: 'Cargar', desc: 'Cédula y partida con revisión del operador.' },
    { n: 4, title: 'Consultar', desc: 'Videollamada de demostración con tu abogado para revisar el expediente.' },
    { n: 5, title: 'Firmar', desc: 'Minuta generada y firma con evidencia IP.' },
    { n: 6, title: 'Notaría', desc: 'Reunión notarial virtual y cierre del expediente.' },
  ];

  values = [
    { title: 'Filtro antes de cobrar', desc: 'Solo casos aptos avanzan a documentos y pago. Menos tiempo perdido.' },
    { title: 'Expediente único', desc: 'Cliente y operador ven el mismo timeline de 10 estados.' },
    { title: 'Autoservicio real', desc: 'Mensajes, documentos y firma sin depender del teléfono.' },
  ];

  plans = [
    { name: 'Apto notarial', audience: 'Mutuo consentimiento sin conflictos', price: 349, items: ['Cuestionario verde', 'Flujo completo de demostración', 'Expediente trazable', 'Firma documental incluida'], featured: true },
    { name: 'Evaluación', audience: 'Casos con complejidad media', price: 749, items: ['Resultado amarillo', 'Revisión humana', 'Plan personalizado', 'Agenda demo'], featured: false },
    { name: 'Derivación', audience: 'No apto vía simplificada', price: 0, items: ['Resultado rojo', 'Orientación jurídica', 'Sin cobro automático', 'Contacto operador'], featured: false },
  ];

  constructor(public auth: AuthService) {}
}
