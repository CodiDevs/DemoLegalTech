import { Component, Input, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-animated-ticket',
  standalone: true,
  imports: [DecimalPipe],
  template: `
    @if (showConfetti) {
      <div class="confetti-layer" aria-hidden="true">
        @for (piece of confettiPieces; track $index) {
          <span class="confetti-piece" [style]="piece"></span>
        }
      </div>
    }

      <div class="ticket animate-in">
      <div class="ticket-notch ticket-notch-left"></div>
      <div class="ticket-notch ticket-notch-right"></div>

      @if (!receiptOnly) {
        <div class="ticket-head">
          <div class="ticket-icon-wrap">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h2>¡Gracias!</h2>
          <p class="ticket-sub">Tu comprobante se emitió correctamente</p>
        </div>
      }

      <div class="ticket-body" [class.ticket-body-only]="receiptOnly">
        <div class="dashed"></div>

        <div class="ticket-row">
          <div>
            <p class="label">Referencia</p>
            <p class="value mono">{{ ticketId }}</p>
          </div>
          <div class="text-right">
            <p class="label">Monto</p>
            <p class="value amount">\${{ amount | number:'1.2-2' }} USD</p>
          </div>
        </div>

        <div>
          <p class="label">Fecha y hora</p>
          <p class="value">{{ formattedDate }}</p>
        </div>

        <div class="card-row">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="24" aria-hidden="true">
            <circle cx="8" cy="12" r="7" fill="#EA001B"></circle>
            <circle cx="16" cy="12" r="7" fill="#F79E1B" fill-opacity="0.8"></circle>
          </svg>
          <div>
            <p class="value">{{ cardHolder }}</p>
            <p class="muted mono">•••• {{ last4Digits }}</p>
          </div>
        </div>

        <div class="dashed"></div>

        <div class="barcode-wrap">
          <svg [attr.viewBox]="'0 0 ' + svgWidth + ' ' + svgHeight" [attr.width]="svgWidth" [attr.height]="svgHeight" aria-label="Código de barras">
            @for (bar of bars; track $index) {
              <rect [attr.x]="bar.x" y="10" [attr.width]="bar.width" height="50" />
            }
          </svg>
          <p class="barcode-text">{{ barcodeValue }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      position: relative;
      width: 100%;
      max-width: 22rem;
    }

    @keyframes ticket-in {
      from { opacity: 0; transform: scale(0.96) translateY(8px); }
      to { opacity: 1; transform: none; }
    }

    @keyframes fall {
      0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
      100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
    }

    .animate-in { animation: ticket-in 0.5s ease; }

    .confetti-layer {
      position: fixed;
      inset: 0;
      z-index: 9995;
      pointer-events: none;
      overflow: hidden;
    }

    .confetti-piece {
      position: absolute;
      width: 0.5rem;
      height: 1rem;
      animation: fall linear forwards;
    }

    .ticket {
      position: relative;
      z-index: 1;
      width: 100%;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-lg);
      overflow: visible;
    }

    .ticket-notch {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 2rem;
      height: 2rem;
      border-radius: 50%;
      background: var(--surface);
    }

    .ticket-notch-left { left: -1rem; }
    .ticket-notch-right { right: -1rem; }

    .ticket-body-only {
      padding-top: var(--space-6);
    }

    .ticket-head {
      padding: var(--space-6) var(--space-6) var(--space-4);
      text-align: center;
    }

    .ticket-icon-wrap {
      display: inline-grid;
      place-items: center;
      padding: var(--space-3);
      border-radius: var(--radius-full);
      background: color-mix(in srgb, var(--primary) 12%, transparent);
      color: var(--primary);
    }

    .ticket-head h2 {
      margin: var(--space-4) 0 var(--space-1);
      font-size: var(--text-2xl);
      font-weight: 650;
    }

    .ticket-sub {
      margin: 0;
      font-size: var(--text-sm);
      color: var(--text-secondary);
    }

    .ticket-body {
      padding: 0 var(--space-6) var(--space-6);
      display: grid;
      gap: var(--space-4);
    }

    .dashed {
      border-top: 2px dashed var(--border);
    }

    .ticket-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-3);
    }

    .text-right { text-align: right; }

    .label {
      margin: 0;
      font-size: var(--text-xs);
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--text-muted);
    }

    .value {
      margin: var(--space-1) 0 0;
      font-weight: 600;
      color: var(--text);
    }

    .amount { font-size: var(--text-lg); font-variant-numeric: tabular-nums; }
    .mono { font-family: var(--font-mono, ui-monospace, monospace); }
    .muted { margin: 0; font-size: var(--text-sm); color: var(--text-secondary); letter-spacing: 0.08em; }

    .card-row {
      display: flex;
      align-items: center;
      gap: var(--space-4);
      padding: var(--space-4);
      border-radius: var(--radius-lg);
      background: var(--bg-subtle);
    }

    .barcode-wrap {
      display: grid;
      justify-items: center;
      gap: var(--space-2);
    }

    .barcode-wrap svg { fill: currentColor; color: var(--text); }

    .barcode-text {
      margin: 0;
      font-size: var(--text-sm);
      letter-spacing: 0.3em;
      color: var(--text-secondary);
    }
  `],
})
export class AnimatedTicketComponent implements OnInit {
  @Input({ required: true }) ticketId!: string;
  @Input({ required: true }) amount!: number;
  @Input({ required: true }) date!: Date;
  @Input({ required: true }) cardHolder!: string;
  @Input({ required: true }) last4Digits!: string;
  @Input({ required: true }) barcodeValue!: string;
  /** Oculta el encabezado de celebración (para modal de checkout). */
  @Input() receiptOnly = false;

  showConfetti = false;
  confettiPieces: Record<string, string>[] = [];
  svgWidth = 250;
  svgHeight = 70;
  bars: { x: number; width: number }[] = [];

  private colors = ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#8b5cf6', '#f97316'];

  ngOnInit(): void {
    this.bars = this.buildBars(this.barcodeValue);
    this.confettiPieces = Array.from({ length: 80 }, (_, i) => this.confettiStyle(i));
    setTimeout(() => { this.showConfetti = true; }, 100);
    setTimeout(() => { this.showConfetti = false; }, 6000);
  }

  get formattedDate(): string {
    return new Intl.DateTimeFormat('es-EC', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(this.date).replace(',', ' ·');
  }

  confettiStyle(i: number): Record<string, string> {
    return {
      left: `${Math.random() * 100}%`,
      top: `${-20 + Math.random() * 10}%`,
      backgroundColor: this.colors[i % this.colors.length],
      transform: `rotate(${Math.random() * 360}deg)`,
      animationDuration: `${2.5 + Math.random() * 2.5}s`,
      animationDelay: `${Math.random() * 2}s`,
    };
  }

  private buildBars(value: string): { x: number; width: number }[] {
    const hash = value.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0);
    const random = (s: number) => {
      const x = Math.sin(s) * 10000;
      return x - Math.floor(x);
    };
    const spacing = 1.5;
    const raw = Array.from({ length: 60 }).map((_, i) => {
      const w = random(hash + i) > 0.7 ? 2.5 : 1.5;
      return { width: w, x: 0 };
    });
    const total = raw.reduce((acc, b) => acc + b.width + spacing, 0) - spacing;
    let x = (this.svgWidth - total) / 2;
    return raw.map((b) => {
      const bar = { x, width: b.width };
      x += b.width + spacing;
      return bar;
    });
  }
}
