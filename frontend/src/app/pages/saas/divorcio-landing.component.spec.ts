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
    // Reduced-motion AfterViewInit sets stepsRevealed; prime it so NG0100 does not mask assertions.
    fixture.componentInstance.stepsRevealed = true;
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  it('renderiza una sola demostración del expediente', () => {
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelectorAll('.hsvr-mock').length).toBe(1);
    expect(root.querySelector('.ps-mock-ui')).toBeNull();
    expect(root.querySelector('.clc')).toBeNull();
  });

  it('no usa enlaces hash como botones', () => {
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('a[href="#"]')).toBeNull();
  });
});
