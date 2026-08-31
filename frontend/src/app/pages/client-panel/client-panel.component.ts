import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService, CaseItem } from '../../core/api.service';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-client-panel',
  standalone: true,
  imports: [RouterLink, DecimalPipe],
  template: `
    <div class="shell wrap">
      <h1>Mi expediente</h1>
      <p class="muted">Consulta el estado de tu trámite en cualquier momento.</p>
      @if (!cases.length) {
        <div class="panel">
          <p>Aún no tienes casos. Completa el cuestionario para iniciar.</p>
          <a routerLink="/cuestionario" class="btn btn-primary">Ir al cuestionario</a>
        </div>
      }
      <div class="list">
        @for (c of cases; track c.id) {
          <div class="panel item">
            <a class="item-main" [routerLink]="['/caso', c.id]">
              <div>
                <strong>Caso #{{ c.id }}</strong>
                <p class="muted">{{ c.status_label }} · {{ c.city || '—' }}</p>
                @if (c.sign_hint) { <p class="hint">{{ c.sign_hint }}</p> }
              </div>
              <div class="right">
                <span>\${{ c.amount_cents / 100 | number:'1.0-0' }}</span>
                <span class="pill" [class.paid]="c.paid">{{ c.paid ? 'Pagado' : 'Pendiente pago' }}</span>
              </div>
            </a>
            @if (c.can_sign) {
              <a class="btn btn-accent sign-cta" [routerLink]="['/firma', c.id]">
                {{ c.has_signature ? 'Volver a firmar minuta' : 'Firmar minuta ahora' }}
              </a>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .wrap { padding-block: 2.5rem; }
    .list { display: grid; gap: 0.85rem; margin-top: 1.25rem; }
    .item { display: grid; gap: 0.75rem; }
    .item-main {
      display: flex; justify-content: space-between; gap: 1rem; text-decoration: none; color: inherit;
    }
    .item:hover .item-main { opacity: 0.95; }
    .right { text-align: right; display: grid; gap: 0.35rem; justify-items: end; }
    .hint { margin: 0.35rem 0 0; font-size: 0.88rem; color: var(--brand); font-weight: 500; }
    .pill {
      font-size: 0.75rem; font-weight: 600; padding: 0.2rem 0.55rem; border-radius: 999px;
      background: oklch(0.93 0.03 25); color: var(--bad);
    }
    .pill.paid { background: oklch(0.93 0.03 150); color: var(--ok); }
    .sign-cta { justify-self: start; }
  `]
})
export class ClientPanelComponent implements OnInit {
  cases: CaseItem[] = [];
  constructor(private api: ApiService) {}
  ngOnInit(): void {
    this.api.listCases().subscribe((c) => this.cases = c);
  }
}
