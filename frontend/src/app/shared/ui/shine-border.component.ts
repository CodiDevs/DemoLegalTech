import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-shine-border',
  standalone: true,
  template: `
    <div
      class="shine"
      [class.shine--static]="staticBorder"
      [style.--shine-pad.px]="borderWidth"
    >
      <div class="shine-ring" aria-hidden="true"></div>
      <div class="shine-inner">
        <ng-content />
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }

    .shine {
      position: relative;
      height: 100%;
      border-radius: var(--radius-lg);
      padding: var(--shine-pad, 2px);
      overflow: hidden;
      isolation: isolate;
    }

    .shine-ring {
      position: absolute;
      inset: -40%;
      z-index: 0;
      background: conic-gradient(
        from 0deg,
        transparent 0%,
        transparent 38%,
        color-mix(in srgb, var(--primary-border) 70%, transparent) 46%,
        var(--primary) 50%,
        color-mix(in srgb, var(--primary-border) 85%, #fff) 54%,
        transparent 62%,
        transparent 100%
      );
      animation: ls-shine-spin 10s linear infinite;
    }

    .shine-inner {
      position: relative;
      z-index: 1;
      height: 100%;
      border-radius: calc(var(--radius-lg) - 1px);
      background: var(--surface);
      overflow: hidden;
    }

    .shine--static {
      padding: 0;
      border: 2px solid var(--primary-border);
      background: var(--surface);
    }

    .shine--static .shine-ring {
      display: none;
      animation: none;
    }

    .shine--static .shine-inner {
      border-radius: var(--radius-lg);
      background: transparent;
    }

    @keyframes ls-shine-spin {
      to { transform: rotate(360deg); }
    }
  `],
})
export class ShineBorderComponent {
  @Input() borderWidth = 2;
  /** Force static border (tests / explicit). */
  @Input() staticBorder = false;
}
