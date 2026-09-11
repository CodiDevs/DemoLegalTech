import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService, CaseItem } from '../../core/api.service';
import { StatusBadgeComponent } from '../../shared/status-badge.component';
import { IconComponent, IconName } from '../../shared/icon.component';
import { CASE_STATUS_ICONS, CASE_STATUS_KEYS } from '../../shared/case-progress.model';
import { getProductDisplayName, normalizeProductId } from '../../shared/product-sites.data';

type Filter = 'action' | 'open' | 'done' | 'all';

const STAGE_HINT: Record<string, string> = {
  '01': 'Completa el pago para abrir el expediente.',
  '02': 'Sube los documentos que faltan.',
  '03': 'El abogado está revisando tus documentos.',
  '04': 'Espera la minuta del notario.',
  '05': 'Firma la minuta.',
  '06': 'El trámite va a notaría.',
  '07': 'Pendiente la comparecencia.',
  '08': 'Pendiente el acta.',
  '09': 'Inscripción en Registro Civil.',
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
  selector: 'app-client-panel',
  standalone: true,
  imports: [RouterLink, StatusBadgeComponent, IconComponent],
  template: `
    <div class="shell inbox">
      <header class="inbox-head">
        <p class="inbox-kicker">Cuenta</p>
        <h1>Tus trámites</h1>
        <p class="inbox-lede">Qué te toca ahora. Un clic continúa.</p>
      </header>

      @if (loading) {
        <div class="panel state-loading" role="status">
          <span class="spinner" aria-hidden="true"></span>
          <span>Cargando tus trámites…</span>
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
          <p>Explora los productos y crea tu primer expediente cuando estés listo.</p>
          <a routerLink="/" class="btn btn-primary">Ver productos</a>
        </div>
      } @else {
        <div class="lanes" role="group" aria-label="Filtrar trámites">
          @for (f of filterDefs; track f.id) {
            <button
              type="button"
              class="lane"
              [class.on]="filter === f.id"
              [attr.aria-pressed]="filter === f.id"
              (click)="setFilter(f.id)"
            >
              <span class="lane-n tabular">{{ countFor(f.id) }}</span>
              <span class="lane-l">{{ f.label }}</span>
            </button>
          }
        </div>

        @if (productDefs.length > 1) {
          <div class="prods" role="group" aria-label="Tipo de trámite">
            <button
              type="button"
              class="prod"
              [class.on]="product === 'all'"
              [attr.aria-pressed]="product === 'all'"
              (click)="setProduct('all')"
            >
              Todos
              <span class="prod-n tabular">{{ countProduct('all') }}</span>
            </button>
            @for (p of productDefs; track p.id) {
              <button
                type="button"
                class="prod"
                [class.on]="product === p.id"
                [attr.aria-pressed]="product === p.id"
                (click)="setProduct(p.id)"
              >
                {{ p.name }}
                <span class="prod-n tabular">{{ countProduct(p.id) }}</span>
              </button>
            }
          </div>
        }

        @if (!filtered.length) {
          <div class="panel empty-state">
            <span class="empty-icon"><app-icon name="search" [size]="22" /></span>
            <h2>Nada en «{{ filterLabel }}»</h2>
            <p>Hay {{ cases.length }} trámites en tu cuenta. Este recorte está vacío.</p>
            <button type="button" class="btn btn-secondary" (click)="clearFilters()">Ver todos</button>
          </div>
        } @else {
          <ul class="case-list" [attr.aria-label]="'Trámites: ' + filterLabel">
            @for (c of filtered; track trackKey(c); let i = $index) {
              <li>
                <a
                  class="case-row"
                  [class.is-pay]="!c.paid"
                  [class.is-act]="needsYou(c)"
                  [style.--i]="i"
                  [routerLink]="rowLink(c)"
                >
                  <span class="case-mark" aria-hidden="true">
                    <app-icon [name]="stageIcon(c)" [size]="18" />
                  </span>

                  <div class="case-who">
                    <span class="case-id tabular">#{{ c.id }}</span>
                    <strong class="case-name">{{ productName(c) }}</strong>
                    <span class="case-meta">{{ cityLine(c) }}</span>
                  </div>

                  <div class="case-now">
                    <span class="now-label">{{ nextHint(c) }}</span>
                    <app-status-badge [label]="c.status_label" [variant]="statusVariant(c)" />
                  </div>

                  <div class="case-pay">
                    <span class="pay-amt tabular">{{ money(c.amount_cents) }}</span>
                    <app-status-badge
                      [label]="c.paid ? 'Pagado' : 'Por pagar'"
                      [variant]="c.paid ? 'ok' : 'warn'"
                    />
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
                    {{ goLabel(c) }}
                    <app-icon name="arrow-right" [size]="16" />
                  </span>
                </a>
              </li>
            }
          </ul>
        }
      }
    </div>
  `,
  styles: [`
    .inbox {
      padding-block: var(--space-6) var(--space-8);
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
      grid-template-columns: repeat(4, minmax(0, 1fr));
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
    .lanes .lane:nth-child(2) { animation-delay: 80ms; }
    .lanes .lane:nth-child(3) { animation-delay: 120ms; }
    .lanes .lane:nth-child(4) { animation-delay: 160ms; }

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

    .lane-n {
      font-size: var(--text-2xl);
      font-weight: 650;
      letter-spacing: var(--tracking-tight);
      line-height: 1;
      color: var(--text);
    }

    .lane.on .lane-n { color: var(--primary); }

    .lane-l {
      font-size: var(--text-xs);
      font-weight: 650;
    }

    .prods {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
      margin: calc(var(--space-4) * -1) 0 var(--space-5);
      animation: inbox-in 480ms var(--ease-out) both;
      animation-delay: 180ms;
    }

    .prod {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      min-height: 2.25rem;
      padding: 0 var(--space-3);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      background: var(--surface);
      color: var(--text-secondary);
      font-size: var(--text-sm);
      font-weight: 600;
      transition:
        background 180ms var(--ease-out),
        border-color 180ms var(--ease-out),
        color 180ms var(--ease-out);
    }

    .prod:hover:not(.on) {
      border-color: color-mix(in srgb, var(--primary) 28%, var(--border));
      color: var(--text);
    }

    .prod.on {
      background: var(--primary-subtle);
      border-color: var(--primary-border);
      color: var(--primary);
    }

    .prod-n {
      font-size: var(--text-xs);
      font-weight: 650;
      color: var(--text-muted);
    }

    .prod.on .prod-n { color: var(--primary); }

    .case-list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: grid;
      gap: var(--space-2);
    }

    .case-row {
      display: grid;
      grid-template-columns: auto minmax(0, 1.1fr) minmax(0, 1.5fr) auto auto auto;
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

    .case-row.is-pay {
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

    .case-row.is-pay .case-mark {
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

    .case-pay {
      display: grid;
      gap: var(--space-1);
      justify-items: end;
    }

    .pay-amt {
      font-size: var(--text-sm);
      font-weight: 650;
      letter-spacing: -0.02em;
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
      .case-row {
        grid-template-columns: auto minmax(0, 1fr) auto;
        grid-template-areas:
          "mark who go"
          "now now now"
          "pay pay rail";
      }
      .case-mark { grid-area: mark; }
      .case-who { grid-area: who; }
      .case-now { grid-area: now; }
      .case-pay { grid-area: pay; justify-items: start; }
      .rail { grid-area: rail; justify-self: end; }
      .go { grid-area: go; }
    }

    @media (max-width: 640px) {
      .lanes { grid-template-columns: 1fr 1fr; }
    }
  `],
})
export class ClientPanelComponent implements OnInit {
  cases: CaseItem[] = [];
  filter: Filter = 'action';
  product = 'all';
  loading = false;
  error = false;
  readonly stageKeys = CASE_STATUS_KEYS;
  readonly stageShort = STAGE_SHORT;
  filterDefs: { id: Filter; label: string }[] = [
    { id: 'action', label: 'Te toca' },
    { id: 'open', label: 'En curso' },
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

  setProduct(id: string): void {
    this.product = id;
  }

  clearFilters(): void {
    this.filter = 'all';
    this.product = 'all';
  }

  get productDefs(): { id: string; name: string }[] {
    const map = new Map<string, string>();
    for (const c of this.cases) {
      const id = normalizeProductId(c.product);
      if (!map.has(id)) map.set(id, getProductDisplayName(id));
    }
    return [...map.entries()]
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name, 'es'));
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
    const list = this.cases.filter((c) => this.matches(c, this.filter) && this.matchesProduct(c, this.product));
    return [...list].sort((a, b) => {
      const act = Number(this.needsYou(b)) - Number(this.needsYou(a));
      if (act) return act;
      const pay = Number(!a.paid) - Number(!b.paid);
      if (pay) return pay;
      return b.id - a.id;
    });
  }

  get filterLabel(): string {
    const lane = this.filterDefs.find((f) => f.id === this.filter)?.label ?? 'Todos';
    if (this.product === 'all') return lane;
    return `${lane} · ${getProductDisplayName(this.product)}`;
  }

  trackKey(c: CaseItem): string {
    return `${this.filter}-${this.product}-${c.id}`;
  }

  needsYou(c: CaseItem): boolean {
    return !c.paid || c.status === '02' || !!c.can_sign || c.status === '05';
  }

  nextHint(c: CaseItem): string {
    if (!c.paid) return 'Completa el pago para continuar.';
    if (c.can_sign) return c.sign_hint || 'Firma la minuta.';
    return STAGE_HINT[c.status] || 'Abre el expediente.';
  }

  stageIcon(c: CaseItem): IconName {
    if (!c.paid) return 'credit-card';
    if (c.can_sign) return 'signature';
    return CASE_STATUS_ICONS[c.status] || 'inbox';
  }

  productName(c: CaseItem): string {
    return getProductDisplayName(c.product || 'divorcio360');
  }

  cityLine(c: CaseItem): string {
    const raw = (c.city || '').trim();
    if (!raw) return 'Sin ciudad';
    return raw.split(',')[0].trim();
  }

  money(cents: number): string {
    return `$${Math.round((cents || 0) / 100)}`;
  }

  goLabel(c: CaseItem): string {
    if (!c.paid) return 'Pagar';
    if (c.can_sign) return 'Firmar';
    if (c.status === '02') return 'Subir';
    return 'Abrir';
  }

  rowLink(c: CaseItem): (string | number)[] {
    if (!c.paid) return ['/checkout', c.id];
    if (c.can_sign) return ['/firma', c.id];
    if (c.status === '02') return ['/upload', c.id];
    return ['/caso', c.id];
  }

  countFor(id: Filter): number {
    return this.cases.filter((c) => this.matches(c, id) && this.matchesProduct(c, this.product)).length;
  }

  countProduct(id: string): number {
    return this.cases.filter((c) => this.matches(c, this.filter) && this.matchesProduct(c, id)).length;
  }

  statusVariant(c: CaseItem): 'warn' | 'ok' | 'info' | 'default' {
    if (!c.paid || c.status === '02' || c.status === '05') return 'warn';
    if (c.status === '10') return 'ok';
    return 'default';
  }

  private matches(c: CaseItem, id: Filter): boolean {
    switch (id) {
      case 'action': return this.needsYou(c);
      case 'open': return c.status !== '10';
      case 'done': return c.status === '10';
      default: return true;
    }
  }

  private matchesProduct(c: CaseItem, id: string): boolean {
    if (id === 'all') return true;
    return normalizeProductId(c.product) === id;
  }
}
