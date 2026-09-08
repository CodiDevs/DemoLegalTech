import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CANONICAL_SLOGAN, ProductSiteConfig } from './product-sites.data';
import { IconComponent } from './icon.component';

/** Breadcrumb + slogan band for product pages (use inside `.landing-page`). */
@Component({
  selector: 'app-product-site-shell',
  standalone: true,
  imports: [RouterLink, IconComponent],
  template: `
    <nav class="lp-shell lp-crumb crumb-row" aria-label="Dónde estás">
      <a routerLink="/">LegalStation</a>
      <app-icon name="chevron-right" [size]="14" />
      <a [routerLink]="['/productos', site.slug]">{{ site.name }}</a>
      @if (sectionLabel) {
        <app-icon name="chevron-right" [size]="14" />
        <span aria-current="page">{{ sectionLabel }}</span>
      }
    </nav>
    <div class="lp-slogan-band">
      <p class="lp-shell">{{ slogan }}</p>
    </div>
    <ng-content />
  `,
  styles: [`
    :host { display: block; }

    .crumb-row {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      flex-wrap: wrap;
    }
  `],
})
export class ProductSiteShellComponent {
  @Input({ required: true }) site!: ProductSiteConfig;
  @Input() sectionLabel = '';
  @Input() slogan = CANONICAL_SLOGAN;
}
