import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isLoggedIn) return true;
  return router.createUrlTree(['/auth']);
};

export const roleGuard = (role: 'cliente' | 'abogado'): CanActivateFn => {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const u = auth.user();
    if (auth.isLoggedIn && u?.role === role) return true;
    if (auth.isLoggedIn) {
      return router.createUrlTree([u?.role === 'abogado' ? '/abogado' : '/cliente']);
    }
    return router.createUrlTree(['/auth']);
  };
};

/** Allows guests and clientes; redirects abogado to their panel. */
export const clienteOrGuestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const u = auth.user();
  if (auth.isLoggedIn && u?.role === 'abogado') {
    return router.createUrlTree(['/abogado']);
  }
  return true;
};
