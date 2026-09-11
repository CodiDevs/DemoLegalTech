import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { IconComponent } from './icon.component';
import {
  CaseProgressLayout,
  CaseProgressStage,
  CaseProgressVariant,
} from './case-progress.model';

@Component({
  selector: 'app-case-progress',
  standalone: true,
  imports: [IconComponent, DatePipe],
  template: `
    <div
      class="cp"
      [class.cp--marketing]="variant === 'marketing'"
      [class.cp--case]="variant === 'case'"
      [class.cp--horizontal]="resolvedLayout === 'horizontal'"
      [class.cp--vertical]="resolvedLayout === 'vertical'"
      [class.cp--loading]="loading"
      [class.cp--interactive]="interactive"
      [class.cp--ready]="ready"
      [attr.data-layout]="resolvedLayout"
    >
      @if (loading) {
        <div class="cp-state" role="status" aria-live="polite">
          <span class="cp-skeleton" aria-hidden="true"></span>
          <p>Cargando recorrido del trámite…</p>
        </div>
      } @else if (errorMessage) {
        <div class="cp-state cp-state--error" role="alert">
          <app-icon name="alert-circle" [size]="20" />
          <p>{{ errorMessage }}</p>
        </div>
      } @else if (!stages.length) {
        <div class="cp-state" role="status">
          <app-icon name="inbox" [size]="20" />
          <p>{{ emptyMessage }}</p>
        </div>
      } @else {
        <div
          class="cp-frame"
          [style.--cp-count]="stages.length"
          [style.--cp-progress]="progressRatio"
        >
          <div class="cp-rail" aria-hidden="true">
            <span class="cp-rail-track"></span>
            <span class="cp-rail-fill"></span>
          </div>

          <ol class="cp-track" [attr.aria-label]="ariaLabel">
            @for (stage of stages; track stage.id; let i = $index) {
              <li
                class="cp-stage"
                [class.is-done]="stage.status === 'done'"
                [class.is-current]="stage.status === 'current'"
                [class.is-upcoming]="stage.status === 'upcoming'"
                [class.is-focused]="focusedIndex === i"
                [style.--i]="i"
              >
                <button
                  type="button"
                  class="cp-hit"
                  [attr.tabindex]="interactive ? 0 : -1"
                  [attr.aria-current]="stage.status === 'current' || focusedIndex === i ? 'step' : null"
                  [attr.aria-pressed]="interactive ? focusedIndex === i : null"
                  (click)="selectStage(i)"
                >
                  <span class="cp-node" aria-hidden="true">
                    @if (stage.status === 'done') {
                      <app-icon name="check" [size]="nodeIconSize" [strokeWidth]="2.4" />
                    } @else {
                      <app-icon [name]="stage.icon" [size]="nodeIconSize" [strokeWidth]="1.7" />
                    }
                  </span>

                  <span class="cp-copy">
                    @if (variant === 'case' || resolvedLayout === 'vertical') {
                      @if (variant === 'case') {
                        <span class="cp-meta">{{ stage.meta || stage.id }}</span>
                      }
                      <span class="cp-label">{{ stage.label }}</span>
                      @if (stage.description && showInlineDesc(i)) {
                        <span class="cp-desc">{{ stage.description }}</span>
                      }
                      @if (stage.date) {
                        <time class="cp-date" [attr.datetime]="stage.date">
                          {{ stage.date | date:'shortDate' }}
                        </time>
                      }
                    } @else {
                      <span class="cp-label">{{ stage.label }}</span>
                    }
                  </span>
                </button>
              </li>
            }
          </ol>

          @if (resolvedLayout === 'horizontal' && focusedStage; as detail) {
            <div class="cp-detail" aria-live="polite">
              <div class="cp-detail-head">
                <span class="cp-detail-status" [attr.data-status]="detail.status">
                  {{ statusLabel(detail.status) }}
                </span>
                <h3 class="cp-detail-title">{{ detail.label }}</h3>
              </div>
              @if (detail.description) {
                <p class="cp-detail-desc">{{ detail.description }}</p>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }

    .cp {
      --cp-node: 2.5rem;
      --cp-gap: 0.75rem;
      --cp-accent: var(--primary, #2f6f68);
      --cp-accent-soft: var(--primary-subtle, #e7f1f0);
      --cp-line: var(--border, #e5e3de);
      --cp-ink: var(--text, #2b2824);
      --cp-muted: var(--text-secondary, #5c5750);
      --cp-soft: var(--text-muted, #7d786f);
      --cp-surface: var(--surface, #fff);
      --cp-ease: cubic-bezier(0.16, 1, 0.3, 1);
      position: relative;
    }

    .cp--marketing { --cp-node: 2.75rem; }
    .cp--case { --cp-node: 2.25rem; --cp-gap: 0.35rem; }

    .cp-state {
      display: grid;
      justify-items: start;
      gap: 0.65rem;
      padding: 1rem 0;
      color: var(--cp-muted);
      font-size: var(--text-sm, 0.875rem);
    }

    .cp-state--error { color: var(--danger, #b4352c); }
    .cp-state p { margin: 0; }

    .cp-skeleton {
      display: block;
      width: 100%;
      height: 4.5rem;
      border-radius: 12px;
      background: linear-gradient(
        90deg,
        var(--bg-muted, #f1f0ed) 0%,
        var(--surface, #fff) 45%,
        var(--bg-muted, #f1f0ed) 100%
      );
      background-size: 200% 100%;
      animation: cp-shimmer 1.2s linear infinite;
    }

    .cp-frame { position: relative; }

    .cp-track {
      list-style: none;
      margin: 0;
      padding: 0;
      position: relative;
      z-index: 1;
      display: grid;
      gap: var(--cp-gap);
    }

    .cp-rail {
      position: absolute;
      pointer-events: none;
      z-index: 0;
    }

    .cp-rail-track,
    .cp-rail-fill {
      display: block;
      border-radius: 999px;
    }

    .cp-rail-track {
      background: var(--cp-line);
      width: 100%;
      height: 100%;
    }

    .cp-rail-fill {
      position: absolute;
      inset: 0 auto auto 0;
      background: var(--cp-accent);
      transform-origin: left center;
      width: 0;
      height: 100%;
    }

    .cp--ready .cp-rail-fill {
      width: calc(var(--cp-progress) * 100%);
      transition: width 620ms var(--cp-ease) 180ms;
    }

    .cp-stage {
      position: relative;
      z-index: 1;
      margin: 0;
      min-width: 0;
      opacity: 0.42;
      transition: opacity 280ms var(--cp-ease);
    }

    .cp-stage.is-done,
    .cp-stage.is-current,
    .cp-stage.is-focused {
      opacity: 1;
    }

    .cp-stage.is-upcoming:not(.is-focused) .cp-label {
      color: var(--cp-soft);
      font-weight: 550;
    }

    .cp-hit {
      display: grid;
      gap: 0.55rem;
      width: 100%;
      margin: 0;
      padding: 0;
      border: 0;
      background: transparent;
      color: inherit;
      font: inherit;
      text-align: left;
      cursor: default;
      min-width: 0;
    }

    .cp--interactive .cp-hit { cursor: pointer; border-radius: 12px; }

    .cp--interactive .cp-hit:hover .cp-node {
      transform: translateY(-2px);
      box-shadow: 0 8px 18px color-mix(in oklab, var(--cp-accent) 16%, transparent);
    }

    .cp--interactive .cp-hit:focus-visible {
      outline: 2px solid var(--focus-ring, var(--cp-accent));
      outline-offset: 3px;
    }

    .cp-node {
      width: var(--cp-node);
      height: var(--cp-node);
      border-radius: 999px;
      display: grid;
      place-items: center;
      flex-shrink: 0;
      background: var(--bg-muted, #f1f0ed);
      color: var(--cp-muted);
      border: 1.5px solid var(--cp-line);
      transition:
        background 280ms var(--cp-ease),
        color 280ms var(--cp-ease),
        border-color 280ms var(--cp-ease),
        transform 280ms var(--cp-ease),
        box-shadow 280ms var(--cp-ease);
    }

    .is-done .cp-node {
      background: var(--success, #2f7d51);
      border-color: transparent;
      color: #fff;
    }

    .is-current .cp-node,
    .is-focused .cp-node {
      background: var(--cp-accent);
      border-color: transparent;
      color: #fff;
      box-shadow:
        0 0 0 4px var(--cp-accent-soft),
        0 10px 22px color-mix(in oklab, var(--cp-accent) 20%, transparent);
    }

    .cp-copy {
      display: grid;
      gap: 0.2rem;
      width: 100%;
      max-width: 100%;
      min-width: 0;
    }

    .cp-meta {
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--cp-soft);
    }

    .is-current .cp-meta,
    .is-focused .cp-meta {
      color: var(--cp-accent);
    }

    .cp-label {
      font-size: var(--text-sm, 0.875rem);
      font-weight: 650;
      color: var(--cp-ink);
      line-height: 1.3;
      max-width: 100%;
      overflow-wrap: anywhere;
      hyphens: auto;
    }

    .cp--marketing .cp-label {
      font-size: 0.92rem;
      font-family: var(--font-display, var(--font-sans));
      letter-spacing: -0.02em;
    }

    .cp-desc {
      font-size: var(--text-sm, 0.875rem);
      color: var(--cp-muted);
      line-height: 1.5;
      max-width: 100%;
    }

    .cp-date {
      font-size: 0.72rem;
      color: var(--cp-soft);
    }

    /* Detail panel under horizontal rail */
    .cp-detail {
      margin-top: 1.35rem;
      padding: 1.15rem 1.25rem;
      border-radius: var(--radius-lg, 14px);
      border: 1px solid var(--cp-line);
      background: var(--cp-surface);
      box-shadow: var(--shadow-sm, 0 1px 2px rgb(27 25 23 / 0.04));
      opacity: 0;
      transform: translateY(6px);
    }

    .cp--ready .cp-detail {
      opacity: 1;
      transform: none;
      transition:
        opacity 320ms var(--cp-ease) 420ms,
        transform 320ms var(--cp-ease) 420ms;
    }

    .cp-detail-head {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      gap: 0.5rem 0.75rem;
      margin-bottom: 0.35rem;
    }

    .cp-detail-status {
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--cp-soft);
    }

    .cp-detail-status[data-status='done'] { color: var(--success, #2f7d51); }
    .cp-detail-status[data-status='current'] { color: var(--cp-accent); }

    .cp-detail-title {
      margin: 0;
      font-family: var(--font-display, var(--font-sans));
      font-size: 1.15rem;
      font-weight: 600;
      letter-spacing: -0.02em;
      color: var(--cp-ink);
    }

    .cp-detail-desc {
      margin: 0;
      font-size: 0.95rem;
      line-height: 1.55;
      color: var(--cp-muted);
      max-width: 52ch;
    }

    /* Horizontal */
    .cp--horizontal .cp-track {
      grid-template-columns: repeat(var(--cp-count), minmax(0, 1fr));
      align-items: start;
      gap: 0.35rem;
    }

    .cp--horizontal .cp-rail {
      top: calc(var(--cp-node) / 2);
      left: calc(100% / var(--cp-count) / 2);
      right: calc(100% / var(--cp-count) / 2);
      height: 3px;
      transform: translateY(-50%);
    }

    .cp--horizontal .cp-hit {
      grid-template-columns: 1fr;
      justify-items: center;
      text-align: center;
      padding: 0.1rem 0.25rem 0.2rem;
    }

    .cp--horizontal .cp-copy {
      justify-items: center;
      text-align: center;
    }

    .cp--horizontal .cp-label {
      font-size: 0.82rem;
      line-height: 1.25;
    }

    /* Vertical */
    .cp--vertical .cp-track {
      grid-template-columns: 1fr;
      padding-left: 0.1rem;
    }

    .cp--vertical .cp-rail {
      top: calc(var(--cp-node) / 2);
      bottom: calc(var(--cp-node) / 2);
      left: calc(var(--cp-node) / 2);
      width: 3px;
      transform: translateX(-50%);
    }

    .cp--vertical .cp-rail-fill {
      width: 100%;
      height: 0;
    }

    .cp--ready.cp--vertical .cp-rail-fill {
      height: calc(var(--cp-progress) * 100%);
      width: 100%;
      transition: height 620ms var(--cp-ease) 180ms;
    }

    .cp--vertical .cp-hit {
      grid-template-columns: var(--cp-node) minmax(0, 1fr);
      align-items: start;
      gap: 0.85rem;
      padding: 0.35rem 0.15rem;
    }

    .cp--vertical .cp-desc { max-width: 42ch; }

    .cp--case.cp--vertical .cp-stage.is-upcoming:not(.is-focused) {
      opacity: 0.38;
    }

    @keyframes cp-shimmer {
      from { background-position: 100% 0; }
      to { background-position: -100% 0; }
    }
  `],
})
export class CaseProgressComponent implements OnInit, OnChanges, OnDestroy {
  @Input({ required: true }) stages: CaseProgressStage[] = [];
  @Input() loading = false;
  @Input() emptyMessage = 'Aún no hay estados en este expediente.';
  @Input() errorMessage = '';
  @Input() layout: CaseProgressLayout = 'auto';
  @Input() variant: CaseProgressVariant = 'case';
  @Input() ariaLabel = 'Progreso del trámite';
  @Input() interactive = false;
  @Input() focusIndex: number | null = null;

