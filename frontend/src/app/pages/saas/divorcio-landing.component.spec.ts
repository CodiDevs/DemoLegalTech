import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { DivorcioLandingComponent } from './divorcio-landing.component';

describe('DivorcioLandingComponent', () => {
  let fixture: ComponentFixture<DivorcioLandingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DivorcioLandingComponent],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            isLoggedIn: false,
            user: signal(null),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DivorcioLandingComponent);
  });

  afterEach(() => fixture.destroy());

  it('no lanza NG0100 en el primer detectChanges', () => {
    expect(() => fixture.detectChanges()).not.toThrow();
  });

  it('renderiza un solo mock de expediente en el hero', () => {
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelectorAll('.hsvr-mock').length).toBe(1);
    expect(root.querySelector('.ps-mock-ui')).toBeNull();
    expect(root.querySelector('.clc')).toBeNull();
  });

  it('no usa enlaces hash como botones', () => {
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('a[href="#"]')).toBeNull();
  });

  it('no muestra una etiqueta comparativa en el plan único', () => {
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('.lp-plan-tag')).toBeNull();
  });

  it('usa la acción primaria de invitado en el plan y el CTA final', () => {
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const planCta = root.querySelector('.lp-btn-primary');
    const finalCta = root.querySelector('.lp-cta-primary');

    expect(planCta?.getAttribute('href')).toBe('/cuestionario');
    expect(planCta?.textContent?.trim()).toBe('Evaluar mi caso');
    expect(finalCta?.getAttribute('href')).toBe('/cuestionario');
    expect(finalCta?.textContent?.trim()).toBe('Evaluar mi caso');
  });

  it('ordena los capítulos y publica galería + cifras del producto', () => {
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const ids = Array.from(root.querySelectorAll('section[id]')).map((el) => el.id);
    expect(ids).toEqual(['sistema', 'flujo', 'capacidades', 'en-accion', 'precios']);
    expect(root.querySelector('app-elastic-gallery')).not.toBeNull();
    expect(root.querySelector('app-landing-statistics')).not.toBeNull();
    expect(root.textContent).toContain('6 etapas');
    expect(root.textContent).toContain('$349');
    expect(root.querySelectorAll('.eg-panel').length).toBe(2);
  });
});
