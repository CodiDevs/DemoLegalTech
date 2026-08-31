import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/api.service';
import { DataTableComponent } from '../../../shared/data-table.component';
import { StatusBadgeComponent } from '../../../shared/status-badge.component';

@Component({
  selector: 'app-fase2-billing',
  standalone: true,
  imports: [DataTableComponent, StatusBadgeComponent],
  template: `
    <h1>Licencia LegalStation para bufetes</h1>
    <p class="muted">{{ data?.note }}</p>

    @if (data?.current_tenant) {
      <div class="panel fase2-preview-card tenant lp-lift">
        <div>
          <h2>{{ data.current_tenant.name }}</h2>
          <p class="muted">Plan actual: <strong>{{ data.current_tenant.plan_label || data.current_tenant.plan }}</strong></p>
          <p class="muted">Comisión demo: {{ data.current_tenant.commission_pct }}% abogado · {{ data.current_tenant.platform_pct }}% plataforma</p>
        </div>
        <div class="usage">
          <strong>{{ data.current_tenant.cases_used }} / {{ data.current_tenant.cases_limit }}</strong>
          <span class="muted">casos este mes</span>
          <div class="bar"><span [style.width.%]="usagePct"></span></div>
        </div>
      </div>
      <div class="panel fase2-preview-card link-card lp-lift">
        <h2>Tu link para clientes</h2>
        <p class="muted">Comparte este enlace — el cliente paga honorarios por trámite (pago único), no la licencia SaaS.</p>
        <code class="ref-link">{{ data.current_tenant.referral_link }}</code>
        <p class="muted">Precio sugerido al cliente: \${{ data.current_tenant.suggested_client_price_usd }} por trámite Divorcio360.</p>
      </div>
    }

    <div class="toggle">
      <button type="button" class="btn btn-ghost" [class.on]="!annual" (click)="annual = false">Mensual</button>
      <button type="button" class="btn btn-ghost" [class.on]="annual" (click)="annual = true">Anual (-15%)</button>
    </div>

    <div class="plans">
      @for (p of data?.plans || []; track p.id) {
        <div class="panel fase2-preview-card plan" [class.current]="p.id === data?.current_tenant?.plan">
          <h2>{{ p.name }}</h2>
          <p class="price">\${{ planPrice(p) }}/mes</p>
          <ul>
            <li>{{ p.features.users }} usuarios</li>
            <li>{{ p.features.cases_per_month }} casos/mes</li>
            <li>IA: {{ p.features.ai ? 'Sí' : 'No' }}</li>
            <li>SATJE: {{ p.features.satje ? 'Sí' : 'No' }}</li>
          </ul>
          @if (p.id === data?.current_tenant?.plan) {
            <app-status-badge label="Plan actual" variant="ok" />
          } @else {
            <button type="button" class="btn btn-primary" (click)="showUpgrade(p)">Actualizar plan</button>
          }
        </div>
      }
    </div>

    <section class="fase2-section">
      <h2>Historial de facturas</h2>
      <app-data-table [columns]="invoiceCols" [rows]="invoiceRows" />
    </section>

    @if (modal) {
      <div class="modal-backdrop" (click)="modal = ''">
        <div class="modal panel" (click)="$event.stopPropagation()">
          <h2>Actualizar a {{ modal }}</h2>
          <p class="muted">Pasarela B2B mock — en producción se integraría Payphone recurrente.</p>
          <button type="button" class="btn btn-primary" (click)="confirmUpgrade()">Confirmar cambio</button>
          <button type="button" class="btn btn-ghost" (click)="modal = ''">Cancelar</button>
        </div>
      </div>
    }
  `,
  styleUrls: ['../fase2-shared.scss'],
  styles: [`
    .tenant { display: flex; justify-content: space-between; gap: 1.5rem; flex-wrap: wrap; margin-top: 1rem; }
    .usage { min-width: 200px; text-align: right; }
    .usage strong { font-family: var(--font-display); font-size: 1.5rem; display: block; }
    .bar { height: 8px; background: var(--line); border-radius: 99px; overflow: hidden; margin-top: 0.5rem; }
    .bar span { display: block; height: 100%; background: var(--brand); }
    .toggle { display: flex; gap: 0.5rem; margin: 1.25rem 0; }
    .toggle .on { background: var(--brand); color: white; border-color: var(--brand); }
    .plans { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
    .plan ul { padding-left: 1.1rem; color: var(--ink-soft); font-size: 0.9rem; }
    .plan.current { outline: 2px solid oklch(0.55 0.12 150 / 0.35); }
    .price { font-family: var(--font-display); font-size: 1.6rem; }
    .modal-backdrop {
      position: fixed; inset: 0; background: oklch(0.15 0.02 230 / 0.45);
      display: grid; place-items: center; z-index: 50; padding: 1rem;
    }
    .modal { max-width: 420px; width: 100%; }
    .ref-link { display: block; padding: 0.75rem; background: var(--line); border-radius: 8px; word-break: break-all; font-size: 0.85rem; margin: 0.75rem 0; }
    .link-card { margin-top: 1rem; }
    @media (max-width: 900px) { .plans { grid-template-columns: 1fr; } }
  `]
})
export class Fase2BillingComponent implements OnInit {
  data: any;
  annual = false;
  modal = '';
  upgradePlanId = '';
  invoiceCols = [
    { key: 'id', label: 'Factura', mono: true },
    { key: 'date', label: 'Fecha' },
    { key: 'amount_usd', label: 'Monto' },
    { key: 'status', label: 'Estado' },
  ];
  invoiceRows: Record<string, string | number>[] = [];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.mockBilling().subscribe((d) => {
      this.data = d;
      this.invoiceRows = (d.invoices || []).map((i: any) => ({
        id: i.id,
        date: i.date,
        amount_usd: '$' + i.amount_usd,
        status: i.status,
      }));
    });
  }

  get usagePct(): number {
    const t = this.data?.current_tenant;
    if (!t) return 0;
    return Math.round((t.cases_used / t.cases_limit) * 100);
  }

  planPrice(p: any): number {
    const base = p.price_usd;
    return this.annual ? Math.round(base * 0.85) : base;
  }

  showUpgrade(p: { id: string; name: string }): void {
    this.modal = p.name;
    this.upgradePlanId = p.id;
  }

  confirmUpgrade(): void {
    if (!this.upgradePlanId) return;
    this.api.patchBillingPlan(this.upgradePlanId).subscribe(() => {
      this.modal = '';
      this.ngOnInit();
    });
  }
}
