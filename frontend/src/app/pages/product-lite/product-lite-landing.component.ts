import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { IconComponent } from '../../shared/icon.component';

@Component({
  selector: 'app-product-lite-landing',
  standalone: true,
  imports: [RouterLink, IconComponent],
  styles: [`
    .traslado-landing { --lp-accent: #4a7eb8; --lp-accent-deep: #3a6599; --lp-accent-soft: #e8f0f8; }
    .bienraiz-landing { --lp-accent: #8b6b4a; --lp-accent-deep: #705539; --lp-accent-soft: #f5efe8; }

    .crumb-row {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      flex-wrap: wrap;
    }

    .lite-cta {
      display: flex;
      justify-content: center;
      margin-top: var(--space-6);
    }
  `],
  template: `
    <div class="landing-page" [class]="themeClass">
      <nav class="lp-shell lp-crumb crumb-row" aria-label="Dónde estás">
        <a routerLink="/">LegalStation</a>
        <app-icon name="chevron-right" [size]="14" />
        <span aria-current="page">{{ name }}</span>
      </nav>
      <section class="lp-section soft">
        <div class="lp-shell">
          <div class="lp-section-head">
            <p class="lp-eyebrow">Pagas una sola vez</p>
            <h2>{{ name }} — <span class="lp-highlight">un solo pago.</span></h2>
            <p>Sin cuotas mensuales. Acuerdo entre las dos partes, tus documentos y la reunión con el notario por videollamada.</p>
          </div>
          <div class="lp-values">
            <article class="lp-value lp-lift">
              <h3>Formulario corto</h3>
              <p>Contestas unas preguntas sencillas en pocos minutos.</p>
            </article>
            <article class="lp-value lp-lift">
              <h3>Un solo pago</h3>
              <p>Desde \${{ price }}. No pagas ninguna mensualidad.</p>
            </article>
            <article class="lp-value lp-lift">
              <h3>Notario incluido</h3>
              <p>Reservas la reunión y el notario aprueba tu trámite.</p>
            </article>
          </div>
          <div class="lite-cta">
            <a [routerLink]="intakeRoute" class="lp-btn lp-btn-primary">
              Empezar mi trámite
              <app-icon name="arrow-right" [size]="16" />
            </a>
          </div>
        </div>
      </section>
    </div>
  `,
})
export class ProductLiteLandingComponent {
  name = 'Traslado360';
  price = 199;
  themeClass = 'traslado-landing';
  intakeRoute = '/intake/traslado360';

  constructor(private route: ActivatedRoute, public auth: AuthService) {
    const p = this.route.snapshot.data['product'] as string;
    if (p === 'bienraiz360') {
      this.name = 'BienRaiz360';
      this.price = 299;
      this.themeClass = 'bienraiz-landing';
      this.intakeRoute = '/intake/bienraiz360';
    }
  }
}
