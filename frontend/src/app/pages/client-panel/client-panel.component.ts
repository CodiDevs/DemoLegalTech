import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService, CaseItem } from '../../core/api.service';
import {
  getProductDisplayName,
  normalizeProductId,
} from '../../shared/product-sites.data';
import { PaymentCardComponent } from '../../shared/payment-card.component';
import { IconComponent } from '../../shared/icon.component';

interface ProductCaseGroup {
  productId: string;
  name: string;
  cases: CaseItem[];
}

interface ClientInvoice {
  caseId: number;
  reference: string;
  productName: string;
  amountCents: number;
  paid: boolean;
  date: string;
}

@Component({
  selector: 'app-client-panel',
  standalone: true,
  imports: [RouterLink, PaymentCardComponent, IconComponent, DatePipe],
  template: `
    <div class="shell wrap">
      <header class="head">
        <h1>Tu cuenta</h1>
        <p class="muted">
          Expedientes y facturas de todos tus trámites en LegalStation — Divorcio360, Traslado360, BienRaiz360 y más.
        </p>
      </header>

      @if (loading) {
        <div class="panel state-loading" role="status">
          <span class="spinner" aria-hidden="true"></span>
          <span>Cargando tu cuenta…</span>
        </div>
      } @else if (error) {
        <div class="panel state-error" role="alert">
          <span class="state-error-icon"><app-icon name="alert-triangle" [size]="20" /></span>
          <div class="state-error-body">
            <strong>No pudimos cargar tu cuenta</strong>
            <p>Puede ser un problema de conexión. Inténtalo de nuevo en un momento.</p>
          </div>
          <button type="button" class="btn btn-secondary" (click)="load()">Volver a intentar</button>
        </div>
      } @else if (!cases.length) {
        <div class="panel empty-state">
          <span class="empty-icon"><app-icon name="inbox" [size]="22" /></span>
          <h2>Todavía no tienes trámites</h2>
          <p>Explora nuestros productos y crea tu primer expediente cuando estés listo.</p>
          <a routerLink="/" class="btn btn-primary">Ver productos</a>
        </div>
      } @else {
        <div class="dashboard-grid">
          <section class="dashboard-section">
            <header class="section-head">
              <h2>Expedientes</h2>
              <span class="section-count">{{ cases.length }}</span>
            </header>

            @for (group of groups; track group.productId) {
              <div class="group">
                <h3 class="group-label">{{ group.name }}</h3>
                <div class="list">
                  @for (c of group.cases; track c.id) {
                    <div class="panel item">
                      <a class="item-link" [routerLink]="['/caso', c.id]">
                        <app-payment-card
                          [title]="'Expediente #' + c.id"
                          [subtitle]="c.status_label + ' · ' + (c.city || '—')"
                          [amountCents]="c.amount_cents"
                          [paid]="c.paid"
                        />
                      </a>
                      @if (c.sign_hint) { <p class="hint">{{ c.sign_hint }}</p> }
                      @if (c.can_sign) {
                        <a class="btn btn-primary sign-cta" [routerLink]="['/firma', c.id]">
                          <app-icon name="signature" [size]="16" />
                          {{ c.has_signature ? 'Volver a firmar la minuta' : 'Firmar la minuta ahora' }}
                        </a>
                      }
                    </div>
                  }
                </div>
              </div>
            }
          </section>

          <section class="dashboard-section">
            <header class="section-head">
              <h2>Facturas</h2>
              <span class="section-count">{{ invoices.length }}</span>
            </header>

            <div class="list">
              @for (inv of invoices; track inv.caseId) {
                <div class="panel item invoice-item">
                  <app-payment-card
                    [title]="inv.reference"
                    [subtitle]="inv.productName + ' · ' + (inv.date | date:'short')"
                    [amountCents]="inv.amountCents"
                    [paid]="inv.paid"
                  />
                  @if (!inv.paid) {
                    <a class="btn btn-primary invoice-cta" [routerLink]="['/checkout', inv.caseId]">
                      Completar pago
                    </a>
                  } @else {
                    <a class="btn btn-ghost invoice-cta" [routerLink]="['/caso', inv.caseId]">
                      Ver expediente
                    </a>
                  }
                </div>
              }
            </div>
          </section>
        </div>
      }
    </div>
  `,
  styles: [`
    .wrap { padding-block: var(--space-6) var(--space-7); }
    .head { margin-bottom: var(--space-5); }
    .head h1 { margin: 0 0 var(--space-2); }
    .head p { margin: 0; max-width: 56ch; line-height: var(--leading-snug); }

    .dashboard-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-6);
      align-items: start;
    }

    @media (max-width: 900px) {
      .dashboard-grid { grid-template-columns: 1fr; }
    }

    .dashboard-section { display: grid; gap: var(--space-4); }

    .section-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-3);
    }

    .section-head h2 {
      margin: 0;
      font-size: var(--text-lg);
      font-weight: 650;
    }

    .section-count {
      font-size: var(--text-xs);
      font-weight: 600;
      padding: var(--space-1) var(--space-3);
      border-radius: var(--radius-full);
      background: var(--bg-subtle);
      color: var(--text-secondary);
      border: 1px solid var(--border);
    }

    .group { display: grid; gap: var(--space-3); }
    .group + .group { margin-top: var(--space-4); }

    .group-label {
      margin: 0;
      font-size: var(--text-sm);
      font-weight: 600;
      color: var(--text-secondary);
    }

    .list { display: grid; gap: var(--space-3); }
    .item { display: grid; gap: var(--space-3); }
    .item-link { text-decoration: none; color: inherit; display: block; }
    .hint {
      margin: 0;
      color: var(--primary);
      font-weight: 500;
      font-size: var(--text-sm);
    }
    .sign-cta,
    .invoice-cta { justify-self: start; }

    .state-loading {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      color: var(--text-secondary);
      font-size: var(--text-sm);
    }
    .state-error {
      display: flex;
      align-items: flex-start;
      gap: var(--space-3);
      flex-wrap: wrap;
      border-color: var(--danger-border);
      background: var(--danger-subtle);
    }
    .state-error-icon { color: var(--danger); display: grid; place-items: center; }
    .state-error-body { flex: 1; min-width: 14rem; }
    .state-error-body strong { display: block; font-weight: 650; }
    .state-error-body p {
      margin: var(--space-1) 0 0;
      font-size: var(--text-sm);
      color: var(--text-secondary);
    }

    .empty-state {
      display: grid;
      justify-items: center;
      gap: var(--space-3);
      text-align: center;
      padding: var(--space-7) var(--space-5);
    }
    .empty-icon {
      display: grid;
      place-items: center;
      width: 48px;
      height: 48px;
      border-radius: var(--radius-md);
      background: var(--bg-subtle);
      border: 1px solid var(--border);
      color: var(--text-muted);
    }
    .empty-state h2 { font-size: var(--text-lg); margin: 0; }
    .empty-state p {
      margin: 0;
      max-width: 46ch;
      color: var(--text-secondary);
      font-size: var(--text-sm);
    }
  `],
})
export class ClientPanelComponent implements OnInit {
  cases: CaseItem[] = [];
  groups: ProductCaseGroup[] = [];
  invoices: ClientInvoice[] = [];
  loading = false;
  error = false;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = false;
    this.api.listCases().subscribe({
      next: (c) => {
        this.cases = c;
        this.groups = this.buildGroups(c);
        this.invoices = this.buildInvoices(c);
        this.loading = false;
      },
      error: () => {
        this.error = true;
        this.loading = false;
      },
    });
  }

  private buildGroups(all: CaseItem[]): ProductCaseGroup[] {
    const byProduct = new Map<string, CaseItem[]>();
    for (const c of all) {
      const pid = normalizeProductId(c.product);
      if (!byProduct.has(pid)) byProduct.set(pid, []);
      byProduct.get(pid)!.push(c);
    }

    return Array.from(byProduct.entries())
      .map(([productId, cases]) => ({
        productId,
        name: getProductDisplayName(productId),
        cases,
      }))
      .sort((a, b) => a.name.localeCompare(b.name, 'es'));
  }

  private buildInvoices(all: CaseItem[]): ClientInvoice[] {
    return all
      .map((c) => ({
        caseId: c.id,
        reference: `LS-${c.id}`,
        productName: getProductDisplayName(normalizeProductId(c.product)),
        amountCents: c.amount_cents,
        paid: c.paid,
        date: c.updated_at || c.created_at,
      }))
      .sort((a, b) => b.caseId - a.caseId);
  }
}
