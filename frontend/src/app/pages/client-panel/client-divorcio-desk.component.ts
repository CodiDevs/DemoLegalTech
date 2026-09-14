import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService, CaseItem } from '../../core/api.service';
import { IconComponent } from '../../shared/icon.component';
import { getProductDisplayName, normalizeProductId } from '../../shared/product-sites.data';
import {
  ProductDeskStepId,
  buildProductSteps,
  productDocSlots,
  productEmptyCopy,
  productStepTitle,
} from './divorcio-steps';

interface DocRow {
  id: number;
  doc_type: string;
  filename: string;
  review_status?: string;
  url?: string;
}

@Component({
  selector: 'app-client-divorcio-desk',
  standalone: true,
  imports: [RouterLink, IconComponent],
  template: `
    @if (!caseItem) {
      <div class="dossier desk-empty">
        <p class="dossier-kicker">{{ empty.kicker }}</p>
        <h2 class="dossier-title">{{ empty.title }}</h2>
        <p class="dossier-hint">{{ empty.hint }}</p>
        <a [routerLink]="empty.path" class="dossier-cta btn btn-primary">
          <app-icon [name]="empty.icon" [size]="16" />
          {{ empty.cta }}
          <app-icon name="arrow-right" [size]="16" />
        </a>
      </div>
    } @else {
      <article class="dossier desk-hero" [class.is-pay]="step === 'pay' && !caseItem.paid">
        <p class="dossier-kicker">{{ stepKicker }}</p>
        <h2 class="dossier-title">{{ stepTitle }}</h2>
        <p class="dossier-id">{{ productName }} · #{{ caseItem.id }} · {{ city }}</p>
        <p class="dossier-hint">{{ stepHint }}</p>
        <p class="dossier-meta">
          {{ caseItem.paid ? 'Pagado' : 'Por pagar' }} · {{ money }} · {{ caseItem.status_label }}
        </p>
      </article>

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
              <p class="desk-progress tabular">{{ uploadedCount }}/{{ slots.length }}</p>
              @for (slot of slots; track slot.type) {
                <div class="desk-card desk-slot" [class.is-done]="slotUploaded(slot.type)">
                  <div class="desk-slot-head">
                    <h3>{{ slot.label }}</h3>
                    <span class="desk-badge" [class]="slotBadgeClass(slot.type)">{{ slotBadgeLabel(slot.type) }}</span>
                  </div>
                  @if (latestDoc(slot.type); as doc) {
                    <p class="desk-file">{{ doc.filename }}</p>
                  }
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
              @if (error) { <p class="desk-err">{{ error }}</p> }
              @if (uploadedCount >= slots.length) {
                <button type="button" class="btn btn-primary" (click)="goStep.emit('call')">
                  Continuar a consulta
                </button>
              }
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

    .dossier-kicker {
      margin: 0;
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--primary);
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

    .desk-copy, .desk-ok, .desk-err, .desk-file {
      margin: 0;
      font-size: var(--text-sm);
      color: var(--text-secondary);
    }

    .desk-ok { color: var(--primary); font-weight: 600; }
    .desk-err { color: var(--danger); }

    .desk-docs { display: grid; gap: var(--space-3); }

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
  `],
})
export class ClientDivorcioDeskComponent implements OnChanges {
  @Input() product = 'divorcio360';
  @Input() caseItem: CaseItem | null = null;
  @Input() step: ProductDeskStepId = 'pay';
  @Output() goStep = new EventEmitter<ProductDeskStepId>();
  @Output() caseChanged = new EventEmitter<CaseItem>();

  docs: DocRow[] = [];
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
      if (this.caseItem) this.reloadDocs();
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

  get stepKicker(): string {
    const map: Record<ProductDeskStepId, string> = {
      pay: 'Pago',
      docs: 'Documentos',
      call: 'Consulta',
      sign: 'Firma',
      notary: 'Notaría',
    };
    return map[this.step];
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

  slotBadgeLabel(type: string): string {
    const doc = this.latestDoc(type);
    if (!doc) return 'Pendiente';
    if (doc.review_status === 'approved') return 'Aprobado';
    if (doc.review_status === 'rejected') return 'Rechazado';
    return 'En revisión';
  }

  slotBadgeClass(type: string): string {
    const doc = this.latestDoc(type);
    if (!doc) return '';
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

  private refreshCase(): void {
    if (!this.caseItem) return;
    this.api.getCase(this.caseItem.id).subscribe((d) => {
      if (d?.case) this.caseChanged.emit(d.case);
    });
  }
}
