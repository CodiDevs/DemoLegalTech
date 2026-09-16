import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService, CaseItem } from '../../core/api.service';
import { StatusBadgeComponent } from '../../shared/status-badge.component';
import { IconComponent } from '../../shared/icon.component';
import {
  CASE_STATUS,
  CASE_STATUS_FILTER_OPTIONS,
  caseFilterLabel,
  caseLawyerHint,
} from '../../shared/case-status.data';
import { getProductDisplayName, LEGALSTATION_CATALOG } from '../../shared/product-sites.data';
import { WorkspaceHeadComponent } from './workspace-head.component';

const PAGE_SIZE = 10;

@Component({
  selector: 'app-lawyer-panel',
  standalone: true,
  imports: [FormsModule, RouterLink, StatusBadgeComponent, IconComponent, WorkspaceHeadComponent],
  template: `
    <div class="inbox">
      <app-workspace-head title="Bandeja" [aside]="headAside" />

      <div class="inbox-toolbar" role="search" aria-label="Buscar y filtrar expedientes">
        <label class="search-field">
          <span class="sr-only">Buscar por nombre o número</span>
          <app-icon name="search" [size]="16" />
          <input
            type="search"
            name="q"
            [(ngModel)]="query"
            (ngModelChange)="onFiltersChange()"
            placeholder="Nombre o #expediente"
            autocomplete="off"
          />
        </label>

        <label class="filter-field">
          <span class="filter-l">Servicio</span>
          <select name="service" [(ngModel)]="serviceFilter" (ngModelChange)="onFiltersChange()">
            <option value="">Todos</option>
            @for (s of serviceOptions; track s.id) {
              <option [value]="s.id">{{ s.label }}</option>
            }
          </select>
        </label>

        <label class="filter-field">
          <span class="filter-l">Estado</span>
          <select name="status" [(ngModel)]="statusFilter" (ngModelChange)="onFiltersChange()">
            @for (s of statusOptions; track s.id) {
              <option [value]="s.id">{{ s.label }}</option>
            }
          </select>
        </label>
      </div>

      @if (loading) {
        <div class="panel state-loading" role="status">
          <span class="spinner" aria-hidden="true"></span>
          <span>Cargando la bandeja…</span>
        </div>
      } @else if (error) {
        <div class="panel state-error" role="alert">
          <span class="state-error-icon"><app-icon name="alert-triangle" [size]="20" /></span>
          <div class="state-error-body">
            <strong>No pudimos cargar la bandeja</strong>
            <p>El servidor no respondió. Vuelve a intentarlo.</p>
          </div>
          <button type="button" class="btn btn-secondary" (click)="load()">Volver a intentar</button>
        </div>
      } @else if (!cases.length) {
        <div class="panel empty-state">
          <h2>No hay casos asignados</h2>
          <p>Cuando entre un caso nuevo aparecerá aquí.</p>
        </div>
      } @else if (!filtered.length) {
        <div class="panel empty-state">
          <h2>{{ emptyFilterTitle }}</h2>
          <p>{{ emptyFilterBody }}</p>
          <button type="button" class="btn btn-secondary" (click)="clearFilters()">Ver todos</button>
        </div>
      } @else {
        <ul class="case-list" [attr.aria-label]="'Expedientes · página ' + page">
          @for (c of pageItems; track trackKey(c); let i = $index) {
            <li>
              <a
                class="case-row"
                [class.is-sla]="c.sla_warning"
                [style.--i]="i"
                [routerLink]="['/abogado/caso', c.id]"
              >
                <span class="case-id tabular">#{{ c.id }}</span>

                <div class="case-who">
                  <strong class="case-name">{{ c.client_name || 'Cliente' }}</strong>
                  <span class="case-meta">{{ productName(c) }} · {{ cityLine(c) }}</span>
                </div>

                <div class="case-now">
                  <span class="now-label">{{ nextHint(c.status) }}</span>
                  <span class="now-stage">{{ c.status_label }}</span>
                </div>

                <div class="case-wait">
                  <span class="wait-l tabular">{{ waitLabel(c) }}</span>
                  @if (c.sla_warning) {
                    <app-status-badge label="Fuera de plazo" variant="warn" />
                  }
                </div>
              </a>
            </li>
          }
        </ul>

        @if (totalPages > 1) {
          <nav class="pager" aria-label="Paginación de la bandeja">
            <button
              type="button"
              class="btn btn-secondary btn-sm"
              [disabled]="page <= 1"
              (click)="goPage(page - 1)"
            >
              Anterior
            </button>
            <span class="pager-meta tabular">
              {{ rangeLabel }} · pág. {{ page }} / {{ totalPages }}
            </span>
            <button
              type="button"
              class="btn btn-secondary btn-sm"
              [disabled]="page >= totalPages"
              (click)="goPage(page + 1)"
            >
              Siguiente
            </button>
          </nav>
        }
      }
    </div>
  `,
  styles: [`
    .inbox {
      padding-block: var(--space-1) var(--space-6);
    }

    .inbox-toolbar {
      display: grid;
      grid-template-columns: minmax(0, 1.4fr) minmax(10rem, 0.8fr) minmax(12rem, 1fr);
      gap: var(--space-3);
      margin-bottom: var(--space-5);
      animation: inbox-in 480ms var(--ease-out);
    }

    .search-field,
    .filter-field {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      min-height: var(--control-height);
      padding: 0 var(--space-3);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      background: var(--surface);
      box-shadow: var(--shadow-sm);
      transition: border-color 200ms var(--ease), box-shadow 200ms var(--ease);
    }

    .search-field:focus-within,
    .filter-field:focus-within {
      border-color: var(--primary-border);
      box-shadow: 0 0 0 3px var(--primary-subtle);
    }

    .search-field {
      color: var(--text-muted);
    }

    .search-field input {
      flex: 1;
      min-width: 0;
      border: 0;
      background: transparent;
      color: var(--text);
      font: inherit;
      font-size: var(--text-sm);
      outline: none;
    }

    .filter-field {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr);
      align-items: center;
      gap: var(--space-2);
      padding-inline: var(--space-3);
    }

    .filter-l {
      font-size: var(--text-xs);
      font-weight: 650;
      color: var(--text-muted);
      white-space: nowrap;
    }

    .filter-field select {
      width: 100%;
      min-width: 0;
      border: 0;
      background: transparent;
      color: var(--text);
      font: inherit;
      font-size: var(--text-sm);
      font-weight: 550;
      outline: none;
      cursor: pointer;
    }

    .case-list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: grid;
      gap: var(--space-2);
    }

    .case-row {
      display: grid;
      grid-template-columns: 4.25rem minmax(0, 1.15fr) minmax(0, 1.55fr) auto;
      gap: var(--space-5);
      align-items: center;
      padding: var(--space-4) var(--space-5);
      text-decoration: none;
      color: inherit;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-sm);
      animation: inbox-row-in 480ms var(--ease-out);
      animation-delay: calc(min(var(--i, 0), 8) * 40ms);
      transition:
        background 220ms var(--ease-out),
        border-color 220ms var(--ease-out),
        box-shadow 220ms var(--ease-out);
    }

    .case-row:hover,
    .case-row:focus-visible {
      background: color-mix(in srgb, var(--primary) 7%, var(--surface));
      border-color: color-mix(in srgb, var(--primary) 28%, var(--border));
      box-shadow: var(--shadow-sm);
    }

    .case-row:focus-visible {
      outline: 2px solid var(--focus-ring);
      outline-offset: 2px;
    }

    .case-row.is-sla {
      background: var(--warning-subtle);
    }

    .case-id {
      font-size: var(--text-sm);
      font-weight: 650;
      letter-spacing: -0.02em;
      color: var(--text-muted);
    }

    .case-who {
      display: grid;
      gap: 0.15rem;
      min-width: 0;
    }

    .case-name {
      font-size: var(--text-base);
      font-weight: 650;
      letter-spacing: -0.02em;
    }

    .case-meta {
      font-size: var(--text-xs);
      color: var(--text-secondary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .case-now {
      display: grid;
      gap: 0.2rem;
      min-width: 0;
    }

    .now-label {
      font-size: var(--text-sm);
      font-weight: 650;
      line-height: var(--leading-snug);
      color: var(--text);
    }

    .now-stage {
      font-size: var(--text-xs);
      font-weight: 550;
      color: var(--text-secondary);
    }

    .case-wait {
      display: grid;
      gap: var(--space-1);
      justify-items: end;
    }

    .wait-l {
      font-size: var(--text-xs);
      font-weight: 600;
      color: var(--text-muted);
      white-space: nowrap;
    }

    .pager {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-4);
      margin-top: var(--space-5);
      flex-wrap: wrap;
    }

    .pager-meta {
      font-size: var(--text-sm);
      color: var(--text-secondary);
      font-weight: 550;
    }

    .btn-sm {
      padding: var(--space-2) var(--space-3);
      font-size: var(--text-xs);
      min-height: 2rem;
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
      justify-items: start;
      gap: var(--space-3);
      text-align: left;
      padding: var(--space-6) var(--space-5);
      animation: inbox-in 480ms var(--ease-out);
    }

    .empty-state h2 { font-size: var(--text-lg); margin: 0; }
    .empty-state p {
      margin: 0;
      max-width: 52ch;
      color: var(--text-secondary);
      font-size: var(--text-sm);
    }

    .tabular { font-variant-numeric: tabular-nums; }

    @keyframes inbox-in {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: none;
      }
    }

    @keyframes inbox-row-in {
      from {
        opacity: 0;
        transform: translateY(12px);
      }
      to {
        opacity: 1;
        transform: none;
      }
    }

    @media (max-width: 1100px) {
      .inbox-toolbar {
        grid-template-columns: 1fr 1fr;
      }
      .search-field {
        grid-column: 1 / -1;
      }
      .case-row {
        grid-template-columns: 3.5rem minmax(0, 1fr);
        grid-template-areas:
          "id who"
          "id now"
          "id wait";
        gap: var(--space-2) var(--space-4);
      }
      .case-id { grid-area: id; align-self: start; padding-top: 0.15rem; }
      .case-who { grid-area: who; }
      .case-now { grid-area: now; }
      .case-wait { grid-area: wait; justify-items: start; }
    }

    @media (max-width: 640px) {
      .inbox-toolbar {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class LawyerPanelComponent implements OnInit {
  cases: CaseItem[] = [];
  loading = false;
  error = false;

  query = '';
  /** Vacío = todos los estados. */
  statusFilter = '';
  serviceFilter = '';
  page = 1;

  readonly pageSize = PAGE_SIZE;
  readonly statusOptions = CASE_STATUS_FILTER_OPTIONS;
  readonly serviceOptions = LEGALSTATION_CATALOG
    .filter((p) => p.live)
    .map((p) => ({ id: p.id, label: p.name }));

  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.applyEstadoQuery(this.route.snapshot.queryParamMap.get('estado'));
    this.load();
  }

  applyEstadoQuery(raw: string | null | undefined): void {
    const code = (raw || '').trim();
    this.statusFilter = CASE_STATUS[code] ? code : '';
    this.page = 1;
  }

  load(): void {
    this.loading = true;
    this.error = false;
    this.api.listCases().subscribe({
      next: (c) => {
        this.cases = c;
        this.loading = false;
        this.clampPage();
      },
      error: () => {
        this.error = true;
        this.loading = false;
      },
    });
  }

  onFiltersChange(): void {
    this.page = 1;
  }

  clearFilters(): void {
    this.query = '';
    this.serviceFilter = '';
    this.statusFilter = '';
    this.page = 1;
  }

  goPage(n: number): void {
    this.page = Math.min(Math.max(1, n), this.totalPages);
  }

  get filtered(): CaseItem[] {
    const q = this.query.trim().toLowerCase();
    const list = this.cases.filter((c) => {
      if (this.statusFilter && c.status !== this.statusFilter) return false;
      if (this.serviceFilter) {
        const product = (c.product || 'divorcio360').toLowerCase();
        if (product !== this.serviceFilter) return false;
      }
      if (q) {
        const name = (c.client_name || '').toLowerCase();
        const id = String(c.id);
        const idMatch = id.includes(q.replace(/^#/, ''));
        if (!name.includes(q) && !idMatch) return false;
      }
      return true;
    });

    return [...list].sort((a, b) => {
      const sla = Number(!!b.sla_warning) - Number(!!a.sla_warning);
      if (sla) return sla;
      const act = Number(this.needsYou(b)) - Number(this.needsYou(a));
      if (act) return act;
      return b.id - a.id;
    });
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filtered.length / this.pageSize));
  }

  get pageItems(): CaseItem[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filtered.slice(start, start + this.pageSize);
  }

  get rangeLabel(): string {
    if (!this.filtered.length) return '0 expedientes';
    const start = (this.page - 1) * this.pageSize + 1;
    const end = Math.min(this.page * this.pageSize, this.filtered.length);
    return `${start}–${end} de ${this.filtered.length}`;
  }

  get headAside(): string {
    if (this.loading || this.error) return '';
    const n = this.cases.length;
    if (n === 0) return 'Sin expedientes';
    const shown = this.filtered.length;
    if (this.filtersActive && shown !== n) {
      return shown === 1 ? `1 de ${n}` : `${shown} de ${n}`;
    }
    return n === 1 ? '1 expediente' : `${n} expedientes`;
  }

  get filtersActive(): boolean {
    return !!(this.statusFilter || this.serviceFilter || this.query.trim());
  }

  get statusFilterLabel(): string {
    return caseFilterLabel(this.statusFilter, 'este estado');
  }

  get emptyFilterTitle(): string {
    if (this.statusFilter && !this.query.trim() && !this.serviceFilter) {
      return `Ninguno en ${this.statusFilterLabel}`;
    }
    return 'Ningún expediente coincide';
  }

  get emptyFilterBody(): string {
    const n = this.cases.length;
    const pile = n === 1 ? 'Hay 1 en la bandeja.' : `Hay ${n} en la bandeja.`;
    if (this.query.trim()) {
      return `La búsqueda no encontró nada. ${pile}`;
    }
    if (this.serviceFilter) {
      const svc = this.serviceOptions.find((s) => s.id === this.serviceFilter)?.label ?? 'ese servicio';
      return `Ninguno de ${svc}. ${pile}`;
    }
    return pile;
  }

  trackKey(c: CaseItem): string {
    return `${this.statusFilter}-${this.serviceFilter}-${this.query}-${this.page}-${c.id}`;
  }

  needsYou(c: CaseItem): boolean {
    return ['03', '04', '06', '07', '08', '09'].includes(c.status);
  }

  nextHint(status: string): string {
    return caseLawyerHint(status);
  }

  productName(c: CaseItem): string {
    return getProductDisplayName(c.product || 'divorcio360');
  }

  cityLine(c: CaseItem): string {
    const raw = (c.city || '').trim();
    if (!raw) return 'Sin ciudad';
    return raw.split(',')[0].trim();
  }

  waitLabel(c: CaseItem): string {
    const days = this.daysIn(c);
    if (days === null) return 'En esta etapa';
    if (days <= 0) return 'Hoy';
    if (days === 1) return '1 día aquí';
    return `${days} días aquí`;
  }

  private clampPage(): void {
    if (this.page > this.totalPages) {
      this.page = this.totalPages;
    }
  }

  private daysIn(c: CaseItem): number | null {
    if (typeof c.days_in_status === 'number') return c.days_in_status;
    const t = Date.parse(c.updated_at || c.created_at || '');
    if (!t) return null;
    return Math.max(0, Math.floor((Date.now() - t) / 86400000));
  }
}
