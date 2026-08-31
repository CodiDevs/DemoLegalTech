import { Component, Input } from '@angular/core';
import { DecimalPipe } from '@angular/common';

/**
 * Tarjeta de pago con estructura fija: concepto, precio y estado.
 * El contenido no debe alterar el layout — solo cambian texto y variante.
 */
@Component({
  selector: 'app-payment-card',
  standalone: true,
  imports: [DecimalPipe],
  template: `
    <article class="payment-card">
      <div class="payment-card-body">
        <strong class="payment-card-title">{{ title }}</strong>
        @if (subtitle) {
          <p class="payment-card-subtitle">{{ subtitle }}</p>
        }
      </div>
      <div class="payment-card-meta">
        <span class="payment-card-amount tabular">
          @if (amountCents != null) {
            \${{ amountCents / 100 | number:'1.0-0' }}
          } @else {
            {{ amountLabel }}
          }
        </span>
        <span class="payment-card-status" [class.is-paid]="paid" [class.is-pending]="!paid">
          {{ paid ? 'Pagado' : 'Pendiente de pago' }}
        </span>
      </div>
    </article>
  `,
  styles: [`
    .payment-card {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: center;
      gap: var(--space-4);
      min-height: 5.5rem;
      padding: var(--space-4) var(--space-5);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      background: var(--surface);
    }

    .payment-card-body {
      display: grid;
      gap: var(--space-1);
      min-width: 0;
    }

    .payment-card-title {
      font-size: var(--text-base);
      font-weight: 650;
      line-height: var(--leading-snug);
      color: var(--text);
    }

    .payment-card-subtitle {
      margin: 0;
      font-size: var(--text-sm);
      color: var(--text-secondary);
      line-height: var(--leading-snug);
    }

    .payment-card-meta {
      display: grid;
      gap: var(--space-2);
      justify-items: end;
      text-align: right;
      flex-shrink: 0;
    }

    .payment-card-amount {
      font-size: var(--text-lg);
      font-weight: 700;
      color: var(--text);
      line-height: 1.2;
    }

    .payment-card-status {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 1.5rem;
      padding: var(--space-1) var(--space-3);
      border-radius: var(--radius-full);
      font-size: var(--text-xs);
      font-weight: 600;
      line-height: 1.4;
      white-space: nowrap;
      border: 1px solid var(--warning-border);
      background: var(--warning-subtle);
      color: var(--warning);
    }

    .payment-card-status.is-paid {
      border-color: var(--success-border);
      background: var(--success-subtle);
      color: var(--success);
    }

    @media (max-width: 560px) {
      .payment-card {
        grid-template-columns: 1fr;
        align-items: start;
      }

      .payment-card-meta {
        justify-items: start;
        text-align: left;
        grid-template-columns: auto auto;
        align-items: center;
        width: 100%;
        justify-content: space-between;
      }
    }
  `],
})
export class PaymentCardComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() amountCents: number | null = null;
  @Input() amountLabel = '';
  @Input() paid = false;
}
