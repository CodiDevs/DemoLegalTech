import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { DivorcioLandingComponent } from './divorcio-landing.component';

function reducedMotionQuery(): MediaQueryList {
  return {
    matches: true,
    media: '(prefers-reduced-motion: reduce)',
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => true,
  };
}

describe('DivorcioLandingComponent', () => {
  let fixture: ComponentFixture<DivorcioLandingComponent>;

  beforeEach(async () => {
    spyOn(window, 'matchMedia').and.returnValue(reducedMotionQuery());

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

  it('renderiza una sola demostración del expediente', () => {
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
});
