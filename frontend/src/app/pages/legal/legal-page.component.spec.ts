import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { routes } from '../../app.routes';
import { LegalPageComponent } from './legal-page.component';

function legalRoute(kind: 'privacy' | 'terms') {
  return {
    provide: ActivatedRoute,
    useValue: {
      snapshot: {
        data: { legalDocument: kind },
      },
    },
  };
}

async function renderLegal(kind: 'privacy' | 'terms') {
  TestBed.resetTestingModule();
  await TestBed.configureTestingModule({
    imports: [LegalPageComponent],
    providers: [legalRoute(kind)],
  }).compileComponents();

  const fixture = TestBed.createComponent(LegalPageComponent);
  fixture.detectChanges();
  return fixture;
}

describe('LegalPageComponent', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('declara límites de la demostración en privacidad', async () => {
    const fixture = await renderLegal('privacy');
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(text).toContain('Política de datos');
    expect(text).toContain('No ingreses datos personales reales');
    expect(text).toContain('LOPDP');
    fixture.destroy();
  });

  it('declara límites de la demostración en términos', async () => {
    const fixture = await renderLegal('terms');
    const root = fixture.nativeElement as HTMLElement;
    const text = root.textContent ?? '';

    expect(text).toContain('Términos de uso');
    expect(text).toContain('Divorcio360 funciona aquí como demostración de producto.');
    expect(text).toContain('no constituye asesoría legal, cotización');
    expect(root.querySelector('a[href="mailto:soporte@legalstation.ec"]')).not.toBeNull();
    fixture.destroy();
  });

  it('registra privacidad y términos dentro del shell', () => {
    const shellRoutes = routes.find((route) => route.path === '')?.children ?? [];
    const privacy = shellRoutes.find((route) => route.path === 'legal/privacidad');
    const terms = shellRoutes.find((route) => route.path === 'legal/terminos');

    expect(privacy?.component).toBe(LegalPageComponent);
    expect(privacy?.data).toEqual({ legalDocument: 'privacy' });
    expect(terms?.component).toBe(LegalPageComponent);
    expect(terms?.data).toEqual({ legalDocument: 'terms' });
  });
});
