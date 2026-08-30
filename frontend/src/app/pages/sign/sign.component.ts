import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';

@Component({
  selector: 'app-sign',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="shell wrap">
      <p class="badge-demo">Firma electrónica mock · evidencia IP/fecha</p>
      <h1>Firmar documentos</h1>
      <p class="muted">Dibuja tu firma. Se guarda con fecha, hora e IP (demo).</p>
      <div class="panel">
        <canvas #pad width="640" height="220" (mousedown)="start($event)" (mousemove)="draw($event)"
          (mouseup)="stop()" (mouseleave)="stop()"
          (touchstart)="touchStart($event)" (touchmove)="touchMove($event)" (touchend)="stop()"></canvas>
        <div class="actions">
          <button class="btn btn-ghost" type="button" (click)="clear()">Limpiar</button>
          <button class="btn btn-primary" type="button" (click)="submit()" [disabled]="busy">Firmar</button>
        </div>
        @if (msg) { <p class="ok">{{ msg }}</p> }
        @if (error) { <p class="err">{{ error }}</p> }
        @if (last) {
          <div class="evidence">
            <p><strong>Evidencia:</strong> {{ last.signed_at }} · IP {{ last.ip }}</p>
            <img [src]="last.image_url" alt="Firma" />
          </div>
        }
        <a class="btn btn-ghost" [routerLink]="['/caso', caseId]">Volver al expediente</a>
      </div>
    </div>
  `,
  styles: [`
    .wrap { max-width: 720px; padding-block: 2.5rem; }
    canvas {
      width: 100%; max-width: 640px; height: 220px; touch-action: none;
      border: 1px dashed var(--line); border-radius: 12px; background: oklch(0.99 0.004 220);
      display: block; cursor: crosshair;
    }
    .actions { display: flex; gap: 0.75rem; margin: 1rem 0; }
    .ok { color: var(--ok); } .err { color: var(--bad); }
    .evidence img { max-width: 280px; border: 1px solid var(--line); border-radius: 8px; background: white; }
  `]
})
export class SignComponent implements OnInit, AfterViewInit {
  @ViewChild('pad') padRef!: ElementRef<HTMLCanvasElement>;
  caseId = 0;
  private ctx!: CanvasRenderingContext2D;
  private drawing = false;
  busy = false;
  msg = '';
  error = '';
  last: any = null;

  constructor(private route: ActivatedRoute, private api: ApiService) {}

  ngOnInit(): void {
    this.caseId = Number(this.route.snapshot.paramMap.get('id'));
  }

  ngAfterViewInit(): void {
    const canvas = this.padRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.ctx.strokeStyle = '#1a2a33';
    this.ctx.lineWidth = 2.5;
    this.ctx.lineCap = 'round';
  }

  start(e: MouseEvent): void {
    this.drawing = true;
    this.ctx.beginPath();
    this.ctx.moveTo(e.offsetX, e.offsetY);
  }
  draw(e: MouseEvent): void {
    if (!this.drawing) return;
    this.ctx.lineTo(e.offsetX, e.offsetY);
    this.ctx.stroke();
  }
  stop(): void { this.drawing = false; }

  touchStart(e: TouchEvent): void {
    e.preventDefault();
    const p = this.touchPos(e);
    this.drawing = true;
    this.ctx.beginPath();
    this.ctx.moveTo(p.x, p.y);
  }
  touchMove(e: TouchEvent): void {
    e.preventDefault();
    if (!this.drawing) return;
    const p = this.touchPos(e);
    this.ctx.lineTo(p.x, p.y);
    this.ctx.stroke();
  }
  private touchPos(e: TouchEvent): { x: number; y: number } {
    const rect = this.padRef.nativeElement.getBoundingClientRect();
    const t = e.touches[0];
    return { x: t.clientX - rect.left, y: t.clientY - rect.top };
  }

  clear(): void {
    const c = this.padRef.nativeElement;
    this.ctx.clearRect(0, 0, c.width, c.height);
  }

  submit(): void {
    this.busy = true;
    this.error = '';
    const data = this.padRef.nativeElement.toDataURL('image/png');
    this.api.sign(this.caseId, data).subscribe({
      next: (res) => {
        this.busy = false;
        this.msg = 'Firma registrada';
        this.last = res;
      },
      error: (e) => {
        this.busy = false;
        this.error = e?.error?.error || 'Error al firmar';
      },
    });
  }
}
