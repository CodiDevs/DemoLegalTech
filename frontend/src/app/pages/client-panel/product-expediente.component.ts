import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService, CaseItem } from '../../core/api.service';
import {
  getProductDisplayName,
  getProductQuestionnairePath,
  getProductSite,
  normalizeProductId,
  setActiveProduct,
} from '../../shared/product-sites.data';
import { PaymentCardComponent } from '../../shared/payment-card.component';
import { IconComponent } from '../../shared/icon.component';

@Component({
  selector: 'app-product-expediente',
  standalone: true,
  imports: [RouterLink, PaymentCardComponent, IconComponent],
  template: `
    <div class="shell wrap">
      <nav class="crumb" aria-label="Dónde estás">
        <a routerLink="/">LegalStation</a>
        <app-icon name="chevron-right" [size]="14" />
        <a [routerLink]="productHome">{{ productName }}</a>
        <app-icon name="chevron-right" [size]="14" />
        <span aria-current="page">Mi expediente</span>
      </nav>

      <header class="head">
        <h1>Mi expediente de {{ productName }}</h1>
        <p class="muted">Solo trámites de {{ productName }}. Para ver todos tus productos, ve a Mis expedientes.</p>
      </header>

      @if (loading) {
        <div class="panel state-loading" role="status">
          <span class="spinner" aria-hidden="true"></span>
          <span>Cargando tu expediente…</span>
        </div>
      } @else if (error) {
        <div class="panel state-error" role="alert">
          <app-icon name="alert-triangle" [size]="20" />
          <div>
            <strong>No pudimos cargar tu expediente</strong>
            <p>Inténtalo de nuevo en un momento.</p>
          </div>
          <button type="button" class="btn btn-secondary" (click)="load()">Reintentar</button>
        </div>
      } @else if (!cases.length) {
        <div class="panel empty-state">
          <app-icon name="inbox" [size]="22" />
          <h2>Aún no tienes trámites de {{ productName }}</h2>
          <p>Evalúa tu caso en unos minutos y crea tu primer expediente.</p>
          <a [routerLink]="questionnairePath" class="btn btn-primary">Evaluar mi caso</a>
          <a routerLink="/cliente" class="btn btn-ghost">Ver todos mis expedientes</a>
        </div>
      } @else {
        <div class="list">
          @for (c of cases; track c.id) {
            <div class="panel item">
              <a class="item-link" [routerLink]="['/caso', c.id]">
                <app-payment-card
                  [title]="'Expediente #' + c.id"
                  [subtitle]="c.status_label + ' · ' + (c.city || '—')"
                  [amountCents]="c.amount_cents"
                  [paid]="c.paid"
                />
              </a>
              @if (c.sign_hint) {
                <p class="hint">{{ c.sign_hint }}</p>
              }
              @if (c.can_sign) {
                <a class="btn btn-primary sign-cta" [routerLink]="['/firma', c.id]">
                  <app-icon name="signature" [size]="16" />
                  {{ c.has_signature ? 'Volver a firmar' : 'Firmar documento' }}
                </a>
              }
            </div>
          }
        </div>
        <p class="foot-link">
          <a routerLink="/cliente">Ver expedientes de todos los productos</a>
        </p>
      }
    </div>
  `,
  styles: [`
    .wrap { padding-block: var(--space-6) var(--space-7); }
    .crumb {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      flex-wrap: wrap;
      margin-bottom: var(--space-4);
      font-size: var(--text-sm);
      color: var(--text-muted);
    }
    .crumb a { color: var(--text-secondary); text-decoration: none; }
    .crumb a:hover { color: var(--primary); }
    .head { margin-bottom: var(--space-5); }
    .head p { margin: var(--space-1) 0 0; }
    .list { display: grid; gap: var(--space-3); }
    .item { display: grid; gap: var(--space-3); }
    .item-link { text-decoration: none; color: inherit; display: block; }
    .item-link:hover .payment-card-title { color: var(--primary); }
    .hint { margin: 0; font-size: var(--text-sm); color: var(--primary); font-weight: 500; }
    .sign-cta { justify-self: start; }
    .foot-link { margin-top: var(--space-5); font-size: var(--text-sm); }
    .foot-link a { color: var(--text-secondary); }
    .state-loading {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      color: var(--text-secondary);
      font-size: var(--text-sm);
    }
    .state-error {
      display: flex;
      align-items: flex-start;
      gap: var(--space-3);
      flex-wrap: wrap;
      border-color: var(--danger-border);
      background: var(--danger-subtle);
    }
    .state-error p { margin: var(--space-1) 0 0; font-size: var(--text-sm); color: var(--text-secondary); }
    .empty-state {
      display: grid;
      justify-items: center;
      gap: var(--space-3);
      text-align: center;
      padding: var(--space-7) var(--space-5);
    }
    .empty-state h2 { font-size: var(--text-lg); margin: 0; }
    .empty-state p { margin: 0; max-width: 40ch; color: var(--text-secondary); font-size: var(--text-sm); }
  `],
})
export class ProductExpedienteComponent implements OnInit {
  productId = 'divorcio360';
  productName = 'Divorcio360';
  productHome = '/productos/divorcio360';
  questionnairePath = '/cuestionario';
  cases: CaseItem[] = [];
  loading = false;
  error = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
  ) {}

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug') || '';
    const site = getProductSite(slug);
    if (!site) {
      void this.router.navigate(['/']);
      return;
    }
    this.productId = site.id;
    this.productName = site.name;
    this.productHome = `/productos/${site.slug}`;
    this.questionnairePath = getProductQuestionnairePath(site.slug);
    setActiveProduct(site.id);
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = false;
    this.api.listCases().subscribe({
      next: (all) => {
        this.cases = all.filter((c) => normalizeProductId(c.product) === this.productId);
        this.loading = false;
      },
      error: () => {
        this.error = true;
        this.loading = false;
      },
    });
  }
}
