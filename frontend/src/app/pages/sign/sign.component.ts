import { Component, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, forkJoin, of, switchMap } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { ProductFlowShellComponent } from '../../shared/product-flow-shell.component';
import { productThemeFromCase } from '../../shared/product-sites.data';
import { ESIGN_FEE_CENTS, signatureChannelLabel } from '../../shared/esign';

type SignMode = 'upload' | 'done';

@Component({
  selector: 'app-sign',
  standalone: true,
  imports: [RouterLink, ProductFlowShellComponent],
  template: `
    <app-product-flow-shell
      [theme]="theme"
      [crumb]="[{ label: 'LegalStation', link: '/' }, { label: 'Firma virtual' }]"
      eyebrow="Firma electrónica"
      [title]="mode === 'done' ? 'Firma registrada' : 'Firma tu minuta'"
      [subtitle]="mode === 'done'
        ? 'El abogado ya puede revisar el documento en el expediente.'
        : 'Revisa la minuta. Sube tu documento ya firmado, o usa la firma de LegalStation (se cobra aparte).'"
    >
      @if (signBlocked) {
        <div class="pf-card lp-lift sign-blocked">
          <p class="pf-err">{{ signBlocked }}</p>
          @if (signHint) { <p class="pf-muted">{{ signHint }}</p> }
          <a class="btn btn-secondary" [routerLink]="['/caso', caseId]">Volver al expediente</a>
        </div>
      } @else {
        <ol class="sign-steps">
          <li class="done">Revisar minuta</li>
          <li [class.active]="mode === 'upload'" [class.done]="mode === 'done'">Elegir cómo firmar</li>
          <li [class.active]="mode === 'done'" [class.done]="mode === 'done'">Confirmación</li>
        </ol>

        <div class="sign-layout sign-stage" [class.is-sending]="busy" [class.is-done]="mode === 'done'">
          @if (minutaUrl && mode !== 'done') {
            <section class="pf-card lp-lift sign-minuta">
              <div class="sign-section-head">
                <span class="pf-badge">Paso 1</span>
                <h2>Vista previa de la minuta</h2>
              </div>
              <p class="pf-muted">Lee el documento antes de firmar. Si tienes dudas, agenda consulta con tu abogado.</p>
              <iframe class="pf-preview-frame sign-frame" [src]="minutaUrl" title="Minuta"></iframe>
            </section>
          }

          @if (mode === 'upload') {
            <section class="pf-card lp-lift sign-upload-wrap">
              <div class="sign-section-head">
                <span class="pf-badge">Paso 2</span>
                <h2>Cómo firmar</h2>
              </div>
              <p class="pf-muted">Elige una vía. Subir tu documento no cobra extra. La firma de LegalStation sí, aparte del trámite.</p>
              <h3 class="sign-path-title">Ya tengo el documento firmado</h3>
              <p class="pf-muted">PDF o imagen de tu firma electrónica o escaneo. Sin costo extra aquí.</p>
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
              <p class="sign-or" aria-hidden="true">o</p>
              <div class="sign-platform">
                <h3 class="sign-path-title">Firmar con LegalStation</h3>
                <p class="sign-platform-price">{{ esignFeeLabel }} USD</p>
                <p class="pf-muted">Aplicamos un sello electrónico demo a tu minuta. Se cobra aparte, no está en el paquete del trámite. Payphone mock.</p>
                <div class="sign-actions">
                  <button class="btn btn-primary" type="button" (click)="submitPlatform()" [disabled]="busy">
                    {{ payingPlatform ? 'Cobrando…' : 'Pagar ' + esignFeeLabel + ' y firmar' }}
                  </button>
                </div>
              </div>
              @if (error) { <p class="pf-err sign-feedback">{{ error }}</p> }
            </section>
          } @else {
            <section class="sign-finale pf-card" aria-live="polite">
              <img class="seal" src="/demo-scenes/legal-seal-demo.svg" width="120" height="120" alt="" />
              <div class="sign-finale-copy">
                <h2>{{ signature?.channel === 'platform' ? 'Firma aplicada' : 'Documento enviado' }}</h2>
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
                    <img [src]="signature.image_url" alt="Documento firmado" class="sign-thumb" />
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
          <h2 id="esign-pay-title">Procesando cobro de firma…</h2>
          <p class="pf-muted">{{ esignFeeLabel }} USD · Payphone demo</p>
        </div>
      </div>
    }
  `,
  styles: [`
    .sign-steps {
      display: flex;
      gap: var(--space-2);
      list-style: none;
      padding: 0;
      margin: 0 0 var(--space-5);
      flex-wrap: wrap;
    }
    .sign-steps li {
      flex: 1;
      min-width: 7rem;
      text-align: center;
      font-size: var(--text-xs);
      font-weight: 600;
      padding: var(--space-2) var(--space-3);
      border-radius: var(--radius-md);
      background: var(--bg-subtle);
      color: var(--text-muted);
      border: 1px solid var(--border);
    }
    .sign-steps li.active {
      background: var(--lp-accent-soft, var(--primary-subtle));
      color: var(--lp-accent-deep, var(--primary-hover));
      border-color: var(--lp-accent, var(--primary));
    }
    .sign-steps li.done {
      background: var(--surface);
      color: var(--lp-accent-deep, var(--primary-hover));
    }
    .sign-layout {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-4);
      align-items: start;
    }
    .sign-layout.is-done {
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
    .sign-frame { min-height: 360px; margin-top: var(--space-3); }
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
      max-width: 200px;
      max-height: 100px;
      object-fit: contain;
      border-radius: var(--radius-md);
      border: 1px solid var(--border);
      background: var(--surface);
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
      padding: var(--space-6);
      border-left: 4px solid var(--primary);
      color: var(--text);
      animation: pf-in 560ms var(--ease-out) both;
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
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    .sign-or::before,
    .sign-or::after {
      content: '';
      height: 1px;
      background: var(--border);
    }
    .sign-platform {
      padding: var(--space-5);
      border: 1px solid var(--primary);
      border-radius: var(--radius-lg);
      background: var(--primary-subtle);
      animation: pf-in 560ms var(--ease-out) 80ms both;
    }
    .sign-platform .sign-path-title { margin-top: 0; }
    .sign-platform-price {
      margin: 0 0 var(--space-2);
      font-size: var(--text-2xl);
      font-weight: 700;
      font-variant-numeric: tabular-nums;
      color: var(--primary-hover);
    }
    .sign-platform .sign-actions { margin-top: var(--space-4); }
    .pay-overlay {
      position: fixed;
      inset: 0;
      z-index: var(--z-modal);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-4);
      background: oklch(0.12 0.02 230 / 0.62);
      backdrop-filter: blur(4px);
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
      animation: pf-in 480ms var(--ease-out) both;
    }
    .pay-modal h2 {
      margin: 0;
      font-family: var(--font-sans);
      font-size: var(--text-lg);
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
  signBlocked = 'Cargando el expediente…';
  signHint = '';
  mode: SignMode = 'upload';
  selectedFile: File | null = null;
  dragOver = false;
  payingPlatform = false;
  readonly esignFeeLabel = `$${(ESIGN_FEE_CENTS / 100).toFixed(2)}`;
  readonly signatureChannelLabel = signatureChannelLabel;
  private destroyed = false;
  private subs: { unsubscribe: () => void }[] = [];

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private sanitizer: DomSanitizer,
  ) {}

  get sending(): boolean {
    return this.busy;
  }

  get finaleCopy(): string {
    if (this.signature?.channel === 'platform') {
      return `LegalStation aplicó la firma electrónica. Cobro aparte de ${this.esignFeeLabel} (demo Payphone). El abogado revisa y confirma.`;
    }
    return 'El abogado lo revisará y confirmará para continuar a notaría virtual.';
  }

  ngOnInit(): void {
    this.caseId = Number(this.route.snapshot.paramMap.get('id'));
    this.subs.push(
      this.api.getCase(this.caseId).pipe(
        switchMap((d) => {
          if (this.destroyed) return of(null);
          this.theme = productThemeFromCase(d.case?.product);
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
    if (this.busy) return;
    this.busy = true;
    this.payingPlatform = true;
    this.error = '';
    this.subs.push(this.api.sign(this.caseId, null, 'platform').subscribe({
      next: (res) => {
        if (this.destroyed) return;
        this.busy = false;
        this.payingPlatform = false;
        this.signature = res;
        this.mode = 'done';
        this.selectedFile = null;
      },
      error: (e) => {
        if (this.destroyed) return;
        this.busy = false;
        this.payingPlatform = false;
        this.error = e?.error?.error || 'Error al cobrar la firma de plataforma';
      },
    }));
  }
}
