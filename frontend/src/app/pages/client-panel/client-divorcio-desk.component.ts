import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService, CaseItem } from '../../core/api.service';
import { caseShort } from '../../shared/case-status.data';
import { IconComponent } from '../../shared/icon.component';
import { getProductDisplayName, normalizeProductId } from '../../shared/product-sites.data';
import {
  ProductDeskStepId,
  buildProductSteps,
  formatDateShort,
  productDocSlots,
  productEmptyCopy,
  productStepTitle,
} from './divorcio-steps';

interface DocRow {
  id: number;
  doc_type: string;
  filename: string;
  review_status?: string;
  review_note?: string;
  size_bytes?: number;
  created_at?: string;
  url?: string;
}

interface CaseEventRow {
  status?: string;
  status_label?: string;
  note?: string;
  created_at?: string;
}

@Component({
  selector: 'app-client-divorcio-desk',
  standalone: true,
  imports: [RouterLink, IconComponent],
  host: { '[class.is-embedded]': 'embedded' },
  template: `
    @if (!caseItem) {
      <div class="dossier desk-empty">
        <h2 class="dossier-title">{{ empty.title }}</h2>
        <p class="dossier-hint">{{ empty.hint }}</p>
        <a [routerLink]="empty.path" class="dossier-cta btn btn-primary">
          <app-icon [name]="empty.icon" [size]="16" />
          {{ empty.cta }}
          <app-icon name="arrow-right" [size]="16" />
        </a>
      </div>
    } @else {
      @if (!embedded) {
        <article class="dossier desk-hero" [class.is-pay]="step === 'pay' && !caseItem.paid">
          <h2 class="dossier-title">{{ stepTitle }}</h2>
          <p class="dossier-id">{{ productName }} · #{{ caseItem.id }} · {{ city }}</p>
          <p class="dossier-hint">{{ stepHint }}</p>
          <p class="dossier-meta">
            {{ caseItem.paid ? 'Pagado' : 'Por pagar' }} · {{ money }} · {{ caseItem.status_label }}
          </p>
        </article>
      }

      <section class="desk-body" [attr.aria-label]="stepTitle">
        @switch (step) {
          @case ('pay') {
            <div class="desk-card">
              @if (caseItem.paid) {
                <p class="desk-ok">Pago registrado. Continúa con los documentos.</p>
                <button type="button" class="btn btn-primary" (click)="goStep.emit('docs')">
                  Ir a documentos
                </button>
              } @else {
                <p class="desk-copy">
                  Un solo cobro de {{ money }} USD. Sin suscripción. Payphone de ejemplo.
                </p>
                @if (error) { <p class="desk-err">{{ error }}</p> }
                <button
                  type="button"
                  class="btn btn-primary"
                  [disabled]="busy"
                  (click)="pay()"
                >
                  {{ busy ? 'Procesando…' : 'Pagar con Payphone' }}
                </button>
              }
            </div>
          }
          @case ('docs') {
            <div class="desk-docs">
              <div class="desk-uploads">
                @for (slot of slots; track slot.type) {
                  <div class="desk-card desk-slot" [class.is-done]="slotUploaded(slot.type)">
                    <div class="desk-slot-head">
                      <h3>{{ slot.label }}</h3>
                    </div>
                    <label
                      class="desk-drop"
                      [class.busy]="uploading === slot.type"
                      [class.drag]="drag === slot.type"
                      (dragover)="onDragOver($event, slot.type)"
                      (dragleave)="onDragLeave($event, slot.type)"
                      (drop)="onDrop($event, slot.type)"
                    >
                      <input type="file" accept=".pdf,image/*" (change)="onFile($event, slot.type)" />
                      <app-icon name="upload" [size]="20" />
                      <span>{{ uploading === slot.type ? 'Subiendo…' : (latestDoc(slot.type) ? 'Reemplazar archivo' : 'Arrastra o elige archivo') }}</span>
                    </label>
                  </div>
                }
              </div>

              <aside class="desk-docstate" aria-label="Estado de documentos">
                <h3 class="ficha-head">Estado de documentos</h3>
                <ul class="ficha-list is-docs">
                  @for (d of docState; track d.label) {
                    <li class="ficha-row">
                      <span class="ficha-doc">
                        <span>{{ d.label }}</span>
                        <span class="ficha-file">{{ d.meta }}</span>
                        @if (d.note) { <span class="ficha-note">{{ d.note }}</span> }
                      </span>
                      <span class="desk-badge" [class]="d.badgeClass">{{ d.badge }}</span>
                    </li>
                  }
                </ul>
                @if (error) { <p class="desk-err">{{ error }}</p> }
                <p class="desk-progress tabular">{{ uploadedCount }}/{{ slots.length }}</p>
                @if (uploadedCount >= slots.length) {
                  <button type="button" class="btn btn-primary" (click)="goStep.emit('call')">
                    Continuar a consulta
                  </button>
                }
              </aside>
            </div>
          }
          @case ('call') {
            <div class="desk-card">
              @if (caseItem.consultation_at) {
                <p class="desk-ok">
                  Consulta
                  {{ caseItem.consultation_at === 'requested' ? 'solicitada' : 'coordinada' }}.
                  Tu abogado te contactará.
                </p>
                <button type="button" class="btn btn-secondary" (click)="goStep.emit('sign')">
                  Ver firma
                </button>
              } @else {
                <p class="desk-copy">
                  Envía la solicitud. El abogado revisa el expediente y agenda la videollamada.
                </p>
                @if (error) { <p class="desk-err">{{ error }}</p> }
                <button
                  type="button"
                  class="btn btn-primary"
                  [disabled]="busy"
                  (click)="requestConsult()"
                >
                  {{ busy ? 'Enviando…' : 'Solicitar consulta' }}
                </button>
              }
            </div>
          }
          @case ('sign') {
            <div class="desk-card">
              @if (caseItem.has_signature) {
                <p class="desk-ok">Firma registrada en el expediente.</p>
                <button type="button" class="btn btn-primary" (click)="goStep.emit('notary')">
                  Ver notaría
                </button>
              } @else if (!caseItem.can_sign) {
                <p class="desk-copy">
                  {{ caseItem.sign_hint || 'Tu abogado prepara la minuta. Te avisamos cuando puedas firmar.' }}
                </p>
              } @else {
                <p class="desk-copy">
                  Sube la minuta firmada (PDF) o usa la firma de plataforma desde este mismo panel.
                </p>
                @if (error) { <p class="desk-err">{{ error }}</p> }
                <div class="desk-sign-actions">
                  <label class="btn btn-secondary desk-file-btn">
                    <input type="file" accept=".pdf,image/*" (change)="onSignFile($event)" />
                    Subir documento firmado
                  </label>
                  <button
                    type="button"
                    class="btn btn-primary"
                    [disabled]="busy"
                    (click)="signPlatform()"
                  >
                    {{ busy ? 'Registrando…' : 'Firmar con LegalStation' }}
                  </button>
                </div>
              }
            </div>
          }
          @case ('notary') {
            <div class="desk-card">
              <p class="desk-copy">
                @if (caseItem.status === '10') {
                  Trámite cerrado. El acta quedó en tu expediente.
                } @else if (notaryStarted) {
                  El expediente está en etapa notarial: {{ caseItem.status_label }}.
                } @else {
                  Después de la firma, el abogado envía el caso a notaría. Aquí verás el avance.
                }
              </p>
              <ul class="desk-status-list">
                @for (s of steps; track s.id) {
                  <li [class.done]="s.state === 'done'" [class.current]="s.state === 'current'">
                    <span>{{ s.label }}</span>
                    <span class="tabular">{{ stateLabel(s.state) }}</span>
                  </li>
                }
              </ul>
            </div>
          }
        }
      </section>

      <section class="desk-ficha" aria-label="Ficha del expediente">
        <div class="ficha-block">
          <h3 class="ficha-head">Historial</h3>
          @if (historyRows.length) {
            <ul class="ficha-list">
              @for (e of historyRows; track e.date + e.label) {
                <li class="ficha-row">
                  <span class="ficha-mark" aria-hidden="true"></span>
                  <span>{{ e.label }}</span>
                  <span class="ficha-tail tabular">{{ e.date }}</span>
                </li>
              }
            </ul>
          } @else {
            <p class="ficha-empty">Sin movimientos todavía.</p>
          }
        </div>

        @if (step !== 'docs') {
          <div class="ficha-block">
            <h3 class="ficha-head">Documentos</h3>
            <ul class="ficha-list is-docs">
              @for (d of docState; track d.label) {
                <li class="ficha-row">
                  <span class="ficha-doc">
                    <span>{{ d.label }}</span>
                    <span class="ficha-file">{{ d.meta }}</span>
                  </span>
                  <span class="desk-badge" [class]="d.badgeClass">{{ d.badge }}</span>
                </li>
              }
            </ul>
          </div>
        }
      </section>
    }
  `,
  styles: [`
    :host {
      display: grid;
      gap: var(--space-4);
      animation: desk-in 480ms var(--ease-out) both;
    }

    @keyframes desk-in {
      from { opacity: 0; transform: translateY(14px); filter: blur(6px); }
      to { opacity: 1; transform: none; filter: blur(0); }
    }

    .dossier {
      display: grid;
      gap: var(--space-2);
      padding: var(--space-5) var(--space-5) var(--space-4);
      border: 1px solid color-mix(in srgb, var(--primary) 14%, var(--border));
      border-radius: var(--radius-xl);
      background:
        linear-gradient(
          165deg,
          color-mix(in srgb, var(--surface) 92%, var(--primary-subtle)),
          var(--surface)
        );
      box-shadow: var(--shadow-sm);
    }

    .desk-hero.is-pay {
      border-color: color-mix(in srgb, var(--warning) 35%, var(--border));
    }

    .dossier-title {
      margin: 0;
      font-size: clamp(1.35rem, 2.4vw, 1.85rem);
      font-weight: 650;
      letter-spacing: -0.03em;
      line-height: 1.15;
    }

    .dossier-id,
    .dossier-hint,
    .dossier-meta {
      margin: 0;
      font-size: var(--text-sm);
      color: var(--text-secondary);
    }

    .dossier-hint { max-width: 48ch; }

    /* Cabecera del trámite: el estado (pago, monto, etapa) al extremo derecho de la fila
       del título, en vez de quedar apilado dejando media tarjeta vacía al lado. Solo
       cuando el contenedor da para las dos cosas; si no, se apila como antes. */
    @container (min-width: 34rem) {
      .desk-hero {
        grid-template-columns: minmax(0, 1fr) auto;
        column-gap: var(--space-5);
        align-items: center;
      }

      .desk-hero .dossier-title { grid-column: 1; grid-row: 1; }
      .desk-hero .dossier-meta { grid-column: 2; grid-row: 1; text-align: right; }

      .desk-hero .dossier-id,
      .desk-hero .dossier-hint { grid-column: 1 / -1; }
    }

    .dossier-cta {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      margin-top: var(--space-3);
      width: fit-content;
      text-decoration: none;
    }

    .desk-body { display: grid; gap: var(--space-3); }

    .desk-card {
      display: grid;
      gap: var(--space-3);
      padding: var(--space-5);
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
      background: var(--surface);
      box-shadow: var(--shadow-sm);
      animation: desk-in 420ms var(--ease-out) both;
    }

    .desk-copy, .desk-ok, .desk-err {
      margin: 0;
      font-size: var(--text-sm);
      color: var(--text-secondary);
    }

    .desk-ok { color: var(--primary); font-weight: 600; }
    .desk-err { color: var(--danger); }

    /* Subir a la izquierda, estado real de cada casillero a la derecha: el soltar archivos
       ocupaba los 784px del panel con una caja punteada de 112px y dejaba el medio vacío. */
    .desk-docs { display: grid; gap: var(--space-5); }

    .desk-uploads {
      display: grid;
      gap: var(--space-3);
    }

    .desk-docstate {
      display: grid;
      gap: var(--space-3);
      align-content: start;
    }

    .desk-docstate > .ficha-head { margin-bottom: 0; }

    .desk-docstate .btn {
      justify-self: end;
      width: min(100%, 16rem);
    }

    @container (min-width: 48rem) {
      .desk-docs {
        grid-template-columns: minmax(0, 1fr) minmax(14rem, 18rem);
        column-gap: var(--space-6);
        align-items: start;
      }
    }

    .desk-progress {
      margin: 0;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--text-muted);
    }

    .desk-slot-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-2);
    }

    .desk-slot-head h3 {
      margin: 0;
      font-size: var(--text-base);
      font-weight: 650;
      letter-spacing: -0.02em;
    }

    .desk-badge {
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--text-muted);
    }

    .desk-badge.ok { color: var(--primary); }
    .desk-badge.warn { color: var(--warning); }
    .desk-badge.err { color: var(--danger); }

    .desk-drop {
      display: grid;
      place-items: center;
      gap: var(--space-2);
      min-height: 7rem;
      padding: var(--space-4);
      border: 1px dashed color-mix(in srgb, var(--primary) 28%, var(--border));
      border-radius: var(--radius-lg);
      background: color-mix(in srgb, var(--bg-subtle) 80%, var(--surface));
      color: var(--text-secondary);
      font-size: var(--text-sm);
      font-weight: 600;
      cursor: pointer;
      transition:
        border-color 200ms var(--ease-out),
        background 200ms var(--ease-out),
        transform 220ms var(--ease-out);
    }

    .desk-drop input { display: none; }
    .desk-drop:hover, .desk-drop.drag {
      border-color: var(--primary);
      background: color-mix(in srgb, var(--primary-subtle) 55%, var(--surface));
      transform: translateY(-1px);
    }
    .desk-drop.busy { opacity: 0.72; pointer-events: none; }

    .desk-slot.is-done .desk-drop {
      border-style: solid;
      border-color: color-mix(in srgb, var(--primary) 30%, var(--border));
    }

    .desk-sign-actions {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
    }

    /* Con la ventana ancha la fila quedaba pegada a la izquierda y dejaba ~330px libres
       al lado. Los dos botones cierran la tarjeta contra su borde derecho. */
    @container (min-width: 34rem) {
      .desk-sign-actions {
        justify-content: flex-end;
      }
    }

    /* Los dos caminos de firma miden igual de ancho, o el 100% si no caben.
       Con Inter, "Subir documento firmado" mide 170px: a 200px totales quedaban 2px
       de aire por lado contra los bordes, y el otro botón tenía 25px. Se veía apretado. */
    .desk-sign-actions .btn {
      width: min(100%, 14rem);
      padding-inline: var(--space-3);
      justify-content: center;
    }

    /* La card es --surface, así que un secundario con fondo --surface quedaba blanco
       sobre blanco: solo lo separaba un borde de 1px y se leía más chico que el relleno. */
    .desk-sign-actions .btn-secondary {
      --btn-bg: var(--bg-subtle);
    }

    .desk-file-btn {
      position: relative;
      overflow: hidden;
      cursor: pointer;
    }

    .desk-file-btn input {
      position: absolute;
      inset: 0;
      opacity: 0;
      cursor: pointer;
    }

    .desk-status-list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: grid;
      gap: 0.5rem;
    }

    .desk-status-list li {
      display: flex;
      justify-content: space-between;
      gap: var(--space-3);
      padding: 0.55rem 0;
      border-bottom: 1px solid var(--border);
      font-size: var(--text-sm);
      color: var(--text-secondary);
    }

    .desk-status-list li.done { color: var(--primary); }
    .desk-status-list li.current { color: var(--text); font-weight: 650; }

    /* Ficha del expediente: ocupa el alto que quedaba libre bajo el paso actual con
       información real que el cliente no veía en ninguna otra parte del panel. */
    .desk-ficha {
      display: grid;
      gap: var(--space-5);
      padding: var(--space-5);
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
      background: var(--surface);
      box-shadow: var(--shadow-sm);
      animation: desk-in 420ms var(--ease-out) both;
    }

    @container (min-width: 48rem) {
      .desk-ficha {
        grid-auto-flow: column;
        grid-auto-columns: minmax(0, 1fr);
        column-gap: var(--space-6);
      }

      .desk-ficha > .ficha-block + .ficha-block {
        padding-left: var(--space-6);
        border-left: 1px solid var(--border);
      }
    }

    .ficha-block { min-width: 0; }

    .ficha-head {
      margin: 0 0 var(--space-3);
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--text-muted);
    }

    .ficha-list {
      margin: 0;
      padding: 0;
      list-style: none;
      display: grid;
      gap: var(--space-2);
    }

    .ficha-row {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr) auto;
      align-items: baseline;
      gap: var(--space-3);
      font-size: var(--text-sm);
      color: var(--text-secondary);
    }

    .ficha-list.is-docs .ficha-row {
      grid-template-columns: minmax(0, 1fr) auto;
    }

    .ficha-mark {
      align-self: center;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--primary);
    }

    .ficha-tail {
      color: var(--text-muted);
      font-size: var(--text-xs);
    }

    .ficha-doc { display: grid; gap: 2px; min-width: 0; }

    .ficha-file {
      color: var(--text-muted);
      font-size: var(--text-xs);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .ficha-note {
      color: var(--danger);
      font-size: var(--text-xs);
    }

    .ficha-empty {
      margin: 0;
      font-size: var(--text-sm);
      color: var(--text-muted);
    }

    /* Embebido en la tarjeta extendida: el trámite suelta sus marcos para leerse como el
       cuerpo de esa tarjeta y no como tarjetas dentro de una tarjeta. */
    :host(.is-embedded) .desk-card,
    :host(.is-embedded) .desk-ficha,
    :host(.is-embedded) .desk-empty {
      padding: 0;
      border: 0;
      border-radius: 0;
      background: none;
      box-shadow: none;
    }

    :host(.is-embedded) .desk-body { gap: var(--space-5); }
  `],
})
export class ClientDivorcioDeskComponent implements OnChanges {
  @Input() product = 'divorcio360';
  @Input() caseItem: CaseItem | null = null;
  @Input() step: ProductDeskStepId = 'pay';
  /* Cuando el desk vive dentro de la tarjeta extendida, la cabecera de la tarjeta ya
     lleva título, expediente, pista y estado: el hero los repetiría palabra por palabra,
     y las tarjetas de adentro harían tarjeta dentro de tarjeta. */
  @Input() embedded = false;
  @Output() goStep = new EventEmitter<ProductDeskStepId>();
  @Output() caseChanged = new EventEmitter<CaseItem>();

