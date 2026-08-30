import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmRequest, ConfirmService } from '../core/confirm.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [FormsModule],
  template: `
    @if (req) {
      <div class="backdrop" (click)="cancel()">
        <div class="panel" (click)="$event.stopPropagation()">
          <h2>{{ req.title }}</h2>
          @if (req.prompt) {
            <p class="muted">{{ req.message }}</p>
            <textarea rows="4" [(ngModel)]="inputText"></textarea>
          } @else {
            <p>{{ req.message }}</p>
          }
          <div class="actions">
            <button type="button" class="btn btn-ghost" (click)="cancel()">{{ req.cancelLabel || 'Cancelar' }}</button>
            <button type="button" class="btn btn-primary" (click)="ok()">{{ req.confirmLabel || 'Confirmar' }}</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .backdrop {
      position: fixed; inset: 0; background: oklch(0.15 0.02 230 / 0.5);
      display: grid; place-items: center; z-index: 100; padding: 1rem;
    }
    .panel { max-width: 440px; width: 100%; background: white; border-radius: var(--radius); padding: 1.5rem; box-shadow: var(--shadow); }
    .panel h2 { margin-top: 0; font-size: 1.2rem; }
    textarea { width: 100%; margin: 0.75rem 0; }
    .actions { display: flex; gap: 0.5rem; justify-content: flex-end; margin-top: 1rem; }
  `]
})
export class ConfirmDialogComponent implements OnInit, OnDestroy {
  req: ConfirmRequest | null = null;
  inputText = '';
  private sub?: Subscription;

  constructor(private confirm: ConfirmService) {}

  ngOnInit(): void {
    this.sub = this.confirm.requests$.subscribe((r) => {
      this.req = r;
      this.inputText = '';
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  cancel(): void {
    this.req?.resolve(false);
    this.req = null;
  }

  ok(): void {
    if (this.req?.prompt && !this.inputText.trim()) return;
    this.req?.resolve(true, this.inputText.trim());
    this.req = null;
  }
}
