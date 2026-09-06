import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { routes } from '../../app.routes';
import { LegalPageComponent } from './legal-page.component';

describe('LegalPageComponent', () => {
  it('declara límites de la demostración en privacidad', async () => {
    await TestBed.configureTestingModule({
      imports: [LegalPageComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: { legalDocument: 'privacy' },
            },
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(LegalPageComponent);
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(text).toContain('Política de datos');
    expect(text).toContain('No ingreses datos personales reales');
    expect(text).toContain('LOPDP');
  });

  it('registra privacidad y términos dentro del shell', () => {
    const shellRoutes = routes.find((route) => route.path === '')?.children ?? [];

    expect(shellRoutes.some((route) => route.path === 'legal/privacidad')).toBeTrue();
    expect(shellRoutes.some((route) => route.path === 'legal/terminos')).toBeTrue();
  });
});
