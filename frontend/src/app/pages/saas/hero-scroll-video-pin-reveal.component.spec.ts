import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AuthService } from '../../core/auth.service';
import { HeroScrollVideoPinRevealComponent, activeStepFromProgress } from './hero-scroll-video-pin-reveal.component';

function motionQuery(reduce: boolean): MediaQueryList {
  return {
    matches: reduce,
    media: '(prefers-reduced-motion: reduce)',
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => true,
  };
}

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

async function waitUntil(check: () => boolean, ms = 2500): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < ms) {
    if (check()) return;
    await new Promise((r) => setTimeout(r, 25));
  }
  throw new Error('timeout waiting for ScrollTrigger');
}

describe('activeStepFromProgress', () => {
  it('deriva el índice de etapa desde el progreso, también al revertir', () => {
    expect(activeStepFromProgress(0, 6)).toBe(0);
    expect(activeStepFromProgress(1, 6)).toBe(5);
    expect(activeStepFromProgress(0.5, 6)).toBe(3);
    expect(activeStepFromProgress(-1, 6)).toBe(0);
  });
});

describe('HeroScrollVideoPinRevealComponent', () => {
  let fixture: ComponentFixture<HeroScrollVideoPinRevealComponent>;

  afterEach(() => {
    if (fixture && !fixture.componentRef.hostView.destroyed) fixture.destroy();
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    TestBed.resetTestingModule();
  });

  describe('con movimiento', () => {
    beforeEach(async () => {
      spyOn(window, 'matchMedia').and.returnValue(motionQuery(false));
      await configureHero();
      fixture = TestBed.createComponent(HeroScrollVideoPinRevealComponent);
    });

    it('no deja ScrollTrigger si se destruye antes del boot', async () => {
      fixture.detectChanges();
      fixture.destroy();
      await new Promise((r) => setTimeout(r, 200));
      expect(ScrollTrigger.getAll().length).toBe(0);
    });

    it('no deja las palabras del H1 en opacity 0 si el reveal no arranca', () => {
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
  });

  describe('según viewport', () => {
    function mediaFor(query: string, active: string): MediaQueryList {
      return {
        matches: query === active,
        media: query,
        onchange: null,
        addListener: () => undefined,
        removeListener: () => undefined,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        dispatchEvent: () => true,
      };
    }

    async function mountWith(activeQuery: string): Promise<void> {
      spyOn(window, 'matchMedia').and.callFake((q: string) => mediaFor(q, activeQuery));
      await configureHero();
      fixture = TestBed.createComponent(HeroScrollVideoPinRevealComponent);
    }

    it('arma trigger con pin en desktop y lo limpia al destruir', async () => {
      await mountWith('(min-width: 1024px)');
      fixture.detectChanges();
      await waitUntil(() => ScrollTrigger.getAll().some((t) => !!t.pin));
      expect(ScrollTrigger.getAll().some((t) => !!t.pin)).toBeTrue();

      fixture.destroy();
      await new Promise((r) => setTimeout(r, 50));
      expect(ScrollTrigger.getAll().length).toBe(0);
    });

    it('en móvil anima el expediente sin pin largo', async () => {
      await mountWith('(max-width: 639.9px)');
      fixture.detectChanges();
      await waitUntil(() => ScrollTrigger.getAll().length > 0);
      const mock = (fixture.nativeElement as HTMLElement).querySelector('.hsvr-mock');
      expect(mock).not.toBeNull();
      expect(ScrollTrigger.getAll().some((t) => !!t.pin)).toBeFalse();

      fixture.destroy();
      await new Promise((r) => setTimeout(r, 50));
      expect(ScrollTrigger.getAll().length).toBe(0);
    });
  });
});
