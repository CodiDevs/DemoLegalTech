import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../core/api.service';
import { DataTableComponent } from '../../../shared/data-table.component';
import { StatusBadgeComponent } from '../../../shared/status-badge.component';
import { IconComponent } from '../../../shared/icon.component';
import { WorkspaceHeadComponent } from '../../lawyer-panel/workspace-head.component';

@Component({
  selector: 'app-fase2-billing',
  standalone: true,
  imports: [RouterLink, DataTableComponent, StatusBadgeComponent, IconComponent, WorkspaceHeadComponent],
  template: `
    <app-workspace-head title="Licencia" [aside]="headAside" />

    @if (data?.current_tenant) {
      <div class="panel tenant">
        <div>
          <h2>{{ data.current_tenant.name }}</h2>
          <p class="muted">{{ data.current_tenant.plan_label || data.current_tenant.plan }} · {{ data.current_tenant.commission_pct }}% abogado · {{ data.current_tenant.platform_pct }}% plataforma</p>
        </div>
        <p class="usage tabular">
          <strong>{{ data.current_tenant.cases_used }} / {{ data.current_tenant.cases_limit }}</strong>
          <span class="muted">casos este mes</span>
        </p>
      </div>
      <div class="panel link-card">
        <h2>Link para clientes</h2>
        <p class="muted">El cliente paga el trámite. Esta licencia es del bufete.</p>
        <div class="share">
          <a class="share-url" [routerLink]="referralRoute" [queryParams]="referralQuery">
            legalstation.ec{{ referralPrettyPath }}
          </a>
          <button type="button" class="btn btn-secondary" (click)="copyLink()">
            <app-icon [name]="copied ? 'check' : 'clipboard'" [size]="16" />
            {{ copied ? 'Copiado' : 'Copiar' }}
          </button>
        </div>
        <p class="muted">Precio sugerido: \${{ data.current_tenant.suggested_client_price_usd }} · Divorcio360</p>
      </div>
    }

    <div class="toggle" role="group" aria-label="Periodo de la licencia">
      <button type="button" class="btn btn-ghost" [class.on]="!annual" (click)="annual = false">Mensual</button>
      <button type="button" class="btn btn-ghost" [class.on]="annual" (click)="annual = true">Anual (-15%)</button>
    </div>

    <div class="table-wrap">
      <table class="plan-table">
        <thead>
          <tr>
            <th>Plan</th>
            <th>Precio</th>
            <th>Operadores</th>
            <th>Casos</th>
            <th>Asistente</th>
            <th>SATJE</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          @for (p of data?.plans || []; track p.id) {
            <tr [class.is-current]="p.id === data?.current_tenant?.plan">
              <th scope="row">{{ p.name }}</th>
              <td class="tabular">\${{ planPrice(p) }}/mes</td>
              <td class="tabular">{{ p.features.users }}</td>
              <td class="tabular">{{ p.features.cases_per_month }}</td>
              <td>{{ flagLabel(p.features.ai) }}</td>
              <td>{{ flagLabel(p.features.satje) }}</td>
              <td class="plan-act">
                @if (p.id === data?.current_tenant?.plan) {
                  <app-status-badge label="Plan actual" variant="ok" />
                } @else {
                  <button type="button" class="btn btn-ghost" (click)="showUpgrade(p)">Cambiar</button>
                }
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>

    <section class="fase2-section">
      <h2>Historial de facturas</h2>
      <app-data-table [columns]="invoiceCols" [rows]="invoiceRows" />
    </section>

    @if (modal) {
      <div class="modal-backdrop" (click)="modal = ''">
        <div class="modal panel" (click)="$event.stopPropagation()">
          <h2>Cambiar a {{ modal }}</h2>
          <p class="muted">Pasarela de prueba. En producción se integraría Payphone recurrente.</p>
          <button type="button" class="btn btn-primary" (click)="confirmUpgrade()">Confirmar cambio</button>
          <button type="button" class="btn btn-ghost" (click)="modal = ''">Cancelar</button>
        </div>
      </div>
    }
  `,
  styleUrls: ['../fase2-shared.scss'],
  styles: [`
    .tenant {
      display: flex;
      justify-content: space-between;
      gap: var(--space-4);
      flex-wrap: wrap;
      margin-top: var(--space-4);
      align-items: baseline;
    }
    .tenant h2 { margin: 0 0 var(--space-1); font-size: var(--text-base); font-weight: 650; }
    .usage { margin: 0; text-align: right; }
    .usage strong { display: block; font-size: var(--text-base); font-weight: 650; }
    .toggle { display: flex; gap: 0.5rem; margin: var(--space-5) 0 var(--space-3); }
    .toggle .on { background: var(--primary); color: var(--text-on-primary); border-color: var(--primary); }

    .table-wrap {
      overflow-x: auto;
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      background: var(--surface);
    }
    .plan-table {
      width: 100%;
      border-collapse: collapse;
      font-size: var(--text-sm);
    }
    .plan-table th, .plan-table td {
      padding: var(--space-3) var(--space-4);
      text-align: left;
      border-bottom: 1px solid var(--border);
      vertical-align: middle;
    }
    .plan-table thead th {
      font-size: var(--text-xs);
      font-weight: 650;
      color: var(--text-secondary);
    }
    .plan-table tbody tr:last-child th,
    .plan-table tbody tr:last-child td { border-bottom: 0; }
    .plan-table tbody th { font-weight: 650; }
    .plan-table tr.is-current { background: var(--primary-subtle); }
    .plan-act { text-align: right; white-space: nowrap; }
    .tabular { font-variant-numeric: tabular-nums; }

    .link-card { margin-top: var(--space-4); }
    .link-card h2 { margin: 0 0 var(--space-2); font-size: var(--text-base); font-weight: 650; }

    .share {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-3);
      align-items: center;
      margin: var(--space-3) 0;
    }
    .share-url {
      min-width: 0;
      font-size: var(--text-sm);
      font-weight: 650;
      color: var(--primary);
      text-decoration: none;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .share-url:hover { text-decoration: underline; }
    .share .btn {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      flex-shrink: 0;
    }

    .modal-backdrop {
      position: fixed; inset: 0; background: var(--overlay);
      display: grid; place-items: center; z-index: 50; padding: 1rem;
    }
    .modal { max-width: 420px; width: 100%; }
  `]
})
export class Fase2BillingComponent implements OnInit {
  data: any;
  annual = false;
  modal = '';
  upgradePlanId = '';
  copied = false;
  private copyTimer: ReturnType<typeof setTimeout> | null = null;
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

