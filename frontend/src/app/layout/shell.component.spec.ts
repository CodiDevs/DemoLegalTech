import { signal } from '@angular/core';
import { ViewportScroller } from '@angular/common';
import { Router } from '@angular/router';
import { EMPTY } from 'rxjs';
import { ApiService } from '../core/api.service';
import { AuthService, User } from '../core/auth.service';
import { ShellComponent } from './shell.component';

function makeShell(role: User['role'] | null): ShellComponent {
  const user = role
    ? {
        id: 1,
        email: `${role}@demo.ec`,
        full_name: role === 'cliente' ? 'Carlos Demo' : 'Operador Demo',
        phone: '0000000000',
        role,
      }
    : null;

  const auth = {
    isLoggedIn: role !== null,
    user: signal(user),
    logout: () => undefined,
  } as unknown as AuthService;

  const router = {
    url: '/productos/divorcio360',
    events: EMPTY,
  } as unknown as Router;

  const shell = new ShellComponent(
    auth,
    router,
    {} as ApiService,
    {} as ViewportScroller,
  );
  shell.isDivorcioMarketing = true;
  shell.activeProduct = 'divorcio360';
  return shell;
}

describe('ShellComponent marketing navigation', () => {
  it('no duplica acciones de cuenta dentro de la navegación de secciones', () => {
    const shell = makeShell('cliente');

    expect(shell.navLinks.map((link) => link.label)).toEqual([
      'Inicio',
      'Cómo funciona',
      'Precios',
    ]);
  });

  it('usa la misma acción primaria que la landing para cada rol', () => {
    const client = makeShell('cliente');
    const lawyer = makeShell('abogado');

    expect([client.roleHomeLabel, client.homeForRole]).toEqual([
      'Mis expedientes',
      '/cliente',
    ]);
    expect([lawyer.roleHomeLabel, lawyer.homeForRole]).toEqual([
      'Panel de casos',
      '/abogado',
    ]);
  });

  it('mantiene ingreso e Iniciar Formulario como acciones guest de Divorcio360', () => {
    const guest = makeShell(null);

    expect(guest.guestActions.map(({ label, path }) => ({ label, path }))).toEqual([
      { label: 'Ingresar', path: '/auth' },
      { label: 'Iniciar Formulario', path: '/auth' },
    ]);
    expect(guest.guestActions[1].query).toEqual({
      returnUrl: '/cuestionario',
      product: 'divorcio360',
    });
  });

  it('muestra Iniciar Formulario al cliente en el header de Divorcio360', () => {
    const client = makeShell('cliente');
    expect(client.divorcioFormAction).toEqual({
      label: 'Iniciar Formulario',
      path: '/cuestionario',
    });
  });

  it('oculta Iniciar Formulario a abogado y notario', () => {
    expect(makeShell('abogado').divorcioFormAction).toBeNull();
    expect(makeShell('notario').divorcioFormAction).toBeNull();
  });

  it('no afirma mismo costo en el pie de Divorcio360', () => {
    const marketing = makeShell(null);
    const productContext = makeShell(null);
    productContext.isDivorcioMarketing = false;
    productContext.isProductLanding = true;
    productContext.activeProduct = 'divorcio360';

    expect(marketing.footerPitch).not.toMatch(/mismo costo/i);
    expect(marketing.footerPitch.toLowerCase()).toContain('trámite en línea');
    expect(productContext.footerPitch).not.toMatch(/mismo costo/i);
    expect(productContext.footerPitch.toLowerCase()).toContain('trámite en línea');
  });

  it('conserva el slogan de LegalStation fuera de Divorcio360', () => {
    const home = makeShell(null);
    home.isDivorcioMarketing = false;
    home.isLegalStationMarketing = true;
    home.activeProduct = 'divorcio360';

    expect(home.footerPitch).toBe('Servicios jurídicos al mismo costo, sin filas ni trámites.');
  });
});
