import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { PRODUCT_SITES } from '../product-sites.data';

export type DemoCaseMode = 'overview' | 'documents' | 'payment' | 'signature';

export const CASE_STATUS_HEADLINES: Record<number, string> = {
  1: 'Cuestionario en curso',
  2: 'Resultado para confirmar',
  3: 'Folios en revisión',
  4: 'Consulta solicitada',
  5: 'Minuta lista para firma',
  6: 'Cierre del expediente',
};

export function padEstado(n: number): string {
  return String(Math.max(0, Math.floor(n))).padStart(2, '0');
}

export function caseStatusHeadline(n: number, fallback: string): string {
  return CASE_STATUS_HEADLINES[n] ?? fallback;
}

@Component({
  selector: 'app-demo-case-window',
  standalone: true,
  template: `
    <div
      class="demo-case"
      [attr.data-mode]="mode"
      role="region"
      [attr.aria-label]="label"
    >
      <header class="demo-case-bar">
        <strong>{{ site.name }}</strong>
      </header>
      <div class="demo-case-body">
        @if (mode === 'overview') {
          @for (tick of [statusTick]; track tick) {
            <div class="demo-case-status">
              <p class="demo-case-kicker">Estado {{ paddedEstado }}</p>
              <h3>{{ headline }}</h3>
            </div>
          }
          <ul class="demo-case-steps">
            @for (step of site.workflow; track step.n; let i = $index) {
              <li [style.--i]="i">
                <button
                  type="button"
                  class="demo-case-step"
                  [class.is-on]="step.n === currentStep"
                  [class.is-done]="step.n < currentStep"
                  [attr.aria-current]="step.n === currentStep ? 'step' : null"
                  (click)="selectStep(step.n)"
                  (pointerenter)="selectStep(step.n)"
                  (focus)="selectStep(step.n)"
                >
                  <span class="demo-case-num">{{ step.n }}</span>
                  <span class="demo-case-copy">
                    <strong>{{ step.title }}</strong>
                    <small>{{ step.screen }}</small>
                  </span>
                </button>
              </li>
            }
          </ul>
        }
        @if (mode === 'documents') {
          <p class="demo-case-kicker">Mesa documental</p>
          <h3>Folios en revisión</h3>
          <ul class="demo-case-docs">
            <li>Cédula · folio de ejemplo · aprobado</li>
            <li>Partida · folio de ejemplo · aprobado</li>
            <li>Minuta · folio de ejemplo · lista para firma</li>
          </ul>
        }
        @if (mode === 'payment') {
          <p class="demo-case-kicker">Pago único</p>
          <h3>$349.00 USD</h3>
          <p>Trámite cobrado. Gastos notariales se pagan por separado.</p>
        }
        @if (mode === 'signature') {
          <p class="demo-case-kicker">Firma virtual</p>
          <h3>Documento enviado</h3>
          <p>Sello de ejemplo · IP de prueba · evidencia de fecha.</p>
        }
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      max-width: 36rem;
    }

    .demo-case {
      width: 100%;
      overflow: hidden;
      color: var(--text);
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      transform: none;
    }

    .demo-case-bar {
      display: flex;
      align-items: center;
      padding: 0.7rem 1rem;
      background: var(--surface-inverse);
      color: var(--text-inverse);
    }

    .demo-case-bar strong {
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.02em;
      opacity: 0.82;
    }

    .demo-case-body {
      padding: 1.1rem 1.15rem 1.25rem;
    }

    .demo-case-status {
      margin: 0 0 0.85rem;
      animation: demo-status-in var(--dur-base) var(--ease-out) both;
    }

    .demo-case-kicker {
      margin: 0 0 0.35rem;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--primary);
    }

    .demo-case-body h3 {
      margin: 0;
      font-family: var(--font-sans);
      font-size: 1.45rem;
      letter-spacing: -0.03em;
    }

    .demo-case-status h3 {
      margin: 0;
    }

    .demo-case-body > h3 {
      margin-bottom: 0.85rem;
    }

    .demo-case-steps,
    .demo-case-docs {
      list-style: none;
      margin: 0;
      padding: 0;
      display: grid;
      gap: 0.4rem;
    }

    .demo-case-steps li {
      animation: demo-step-in var(--dur-slow) var(--ease-out) both;
      animation-delay: calc(var(--i, 0) * 45ms);
    }

    .demo-case-step {
      appearance: none;
      display: grid;
      grid-template-columns: 1.75rem 1fr;
      gap: 0.7rem;
      align-items: center;
      width: 100%;
      margin: 0;
      padding: 0.5rem 0.65rem;
      font: inherit;
      color: inherit;
      text-align: left;
      cursor: pointer;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      transition:
        background-color var(--dur-fast) var(--ease-out),
        border-color var(--dur-fast) var(--ease-out),
        filter var(--dur-base) var(--ease-out);
    }

    .demo-case-step:hover {
      border-color: var(--primary-border);
    }

    .demo-case-step:focus-visible {
      outline: 2px solid var(--focus-ring);
      outline-offset: 2px;
    }

    .demo-case-step.is-done {
      filter: saturate(0.85);
    }

    .demo-case-step.is-on {
      border-color: var(--primary);
      background: var(--primary-subtle);
    }

    .demo-case-num {
      display: grid;
      place-items: center;
      width: 1.75rem;
      height: 1.75rem;
      border-radius: 50%;
      font-size: 0.72rem;
      font-weight: 700;
      background: var(--primary-subtle);
      color: var(--primary);
      transition:
        background-color var(--dur-fast) var(--ease-out),
        color var(--dur-fast) var(--ease-out);
    }

    .demo-case-step.is-on .demo-case-num,
    .demo-case-step.is-done .demo-case-num {
      background: var(--primary);
      color: var(--text-on-primary);
    }

    .demo-case-copy {
      display: block;
      min-width: 0;
    }

    .demo-case-copy strong {
      display: block;
      font-size: 0.92rem;
    }

    .demo-case-copy small {
      display: block;
      color: var(--text-muted);
      font-size: 0.72rem;
    }

    .demo-case-docs li {
      padding: 0.45rem 0.6rem;
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
    }

    @keyframes demo-status-in {
      from {
        opacity: 0;
        transform: translateY(8px);
        filter: blur(4px);
      }
      to {
        opacity: 1;
        transform: none;
        filter: blur(0);
      }
    }

    @keyframes demo-step-in {
      from {
        opacity: 0;
        transform: translateY(10px);
        filter: blur(4px);
      }
      to {
        opacity: 1;
        transform: none;
        filter: blur(0);
      }
    }
  `],
})
export class DemoCaseWindowComponent implements OnChanges {
  @Input() mode: DemoCaseMode = 'overview';
  @Input() activeStep = 1;
  @Input() product = 'divorcio360';
  @Output() activeStepChange = new EventEmitter<number>();

  currentStep = 1;
  statusTick = 0;

  get site() {
    return PRODUCT_SITES[this.product] ?? PRODUCT_SITES['divorcio360'];
  }

  get paddedEstado(): string {
    return padEstado(this.currentStep);
  }

  get headline(): string {
    const step = this.site.workflow.find((item) => item.n === this.currentStep);
    return caseStatusHeadline(this.currentStep, step?.title ?? this.site.name);
  }

  get label(): string {
    return `Expediente ${this.site.name}`;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['activeStep']) return;
    const next = this.activeStep;
    if (next < 1) return;
    const first = changes['activeStep'].firstChange;
    if (!first && next === this.currentStep) return;
    this.currentStep = next;
    if (!first) this.statusTick += 1;
  }

  selectStep(n: number): void {
    if (n === this.currentStep) return;
    this.currentStep = n;
    this.statusTick += 1;
    this.activeStepChange.emit(n);
  }
}
