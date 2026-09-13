import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService, CaseItem } from '../../core/api.service';
import { StatusBadgeComponent } from '../../shared/status-badge.component';
import { IconComponent, IconName } from '../../shared/icon.component';
import { CASE_STATUS_ICONS, CASE_STATUS_KEYS } from '../../shared/case-progress.model';
import { getProductDisplayName } from '../../shared/product-sites.data';

type Filter = 'action' | 'sla' | 'review' | 'signature' | 'notary' | 'done' | 'all';

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

@Component({
  selector: 'app-lawyer-panel',
  standalone: true,
  imports: [RouterLink, StatusBadgeComponent, IconComponent],
  template: `
    <div class="inbox">
      <header class="inbox-head">
        <p class="inbox-kicker">Casos</p>
        <h1>Bandeja</h1>
        <p class="inbox-lede">Qué te toca ahora. Un clic abre el expediente.</p>
      </header>

      <div class="lanes" role="group" aria-label="Filtrar la bandeja">
        @for (f of filterDefs; track f.id) {
          <button
            type="button"
            class="lane"
            [class.on]="filter === f.id"
            [class.lane-warn]="f.id === 'sla'"
            [attr.aria-pressed]="filter === f.id"
            (click)="setFilter(f.id)"
          >
            <span class="lane-n tabular">{{ countFor(f.id) }}</span>
            <span class="lane-l">{{ f.label }}</span>
          </button>
        }
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
          <h2>Nada en «{{ filterLabel }}»</h2>
          <p>Hay {{ cases.length }} casos en la bandeja. Este recorte está vacío.</p>
          <button type="button" class="btn btn-secondary" (click)="setFilter('all')">Ver todos</button>
        </div>
      } @else {
        <ul class="case-list" [attr.aria-label]="'Casos: ' + filterLabel">
          @for (c of filtered; track trackKey(c); let i = $index) {
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
                    <app-status-badge label="SLA en riesgo" variant="warn" />
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
      }
    </div>
  `,
  styles: [`
    .inbox {
      padding-block: var(--space-1) var(--space-6);
    }

    .inbox-head {
      margin-bottom: var(--space-5);
      animation: inbox-in 520ms var(--ease-out) both;
    }

    .inbox-kicker {
      margin: 0 0 var(--space-2);
      font-size: var(--text-xs);
      font-weight: 650;
      letter-spacing: var(--tracking-wide);
      text-transform: uppercase;
      color: var(--primary);
    }

    .inbox-head h1 {
      margin: 0;
      font-family: var(--font-display);
      font-size: clamp(1.85rem, 3vw, 2.5rem);
      font-weight: 600;
      letter-spacing: -0.03em;
      line-height: 1.1;
    }

    .inbox-lede {
      margin: var(--space-2) 0 0;
      max-width: 42ch;
      color: var(--text-secondary);
      font-size: var(--text-sm);
    }

    .lanes {
      display: grid;
      grid-template-columns: repeat(7, minmax(0, 1fr));
      gap: var(--space-2);
      margin-bottom: var(--space-5);
    }

    .lane {
      display: grid;
      gap: 0.15rem;
      min-height: 4.25rem;
      padding: var(--space-3);
      text-align: left;
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      background: var(--surface);
      color: var(--text-secondary);
      box-shadow: var(--shadow-sm);
      animation: inbox-in 480ms var(--ease-out) both;
      transition:
        transform 240ms var(--ease-out),
        border-color 200ms var(--ease),
        background 200ms var(--ease),
        box-shadow 240ms var(--ease);
    }

    .lanes .lane:nth-child(1) { animation-delay: 40ms; }
    .lanes .lane:nth-child(2) { animation-delay: 70ms; }
    .lanes .lane:nth-child(3) { animation-delay: 100ms; }
    .lanes .lane:nth-child(4) { animation-delay: 130ms; }
    .lanes .lane:nth-child(5) { animation-delay: 160ms; }
    .lanes .lane:nth-child(6) { animation-delay: 190ms; }
    .lanes .lane:nth-child(7) { animation-delay: 220ms; }

    .lane:hover:not(.on) {
      transform: translateY(-3px);
      border-color: color-mix(in srgb, var(--primary) 28%, var(--border));
      box-shadow: var(--shadow-md);
      color: var(--text);
    }

    .lane:active {
      transform: translateY(-1px) scale(0.98);
    }

    .lane.on {
      background: var(--primary-subtle);
      border-color: var(--primary-border);
      color: var(--primary);
      box-shadow: var(--shadow-md);
    }

    .lane-warn.on {
      background: var(--warning-subtle);
      border-color: var(--warning-border);
      color: var(--warning);
    }

    .lane-n {
      font-size: var(--text-2xl);
      font-weight: 650;
      letter-spacing: var(--tracking-tight);
      line-height: 1;
      color: var(--text);
    }

    .lane.on .lane-n { color: var(--primary); }
    .lane-warn.on .lane-n { color: var(--warning); }

    .lane-l {
      font-size: var(--text-xs);
      font-weight: 650;
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
      .lanes { grid-template-columns: repeat(4, minmax(0, 1fr)); }
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
      .lanes { grid-template-columns: 1fr 1fr; }
      .lane:last-child { grid-column: 1 / -1; }
    }
  `]
})
export class LawyerPanelComponent implements OnInit {
  cases: CaseItem[] = [];
  filter: Filter = 'action';
  loading = false;
  error = false;
  readonly stageKeys = CASE_STATUS_KEYS;
  readonly stageShort = STAGE_SHORT;
  filterDefs: { id: Filter; label: string }[] = [
    { id: 'action', label: 'Te toca' },
    { id: 'sla', label: 'SLA' },
    { id: 'review', label: 'Revisión' },
    { id: 'signature', label: 'Firma' },
    { id: 'notary', label: 'Notaría' },
    { id: 'done', label: 'Cerrados' },
    { id: 'all', label: 'Todos' },
  ];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.load();
  }

  setFilter(id: Filter): void {
    this.filter = id;
  }

  load(): void {
    this.loading = true;
    this.error = false;
    this.api.listCases().subscribe({
      next: (c) => {
        this.cases = c;
        this.loading = false;
        if (this.filter === 'action' && this.countFor('action') === 0) {
          this.filter = 'all';
        }
      },
      error: () => {
        this.error = true;
        this.loading = false;
      },
    });
  }

  get filtered(): CaseItem[] {
    const list = this.cases.filter((c) => this.matches(c, this.filter));
    return [...list].sort((a, b) => {
      const sla = Number(!!b.sla_warning) - Number(!!a.sla_warning);
      if (sla) return sla;
      const act = Number(this.needsYou(b)) - Number(this.needsYou(a));
      if (act) return act;
      return b.id - a.id;
    });
  }

  get filterLabel(): string {
    return this.filterDefs.find((f) => f.id === this.filter)?.label ?? 'Todos';
  }

  trackKey(c: CaseItem): string {
    return `${this.filter}-${c.id}`;
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

  countFor(id: Filter): number {
    return this.cases.filter((c) => this.matches(c, id)).length;
  }

  statusVariant(status: string): 'warn' | 'ok' | 'info' | 'default' {
    if (status === '03') return 'warn';
    if (status === '10') return 'ok';
    if (status === '04' || status === '05') return 'info';
    return 'default';
  }

  private matches(c: CaseItem, id: Filter): boolean {
    switch (id) {
      case 'action': return this.needsYou(c);
      case 'sla': return !!c.sla_warning;
      case 'review': return c.status === '03';
      case 'signature': return c.status === '04' || c.status === '05';
      case 'notary': return c.status === '06' || c.status === '07';
      case 'done': return c.status === '10';
      default: return true;
    }
  }

  private daysIn(c: CaseItem): number | null {
    if (typeof c.days_in_status === 'number') return c.days_in_status;
    const t = Date.parse(c.updated_at || c.created_at || '');
    if (!t) return null;
    return Math.max(0, Math.floor((Date.now() - t) / 86400000));
  }
}
