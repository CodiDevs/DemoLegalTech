import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService, CaseItem } from '../../../core/api.service';
import { IconComponent } from '../../../shared/icon.component';
import { CASE_STATUS, caseLawyerHint, caseNeedsLawyer, caseShort } from '../../../shared/case-status.data';
import { getProductDisplayName } from '../../../shared/product-sites.data';
import { WorkspaceHeadComponent } from '../../lawyer-panel/workspace-head.component';
import { barMax, barPct, DESK_DEMO, DeskBar, DeskBook } from './desk-stats.data';

const STACK_CAP = 4;

interface HoldStage {
  stage_code: string;
  stage: string;
  count: number;
  avg_days: number;
}

@Component({
  selector: 'app-advanced-stats',
  standalone: true,
  imports: [RouterLink, IconComponent, WorkspaceHeadComponent],
  styleUrls: ['../fase2-shared.scss'],
  template: `
    <section class="desk" [attr.aria-busy]="loading">
      <app-workspace-head [title]="headTitle" [aside]="headAside">
        <a routerLink="/abogado/fase2/billing" class="quiet-link">Facturación B2B</a>
      </app-workspace-head>

      @if (loading) {
        <div class="panel fase2-state-loading" role="status">
          <span class="spinner" aria-hidden="true"></span>
          <span>Cargando el escritorio…</span>
        </div>
      } @else if (error) {
        <div class="panel fase2-state-error" role="alert">
          <span class="state-icon">
            <app-icon name="alert-triangle" [size]="20" />
          </span>
          <div class="state-body">
            <strong>No se pudo abrir el escritorio</strong>
            <p>El servidor no respondió. Vuelve a intentarlo.</p>
          </div>
          <button type="button" class="btn btn-secondary" (click)="load()">Volver a intentar</button>
        </div>
      } @else {
        <section class="books" aria-label="Cifras de ejemplo del escritorio">
          @for (book of books; track book.title) {
            <article class="book">
              <header class="book-head">
                <h2>{{ book.title }}</h2>
                <p>{{ book.note }}</p>
              </header>
              <dl class="book-rows">
                @for (row of book.rows; track row.label) {
                  <div class="book-row" [class.is-lead]="row.lead" [class.is-stack]="row.stack">
                    <dt>{{ row.label }}</dt>
                    <dd class="tabular">{{ row.value }}</dd>
                  </div>
                }
              </dl>
              <figure class="week">
                <div class="week-bars" [attr.aria-label]="book.barsCaption">
                  @for (b of book.bars; track b.label; let i = $index) {
                    <span class="week-col">
                      <span class="week-plot">
                        <b [style.height.%]="barHeight(book.bars, b.value)" [style.--i]="i"></b>
                      </span>
                      <span>{{ b.label }}</span>
                    </span>
                  }
                </div>
                <figcaption>{{ book.barsCaption }}</figcaption>
              </figure>
            </article>
          }
        </section>

        @if (leadCase) {
          <section class="blotter" [class.is-solo]="!peekCases.length" aria-label="Folios que te tocan">
            <a
              class="folio is-lead"
              [class.is-late]="isLate(leadCase)"
              [routerLink]="['/abogado/caso', leadCase.id]"
            >
              <span class="folio-id tabular">#{{ leadCase.id }}</span>
              <strong class="folio-verb">{{ hint(leadCase) }}</strong>
              <span class="folio-who">{{ clientName(leadCase) }} · {{ productName(leadCase) }}</span>
              <span class="folio-wait tabular">{{ waitLabel(leadCase) }}</span>
            </a>

            @if (peekCases.length) {
              <ul class="peek">
                @for (c of peekCases; track c.id; let i = $index) {
                  <li [style.--i]="i">
                    <a
                      class="folio"
                      [class.is-late]="isLate(c)"
                      [routerLink]="['/abogado/caso', c.id]"
                    >
                      <span class="folio-id tabular">#{{ c.id }}</span>
                      <strong class="folio-verb">{{ hint(c) }}</strong>
                      <span class="folio-who">{{ clientName(c) }} · {{ productName(c) }}</span>
                      <span class="folio-wait tabular">{{ waitLabel(c) }}</span>
                    </a>
                  </li>
                }
              </ul>
            }
          </section>
        } @else {
          <div class="desk-empty">
            @if (!cases.length) {
              <p>Cuando entre un expediente, aparece aquí.</p>
            } @else {
              <p>Nada abierto en el escritorio. La bandeja sigue disponible.</p>
              <a routerLink="/abogado" class="quiet-link">Abrir la bandeja</a>
            }
          </div>
        }

        @if (moreCases.length) {
          <section class="more" aria-labelledby="more-title">
            <h2 id="more-title">{{ moreTitle }}</h2>
            <ul class="more-list">
              @for (c of moreCases; track c.id) {
                <li>
                  <a
                    class="more-row"
                    [class.is-late]="isLate(c)"
                    [routerLink]="['/abogado/caso', c.id]"
                  >
                    <span class="folio-id tabular">#{{ c.id }}</span>
                    <span class="more-who">
                      <strong>{{ clientName(c) }}</strong>
                      <span>{{ productName(c) }}</span>
                    </span>
                    <span class="more-verb">{{ hint(c) }}</span>
                    <span class="folio-wait tabular">{{ waitLabel(c) }}</span>
                  </a>
                </li>
              }
            </ul>
          </section>
        }

        @if (holds.length) {
          <section class="holds-block" aria-labelledby="holds-title">
            <h2 id="holds-title">
              Detenidos
              <span class="hold-count tabular">{{ holdCaseCount }}</span>
            </h2>
            <div class="holds">
              @for (h of holds; track h.stage_code) {
                <a class="hold" routerLink="/abogado" [queryParams]="holdQuery(h)">
                  <strong>{{ h.stage }}</strong>
                  <span class="tabular">{{ h.count }} · {{ holdWait(h) }}</span>
                </a>
              }
            </div>
          </section>
        }
      }
    </section>
  `,
  styles: [`
    :host { display: block; }

    .desk {
      display: grid;
      gap: var(--space-6);
      padding-block: var(--space-2) var(--space-6);
    }

    .quiet-link {
      font-size: var(--text-sm);
      font-weight: 600;
      color: var(--primary);
      text-decoration: none;
    }
    .quiet-link:hover { text-decoration: underline; }
    .quiet-link:focus-visible {
      outline: 2px solid var(--focus-ring);
      outline-offset: 2px;
    }

    .books {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: var(--space-4);
      animation: folio-in var(--dur-cine) var(--ease-out);
    }

    .book {
      padding: var(--space-5);
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
    }

    .book-head {
      display: grid;
      gap: 0.2rem;
      margin-bottom: var(--space-4);
      padding-bottom: var(--space-3);
      border-bottom: 1px solid var(--border);
    }

    .book-head h2 {
      margin: 0;
      font-size: var(--text-base);
      font-weight: 650;
      letter-spacing: -0.02em;
    }

    .book-head p {
      margin: 0;
      font-size: var(--text-xs);
      color: var(--text-muted);
    }

    .book-rows {
      margin: 0;
      display: grid;
    }

    .book-row {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: var(--space-4);
      align-items: baseline;
      padding: 0.55rem 0;
      border-bottom: 1px solid color-mix(in srgb, var(--border) 70%, transparent);
    }

    .book-row:last-child { border-bottom: 0; }

    .book-row dt {
      margin: 0;
      font-size: var(--text-sm);
      color: var(--text-secondary);
    }

    .book-row dd {
      margin: 0;
      font-size: var(--text-sm);
      font-weight: 650;
      text-align: right;
      color: var(--text);
    }

    .book-row.is-lead dt { color: var(--text); }
    .book-row.is-lead dd {
      font-size: var(--text-lg);
      color: var(--primary);
    }

    .book-row.is-stack {
      grid-template-columns: 1fr;
      gap: 0.15rem;
    }
    .book-row.is-stack dd { text-align: left; }

    .week {
      margin: var(--space-5) 0 0;
    }

    .week-bars {
      display: grid;
      grid-template-columns: repeat(7, minmax(0, 1fr));
      gap: 0.4rem;
      align-items: end;
    }

    .week-col {
      display: grid;
      gap: 0.3rem;
      min-width: 0;
      text-align: center;
    }

    .week-plot {
      display: flex;
      align-items: flex-end;
      height: 3.75rem;
    }

    .week-plot b {
      display: block;
      width: 100%;
      min-height: 2px;
      border-radius: 2px 2px 0 0;
      background: var(--primary);
      transform-origin: bottom;
      animation: bar-in var(--dur-cine) var(--ease-out) both;
      animation-delay: calc(var(--i, 0) * 40ms);
    }

    .week-col > span {
      font-size: 0.65rem;
      font-weight: 600;
      color: var(--text-muted);
    }

    .week figcaption {
      margin: var(--space-2) 0 0;
      font-size: var(--text-xs);
      color: var(--text-muted);
    }

    @keyframes bar-in {
      from {
        opacity: 0;
        transform: scaleY(0.2);
      }
      to {
        opacity: 1;
        transform: none;
      }
    }

    .desk-empty {
      display: grid;
      gap: var(--space-3);
      padding: var(--space-5) 0;
    }
    .desk-empty p {
      margin: 0;
      max-width: 46ch;
      font-size: var(--text-sm);
      color: var(--text-secondary);
    }

    .blotter {
      display: grid;
      grid-template-columns: minmax(0, 1.45fr) minmax(14rem, 0.72fr);
      gap: var(--space-4);
      align-items: stretch;
    }
    .blotter.is-solo {
      grid-template-columns: minmax(0, 1fr);
    }

    .folio {
      display: grid;
      gap: var(--space-2);
      min-height: 0;
      padding: var(--space-4) var(--space-5);
      text-decoration: none;
      color: inherit;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-md);
      animation: folio-in var(--dur-cine) var(--ease-out);
      transition:
        background 220ms var(--ease-out),
        border-color 220ms var(--ease-out),
        transform 220ms var(--ease-out),
        filter 220ms var(--ease-out);
    }

    .folio.is-lead {
      min-height: 9.5rem;
      padding: var(--space-5) var(--space-6);
      align-content: start;
      border-color: color-mix(in srgb, var(--primary) 32%, var(--border));
      background: color-mix(in srgb, var(--primary) 5%, var(--surface));
    }

    .folio.is-late {
      background: var(--warning-subtle);
      border-color: var(--warning-border);
    }

    .folio:hover,
    .folio:focus-visible {
      border-color: color-mix(in srgb, var(--primary) 40%, var(--border));
      transform: translateY(-3px);
      filter: none;
    }

    .folio:focus-visible {
      outline: 2px solid var(--focus-ring);
      outline-offset: 2px;
    }

    .folio-id {
      font-size: var(--text-sm);
      font-weight: 650;
      color: var(--text-muted);
    }

    .folio-verb {
      font-size: var(--text-base);
      font-weight: 650;
      letter-spacing: -0.02em;
      line-height: var(--leading-snug);
      text-wrap: pretty;
    }

    .is-lead .folio-verb {
      font-size: var(--text-xl);
      max-width: 28ch;
    }

    .folio-who {
      font-size: var(--text-xs);
      color: var(--text-secondary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .folio-wait {
      font-size: var(--text-xs);
      font-weight: 600;
      color: var(--text-muted);
    }

    .peek {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    .peek li {
      min-width: 0;
    }

    .peek .folio {
      padding: var(--space-3) var(--space-4);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-sm);
      animation-delay: calc((var(--i, 0) + 1) * 70ms);
    }

    .peek .folio-verb {
      font-size: var(--text-sm);
    }

    .more h2,
    .holds-block h2 {
      margin: 0 0 var(--space-3);
      font-size: var(--text-base);
      font-weight: 650;
    }

    .holds-block h2 {
      display: flex;
      align-items: baseline;
      gap: var(--space-2);
    }

    .hold-count {
      font-size: var(--text-sm);
      font-weight: 600;
      color: var(--text-muted);
    }

    .more-list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: grid;
      gap: var(--space-2);
    }

    .more-row {
      display: grid;
      grid-template-columns: 4rem minmax(0, 1.1fr) minmax(0, 1fr) 8.5rem;
      gap: var(--space-4);
      align-items: center;
      padding: var(--space-3) var(--space-4);
      text-decoration: none;
      color: inherit;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-sm);
      animation: folio-in var(--dur-cine) var(--ease-out);
      transition:
        background 220ms var(--ease-out),
        border-color 220ms var(--ease-out);
    }

    .more-row:hover,
    .more-row:focus-visible {
      background: color-mix(in srgb, var(--primary) 7%, var(--surface));
      border-color: color-mix(in srgb, var(--primary) 28%, var(--border));
    }

    .more-row:focus-visible {
      outline: 2px solid var(--focus-ring);
      outline-offset: 2px;
    }

    .more-row.is-late {
      background: var(--warning-subtle);
    }

    .more-who {
      display: grid;
      gap: 0.1rem;
      min-width: 0;
    }
    .more-who strong {
      font-size: var(--text-sm);
      font-weight: 650;
    }
    .more-who span,
    .more-verb {
      font-size: var(--text-xs);
      color: var(--text-secondary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .more-row .folio-wait {
      text-align: right;
    }

    .holds {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
    }

    .hold {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-2);
      min-height: var(--control-height);
      padding: 0 var(--space-3);
      text-align: center;
      text-decoration: none;
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      background: var(--surface);
      box-shadow: var(--shadow-sm);
      color: inherit;
      transition:
        background 200ms var(--ease-out),
        border-color 200ms var(--ease-out),
        color 200ms var(--ease-out);
    }

    .hold:hover,
    .hold:focus-visible {
      border-color: var(--primary-border);
    }

    .hold:focus-visible {
      outline: 2px solid var(--focus-ring);
      outline-offset: 2px;
    }

    .hold strong {
      font-size: var(--text-sm);
      font-weight: 650;
    }

    .hold span {
      font-size: var(--text-xs);
      color: var(--text-secondary);
    }

    .tabular { font-variant-numeric: tabular-nums; }

    @keyframes folio-in {
      from {
        opacity: 0;
        transform: translateY(12px);
        filter: blur(5px);
      }
      to {
        opacity: 1;
        transform: none;
        filter: none;
      }
    }

    @media (max-width: 800px) {
      .books {
        grid-template-columns: 1fr;
      }

      .blotter {
        grid-template-columns: 1fr;
      }

      .folio.is-lead {
        min-height: 0;
      }

      .is-lead .folio-verb {
        font-size: var(--text-lg);
      }

      .peek {
        gap: var(--space-2);
      }

      .more-row {
        grid-template-columns: 3.25rem minmax(0, 1fr);
        grid-template-areas:
          "id who"
          "id verb"
          "id wait";
        gap: var(--space-1) var(--space-3);
      }
      .more-row .folio-id { grid-area: id; align-self: start; }
      .more-who { grid-area: who; }
      .more-verb { grid-area: verb; }
      .more-row .folio-wait { grid-area: wait; text-align: left; }
    }
  `],
})
export class AdvancedStatsComponent implements OnInit {
  loading = true;
  error = false;
  cases: CaseItem[] = [];
  readonly books: DeskBook[] = [DESK_DEMO.practice, DESK_DEMO.site];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = false;
    this.api.listCases().subscribe({
      next: (list) => {
        this.cases = Array.isArray(list) ? list : [];
        this.loading = false;
      },
      error: () => {
        this.cases = [];
        this.loading = false;
        this.error = true;
      },
    });
  }

  get deskCases(): CaseItem[] {
    return this.sortPile(this.cases.filter((c) => caseNeedsLawyer(c.status)));
  }

  /** Folios abiertos que no esperan al abogado (el cliente o la notaría tienen la pelota). */
  get waitingCases(): CaseItem[] {
    return this.sortPile(
      this.cases.filter((c) => !!CASE_STATUS[c.status] && c.status !== '10' && !caseNeedsLawyer(c.status)),
    );
  }

  get stackCases(): CaseItem[] {
    return this.deskCases.length ? this.deskCases : this.waitingCases;
  }

  get leadCase(): CaseItem | null {
    return this.stackCases[0] ?? null;
  }

  get peekCases(): CaseItem[] {
    return this.stackCases.slice(1, STACK_CAP);
  }

  get moreCases(): CaseItem[] {
    return this.stackCases.slice(STACK_CAP, STACK_CAP + 5);
  }

  get moreTitle(): string {
    return this.deskCases.length ? 'También en el escritorio' : 'En espera';
  }

  get holds(): HoldStage[] {
    const by = new Map<string, { count: number; days: number }>();
    for (const c of this.cases) {
      if (!CASE_STATUS[c.status] || c.status === '10') continue;
      const cur = by.get(c.status) || { count: 0, days: 0 };
      cur.count += 1;
      cur.days += this.daysIn(c) ?? 0;
      by.set(c.status, cur);
    }
    return [...by.entries()]
      .map(([code, v]) => ({
        stage_code: code,
        stage: caseShort(code, code),
        count: v.count,
        avg_days: v.count ? v.days / v.count : 0,
      }))
      .sort((a, b) => b.avg_days - a.avg_days || b.count - a.count);
  }

  get holdCaseCount(): number {
    return this.holds.reduce((sum, h) => sum + h.count, 0);
  }

  barHeight(bars: DeskBar[], value: number): number {
    return barPct(value, barMax(bars));
  }

  get headTitle(): string {
    if (this.loading || this.error || this.deskCases.length) return 'Hoy te toca.';
    return 'Nada te toca.';
  }

  get headAside(): string {
    if (this.loading || this.error) return '';
    if (!this.cases.length) return 'Sin expedientes';
    const mine = this.deskCases.length;
    if (mine) {
      return mine === 1 ? '1 folio te espera' : `${mine} folios te esperan`;
    }
    const waiting = this.waitingCases.length;
    if (waiting) {
      return waiting === 1 ? '1 en espera' : `${waiting} en espera`;
    }
    return 'Nada pendiente en el escritorio';
  }

  holdQuery(h: HoldStage): { estado?: string } {
    const code = (h.stage_code || '').trim();
    return code ? { estado: code } : {};
  }

  holdWait(h: HoldStage): string {
    const d = Math.round(h.avg_days);
    if (d <= 0) return 'Hoy';
    if (d === 1) return '1 día';
    return `${d} días`;
  }

  hint(c: CaseItem): string {
    return caseLawyerHint(c.status, c.status_label || 'Abrir el expediente.');
  }

  clientName(c: CaseItem): string {
    return (c.client_name || '').trim() || 'Cliente';
  }

  productName(c: CaseItem): string {
    return getProductDisplayName(c.product || 'divorcio360');
  }

  waitLabel(c: CaseItem): string {
    const days = this.daysIn(c);
    if (days === null) return 'En esta etapa';
    if (days <= 0) return 'Hoy';
    if (days === 1) return '1 día aquí';
    return `${days} días aquí`;
  }

  isLate(c: CaseItem): boolean {
    if (c.sla_warning) return true;
    const days = this.daysIn(c);
    return days !== null && days >= 5;
  }

  private sortPile(list: CaseItem[]): CaseItem[] {
    return [...list].sort((a, b) => {
      const sla = Number(!!b.sla_warning) - Number(!!a.sla_warning);
      if (sla) return sla;
      const days = (this.daysIn(b) ?? 0) - (this.daysIn(a) ?? 0);
      if (days) return days;
      return b.id - a.id;
    });
  }

  private daysIn(c: CaseItem): number | null {
    if (typeof c.days_in_status === 'number') return c.days_in_status;
    const t = Date.parse(c.updated_at || c.created_at || '');
    if (!t) return null;
    return Math.max(0, Math.floor((Date.now() - t) / 86400000));
  }
}
