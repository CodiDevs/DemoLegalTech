import { Component, Input } from '@angular/core';

/**
 * Folio masthead for /abogado workspace modules.
 * Title (Fraunces) + optional operational aside + teal tick rule.
 * Project actions into the right slot via ng-content.
 */
@Component({
  selector: 'app-workspace-head',
  standalone: true,
  template: `
    <header class="ws-head">
      <div class="ws-head-row">
        <div class="ws-head-copy">
          <h1>{{ title }}</h1>
          @if (aside) {
            <p class="ws-head-aside">{{ aside }}</p>
          }
        </div>
        <div class="ws-head-actions">
          <ng-content />
        </div>
      </div>
      <span class="ws-head-rule" aria-hidden="true"></span>
    </header>
  `,
  styles: [`
    :host {
      display: block;
    }

    .ws-head {
      margin-bottom: var(--space-5);
      animation: ws-head-in 480ms var(--ease-out);
    }

    .ws-head-row {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: var(--space-4) var(--space-6);
      flex-wrap: wrap;
    }

    .ws-head-copy {
      min-width: 0;
      flex: 1 1 12rem;
    }

    .ws-head-copy h1 {
      margin: 0;
      font-family: var(--font-display);
      font-size: clamp(1.45rem, 2vw, 1.85rem);
      font-weight: 600;
      letter-spacing: -0.03em;
      line-height: 1.15;
      color: var(--text);
    }

    .ws-head-aside {
      margin: var(--space-2) 0 0;
      max-width: 48ch;
      color: var(--text-secondary);
      font-size: var(--text-sm);
      line-height: 1.45;
    }

    .ws-head-actions {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: flex-end;
      gap: var(--space-2);
      flex: 0 1 auto;
    }

    .ws-head-actions:not(:has(*)) {
      display: none;
    }

    .ws-head-rule {
      display: block;
      position: relative;
      height: 1px;
      margin-top: var(--space-4);
      background: var(--border);
      transform-origin: left center;
      animation: ws-rule-in 560ms var(--ease-out) both;
      animation-delay: 80ms;
    }

    .ws-head-rule::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      width: 2.5rem;
      height: 100%;
      background: var(--primary);
    }

    @keyframes ws-head-in {
      from {
        opacity: 0;
        transform: translateY(8px);
      }
      to {
        opacity: 1;
        transform: none;
      }
    }

    @keyframes ws-rule-in {
      from {
        opacity: 0;
        transform: scaleX(0.35);
      }
      to {
        opacity: 1;
        transform: scaleX(1);
      }
    }

    @media (max-width: 860px) {
      .ws-head-row {
        align-items: flex-start;
        flex-direction: column;
      }

      .ws-head-actions {
        justify-content: flex-start;
        width: 100%;
      }
    }
  `],
})
export class WorkspaceHeadComponent {
  @Input({ required: true }) title!: string;
  @Input() aside = '';
}
