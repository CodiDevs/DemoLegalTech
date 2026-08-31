import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { ProductFlowShellComponent } from '../../shared/product-flow-shell.component';
import { productThemeFromCase } from '../../shared/product-sites.data';

type SignMode = 'draw' | 'done';

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
      subtitle="Revisa el documento, firma en el lienzo y envía — 100% virtual, con evidencia de fecha e IP."
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
          <li [class.active]="mode === 'draw'" [class.done]="mode === 'done'">Firmar</li>
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

          @if (mode === 'draw') {
            <section class="pf-card lp-lift sign-pad-wrap">
              <div class="sign-section-head">
                <span class="pf-badge">Paso 2</span>
                <h2>Tu firma</h2>
              </div>
              <p class="pf-muted">Dibuja tu firma con el mouse o el dedo en el recuadro.</p>
              <div class="sign-pad-box" [class.has-ink]="hasInk">
                @if (!hasInk) {
                  <span class="sign-pad-hint">Firma aquí</span>
                }
                <canvas #pad width="640" height="200"
                  (mousedown)="start($event)" (mousemove)="draw($event)"
                  (mouseup)="stop()" (mouseleave)="stop()"
                  (touchstart)="touchStart($event)" (touchmove)="touchMove($event)" (touchend)="stop()"></canvas>
              </div>
              <div class="sign-actions">
                <button class="lp-btn lp-btn-outline" type="button" (click)="clearPad()">Limpiar lienzo</button>
                <button class="lp-btn lp-btn-primary" type="button" (click)="submit()" [disabled]="busy || !hasInk">
                  {{ busy ? 'Enviando…' : 'Enviar firma' }}
                </button>
              </div>
              @if (error) { <p class="pf-err sign-feedback">{{ error }}</p> }
            </section>
          } @else {
            <section class="pf-card lp-lift sign-done">
              <div class="sign-section-head">
                <span class="pf-badge">Paso 3</span>
                <h2>Firma registrada</h2>
              </div>
              <div class="pf-receipt sign-receipt">
                <p class="pf-ok">Tu firma fue enviada correctamente.</p>
                <p class="pf-muted">El abogado la revisará y confirmará para continuar a notaría virtual.</p>
              </div>
              @if (signature) {
                <div class="sign-evidence">
                  <img [src]="signature.image_url" alt="Tu firma" class="sign-thumb" />
                  <dl class="sign-meta">
                    <div><dt>Fecha</dt><dd>{{ signature.signed_at }}</dd></div>
                    <div><dt>IP</dt><dd>{{ signature.ip }}</dd></div>
                  </dl>
                </div>
              }
              <div class="sign-actions">
                <button class="lp-btn lp-btn-outline" type="button" (click)="startRedraw()">Firmar de nuevo</button>
                <a class="lp-btn lp-btn-primary" [routerLink]="['/caso', caseId]">Volver al expediente</a>
              </div>
              <p class="pf-muted sign-note">Al firmar de nuevo, la firma anterior se reemplaza (mock demo).</p>
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
    .sign-pad-box {
      position: relative;
      margin-top: 0.75rem;
      border: 2px dashed var(--lp-border, #d0d0d0);
      border-radius: var(--lp-radius-sm, 10px);
      background: linear-gradient(180deg, #fafafa, #fff);
      overflow: hidden;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .sign-pad-box.has-ink {
      border-color: var(--lp-accent);
      border-style: solid;
      box-shadow: inset 0 0 0 1px var(--lp-accent-soft);
    }
    .sign-pad-hint {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--lp-ink-muted, #999);
      font-size: 1.1rem;
      pointer-events: none;
      user-select: none;
    }
    .sign-pad-box canvas {
      display: block;
      width: 100%;
      height: auto;
      cursor: crosshair;
      touch-action: none;
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
export class SignComponent implements OnInit, AfterViewInit {
  @ViewChild('pad') padRef!: ElementRef<HTMLCanvasElement>;
  caseId = 0;
  minutaUrl: SafeResourceUrl | null = null;
  private ctx!: CanvasRenderingContext2D;
  private drawing = false;
  busy = false;
  error = '';
  signature: any = null;
  theme = productThemeFromCase();
  signBlocked = '';
  signHint = '';
  mode: SignMode = 'draw';
  hasInk = false;

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

  ngAfterViewInit(): void {
    this.initCanvas();
  }

  private initCanvas(): void {
    if (!this.padRef?.nativeElement) return;
    const canvas = this.padRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.ctx.strokeStyle = '#1a2a33';
    this.ctx.lineWidth = 2.5;
    this.ctx.lineCap = 'round';
  }

  start(e: MouseEvent): void {
    this.drawing = true;
    this.hasInk = true;
    this.ctx.beginPath();
    this.ctx.moveTo(e.offsetX, e.offsetY);
  }

  draw(e: MouseEvent): void {
    if (!this.drawing) return;
    this.hasInk = true;
    this.ctx.lineTo(e.offsetX, e.offsetY);
    this.ctx.stroke();
  }

  stop(): void { this.drawing = false; }

  touchStart(e: TouchEvent): void {
    e.preventDefault();
    this.hasInk = true;
    const p = this.touchPos(e);
    this.drawing = true;
    this.ctx.beginPath();
    this.ctx.moveTo(p.x, p.y);
  }

  touchMove(e: TouchEvent): void {
    e.preventDefault();
    if (!this.drawing) return;
    this.hasInk = true;
    const p = this.touchPos(e);
    this.ctx.lineTo(p.x, p.y);
    this.ctx.stroke();
  }

  private touchPos(e: TouchEvent): { x: number; y: number } {
    const rect = this.padRef.nativeElement.getBoundingClientRect();
    const t = e.touches[0];
    return { x: t.clientX - rect.left, y: t.clientY - rect.top };
  }

  clearPad(): void {
    const c = this.padRef.nativeElement;
    this.ctx.clearRect(0, 0, c.width, c.height);
    this.hasInk = false;
    this.error = '';
  }

  startRedraw(): void {
    this.mode = 'draw';
    this.error = '';
    setTimeout(() => this.initCanvas());
  }

  submit(): void {
    if (!this.hasInk) return;
    this.busy = true;
    this.error = '';
    const data = this.padRef.nativeElement.toDataURL('image/png');
    this.api.sign(this.caseId, data).subscribe({
      next: (res) => {
        this.busy = false;
        this.signature = res;
        this.mode = 'done';
        this.hasInk = false;
      },
      error: (e) => {
        this.busy = false;
        this.error = e?.error?.error || 'Error al enviar la firma';
      },
    });
  }
}
