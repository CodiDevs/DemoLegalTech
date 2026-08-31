import { Component, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService, CaseItem } from '../../core/api.service';
import { ProductFlowShellComponent } from '../../shared/product-flow-shell.component';
import { productThemeFromCase } from '../../shared/product-sites.data';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [FormsModule, RouterLink, DecimalPipe, ProductFlowShellComponent],
  template: `
    <app-product-flow-shell
      [theme]="theme"
      [crumb]="[{ label: 'LegalStation', link: '/' }, { label: 'Pago único' }]"
      eyebrow="Payphone mock"
      title="Pago del trámite"
      subtitle="Un solo cobro — sin suscripción mensual."
    >
      @if (caseItem) {
        <div class="pf-card lp-lift">
          <p class="pf-muted">Caso #{{ caseItem.id }} · {{ caseItem.product }} · {{ caseItem.status_label }}</p>
          <p class="lp-plan-price" style="font-size:2.4rem;margin:0.75rem 0">\${{ caseItem.amount_cents / 100 | number:'1.2-2' }}<small> USD</small></p>
          <div class="pf-field"><label>Titular</label><input [(ngModel)]="holder" /></div>
          <div class="pf-field"><label>Tarjeta (demo)</label><input [(ngModel)]="card" placeholder="4242 4242 4242 4242" /></div>
          <div class="pf-row">
            <div class="pf-field"><label>Vence</label><input [(ngModel)]="exp" placeholder="12/28" /></div>
            <div class="pf-field"><label>CVV</label><input [(ngModel)]="cvv" placeholder="123" /></div>
          </div>
          @if (error) { <p class="pf-err">{{ error }}</p> }
          @if (done) {
            <div class="pf-receipt">
              <span class="pf-badge">Pago único confirmado</span>
              <p class="pf-ok" style="margin-top:0.75rem">Referencia: {{ ref }}</p>
              <p class="pf-muted">Siguiente paso: cargar documentos y consulta con abogado.</p>
            </div>
            <a class="lp-btn lp-btn-primary" [routerLink]="['/upload', caseItem.id]">Cargar documentos →</a>
          } @else {
            <button class="lp-btn lp-btn-primary" type="button" (click)="pay()" [disabled]="busy">
              {{ busy ? 'Procesando…' : 'Pagar con Payphone (mock)' }}
            </button>
          }
        </div>
      }
    </app-product-flow-shell>
  `,
})
export class CheckoutComponent implements OnInit {
  caseItem: CaseItem | null = null;
  holder = 'Carlos Mendoza';
  card = '4242 4242 4242 4242';
  exp = '12/28';
  cvv = '123';
  busy = false;
  done = false;
  ref = '';
  error = '';
  theme = productThemeFromCase();

  constructor(private route: ActivatedRoute, private api: ApiService, private router: Router) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.api.getCase(id).subscribe({
      next: (d) => {
        this.caseItem = d.case;
        this.theme = productThemeFromCase(d.case?.product);
      },
      error: () => this.router.navigate(['/cliente']),
    });
  }

  pay(): void {
    if (!this.caseItem) return;
    this.busy = true;
    this.error = '';
    this.api.mockPay(this.caseItem.id, this.holder, this.card.slice(-4)).subscribe({
      next: (r) => {
        this.busy = false;
        this.done = true;
        this.ref = r.reference || 'MOCK-OK';
        this.caseItem!.paid = true;
      },
      error: (e) => {
        this.busy = false;
        this.error = e?.error?.error || 'Error en pago mock';
      },
    });
  }
}