  @Output() stageSelect = new EventEmitter<{ index: number; stage: CaseProgressStage }>();

  resolvedLayout: 'horizontal' | 'vertical' = 'horizontal';
  focusedIndex = 0;
  ready = false;
  private mql?: MediaQueryList;
  private onMql?: (e: MediaQueryListEvent) => void;
  private readyTimer?: ReturnType<typeof setTimeout>;

  constructor(private host: ElementRef<HTMLElement>) {}

  ngOnInit(): void {
    this.syncFocus();
    this.resolveLayout();
    this.armReady();
    if (typeof matchMedia !== 'undefined') {
      this.mql = matchMedia('(max-width: 960px)');
      this.onMql = () => this.resolveLayout();
      this.mql.addEventListener('change', this.onMql);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['stages'] || changes['focusIndex'] || changes['layout'] || changes['variant']) {
      this.syncFocus();
      this.resolveLayout();
      this.armReady();
    }
  }

  ngOnDestroy(): void {
    if (this.mql && this.onMql) {
      this.mql.removeEventListener('change', this.onMql);
    }
    if (this.readyTimer) clearTimeout(this.readyTimer);
  }

  @HostListener('window:resize')
  onResize(): void {
    this.resolveLayout();
  }

  get focusedStage(): CaseProgressStage | null {
    return this.stages?.[this.focusedIndex] || null;
  }

