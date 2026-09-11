import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { ConfirmService } from '../../core/confirm.service';
import { ProductFlowShellComponent } from '../../shared/product-flow-shell.component';
import { ProgressStep } from '../../shared/progress-steps.component';
import { IconComponent } from '../../shared/icon.component';
import { getProductFlowMeta, productThemeFromCase, clientFlowStepIndex } from '../../shared/product-sites.data';

interface DocRow {
  id: number;
  doc_type: string;
  filename: string;
  review_status?: string;
  review_note?: string;
  url?: string;
}

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [RouterLink, ProductFlowShellComponent, IconComponent],
  template: `
    <app-product-flow-shell
      [theme]="theme"
      [crumb]="crumb"
      eyebrow="Carga documental"
      title="Documentos del trámite"
      subtitle="Sube los archivos requeridos. Puedes reemplazar cualquier documento cuando quieras — no necesitas borrar el anterior."
      [steps]="flowSteps"
      [activeStep]="docsStepIndex"
    >
      @if (hasRejected) {
        <div class="up-banner">
          Un documento fue rechazado por el abogado. Sube una versión corregida en el recuadro correspondiente.
        </div>
      }

      <div class="up-layout" [class.up-complete]="canContinue">
        <aside class="up-side lp-lift">
          <h3>Tu checklist</h3>
          <p class="pf-muted">Solo necesitas <strong>{{ slots.length }} documentos</strong> para continuar.</p>
          <ul class="up-checklist">
            @for (slot of slots; track slot.type) {
              <li [class.done]="slotUploaded(slot.type)">
                <span class="up-check-icon">
                  @if (slotUploaded(slot.type)) { <app-icon name="check" [size]="16" /> }
                </span>
                <span>{{ slot.label }}</span>
              </li>
            }
          </ul>
          <div class="up-progress">
            <div class="up-progress-bar" [style.--p]="progressPct / 100"></div>
          </div>
          <p class="pf-muted">{{ uploadedCount }}/{{ slots.length }} cargados</p>
          <p class="pf-muted up-format-note">
            Formatos: PDF, JPG, PNG · máx. 10 MB
          </p>
        </aside>

        <div class="up-slots">
          @for (slot of slots; track slot.type) {
            <div [class]="slotClass(slot.type)">
              <div class="up-slot-head">
                <h2>{{ slot.label }}</h2>
                <span class="up-slot-badge" [class]="slotBadgeClass(slot.type)">{{ slotBadgeLabel(slot.type) }}</span>
              </div>

              @if (latestDoc(slot.type); as doc) {
                <div class="up-file-row">
                  <span class="up-file-name pf-muted">
                    <strong>Archivo actual:</strong> {{ doc.filename }}
                  </span>
                  <div class="up-file-actions">
                    @if (doc.url) {
                      <a [href]="doc.url" target="_blank" rel="noopener">Ver</a>
                    }
                    <button
                      type="button"
                      class="up-delete-btn"
                      [disabled]="deleting === doc.id"
                      (click)="deleteDoc(doc)"
                    >
                      {{ deleting === doc.id ? 'Eliminando…' : 'Eliminar archivo' }}
                    </button>
                  </div>
                </div>
              }

              <label class="up-dropzone"
                [class.drag]="drag === slot.type"
                [class.busy]="uploading === slot.type"
                (dragover)="onDragOver($event, slot.type)"
                (dragleave)="onDragLeave($event, slot.type)"
                (drop)="onDrop($event, slot.type)">
                <input type="file" accept=".pdf,image/*" (change)="onFile($event, slot.type)" />
                <div class="up-drop-icon"><app-icon name="upload" [size]="24" /></div>
                <p class="up-drop-title">
                  {{ latestDoc(slot.type) ? 'Arrastra para reemplazar' : 'Arrastra o haz clic para subir' }}
                </p>
                <p class="pf-muted up-drop-hint">
                  {{ uploading === slot.type ? 'Subiendo…' : 'El archivo anterior queda en historial; el abogado revisa el más reciente.' }}
                </p>
              </label>
            </div>
          }
        </div>
      </div>

      @if (error) { <p class="pf-err up-err">{{ error }}</p> }

      <div class="up-footer">
          <a class="lp-btn lp-btn-outline" [routerLink]="['/caso', caseId]">Ver expediente</a>
        @if (canContinue) {
          <a class="lp-btn lp-btn-primary pf-cta-unlock" [routerLink]="['/consulta', caseId]">Solicitar consulta</a>
        } @else {
          <span class="pf-muted">Completa los {{ slots.length }} documentos para continuar.</span>
        }
        @if (canSign) {
          <a class="lp-btn lp-btn-primary pf-cta-unlock" [routerLink]="['/firma', caseId]">{{ hasSignature ? 'Volver a firmar' : 'Firmar minuta' }}</a>
        } @else if (signHint) {
          <span class="pf-muted">{{ signHint }}</span>
        }
      </div>
    </app-product-flow-shell>
  `,
})
export class UploadComponent implements OnInit {
  caseId = 0;
  product = 'divorcio360';
  productName = 'Divorcio360';
  docs: DocRow[] = [];
  error = '';
  drag = '';
  uploading = '';
  deleting = 0;
  theme = productThemeFromCase();
  canSign = false;
  hasSignature = false;
  signHint = '';
  flowSteps: ProgressStep[] = [];
  docsStepIndex = 2;
  crumb: { label: string; link?: string }[] = [{ label: 'LegalStation', link: '/' }, { label: 'Documentos' }];

