import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { ProductFlowShellComponent } from '../../shared/product-flow-shell.component';

interface ProductMeta {
  id: string;
  name: string;
  theme: 'traslado' | 'bienraiz';
  price: number;
  doc1: string;
  doc2: string;
}

const PRODUCTS: Record<string, ProductMeta> = {
  traslado360: {
    id: 'traslado360', name: 'Traslado360', theme: 'traslado', price: 199,
    doc1: 'Matrícula vehicular', doc2: 'Acuerdo de traslado firmado',
  },
  bienraiz360: {
    id: 'bienraiz360', name: 'BienRaiz360', theme: 'bienraiz', price: 299,
    doc1: 'Escritura o título del inmueble', doc2: 'Acuerdo mutuo de traslado',
  },
};

@Component({
  selector: 'app-product-intake',
  standalone: true,
  imports: [FormsModule, RouterLink, ProductFlowShellComponent],
  template: `
    <app-product-flow-shell
      [theme]="meta.theme"
      [crumb]="[{ label: 'LegalStation', link: '/' }, { label: meta.name }]"
      eyebrow="Inicio de trámite"
      [title]="'Formulario ' + meta.name"
      subtitle="Mutuo acuerdo — pago único, sin suscripción."
    >
      <div class="pf-card lp-lift">
        @if (!done) {
          <p class="pf-muted">Paso {{ step }} de 3</p>
          @if (step === 1) {
            <h2>Datos del trámite</h2>
            <div class="pf-field"><label>Ciudad</label><input [(ngModel)]="city" placeholder="Quito" /></div>
            <div class="pf-field"><label>¿Ambas partes están de acuerdo?</label>
              <select [(ngModel)]="mutual"><option [ngValue]="true">Sí</option><option [ngValue]="false">No</option></select>
            </div>
            <button type="button" class="lp-btn lp-btn-primary" [disabled]="!city || !mutual" (click)="step = 2">Continuar</button>
          }
          @if (step === 2) {
            <h2>Resumen</h2>
            <p>Honorario único: <strong>\${{ meta.price }}</strong> — sin membresía.</p>
            <ul class="lp-list-tt">
              <li>{{ meta.doc1 }}</li>
              <li>{{ meta.doc2 }}</li>
              <li>Reunión virtual con notario</li>
            </ul>
            @if (auth.isLoggedIn) {
              <button type="button" class="lp-btn lp-btn-primary" (click)="start()" [disabled]="busy">
                {{ busy ? 'Creando…' : 'Iniciar trámite' }}
              </button>
            } @else {
              <a [routerLink]="['/auth']" [queryParams]="authParams" class="lp-btn lp-btn-primary">Registrarme para continuar</a>
            }
          }
        } @else {
          <p class="pf-ok">Caso creado — continúa con el pago único.</p>
          <a [routerLink]="['/checkout', caseId]" class="lp-btn lp-btn-primary">Pagar \${{ meta.price }}</a>
        }
      </div>
    </app-product-flow-shell>
  `,
})
export class ProductIntakeComponent {
  meta!: ProductMeta;
  step = 1;
  city = 'Quito';
  mutual = true;
  busy = false;
  done = false;
  caseId = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
    public auth: AuthService,
  ) {
    const id = this.route.snapshot.data['product'] as string;
    this.meta = PRODUCTS[id] || PRODUCTS['traslado360'];
  }

  get authParams() {
    return { product: this.meta.id, returnUrl: `/intake/${this.meta.id}` };
  }

  start(): void {
    this.busy = true;
    const q = { city: this.city, mutual_agreement: this.mutual, product: this.meta.id };
    this.api.createCase('apto', this.city, q as any, this.meta.id).subscribe({
      next: (c) => {
        this.caseId = c.id;
        this.done = true;
        this.busy = false;
      },
      error: () => { this.busy = false; },
    });
  }
}