  get progressRatio(): number {
    const list = this.stages || [];
    if (list.length <= 1) return list.length ? 1 : 0;

    let idx = list.findIndex((s) => s.status === 'current');
    if (idx < 0) {
      const done = list.filter((s) => s.status === 'done').length;
      idx = Math.max(done - 1, 0);
    }
    if (this.interactive && this.focusedIndex >= 0) {
      idx = Math.max(idx, this.focusedIndex);
    }
    return Math.min(1, Math.max(0, idx / (list.length - 1)));
  }

  get nodeIconSize(): number {
    return this.variant === 'marketing' ? 18 : 15;
  }

  showInlineDesc(index: number): boolean {
    if (this.resolvedLayout === 'horizontal') return false;
    const stage = this.stages[index];
    if (!stage?.description) return false;
    return this.focusedIndex === index || stage.status === 'current';
  }

  statusLabel(status: CaseProgressStage['status']): string {
    if (status === 'done') return 'Completado';
    if (status === 'current') return 'En curso';
    return 'Pendiente';
  }

  selectStage(index: number): void {
    if (!this.interactive || !this.stages?.[index]) return;
    this.focusedIndex = index;
    this.stageSelect.emit({ index, stage: this.stages[index] });
  }

  private syncFocus(): void {
    if (this.focusIndex != null && this.focusIndex >= 0) {
      this.focusedIndex = this.focusIndex;
      return;
    }
    const current = (this.stages || []).findIndex((s) => s.status === 'current');
    this.focusedIndex = current >= 0 ? current : 0;
  }

  private resolveLayout(): void {
    if (this.layout === 'horizontal' || this.layout === 'vertical') {
      this.resolvedLayout = this.layout;
      return;
    }
    if (this.variant === 'case') {
      this.resolvedLayout = 'vertical';
      return;
    }
    const narrow =
      typeof matchMedia !== 'undefined'
        ? matchMedia('(max-width: 960px)').matches
        : this.host.nativeElement.getBoundingClientRect().width < 960;
    this.resolvedLayout = narrow ? 'vertical' : 'horizontal';
  }

  private armReady(): void {
    this.ready = false;
    if (this.readyTimer) clearTimeout(this.readyTimer);
    this.readyTimer = setTimeout(() => {
      this.ready = true;
    }, 40);
  }
}
