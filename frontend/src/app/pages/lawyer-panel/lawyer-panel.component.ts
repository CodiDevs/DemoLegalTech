import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService, CaseItem } from '../../core/api.service';
import { StatusBadgeComponent } from '../../shared/status-badge.component';
import { IconComponent, IconName } from '../../shared/icon.component';
import { CASE_STATUS_ICONS, CASE_STATUS_KEYS } from '../../shared/case-progress.model';
import { getProductDisplayName, LEGALSTATION_CATALOG } from '../../shared/product-sites.data';
import { WorkspaceHeadComponent } from './workspace-head.component';

const PAGE_SIZE = 10;

const STAGE_HINT: Record<string, string> = {
  '01': 'Caso recibido. Espera el pago o la carga inicial.',
  '02': 'El cliente debe subir los documentos.',
  '03': 'Revisa y aprueba cada documento.',
  '04': 'Carga la minuta del notario.',
  '05': 'El cliente firma. Puedes reenviar el aviso.',
  '06': 'Registra el envío a notaría.',
  '07': 'Registra la comparecencia.',
  '08': 'Registra el acta emitida.',
  '09': 'Inscribe en Registro Civil y cierra.',
  '10': 'Trámite cerrado.',
};

const STAGE_SHORT: Record<string, string> = {
  '01': 'Recepción',
  '02': 'Documentos',
  '03': 'Revisión',
  '04': 'Minuta',
  '05': 'Firma',
  '06': 'Notaría',
  '07': 'Cita',
  '08': 'Acta',
  '09': 'Registro',
  '10': 'Cierre',
};

