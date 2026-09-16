import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { LawyerServiceQuestion } from '../../core/api.service';
import { answerTypeLabel, isBooleanQuestion, isNoAplicaQuestion, moneyUSD } from './lawyer-services.model';
import {
  FlowPort,
  GraphEdge,
  GraphNodePos,
  bezier,
  layoutQuestionGraph,
  portPoint,
} from './question-flow-layout';

export type FlowAddKind = 'question' | 'no_aplica';

export interface FlowConnectEvent {
  fromId: string;
  port: FlowPort;
  toId: string;
}

export interface FlowDisconnectEvent {
  fromId: string;
  port: FlowPort;
}

@Component({
  selector: 'app-question-flow-graph',
  standalone: true,
  template: `
    <div class="flow">
      <div class="flow-toolbar">
        <span>Rueda = acercar · Arrastra nodos · Conecta desde los círculos</span>
        <div class="flow-zoom">
          <button type="button" class="z-btn" (click)="zoomBy(-0.1)" aria-label="Alejar">−</button>
          <span class="tabular">{{ zoomLabel }}</span>
          <button type="button" class="z-btn" (click)="zoomBy(0.1)" aria-label="Acercar">+</button>
        </div>
      </div>

      <div
        #viewport
        class="flow-viewport"
        (pointerdown)="onViewportDown($event)"
        (wheel)="onWheel($event)"
      >
        <div
          class="flow-add-wrap"
          (pointerdown)="$event.stopPropagation()"
        >
          <div class="flow-add-panel">
            <span class="flow-add-plus" aria-hidden="true">+</span>
            <div class="flow-add-actions">
              <button
                type="button"
                class="flow-add-item"
                (click)="add.emit('question')"
                [disabled]="disabled"
              >
                Nueva pregunta
              </button>
              <button
                type="button"
                class="flow-add-item is-outcome"
                (click)="add.emit('no_aplica')"
                [disabled]="disabled"
              >
                No aplica
              </button>
            </div>
          </div>
        </div>

        @if (!nodes.length) {
          <div class="flow-empty-in">
            <p>Aún no hay nodos. Pulsa + para crear una pregunta o un No aplica.</p>
          </div>
        } @else {
          <div
            class="flow-world"
            [style.width.px]="width"
            [style.height.px]="height"
            [style.transform]="worldTransform"
          >
            <svg class="flow-wires" [attr.width]="width" [attr.height]="height">
              <defs>
                <marker
                  id="flow-arrow"
                  viewBox="0 0 10 10"
                  refX="9"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
                </marker>
              </defs>

              @for (e of edges; track e.id) {
                <g
                  class="wire"
                  [class.is-yes]="e.port === 'yes'"
                  [class.is-no]="e.port === 'no'"
                  (click)="onEdgeClick($event, e)"
                >
                  <path class="wire-hit" [attr.d]="e.d" />
                  <path class="wire-line" [attr.d]="e.d" marker-end="url(#flow-arrow)" />
                  <g [attr.transform]="'translate(' + e.midX + ',' + e.midY + ')'">
                    <rect x="-18" y="-10" width="36" height="18" rx="9" />
                    <text y="3" text-anchor="middle">{{ e.label }}</text>
                  </g>
                </g>
              }

              @if (draftWire; as w) {
                <path class="wire-draft" [attr.d]="w.d" />
              }
            </svg>

            @for (n of nodes; track n.id; let i = $index) {
              <article
                class="node"
                [class.is-start]="n.id === startId"
                [class.is-selected]="n.id === selectedId"
                [class.is-bool]="isBool(n.q)"
                [class.is-outcome]="isOutcome(n.q)"
                [class.is-drop]="dropTargetId === n.id"
                [style.left.px]="n.x"
                [style.top.px]="n.y"
                [style.width.px]="n.w"
                [style.height.px]="n.h"
                [style.--i]="i"
                (pointerdown)="onNodeDown($event, n)"
              >
                <div class="node-in" title="Entrada" aria-hidden="true"></div>

                <header class="node-head">
                  <span class="node-kind">{{ isOutcome(n.q) ? 'No aplica' : 'Pregunta' }}</span>
                  <span class="node-id tabular">{{ n.id }}</span>
                  @if (n.id === startId) {
                    <span class="node-badge">Inicio</span>
                  }
                </header>

                <p class="node-prompt">{{ n.q.prompt || 'Sin texto, clic para editar' }}</p>
                <p class="node-type">
                  @if (isOutcome(n.q)) {
                    Asesoría {{ moneyUSD((n.q.price_delta_cents || 0) / 100) }}
                  } @else {
                    {{ typeLabel(n.q) }}
                  }
                </p>

                @if (isOutcome(n.q)) {
                  <!-- terminal: sin puertos de salida -->
                } @else if (isBool(n.q)) {
                  <button
                    type="button"
                    class="port port-yes"
                    title="Arrastra para conectar respuesta Sí"
                    (pointerdown)="onPortDown($event, n, 'yes')"
                  >
                    <span>Sí</span>
                    <i></i>
                  </button>
                  <button
                    type="button"
                    class="port port-no"
                    title="Arrastra para conectar respuesta No"
                    (pointerdown)="onPortDown($event, n, 'no')"
                  >
                    <span>No</span>
                    <i></i>
                  </button>
                } @else {
                  <button
                    type="button"
                    class="port port-next"
                    title="Arrastra para conectar siguiente"
                    (pointerdown)="onPortDown($event, n, 'next')"
                  >
                    <span>Siguiente</span>
                    <i></i>
                  </button>
                }
              </article>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .flow {
      display: grid;
      gap: var(--space-2);
      min-width: 0;
    }

    .flow-empty-in {
      position: absolute;
      inset: 0;
      display: grid;
      place-items: center;
      padding: var(--space-6);
      color: var(--text-secondary);
      font-size: var(--text-sm);
      text-align: center;
      pointer-events: none;
    }

    .flow-empty-in p { margin: 0; max-width: 28ch; }

    .flow-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-3);
      font-size: var(--text-xs);
      color: var(--text-muted);
    }

    .flow-zoom {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-variant-numeric: tabular-nums;
      font-weight: 650;
      color: var(--text-secondary);
    }

    .z-btn {
      width: 1.6rem;
      height: 1.6rem;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border);
      background: var(--surface);
      color: var(--text);
      font: inherit;
      font-weight: 700;
      cursor: pointer;
      line-height: 1;
    }

    .z-btn:hover { border-color: var(--primary); color: var(--primary); }

    .flow-viewport {
      position: relative;
      height: min(58vh, 560px);
      overflow: hidden;
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      cursor: grab;
      background-color: var(--bg-subtle);
      background-image:
        radial-gradient(circle, color-mix(in srgb, var(--text-muted) 28%, transparent) 1px, transparent 1px);
      background-size: 18px 18px;
      box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--surface) 40%, transparent);
      animation: flow-in 520ms var(--ease-out) both;
      touch-action: none;
    }

    .flow-viewport.is-panning,
    .flow-viewport:active { cursor: grabbing; }

    .flow-add-wrap {
      position: absolute;
      top: 12px;
      right: 12px;
      z-index: 6;
    }

    .flow-add-panel {
      display: inline-flex;
      flex-direction: row-reverse;
      align-items: stretch;
      height: 40px;
      max-width: 40px;
      overflow: hidden;
      border: 1px solid color-mix(in srgb, var(--primary) 35%, var(--border));
      border-radius: 999px;
      background: var(--surface);
      color: var(--primary);
      box-shadow: 0 8px 22px color-mix(in srgb, var(--text) 10%, transparent);
      transition:
        max-width 260ms var(--ease-out),
        box-shadow 200ms var(--ease-out),
        border-color 160ms var(--ease-out);
    }

    .flow-add-wrap:hover .flow-add-panel,
    .flow-add-wrap:focus-within .flow-add-panel {
      max-width: 22rem;
      border-color: var(--primary);
      box-shadow: 0 10px 28px color-mix(in srgb, var(--primary) 18%, transparent);
    }

    .flow-add-plus {
      flex: 0 0 40px;
      width: 40px;
      display: grid;
      place-items: center;
      font-size: 1.35rem;
      font-weight: 500;
      line-height: 1;
    }

    .flow-add-actions {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0 0.55rem 0 0.15rem;
      opacity: 0;
      transform: translateX(8px);
      transition:
        opacity 200ms var(--ease-out),
        transform 240ms var(--ease-out);
    }

    .flow-add-wrap:hover .flow-add-actions,
    .flow-add-wrap:focus-within .flow-add-actions {
      opacity: 1;
      transform: none;
    }

    .flow-add-item {
      border: 0;
      border-radius: var(--radius-full);
      padding: 0.35rem 0.7rem;
      background: var(--bg-subtle);
      color: var(--text);
      font: inherit;
      font-size: var(--text-xs);
      font-weight: 650;
      white-space: nowrap;
      cursor: pointer;
    }

    .flow-add-item:hover:not(:disabled) {
      background: var(--primary-subtle);
      color: var(--primary);
    }

    .flow-add-item.is-outcome:hover:not(:disabled) {
      background: color-mix(in srgb, var(--danger-subtle, #fde8e8) 80%, var(--bg-subtle));
      color: color-mix(in srgb, var(--danger) 75%, var(--text));
    }

    .flow-add-item:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .flow-world {
      position: absolute;
      left: 0;
      top: 0;
      transform-origin: 0 0;
      will-change: transform;
    }

    .flow-wires {
      position: absolute;
      inset: 0;
      overflow: visible;
      pointer-events: none;
      color: color-mix(in srgb, var(--primary) 65%, var(--border));
    }

    .wire {
      pointer-events: stroke;
      cursor: pointer;
    }

    .wire-hit {
      fill: none;
      stroke: transparent;
      stroke-width: 14;
    }

    .wire-line {
      fill: none;
      stroke: currentColor;
      stroke-width: 2.2;
      transition: stroke 160ms var(--ease-out), opacity 160ms var(--ease-out);
    }

    .wire:hover .wire-line { stroke-width: 2.8; opacity: 1; }

    .wire.is-yes { color: var(--primary); }
    .wire.is-no { color: color-mix(in srgb, var(--danger) 55%, var(--text-muted)); }

    .wire rect {
      fill: var(--surface);
      stroke: currentColor;
      stroke-width: 1;
    }

    .wire text {
      fill: var(--text);
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.02em;
      pointer-events: none;
    }

    .wire-draft {
      fill: none;
      stroke: var(--primary);
      stroke-width: 2;
      stroke-dasharray: 6 5;
      opacity: 0.85;
      pointer-events: none;
    }

    .node {
      position: absolute;
      display: grid;
      grid-template-rows: auto 1fr auto;
      gap: 0.35rem;
      padding: 0.7rem 0.85rem 0.75rem;
      border-radius: 12px;
      border: 1.5px solid var(--border);
      background: var(--surface);
      box-shadow:
        0 1px 0 color-mix(in srgb, var(--text) 4%, transparent),
        0 10px 28px color-mix(in srgb, var(--text) 8%, transparent);
      cursor: grab;
      user-select: none;
      animation: node-in 460ms var(--ease-out) both;
      animation-delay: calc(min(var(--i, 0), 10) * 35ms);
      transition:
        border-color 160ms var(--ease-out),
        box-shadow 200ms var(--ease-out),
        transform 160ms var(--ease-out);
    }

    .node::before {
      content: '';
      position: absolute;
      left: 0;
      top: 10px;
      bottom: 10px;
      width: 4px;
      border-radius: 4px 0 0 4px;
      background: color-mix(in srgb, var(--primary) 55%, var(--border));
    }

    .node.is-bool::before { background: var(--primary); }

    .node.is-outcome {
      border-color: color-mix(in srgb, var(--danger) 28%, var(--border));
    }

    .node.is-outcome::before {
      background: color-mix(in srgb, var(--danger) 70%, var(--text-muted));
    }

    .node.is-outcome .node-kind {
      color: color-mix(in srgb, var(--danger) 75%, var(--text));
    }

    .node:hover {
      border-color: color-mix(in srgb, var(--primary) 40%, var(--border));
    }

    .node.is-selected {
      border-color: var(--primary);
      box-shadow:
        0 0 0 2px color-mix(in srgb, var(--primary) 22%, transparent),
        0 14px 32px color-mix(in srgb, var(--primary) 18%, transparent);
      z-index: 3;
    }

    .node.is-drop {
      border-color: var(--primary);
      transform: scale(1.02);
    }

    .node.is-start .node-badge { display: inline-flex; }

    .node-in {
      position: absolute;
      left: -6px;
      top: 50%;
      width: 12px;
      height: 12px;
      margin-top: -6px;
      border-radius: 50%;
      border: 2px solid var(--primary);
      background: var(--surface);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--surface) 90%, transparent);
      pointer-events: none;
    }

    .node-head {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      padding-left: 0.35rem;
      min-width: 0;
    }

    .node-kind {
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--primary);
    }

    .node-id {
      font-size: 0.65rem;
      font-weight: 650;
      color: var(--text-muted);
    }

    .node-badge {
      margin-left: auto;
      font-size: 0.6rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      padding: 0.12rem 0.4rem;
      border-radius: var(--radius-full);
      background: var(--primary-subtle);
      color: var(--primary);
    }

    .node-prompt {
      margin: 0;
      padding-left: 0.35rem;
      padding-right: 3.2rem;
      font-size: 0.82rem;
      font-weight: 600;
      line-height: 1.35;
      color: var(--text);
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .node-type {
      margin: 0;
      padding-left: 0.35rem;
      font-size: 0.68rem;
      font-weight: 650;
      color: var(--text-muted);
      letter-spacing: 0.02em;
    }

    .port {
      position: absolute;
      right: -6px;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0;
      border: 0;
      background: transparent;
      font: inherit;
      cursor: crosshair;
      color: var(--text-secondary);
      z-index: 2;
    }

    .port span {
      font-size: 0.62rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      padding: 0.15rem 0.4rem;
      border-radius: var(--radius-full);
      background: var(--bg-subtle);
      border: 1px solid var(--border);
      color: var(--text-secondary);
      pointer-events: none;
    }

    .port i {
      display: block;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      border: 2px solid var(--primary);
      background: var(--surface);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--surface) 90%, transparent);
    }

    .port-yes { top: 50px; }
    .port-no { top: 88px; }
    .port-next { top: 50%; transform: translateY(-50%); }

    .port-yes span {
      border-color: color-mix(in srgb, var(--primary) 35%, var(--border));
      color: var(--primary);
    }

    .port-no span {
      border-color: color-mix(in srgb, var(--danger) 30%, var(--border));
      color: color-mix(in srgb, var(--danger) 70%, var(--text));
    }

    .port-no i { border-color: color-mix(in srgb, var(--danger) 55%, var(--text-muted)); }

    .port:hover i {
      background: var(--primary);
      border-color: var(--primary);
    }

    .port-no:hover i {
      background: color-mix(in srgb, var(--danger) 70%, var(--text-muted));
      border-color: color-mix(in srgb, var(--danger) 70%, var(--text-muted));
    }

    .tabular { font-variant-numeric: tabular-nums; }

    @keyframes flow-in {
      from { opacity: 0; transform: translateY(10px); filter: blur(4px); }
      to { opacity: 1; transform: none; filter: none; }
    }

    @keyframes node-in {
      from { opacity: 0; transform: translateY(10px) scale(0.98); }
      to { opacity: 1; transform: none; }
    }

    @media (max-width: 720px) {
      .flow-viewport { height: 420px; }
      .flow-toolbar { flex-direction: column; align-items: flex-start; }
    }
  `],
})
export class QuestionFlowGraphComponent implements OnChanges {
  @Input() questions: LawyerServiceQuestion[] = [];
  @Input() selectedId: string | null = null;
  @Input() disabled = false;
  @Output() select = new EventEmitter<string>();
  @Output() add = new EventEmitter<FlowAddKind>();
  @Output() connect = new EventEmitter<FlowConnectEvent>();
  @Output() disconnect = new EventEmitter<FlowDisconnectEvent>();