  docs: DocRow[] = [];
  events: CaseEventRow[] = [];
  slots = productDocSlots('divorcio360');
  uploading = '';
  drag = '';
  busy = false;
  error = '';

  constructor(private api: ApiService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['caseItem'] || changes['product']) {
      const product = normalizeProductId(this.caseItem?.product || this.product);
      this.slots = productDocSlots(product);
      if (this.caseItem) {
        this.reloadDocs();
        this.reloadEvents();
      }
      this.error = '';
    }
  }

  get empty() {
    return productEmptyCopy(this.product);
  }

  get productName(): string {
    return getProductDisplayName(normalizeProductId(this.caseItem?.product || this.product));
  }

  get steps() {
    return buildProductSteps(this.caseItem, this.product);
  }

  get stepTitle(): string {
    return productStepTitle(this.step);
  }

  get stepHint(): string {
    return this.steps.find((s) => s.id === this.step)?.hint || '';
  }

  get city(): string {
    const raw = (this.caseItem?.city || '').trim();
    if (!raw) return 'Sin ciudad';
    return raw.split(',')[0].trim();
  }

  get money(): string {
    return `$${Math.round((this.caseItem?.amount_cents || 0) / 100)}`;
  }

  get uploadedCount(): number {
    return this.slots.filter((s) => this.slotUploaded(s.type)).length;
  }

  get notaryStarted(): boolean {
    return Number(this.caseItem?.status || '0') >= 6;
  }

  /* Ficha del expediente: lo que el cliente no ve en ninguna otra parte del panel.
     El historial usa el vocabulario de la app (caseShort) y no el `note` del servidor,
     que en el demo trae notas internas de fixture. */
  get historyRows(): { label: string; date: string }[] {
    return [...this.events]
      .sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')))
      .slice(0, 5)
      .map((e) => ({
        label: caseShort(e.status || '') || e.status_label || '',
        date: formatDateShort(e.created_at),
      }))
      .filter((r) => !!r.label);
  }

  /* Una fila por casillero del producto, subido o no: es el estado del trámite de
     documentos, no la lista de los archivos que ya llegaron. */
  get docState(): { label: string; meta: string; badge: string; badgeClass: string; note: string }[] {
    return this.slots.map((slot) => {
      const doc = this.latestDoc(slot.type);
      if (!doc) {
        return { label: slot.label, meta: 'Sin archivo', badge: 'Pendiente', badgeClass: '', note: '' };
      }
      const parts = [doc.filename, formatDateShort(doc.created_at), this.fileSize(doc.size_bytes)];
      return {
        label: slot.label,
        meta: parts.filter(Boolean).join(' · '),
        badge: this.docBadgeLabel(doc),
        badgeClass: this.docBadgeClass(doc),
        note: doc.review_status === 'rejected' ? doc.review_note || '' : '',
      };
    });
  }

  stateLabel(state: string): string {
    switch (state) {
      case 'done': return 'Listo';
      case 'current': return 'En curso';
      case 'locked': return 'Bloqueado';
      default: return 'Pendiente';
    }
  }

  slotUploaded(type: string): boolean {
    return this.docs.some((d) => d.doc_type === type);
  }

  latestDoc(type: string): DocRow | undefined {
    const matches = this.docs.filter((d) => d.doc_type === type);
    if (!matches.length) return undefined;
    return matches.reduce((a, b) => (a.id > b.id ? a : b));
  }

  docBadgeLabel(doc: DocRow): string {
    if (doc.review_status === 'approved') return 'Aprobado';
    if (doc.review_status === 'rejected') return 'Rechazado';
    return 'En revisión';
  }

  docBadgeClass(doc: DocRow): string {
    if (doc.review_status === 'approved') return 'ok';
    if (doc.review_status === 'rejected') return 'err';
    return 'warn';
  }

  pay(): void {
    if (!this.caseItem || this.busy) return;
    this.busy = true;
    this.error = '';
    this.api.mockPay(this.caseItem.id, 'Carlos Demo', '4242').subscribe({
      next: () => {
        this.busy = false;
        this.refreshCase();
      },
      error: (e) => {
        this.busy = false;
        this.error = e?.error?.error || 'No se pudo completar el pago.';
      },
    });
  }

  requestConsult(): void {
    if (!this.caseItem || this.busy) return;
    this.busy = true;
    this.error = '';
    this.api.requestConsultation(this.caseItem.id).subscribe({
      next: (c) => {
        this.busy = false;
        this.caseChanged.emit(c);
      },
      error: (e) => {
        this.busy = false;
        this.error = e?.error?.error || 'No pudimos enviar la solicitud.';
      },
    });
  }

  onFile(ev: Event, docType: string): void {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.uploadFile(file, docType);
    input.value = '';
  }

  onDragOver(e: DragEvent, docType: string): void {
    e.preventDefault();
    this.drag = docType;
  }

  onDragLeave(e: DragEvent, docType: string): void {
    e.preventDefault();
    if (this.drag === docType) this.drag = '';
  }

  onDrop(e: DragEvent, docType: string): void {
    e.preventDefault();
    this.drag = '';
    const file = e.dataTransfer?.files?.[0];
    if (file) this.uploadFile(file, docType);
  }

  onSignFile(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !this.caseItem) return;
    this.busy = true;
    this.error = '';
    this.api.sign(this.caseItem.id, file, 'upload').subscribe({
      next: () => {
        this.busy = false;
        this.refreshCase();
      },
      error: (e) => {
        this.busy = false;
        this.error = e?.error?.error || 'No se pudo registrar la firma.';
      },
    });
    input.value = '';
  }

  signPlatform(): void {
    if (!this.caseItem || this.busy) return;
    this.busy = true;
    this.error = '';
    this.api.sign(this.caseItem.id, null, 'platform').subscribe({
      next: () => {
        this.busy = false;
        this.refreshCase();
      },
      error: (e) => {
        this.busy = false;
        this.error = e?.error?.error || 'No se pudo registrar la firma.';
      },
    });
  }

  private uploadFile(file: File, docType: string): void {
    if (!this.caseItem) return;
    this.error = '';
    this.uploading = docType;
    this.api.uploadDoc(this.caseItem.id, docType, file).subscribe({
      next: () => {
        this.uploading = '';
        this.reloadDocs();
        this.refreshCase();
      },
      error: (e) => {
        this.uploading = '';
        this.error = e?.error?.error || 'Error al subir';
      },
    });
  }

  private reloadDocs(): void {
    if (!this.caseItem) return;
    this.api.listDocs(this.caseItem.id).subscribe((d) => (this.docs = d || []));
  }

  private reloadEvents(): void {
    if (!this.caseItem) return;
    this.api.getCase(this.caseItem.id).subscribe((d) => (this.events = d?.events || []));
  }

  private refreshCase(): void {
    if (!this.caseItem) return;
    this.api.getCase(this.caseItem.id).subscribe((d) => {
      if (d?.events) this.events = d.events;
      if (d?.case) this.caseChanged.emit(d.case);
    });
  }

  private fileSize(bytes?: number): string {
    if (!bytes || bytes <= 0) return '';
    if (bytes < 1024) return `${bytes} B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${Math.round(kb)} KB`;
    return `${(kb / 1024).toFixed(1).replace('.', ',')} MB`;
  }
}
