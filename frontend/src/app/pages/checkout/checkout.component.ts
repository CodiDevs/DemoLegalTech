import { AfterViewChecked, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService, CaseItem } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { ProductFlowShellComponent } from '../../shared/product-flow-shell.component';
import { getProductDisplayName, productThemeFromCase, setActiveProduct, buildClientFlowCrumb } from '../../shared/product-sites.data';
import { IconComponent } from '../../shared/icon.component';
import { AnimatedTicketComponent } from '../../shared/animated-ticket.component';
import { buildCheckoutCart, CheckoutCart, parseQuestionnaire } from '../../shared/checkout-cart';

type PaymentStep = 'idle' | 'processing' | 'success';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [FormsModule, RouterLink, DecimalPipe, ProductFlowShellComponent, IconComponent, AnimatedTicketComponent],
  template: `
    <app-product-flow-shell
      [theme]="theme"
      [crumb]="crumb"
      title="Pago del trámite"
      subtitle="Un solo cobro. Sin suscripción mensual."
    >
      @if (caseItem) {
        <article
          class="ck-acta"
          [class.is-dimmed]="isModalOpen"
          [attr.inert]="isModalOpen ? '' : null"
        >
          <div class="ck-acta-fields">
            <div class="pf-field">
              <label>Titular</label>
              <input [(ngModel)]="holder" [disabled]="formLocked" />
            </div>
            <div class="pf-field">
              <label>Correo</label>
              <input [value]="email" disabled />
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
              class="btn btn-primary btn-lg btn-block"
              type="button"
              (click)="pay()"
              [disabled]="formLocked"
            >
              Pagar con Payphone
            </button>
          </div>

          <aside class="ck-honorarios" aria-label="Honorarios">
            <p class="ck-honorarios-kicker">Honorarios</p>
            <p class="ck-honorarios-product">{{ productName }}</p>
            <ul class="ck-honorarios-lines">
              @for (line of cart.lines; track line.id) {
                <li [class.is-external]="line.billedSeparately">
                  <span>{{ line.label }}</span>
                  @if (line.billedSeparately) {
                    <span class="tabular">aparte</span>
                  } @else if (line.includedInPackage) {
                    <span class="tabular">incluido</span>
                  } @else {
                    <span class="tabular">\${{ line.referenceCents / 100 | number:'1.2-2' }}</span>
                  }
                </li>
              }
            </ul>
            @if (cart.discountCents > 0) {
              <p class="ck-honorarios-note">Extras del paquete, sin cobro extra.</p>
            }
            <p class="ck-honorarios-meta">Expediente #{{ caseItem.id }} · {{ caseItem.status_label }}</p>
            <p class="ck-honorarios-total">
              <span>Total</span>
              <strong class="tabular">\${{ cart.totalCents / 100 | number:'1.2-2' }}</strong>
            </p>
            <p class="ck-honorarios-note">Pago único. No incluye gastos notariales ni sello QR.</p>
          </aside>
        </article>
      }
    </app-product-flow-shell>

    @if (isModalOpen && caseItem) {
      <div
        class="pay-overlay"
        #payOverlay
        tabindex="-1"
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
                <h2 id="pay-modal-success">Pago registrado</h2>
                <p class="pay-modal-sub">Tu comprobante se emitió correctamente</p>
              </div>

              <div class="pay-printer">
                <app-animated-ticket
                  [receiptOnly]="true"
                  [ticketId]="ref"
                  [amount]="caseItem.amount_cents / 100"
                  [date]="paidAt"
                  [cardHolder]="holder"
                  [email]="email"
                  [last4Digits]="cardLast4"
                  [barcodeValue]="ref"
                />
              </div>

              <a class="btn btn-primary btn-lg upload-link" [routerLink]="['/upload', caseItem.id]">
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
    .ck-acta {
      display: grid;
      grid-template-columns: minmax(0, 1.2fr) minmax(11rem, 15rem);
      gap: clamp(1.75rem, 4vw, 3.5rem);
      align-items: start;
      max-width: 46rem;
      animation: pf-in var(--dur-cine) var(--ease-out) both;
      transition: filter var(--dur-base) var(--ease-out);
    }

    .ck-acta.is-dimmed {
      pointer-events: none;
      user-select: none;
    }

    .ck-acta-fields { display: grid; gap: var(--space-3); }
    .btn-block { width: 100%; justify-content: center; }

    .ck-honorarios {
      padding-left: var(--space-5);
      border-left: 1px solid var(--border);
      font-family: var(--font-sans);
      font-variant-numeric: tabular-nums;
    }

    .ck-honorarios-kicker {
      margin: 0 0 var(--space-1);
      font-size: var(--text-xs);
      font-weight: 500;
      color: var(--text-muted);
    }

    .ck-honorarios-product {
      margin: 0 0 var(--space-4);
      font-size: var(--text-sm);
      font-weight: 600;
      color: var(--text);
    }

    .ck-honorarios-lines {
      list-style: none;
      margin: 0;
      padding: 0;
      display: grid;
      gap: var(--space-2);
    }

    .ck-honorarios-lines li {
      display: flex;
      justify-content: space-between;
      gap: var(--space-3);
      font-size: var(--text-xs);
      color: var(--text-secondary);
    }

    .ck-honorarios-lines li.is-external { color: var(--text-muted); }

    .ck-honorarios-meta {
      margin: var(--space-4) 0 var(--space-2);
      font-size: var(--text-xs);
      color: var(--text-muted);
    }

    .ck-honorarios-total {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin: 0;
      padding-top: var(--space-2);
      border-top: 1px solid var(--border);
      font-size: var(--text-sm);
    }

    .ck-honorarios-total strong {
      font-size: var(--text-lg);
      font-weight: 650;
      color: var(--text);
    }

    .ck-honorarios-note {
      margin: var(--space-3) 0 0;
      font-size: var(--text-xs);
      color: var(--text-muted);
      line-height: 1.5;
    }

    @media (max-width: 720px) {
      .ck-acta {
        grid-template-columns: 1fr;
      }
      .ck-honorarios {
        padding-left: 0;
        padding-top: var(--space-5);
        border-left: 0;
        border-top: 1px solid var(--border);
      }
    }

    /* ---------- Overlay modal ---------- */

    .pay-overlay {
      position: fixed;
      inset: 0;
      z-index: var(--z-modal);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-4);
      background: var(--overlay-strong);
      animation: overlay-in var(--dur-base) var(--ease);
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
      animation: pf-swap var(--dur-slow) var(--ease-out) both;
    }

    .pay-modal-success .upload-link {
      animation: pf-cta-in var(--dur-slow) var(--ease-out) both;
      animation-delay: 120ms;
    }

    .pay-modal-success app-animated-ticket {
      display: block;
      width: 100%;
      animation: pf-in var(--dur-cine) var(--ease-out) both;
      animation-delay: 60ms;
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
      background: linear-gradient(135deg, var(--primary-active), var(--primary));
      overflow: hidden;
      box-shadow: var(--shadow-lg);
      animation: card-float 2.4s var(--ease-out) infinite;
    }

    .pay-card-chip {
      position: absolute;
      top: 1.25rem; left: 1.25rem;
      width: 2.2rem; height: 1.5rem;
      border-radius: 4px;
      background: var(--warning);
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
      animation: shimmer 1.4s var(--ease) infinite;
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
      animation: modal-pop var(--dur-slow) var(--ease-out);
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
  `],
})
export class CheckoutComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('payOverlay') payOverlay?: ElementRef<HTMLElement>;
  caseItem: CaseItem | null = null;
  holder = '';
  email = '';
  card = '4242 4242 4242 4242';
  exp = '12/28';
  cvv = '123';
  paymentStep: PaymentStep = 'idle';
  ref = '';
  error = '';
  theme = productThemeFromCase();
  productName = 'Divorcio360';
  crumb: { label: string; link?: string }[] = buildClientFlowCrumb('divorcio360', 'Pago');
  paidAt = new Date();
  cardLast4 = '4242';
  cart: CheckoutCart = buildCheckoutCart(34900);
  private payTimer?: ReturnType<typeof setTimeout>;
  private destroyed = false;
  private prevOverflow = '';
  private lastFocus: HTMLElement | null = null;
  private modalFocused = false;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private router: Router,
    private auth: AuthService,
  ) {}

  get isModalOpen(): boolean {
    return this.paymentStep === 'processing' || this.paymentStep === 'success';
  }

  get formLocked(): boolean {
    return this.isModalOpen || !!this.caseItem?.paid;
  }

  ngOnInit(): void {
    const user = this.auth.user();
    this.holder = user?.full_name || '';
    this.email = user?.email || '';
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.api.getCase(id).subscribe({
      next: (d) => {
        if (this.destroyed) return;
        this.caseItem = d.case;
        this.theme = productThemeFromCase(d.case?.product);
        this.productName = getProductDisplayName(d.case?.product || 'divorcio360');
        setActiveProduct(d.case?.product || 'divorcio360');
        this.crumb = buildClientFlowCrumb(d.case?.product, 'Pago');
        this.cart = buildCheckoutCart(
          d.case?.amount_cents ?? 34900,
          parseQuestionnaire(d.case?.questionnaire_json),
        );
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
    this.destroyed = true;
    if (this.payTimer !== undefined) clearTimeout(this.payTimer);
    this.lockScroll(false);
    this.lastFocus?.focus();
  }

  ngAfterViewChecked(): void {
    if (this.isModalOpen && !this.modalFocused) {
      this.lastFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      this.payOverlay?.nativeElement.focus();
      this.modalFocused = true;
    }
    if (!this.isModalOpen) this.modalFocused = false;
  }

  @HostListener('document:keydown', ['$event'])
  trapTab(event: KeyboardEvent): void {
    if (!this.isModalOpen || event.key !== 'Tab') return;
    const root = this.payOverlay?.nativeElement;
    if (!root) return;
    const nodes = Array.from(
      root.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'),
    ).filter((el) => !el.hasAttribute('disabled'));
    const active = document.activeElement as HTMLElement | null;
    const inside = !!active && (active === root || root.contains(active));
    if (!nodes.length) {
      event.preventDefault();
      root.focus();
      return;
    }
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    if (!inside) {
      event.preventDefault();
      (event.shiftKey ? last : first).focus();
      return;
    }
    if (event.shiftKey && (active === first || active === root)) {
      event.preventDefault();
      last.focus();
      return;
    }
    if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
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
        if (this.destroyed) return;
        this.ref = r.reference || `LS-${this.caseItem!.id}`;
        this.caseItem!.paid = true;
        this.paidAt = new Date();
        this.payTimer = setTimeout(() => {
          if (this.destroyed || this.paymentStep !== 'processing') return;
          this.paymentStep = 'success';
        }, 1800);
      },
      error: (e) => {
        if (this.destroyed) return;
        if (this.payTimer !== undefined) clearTimeout(this.payTimer);
        this.paymentStep = 'idle';
        this.lockScroll(false);
        this.error = e?.error?.error || 'No pudimos procesar el pago. Inténtalo de nuevo.';
      },
    });
  }

  private lockScroll(lock: boolean): void {
    if (lock) {
      this.prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return;
    }
    document.body.style.overflow = this.prevOverflow;
  }
}
