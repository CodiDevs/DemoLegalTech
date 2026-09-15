import { Component, HostListener, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService, LawyerAnswerType, LawyerServiceDraft, LawyerServiceQuestion } from '../../core/api.service';
import { IconComponent } from '../../shared/icon.component';
import { StatusBadgeComponent } from '../../shared/status-badge.component';
import { WorkspaceHeadComponent } from '../lawyer-panel/workspace-head.component';
import {
  ANSWER_TYPES,
  SERVICE_CATEGORIES,
  answerTypeLabel,
  apiErrorMessage,
  categoryLabel,
  centsToUsdInput,
  defaultNoAplicaPrompt,
  hydrateQuestions,
  isBooleanQuestion,
  isNoAplicaQuestion,
  moneyUSD,
  newNoAplicaId,
  newQuestionId,
  usdInputToCents,
} from './lawyer-services.model';
import { QuestionFlowGraphComponent, FlowConnectEvent, FlowDisconnectEvent, FlowAddKind } from './question-flow-graph.component';

@Component({
  selector: 'app-lawyer-services-editor',
  standalone: true,
  imports: [FormsModule, RouterLink, IconComponent, StatusBadgeComponent, QuestionFlowGraphComponent, WorkspaceHeadComponent],
  template: `
    <div class="ed">
      <a routerLink="/abogado/servicios" class="back">
        <app-icon name="arrow-left" [size]="16" />
        Servicios
      </a>

      <app-workspace-head
        [title]="creating ? 'Nuevo servicio' : (draft.name || 'Editar servicio')"
        aside="Honorario, documentos y preguntas"
      />

      @if (loadError) {
        <div class="panel err" role="alert">
          <strong>No se pudo abrir el servicio</strong>
          <p>{{ loadError }}</p>
          <a routerLink="/abogado/servicios" class="btn btn-secondary">Volver</a>
        </div>
      } @else {
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

            <div class="field graph-field">
              <div class="graph-head">
                <div>
                  <label>Flujo de ingreso</label>
                  <p class="field-hint">
                    Lienzo tipo flujo: rueda para acercar, clic en un nodo para editarlo, + para crear pregunta.
                  </p>
                </div>
              </div>

              <app-question-flow-graph
                [questions]="draft.questions"
                [selectedId]="selectedQuestionId"
                [disabled]="busy"
                (select)="openQuestionModal($event)"
                (add)="addNode($event)"
                (connect)="onFlowConnect($event)"
                (disconnect)="onFlowDisconnect($event)"
              />
            </div>

            @if (formError) {
              <p class="field-error" role="alert">{{ formError }}</p>
            }

            <div class="form-actions">
              <a routerLink="/abogado/servicios" class="btn btn-ghost">Cancelar</a>
              <button type="button" class="btn btn-secondary" (click)="showPreview = !showPreview" [disabled]="busy">
                {{ showPreview ? 'Ocultar vista previa' : 'Ver vista previa' }}
              </button>
              <button type="submit" class="btn btn-primary" [disabled]="busy">
                {{ busy ? 'Guardando…' : creating ? 'Crear servicio' : 'Guardar cambios' }}
              </button>
            </div>

            @if (showPreview) {
              <section class="preview-panel" aria-labelledby="preview-heading">
                <h2 class="preview-heading" id="preview-heading">Así lo verá el cliente</h2>
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
                    <h3>Flujo de ingreso</h3>
                    <ol class="flow-preview">
                      @for (q of draft.questions; track q.id) {
                        <li>
                          <strong>{{ q.id }}</strong>
                          <span>{{ q.prompt || 'Sin texto' }}</span>
                          <em>{{ answerTypeLabel(q.answer_type || 'boolean') }}</em>
                          @if (isBoolean(q)) {
                            <small>
                              Sí → {{ q.branch_yes || 'fin' }}
                              · No → {{ q.branch_no || 'fin' }}
                            </small>
                          } @else if (q.answer_type === 'no_aplica') {
                            <small>Asesoría {{ moneyUSD((q.price_delta_cents || 0) / 100) }}</small>
                          } @else if (q.next) {
                            <small>→ {{ q.next }}</small>
                          }
                        </li>
                      }
                    </ol>
                    @if (estimatedExtrasHint) {
                      <p class="sheet-extras">{{ estimatedExtrasHint }}</p>
                    }
                  }
                </article>
              </section>
            }
          </form>

          @if (editModalOpen && modalQuestion; as q) {
            <div class="q-overlay" role="presentation" (click)="closeQuestionModal()">
              <div
                class="q-modal"
                role="dialog"
                aria-modal="true"
                [attr.aria-labelledby]="'q-modal-title'"
                (click)="$event.stopPropagation()"
              >
                <header class="q-modal-head">
                  <div>
                    <h2 class="q-modal-title" id="q-modal-title">
                      @if (creatingQuestion) {
                        {{ isNoAplica(q) ? 'Nuevo No aplica' : 'Nueva pregunta' }}
                      } @else {
                        {{ isNoAplica(q) ? 'Editar No aplica' : 'Editar pregunta' }}
                      }
                    </h2>
                    <div class="q-card-top">
                      <span class="q-id tabular">{{ q.id }}</span>
                      @if (!creatingQuestion && isStartQuestion(q)) {
                        <span class="q-badge">Inicio</span>
                      }
                      @if (isNoAplica(q)) {
                        <span class="q-badge q-badge-warn">Salida</span>
                      }
                    </div>
                  </div>
                  <button
                    type="button"
                    class="q-modal-close"
                    (click)="closeQuestionModal()"
                    aria-label="Cerrar"
                  >
                    <app-icon name="x" [size]="18" />
                  </button>
                </header>

                <div class="q-modal-body">
                  @if (isNoAplica(q)) {
                    <div class="field">
                      <label [attr.for]="'q-prompt-' + q.id">Mensaje al cliente</label>
                      <textarea
                        [id]="'q-prompt-' + q.id"
                        [name]="'prompt-' + q.id"
                        rows="4"
                        [(ngModel)]="q.prompt"
                        (ngModelChange)="onModalPromptChange()"
                        placeholder="Este trámite no aplica a tu caso…"
                        [disabled]="busy"
                      ></textarea>
                      <p class="field-hint">Se muestra cuando el flujo llega a este nodo. Invita a agendar asesoría.</p>
                    </div>
                    <div class="field">
                      <label [attr.for]="'q-advisory-' + q.id">Costo de la asesoría (USD)</label>
                      <input
                        [id]="'q-advisory-' + q.id"
                        [name]="'advisory-' + q.id"
                        type="number"
                        min="0"
                        step="1"
                        [ngModel]="centsToUsd(q.price_delta_cents)"
                        (ngModelChange)="q.price_delta_cents = usdToCents($event); onModalPromptChange()"
                        [disabled]="busy"
                      />
                    </div>
                    <p class="insp-hint">Nodo terminal: no tiene salidas. Conéctalo desde el No (u otra rama) de una pregunta.</p>
                  } @else {
                    <div class="field">
                      <label [attr.for]="'q-prompt-' + q.id">Pregunta</label>
                      <textarea
                        [id]="'q-prompt-' + q.id"
                        [name]="'prompt-' + q.id"
                        rows="3"
                        [(ngModel)]="q.prompt"
                        (ngModelChange)="onModalPromptChange()"
                        placeholder="¿Tienen hijos menores?"
                        [disabled]="busy"
                      ></textarea>
                    </div>

                    <div class="pair">
                      <div class="field">
                        <label [attr.for]="'q-type-' + q.id">Tipo de dato</label>
                        <select
                          [id]="'q-type-' + q.id"
                          [name]="'type-' + q.id"
                          [(ngModel)]="q.answer_type"
                          (ngModelChange)="onTypeChange(q); onModalPromptChange()"
                          [disabled]="busy"
                        >
                          @for (t of questionAnswerTypes; track t.id) {
                            <option [value]="t.id">{{ t.label }}</option>
                          }
                        </select>
                      </div>
                      <div class="field">
                        <label class="check-label check-inline">
                          <input type="checkbox" [name]="'req-' + q.id" [(ngModel)]="q.required" [disabled]="busy" />
                          Obligatoria
                        </label>
                      </div>
                    </div>

                    @if (isBoolean(q)) {
                      <div class="pair">
                        <div class="field">
                          <label [attr.for]="'q-yes-price-' + q.id">Extra si Sí (USD)</label>
                          <input
                            [id]="'q-yes-price-' + q.id"
                            [name]="'yes-price-' + q.id"
                            type="number"
                            min="0"
                            step="1"
                            [ngModel]="centsToUsd(q.price_on_yes_cents)"
                            (ngModelChange)="q.price_on_yes_cents = usdToCents($event)"
                            [disabled]="busy"
                          />
                        </div>
                        <div class="field">
                          <label [attr.for]="'q-no-price-' + q.id">Extra si No (USD)</label>
                          <input
                            [id]="'q-no-price-' + q.id"
                            [name]="'no-price-' + q.id"
                            type="number"
                            min="0"
                            step="1"
                            [ngModel]="centsToUsd(q.price_on_no_cents)"
                            (ngModelChange)="q.price_on_no_cents = usdToCents($event)"
                            [disabled]="busy"
                          />
                        </div>
                      </div>
                      <p class="insp-hint">Conecta los puertos Sí / No del nodo hacia otras preguntas o a un No aplica.</p>
                    } @else {
                      <div class="field">
                        <label [attr.for]="'q-extra-' + q.id">Extra al responder (USD)</label>
                        <input
                          [id]="'q-extra-' + q.id"
                          [name]="'extra-' + q.id"
                          type="number"
                          min="0"
                          step="1"
                          [ngModel]="centsToUsd(q.price_delta_cents)"
                          (ngModelChange)="q.price_delta_cents = usdToCents($event)"
                          [disabled]="busy"
                        />
                      </div>
                      <p class="insp-hint">Conecta el puerto «Siguiente» hacia la pregunta que sigue o a un No aplica.</p>
                    }
                  }
                </div>

                <footer class="q-modal-foot" [class.is-create]="creatingQuestion">
                  @if (!creatingQuestion) {
                    <button type="button" class="btn btn-ghost" (click)="removeSelected()" [disabled]="busy">
                      Quitar nodo
                    </button>
                  }
                  <button type="button" class="btn btn-primary" (click)="confirmQuestionModal()" [disabled]="busy">
                    Listo
                  </button>
                </footer>
              </div>
            </div>
          }
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      /* Evita que la animación del shell cree containing block y desplace el modal fixed */
      animation: none !important;
      transform: none !important;
      filter: none !important;
    }

    .ed { max-width: 1280px; }

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

    .preview-heading {
      margin: 0 0 var(--space-2);
      font-family: var(--font-sans);
      font-size: var(--text-sm);
      font-weight: 600;
      color: var(--text-secondary);
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

    .graph-field { margin-top: var(--space-2); }

    .insp-hint {
      margin: 0;
      font-size: var(--text-xs);
      color: var(--text-muted);
      line-height: 1.4;
    }

    .check-inline {
      margin-top: 1.6rem;
    }

    .q-overlay {
      position: fixed;
      inset: 0;
      z-index: var(--z-modal);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: max(1rem, env(safe-area-inset-top)) 1rem max(1rem, env(safe-area-inset-bottom));
      margin: 0;
      background: var(--overlay);
    }

    .q-modal {
      position: relative;
      width: min(100%, 28rem);
      max-height: min(85vh, 640px);
      overflow: auto;
      border-radius: var(--radius-lg);
      border: 1px solid var(--border);
      background: var(--surface);
      box-shadow: var(--shadow-md);
      animation: q-modal-in 320ms var(--ease-out) both;
    }

    .q-modal-head {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: var(--space-3);
      padding: var(--space-4) var(--space-5) var(--space-3);
      border-bottom: 1px solid var(--border);
    }

    .q-modal-title {
      margin: 0 0 var(--space-1);
      font-family: var(--font-sans);
      font-size: var(--text-base);
      font-weight: 600;
      color: var(--text);
    }

    .q-modal-close {
      flex-shrink: 0;
      display: grid;
      place-items: center;
      width: 2rem;
      height: 2rem;
      margin: -0.15rem -0.35rem 0 0;
      border: 0;
      border-radius: var(--radius-sm);
      background: transparent;
      color: var(--text-secondary);
      cursor: pointer;
    }

    .q-modal-close:hover {
      background: var(--bg-subtle);
      color: var(--text);
    }

    .q-modal-body {
      display: grid;
      gap: var(--space-3);
      padding: var(--space-5);
    }

    .q-modal-foot {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-3) var(--space-5) var(--space-5);
      border-top: 1px solid var(--border);
    }

    .q-modal-foot.is-create {
      justify-content: flex-end;
    }

    @keyframes q-modal-in {
      from { opacity: 0; transform: translateY(12px) scale(0.98); }
      to { opacity: 1; transform: none; }
    }

    .graph-head {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: var(--space-3);
      margin-bottom: var(--space-3);
    }

    .graph-head .btn { flex-shrink: 0; }

    .graph-empty {
      margin: 0 0 var(--space-3);
      padding: var(--space-4);
      border: 1px dashed var(--border);
      border-radius: var(--radius-md);
      color: var(--text-secondary);
      font-size: var(--text-sm);
    }

    .q-editor {
      margin-top: var(--space-3);
    }

    .q-card {
      display: grid;
      gap: var(--space-3);
      padding: var(--space-4);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      background: var(--bg-subtle);
      animation: ed-in 420ms var(--ease-out) both;
    }

    .q-card.is-bool {
      border-color: color-mix(in srgb, var(--primary) 22%, var(--border));
    }

    .q-card-top {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }

    .q-id {
      font-size: var(--text-xs);
      font-weight: 700;
      color: var(--primary);
      letter-spacing: 0.04em;
    }

    .q-badge {
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      padding: 0.15rem 0.45rem;
      border-radius: var(--radius-full);
      background: var(--primary-subtle);
      color: var(--primary);
    }

    .q-badge-warn {
      background: color-mix(in srgb, var(--danger-subtle, #fde8e8) 85%, var(--bg-subtle));
      color: color-mix(in srgb, var(--danger) 75%, var(--text));
    }

    .q-remove { margin-left: auto; }

    .check-label {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      margin-top: 1.6rem;
      font-size: var(--text-sm);
      font-weight: 600;
      color: var(--text-secondary);
      cursor: pointer;
    }

    .flow-preview {
      list-style: none;
      margin: 0;
      padding: 0;
      display: grid;
      gap: 0.55rem;
    }

    .flow-preview li {
      display: grid;
      gap: 0.15rem;
      padding: 0.55rem 0;
      border-bottom: 1px solid var(--border);
      font-size: var(--text-sm);
      color: var(--text-secondary);
    }

    .flow-preview strong {
      font-size: var(--text-xs);
      color: var(--primary);
    }

    .flow-preview em {
      font-style: normal;
      font-size: var(--text-xs);
      color: var(--text-muted);
    }

    .flow-preview small {
      font-size: var(--text-xs);
      color: var(--text-muted);
    }

    .sheet-extras {
      margin: var(--space-3) 0 0;
      font-size: var(--text-xs);
      color: var(--text-muted);
    }

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
      flex-wrap: wrap;
      justify-content: flex-end;
      gap: var(--space-2);
      margin-top: var(--space-2);
    }

    .preview-panel {
      margin-top: var(--space-4);
      animation: ed-in 420ms var(--ease-out) both;
    }

    .sheet {
      padding: var(--space-6);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      background: var(--bg-subtle);
      box-shadow: var(--shadow-sm);
      max-width: 32rem;
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

    @media (max-width: 900px) {
      .pair, .graph-head { grid-template-columns: 1fr; }
      .graph-head { display: grid; }
      .check-inline { margin-top: 0; }
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
  showPreview = false;
  editModalOpen = false;
  creatingQuestion = false;
  pendingQuestion: LawyerServiceQuestion | null = null;
  selectedQuestionId: string | null = null;
  private id = '';

  readonly categories = SERVICE_CATEGORIES;
  readonly answerTypes = ANSWER_TYPES;
  readonly questionAnswerTypes = ANSWER_TYPES.filter((t) => t.id !== 'no_aplica');
  readonly categoryLabel = categoryLabel;
  readonly answerTypeLabel = answerTypeLabel;
  readonly moneyUSD = moneyUSD;
  readonly centsToUsd = centsToUsdInput;
  readonly usdToCents = usdInputToCents;

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
          questions: hydrateQuestions(s.questions),
        };
        this.slugTouched = true;
        this.selectedQuestionId = null;
      },
      error: (err) => {
        this.loadError = apiErrorMessage(err, 'Servicio no encontrado.');
      },
    });
  }

  get selectedQuestion(): LawyerServiceQuestion | null {
    if (!this.selectedQuestionId) return null;
    return this.draft.questions.find((q) => q.id === this.selectedQuestionId) ?? null;
  }

  get modalQuestion(): LawyerServiceQuestion | null {
    return this.pendingQuestion ?? this.selectedQuestion;
  }

  get estimatedExtrasHint(): string {
    const qs = this.draft.questions;
    if (!qs.length) return '';
    let max = 0;
    for (const q of qs) {
      if (isBooleanQuestion(q)) {
        max += Math.max(q.price_on_yes_cents || 0, q.price_on_no_cents || 0);
      } else {
        max += q.price_delta_cents || 0;
      }
    }
    if (!max) return 'Sin extras de precio en el flujo.';
    return `Extras posibles hasta ${moneyUSD(max / 100)} según respuestas.`;
  }

  isBoolean(q: LawyerServiceQuestion): boolean {
    return isBooleanQuestion(q);
  }

  isNoAplica(q: LawyerServiceQuestion): boolean {
    return isNoAplicaQuestion(q);
  }

  isStartQuestion(q: LawyerServiceQuestion): boolean {
    return this.draft.questions[0]?.id === q.id;
  }

  selectQuestion(id: string): void {
    this.selectedQuestionId = id;
  }

  openQuestionModal(id: string): void {
    this.pendingQuestion = null;
    this.creatingQuestion = false;
    this.selectedQuestionId = id;
    this.editModalOpen = true;
  }

  closeQuestionModal(): void {
    this.pendingQuestion = null;
    this.creatingQuestion = false;
    this.editModalOpen = false;
  }

  confirmQuestionModal(): void {
    if (this.creatingQuestion && this.pendingQuestion) {
      const node = this.pendingQuestion;
      const prev = this.draft.questions[this.draft.questions.length - 1];
      if (prev && !isBooleanQuestion(prev) && !prev.next) {
        prev.next = node.id!;
      }
      this.draft.questions = [...this.draft.questions, node];
      this.selectedQuestionId = node.id ?? null;
      this.pendingQuestion = null;
      this.creatingQuestion = false;
    } else {
      this.bumpGraph();
    }
    this.editModalOpen = false;
  }

  onModalPromptChange(): void {
    if (!this.creatingQuestion) this.bumpGraph();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.editModalOpen) this.closeQuestionModal();
  }

  bumpGraph(): void {
    this.draft.questions = this.draft.questions.slice();
  }

  onFlowConnect(ev: FlowConnectEvent): void {
    const q = this.draft.questions.find((x) => x.id === ev.fromId);
    if (!q || ev.fromId === ev.toId) return;
    if (ev.port === 'yes') q.branch_yes = ev.toId;
    else if (ev.port === 'no') q.branch_no = ev.toId;
    else q.next = ev.toId;
    this.bumpGraph();
  }

  onFlowDisconnect(ev: FlowDisconnectEvent): void {
    const q = this.draft.questions.find((x) => x.id === ev.fromId);
    if (!q) return;
    if (ev.port === 'yes') q.branch_yes = '';
    else if (ev.port === 'no') q.branch_no = '';
    else q.next = '';
    this.bumpGraph();
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

  addNode(kind: FlowAddKind = 'question'): void {
    const existingIds = [
      ...this.draft.questions,
      ...(this.pendingQuestion ? [this.pendingQuestion] : []),
    ];
    if (kind === 'no_aplica') {
      this.pendingQuestion = {
        id: newNoAplicaId(existingIds),
        prompt: defaultNoAplicaPrompt(),
        kind: 'no_aplica',
        answer_type: 'no_aplica',
        required: false,
        price_delta_cents: 4900,
        price_on_yes_cents: 0,
        price_on_no_cents: 0,
        next: '',
        branch_yes: '',
        branch_no: '',
      };
    } else {
      this.pendingQuestion = {
        id: newQuestionId(existingIds),
        prompt: '',
        kind: 'si_no',
        answer_type: 'boolean',
        required: true,
        price_delta_cents: 0,
        price_on_yes_cents: 0,
        price_on_no_cents: 0,
        next: '',
        branch_yes: '',
        branch_no: '',
      };
    }
    this.selectedQuestionId = null;
    this.creatingQuestion = true;
    this.editModalOpen = true;
  }

  onTypeChange(q: LawyerServiceQuestion): void {
    const t = (q.answer_type || 'boolean') as LawyerAnswerType;
    if (t === 'no_aplica') {
      q.kind = 'no_aplica';
      q.required = false;
      q.next = '';
      q.branch_yes = '';
      q.branch_no = '';
      q.price_on_yes_cents = 0;
      q.price_on_no_cents = 0;
      if (!q.prompt.trim()) q.prompt = defaultNoAplicaPrompt();
      return;
    }
    q.kind = t === 'boolean' ? 'si_no' : t === 'text' ? 'texto' : t;
    if (t === 'boolean') {
      q.next = '';
    } else {
      q.branch_yes = '';
      q.branch_no = '';
      q.price_on_yes_cents = 0;
      q.price_on_no_cents = 0;
    }
  }

  removeSelected(): void {
    if (this.creatingQuestion) {
      this.closeQuestionModal();
      return;
    }
    const i = this.draft.questions.findIndex((q) => q.id === this.selectedQuestionId);
    if (i < 0) return;
    this.removeQuestion(i);
    this.editModalOpen = false;
    this.selectedQuestionId = null;
  }

  removeQuestion(i: number): void {
    const removed = this.draft.questions[i]?.id;
    this.draft.questions = this.draft.questions.filter((_, idx) => idx !== i);
    if (!removed) return;
    this.draft.questions = this.draft.questions.map((q) => ({
      ...q,
      next: q.next === removed ? '' : q.next,
      branch_yes: q.branch_yes === removed ? '' : q.branch_yes,
      branch_no: q.branch_no === removed ? '' : q.branch_no,
    }));
  }

  save(): void {
    this.formError = '';
    if (!this.draft.name.trim()) {
      this.formError = 'El nombre es obligatorio.';
      return;
    }
    const emptyPrompt = this.draft.questions.find((q) => !q.prompt.trim());
    if (emptyPrompt) {
      this.formError = `Completa el texto de la pregunta ${emptyPrompt.id}.`;
      return;
    }
    this.busy = true;
    const body: LawyerServiceDraft = {
      ...this.draft,
      price_usd: Number(this.draft.price_usd) || 0,
      name: this.draft.name.trim(),
      slug: this.draft.slug.trim(),
      questions: hydrateQuestions(this.draft.questions),
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
