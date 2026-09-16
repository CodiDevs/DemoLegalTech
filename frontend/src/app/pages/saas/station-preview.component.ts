import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IconComponent } from '../../shared/icon.component';

@Component({
  selector: 'app-station-preview',
  standalone: true,
  imports: [IconComponent],
  template: `
    <div class="station-preview-window" [attr.data-station]="stationIndex">
      <header class="docket-header">
        <div class="docket-title">
          <app-icon name="scale" [size]="14" class="docket-icon" />
          <span class="docket-matter">Divorcio por mutuo consentimiento, datos de ejemplo</span>
        </div>
        <div class="docket-tag tabular">
          <span class="docket-tag-count">0{{ stationIndex + 1 }}</span>
          <span class="docket-tag-total">/05</span>
        </div>
      </header>

      <div class="preview-body">
        @switch (stationIndex) {
          @case (0) {
            <div class="station-pane">
              <div class="pane-hero">
                <app-icon name="check-circle" [size]="22" class="icon-primary" />
                <div>
                  <h3 class="pane-title">Admisión favorable</h3>
                  <p class="pane-sub">Vía notarial directa · Art. 18 Ley Notarial</p>
                </div>
              </div>

              <div class="parties-row">
                <div class="party">
                  <span class="party-role">Cónyuge A</span>
                  <span class="party-name">Carlos P. Mendoza</span>
                </div>
                <div class="party">
                  <span class="party-role">Cónyuge B</span>
                  <span class="party-name">Elena S. Morales</span>
                </div>
              </div>

              <ul class="fact-list">
                <li>Mutuo consentimiento</li>
                <li>Sin hijos menores</li>
                <li>Régimen liquidado</li>
              </ul>
            </div>
          }

          @case (1) {
            <div class="station-pane">
              <div class="pane-hero">
                <app-icon name="folder" [size]="22" class="icon-primary" />
                <div>
                  <h3 class="pane-title">Expediente consolidado</h3>
                  <p class="pane-sub">3 recaudos cotejados con Registro Civil</p>
                </div>
              </div>

              <ul class="doc-list">
                <li>
                  <app-icon name="file-text" [size]="15" class="doc-icon" />
                  <span>Partida de matrimonio</span>
                </li>
                <li>
                  <app-icon name="id-card" [size]="15" class="doc-icon" />
                  <span>Cédulas de comparecientes</span>
                </li>
                <li>
                  <app-icon name="clipboard" [size]="15" class="doc-icon" />
                  <span>Declaración de bienes</span>
                </li>
              </ul>

              <div class="meta-pair">
                <div>
                  <span class="meta-label">Abogada</span>
                  <span class="meta-value">Dra. Valentina Cordero</span>
                </div>
                <div>
                  <span class="meta-label">Honorario</span>
                  <span class="meta-value tabular">$349</span>
                </div>
              </div>
            </div>
          }

          @case (2) {
            <div class="station-pane">
              <div class="pane-hero">
                <app-icon name="file-text" [size]="22" class="icon-primary" />
                <div>
                  <h3 class="pane-title">Minuta solemne</h3>
                  <p class="pane-sub">Borrador visado · listo para firma</p>
                </div>
              </div>

              <blockquote class="minuta-excerpt">
                <span class="minuta-dest">Señor Notario Público del Cantón Quito</span>
                <p>
                  Comparecen Carlos Mendoza y Elena Morales y manifiestan su voluntad
                  de dar por terminado el matrimonio…
                </p>
              </blockquote>

              <p class="pane-foot">Visado · Dra. Valentina Cordero</p>
            </div>
          }

          @case (3) {
            <div class="station-pane">
              <div class="pane-hero">
                <app-icon name="signature" [size]="22" class="icon-primary" />
                <div>
                  <h3 class="pane-title">Firmas acreditadas</h3>
                  <p class="pane-sub">3 de 3 · Art. 14 Ley de Comercio Electrónico</p>
                </div>
              </div>

              <ul class="sig-list">
                <li>
                  <span>Carlos Mendoza</span>
                  <app-icon name="check" [size]="14" class="icon-primary" />
                </li>
                <li>
                  <span>Elena Morales</span>
                  <app-icon name="check" [size]="14" class="icon-primary" />
                </li>
                <li>
                  <span>Dra. Valentina Cordero</span>
                  <app-icon name="check" [size]="14" class="icon-primary" />
                </li>
              </ul>

              <p class="pane-foot">Sellado de tiempo TSA · BCE / Security Data</p>
            </div>
          }

          @case (4) {
            <div class="station-pane">
              <div class="pane-hero">
                <app-icon name="building" [size]="22" class="icon-primary" />
                <div>
                  <h3 class="pane-title">Expediente concluido</h3>
                  <p class="pane-sub">Protocolizado en Notaría Trigésima · Quito</p>
                </div>
              </div>

              <ul class="doc-list">
                <li>
                  <app-icon name="file-text" [size]="15" class="doc-icon" />
                  <span>Acta protocolizada</span>
                </li>
                <li>
                  <app-icon name="file" [size]="15" class="doc-icon" />
                  <span>Partida marginada</span>
                </li>
              </ul>

              <p class="pane-foot">Marginación enviada al Registro Civil</p>
            </div>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .station-preview-window {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-md);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      color: var(--text);
      width: 100%;
      min-height: 420px;
    }

    .docket-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-3);
      padding: var(--space-3) var(--space-5);
      background: var(--bg-subtle);
      border-bottom: 1px solid var(--border);
    }

    .docket-title {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-size: var(--text-xs);
      font-weight: 500;
      color: var(--text-secondary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .docket-icon {
      color: var(--primary);
      flex-shrink: 0;
    }

    .docket-tag {
      font-size: var(--text-xs);
      flex-shrink: 0;
      color: var(--text-muted);
      font-weight: 500;
    }

    .docket-tag-count {
      color: var(--primary);
      font-weight: 650;
    }

    .preview-body {
      padding: clamp(1.75rem, 3.5vw, 2.5rem) clamp(1.5rem, 3.5vw, 2.75rem);
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      background: var(--surface);
    }

    .station-pane {
      display: flex;
      flex-direction: column;
      gap: clamp(1.25rem, 2.5vw, 1.75rem);
      animation: stationEnter 420ms var(--ease-out) both;
    }

    @keyframes stationEnter {
      from {
        opacity: 0;
        transform: translateY(10px);
        filter: blur(3px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
        filter: blur(0);
      }
    }

    .pane-hero {
      display: flex;
      align-items: flex-start;
      gap: var(--space-3);
    }

    .pane-title {
      margin: 0;
      font-size: clamp(1.15rem, 2vw, 1.35rem);
      font-weight: 650;
      letter-spacing: -0.02em;
      line-height: 1.2;
      color: var(--text);
    }

    .pane-sub {
      margin: 0.25rem 0 0;
      font-size: var(--text-sm);
      color: var(--text-secondary);
      line-height: 1.45;
    }

    .icon-primary {
      color: var(--primary);
      flex-shrink: 0;
      margin-top: 2px;
    }

    .parties-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-5);
      padding: var(--space-4) 0;
      border-block: 1px solid var(--border);
    }

    @media (max-width: 520px) {
      .parties-row {
        grid-template-columns: 1fr;
        gap: var(--space-3);
      }
    }

    .party {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }

    .party-role,
    .meta-label {
      font-size: 0.6875rem;
      font-weight: 650;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--text-muted);
    }

    .party-name,
    .meta-value {
      font-size: var(--text-sm);
      font-weight: 600;
      color: var(--text);
    }

    .fact-list,
    .doc-list,
    .sig-list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 0;
    }

    .fact-list li {
      font-size: var(--text-sm);
      color: var(--text-secondary);
      padding: 0.55rem 0;
      border-bottom: 1px solid var(--border);
    }

    .fact-list li:last-child {
      border-bottom: none;
    }

    .doc-list li,
    .sig-list li {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: 0.65rem 0;
      border-bottom: 1px solid var(--border);
      font-size: var(--text-sm);
      color: var(--text);
      font-weight: 500;
    }

    .doc-list li:last-child,
    .sig-list li:last-child {
      border-bottom: none;
    }

    .sig-list li {
      justify-content: space-between;
    }

    .doc-icon {
      color: var(--primary);
      flex-shrink: 0;
    }

    .meta-pair {
      display: grid;
      grid-template-columns: 1.4fr 1fr;
      gap: var(--space-4);
      padding-top: var(--space-1);
    }

    @media (max-width: 520px) {
      .meta-pair {
        grid-template-columns: 1fr;
      }
    }

    .meta-pair > div {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }

    .minuta-excerpt {
      margin: 0;
      padding: var(--space-4) var(--space-5);
      background: var(--bg-subtle);
      border-radius: var(--radius-md);
      border-block: 1px solid var(--border);
    }

    .minuta-dest {
      display: block;
      font-size: 0.6875rem;
      font-weight: 650;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: var(--text-muted);
      margin-bottom: var(--space-2);
    }

    .minuta-excerpt p {
      margin: 0;
      font-size: var(--text-sm);
      line-height: 1.6;
      color: var(--text-secondary);
    }

    .pane-foot {
      margin: 0;
      font-size: var(--text-xs);
      font-weight: 550;
      color: var(--primary);
      letter-spacing: 0.01em;
    }

    .tabular {
      font-variant-numeric: tabular-nums;
    }
  `],
})
export class StationPreviewComponent {
  @Input() stationIndex = 0;
  @Output() selectStation = new EventEmitter<number>();
}
