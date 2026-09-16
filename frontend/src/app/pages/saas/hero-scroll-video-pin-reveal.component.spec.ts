import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { HeroScrollVideoPinRevealComponent } from './hero-scroll-video-pin-reveal.component';

function configureHero(): Promise<void> {
  return TestBed.configureTestingModule({
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
}

describe('HeroScrollVideoPinRevealComponent', () => {
  let fixture: ComponentFixture<HeroScrollVideoPinRevealComponent>;

  afterEach(() => {
    if (fixture && !fixture.componentRef.hostView.destroyed) fixture.destroy();
    TestBed.resetTestingModule();
  });

  describe('invitado', () => {
    beforeEach(async () => {
      await configureHero();
      fixture = TestBed.createComponent(HeroScrollVideoPinRevealComponent);
    });

    it('no deja las palabras del H1 en opacity 0', () => {
      fixture.detectChanges();
      const words = Array.from(
        (fixture.nativeElement as HTMLElement).querySelectorAll('.reveal-word'),
      ) as HTMLElement[];

      expect(words.length).toBeGreaterThan(0);
      for (const word of words) {
        expect(word.style.opacity).not.toBe('0');
        expect(Number(getComputedStyle(word).opacity)).toBeGreaterThan(0);
      }
    });

    it('muestra Iniciar Formulario para invitado', () => {
      fixture.detectChanges();
      const root = fixture.nativeElement as HTMLElement;
      const labels = Array.from(root.querySelectorAll('.hsvr-cta a')).map((el) =>
        el.textContent?.trim(),
      );

      expect(labels).toEqual(['Iniciar Formulario']);
      expect(root.querySelector('.hsvr-cta-primary')?.getAttribute('href')).toBe('/cuestionario');
      expect(root.querySelector('a[href="#flujo"]')).toBeNull();
    });

    it('no pinta el mock de expediente en el hero', () => {
      fixture.detectChanges();
      const root = fixture.nativeElement as HTMLElement;
      expect(root.querySelector('.hsvr-video-box')).toBeNull();
      expect(root.querySelector('.hsvr-mock')).toBeNull();
      expect(root.textContent).not.toContain('Cada etapa, visible.');
    });
  });

  describe('como cliente', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [HeroScrollVideoPinRevealComponent],
        providers: [
          provideRouter([]),
          {
            provide: AuthService,
            useValue: {
              isLoggedIn: true,
              user: signal({
                id: 1,
                email: 'cliente@demo.ec',
                full_name: 'Carlos Demo',
                phone: '0000000000',
                role: 'cliente' as const,
              }),
            },
          },
        ],
      }).compileComponents();
      fixture = TestBed.createComponent(HeroScrollVideoPinRevealComponent);
    });

    it('pone Mis expedientes encima de Iniciar Formulario', () => {
      fixture.detectChanges();
      const root = fixture.nativeElement as HTMLElement;
      const labels = Array.from(root.querySelectorAll('.hsvr-cta a')).map((el) =>
        el.textContent?.trim(),
      );

      expect(labels).toEqual(['Mis expedientes', 'Iniciar Formulario']);
      expect(root.querySelector('.hsvr-cta-primary')?.getAttribute('href')).toBe('/cuestionario');
    });
  });
});