  get headAside(): string {
    const t = this.data?.current_tenant;
    if (!t) return '';
    const plan = t.plan_label || t.plan || '';
    const used = t.cases_used;
    const limit = t.cases_limit;
    const parts: string[] = [];
    if (plan) parts.push(String(plan));
    if (used != null && limit != null) parts.push(`${used} de ${limit} este mes`);
    return parts.join(' · ');
  }

  flagLabel(on: unknown): string {
    return on ? 'Sí' : 'No';
  }

  get referralPrettyPath(): string {
    const raw = String(this.data?.current_tenant?.referral_link || '');
    const m = raw.match(/legalstation\.ec(\/.*)$/i);
    if (m) return m[1];
    const slug = this.data?.current_tenant?.referral_slug;
    if (slug) return `/divorcio360/r/${slug}`;
    return '/divorcio360';
  }

  get referralRoute(): string {
    const path = String(this.data?.current_tenant?.referral_path || '/productos/divorcio360');
    return path.split('?')[0];
  }

  get referralQuery(): Record<string, string> {
    const path = String(this.data?.current_tenant?.referral_path || '');
    const q = path.split('?')[1];
    if (!q) return {};
    const out: Record<string, string> = {};
    for (const part of q.split('&')) {
      const [k, v] = part.split('=');
      if (k) out[k] = decodeURIComponent(v || '');
    }
    return out;
  }

  copyLink(): void {
    const url = String(this.data?.current_tenant?.referral_link || `https://legalstation.ec${this.referralPrettyPath}`);
    void navigator.clipboard.writeText(url).then(() => {
      this.copied = true;
      if (this.copyTimer) clearTimeout(this.copyTimer);
      this.copyTimer = setTimeout(() => { this.copied = false; }, 1600);
    });
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
