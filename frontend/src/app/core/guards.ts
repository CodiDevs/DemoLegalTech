import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

function homeForRole(role?: string): string {
  if (role === 'abogado') return '/abogado';
  return '/cliente';
}

function authRedirectTree(router: Router, attemptedUrl: string) {
  return router.createUrlTree(['/auth'], { queryParams: { returnUrl: attemptedUrl } });
}

export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isLoggedIn) return true;
  return authRedirectTree(router, state.url);
};

export const roleGuard = (role: 'cliente' | 'abogado'): CanActivateFn => {
  return (_route, state) => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const u = auth.user();
    if (auth.isLoggedIn && u?.role === role) return true;
    if (auth.isLoggedIn) {
      return router.createUrlTree([homeForRole(u?.role)]);
    }
    return authRedirectTree(router, state.url);
  };
};

/** Allows guests and clientes; redirects abogado to su panel. */
export const clienteOrGuestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const u = auth.user();
  if (auth.isLoggedIn && u?.role === 'abogado') {
    return router.createUrlTree(['/abogado']);
  }
  return true;
};
