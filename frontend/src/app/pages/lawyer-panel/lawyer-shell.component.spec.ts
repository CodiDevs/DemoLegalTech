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
  it('marca Bandeja activa en el expediente', () => {
    expect(makeShell('/abogado').bandejaOn).toBeTrue();
    expect(makeShell('/abogado/caso/6').bandejaOn).toBeTrue();
    expect(makeShell('/abogado/servicios').bandejaOn).toBeFalse();
    expect(makeShell('/abogado/fase2/admin').bandejaOn).toBeFalse();
  });
});
