import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AuthService } from '../../core/auth.service';
import { HeroScrollVideoPinRevealComponent } from './hero-scroll-video-pin-reveal.component';

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

describe('HeroScrollVideoPinRevealComponent', () => {
  let fixture: ComponentFixture<HeroScrollVideoPinRevealComponent>;

  beforeEach(async () => {
    spyOn(window, 'matchMedia').and.returnValue(reducedMotionQuery());

    await TestBed.configureTestingModule({
      imports: [HeroScrollVideoPinRevealComponent],
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

    fixture = TestBed.createComponent(HeroScrollVideoPinRevealComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    if (!fixture.componentRef.hostView.destroyed) fixture.destroy();
  });

  it('renderiza un único H1 y la acción primaria en el primer bloque', () => {
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelectorAll('h1').length).toBe(1);
    expect(root.querySelector('.hsvr-intro')).toBeNull();
    expect(root.querySelector('.hsvr-tags')).toBeNull();
    expect(root.querySelector('.hsvr-btn-primary')?.getAttribute('href')).toBe('/cuestionario');
  });

  it('no consulta ni destruye ScrollTriggers globales al desmontarse', () => {
    const getAllSpy = spyOn(ScrollTrigger, 'getAll').and.callThrough();

    fixture.destroy();

    expect(getAllSpy).not.toHaveBeenCalled();
  });
});
