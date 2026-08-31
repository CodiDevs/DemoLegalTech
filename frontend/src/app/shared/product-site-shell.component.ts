import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CANONICAL_SLOGAN, ProductSiteConfig } from './product-sites.data';

/** Breadcrumb + slogan band for product pages (use inside `.landing-page`). */
@Component({
  selector: 'app-product-site-shell',
  standalone: true,
  imports: [RouterLink],
  template: `
    <p class="lp-shell lp-crumb">
      <a routerLink="/">LegalStation</a> ›
      <a [routerLink]="['/productos', site.slug]">{{ site.name }}</a>
      @if (sectionLabel) { › {{ sectionLabel }} }
    </p>
    <div class="lp-slogan-band">
      <p class="lp-shell">{{ slogan }}</p>
    </div>
    <ng-content />
  `,
  styles: [`:host { display: block; }`],
})
export class ProductSiteShellComponent {
  @Input({ required: true }) site!: ProductSiteConfig;
  @Input() sectionLabel = '';
  @Input() slogan = CANONICAL_SLOGAN;
}
