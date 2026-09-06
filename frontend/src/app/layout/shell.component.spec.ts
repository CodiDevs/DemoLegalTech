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

  it('mantiene ingreso y evaluación como únicas acciones guest', () => {
    const guest = makeShell(null);

    expect(guest.guestActions.map(({ label, path }) => ({ label, path }))).toEqual([
      { label: 'Ingresar', path: '/auth' },
      { label: 'Evaluar mi caso', path: '/cuestionario' },
    ]);
  });
});
