import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface ConfirmRequest {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  prompt?: boolean;
  resolve: (ok: boolean, text?: string) => void;
}

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  private req$ = new Subject<ConfirmRequest | null>();
  readonly requests$ = this.req$.asObservable();

  confirm(message: string, title = 'Confirmar acción'): Promise<boolean> {
    return new Promise((resolve) => {
      this.req$.next({
        title,
        message,
        resolve: (ok) => resolve(ok),
      });
    });
  }

  prompt(message: string, title = 'Ingresar texto'): Promise<string | null> {
    return new Promise((resolve) => {
      this.req$.next({
        title,
        message,
        prompt: true,
        confirmLabel: 'Aceptar',
        resolve: (ok, text) => resolve(ok && text ? text : null),
      });
    });
  }
}
