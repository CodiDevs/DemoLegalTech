import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService, LawyerServiceDraft, LawyerServiceQuestion } from '../../core/api.service';
import { IconComponent } from '../../shared/icon.component';
import { StatusBadgeComponent } from '../../shared/status-badge.component';
import { SERVICE_CATEGORIES, apiErrorMessage, categoryLabel, moneyUSD } from './lawyer-services.model';

@Component({
  selector: 'app-lawyer-services-editor',
  standalone: true,
  imports: [FormsModule, RouterLink, IconComponent, StatusBadgeComponent],
  template: `
    <div class="ed">
      <a routerLink="/abogado/servicios" class="back">
        <app-icon name="arrow-left" [size]="16" />
        Servicios
      </a>

      <header class="ed-head">
        <div>
          <p class="kicker">Plantilla de oferta</p>
          <h1>{{ creating ? 'Nuevo servicio' : (draft.name || 'Editar servicio') }}</h1>
          <p class="lede">Completa lo que el cliente necesita ver para comprar: nombre, honorario, documentos y preguntas de ingreso.</p>
        </div>
      </header>

      @if (loadError) {
        <div class="panel err" role="alert">
          <strong>No se pudo abrir el servicio</strong>
          <p>{{ loadError }}</p>
          <a routerLink="/abogado/servicios" class="btn btn-secondary">Volver</a>
        </div>
      } @else {
        <div class="split">
          <form class="folio" (ngSubmit)="save()">
            <div class="pair">
              <div class="field">
                <label for="svc-name">Nombre</label>
                <input id="svc-name" name="name" [(ngModel)]="draft.name" (ngModelChange)="onName($event)" [disabled]="busy" required />
              </div>
              <div class="field">
                <label for="svc-slug">Identificador</label>
                <input id="svc-slug" name="slug" [(ngModel)]="draft.slug" (ngModelChange)="slugTouched = true" [disabled]="busy" />
                <p class="field-hint">Se usa en el enlace. Se completa solo si no lo tocas.</p>
              </div>
            </div>

            <div class="pair">
              <div class="field">
                <label for="svc-cat">Área</label>
                <select id="svc-cat" name="category" [(ngModel)]="draft.category" [disabled]="busy">
                  @for (c of categories; track c.id) {
                    <option [value]="c.id">{{ c.label }}</option>
                  }
                </select>
              </div>
              <div class="field">
                <label for="svc-status">Estado</label>
                <select id="svc-status" name="status" [(ngModel)]="draft.status" [disabled]="busy">
                  <option value="borrador">Borrador</option>
                  <option value="publicado">Publicado</option>
                </select>
              </div>
            </div>

            <div class="pair">
              <div class="field">
                <label for="svc-price">Honorario (USD)</label>
                <input id="svc-price" name="price" type="number" min="0" step="1" [(ngModel)]="draft.price_usd" [disabled]="busy" />
              </div>
              <div class="field">
                <label for="svc-dur">Plazo estimado</label>
                <input id="svc-dur" name="duration" [(ngModel)]="draft.duration_hint" placeholder="3 a 7 días hábiles" [disabled]="busy" />
              </div>
            </div>

            <div class="field">
              <label for="svc-pitch">Resumen corto</label>
              <input id="svc-pitch" name="pitch" [(ngModel)]="draft.pitch" maxlength="280" [disabled]="busy" />
            </div>

            <div class="field">
              <label for="svc-desc">Qué incluye</label>
              <textarea id="svc-desc" name="description" rows="6" [(ngModel)]="draft.description" [disabled]="busy"></textarea>
            </div>

            <div class="field">
              <label for="svc-doc">Documentos que pide el cliente</label>
              <div class="add-row">
                <input id="svc-doc" name="docDraft" [(ngModel)]="docDraft" placeholder="Cédula, captura, oficio…" [disabled]="busy" (keydown.enter)="addDoc($event)" />
                <button type="button" class="btn btn-secondary" (click)="addDoc($event)" [disabled]="busy">Añadir</button>
              </div>
              <div class="chips">
                @for (d of draft.docs; track d.label) {
                  <button type="button" class="chip" (click)="removeDoc(d.label)" [disabled]="busy">{{ d.label }}</button>
                }
              </div>
              <p class="field-hint">Clic en un documento para quitarlo.</p>
            </div>

            <div class="field">
              <label for="svc-q">Preguntas de ingreso</label>
              <div class="add-row q-row">
                <input id="svc-q" name="qDraft" [(ngModel)]="qDraft" placeholder="¿Ya presentó denuncia previa?" [disabled]="busy" (keydown.enter)="addQuestion($event)" />
                <select name="qKind" [(ngModel)]="qKind" [disabled]="busy">
                  <option value="si_no">Sí / No</option>
                  <option value="texto">Texto</option>
                </select>
                <button type="button" class="btn btn-secondary" (click)="addQuestion($event)" [disabled]="busy">Añadir</button>
              </div>
              <ul class="qs">
                @for (q of draft.questions; track q.prompt; let i = $index) {
                  <li>
                    <span>{{ q.prompt }}</span>
                    <em>{{ q.kind === 'texto' ? 'Texto' : 'Sí / No' }}</em>
                    <button type="button" class="btn btn-ghost btn-sm" (click)="removeQuestion(i)" [disabled]="busy">Quitar</button>
                  </li>
                }
              </ul>
            </div>

            @if (formError) {
              <p class="field-error" role="alert">{{ formError }}</p>
            }

            <div class="form-actions">
              <a routerLink="/abogado/servicios" class="btn btn-ghost">Cancelar</a>
              <button type="submit" class="btn btn-primary" [disabled]="busy">
                {{ busy ? 'Guardando…' : creating ? 'Crear servicio' : 'Guardar cambios' }}
              </button>
            </div>
          </form>

          <aside class="preview" aria-label="Vista previa">
            <p class="preview-kicker">Así lo verá el cliente</p>
            <article class="sheet">
              <div class="sheet-top">
                <span class="cat">{{ categoryLabel(draft.category) }}</span>
                <app-status-badge
                  [label]="draft.status === 'publicado' ? 'En vitrina' : 'Solo el bufete'"
                  [variant]="draft.status === 'publicado' ? 'ok' : 'warn'"
                />
              </div>
              <h2>{{ draft.name || 'Nombre del servicio' }}</h2>
              <p class="sheet-pitch">{{ draft.pitch || 'Un párrafo corto que venda el trámite.' }}</p>
              <p class="sheet-price tabular">{{ moneyUSD(draft.price_usd) }}</p>
              <p class="sheet-dur">{{ draft.duration_hint || 'Plazo a definir' }}</p>
              @if (draft.description) {
                <p class="sheet-desc">{{ draft.description }}</p>
              }
              @if (draft.docs.length) {
                <h3>Documentos</h3>
                <ul>
                  @for (d of draft.docs; track d.label) {
                    <li>{{ d.label }}</li>
                  }
                </ul>
              }
              @if (draft.questions.length) {
                <h3>Al empezar</h3>
                <ol>
                  @for (q of draft.questions; track q.prompt) {
                    <li>{{ q.prompt }}</li>
                  }
                </ol>
              }
            </article>
          </aside>
        </div>
      }
    </div>
  `,
  styles: [`
    .ed { max-width: 1100px; }

    .back {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      margin-bottom: var(--space-4);
      color: var(--text-secondary);
      text-decoration: none;
      font-size: var(--text-sm);
      font-weight: 600;
    }

    .back:hover { color: var(--text); }

    .ed-head {
      margin-bottom: var(--space-5);
      animation: ed-in 480ms var(--ease-out) both;
    }

    .kicker, .preview-kicker {
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
      font-size: clamp(1.7rem, 2.8vw, 2.3rem);
      font-weight: 600;
      letter-spacing: -0.03em;
      line-height: 1.15;
      text-wrap: balance;
    }

    .lede {
      margin: var(--space-2) 0 0;
      max-width: 52ch;
      color: var(--text-secondary);
      font-size: var(--text-sm);
    }

    .split {
      display: grid;
      grid-template-columns: minmax(0, 1.15fr) minmax(260px, 0.85fr);
      gap: var(--space-6);
      align-items: start;
    }

    .folio {
      padding: var(--space-6);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      background: var(--surface);
      box-shadow: var(--shadow-sm);
      animation: ed-in 560ms var(--ease-out) both;
    }

    .pair {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-4);
    }

    .add-row {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: var(--space-2);
    }

    .q-row { grid-template-columns: 1fr 7.5rem auto; }

    .chips { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-top: var(--space-3); }

    .chip {
      display: inline-flex;
      align-items: center;
      padding: 0.2rem 0.6rem;
      font: inherit;
      font-size: var(--text-xs);
      font-weight: 600;
      border-radius: var(--radius-full);
      border: 1px solid var(--border);
      background: var(--bg-subtle);
      color: var(--text-secondary);
      cursor: pointer;
    }

    .chip:hover:not(:disabled) {
      border-color: var(--danger-border);
      background: var(--danger-subtle);
      color: var(--danger);
    }

    .qs {
      list-style: none;
      margin: var(--space-3) 0 0;
      padding: 0;
      display: grid;
      gap: var(--space-2);
    }

    .qs li {
      display: grid;
      grid-template-columns: 1fr auto auto;
      gap: var(--space-2);
      align-items: center;
      padding: var(--space-2) var(--space-3);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      background: var(--bg-subtle);
      font-size: var(--text-sm);
    }

    .qs em {
      font-style: normal;
      font-size: var(--text-xs);
      color: var(--text-muted);
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--space-2);
      margin-top: var(--space-2);
    }

    .preview {
      position: sticky;
      top: calc(var(--header-height) + var(--space-4));
      animation: ed-sheet 640ms var(--ease-out) both;
    }

    .sheet {
      padding: var(--space-6);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      background: var(--surface);
      box-shadow: var(--shadow-md);
    }

    .sheet-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: var(--space-2);
      margin-bottom: var(--space-3);
    }

    .cat {
      font-size: var(--text-xs);
      font-weight: 700;
      letter-spacing: var(--tracking-wide);
      text-transform: uppercase;
      color: var(--primary);
    }

    .sheet h2 {
      margin: 0;
      font-size: var(--text-xl, 1.35rem);
      font-weight: 650;
      text-wrap: balance;
    }

    .sheet-pitch, .sheet-desc, .sheet-dur {
      color: var(--text-secondary);
      font-size: var(--text-sm);
    }

    .sheet-price {
      margin: var(--space-3) 0 0;
      font-size: 1.6rem;
      font-weight: 700;
      color: var(--text);
    }

    .sheet-dur { margin: var(--space-1) 0 var(--space-3); }

    .sheet h3 {
      margin: var(--space-4) 0 var(--space-2);
      font-size: var(--text-xs);
      letter-spacing: var(--tracking-wide);
      text-transform: uppercase;
      color: var(--text-muted);
    }

    .sheet ul, .sheet ol {
      margin: 0;
      padding-left: 1.1rem;
      font-size: var(--text-sm);
      color: var(--text-secondary);
    }

    .err {
      display: grid;
      gap: var(--space-3);
      padding: var(--space-5);
      background: var(--danger-subtle);
      border-color: var(--danger-border);
    }

    .err p { margin: 0; font-size: var(--text-sm); color: var(--text-secondary); }

    .tabular { font-variant-numeric: tabular-nums; }

    @keyframes ed-in {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: none; }
    }

    @keyframes ed-sheet {
      from { opacity: 0; transform: translateX(16px); filter: blur(6px); }
      to { opacity: 1; transform: none; filter: none; }
    }

    @media (max-width: 900px) {
      .split, .pair, .q-row { grid-template-columns: 1fr; }
      .preview { position: static; }
    }
  `],
})
export class LawyerServicesEditorComponent implements OnInit {
  creating = true;
  busy = false;
  loadError = '';
  formError = '';
  slugTouched = false;
  docDraft = '';
  qDraft = '';
  qKind: LawyerServiceQuestion['kind'] = 'si_no';
  private id = '';

