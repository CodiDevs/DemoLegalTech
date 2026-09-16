import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

export type ColophonDensity = 'marketing' | 'folio' | 'despacho';

@Component({
  selector: 'app-colophon',
  standalone: true,
  imports: [RouterLink],
  template: `
    @if (density === 'marketing') {
      <div class="colophon colophon--marketing">
        <div class="colophon-top">
          <a routerLink="/" class="colophon-wordmark">LegalStation</a>
          <nav class="colophon-nav" aria-label="Legal">
            <a routerLink="/legal/privacidad">Política de datos</a>
            <a routerLink="/legal/terminos">Términos de uso</a>
          </nav>
        </div>
        <p class="colophon-credit">
          <span class="colophon-hecho">Hecho por</span>
          <span class="colophon-brand">CodiDevs</span>
        </p>
        <p class="colophon-note">Casos de ejemplo. No es un trámite real.</p>
      </div>
    } @else {
      <p class="colophon" [class.colophon--folio]="density === 'folio'" [class.colophon--despacho]="density === 'despacho'">
        <span class="colophon-hecho">Hecho por</span>
        <span class="colophon-brand">CodiDevs</span>
      </p>
    }
  `,
  styles: [`
    :host { display: block; }

    .colophon {
      margin: 0;
    }

    .colophon-hecho {
      font-family: var(--font-sans);
      font-weight: 400;
    }

    .colophon-brand {
      font-family: var(--font-display);
      font-weight: 600;
      letter-spacing: -0.03em;
    }

    .colophon--marketing {
      display: grid;
      gap: var(--space-4);
      max-width: var(--container-max);
      margin-inline: auto;
      padding-inline: var(--container-pad);
    }

    .colophon-top {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      justify-content: space-between;
      gap: var(--space-3) var(--space-6);
    }

    .colophon-wordmark {
      font-family: var(--font-display);
      font-size: var(--text-lg);
      font-weight: 600;
      letter-spacing: -0.03em;
      color: var(--text);
      text-decoration: none;
    }

    .colophon-wordmark:hover {
      color: var(--primary);
    }

    .colophon-nav {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-4);
    }

    .colophon-nav a {
      font-size: var(--text-sm);
      font-weight: 500;
      color: var(--text-secondary);
      text-decoration: none;
    }

    .colophon-nav a:hover {
      color: var(--primary);
    }

    .colophon--marketing .colophon-credit {
      margin: 0;
      font-size: 0.9375rem;
      line-height: 1.35;
      color: var(--text);
    }

    .colophon--marketing .colophon-hecho {
      margin-right: 0.35em;
    }

    .colophon-note {
      margin: 0;
      max-width: 42ch;
      font-size: var(--text-xs);
      font-weight: 400;
      line-height: 1.5;
      color: var(--text-muted);
      text-transform: none;
    }

    .colophon--folio,
    .colophon--despacho {
      display: inline-flex;
      align-items: baseline;
      gap: 0.35em;
      text-decoration: none;
      color: var(--text-muted);
      transition: color 280ms var(--ease-out);
    }

    .colophon--folio {
      font-size: var(--text-xs);
    }

    .colophon--folio .colophon-brand,
    .colophon--despacho .colophon-brand {
      color: inherit;
    }

    .colophon--folio:hover,
    .colophon--despacho:hover {
      color: var(--primary);
    }

    .colophon--despacho {
      font-size: 0.7rem;
      letter-spacing: 0.01em;
    }

    @media (max-width: 560px) {
      .colophon-top {
        flex-direction: column;
      }
    }
  `],
})
export class ColophonComponent {
  @Input() density: ColophonDensity = 'folio';
}
