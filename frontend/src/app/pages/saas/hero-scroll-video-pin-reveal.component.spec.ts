import { signal } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AuthService } from '../../core/auth.service';
import { HeroScrollVideoPinRevealComponent } from './hero-scroll-video-pin-reveal.component';

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

describe('HeroScrollVideoPinRevealComponent', () => {
  let fixture: ComponentFixture<HeroScrollVideoPinRevealComponent>;

  afterEach(() => {
    if (fixture && !fixture.componentRef.hostView.destroyed) fixture.destroy();
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    TestBed.resetTestingModule();
  });

  describe('con movimiento', () => {
    const rafPending = new Map<number, FrameRequestCallback>();
    let rafSeq = 0;

    function flushScheduledFrames(): void {
      const queued = [...rafPending.entries()];
      rafPending.clear();
      for (const [, callback] of queued) {
        callback(0);
      }
    }

    beforeEach(async () => {
      rafPending.clear();
      rafSeq = 0;
      spyOn(window, 'matchMedia').and.returnValue(motionQuery(false));
      spyOn(window, 'requestAnimationFrame').and.callFake((callback: FrameRequestCallback) => {
        rafSeq += 1;
        rafPending.set(rafSeq, callback);
        return rafSeq;
      });
      spyOn(window, 'cancelAnimationFrame').and.callFake((id: number) => {
        rafPending.delete(id);
      });
      await configureHero();
      fixture = TestBed.createComponent(HeroScrollVideoPinRevealComponent);
    });

    it('no inicializa GSAP ni refresca ScrollTrigger si se destruye antes del frame', fakeAsync(() => {
      const refreshSpy = spyOn(ScrollTrigger, 'refresh');

      fixture.detectChanges();
      fixture.destroy();
      flushScheduledFrames();
      flushScheduledFrames();
      tick(100);

      expect(refreshSpy).not.toHaveBeenCalled();
      expect(ScrollTrigger.getAll().length).toBe(0);
    }));

    it('no deja las palabras del H1 en opacity 0 si el reveal no arranca', fakeAsync(() => {
      spyOn(ScrollTrigger, 'refresh').and.stub();

      fixture.detectChanges();
      flushScheduledFrames();
      flushScheduledFrames();

      const words = Array.from(
        (fixture.nativeElement as HTMLElement).querySelectorAll('.reveal-word'),
      ) as HTMLElement[];

      expect(words.length).toBeGreaterThan(0);
      for (const word of words) {
        expect(word.style.opacity).not.toBe('0');
        expect(Number(getComputedStyle(word).opacity)).toBeGreaterThan(0);
      }

      fixture.destroy();
      tick(100);
      expect(ScrollTrigger.getAll().length).toBe(0);
    }));
  });

  describe('según viewport', () => {
    const rafPending = new Map<number, FrameRequestCallback>();
    let rafSeq = 0;

    function flushScheduledFrames(): void {
      const queued = [...rafPending.entries()];
      rafPending.clear();
      for (const [, callback] of queued) {
        callback(0);
      }
    }

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
      rafPending.clear();
      rafSeq = 0;
      spyOn(window, 'matchMedia').and.callFake((q: string) => mediaFor(q, activeQuery));
      spyOn(window, 'requestAnimationFrame').and.callFake((callback: FrameRequestCallback) => {
        rafSeq += 1;
        rafPending.set(rafSeq, callback);
        return rafSeq;
      });
      spyOn(window, 'cancelAnimationFrame').and.callFake((id: number) => {
        rafPending.delete(id);
      });
      await configureHero();
      fixture = TestBed.createComponent(HeroScrollVideoPinRevealComponent);
    }

    it('arma trigger con pin en desktop y lo limpia al destruir', fakeAsync(async () => {
      await mountWith('(min-width: 1024px)');
      fixture.detectChanges();
      flushScheduledFrames();
      flushScheduledFrames();
      tick(100);

      expect(ScrollTrigger.getAll().length).toBeGreaterThan(0);
      const pinned = ScrollTrigger.getAll().some((t) => !!t.pin);
      expect(pinned).toBeTrue();

      fixture.destroy();
      tick(100);
      expect(ScrollTrigger.getAll().length).toBe(0);
    }));

    it('en móvil anima el expediente sin pin largo', fakeAsync(async () => {
      await mountWith('(max-width: 639.9px)');
      fixture.detectChanges();
      flushScheduledFrames();
      flushScheduledFrames();
      tick(100);

      const mock = (fixture.nativeElement as HTMLElement).querySelector('.hsvr-mock');
      expect(mock).not.toBeNull();
      const pinned = ScrollTrigger.getAll().some((t) => !!t.pin);
      expect(pinned).toBeFalse();

      fixture.destroy();
      tick(100);
      expect(ScrollTrigger.getAll().length).toBe(0);
    }));
  });
});
