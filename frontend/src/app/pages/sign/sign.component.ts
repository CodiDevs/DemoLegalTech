import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { ProductFlowShellComponent } from '../../shared/product-flow-shell.component';
import { productThemeFromCase } from '../../shared/product-sites.data';

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
      title="Firma tu minuta"
      subtitle="Revisa el documento del notario y sube tu documento firmado — 100% virtual, con evidencia de fecha e IP."
    >
      @if (signBlocked) {
        <div class="pf-card lp-lift sign-blocked">
          <p class="pf-err">{{ signBlocked }}</p>
          @if (signHint) { <p class="pf-muted">{{ signHint }}</p> }
          <a class="lp-btn lp-btn-outline" [routerLink]="['/caso', caseId]">Volver al expediente</a>
        </div>
      } @else {
        <ol class="sign-steps">
          <li [class.active]="true" [class.done]="mode === 'done'">Revisar minuta</li>
          <li [class.active]="mode === 'upload'" [class.done]="mode === 'done'">Subir documento firmado</li>
          <li [class.active]="mode === 'done'" [class.done]="mode === 'done'">Confirmación</li>
        </ol>

        <div class="sign-layout">
          @if (minutaUrl) {
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
                <h2>Sube tu documento firmado</h2>
              </div>
              <p class="pf-muted">Adjunta el PDF o imagen del documento ya firmado (escaneado o firmado digitalmente).</p>
              <label class="up-dropzone" [class.has-file]="!!selectedFile">
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
                <button class="lp-btn lp-btn-primary" type="button" (click)="submit()" [disabled]="busy || !selectedFile">
                  {{ busy ? 'Enviando…' : 'Enviar documento firmado' }}
                </button>
              </div>
              @if (error) { <p class="pf-err sign-feedback">{{ error }}</p> }
            </section>
          } @else {
            <section class="pf-card lp-lift sign-done">
              <div class="sign-section-head">
                <span class="pf-badge">Paso 3</span>
                <h2>Documento enviado</h2>
              </div>
              <div class="pf-receipt sign-receipt">
                <p class="pf-ok">Tu documento firmado fue enviado correctamente.</p>
                <p class="pf-muted">El abogado lo revisará y confirmará para continuar a notaría virtual.</p>
              </div>
              @if (signature) {
                <div class="sign-evidence">
                  @if (isPdf(signature.image_url)) {
                    <a class="lp-btn lp-btn-outline" [href]="signature.image_url" target="_blank">Ver documento enviado</a>
                  } @else {
                    <img [src]="signature.image_url" alt="Documento firmado" class="sign-thumb" />
                  }
                  <dl class="sign-meta">
                    <div><dt>Fecha</dt><dd>{{ signature.signed_at }}</dd></div>
                    <div><dt>IP</dt><dd>{{ signature.ip }}</dd></div>
                  </dl>
                </div>
              }
              <div class="sign-actions">
                <button class="lp-btn lp-btn-outline" type="button" (click)="startReupload()">Firmar de nuevo</button>
                <a class="lp-btn lp-btn-primary" [routerLink]="['/caso', caseId]">Volver al expediente</a>
              </div>
              <p class="pf-muted sign-note">Al subir de nuevo, el documento anterior se reemplaza.</p>
            </section>
          }
        </div>
      }
    </app-product-flow-shell>
  `,
  styles: [`
    .sign-steps {
      display: flex;
      gap: 0.5rem;
      list-style: none;
      padding: 0;
      margin: 0 0 1.5rem;
      flex-wrap: wrap;
    }
    .sign-steps li {
      flex: 1;
      min-width: 7rem;
      text-align: center;
      font-size: 0.82rem;
      font-weight: 600;
      padding: 0.55rem 0.75rem;
      border-radius: 999px;
      background: var(--lp-bg-soft, #f5f5f5);
      color: var(--lp-ink-muted, #666);
      border: 1px solid var(--lp-border, #e5e5e5);
    }
    .sign-steps li.active {
      background: var(--lp-accent-soft);
      color: var(--lp-accent-deep);
      border-color: var(--lp-accent);
    }
    .sign-steps li.done {
      background: white;
      color: var(--lp-accent-deep);
    }
    .sign-layout {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      align-items: start;
    }
    @media (max-width: 900px) {
      .sign-layout { grid-template-columns: 1fr; }
    }
    .sign-section-head {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      margin-bottom: 0.5rem;
    }
    .sign-section-head h2 {
      margin: 0;
      font-size: 1.15rem;
    }
    .sign-frame {
      min-height: 360px;
      margin-top: 0.75rem;
    }
    .sign-actions {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
      margin-top: 1.25rem;
    }
    .sign-feedback { margin-top: 0.75rem; }
    .sign-receipt { margin: 1rem 0; }
    .sign-evidence {
      display: flex;
      gap: 1.25rem;
      align-items: flex-start;
      flex-wrap: wrap;
      margin: 1rem 0;
      padding: 1rem;
      border: 1px solid var(--lp-border);
      border-radius: var(--lp-radius-sm);
      background: #fafafa;
    }
    .sign-thumb {
      max-width: 200px;
      max-height: 100px;
      object-fit: contain;
      border-radius: 8px;
      border: 1px solid var(--lp-border);
      background: white;
      padding: 0.5rem;
    }
    .sign-meta {
      margin: 0;
      display: grid;
      gap: 0.5rem;
      font-size: 0.88rem;
    }
    .sign-meta dt {
      font-weight: 600;
      color: var(--lp-ink-muted);
      margin: 0;
    }
    .sign-meta dd { margin: 0.15rem 0 0; }
    .sign-note { margin-top: 1rem; font-size: 0.85rem; }
    .sign-blocked .lp-btn { margin-top: 1rem; display: inline-flex; }
  `],
})
export class SignComponent implements OnInit {
  caseId = 0;
  minutaUrl: SafeResourceUrl | null = null;
  busy = false;
  error = '';
  signature: any = null;
  theme = productThemeFromCase();
  signBlocked = '';
  signHint = '';
  mode: SignMode = 'upload';
  selectedFile: File | null = null;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private sanitizer: DomSanitizer,
  ) {}

  ngOnInit(): void {
    this.caseId = Number(this.route.snapshot.paramMap.get('id'));
    this.api.getCase(this.caseId).subscribe((d) => {
      this.theme = productThemeFromCase(d.case?.product);
      this.signHint = d.case?.sign_hint || '';
      if (!d.case?.can_sign) {
        this.signBlocked = d.case?.has_minuta
          ? 'La firma aún no está habilitada para este expediente.'
          : 'Tu abogado aún prepara la minuta. Te avisaremos cuando puedas firmar.';
      }
    });
    this.api.listOutputs(this.caseId).subscribe((outs) => {
      const m = outs.find((o: any) => o.output_type === 'minuta');
      if (m?.url) this.minutaUrl = this.sanitizer.bypassSecurityTrustResourceUrl(m.url);
    });
    this.api.listSignatures(this.caseId).subscribe((sigs) => {
      if (sigs?.length) {
        this.signature = sigs[0];
        this.mode = 'done';
      }
    });
  }

  onFile(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
    this.error = '';
  }

  isPdf(url: string): boolean {
    return /\.pdf(\?|$)/i.test(url || '');
  }

  startReupload(): void {
    this.mode = 'upload';
    this.selectedFile = null;
    this.error = '';
  }

  submit(): void {
    if (!this.selectedFile) return;
    this.busy = true;
    this.error = '';
    this.api.sign(this.caseId, this.selectedFile).subscribe({
      next: (res) => {
        this.busy = false;
        this.signature = res;
        this.mode = 'done';
        this.selectedFile = null;
      },
      error: (e) => {
        this.busy = false;
        this.error = e?.error?.error || 'Error al enviar el documento';
      },
    });
  }
}
