import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService, CaseItem } from '../../core/api.service';
import { ProductFlowShellComponent } from '../../shared/product-flow-shell.component';
import { getProductDisplayName, productThemeFromCase } from '../../shared/product-sites.data';
import { IconComponent } from '../../shared/icon.component';
import { AnimatedTicketComponent } from '../../shared/animated-ticket.component';

type PaymentStep = 'idle' | 'processing' | 'success';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [FormsModule, RouterLink, DecimalPipe, ProductFlowShellComponent, IconComponent, AnimatedTicketComponent],
  template: `
    <app-product-flow-shell
      [theme]="theme"
      [crumb]="[{ label: 'LegalStation', link: '/' }, { label: 'Pago único' }]"
      eyebrow="Pago seguro · Payphone"
      title="Pago del trámite"
      subtitle="Un solo cobro — sin suscripción mensual."
    >
      @if (caseItem) {
        <div class="checkout-grid" [class.is-dimmed]="isModalOpen">
          <div class="checkout-col">
            <div class="pf-card lp-lift checkout-form">
              <div class="pf-field">
                <label>Titular</label>
                <input [(ngModel)]="holder" [disabled]="formLocked" />
              </div>
              <div class="pf-field">
                <label>Tarjeta</label>
                <input [(ngModel)]="card" placeholder="4242 4242 4242 4242" [disabled]="formLocked" />
              </div>
              <div class="pf-row">
                <div class="pf-field">
                  <label>Vence</label>
                  <input [(ngModel)]="exp" placeholder="12/28" [disabled]="formLocked" />
                </div>
                <div class="pf-field">
                  <label>CVV</label>
                  <input [(ngModel)]="cvv" placeholder="123" [disabled]="formLocked" />
                </div>
              </div>
              @if (error) { <p class="pf-err">{{ error }}</p> }
              <button
                class="lp-btn lp-btn-primary btn-block"
                type="button"
                (click)="pay()"
                [disabled]="formLocked"
              >
                Pagar con Payphone
              </button>
            </div>
          </div>

          <div class="checkout-col checkout-aside">
            <div class="pf-card lp-lift order-summary">
              <h2>Resumen del pedido</h2>
              <p class="summary-product">{{ productName }}</p>
              <ul class="summary-includes">
                <li>Evaluación y apertura de expediente</li>
                <li>Revisión jurídica por abogado</li>
                <li>Gestión documental en línea</li>
                <li>Consulta virtual con abogado</li>
              </ul>
              <div class="summary-line">
                <span>Expediente #{{ caseItem.id }}</span>
                <span>{{ caseItem.status_label }}</span>
              </div>
              <div class="summary-total">
                <span>Total</span>
                <strong>\${{ caseItem.amount_cents / 100 | number:'1.2-2' }} USD</strong>
              </div>
              <p class="pf-muted summary-note">Pago único · Sin suscripción</p>
            </div>
          </div>
        </div>
      }
    </app-product-flow-shell>

    @if (isModalOpen && caseItem) {
      <div
        class="pay-overlay"
        role="dialog"
        aria-modal="true"
        [attr.aria-labelledby]="paymentStep === 'processing' ? 'pay-modal-processing' : 'pay-modal-success'"
      >
        <div class="pay-modal-shell">
          @if (paymentStep === 'processing') {
            <div class="pay-modal pay-modal-processing modal-enter" aria-live="polite">
              <div class="pay-card-anim">
                <div class="pay-card-chip"></div>
                <div class="pay-card-stripe"></div>
                <div class="pay-card-shimmer"></div>
              </div>
              <h2 id="pay-modal-processing" class="pay-modal-title">Procesando pago seguro…</h2>
              <p class="pay-modal-sub">Verificando tarjeta de forma segura.</p>
            </div>
          }

          @if (paymentStep === 'success') {
            <div class="pay-modal pay-modal-success modal-enter" aria-live="polite">
              <div class="pay-success-head">
                <div class="pay-success-icon" aria-hidden="true">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <h2 id="pay-modal-success">¡Gracias!</h2>
                <p class="pay-modal-sub">Tu comprobante se emitió correctamente</p>
              </div>

              <app-animated-ticket
                [receiptOnly]="true"
                [ticketId]="ref"
                [amount]="caseItem.amount_cents / 100"
                [date]="paidAt"
                [cardHolder]="holder"
                [last4Digits]="cardLast4"
                [barcodeValue]="ref"
              />

              <a class="lp-btn lp-btn-primary upload-link" [routerLink]="['/upload', caseItem.id]">
                Subir mis documentos
                <app-icon name="arrow-right" [size]="16" />
              </a>
            </div>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    .checkout-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-6);
      align-items: start;
      transition: filter 0.3s ease;
    }

    .checkout-grid.is-dimmed {
      pointer-events: none;
      user-select: none;
    }

    .checkout-form { display: grid; gap: var(--space-3); }
    .btn-block { width: 100%; justify-content: center; }

    .checkout-aside {
      display: flex;
      justify-content: center;
      position: sticky;
      top: calc(var(--header-height) + var(--space-4));
    }

    .order-summary { display: grid; gap: var(--space-3); width: 100%; }
    .order-summary h2 {
      margin: 0;
      font-size: var(--text-lg);
      font-weight: 650;
    }

    .summary-product {
      margin: 0;
      font-size: var(--text-base);
      font-weight: 600;
      color: var(--text);
    }

    .summary-includes {
      margin: 0;
      padding-left: 1.1rem;
      font-size: var(--text-sm);
      color: var(--text-secondary);
      display: grid;
      gap: var(--space-1);
    }

    .summary-line {
      display: flex;
      justify-content: space-between;
      font-size: var(--text-sm);
      color: var(--text-secondary);
      padding-top: var(--space-2);
      border-top: 1px solid var(--border);
    }

    .summary-total {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      padding: var(--space-3) 0;
      border-top: 1px solid var(--border);
    }

    .summary-total strong {
      font-size: var(--text-2xl);
      font-weight: 700;
      font-variant-numeric: tabular-nums;
    }

    .summary-note { margin: 0; font-size: var(--text-xs); }

    /* ---------- Overlay modal ---------- */

    .pay-overlay {
      position: fixed;
      inset: 0;
      z-index: 9990;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-4);
      background: oklch(0.12 0.02 230 / 0.62);
      backdrop-filter: blur(4px);
      animation: overlay-in 0.25s ease;
    }

    .pay-modal-shell {
      width: min(100%, 26rem);
      max-height: calc(100dvh - var(--space-8));
      overflow-y: auto;
    }

    .pay-modal {
      display: grid;
      gap: var(--space-4);
      padding: var(--space-6);
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-lg);
      text-align: center;
    }

    .pay-modal-processing {
      justify-items: center;
    }

    .pay-modal-success {
      justify-items: center;
    }

    .pay-modal-title {
      margin: 0;
      font-size: var(--text-lg);
      font-weight: 650;
      color: var(--text);
    }

    .pay-modal-sub {
      margin: 0;
      font-size: var(--text-sm);
      color: var(--text-secondary);
      line-height: 1.5;
    }

    .pay-success-head {
      display: grid;
      gap: var(--space-2);
      justify-items: center;
    }

    .pay-success-head h2 {
      margin: 0;
      font-size: var(--text-2xl);
      font-weight: 700;
      letter-spacing: -0.02em;
    }

    .pay-success-icon {
      display: grid;
      place-items: center;
      width: 3rem;
      height: 3rem;
      border-radius: var(--radius-full);
      background: color-mix(in srgb, var(--lp-accent, var(--primary)) 14%, transparent);
      color: var(--lp-accent, var(--primary));
    }

    .pay-card-anim {
      position: relative;
      width: 220px;
      height: 132px;
      border-radius: var(--radius-lg);
      background: linear-gradient(135deg, #1a2f35, #2d4a52);
      overflow: hidden;
      box-shadow: var(--shadow-lg);
      animation: card-float 2.4s ease-in-out infinite;
    }

    .pay-card-chip {
      position: absolute;
      top: 1.25rem; left: 1.25rem;
      width: 2.2rem; height: 1.5rem;
      border-radius: 4px;
      background: linear-gradient(135deg, #d4af37, #f0d060);
    }

    .pay-card-stripe {
      position: absolute;
      bottom: 2rem; left: 0; right: 0;
      height: 2rem;
      background: rgb(0 0 0 / 0.35);
    }

    .pay-card-shimmer {
      position: absolute; inset: 0;
      background: linear-gradient(105deg, transparent 40%, rgb(255 255 255 / 0.12) 50%, transparent 60%);
      animation: shimmer 1.4s ease-in-out infinite;
    }

    .upload-link {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-2);
      width: 100%;
      text-decoration: none;
    }

    .modal-enter {
      animation: modal-pop 0.4s cubic-bezier(0.22, 1, 0.36, 1);
    }

    @keyframes overlay-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes modal-pop {
      from { opacity: 0; transform: scale(0.96) translateY(8px); }
      to { opacity: 1; transform: none; }
    }

    @keyframes card-float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-4px); }
    }

    @keyframes shimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }

    @media (max-width: 860px) {
      .checkout-grid { grid-template-columns: 1fr; }
      .checkout-aside { position: static; }
    }
  `],
})
export class CheckoutComponent implements OnInit, OnDestroy {
  caseItem: CaseItem | null = null;
  holder = 'Carlos Mendoza';
  card = '4242 4242 4242 4242';
  exp = '12/28';
  cvv = '123';
  paymentStep: PaymentStep = 'idle';
  ref = '';
  error = '';
  theme = productThemeFromCase();
  productName = 'Divorcio360';
  paidAt = new Date();
  cardLast4 = '4242';

