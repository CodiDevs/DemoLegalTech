import { signal } from '@angular/core';
import { ViewportScroller } from '@angular/common';
import { Router } from '@angular/router';
import { EMPTY } from 'rxjs';
import { ApiService } from '../core/api.service';
import { AuthService, User } from '../core/auth.service';
import { getProductSite } from '../shared/product-sites.data';
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

  it('mantiene solo Ingresar como acción guest en el header', () => {
    const guest = makeShell(null);

    expect(guest.guestActions.map(({ label, path }) => ({ label, path }))).toEqual([
      { label: 'Ingresar', path: '/auth' },
    ]);
    expect(guest.guestActions[0].query).toBeUndefined();
    expect(guest.divorcioFormAction).toBeNull();
  });

  it('no muestra Iniciar Formulario en el header al cliente', () => {
    const client = makeShell('cliente');
    expect(client.divorcioFormAction).toBeNull();
  });

  it('oculta Iniciar Formulario a abogado y notario', () => {
    expect(makeShell('abogado').divorcioFormAction).toBeNull();
    expect(makeShell('notario').divorcioFormAction).toBeNull();
  });

  it('en /cliente usa marca LegalStation y sin Iniciar Formulario', () => {
    const client = makeShell('cliente');
    (client as unknown as { router: Router }).router = { url: '/cliente', events: EMPTY } as unknown as Router;
    client.isDivorcioMarketing = false;
    client.isLegalStationMarketing = false;
    client.isDivorcioFlow = false;

    expect(client.isClientPanel).toBeTrue();
    expect(client.brand).toEqual({
      home: '/',
      name: 'LegalStation',
      sub: '',
      mark: 'logo',
    });
    expect(client.divorcioFormAction).toBeNull();
    expect(client.navLinks.map((l) => l.label)).toEqual([
      'Inicio',
      'Cómo funciona',
      'Precios',
    ]);
    expect(client.navLinks[0].path).toBe('/');
  });

  it('en cualquier producto la marca del header es LegalStation', () => {
    const client = makeShell('cliente');
    client.isDivorcioMarketing = false;
    client.isTrasladoMarketing = true;
    client.isLegalStationMarketing = false;
    client.isProductLanding = true;
    client.isDivorcioFlow = false;
    client.activeProduct = 'traslado360';
    client.productSite = getProductSite('traslado360');

    expect(client.brand).toEqual({
      home: '/',
      name: 'LegalStation',
      sub: '',
      mark: 'logo',
    });
    expect(client.navLinks.map((l) => l.label)).toEqual([
      'Inicio',
      'Cómo funciona',
      'Precios',
    ]);
    expect(client.divorcioFormAction).toBeNull();
  });
  it('en flujo compartido también mantiene LegalStation', () => {
    const client = makeShell('cliente');
    client.isDivorcioMarketing = false;
    client.isLegalStationMarketing = false;
    client.isProductLanding = false;
    client.isDivorcioFlow = true;
    client.activeProduct = 'traslado360';
    client.productSite = getProductSite('traslado360');

    expect(client.isProductContext).toBeTrue();
    expect(client.brand).toEqual({
      home: '/',
      name: 'LegalStation',
      sub: '',
      mark: 'logo',
    });
  });
  it('el pie de marketing no afirma mismo costo y no es ALL-CAPS de demo', () => {
    const marketing = makeShell(null);
    expect(marketing.showSiteFooter).toBeTrue();

    const productLanding = makeShell(null);
    productLanding.isDivorcioMarketing = false;
    productLanding.isProductLanding = true;
    productLanding.isDivorcioFlow = false;
    productLanding.activeProduct = 'traslado360';
    expect(productLanding.showSiteFooter).toBeTrue();

    const flow = makeShell(null);
    flow.isDivorcioFlow = true;
    expect(flow.showSiteFooter).toBeFalse();
  });

  it('en /abogado oculta nav y pie de marketing y la marca vuelve a la bandeja', () => {
    const lawyer = makeShell('abogado');
    (lawyer as unknown as { router: Router }).router = {
      url: '/abogado',
      events: EMPTY,
    } as unknown as Router;

    expect(lawyer.isLawyerWorkspace).toBeTrue();
    expect(lawyer.showProductSwitcher).toBeFalse();
    expect(lawyer.navLinks).toEqual([]);
    expect(lawyer.showSiteFooter).toBeFalse();
    expect(lawyer.brand.home).toBe('/abogado');
  });

  it('trata /abogado/caso/:id como workspace', () => {
    const lawyer = makeShell('abogado');
    (lawyer as unknown as { router: Router }).router = {
      url: '/abogado/caso/6?tab=docs',
      events: EMPTY,
    } as unknown as Router;

    expect(lawyer.isLawyerWorkspace).toBeTrue();
    expect(lawyer.navLinks).toEqual([]);
    expect(lawyer.showSiteFooter).toBeFalse();
  });
});