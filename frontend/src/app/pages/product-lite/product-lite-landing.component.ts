import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-product-lite-landing',
  standalone: true,
  imports: [RouterLink],
  styleUrls: ['../../../styles/landing-shared.scss'],
  styles: [`
    .traslado-landing { --lp-accent: #4a7eb8; --lp-accent-deep: #3a6599; --lp-accent-soft: #e8f0f8; }
    .bienraiz-landing { --lp-accent: #8b6b4a; --lp-accent-deep: #705539; --lp-accent-soft: #f5efe8; }
  `],
  template: `
    <div class="landing-page" [class]="themeClass">
      <p class="lp-shell lp-crumb"><a routerLink="/">LegalStation</a> › {{ name }}</p>
      <section class="lp-section soft">
        <div class="lp-shell">
          <div class="lp-section-head">
            <p class="lp-eyebrow">Pago por trámite</p>
            <h2>{{ name }} — <span class="lp-highlight">honorario único.</span></h2>
            <p>Sin suscripción mensual. Mutuo acuerdo, documentos y reunión notarial virtual.</p>
          </div>
          <div class="lp-values">
            <article class="lp-value lp-lift"><h3>Formulario corto</h3><p>Intake demo en minutos — siempre apto para walkthrough.</p></article>
            <article class="lp-value lp-lift"><h3>Un solo pago</h3><p>Honorarios mock desde \${{ price }} — el cliente no paga licencia SaaS.</p></article>
            <article class="lp-value lp-lift"><h3>Notario incluido</h3><p>Agenda reunión y aprobación en panel notario demo.</p></article>
          </div>
          <div style="text-align:center;margin-top:2rem">
            <a [routerLink]="intakeRoute" class="lp-btn lp-btn-primary">Iniciar trámite demo →</a>
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
