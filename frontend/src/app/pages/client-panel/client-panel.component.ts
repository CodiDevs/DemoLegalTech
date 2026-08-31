import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { ApiService, CaseItem } from '../../core/api.service';
import {
  getActiveProduct,
  getProductDisplayName,
  getProductQuestionnairePath,
  normalizeProductId,
} from '../../shared/product-sites.data';
import { PaymentCardComponent } from '../../shared/payment-card.component';
import { IconComponent } from '../../shared/icon.component';
import { ScheduledMeetingCardComponent } from '../../shared/scheduled-meeting-card.component';
import { MeetingSchedulerComponent } from '../../shared/meeting-scheduler.component';

interface ProductCaseGroup {
  productId: string;
  name: string;
  cases: CaseItem[];
  primary: boolean;
}

@Component({
  selector: 'app-client-panel',
  standalone: true,
  imports: [RouterLink, PaymentCardComponent, IconComponent, ScheduledMeetingCardComponent, MeetingSchedulerComponent],
  template: `
    <div class="shell wrap">
      <header class="head">
        <h1>Mis expedientes</h1>
        <p class="muted">
          @if (primaryProductName) {
            Estás en <strong>{{ primaryProductName }}</strong>. Abajo ves primero sus trámites y después los de otros productos.
          } @else {
            Todos tus trámites en LegalStation, organizados por producto.
          }
        </p>
      </header>

      @if (pendingMeetingAt) {
        <app-scheduled-meeting-card
          [scheduledAt]="pendingMeetingAt"
          subtitle="Consulta con abogado · evaluación previa"
        />
      } @else {
        <div class="panel meet-block">
          <h2>Agendar consulta con abogado</h2>
          <app-meeting-scheduler
            storageKey="ls_meeting_no_aplica"
            confirmLabel="Confirmar reunión con abogado"
            scheduledSubtitle="Consulta con abogado"
            [requireLogin]="true"
            authReturnUrl="/cliente"
            [saveFn]="noAplicaSaveFn"
            (scheduled)="onMeetingScheduled($event)"
          />
        </div>
      }

      @if (loading) {
        <div class="panel state-loading" role="status">
          <span class="spinner" aria-hidden="true"></span>
          <span>Cargando tus trámites…</span>
        </div>
      } @else if (error) {
        <div class="panel state-error" role="alert">
          <span class="state-error-icon"><app-icon name="alert-triangle" [size]="20" /></span>
          <div class="state-error-body">
            <strong>No pudimos cargar tus trámites</strong>
            <p>Puede ser un problema de conexión. Inténtalo de nuevo en un momento.</p>
          </div>
          <button type="button" class="btn btn-secondary" (click)="load()">Volver a intentar</button>
        </div>
      } @else if (!cases.length) {
        <div class="panel empty-state">
          <span class="empty-icon"><app-icon name="inbox" [size]="22" /></span>
          <h2>Todavía no tienes trámites</h2>
          <p>Evalúa tu caso en unos minutos y crea tu primer expediente.</p>
          <a [routerLink]="questionnairePath" class="btn btn-primary">Evaluar mi caso</a>
        </div>
      } @else {
        @for (group of groups; track group.productId) {
          <section class="group" [class.is-primary]="group.primary" [class.is-secondary]="!group.primary">
            <header class="group-head">
              <h2>{{ group.name }}</h2>
              @if (group.primary) {
                <span class="group-badge">Producto actual</span>
              } @else {
                <span class="group-badge muted-badge">Otro producto</span>
              }
            </header>
            <div class="list">
              @for (c of group.cases; track c.id) {
                <div class="panel item">
                  <a class="item-link" [routerLink]="['/caso', c.id]">
                    <app-payment-card
                      [title]="'Expediente #' + c.id"
                      [subtitle]="c.status_label + ' · ' + (c.city || '—')"
                      [amountCents]="c.amount_cents"
                      [paid]="c.paid"
                    />
                  </a>
                  @if (c.sign_hint) { <p class="hint">{{ c.sign_hint }}</p> }
                  @if (c.can_sign) {
                    <a class="btn btn-primary sign-cta" [routerLink]="['/firma', c.id]">
                      <app-icon name="signature" [size]="16" />
                      {{ c.has_signature ? 'Volver a firmar la minuta' : 'Firmar la minuta ahora' }}
                    </a>
                  }
                </div>
              }
            </div>
          </section>
        }
      }
    </div>
  `,
  styles: [`
    .wrap { padding-block: var(--space-6) var(--space-7); }
    .head { margin-bottom: var(--space-5); }
    app-scheduled-meeting-card {
      display: block;
      margin-bottom: var(--space-5);
    }
    .meet-block {
      margin-bottom: var(--space-5);
      display: grid;
      gap: var(--space-3);
    }
    .meet-block h2 {
      margin: 0;
      font-size: var(--text-lg);
      font-weight: 650;
    }
    .head p { margin: 0; max-width: 52ch; line-height: var(--leading-snug); }

    .group { margin-bottom: var(--space-6); }
    .group-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-3);
      margin-bottom: var(--space-3);
    }
    .group-head h2 {
      margin: 0;
      font-size: var(--text-lg);
      font-weight: 650;
    }
    .group-badge {
      font-size: var(--text-xs);
      font-weight: 600;
      padding: var(--space-1) var(--space-3);
      border-radius: var(--radius-full);
      background: var(--primary-subtle);
      color: var(--primary);
      border: 1px solid var(--primary-border);
      white-space: nowrap;
    }
    .group-badge.muted-badge {
      background: var(--bg-subtle);
      color: var(--text-secondary);
      border-color: var(--border);
    }
    .is-secondary .group-head h2 {
      font-size: var(--text-base);
      color: var(--text-secondary);
    }

    .list { display: grid; gap: var(--space-3); }
    .item { display: grid; gap: var(--space-3); }
    .item-link { text-decoration: none; color: inherit; display: block; }
    .hint {
      margin: 0;
      color: var(--primary);
      font-weight: 500;
      font-size: var(--text-sm);
    }
    .sign-cta { justify-self: start; }

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
    .state-error-icon { color: var(--danger); display: grid; place-items: center; }
    .state-error-body { flex: 1; min-width: 14rem; }
    .state-error-body strong { display: block; font-weight: 650; }
    .state-error-body p {
      margin: var(--space-1) 0 0;
      font-size: var(--text-sm);
      color: var(--text-secondary);
    }

    .empty-state {
      display: grid;
      justify-items: center;
      gap: var(--space-3);
      text-align: center;
      padding: var(--space-7) var(--space-5);
    }
    .empty-icon {
      display: grid;
      place-items: center;
      width: 48px;
      height: 48px;
      border-radius: var(--radius-md);
      background: var(--bg-subtle);
      border: 1px solid var(--border);
      color: var(--text-muted);
    }
    .empty-state h2 { font-size: var(--text-lg); margin: 0; }
    .empty-state p {
      margin: 0;
      max-width: 46ch;
      color: var(--text-secondary);
      font-size: var(--text-sm);
    }
  `],
})
export class ClientPanelComponent implements OnInit {
  cases: CaseItem[] = [];
  groups: ProductCaseGroup[] = [];
  loading = false;
  error = false;
  primaryProductId = 'divorcio360';
  primaryProductName = '';
  questionnairePath = '/cuestionario';
  pendingMeetingAt = '';

