import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

function homeForRole(role?: string): string {
  if (role === 'abogado') return '/abogado';
  if (role === 'notario') return '/notario';
  return '/cliente';
}

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isLoggedIn) return true;
  return router.createUrlTree(['/auth']);
};

export const roleGuard = (role: 'cliente' | 'abogado' | 'notario'): CanActivateFn => {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const u = auth.user();
    if (auth.isLoggedIn && u?.role === role) return true;
    if (auth.isLoggedIn) {
      return router.createUrlTree([homeForRole(u?.role)]);
    }
    return router.createUrlTree(['/auth']);
  };
};

/** Allows guests and clientes; redirects abogado/notario to their panel. */
export const clienteOrGuestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const u = auth.user();
  if (auth.isLoggedIn && u?.role === 'abogado') {
    return router.createUrlTree(['/abogado']);
  }
  if (auth.isLoggedIn && u?.role === 'notario') {
    return router.createUrlTree(['/notario']);
  }
  return true;
};
