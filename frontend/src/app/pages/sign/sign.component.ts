import { Component, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, forkJoin, of, switchMap } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { ProductFlowShellComponent } from '../../shared/product-flow-shell.component';
import { buildClientFlowCrumb, productThemeFromCase, setActiveProduct } from '../../shared/product-sites.data';
import { ESIGN_FEE_CENTS, signatureChannelLabel } from '../../shared/esign';
import { esignQrPayload, qrPngDataUrl } from '../../shared/qr-png';

type SignMode = 'upload' | 'done';
type PayStage = 'preparing' | 'processing' | 'approved' | 'signed' | '';

@Component({
  selector: 'app-sign',
  standalone: true,
  imports: [RouterLink, ProductFlowShellComponent],
  template: `
    <app-product-flow-shell
      [theme]="theme"
      [crumb]="crumb"
      [title]="mode === 'done' ? 'Firma registrada' : 'Firma tu minuta'"
    >
      @if (signBlocked) {
        <div class="sign-blocked">
          <p class="pf-err">{{ signBlocked }}</p>
          @if (signHint) { <p class="pf-muted">{{ signHint }}</p> }
          <a class="btn btn-secondary" [routerLink]="['/caso', caseId]">Volver al expediente</a>
        </div>
      } @else {
        <div class="sign-layout sign-stage" [class.is-sending]="busy" [class.is-done]="mode === 'done'" [class.has-minuta]="!!minutaUrl && (mode !== 'done' || !!stampSrc)">
          @if (minutaUrl && (mode !== 'done' || stampSrc)) {
            <section class="sign-minuta">
              <h2>Minuta</h2>
              <div class="sign-minuta-stage">
                <iframe class="pf-preview-frame sign-frame" [src]="minutaUrl" title="Minuta"></iframe>
                @if (stampSrc) {
                  <img class="sign-on-pdf" [src]="stampSrc" alt="" />
                }
              </div>
            </section>
          }

          @if (mode === 'upload') {
            <section class="sign-seal-col">
              <h2 class="sign-path-title">Sello QR</h2>
              <p class="sign-platform-price">{{ esignFeeLabel }} USD</p>
              <p class="pf-muted">No es una rúbrica. Es un QR de verificación. Lo descargas o lo aplicas a esta minuta. Cobro aparte.</p>
              @if (platformSignatureDataUrl) {
                <img class="sign-qr" [src]="platformSignatureDataUrl" alt="QR de firma electrónica" />
                <p class="sign-file-name">{{ signatureFileName }}</p>
              }
              @if (!assetReady) {
                <div class="sign-actions">
                  <button class="btn btn-primary" type="button" (click)="submitPlatform()" [disabled]="busy || !platformSignatureDataUrl">
                    {{ payingPlatform ? 'Cobrando…' : 'Pagar ' + esignFeeLabel + ' y obtener QR' }}
                  </button>
                </div>
              } @else {
                <p class="sign-pad-ok">Archivo listo</p>
                <div class="sign-actions">
                  <button class="btn btn-secondary" type="button" (click)="downloadSignature()">Descargar</button>
                  <button class="btn btn-primary" type="button" (click)="applyToMinuta()" [disabled]="busy">
                    {{ busy ? 'Aplicando…' : 'Aplicar a la minuta' }}
                  </button>
                </div>
              }

              <p class="sign-or" aria-hidden="true">o</p>
              <h3 class="sign-path-title">Documento ya firmado</h3>
              <label
                class="up-dropzone"
                [class.has-file]="!!selectedFile"
                [class.drag]="dragOver"
                (dragover)="onDragOver($event)"
                (dragleave)="onDragLeave($event)"
                (drop)="onDrop($event)"
              >
                <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" (change)="onFile($event)" hidden />
                @if (selectedFile) {
                  <strong>{{ selectedFile.name }}</strong>
                  <span class="pf-muted">Toca para cambiar archivo</span>
                } @else {
                  <strong>Arrastra o elige un archivo</strong>
                  <span class="pf-muted">PDF o imagen · máx. 10 MB</span>
                }
              </label>
              <div class="sign-actions">
                <button class="btn btn-primary" type="button" (click)="submit()" [disabled]="busy || !selectedFile">
                  {{ busy && !payingPlatform ? 'Enviando…' : 'Enviar documento firmado' }}
                </button>
              </div>
              @if (error) { <p class="pf-err sign-feedback">{{ error }}</p> }
            </section>
          } @else {
            <section class="sign-finale" aria-live="polite">
              <img class="seal" src="/demo-scenes/legal-seal-demo.svg" width="120" height="120" alt="" />
              <div class="sign-finale-copy">
                <h2>{{ signature?.channel === 'platform' ? 'QR aplicado' : 'Documento enviado' }}</h2>
                <p class="pf-muted">{{ finaleCopy }}</p>
                @if (signature) {
                  <dl class="sign-meta">
                    <div>
                      <dt>Vía</dt>
                      <dd>{{ signatureChannelLabel(signature.channel) }}</dd>
                    </div>
                    <div>
                      <dt>Fecha</dt>
                      <dd>{{ signedAtLabel(signature.signed_at) }}</dd>
                    </div>
                    <div>
                      <dt>IP</dt>
                      <dd>{{ signature.ip }}</dd>
                    </div>
                  </dl>
                  @if (isPdf(signature.image_url)) {
                    <a class="sign-doc-link" [href]="signature.image_url" target="_blank">Ver documento enviado</a>
                  } @else {
                    <img [src]="signature.image_url" alt="Sello QR" class="sign-thumb" />
                    @if (signature.channel === 'platform') {
                      <a class="sign-doc-link" [href]="signature.image_url" [download]="signatureFileName">Descargar QR</a>
                    }
                  }
                }
                <div class="sign-actions sign-cta-late">
                  <a class="btn btn-primary pf-cta-unlock" [routerLink]="['/caso', caseId]">Volver al expediente</a>
                  <button class="btn btn-secondary" type="button" (click)="startReupload()">Firmar de nuevo</button>
                </div>
                <p class="sign-note pf-muted">Al firmar de nuevo, el documento anterior se reemplaza.</p>
              </div>
            </section>
          }
        </div>
      }
    </app-product-flow-shell>

    @if (payingPlatform) {
      <div class="pay-overlay" role="dialog" aria-modal="true" aria-labelledby="esign-pay-title">
        <div class="pay-modal">
          <h2 id="esign-pay-title">{{ payOverlayTitle }}</h2>
          <p class="pf-muted">{{ esignFeeLabel }} USD · Payphone demo</p>
          <ol class="pay-stages">
            @for (stage of payStages; track stage.id) {
              <li [class.done]="payStageRank > stage.rank" [class.active]="payStage === stage.id">
                {{ stage.label }}
              </li>
            }
          </ol>
        </div>
      </div>
    }
  `,
  styles: [`
    .sign-layout {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-8);
      align-items: start;
      animation: pf-in var(--dur-cine) var(--ease-out) both;
    }
    .sign-layout.is-done:not(.has-minuta) {
      grid-template-columns: 1fr;
      justify-items: start;
    }
    .sign-layout.is-sending { opacity: 0.92; }
    .sign-success-hero {
      display: grid;
      justify-items: start;
      gap: var(--space-2);
      margin-bottom: var(--space-3);
    }
    .sign-success-hero h2 {
      margin: 0;
      font-family: var(--font-sans);
      font-size: clamp(1.65rem, 3vw, 2.15rem);
      font-weight: 650;
    }
    .sign-check {
      display: grid;
      place-items: center;
      width: 3.5rem;
      height: 3.5rem;
      border-radius: var(--radius-full);
      background: var(--success-subtle);
      color: var(--success);
    }
    .sign-section-head {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      margin-bottom: var(--space-2);
    }
    .sign-section-head h2 {
      margin: 0;
      font-size: var(--text-lg);
      font-family: var(--font-sans);
    }
    .sign-frame { min-height: 360px; margin-top: 0; }
    .sign-minuta-stage {
      position: relative;
      margin-top: var(--space-3);
    }
    .sign-on-pdf {
      position: absolute;
      right: var(--space-4);
      bottom: var(--space-4);
      width: 5.5rem;
      height: 5.5rem;
      object-fit: contain;
      pointer-events: none;
      background: #fff;
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      padding: 4px;
      animation: pf-in 420ms var(--ease-out);
    }
    .sign-actions {
      display: flex;
      gap: var(--space-3);
      flex-wrap: wrap;
      margin-top: var(--space-5);
    }
    .sign-feedback { margin-top: var(--space-3); }
    .sign-receipt { margin: var(--space-4) 0; }
    .sign-evidence {
      display: flex;
      gap: var(--space-5);
      align-items: flex-start;
      flex-wrap: wrap;
      margin: var(--space-4) 0;
      padding: var(--space-4);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      background: var(--bg-subtle);
    }
    .sign-thumb {
      max-width: 7.5rem;
      max-height: 7.5rem;
      object-fit: contain;
      border-radius: var(--radius-md);
      border: 1px solid var(--border);
      background: #fff;
      padding: var(--space-2);
    }
    .sign-meta {
      margin: var(--space-4) 0 0;
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: var(--space-4);
      width: 100%;
      padding: var(--space-4) 0;
      border-top: 1px solid var(--border);
      border-bottom: 1px solid var(--border);
      font-size: var(--text-sm);
    }
    .sign-meta dt {
      font-weight: 600;
      color: var(--text-muted);
      margin: 0;
    }
    .sign-meta dd {
      margin: var(--space-1) 0 0;
      color: var(--text);
      font-variant-numeric: tabular-nums;
      overflow-wrap: anywhere;
    }
    .sign-note { margin-top: var(--space-4); font-size: var(--text-sm); }
    .sign-finale {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: var(--space-5);
      align-items: start;
      width: min(100%, 44rem);
      padding: var(--space-2) 0;
      color: var(--text);
      animation: pf-in var(--dur-cine) var(--ease-out);
    }
    .sign-finale-copy {
      display: grid;
      justify-items: start;
      min-width: 0;
    }
    .sign-finale h2 {
      margin: 0;
      font-family: var(--font-sans);
      font-size: clamp(1.5rem, 2.4vw, 1.85rem);
      font-weight: 650;
      letter-spacing: -0.02em;
      color: var(--text);
      text-wrap: balance;
    }
    .sign-finale .pf-muted { margin: var(--space-2) 0 0; max-width: 46ch; }
    .sign-finale .sign-actions { margin-top: var(--space-5); }
    .sign-finale .btn { width: auto; }
    .sign-doc-link {
      margin-top: var(--space-3);
      font-size: var(--text-sm);
      font-weight: 600;
      color: var(--primary);
      text-underline-offset: 0.18em;
    }
    @media (max-width: 640px) {
      .sign-finale { grid-template-columns: 1fr; }
      .sign-meta { grid-template-columns: 1fr; gap: var(--space-3); }
    }
    .sign-blocked .btn { margin-top: var(--space-4); display: inline-flex; }
    .sign-path-title {
      margin: var(--space-4) 0 var(--space-2);
      font-family: var(--font-sans);
      font-size: var(--text-base);
      font-weight: 650;
    }
    .sign-or {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      gap: var(--space-3);
      align-items: center;
      margin: var(--space-5) 0;
      color: var(--text-muted);
      font-size: var(--text-xs);
      font-weight: 650;
    }
    .sign-or::before,
    .sign-or::after {
      content: '';
      height: 1px;
      background: var(--border);
    }
    .sign-platform {
      padding: 0;
      border: 0;
      background: none;
      animation: pf-in var(--dur-cine) var(--ease-out);
    }
    .sign-seal-col {
      min-width: 0;
    }
    .sign-minuta h2,
    .sign-seal-col .sign-path-title {
      margin: 0 0 var(--space-3);
      font-family: var(--font-sans);
      font-size: var(--text-base);
      font-weight: 650;
    }
    .sign-platform .sign-path-title { margin-top: 0; }
    .sign-platform-price {
      margin: 0 0 var(--space-2);
      font-size: var(--text-lg);
      font-weight: 650;
      font-variant-numeric: tabular-nums;
      color: var(--primary-hover);
    }
    .sign-file-name {
      margin: var(--space-2) 0 0;
      font-size: var(--text-sm);
      font-weight: 650;
      font-variant-numeric: tabular-nums;
    }
    .sign-qr {
      display: block;
      width: 12.5rem;
      height: 12.5rem;
      margin: var(--space-5) 0;
      object-fit: contain;
      background: transparent;
      border: 0;
      padding: 0;
    }
    .sign-platform .sign-actions { margin-top: var(--space-4); }
    .sign-pad-ok {
      margin: var(--space-4) 0 var(--space-2);
      font-family: var(--font-sans);
      font-weight: 650;
      color: var(--primary-hover);
    }
    .pay-overlay {
      position: fixed;
      inset: 0;
      z-index: var(--z-modal);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-4);
      background: var(--overlay-strong);
      animation: overlay-in var(--dur-base) var(--ease);
    }
    .pay-modal {
      width: min(100%, 22rem);
      display: grid;
      gap: var(--space-3);
      padding: var(--space-6);
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-lg);
      text-align: center;
      animation: pf-in 480ms var(--ease-out);
    }
    .pay-modal h2 {
      margin: 0;
      font-family: var(--font-sans);
      font-size: var(--text-lg);
    }
    .pay-stages {
      list-style: none;
      margin: var(--space-3) 0 0;
      padding: 0;
      display: grid;
      gap: var(--space-2);
      text-align: left;
    }
    .pay-stages li {
      font-size: var(--text-sm);
      color: var(--text-muted);
      padding: var(--space-2) var(--space-3);
      border-radius: var(--radius-md);
      background: var(--bg-subtle);
    }
    .pay-stages li.active {
      color: var(--primary-hover);
      background: var(--primary-subtle);
      font-weight: 650;
    }
    .pay-stages li.done {
      color: var(--primary-hover);
    }
    @keyframes overlay-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @media (max-width: 900px) {
      .sign-layout { grid-template-columns: 1fr; }
      .sign-actions .btn,
      .sign-blocked .btn { width: 100%; justify-content: center; }
    }
  `],
})
export class SignComponent implements OnInit, OnDestroy {
  caseId = 0;
  minutaUrl: SafeResourceUrl | null = null;
  busy = false;
  error = '';
  signature: any = null;
  theme = productThemeFromCase();
  crumb: { label: string; link?: string }[] = buildClientFlowCrumb('divorcio360', 'Firma');
  signBlocked = 'Cargando el expediente…';
  signHint = '';
  mode: SignMode = 'upload';
  selectedFile: File | null = null;
  dragOver = false;
  payingPlatform = false;
  payStage: PayStage = '';
  platformSignatureDataUrl = '';
  assetReady = false;
  readonly signatureFileName = 'sello-qr.png';
  readonly esignFeeLabel = `$${(ESIGN_FEE_CENTS / 100).toFixed(2)}`;
  readonly signatureChannelLabel = signatureChannelLabel;
  readonly payStages: { id: Exclude<PayStage, ''>; label: string; rank: number }[] = [
    { id: 'preparing', label: 'Preparando pago', rank: 0 },
    { id: 'processing', label: 'Procesando…', rank: 1 },
    { id: 'approved', label: 'Pago aprobado', rank: 2 },
    { id: 'signed', label: 'Archivo listo', rank: 3 },
  ];
  private destroyed = false;
  private subs: { unsubscribe: () => void }[] = [];
  private payTimers: ReturnType<typeof setTimeout>[] = [];

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private sanitizer: DomSanitizer,
  ) {}

  get sending(): boolean {
    return this.busy;
  }

  get payStageRank(): number {
    const i = this.payStages.findIndex((s) => s.id === this.payStage);
    return i < 0 ? -1 : i;
  }

  get payOverlayTitle(): string {
    return this.payStages.find((s) => s.id === this.payStage)?.label || 'Procesando cobro de firma…';
  }

  get stampSrc(): string {
    if (this.assetReady && this.platformSignatureDataUrl) return this.platformSignatureDataUrl;
    if (this.mode === 'upload') return '';
    const url = this.signature?.image_url as string | undefined;
    if (url && this.signature?.channel === 'platform' && !this.isPdf(url)) return url;
    return '';
  }

  get finaleCopy(): string {
    if (this.signature?.channel === 'platform') {
      return `El QR ${this.signatureFileName} quedó en tu expediente y sobre la minuta. Cobro aparte de ${this.esignFeeLabel} (Payphone de prueba). El abogado revisa y confirma.`;
    }
    return 'El abogado lo revisará y confirmará para continuar a notaría virtual.';
  }

  ngOnInit(): void {
    this.caseId = Number(this.route.snapshot.paramMap.get('id'));
    this.platformSignatureDataUrl = qrPngDataUrl(esignQrPayload(this.caseId));
    this.subs.push(
      this.api.getCase(this.caseId).pipe(
        switchMap((d) => {
          if (this.destroyed) return of(null);
          setActiveProduct(d.case?.product || 'divorcio360');
          this.theme = productThemeFromCase(d.case?.product);
          this.crumb = buildClientFlowCrumb(d.case?.product, 'Firma', {
            caseId: this.caseId,
            includeExpediente: true,
          });
          this.signHint = d.case?.sign_hint || '';
          if (!d.case?.can_sign) {
            this.signBlocked = d.case?.has_minuta
              ? 'La firma aún no está habilitada para este expediente.'
              : 'Tu abogado aún prepara la minuta. Te avisaremos cuando puedas firmar.';
            return of(null);
          }
          return forkJoin({
            outs: this.api.listOutputs(this.caseId),
            sigs: this.api.listSignatures(this.caseId),
          }).pipe(
            catchError(() => {
              this.signBlocked = 'No pudimos confirmar la minuta. Vuelve al expediente e inténtalo de nuevo.';
              this.minutaUrl = null;
              this.signature = null;
              return of(null);
            }),
          );
        }),
      ).subscribe({
        next: (snap) => {
          if (this.destroyed || !snap) return;
          const minuta = snap.outs.find((o: { output_type?: string; url?: string }) => o.output_type === 'minuta');
          if (!minuta?.url) {
            this.signBlocked = 'Falta la minuta confirmada. Vuelve al expediente e inténtalo de nuevo.';
            this.minutaUrl = null;
            return;
          }
          this.minutaUrl = this.sanitizer.bypassSecurityTrustResourceUrl(minuta.url);
          if (snap.sigs?.length) {
            this.signature = snap.sigs[0];
            this.mode = 'done';
          }
          this.signBlocked = '';
        },
        error: () => {
          if (this.destroyed) return;
          this.signBlocked = 'No pudimos cargar el expediente. Vuelve al expediente e inténtalo de nuevo.';
          this.signHint = '';
          this.minutaUrl = null;
          this.signature = null;
        },
      }),
    );
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.clearPayTimers();
    this.subs.forEach((s) => s.unsubscribe());
  }

  onFile(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
    this.error = '';
  }

  onDragOver(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();
    this.dragOver = true;
  }

  onDragLeave(e: DragEvent): void {
    e.preventDefault();
    this.dragOver = false;
  }

  onDrop(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();
    this.dragOver = false;
    const file = e.dataTransfer?.files?.[0];
    if (file) {
      this.selectedFile = file;
      this.error = '';
    }
  }

  isPdf(url: string): boolean {
    return /\.pdf(\?|$)/i.test(url || '');
  }

  signedAtLabel(raw?: string): string {
    if (!raw) return '';
    const ms = Date.parse(raw);
    if (Number.isNaN(ms)) return raw;
    return new Date(ms).toLocaleString('es-EC', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }

  startReupload(): void {
    this.mode = 'upload';
    this.selectedFile = null;
    this.error = '';
    this.payingPlatform = false;
    this.payStage = '';
    this.clearPayTimers();
    this.assetReady = false;
    if (!this.platformSignatureDataUrl) {
      this.platformSignatureDataUrl = qrPngDataUrl(esignQrPayload(this.caseId));
    }
  }

  submit(): void {
    if (!this.selectedFile || this.busy) return;
    const kept = this.selectedFile;
    this.busy = true;
    this.payingPlatform = false;
    this.error = '';
    this.subs.push(this.api.sign(this.caseId, this.selectedFile, 'upload').subscribe({
      next: (res) => {
        if (this.destroyed) return;
        this.busy = false;
        this.signature = res;
        this.mode = 'done';
        this.selectedFile = null;
      },
      error: (e) => {
        if (this.destroyed) return;
        this.busy = false;
        this.selectedFile = kept;
        this.error = e?.error?.error || 'Error al enviar el documento';
      },
    }));
  }

  submitPlatform(): void {
    if (this.busy || !this.platformSignatureDataUrl) return;
    this.busy = true;
    this.payingPlatform = true;
    this.payStage = 'preparing';
    this.error = '';
    this.clearPayTimers();
    this.payTimers.push(setTimeout(() => { if (!this.destroyed) this.payStage = 'processing'; }, 500));
    this.payTimers.push(setTimeout(() => { if (!this.destroyed) this.payStage = 'approved'; }, 1100));
    this.payTimers.push(setTimeout(() => { if (!this.destroyed) this.payStage = 'signed'; }, 1700));
    this.payTimers.push(setTimeout(() => this.unlockSignatureFile(), 2200));
  }

  downloadSignature(): void {
    const href = this.platformSignatureDataUrl || (this.signature?.image_url as string | undefined);
    if (!href) return;
    const a = document.createElement('a');
    a.href = href;
    a.download = this.signatureFileName;
    a.rel = 'noopener';
    a.click();
  }

  applyToMinuta(): void {
    if (this.busy || !this.platformSignatureDataUrl) return;
    const file = this.dataUrlToPngFile(this.platformSignatureDataUrl);
    if (!file) {
      this.error = 'No se pudo leer el QR.';
      return;
    }
    this.busy = true;
    this.error = '';
    this.subs.push(this.api.sign(this.caseId, file, 'platform').subscribe({
      next: (res) => {
        if (this.destroyed) return;
        this.busy = false;
        this.signature = res;
        this.mode = 'done';
        this.selectedFile = null;
      },
      error: (e) => {
        if (this.destroyed) return;
        this.busy = false;
        this.error = e?.error?.error || 'Error al aplicar el QR a la minuta';
      },
    }));
  }

  private unlockSignatureFile(): void {
    if (this.destroyed) return;
    this.clearPayTimers();
    this.busy = false;
    this.payingPlatform = false;
    this.payStage = '';
    this.assetReady = true;
  }

  private dataUrlToPngFile(dataUrl: string): File | null {
    const parts = dataUrl.split(',');
    if (parts.length < 2) return null;
    try {
      const bin = atob(parts[1]);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      return new File([bytes], this.signatureFileName, { type: 'image/png' });
    } catch {
      return null;
    }
  }

  private clearPayTimers(): void {
    this.payTimers.forEach((t) => clearTimeout(t));
    this.payTimers = [];
  }
}
