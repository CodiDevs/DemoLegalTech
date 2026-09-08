import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProgressStepsComponent, ProgressStep } from './progress-steps.component';
import { IconComponent } from './icon.component';

export type ProductFlowTheme = 'divorcio' | 'legalstation' | 'traslado' | 'bienraiz';

@Component({
  selector: 'app-product-flow-shell',
  standalone: true,
  imports: [RouterLink, ProgressStepsComponent, IconComponent],
  template: `
    <div class="landing-page product-flow" [class]="'theme-' + theme">
      <div class="lp-shell">
        @if (crumb.length) {
          <nav class="pf-crumb" aria-label="Dónde estás">
            @for (c of crumb; track c.label; let first = $first; let last = $last) {
              @if (!first) {
                <app-icon name="chevron-right" [size]="14" />
              }
              @if (c.link && !last) {
                <a [routerLink]="c.link">{{ c.label }}</a>
              } @else {
                <span [attr.aria-current]="last ? 'page' : null">{{ c.label }}</span>
              }
            }
          </nav>
        }
        @if (eyebrow || title) {
          <header class="pf-head">
            @if (eyebrow) { <span class="lp-eyebrow">{{ eyebrow }}</span> }
            @if (title) { <h1>{{ title }}</h1> }
            @if (subtitle) { <p class="pf-muted">{{ subtitle }}</p> }
          </header>
        }
        @if (steps.length) {
          <app-progress-steps [steps]="steps" [activeIndex]="activeStep" />
        }
        <ng-content />
      </div>
    </div>
  `,
})
export class ProductFlowShellComponent {
  @Input() theme: ProductFlowTheme = 'divorcio';
  @Input() eyebrow = '';
  @Input() title = '';
  @Input() subtitle = '';
  @Input() steps: ProgressStep[] = [];
  @Input() activeStep = 0;
  @Input() crumb: { label: string; link?: string }[] = [];
}
