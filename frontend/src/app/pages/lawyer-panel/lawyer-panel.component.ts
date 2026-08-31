import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService, CaseItem } from '../../core/api.service';
import { MetricCardComponent } from '../../shared/metric-card.component';
import { StatusBadgeComponent } from '../../shared/status-badge.component';

type Filter = 'all' | 'review' | 'signature' | 'notary' | 'done';

const STATE_KEYS = ['01','02','03','04','05','06','07','08','09','10'];

@Component({
  selector: 'app-lawyer-panel',
  standalone: true,
  imports: [RouterLink, MetricCardComponent, StatusBadgeComponent],
  template: `
    <div class="wrap">
      <div class="head">
        <div>
          <h1>Bandeja de casos</h1>
          <p class="muted">Revisión jurídica, minuta, firma y notaría — workspace operador</p>
        </div>
      </div>

      <div class="stats">
        <app-metric-card [value]="countReview" label="En revisión (03)" />
        <app-metric-card [value]="countSignature" label="Firma (04-05)" />
        <app-metric-card [value]="countNotary" label="Notaría (06-07)" />
        <app-metric-card [value]="countSla" label="SLA en riesgo" />
      </div>

      <div class="filters">
        @for (f of filterDefs; track f.id) {
          <button type="button" class="btn btn-ghost" [class.on]="filter === f.id" (click)="filter = f.id">
            {{ f.label }} ({{ countFor(f.id) }})
          </button>
        }
      </div>

      @if (filtered.length) {
        <div class="table panel">
          <div class="table-head">
            <span>Cliente</span>
            <span>Estado</span>
            <span>Cola de casos</span>
            <span>Ciudad</span>
            <span>Días</span>
            <span></span>
          </div>
          @for (c of filtered; track c.id) {
            <a class="table-row" [routerLink]="['/abogado/caso', c.id]">
              <span class="client">
                <strong class="mono">#{{ c.id }}</strong>
                {{ c.client_name }}
                <em class="muted">{{ c.client_email }}</em>
              </span>
              <span>
                <app-status-badge [label]="c.status_label" [variant]="statusVariant(c.status)" />
              </span>
              <span class="pipeline">
                @for (s of STATE_KEYS; track s) {
                  <span class="pip" [class.done]="s <= c.status" [class.cur]="s === c.status">{{ s }}</span>
                }
              </span>
              <span class="muted">{{ c.city || '—' }}</span>
              <span>
                {{ c.days_in_status ?? '—' }}
                @if (c.sla_warning) { <app-status-badge label="SLA" variant="warn" /> }
              </span>
              <span class="go">Abrir →</span>
            </a>
          }
        </div>
      } @else {
        <div class="panel empty">
          <h2>Sin casos en este filtro</h2>
          <p class="muted">Cuando haya expedientes en esta etapa aparecerán aquí con pipeline y acciones contextuales.</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .wrap { padding-block: 0.5rem 2rem; }
    .head { margin-bottom: 1.25rem; }
    .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem; margin-bottom: 1.25rem; }
    .filters { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem; }
    .filters .on { background: var(--brand); color: white; border-color: var(--brand); }
    .table { padding: 0; overflow: hidden; }
    .table-head, .table-row {
      display: grid; grid-template-columns: 1.4fr 1fr 2fr 0.7fr 0.5fr 0.5fr; gap: 0.75rem;
      align-items: center; padding: 0.75rem 1rem;
    }
    .table-head {
      font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.04em;
      color: var(--ink-soft); background: oklch(0.98 0.004 220); border-bottom: 1px solid var(--line);
    }
    .table-row {
      text-decoration: none; color: inherit; border-bottom: 1px solid var(--line);
      transition: background 0.15s ease;
    }
    .table-row:hover { background: oklch(0.98 0.006 220); }
    .table-row:last-child { border-bottom: 0; }
    .client { display: grid; gap: 0.15rem; }
    .client em { font-style: normal; font-size: 0.82rem; }
    .mono { font-family: ui-monospace, monospace; margin-right: 0.35rem; }
    .pipeline { display: flex; flex-wrap: wrap; gap: 0.2rem; }
    .pip {
      font-family: ui-monospace, monospace; font-size: 0.62rem; font-weight: 700;
      padding: 0.1rem 0.3rem; border-radius: 4px; background: var(--line); color: var(--ink-soft);
    }
    .pip.done { background: oklch(0.92 0.04 150); color: var(--ok); }
    .pip.cur { background: var(--brand); color: white; }
    .go { font-weight: 600; font-size: 0.85rem; color: var(--brand); text-align: right; }
    .empty { text-align: center; padding: 2.5rem 1.5rem; }
    .empty h2 { font-size: 1.2rem; }
    @media (max-width: 900px) {
      .stats { grid-template-columns: 1fr 1fr; }
      .table-head { display: none; }
      .table-row { grid-template-columns: 1fr; gap: 0.5rem; }
      .go { text-align: left; }
    }
  `]
})
export class LawyerPanelComponent implements OnInit {
  cases: CaseItem[] = [];
  filter: Filter = 'all';
  STATE_KEYS = STATE_KEYS;
  filterDefs: { id: Filter; label: string }[] = [
    { id: 'all', label: 'Todos' },
    { id: 'review', label: 'Revisión' },
    { id: 'signature', label: 'Firma' },
    { id: 'notary', label: 'Notaría' },
    { id: 'done', label: 'Cerrados' },
  ];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.listCases().subscribe((c) => this.cases = c);
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

  get countReview(): number { return this.cases.filter((c) => c.status === '03').length; }
  get countSignature(): number { return this.cases.filter((c) => c.status === '04' || c.status === '05').length; }
  get countNotary(): number { return this.cases.filter((c) => c.status === '06' || c.status === '07').length; }
  get countDone(): number { return this.cases.filter((c) => c.status === '10').length; }
  get countSla(): number { return this.cases.filter((c) => c.sla_warning).length; }

  countFor(id: Filter): number {
    if (id === 'all') return this.cases.length;
    if (id === 'review') return this.countReview;
    if (id === 'signature') return this.countSignature;
    if (id === 'notary') return this.countNotary;
    return this.countDone;
  }

  statusVariant(status: string): 'warn' | 'ok' | 'info' | 'default' {
    if (status === '03') return 'warn';
    if (status === '10') return 'ok';
    if (status === '04' || status === '05') return 'info';
    return 'default';
  }
}
