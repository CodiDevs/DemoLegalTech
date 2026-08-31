import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService, CaseItem } from '../../core/api.service';
import { MetricCardComponent } from '../../shared/metric-card.component';
import { StatusBadgeComponent } from '../../shared/status-badge.component';
import { IconComponent } from '../../shared/icon.component';

type Filter = 'all' | 'review' | 'signature' | 'notary' | 'done';

const STATE_KEYS = ['01','02','03','04','05','06','07','08','09','10'];

@Component({
  selector: 'app-lawyer-panel',
  standalone: true,
  imports: [RouterLink, MetricCardComponent, StatusBadgeComponent, IconComponent],
  template: `
    <div class="wrap">
      <header class="head">
        <h1>Bandeja de casos</h1>
        <p class="muted">Revisión jurídica, minuta, firma y cierre del trámite</p>
      </header>

      <div class="stats">
        <app-metric-card [value]="countReview" label="En revisión (03)" />
        <app-metric-card [value]="countSignature" label="Firma (04-05)" />
        <app-metric-card [value]="countClosure" label="Cierre (06-07)" />
        <app-metric-card [value]="countSla" label="SLA en riesgo" />
      </div>

      <div class="filters" role="group" aria-label="Filtrar casos por etapa">
        @for (f of filterDefs; track f.id) {
          <button
            type="button"
            class="chip"
            [class.on]="filter === f.id"
            [attr.aria-pressed]="filter === f.id"
            (click)="filter = f.id"
          >
            {{ f.label }} <span class="chip-count tabular">{{ countFor(f.id) }}</span>
          </button>
        }
      </div>

      @if (loading) {
        <div class="panel state-loading" role="status">
          <span class="spinner" aria-hidden="true"></span>
          <span>Cargando la bandeja de casos…</span>
        </div>
      } @else if (error) {
        <div class="panel state-error" role="alert">
          <span class="state-error-icon"><app-icon name="alert-triangle" [size]="20" /></span>
          <div class="state-error-body">
            <strong>No pudimos cargar la bandeja</strong>
            <p>El servidor no respondió. Vuelve a intentarlo; si sigue fallando, avisa a soporte.</p>
          </div>
          <button type="button" class="btn btn-secondary" (click)="load()">Volver a intentar</button>
        </div>
      } @else if (!cases.length) {
        <div class="panel empty-state">
          <span class="empty-icon"><app-icon name="inbox" [size]="22" /></span>
          <h2>No hay casos asignados</h2>
          <p>Cuando entre un caso nuevo aparecerá aquí.</p>
        </div>
      } @else if (!filtered.length) {
        <div class="panel empty-state">
          <span class="empty-icon"><app-icon name="search" [size]="22" /></span>
          <h2>Ningún caso en «{{ filterLabel }}»</h2>
          <p>Hay {{ cases.length }} casos en la bandeja, pero ninguno está en esta etapa ahora mismo.</p>
          <button type="button" class="btn btn-secondary" (click)="filter = 'all'">Quitar el filtro</button>
        </div>
      } @else {
        <div class="table-wrap panel">
          <table>
            <caption class="sr-only">Casos en la etapa {{ filterLabel }}</caption>
            <thead>
              <tr>
                <th scope="col">Cliente</th>
                <th scope="col">Estado</th>
                <th scope="col">Cola de casos</th>
                <th scope="col">Ciudad</th>
                <th scope="col">Días</th>
                <th scope="col"><span class="sr-only">Acciones</span></th>
              </tr>
            </thead>
            <tbody>
              @for (c of filtered; track c.id) {
                <tr>
                  <td>
                    <a class="client" [routerLink]="['/abogado/caso', c.id]">
                      <strong class="tabular">#{{ c.id }}</strong>
                      <span class="client-name">{{ c.client_name }}</span>
                      <span class="client-mail">{{ c.client_email }}</span>
                    </a>
                  </td>
                  <td>
                    <app-status-badge [label]="c.status_label" [variant]="statusVariant(c.status)" />
                  </td>
                  <td>
                    <span class="pipeline">
                      @for (s of STATE_KEYS; track s) {
                        <span class="pip" [class.done]="s <= c.status" [class.cur]="s === c.status">{{ s }}</span>
                      }
                    </span>
                  </td>
                  <td class="muted">{{ c.city || '—' }}</td>
                  <td>
                    <span class="days tabular">{{ c.days_in_status ?? '—' }}</span>
                    @if (c.sla_warning) { <app-status-badge label="SLA en riesgo" variant="warn" /> }
                  </td>
                  <td>
                    <span class="go">Abrir <app-icon name="arrow-right" [size]="16" /></span>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
  styles: [`
    .wrap { padding-block: var(--space-1) var(--space-6); }
    .head { margin-bottom: var(--space-5); }
    .head p { margin: 0; }

    .stats {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: var(--space-3);
      margin-bottom: var(--space-5);
    }

    .filters {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
      margin-bottom: var(--space-4);
    }
    .chip {
      min-height: var(--control-height-sm);
      padding: 0 var(--space-3);
      font-size: var(--text-xs);
      font-weight: 600;
      border: 1px solid var(--border);
      border-radius: var(--radius-full);
      background: var(--surface);
      color: var(--text-secondary);
    }
    .chip:hover:not(.on) {
      background: var(--bg-muted);
      color: var(--text);
    }
    .chip.on {
      background: var(--primary-subtle);
      border-color: var(--primary-border);
      color: var(--primary);
    }
    .chip-count { opacity: 0.75; }

    .table-wrap { padding: 0; overflow-x: auto; }
    table {
      width: 100%;
      min-width: 52rem;
      border-collapse: collapse;
      font-size: var(--text-sm);
    }
    th, td {
      padding: var(--space-3) var(--space-4);
      text-align: left;
      border-bottom: 1px solid var(--border);
      vertical-align: middle;
    }
    th {
      font-size: var(--text-xs);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: var(--tracking-wide);
      color: var(--text-muted);
      background: var(--bg-subtle);
      white-space: nowrap;
    }
    tbody tr {
      position: relative;
      transition: background var(--dur-fast) var(--ease);
    }
    tbody tr:hover { background: var(--bg-subtle); }
    tbody tr:last-child td { border-bottom: 0; }

    .client {
      display: grid;
      gap: var(--space-1);
      text-decoration: none;
      color: inherit;
    }
    .client::after {
      content: '';
      position: absolute;
      inset: 0;
    }
    .client strong { margin-right: var(--space-1); }
    .client-name { font-weight: 600; }
    .client-mail {
      font-size: var(--text-xs);
      color: var(--text-muted);
    }
    tbody tr:hover .client-name { color: var(--primary); }

    .pipeline {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-1);
    }
    .pip {
      font-variant-numeric: tabular-nums;
      font-size: var(--text-xs);
      font-weight: 600;
      line-height: 1.3;
      padding: 0 var(--space-1);
      border-radius: var(--radius-sm);
      background: var(--bg-muted);
      color: var(--text-muted);
    }
    .pip.done {
      background: var(--success-subtle);
      color: var(--success);
    }
    .pip.cur {
      background: var(--primary);
      color: var(--text-on-primary);
    }

    .days { margin-right: var(--space-1); }
    .go {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      font-weight: 600;
      font-size: var(--text-sm);
      color: var(--primary);
      white-space: nowrap;
    }

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
      max-width: 48ch;
      color: var(--text-secondary);
      font-size: var(--text-sm);
    }

    @media (max-width: 900px) {
      .stats { grid-template-columns: 1fr 1fr; }
    }
  `]
})
export class LawyerPanelComponent implements OnInit {
  cases: CaseItem[] = [];
  filter: Filter = 'all';
  loading = false;
  error = false;
  STATE_KEYS = STATE_KEYS;
  filterDefs: { id: Filter; label: string }[] = [
    { id: 'all', label: 'Todos' },
    { id: 'review', label: 'Revisión' },
    { id: 'signature', label: 'Firma' },
    { id: 'notary', label: 'Cierre' },
    { id: 'done', label: 'Cerrados' },
  ];

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
        this.loading = false;
      },
      error: () => {
        this.error = true;
        this.loading = false;
      },
    });
  }

  get filtered(): CaseItem[] {
    switch (this.filter) {
      case 'review': return this.cases.filter((c) => c.status === '03');
      case 'signature': return this.cases.filter((c) => c.status === '04' || c.status === '05');
      case 'notary': return this.cases.filter((c) => c.status === '06' || c.status === '07');
      case 'done': return this.cases.filter((c) => c.status === '10');
      default: return this.cases;
    }
  }

  get filterLabel(): string {
    return this.filterDefs.find((f) => f.id === this.filter)?.label ?? 'Todos';
  }

  get countReview(): number { return this.cases.filter((c) => c.status === '03').length; }
  get countSignature(): number { return this.cases.filter((c) => c.status === '04' || c.status === '05').length; }
  get countClosure(): number { return this.cases.filter((c) => c.status === '06' || c.status === '07').length; }
  get countDone(): number { return this.cases.filter((c) => c.status === '10').length; }
  get countSla(): number { return this.cases.filter((c) => c.sla_warning).length; }

  countFor(id: Filter): number {
    if (id === 'all') return this.cases.length;
    if (id === 'review') return this.countReview;
    if (id === 'signature') return this.countSignature;
    if (id === 'notary') return this.countClosure;
    return this.countDone;
  }

  statusVariant(status: string): 'warn' | 'ok' | 'info' | 'default' {
    if (status === '03') return 'warn';
    if (status === '10') return 'ok';
    if (status === '04' || status === '05') return 'info';
    return 'default';
  }
}