  slots = [
    { type: 'cedula', label: 'Cédula de identidad' },
    { type: 'partida', label: 'Partida de matrimonio' },
  ];

  constructor(private route: ActivatedRoute, private api: ApiService, private confirm: ConfirmService) {}

  ngOnInit(): void {
    this.caseId = Number(this.route.snapshot.paramMap.get('id'));
    this.api.getCase(this.caseId).subscribe((d) => {
      this.product = d.case?.product || 'divorcio360';
      this.theme = productThemeFromCase(this.product);
      this.canSign = !!d.case?.can_sign;
      this.hasSignature = !!d.case?.has_signature;
      this.signHint = d.case?.sign_hint || '';
      const meta = getProductFlowMeta(this.product);
      this.slots = meta.docTypes.map((dt) => ({ type: dt.type, label: dt.label }));
      this.flowSteps = meta.clientFlowSteps;
      this.docsStepIndex = clientFlowStepIndex(meta.flowSteps, 'docs');
      this.crumb = [
        { label: 'LegalStation', link: '/' },
        ...(meta.productHome ? [{ label: meta.name, link: meta.productHome }] : []),
        { label: 'Documentos' },
      ];
    });
    this.reload();
  }

  get uploadedCount(): number {
    return this.slots.filter((s) => this.slotUploaded(s.type)).length;
  }

  get progressPct(): number {
    if (!this.slots.length) return 0;
    return Math.round((this.uploadedCount / this.slots.length) * 100);
  }

  get canContinue(): boolean {
    return this.slots.every((s) => this.slotUploaded(s.type));
  }

  get hasRejected(): boolean {
    return this.slots.some((s) => this.latestDoc(s.type)?.review_status === 'rejected');
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
    switch (doc.review_status) {
      case 'approved': return 'Aprobado';
      case 'rejected': return 'Rechazado';
      default: return 'En revisión';
    }
  }

  slotClass(type: string): Record<string, boolean> {
    const doc = this.latestDoc(type);
    return {
      'pf-card': true,
      'lp-lift': true,
      'up-slot': true,
      'is-uploading': this.uploading === type,
      'is-drag': this.drag === type,
      'is-pending': !doc,
      'is-approved': doc?.review_status === 'approved',
      'is-rejected': doc?.review_status === 'rejected',
      'is-review': !!doc && doc.review_status !== 'approved' && doc.review_status !== 'rejected',
    };
  }

  slotBadgeClass(type: string): string {
    const doc = this.latestDoc(type);
    if (!doc) return '';
    switch (doc.review_status) {
      case 'approved': return 'ok';
      case 'rejected': return 'err';
      default: return 'warn';
    }
  }

  onFile(ev: Event, docType: string): void {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.uploadFile(file, docType);
    input.value = '';
  }

  onDragOver(e: DragEvent, docType: string): void {
    e.preventDefault();
    e.stopPropagation();
    this.drag = docType;
  }

  onDragLeave(e: DragEvent, docType: string): void {
    e.preventDefault();
    if (this.drag === docType) this.drag = '';
  }

  onDrop(e: DragEvent, docType: string): void {
    e.preventDefault();
    e.stopPropagation();
    this.drag = '';
    const file = e.dataTransfer?.files?.[0];
    if (file) this.uploadFile(file, docType);
  }

  private uploadFile(file: File, docType: string): void {
    this.error = '';
    this.uploading = docType;
    this.api.uploadDoc(this.caseId, docType, file).subscribe({
      next: () => {
        this.uploading = '';
        this.reload();
        this.refreshSigning();
      },
      error: (e) => {
        this.uploading = '';
        this.error = e?.error?.error || 'Error al subir';
      },
    });
  }

  private refreshSigning(): void {
    this.api.getCase(this.caseId).subscribe((d) => {
      this.canSign = !!d.case?.can_sign;
      this.hasSignature = !!d.case?.has_signature;
      this.signHint = d.case?.sign_hint || '';
    });
  }

  private reload(): void {
    this.api.listDocs(this.caseId).subscribe((d) => this.docs = d);
  }

  async deleteDoc(doc: DocRow): Promise<void> {
    const ok = await this.confirm.confirm(
      '¿Eliminar este archivo? Podrás subir uno nuevo después.',
      'Eliminar archivo',
    );
    if (!ok) return;
    this.error = '';
    this.deleting = doc.id;
    this.api.deleteDoc(this.caseId, doc.id).subscribe({
      next: () => {
        this.deleting = 0;
        this.reload();
        this.refreshSigning();
      },
      error: (e) => {
        this.deleting = 0;
        this.error = e?.error?.error || 'No se pudo eliminar el archivo';
      },
    });
  }
}
