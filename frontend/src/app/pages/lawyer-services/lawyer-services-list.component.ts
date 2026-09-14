import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService, LawyerServiceOffering } from '../../core/api.service';
import { ConfirmService } from '../../core/confirm.service';
import { IconComponent } from '../../shared/icon.component';
import { StatusBadgeComponent } from '../../shared/status-badge.component';
import { apiErrorMessage, categoryLabel, moneyUSD } from './lawyer-services.model';

type Lane = 'all' | 'publicado' | 'borrador';

@Component({
  selector: 'app-lawyer-services-list',
  standalone: true,
  imports: [RouterLink, IconComponent, StatusBadgeComponent],
  template: `
    <div class="svc">
      <header class="svc-head">
        <div>
          <p class="kicker">Bufete</p>
          <h1>Servicios</h1>
          <p class="lede">Arma ofertas nuevas con nombre, precio y documentos. El cliente las verá cuando las publiques.</p>
        </div>
        <a routerLink="/abogado/servicios/nuevo" class="btn btn-primary">Nuevo servicio</a>
      </header>

      <div class="lanes" role="group" aria-label="Filtrar servicios">
        @for (lane of lanes; track lane.id) {
          <button
            type="button"
            class="lane"
            [class.on]="filter === lane.id"
            [attr.aria-pressed]="filter === lane.id"
            (click)="filter = lane.id"
          >
            <span class="lane-n tabular">{{ count(lane.id) }}</span>
            <span class="lane-l">{{ lane.label }}</span>
          </button>
        }
      </div>

      @if (loading) {
        <div class="panel state" role="status">
          <span class="spinner" aria-hidden="true"></span>
          <span>Cargando servicios…</span>
        </div>
      } @else if (error) {
        <div class="panel state error" role="alert">
          <strong>No se pudieron cargar los servicios</strong>
          <p>{{ error }}</p>
          <button type="button" class="btn btn-secondary" (click)="load()">Reintentar</button>
        </div>
      } @else if (!visible.length) {
        <div class="panel empty">
          <app-icon name="briefcase" [size]="22" />
          <h2>{{ filter === 'all' ? 'Todavía no hay servicios' : 'Nada en este filtro' }}</h2>
          <p>Crea una plantilla con honorario, documentos y preguntas de ingreso. Ejemplo: denuncia electrónica.</p>
          <a routerLink="/abogado/servicios/nuevo" class="btn btn-primary">Crear el primero</a>
        </div>
      } @else {
        <div class="grid">
          @for (s of visible; track s.id; let i = $index) {
            <article class="card" [style.--i]="i">
              <div class="card-top">
                <span class="cat">{{ categoryLabel(s.category) }}</span>
                <app-status-badge
                  [label]="s.status === 'publicado' ? 'Publicado' : 'Borrador'"
                  [variant]="s.status === 'publicado' ? 'ok' : 'warn'"
                />
              </div>
              <h2>{{ s.name }}</h2>
              <p class="pitch">{{ s.pitch || 'Sin resumen todavía.' }}</p>
              <div class="meta">
                <strong class="price tabular">{{ moneyUSD(s.price_usd) }}</strong>
                <span>{{ s.duration_hint || 'Plazo a definir' }}</span>
              </div>
              <p class="slug">/{{ s.slug }}</p>
              <div class="actions">
                <a class="btn btn-primary" [routerLink]="['/abogado/servicios', s.id]">Editar</a>
                <button type="button" class="btn btn-secondary" (click)="dup(s)" [disabled]="busy">Duplicar</button>
                <button type="button" class="btn btn-ghost" (click)="remove(s)" [disabled]="busy">Borrar</button>
              </div>
            </article>
          }
        </div>
      }

      @if (toast) {
        <div class="toast" role="status">{{ toast }}</div>
      }
    </div>
  `,
  styles: [`
    .svc { max-width: 980px; }

    .svc-head {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: var(--space-4);
      flex-wrap: wrap;
      margin-bottom: var(--space-5);
      animation: svc-in 520ms var(--ease-out) both;
    }

    .kicker {
      margin: 0 0 var(--space-2);
      font-size: var(--text-xs);
      font-weight: 650;
      letter-spacing: var(--tracking-wide);
      text-transform: uppercase;
      color: var(--primary);
    }

    h1 {
      margin: 0;
      font-family: var(--font-display);
      font-size: clamp(1.85rem, 3vw, 2.5rem);
      font-weight: 600;
      letter-spacing: -0.03em;
      line-height: 1.1;
      text-wrap: balance;
    }

    .lede {
      margin: var(--space-2) 0 0;
      max-width: 48ch;
      color: var(--text-secondary);
      font-size: var(--text-sm);
    }

    .lanes {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: var(--space-2);
      margin-bottom: var(--space-5);
    }

    .lane {
      display: grid;
      gap: 0.15rem;
      min-height: 4rem;
      padding: var(--space-3);
      text-align: left;
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      background: var(--surface);
      color: var(--text-secondary);
      box-shadow: var(--shadow-sm);
      animation: svc-in 480ms var(--ease-out) both;
      transition:
        transform 240ms var(--ease-out),
        border-color 200ms var(--ease),
        background 200ms var(--ease),
        box-shadow 240ms var(--ease);
    }

    .lanes .lane:nth-child(1) { animation-delay: 40ms; }
    .lanes .lane:nth-child(2) { animation-delay: 70ms; }
    .lanes .lane:nth-child(3) { animation-delay: 100ms; }

    .lane:hover:not(.on) {
      transform: translateY(-3px);
      border-color: color-mix(in srgb, var(--primary) 28%, var(--border));
      box-shadow: var(--shadow-md);
      color: var(--text);
    }

    .lane.on {
      background: var(--primary-subtle);
      border-color: var(--primary-border);
      color: var(--primary);
    }

    .lane-n {
      font-size: var(--text-lg);
      font-weight: 700;
      color: var(--text);
    }

    .lane.on .lane-n { color: var(--primary); }
    .lane-l { font-size: var(--text-xs); font-weight: 650; }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: var(--space-4);
    }

    .card {
      display: grid;
      gap: var(--space-2);
      padding: var(--space-5);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      background: var(--surface);
      box-shadow: var(--shadow-sm);
      animation: svc-card 560ms var(--ease-out) both;
      animation-delay: calc(var(--i) * 50ms);
      transition:
        transform 240ms var(--ease-out),
        box-shadow 240ms var(--ease-out);
    }

    .card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-md);
    }

    .card-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: var(--space-2);
    }

    .cat {
      font-size: var(--text-xs);
      font-weight: 700;
      letter-spacing: var(--tracking-wide);
      text-transform: uppercase;
      color: var(--primary);
    }

    .card h2 {
      margin: 0;
      font-size: var(--text-lg);
      font-weight: 650;
      text-wrap: balance;
    }

    .pitch {
      margin: 0;
      color: var(--text-secondary);
      font-size: var(--text-sm);
      min-height: 2.6em;
    }

    .meta {
      display: flex;
      justify-content: space-between;
      gap: var(--space-3);
      align-items: baseline;
      font-size: var(--text-sm);
      color: var(--text-secondary);
    }

    .price { color: var(--text); font-size: var(--text-base); }
    .slug { margin: 0; font-size: var(--text-xs); color: var(--text-muted); }

    .actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-2);
      margin-top: var(--space-2);
    }

    .actions .btn-ghost { grid-column: 1 / -1; }

    .state, .empty {
      display: grid;
      justify-items: start;
      gap: var(--space-3);
      padding: var(--space-6);
    }

    .empty {
      justify-items: center;
      text-align: center;
    }

    .empty h2 { margin: 0; font-size: var(--text-lg); }
    .empty p { margin: 0; max-width: 42ch; color: var(--text-secondary); font-size: var(--text-sm); }

    .state.error { background: var(--danger-subtle); border-color: var(--danger-border); }
    .state.error p { margin: 0; color: var(--text-secondary); font-size: var(--text-sm); }

    .toast {
      position: fixed;
      bottom: 1.5rem;
      right: 1.5rem;
      background: var(--surface-inverse);
      color: var(--text-inverse);
      padding: 0.75rem 1.25rem;
      border-radius: var(--radius-md);
      font-size: var(--text-sm);
      z-index: 60;
      animation: svc-in 280ms var(--ease-out) both;
    }

    .tabular { font-variant-numeric: tabular-nums; }

    @keyframes svc-in {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: none; }
    }

    @keyframes svc-card {
      from { opacity: 0; transform: translateY(14px); filter: blur(4px); }
      to { opacity: 1; transform: none; filter: none; }
    }

    @media (max-width: 640px) {
      .lanes { grid-template-columns: 1fr; }
    }
  `],
})
export class LawyerServicesListComponent implements OnInit {
  services: LawyerServiceOffering[] = [];
  loading = true;
  error = '';
  busy = false;
  toast = '';
  filter: Lane = 'all';
  readonly lanes: { id: Lane; label: string }[] = [
    { id: 'all', label: 'Todos' },
    { id: 'publicado', label: 'Publicados' },
    { id: 'borrador', label: 'Borradores' },
  ];