  @ViewChild('viewport') viewport?: ElementRef<HTMLElement>;

  nodes: GraphNodePos[] = [];
  edges: GraphEdge[] = [];
  width = 720;
  height = 420;
  panX = 24;
  panY = 16;
  zoom = 1;
  readonly moneyUSD = moneyUSD;

  draftWire: { d: string } | null = null;
  dropTargetId: string | null = null;

  private positions = new Map<string, { x: number; y: number }>();
  private drag:
    | { kind: 'node'; id: string; ox: number; oy: number; startX: number; startY: number; moved: boolean }
    | { kind: 'pan'; ox: number; oy: number; sx: number; sy: number }
    | { kind: 'wire'; fromId: string; port: FlowPort }
    | null = null;

  get startId(): string | null {
    return this.questions[0]?.id || null;
  }

  get worldTransform(): string {
    return `translate(${this.panX}px, ${this.panY}px) scale(${this.zoom})`;
  }

  get zoomLabel(): string {
    return `${Math.round(this.zoom * 100)}%`;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['questions']) {
      this.prunePositions();
      this.relayout();
    }
  }

  isBool(q: LawyerServiceQuestion): boolean {
    return isBooleanQuestion(q);
  }

  isOutcome(q: LawyerServiceQuestion): boolean {
    return isNoAplicaQuestion(q);
  }

  typeLabel(q: LawyerServiceQuestion): string {
    return answerTypeLabel(q.answer_type || 'boolean');
  }

  zoomBy(delta: number, anchor?: { clientX: number; clientY: number }): void {
    const el = this.viewport?.nativeElement;
    const prev = this.zoom;
    const next = Math.min(1.6, Math.max(0.45, Math.round((prev + delta) * 20) / 20));
    if (next === prev) return;

    if (el && anchor) {
      const r = el.getBoundingClientRect();
      const mx = anchor.clientX - r.left;
      const my = anchor.clientY - r.top;
      const worldX = (mx - this.panX) / prev;
      const worldY = (my - this.panY) / prev;
      this.zoom = next;
      this.panX = mx - worldX * next;
      this.panY = my - worldY * next;
      return;
    }

    this.zoom = next;
  }

  onWheel(ev: WheelEvent): void {
    ev.preventDefault();
    const step = ev.deltaY > 0 ? -0.08 : 0.08;
    this.zoomBy(step, { clientX: ev.clientX, clientY: ev.clientY });
  }

  onViewportDown(ev: PointerEvent): void {
    const t = ev.target as HTMLElement;
    if (t.closest('.node') || t.closest('.port') || t.closest('.wire') || t.closest('.flow-add-wrap')) return;
    this.drag = {
      kind: 'pan',
      ox: ev.clientX,
      oy: ev.clientY,
      sx: this.panX,
      sy: this.panY,
    };
    (ev.currentTarget as HTMLElement).setPointerCapture(ev.pointerId);
  }

  onNodeDown(ev: PointerEvent, n: GraphNodePos): void {
    if ((ev.target as HTMLElement).closest('.port')) return;
    ev.stopPropagation();
    this.drag = {
      kind: 'node',
      id: n.id,
      ox: ev.clientX,
      oy: ev.clientY,
      startX: n.x,
      startY: n.y,
      moved: false,
    };
    (ev.currentTarget as HTMLElement).setPointerCapture(ev.pointerId);
  }

  onPortDown(ev: PointerEvent, n: GraphNodePos, port: FlowPort): void {
    ev.preventDefault();
    ev.stopPropagation();
    this.drag = { kind: 'wire', fromId: n.id, port };
    this.draftWire = null;
    (ev.currentTarget as HTMLElement).setPointerCapture(ev.pointerId);
  }

  onEdgeClick(ev: MouseEvent, e: GraphEdge): void {
    ev.stopPropagation();
    this.disconnect.emit({ fromId: e.from, port: e.port });
  }

  @HostListener('document:pointermove', ['$event'])
  onPointerMove(ev: PointerEvent): void {
    const drag = this.drag;
    if (!drag) return;

    if (drag.kind === 'pan') {
      this.panX = drag.sx + (ev.clientX - drag.ox);
      this.panY = drag.sy + (ev.clientY - drag.oy);
      return;
    }

    if (drag.kind === 'node') {
      const dx = (ev.clientX - drag.ox) / this.zoom;
      const dy = (ev.clientY - drag.oy) / this.zoom;
      if (Math.abs(dx) + Math.abs(dy) > 3) drag.moved = true;
      if (!drag.moved) return;
      this.positions.set(drag.id, {
        x: drag.startX + dx,
        y: drag.startY + dy,
      });
      this.relayout();
      return;
    }

    if (drag.kind === 'wire') {
      const fromNode = this.nodes.find((x) => x.id === drag.fromId);
      if (!fromNode) return;
      const a = portPoint(fromNode, drag.port, 'out');
      const world = this.clientToWorld(ev.clientX, ev.clientY);
      this.draftWire = bezier(a.x, a.y, world.x, world.y);
      this.dropTargetId = this.hitNode(world.x, world.y, drag.fromId);
    }
  }

  @HostListener('document:pointerup', ['$event'])
  onPointerUp(ev: PointerEvent): void {
    if (!this.drag) return;

    if (this.drag.kind === 'node') {
      const id = this.drag.id;
      const moved = this.drag.moved;
      this.drag = null;
      this.draftWire = null;
      this.dropTargetId = null;
      if (!moved) this.select.emit(id);
      return;
    }

    if (this.drag.kind === 'wire') {
      const world = this.clientToWorld(ev.clientX, ev.clientY);
      const target = this.hitNode(world.x, world.y, this.drag.fromId);
      if (target) {
        this.connect.emit({ fromId: this.drag.fromId, port: this.drag.port, toId: target });
      }
    }

    this.drag = null;
    this.draftWire = null;
    this.dropTargetId = null;
  }

  private clientToWorld(clientX: number, clientY: number): { x: number; y: number } {
    const el = this.viewport?.nativeElement;
    if (!el) return { x: 0, y: 0 };
    const r = el.getBoundingClientRect();
    return {
      x: (clientX - r.left - this.panX) / this.zoom,
      y: (clientY - r.top - this.panY) / this.zoom,
    };
  }

  private hitNode(x: number, y: number, exceptId: string): string | null {
    for (let i = this.nodes.length - 1; i >= 0; i--) {
      const n = this.nodes[i];
      if (n.id === exceptId) continue;
      if (x >= n.x - 8 && x <= n.x + n.w + 8 && y >= n.y - 8 && y <= n.y + n.h + 8) {
        return n.id;
      }
    }
    return null;
  }

  private prunePositions(): void {
    const ids = new Set(this.questions.map((q) => q.id).filter(Boolean) as string[]);
    for (const key of [...this.positions.keys()]) {
      if (!ids.has(key)) this.positions.delete(key);
    }
  }

  private relayout(): void {
    const layout = layoutQuestionGraph(this.questions, this.positions);
    this.nodes = layout.nodes;
    this.edges = layout.edges;
    this.width = layout.width;
    this.height = layout.height;
    // Seed positions so auto layout sticks after first paint
    for (const n of this.nodes) {
      if (!this.positions.has(n.id)) {
        this.positions.set(n.id, { x: n.x, y: n.y });
      }
    }
  }
}