  noAplicaSaveFn = (at: string): Observable<unknown> =>
    this.api.requestMeeting(at, 'divorcio360', 'no_aplica');

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.primaryProductId = getActiveProduct();
    this.primaryProductName = getProductDisplayName(this.primaryProductId);
    this.questionnairePath = getProductQuestionnairePath(this.primaryProductId);
    this.pendingMeetingAt = sessionStorage.getItem('ls_meeting_no_aplica') || '';
    this.load();
  }

  onMeetingScheduled(at: string): void {
    this.pendingMeetingAt = at;
  }

  load(): void {
    this.loading = true;
    this.error = false;
    this.api.listCases().subscribe({
      next: (c) => {
        this.cases = c;
        this.groups = this.buildGroups(c);
        this.loading = false;
      },
      error: () => {
        this.error = true;
        this.loading = false;
      },
    });
  }

  private buildGroups(all: CaseItem[]): ProductCaseGroup[] {
    const byProduct = new Map<string, CaseItem[]>();
    for (const c of all) {
      const pid = normalizeProductId(c.product);
      if (!byProduct.has(pid)) byProduct.set(pid, []);
      byProduct.get(pid)!.push(c);
    }

    const groups: ProductCaseGroup[] = [];
    const primary = byProduct.get(this.primaryProductId);
    if (primary?.length) {
      groups.push({
        productId: this.primaryProductId,
        name: getProductDisplayName(this.primaryProductId),
        cases: primary,
        primary: true,
      });
    }

    for (const [pid, cases] of byProduct) {
      if (pid === this.primaryProductId) continue;
      groups.push({
        productId: pid,
        name: getProductDisplayName(pid),
        cases,
        primary: false,
      });
    }

    return groups;
  }
}