  readonly categories = SERVICE_CATEGORIES;
  readonly categoryLabel = categoryLabel;
  readonly moneyUSD = moneyUSD;

  draft: LawyerServiceDraft = emptyDraft();

  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.creating = true;
      return;
    }
    this.creating = false;
    this.id = id;
    this.api.getLawyerService(id).subscribe({
      next: (s) => {
        this.draft = {
          slug: s.slug,
          name: s.name,
          category: s.category,
          status: s.status,
          price_usd: s.price_usd,
          pitch: s.pitch,
          description: s.description,
          duration_hint: s.duration_hint,
          docs: s.docs ?? [],
          questions: s.questions ?? [],
        };
        this.slugTouched = true;
      },
      error: (err) => {
        this.loadError = apiErrorMessage(err, 'Servicio no encontrado.');
      },
    });
  }

  onName(value: string): void {
    if (!this.slugTouched) {
      this.draft.slug = slugifyClient(value);
    }
  }

  addDoc(ev?: Event): void {
    ev?.preventDefault();
    const label = this.docDraft.trim();
    if (!label || this.draft.docs.some((d) => d.label === label)) {
      return;
    }
    this.draft.docs = [...this.draft.docs, { label }];
    this.docDraft = '';
  }

  removeDoc(label: string): void {
    this.draft.docs = this.draft.docs.filter((d) => d.label !== label);
  }

  addQuestion(ev?: Event): void {
    ev?.preventDefault();
    const prompt = this.qDraft.trim();
    if (!prompt || this.draft.questions.some((q) => q.prompt === prompt)) {
      return;
    }
    this.draft.questions = [...this.draft.questions, { prompt, kind: this.qKind }];
    this.qDraft = '';
  }

  removeQuestion(i: number): void {
    this.draft.questions = this.draft.questions.filter((_, idx) => idx !== i);
  }

  save(): void {
    this.formError = '';
    if (!this.draft.name.trim()) {
      this.formError = 'El nombre es obligatorio.';
      return;
    }
    this.busy = true;
    const body: LawyerServiceDraft = {
      ...this.draft,
      price_usd: Number(this.draft.price_usd) || 0,
      name: this.draft.name.trim(),
      slug: this.draft.slug.trim(),
    };
    const req = this.creating
      ? this.api.createLawyerService(body)
      : this.api.patchLawyerService(this.id, body);
    req.subscribe({
      next: () => {
        this.busy = false;
        void this.router.navigateByUrl('/abogado/servicios');
      },
      error: (err) => {
        this.busy = false;
        this.formError = apiErrorMessage(err, 'No se pudo guardar.');
      },
    });
  }
}

function emptyDraft(): LawyerServiceDraft {
  return {
    slug: '',
    name: '',
    category: 'penal',
    status: 'borrador',
    price_usd: 0,
    pitch: '',
    description: '',
    duration_hint: '',
    docs: [],
    questions: [],
  };
}

function slugifyClient(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 64);
}