/** Labels de estado del trámite (alineados al backend). */
const STATUS_OPTIONS: { id: string; label: string }[] = [
  { id: '', label: 'Todos los estados' },
  { id: '01', label: 'Información recibida' },
  { id: '02', label: 'Documentos pendientes' },
  { id: '03', label: 'Revisión' },
  { id: '04', label: 'Documentos preparados' },
  { id: '05', label: 'Firmas' },
  { id: '06', label: 'Enviado a notaría' },
  { id: '07', label: 'Comparecencia' },
  { id: '08', label: 'Acta emitida' },
  { id: '09', label: 'Registro' },
  { id: '10', label: 'Finalizado' },
];

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
          <span class="empty-icon"><app-icon name="inbox" [size]="22" /></span>
          <h2>No hay casos asignados</h2>
          <p>Cuando entre un caso nuevo aparecerá aquí.</p>
        </div>
      } @else if (!filtered.length) {
        <div class="panel empty-state">
          <span class="empty-icon"><app-icon name="search" [size]="22" /></span>
          <h2>Sin resultados</h2>
          <p>Ningún expediente coincide con la búsqueda o los filtros.</p>
          <button type="button" class="btn btn-secondary" (click)="clearFilters()">Limpiar filtros</button>
        </div>
      } @else {
        <ul class="case-list" [attr.aria-label]="'Expedientes · página ' + page">
          @for (c of pageItems; track trackKey(c); let i = $index) {
            <li>
              <a
                class="case-row"
                [class.is-sla]="c.sla_warning"
                [class.is-act]="needsYou(c)"
                [style.--i]="i"
                [routerLink]="['/abogado/caso', c.id]"
              >
                <span class="case-mark" aria-hidden="true">
                  <app-icon [name]="stageIcon(c.status)" [size]="18" />
                </span>

                <div class="case-who">
                  <span class="case-id tabular">#{{ c.id }}</span>
                  <strong class="case-name">{{ c.client_name || 'Cliente' }}</strong>
                  <span class="case-meta">{{ productName(c) }} · {{ cityLine(c) }}</span>
                </div>

                <div class="case-now">
                  <span class="now-label">{{ nextHint(c.status) }}</span>
                  <app-status-badge [label]="c.status_label" [variant]="statusVariant(c.status)" />
                </div>

                <div class="case-wait">
                  <span class="wait-l">{{ waitLabel(c) }}</span>
                  @if (c.sla_warning) {
                    <app-status-badge label="Fuera de plazo" variant="warn" />
                  }
                </div>

                <ol class="rail" aria-hidden="true">
                  @for (s of stageKeys; track s) {
                    <li
                      class="pip"
                      [class.done]="s <= c.status"
                      [class.cur]="s === c.status"
                      [attr.title]="stageShort[s]"
                    ></li>
                  }
                </ol>

                <span class="go">
                  Abrir
                  <app-icon name="arrow-right" [size]="16" />
                </span>
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
      animation: inbox-in 480ms var(--ease-out) both;
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
      grid-template-columns: auto minmax(0, 1.2fr) minmax(0, 1.4fr) auto auto auto;
      gap: var(--space-4);
      align-items: center;
      padding: var(--space-4);
      text-decoration: none;
      color: inherit;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      animation: inbox-row-in 520ms var(--ease-out) both;
      animation-delay: calc(min(var(--i, 0), 8) * 45ms);
      transition:
        transform 280ms var(--ease-out),
        box-shadow 280ms var(--ease),
        border-color 200ms var(--ease);
    }

    .case-row:hover {
      transform: translateX(6px);
      box-shadow: var(--shadow-lg);
      border-color: color-mix(in srgb, var(--primary) 32%, var(--border));
    }

    .case-row:hover .go { transform: translateX(4px); }

    .case-row.is-act {
      border-left: 3px solid var(--primary);
    }

    .case-row.is-sla {
      border-left-color: var(--warning);
      background: color-mix(in srgb, var(--warning-subtle) 55%, var(--surface));
    }

    .case-mark {
      display: grid;
      place-items: center;
      width: 2.5rem;
      height: 2.5rem;
      border-radius: var(--radius-md);
      background: var(--primary-subtle);
      color: var(--primary);
    }

    .case-row.is-sla .case-mark {
      background: var(--warning-subtle);
      color: var(--warning);
    }

    .case-who {
      display: grid;
      gap: 0.15rem;
      min-width: 0;
    }

    .case-id {
      font-size: var(--text-xs);
      font-weight: 650;
      color: var(--text-muted);
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
      gap: var(--space-2);
      justify-items: start;
      min-width: 0;
    }

    .now-label {
      font-size: var(--text-sm);
      font-weight: 650;
      line-height: var(--leading-snug);
      color: var(--text);
    }

    .case-wait {
      display: grid;
      gap: var(--space-1);
      justify-items: start;
    }

    .wait-l {
      font-size: var(--text-xs);
      font-weight: 600;
      color: var(--text-muted);
      white-space: nowrap;
    }

    .rail {
      display: flex;
      align-items: center;
      gap: 0.28rem;
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .pip {
      width: 0.45rem;
      height: 0.45rem;
      border-radius: var(--radius-full);
      background: var(--border-strong);
    }

    .pip.done { background: var(--success); }
    .pip.cur {
      width: 0.7rem;
      height: 0.7rem;
      background: var(--primary);
      box-shadow: 0 0 0 3px var(--primary-subtle);
    }

    .go {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      font-weight: 650;
      font-size: var(--text-sm);
      color: var(--primary);
      white-space: nowrap;
      transition: transform 240ms var(--ease-out);
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
      justify-items: center;
      gap: var(--space-3);
      text-align: center;
      padding: var(--space-7) var(--space-5);
      animation: inbox-in 480ms var(--ease-out) both;
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

    .tabular { font-variant-numeric: tabular-nums; }

    @keyframes inbox-in {
      from {
        opacity: 0;
        transform: translateY(14px);
        filter: blur(6px);
      }
      to {
        opacity: 1;
        transform: none;
        filter: blur(0);
      }
    }

    @keyframes inbox-row-in {
      from {
        opacity: 0;
        transform: translateY(18px);
        filter: blur(8px);
      }
      to {
        opacity: 1;
        transform: none;
        filter: blur(0);
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
        grid-template-columns: auto minmax(0, 1fr) auto;
        grid-template-areas:
          "mark who go"
          "now now now"
          "wait wait rail";
      }
      .case-mark { grid-area: mark; }
      .case-who { grid-area: who; }
      .case-now { grid-area: now; }
      .case-wait { grid-area: wait; }
      .rail { grid-area: rail; justify-self: end; }
      .go { grid-area: go; }
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
  /** Vacío = todos. Por defecto Revisión (03). */
  statusFilter = '03';
  serviceFilter = '';
  page = 1;

  readonly pageSize = PAGE_SIZE;
  readonly stageKeys = CASE_STATUS_KEYS;
  readonly stageShort = STAGE_SHORT;
  readonly statusOptions = STATUS_OPTIONS;
  readonly serviceOptions = LEGALSTATION_CATALOG
    .filter((p) => p.live)
    .map((p) => ({ id: p.id, label: p.name }));

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
    if (n === 1) return '1 expediente';
    return `${n} expedientes`;
  }

  trackKey(c: CaseItem): string {
    return `${this.statusFilter}-${this.serviceFilter}-${this.query}-${this.page}-${c.id}`;
  }

  needsYou(c: CaseItem): boolean {
    return ['03', '04', '06', '07', '08', '09'].includes(c.status);
  }

  nextHint(status: string): string {
    return STAGE_HINT[status] || 'Abrir el expediente.';
  }

  stageIcon(status: string): IconName {
    return CASE_STATUS_ICONS[status] || 'inbox';
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

  statusVariant(status: string): 'warn' | 'ok' | 'info' | 'default' {
    if (status === '03') return 'warn';
    if (status === '10') return 'ok';
    if (status === '04' || status === '05') return 'info';
    return 'default';
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
