import { Component, HostListener, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/api.service';
import { ConfirmService } from '../../../core/confirm.service';
import { StatusBadgeComponent } from '../../../shared/status-badge.component';
import { friendlyFieldLabel, toFieldToken } from '../../../shared/template-field-labels';

type ModalMode = 'preview' | 'edit';

interface TemplateDraft {
  name: string;
  category: string;
  status: string;
  version: string;
  fields: string[];
  preview_html: string;
}

@Component({
  selector: 'app-fase2-templates',
  standalone: true,
  imports: [FormsModule, StatusBadgeComponent],
  template: `
    <h1>Modelos de documentos</h1>

    @if (loadError) {
      <div class="panel fase2-state-error" role="alert">
        <div class="state-body">
          <strong>No se pudieron cargar las plantillas</strong>
          <p>{{ loadError }}</p>
        </div>
        <button type="button" class="btn btn-secondary" (click)="reload()">Reintentar</button>
      </div>
    }

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
          <div class="card-actions" (click)="$event.stopPropagation()">
            <button type="button" class="btn btn-ghost" (click)="dup(t)" [disabled]="busy">Duplicar plantilla</button>
            <button type="button" class="btn btn-secondary" (click)="openEditor(t)" [disabled]="busy">Editar</button>
            @if (isClone(t)) {
              <button type="button" class="btn btn-ghost" (click)="remove(t)" [disabled]="busy">Borrar</button>
            }
          </div>
        </article>
      }
    </div>

    @if (preview) {
      <div class="modal-backdrop" (click)="onBackdrop()">
        <div
          class="modal panel"
          [class.modal-edit]="modalMode === 'edit'"
          role="dialog"
          aria-modal="true"
          [attr.aria-labelledby]="'tpl-modal-title'"
          (click)="$event.stopPropagation()"
        >
          @if (modalMode === 'preview') {
            <h2 id="tpl-modal-title">{{ preview.name }}</h2>
            <p class="muted">{{ preview.version }}</p>
            <div class="preview-html" [innerHTML]="preview.preview_html"></div>
            <h3>Datos que completa el sistema</h3>
            <div class="fields modal-fields">
              @for (f of preview.fields || []; track f) {
                <span class="field-chip">{{ labelFor(f) }}</span>
              }
            </div>
            @if (versionsFor(preview.id).length) {
              <h3>Historial de versiones</h3>
              <ul class="versions">
                @for (v of versionsFor(preview.id); track v.version + v.date) {
                  <li>{{ v.version }} · {{ v.date }} · {{ v.author }}</li>
                }
              </ul>
            }
            @if (formError) {
              <p class="field-error" role="alert">{{ formError }}</p>
            }
            <div class="modal-actions">
              <button type="button" class="btn btn-ghost" (click)="preview = null">Cerrar</button>
              <button type="button" class="btn btn-primary" (click)="openEditor(preview)" [disabled]="busy">Editar</button>
            </div>
          } @else {
            <h2 id="tpl-modal-title">Editar modelo</h2>
            <div class="field">
              <label for="tpl-name">Nombre</label>
              <input id="tpl-name" name="name" [(ngModel)]="draft.name" [disabled]="busy" />
            </div>
            <div class="field">
              <label for="tpl-category">Categoría</label>
              <input id="tpl-category" name="category" [(ngModel)]="draft.category" [disabled]="busy" />
            </div>
            <div class="field">
              <label for="tpl-status">Estado</label>
              <select id="tpl-status" name="status" [(ngModel)]="draft.status" [disabled]="busy">
                <option value="activa">Activa (MVP)</option>
                <option value="diseno">En diseño</option>
                <option value="proximamente">Próximamente</option>
              </select>
            </div>
            <div class="field">
              <label for="tpl-version">Versión</label>
              <input id="tpl-version" name="version" [(ngModel)]="draft.version" [disabled]="busy" />
            </div>
            <div class="field">
              <label for="tpl-field">Campos que completa el sistema</label>
              <div class="field-add">
                <input
                  id="tpl-field"
                  name="fieldDraft"
                  [(ngModel)]="fieldDraft"
                  placeholder="cliente_nombre"
                  [disabled]="busy"
                  (keydown.enter)="addField($event)"
                />
                <button type="button" class="btn btn-secondary" (click)="addField($event)" [disabled]="busy">Añadir campo</button>
              </div>
              <div class="fields modal-fields">
                @for (f of draft.fields; track f) {
                  <button
                    type="button"
                    class="field-chip chip-btn"
                    (click)="removeField(f)"
                    [attr.aria-label]="'Quitar ' + labelFor(f)"
                    [disabled]="busy"
                  >{{ labelFor(f) }}</button>
                }
              </div>
              <p class="field-hint">Clic en un campo para quitarlo.</p>
            </div>
            <div class="edit-preview-grid">
              <div class="field">
                <label for="tpl-html">Texto de la minuta (HTML)</label>
                <textarea id="tpl-html" name="html" rows="10" [(ngModel)]="draft.preview_html" [disabled]="busy"></textarea>
              </div>
              <div class="field">
                <span class="preview-label">Vista previa</span>
                <div class="preview-html live" [innerHTML]="draft.preview_html"></div>
              </div>
            </div>
            @if (formError) {
              <p class="field-error" role="alert">{{ formError }}</p>
            }
            <div class="modal-actions">
              <button type="button" class="btn btn-ghost" (click)="cancelEdit()" [disabled]="busy">Cancelar</button>
              <button type="button" class="btn btn-primary" (click)="save()" [disabled]="busy">
                {{ busy ? 'Guardando…' : 'Guardar cambios' }}
              </button>
            </div>
          }
        </div>
      </div>
    }

    @if (toast) { <div class="toast" role="status">{{ toast }}</div> }
  `,
  styleUrls: ['../fase2-shared.scss'],
  styles: [`
    .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-top: 1.25rem; }
    .card { cursor: pointer; display: grid; gap: 0.5rem; }
    .card-head { display: flex; justify-content: space-between; align-items: center; }
    .cat { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: var(--brand); }
    .card h2 { font-size: 1.1rem; margin: 0; }
    .card-actions { display: grid; gap: var(--space-2); margin-top: var(--space-2); }
    .card-actions .btn { width: 100%; }
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
    .chip-btn {
      cursor: pointer;
      font: inherit;
    }
    .chip-btn:hover:not(:disabled) {
      border-color: var(--danger-border);
      background: var(--danger-subtle);
      color: var(--danger);
    }
    .modal-backdrop {
      position: fixed; inset: 0; background: oklch(0.15 0.02 230 / 0.45);
      display: grid; place-items: center; z-index: 50; padding: 1rem;
    }
    .modal { max-width: 560px; width: 100%; max-height: 90vh; overflow: auto; }
    .modal-edit { max-width: 880px; }
    .preview-html { border: 1px solid var(--line); padding: 1rem; border-radius: 8px; margin: 1rem 0; font-size: 0.9rem; }
    .preview-html.live { margin: 0; min-height: 6rem; }
    .preview-label {
      display: block;
      font-size: var(--text-sm);
      font-weight: 600;
      color: var(--text);
      margin-bottom: var(--space-2);
    }
    .versions { font-size: 0.88rem; color: var(--ink-soft); }
    .modal-actions { display: flex; gap: 0.5rem; justify-content: flex-end; margin-top: 1rem; }
    .field-add { display: grid; grid-template-columns: 1fr auto; gap: var(--space-2); margin-bottom: var(--space-2); }
    .edit-preview-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-4);
    }
    .toast {
      position: fixed; bottom: 1.5rem; right: 1.5rem; background: var(--ink);
      color: white; padding: 0.75rem 1.25rem; border-radius: 8px; font-size: 0.9rem;
      z-index: 60;
    }
    @media (max-width: 800px) {
      .grid { grid-template-columns: 1fr; }
      .edit-preview-grid { grid-template-columns: 1fr; }
      .field-add { grid-template-columns: 1fr; }
    }
  `]
})
export class Fase2TemplatesComponent implements OnInit {
  templates: any[] = [];
  versions: any[] = [];
  preview: any = null;
  modalMode: ModalMode = 'preview';
  toast = '';
  loadError = '';
  formError = '';
  busy = false;
  fieldDraft = '';
  draft: TemplateDraft = emptyDraft();
  private snapshot = '';
  private confirmOpen = false;
  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private api: ApiService, private confirm: ConfirmService) {}

  ngOnInit(): void {
    this.reload();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.preview) this.closeModal();
  }

  reload(): void {
    this.loadError = '';
    this.api.mockTemplates().subscribe({
      next: (d) => {
        this.templates = d.templates || [];
        this.versions = d.versions || [];
      },
      error: (e) => {
        this.loadError = e?.error?.error || 'No se pudieron cargar las plantillas';
      },
    });
  }

  labelFor(raw: string): string {
    return friendlyFieldLabel(raw);
  }

  isClone(t: any): boolean {
    return !!t?.source_id;
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

  openPreview(t: any): void {
    this.preview = t;
    this.modalMode = 'preview';
    this.formError = '';
  }

  openEditor(t: any): void {
    this.preview = t;
    this.modalMode = 'edit';
    this.formError = '';
    this.fieldDraft = '';
    this.draft = {
      name: t.name || '',
      category: t.category || 'familia',
      status: t.status || 'diseno',
      version: t.version || 'v1.0',
      fields: [...(t.fields || [])],
      preview_html: t.preview_html || '',
    };
    this.snapshot = this.draftKey();
    setTimeout(() => document.getElementById('tpl-name')?.focus(), 0);
  }

  versionsFor(id: string): any[] {
    return this.versions.filter((v) => v.template_id === id);
  }

  dup(t: any): void {
    if (this.busy) return;
    this.busy = true;
    this.api.duplicateTemplate(t.id).subscribe({
      next: (created) => {
        this.busy = false;
        this.showToast('Plantilla duplicada — lista para personalizar');
        this.api.mockTemplates().subscribe((d) => {
          this.templates = d.templates || [];
          this.versions = d.versions || [];
          const fresh = this.templates.find((x) => x.id === created.id) || created;
          this.openEditor(fresh);
        });
      },
      error: (e) => {
        this.busy = false;
        this.showToast(e?.error?.error || 'No se pudo duplicar');
      },
    });
  }

  addField(ev: Event): void {
    ev.preventDefault();
    const tok = toFieldToken(this.fieldDraft);
    if (!tok) return;
    if (!this.draft.fields.includes(tok)) this.draft.fields = [...this.draft.fields, tok];
    this.fieldDraft = '';
  }

  removeField(tok: string): void {
    this.draft.fields = this.draft.fields.filter((f) => f !== tok);
  }

  save(): void {
    if (!this.preview || this.busy) return;
    this.busy = true;
    this.formError = '';
    this.api.patchTemplate(this.preview.id, {
      name: this.draft.name,
      category: this.draft.category,
      status: this.draft.status,
      version: this.draft.version,
      fields: this.draft.fields,
      preview_html: this.draft.preview_html,
    }).subscribe({
      next: (updated) => {
        this.busy = false;
        this.snapshot = this.draftKey();
        this.showToast('Cambios guardados');
        this.api.mockTemplates().subscribe((d) => {
          this.templates = d.templates || [];
          this.versions = d.versions || [];
          this.preview = this.templates.find((x) => x.id === updated.id) || updated;
          this.modalMode = 'preview';
        });
      },
      error: (e) => {
        this.busy = false;
        this.formError = e?.error?.error || 'No se pudo guardar';
      },
    });
  }

  async cancelEdit(): Promise<void> {
    if (this.isDirty()) {
      const ok = await this.ask('Hay cambios sin guardar. ¿Descartarlos?', 'Descartar cambios');
      if (!ok) return;
    }
    this.modalMode = 'preview';
    this.formError = '';
  }

  onBackdrop(): void {
    this.closeModal();
  }

  async closeModal(): Promise<void> {
    if (!this.preview) return;
    if (this.modalMode === 'edit' && this.isDirty()) {
      const ok = await this.ask('Hay cambios sin guardar. ¿Descartarlos?', 'Descartar cambios');
      if (!ok) return;
    }
    this.preview = null;
    this.modalMode = 'preview';
    this.formError = '';
  }

  async remove(t: any): Promise<void> {
    const ok = await this.ask('¿Eliminar esta copia de plantilla?', 'Borrar copia');
    if (!ok) return;
    this.busy = true;
    this.api.deleteTemplate(t.id).subscribe({
      next: () => {
        this.busy = false;
        if (this.preview?.id === t.id) {
          this.preview = null;
          this.modalMode = 'preview';
        }
        this.showToast('Copia eliminada');
        this.reload();
      },
      error: (e) => {
        this.busy = false;
        this.showToast(e?.error?.error || 'No se pudo borrar');
      },
    });
  }

  private async ask(message: string, title: string): Promise<boolean> {
    if (this.confirmOpen) return false;
    this.confirmOpen = true;
    try {
      return await this.confirm.confirm(message, title);
    } finally {
      this.confirmOpen = false;
    }
  }

  private isDirty(): boolean {
    return this.draftKey() !== this.snapshot;
  }

  private draftKey(): string {
    return JSON.stringify(this.draft);
  }

  private showToast(msg: string): void {
    this.toast = msg;
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => { this.toast = ''; }, 3000);
  }
}

function emptyDraft(): TemplateDraft {
  return { name: '', category: 'familia', status: 'diseno', version: 'v1.0', fields: [], preview_html: '' };
}