  readonly categoryLabel = categoryLabel;
  readonly moneyUSD = moneyUSD;

  constructor(
    private api: ApiService,
    private confirm: ConfirmService,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  get visible(): LawyerServiceOffering[] {
    if (this.filter === 'all') {
      return this.services;
    }
    return this.services.filter((s) => s.status === this.filter);
  }

  count(id: Lane): number {
    if (id === 'all') {
      return this.services.length;
    }
    return this.services.filter((s) => s.status === id).length;
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.api.listLawyerServices().subscribe({
      next: (res) => {
        this.services = res.services ?? [];
        this.loading = false;
      },
      error: (err) => {
        this.error = apiErrorMessage(err, 'El servidor no respondió.');
        this.loading = false;
      },
    });
  }

  dup(s: LawyerServiceOffering): void {
    this.busy = true;
    this.api.duplicateLawyerService(s.id).subscribe({
      next: (copy) => {
        this.busy = false;
        this.showToast(`Copia creada: ${copy.name}`);
        this.load();
      },
      error: (err) => {
        this.busy = false;
        this.showToast(apiErrorMessage(err, 'No se pudo duplicar.'));
      },
    });
  }

  async remove(s: LawyerServiceOffering): Promise<void> {
    const ok = await this.confirm.confirm(`¿Borrar «${s.name}»? Esta acción no se deshace.`, 'Borrar servicio');
    if (!ok) {
      return;
    }
    this.busy = true;
    this.api.deleteLawyerService(s.id).subscribe({
      next: () => {
        this.busy = false;
        this.showToast('Servicio borrado');
        this.load();
      },
      error: (err) => {
        this.busy = false;
        this.showToast(apiErrorMessage(err, 'No se pudo borrar.'));
      },
    });
  }

  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  private showToast(msg: string): void {
    this.toast = msg;
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }
    this.toastTimer = setTimeout(() => (this.toast = ''), 2800);
  }
}
