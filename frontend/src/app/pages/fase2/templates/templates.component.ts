import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/api.service';
import { StatusBadgeComponent } from '../../../shared/status-badge.component';
import { friendlyFieldLabel } from '../../../shared/template-field-labels';

@Component({
  selector: 'app-fase2-templates',
  standalone: true,
  imports: [StatusBadgeComponent],
  template: `
    <h1>Modelos de documentos</h1>

    <div class="grid">
      @for (t of templates; track t.id) {
        <article class="panel fase2-preview-card card" (click)="openPreview(t)">
          <div class="card-head">
            <span class="cat">{{ t.category }}</span>
            <app-status-badge [label]="statusLabel(t)" [variant]="statusVariant(t)" />
          </div>
          <h2>{{ t.name }}</h2>
          <p class="muted">{{ t.version }}</p>
          <div class="fields">
            @for (f of t.fields?.slice(0, 4) || []; track f) {
              <span class="field-chip">{{ labelFor(f) }}</span>
            }
          </div>
          <button type="button" class="btn btn-ghost" (click)="dup($event)">Duplicar plantilla</button>
        </article>
      }
    </div>

    @if (preview) {
      <div class="modal-backdrop" (click)="preview = null">
        <div class="modal panel" (click)="$event.stopPropagation()">
          <h2>{{ preview.name }}</h2>
          <p class="muted">Vista previa · {{ preview.version }}</p>
          <div class="preview-html" [innerHTML]="preview.preview_html"></div>
          <h3>Datos que completa el sistema</h3>
          <div class="fields modal-fields">
            @for (f of preview.fields || []; track f) {
              <span class="field-chip">{{ labelFor(f) }}</span>
            }
          </div>
          @if (versions.length) {
            <h3>Historial de versiones</h3>
            <ul class="versions">
              @for (v of versionsFor(preview.id); track v.version) {
                <li>{{ v.version }} · {{ v.date }} · {{ v.author }}</li>
              }
            </ul>
          }
          <button type="button" class="btn btn-primary" (click)="preview = null">Cerrar</button>
        </div>
      </div>
    }

    @if (toast) { <div class="toast">{{ toast }}</div> }
  `,
  styleUrls: ['../fase2-shared.scss'],
  styles: [`
    .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-top: 1.25rem; }
    .card { cursor: pointer; display: grid; gap: 0.5rem; }
    .card-head { display: flex; justify-content: space-between; align-items: center; }
    .cat { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: var(--brand); }
    .card h2 { font-size: 1.1rem; margin: 0; }
    .fields, .modal-fields { display: flex; flex-wrap: wrap; gap: 0.4rem; }
    .field-chip {
      display: inline-flex;
      align-items: center;
      padding: 0.2rem 0.55rem;
      font-size: 0.78rem;
      font-weight: 500;
      border-radius: var(--radius-full);
      background: var(--bg-subtle);
      border: 1px solid var(--border);
      color: var(--text-secondary);
    }
    .modal-backdrop {
      position: fixed; inset: 0; background: oklch(0.15 0.02 230 / 0.45);
      display: grid; place-items: center; z-index: 50; padding: 1rem;
    }
    .modal { max-width: 560px; width: 100%; max-height: 90vh; overflow: auto; }
    .preview-html { border: 1px solid var(--line); padding: 1rem; border-radius: 8px; margin: 1rem 0; font-size: 0.9rem; }
    .versions { font-size: 0.88rem; color: var(--ink-soft); }
    .toast {
      position: fixed; bottom: 1.5rem; right: 1.5rem; background: var(--ink);
      color: white; padding: 0.75rem 1.25rem; border-radius: 8px; font-size: 0.9rem;
    }
    @media (max-width: 800px) { .grid { grid-template-columns: 1fr; } }
  `]
})
export class Fase2TemplatesComponent implements OnInit {
  templates: any[] = [];
  versions: any[] = [];
  preview: any = null;
  toast = '';

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.mockTemplates().subscribe((d) => {
      this.templates = d.templates || [];
      this.versions = d.versions || [];
    });
  }

  labelFor(raw: string): string {
    return friendlyFieldLabel(raw);
  }

  statusLabel(t: any): string {
    if (t.status === 'activa') return 'Activa (MVP)';
    if (t.status === 'diseno') return 'En diseño';
    return 'Próximamente';
  }

  statusVariant(t: any): 'ok' | 'warn' | 'info' | 'default' {
    if (t.status === 'activa') return 'ok';
    if (t.status === 'diseno') return 'info';
    return 'warn';
  }

  openPreview(t: any): void { this.preview = t; }

  versionsFor(id: string): any[] {
    return this.versions.filter((v) => v.template_id === id);
  }

  dup(ev: Event): void {
    ev.stopPropagation();
    this.toast = 'Plantilla duplicada — lista para personalizar';
    setTimeout(() => this.toast = '', 3000);
  }
}
