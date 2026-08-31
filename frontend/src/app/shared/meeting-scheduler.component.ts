import {
  Component, EventEmitter, Input, OnInit, Output, inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { AuthService } from '../core/auth.service';
import { ScheduledMeetingCardComponent } from './scheduled-meeting-card.component';

@Component({
  selector: 'app-meeting-scheduler',
  standalone: true,
  imports: [FormsModule, ScheduledMeetingCardComponent],
  template: `
    @if (scheduledAt) {
      <app-scheduled-meeting-card [scheduledAt]="scheduledAt" [subtitle]="scheduledSubtitle" />
    } @else {
      <div class="meet-schedule">
        <div class="pf-field">
          <label [attr.for]="inputId">{{ dateLabel }}</label>
          <input
            [id]="inputId"
            type="datetime-local"
            [(ngModel)]="value"
            [min]="minDateTime"
            [disabled]="busy"
          />
        </div>
        <button
          type="button"
          class="lp-btn lp-btn-primary"
          (click)="onConfirm($event)"
          [disabled]="!value || busy || isPast"
        >
          {{ busy ? 'Guardando…' : confirmLabel }}
        </button>
        @if (isPast && value) {
          <p class="meet-err">Elige una fecha y hora futura.</p>
        }
        @if (errorMsg) {
          <p class="meet-err">{{ errorMsg }}</p>
        }
      </div>
    }
  `,
  styles: [`
    .meet-schedule { display: grid; gap: var(--space-3); }
    .meet-err { margin: 0; font-size: var(--text-sm); color: var(--danger); }
  `],
})
export class MeetingSchedulerComponent implements OnInit {
  @Input() dateLabel = 'Fecha y hora';
  @Input() confirmLabel = 'Confirmar cita';
  @Input() busy = false;
  @Input() storageKey = '';
  @Input() scheduledSubtitle = '';
  @Input() requireLogin = false;
  @Input() authReturnUrl = '/cuestionario?resume=result';
  @Input() authProduct = 'divorcio360';
  /** Función opcional de guardado; si falla, se persiste en demo local. */
  @Input() saveFn: ((at: string) => Observable<unknown>) | null = null;
  @Output() scheduled = new EventEmitter<string>();

  value = '';
  scheduledAt = '';
  errorMsg = '';
  inputId = `meet-at-${Math.random().toString(36).slice(2, 9)}`;

  private auth = inject(AuthService);
  private router = inject(Router);
  private modalEl: HTMLDivElement | null = null;

  ngOnInit(): void {
    if (this.storageKey) {
      const saved = sessionStorage.getItem(this.storageKey);
      if (saved) this.scheduledAt = saved;
    }
  }

  get minDateTime(): string {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  }

  get isPast(): boolean {
    if (!this.value) return false;
    return new Date(this.value).getTime() < Date.now();
  }

  onConfirm(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.errorMsg = '';
    if (!this.value || this.isPast || this.busy) return;

    const when = new Date(this.value).toISOString();

    if (this.requireLogin && !this.auth.isLoggedIn) {
      sessionStorage.setItem('d360_pending_meeting', when);
      if (this.storageKey) sessionStorage.setItem(`${this.storageKey}_pending`, when);
      void this.router.navigate(['/auth'], {
        queryParams: {
          returnUrl: this.authReturnUrl,
          mode: 'login',
          product: this.authProduct,
        },
      });
      return;
    }

    this.busy = true;
    const request$ = this.saveFn ? this.saveFn(when) : of(null);

    request$.pipe(
      catchError(() => of(null)),
      finalize(() => { this.busy = false; }),
    ).subscribe(() => this.completeSave(when));
  }

  private completeSave(when: string): void {
    this.scheduledAt = when;
    this.value = '';
    if (this.storageKey) sessionStorage.setItem(this.storageKey, when);
    sessionStorage.removeItem('d360_pending_meeting');
    sessionStorage.removeItem(`${this.storageKey}_pending`);
    this.scheduled.emit(when);
    this.openModal();
  }

  /** Restaurar cita pendiente tras login (llamar desde padre). */
  tryPendingSave(saveFn: (at: string) => Observable<unknown>): void {
    const pending = sessionStorage.getItem('d360_pending_meeting')
      || (this.storageKey ? sessionStorage.getItem(`${this.storageKey}_pending`) : null);
    if (!pending || this.scheduledAt) return;
    this.busy = true;
    saveFn(pending).pipe(
      catchError(() => of(null)),
      finalize(() => { this.busy = false; }),
    ).subscribe(() => this.completeSave(pending));
  }

  private openModal(): void {
    this.closeModal();
    const backdrop = document.createElement('div');
    backdrop.className = 'meet-modal-backdrop';
    backdrop.setAttribute('role', 'dialog');
    backdrop.setAttribute('aria-modal', 'true');
    backdrop.innerHTML = `
      <div class="meet-modal pf-card">
        <h3>Cita registrada</h3>
        <p>Su fecha se registró, espere el link de la reunión en su correo.</p>
        <button type="button" class="lp-btn lp-btn-primary meet-modal-ok">Entendido</button>
      </div>
    `;
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) this.closeModal();
    });
    backdrop.querySelector('.meet-modal-ok')?.addEventListener('click', () => this.closeModal());
    document.body.appendChild(backdrop);
    this.modalEl = backdrop;
    document.body.style.overflow = 'hidden';
  }

  closeModal(): void {
    if (this.modalEl) {
      this.modalEl.remove();
      this.modalEl = null;
    }
    document.body.style.overflow = '';
  }

  setScheduled(at: string): void {
    this.scheduledAt = at;
    if (this.storageKey) sessionStorage.setItem(this.storageKey, at);
  }
}