  constructor(private route: ActivatedRoute, private api: ApiService, private router: Router) {}

  get isModalOpen(): boolean {
    return this.paymentStep === 'processing' || this.paymentStep === 'success';
  }

  get formLocked(): boolean {
    return this.isModalOpen || !!this.caseItem?.paid;
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.api.getCase(id).subscribe({
      next: (d) => {
        this.caseItem = d.case;
        this.theme = productThemeFromCase(d.case?.product);
        this.productName = getProductDisplayName(d.case?.product || 'divorcio360');
        if (d.case?.paid) {
          this.ref = `LS-${d.case.id}`;
          this.paymentStep = 'success';
          this.lockScroll(true);
        }
      },
      error: () => this.router.navigate(['/cliente']),
    });
  }

  ngOnDestroy(): void {
    this.lockScroll(false);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.paymentStep === 'processing') return;
  }

  pay(): void {
    if (!this.caseItem || this.formLocked) return;
    this.error = '';
    this.paymentStep = 'processing';
    this.lockScroll(true);
    this.cardLast4 = this.card.replace(/\s/g, '').slice(-4) || '4242';

    this.api.mockPay(this.caseItem.id, this.holder, this.cardLast4).subscribe({
      next: (r) => {
        this.ref = r.reference || `LS-${this.caseItem!.id}`;
        this.caseItem!.paid = true;
        this.paidAt = new Date();
        setTimeout(() => {
          this.paymentStep = 'success';
        }, 1800);
      },
      error: (e) => {
        this.paymentStep = 'idle';
        this.lockScroll(false);
        this.error = e?.error?.error || 'No pudimos procesar el pago. Inténtalo de nuevo.';
      },
    });
  }

  private lockScroll(lock: boolean): void {
    document.body.style.overflow = lock ? 'hidden' : '';
  }
}
