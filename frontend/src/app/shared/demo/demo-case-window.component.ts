import { Component, Input } from '@angular/core';
import { PRODUCT_SITES } from '../product-sites.data';

export type DemoCaseMode = 'overview' | 'documents' | 'payment' | 'signature';

@Component({
  selector: 'app-demo-case-window',
  standalone: true,
  template: `
    <div class="demo-case" [attr.data-mode]="mode" role="img" [attr.aria-label]="label">
      <header class="demo-case-bar">
        <span></span><span></span><span></span>
        <strong>{{ site.name }} · expediente de ejemplo</strong>
      </header>
      <div class="demo-case-body">
        @if (mode === 'overview') {
          <p class="demo-case-kicker">Estado 04 · minuta lista</p>
          <h3>Expediente LS-014</h3>
          <ul class="demo-case-steps">
            @for (step of site.workflow; track step.n) {
              <li [class.is-on]="step.n === activeStep">
                <span>{{ step.n }}</span>
                <div>
                  <strong>{{ step.title }}</strong>
                  <small>{{ step.screen }}</small>
                </div>
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
})
export class DemoCaseWindowComponent {
  @Input() mode: DemoCaseMode = 'overview';
  @Input() activeStep = 1;
  @Input() product = 'divorcio360';

  get site() {
    return PRODUCT_SITES[this.product] ?? PRODUCT_SITES['divorcio360'];
  }

  get label(): string {
    return `Ventana de expediente de ejemplo, modo ${this.mode}`;
  }
}
