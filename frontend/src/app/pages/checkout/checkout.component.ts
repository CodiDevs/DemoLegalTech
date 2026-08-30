import { Component, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService, CaseItem } from '../../core/api.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [FormsModule, RouterLink, DecimalPipe],
  template: `
    <div class="shell wrap">
      <p class="badge-demo">Payphone mock · sin cobro real</p>
      <h1>Pago del trámite</h1>
      @if (caseItem) {
        <div class="panel">
          <p>Caso #{{ caseItem.id }} · {{ caseItem.status_label }}</p>
          <p class="amount">\${{ caseItem.amount_cents / 100 | number:'1.2-2' }} USD</p>
          <div class="field"><label>Titular</label><input [(ngModel)]="holder" /></div>
          <div class="field"><label>Tarjeta (demo)</label><input [(ngModel)]="card" placeholder="4242 4242 4242 4242" /></div>
          <div class="row">
            <div class="field"><label>Vence</label><input [(ngModel)]="exp" placeholder="12/28" /></div>
            <div class="field"><label>CVV</label><input [(ngModel)]="cvv" placeholder="123" /></div>
          </div>
          @if (error) { <p class="err">{{ error }}</p> }
          @if (done) {
            <p class="ok">Pago simulado OK. Referencia: {{ ref }}</p>
            <a class="btn btn-primary" [routerLink]="['/upload', caseItem.id]">Cargar documentos</a>
          } @else {
            <button class="btn btn-primary" type="button" (click)="pay()" [disabled]="busy">
              {{ busy ? 'Procesando…' : 'Pagar con Payphone (mock)' }}
            </button>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .wrap { max-width: 520px; padding-block: 2.5rem; }
    .amount { font-family: var(--font-display); font-size: 2.4rem; margin: 0.5rem 0 1.25rem; }
    .row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
    .err { color: var(--bad); } .ok { color: var(--ok); font-weight: 600; }
  `]
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

  constructor(private route: ActivatedRoute, private api: ApiService, private router: Router) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.api.getCase(id).subscribe({
      next: (res) => {
        this.caseItem = res.case;
        if (this.caseItem?.paid) {
          void this.router.navigate(['/upload', id]);
        }
      },
      error: () => this.error = 'Caso no encontrado',
    });
  }

  pay(): void {
    if (!this.caseItem) return;
    this.busy = true;
    this.error = '';
    const last4 = this.card.replace(/\D/g, '').slice(-4) || '4242';
    this.api.mockPay(this.caseItem.id, this.holder, last4).subscribe({
      next: (res) => {
        this.busy = false;
        this.done = true;
        this.ref = res.reference;
      },
      error: (e) => {
        this.busy = false;
        this.error = e?.error?.error || 'Pago falló';
      },
    });
  }
}
