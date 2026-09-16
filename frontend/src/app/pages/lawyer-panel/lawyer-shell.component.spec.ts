import { signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, User } from '../../core/auth.service';
import { LawyerShellComponent } from './lawyer-shell.component';

function makeShell(url: string): LawyerShellComponent {
  const user: User = {
    id: 2,
    email: 'abogado@demo.ec',
    full_name: 'Dra. Ana Ruiz',
    phone: '0000000000',
    role: 'abogado',
  };
  const auth = {
    isLoggedIn: true,
    user: signal(user),
  } as unknown as AuthService;
  const router = { url } as unknown as Router;
  return new LawyerShellComponent(auth, router);
}

describe('LawyerShellComponent nav', () => {
  beforeEach(() => localStorage.removeItem('d360_lawyer_rail_pinned'));
  afterEach(() => localStorage.removeItem('d360_lawyer_rail_pinned'));

  it('marca Bandeja activa en el expediente', () => {
    expect(makeShell('/abogado').bandejaOn).toBeTrue();
    expect(makeShell('/abogado/caso/6').bandejaOn).toBeTrue();
    expect(makeShell('/abogado/servicios').bandejaOn).toBeFalse();
    expect(makeShell('/abogado/fase2/billing').bandejaOn).toBeFalse();
  });

  it('Asistente usa search, no sparkle', () => {
    const shell = makeShell('/abogado');
    shell.ngOnInit();
    const ai = shell.visibleTools.find((t) => t.path === '/abogado/fase2/ai');
    expect(ai?.icon).toBe('search');
    expect(ai?.label).toContain('Asistente');
    expect(shell.visibleTools.some((t) => t.label === 'Resumen')).toBeFalse();
  });

  it('el rail cierra al salir, también después de abrirlo', () => {
    const shell = makeShell('/abogado');
    expect(shell.railOpen).toBeFalse();
    shell.openRail();
    expect(shell.railOpen).toBeTrue();
    shell.closeRail();
    expect(shell.railOpen).toBeFalse();
  });

  it('el candado deja el rail abierto al salir', () => {
    const shell = makeShell('/abogado');
    shell.openRail();
    shell.toggleRailPin();
    expect(shell.railPinned).toBeTrue();
    shell.closeRail();
    expect(shell.railOpen).toBeTrue();

    shell.openRail();
    shell.toggleRailPin();
    expect(shell.railPinned).toBeFalse();
    shell.closeRail();
    expect(shell.railOpen).toBeFalse();
  });

  it('el candado sobrevive un reload', () => {
    const shell = makeShell('/abogado');
    shell.ngOnInit();
    shell.toggleRailPin();
    expect(localStorage.getItem('d360_lawyer_rail_pinned')).toBe('1');

    const again = makeShell('/abogado');
    again.ngOnInit();
    expect(again.railPinned).toBeTrue();
    expect(again.railOpen).toBeTrue();
  });
});
