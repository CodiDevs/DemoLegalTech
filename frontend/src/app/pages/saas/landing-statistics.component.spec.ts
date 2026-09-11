import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LandingStatisticsComponent } from './landing-statistics.component';

describe('LandingStatisticsComponent', () => {
  let fixture: ComponentFixture<LandingStatisticsComponent>;
  let observed: IntersectionObserverCallback | undefined;
  let disconnect: jasmine.Spy;
  const OriginalIO = window.IntersectionObserver;

  beforeEach(async () => {
    observed = undefined;
    disconnect = jasmine.createSpy('disconnect');
    window.IntersectionObserver = class FakeIO implements IntersectionObserver {
      readonly root = null;
      readonly rootMargin = '';
      readonly thresholds = [];
      constructor(cb: IntersectionObserverCallback) {
        observed = cb;
      }
      observe = jasmine.createSpy('observe');
      unobserve = jasmine.createSpy('unobserve');
      disconnect = disconnect;
      takeRecords = () => [];
    } as unknown as typeof IntersectionObserver;

    await TestBed.configureTestingModule({
      imports: [LandingStatisticsComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(LandingStatisticsComponent);
  });

  afterEach(() => {
    if (fixture && !fixture.componentRef.hostView.destroyed) fixture.destroy();
    window.IntersectionObserver = OriginalIO;
  });

  it('renderiza valores mixtos exactamente, sin inventar contadores', () => {
    fixture.componentInstance.stats = [
      { label: 'Recorrido', value: '6 etapas', detail: 'De la evaluación al cierre.' },
      { label: 'Honorario', value: '$349', detail: 'Referencia.' },
    ];
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent || '';
    expect(text).toContain('6 etapas');
    expect(text).toContain('$349');
    expect(text).not.toMatch(/\b0\b.*6 etapas/);
  });

  it('observa una vez y se desconecta al entrar en vista', () => {
    fixture.componentInstance.stats = [{ label: 'A', value: '1', detail: 'd' }];
    fixture.detectChanges();
    expect(observed).toBeDefined();
    observed!(
      [{ isIntersecting: true, target: fixture.nativeElement } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    );
    expect(fixture.nativeElement.classList.contains('is-in-view')).toBeTrue();
    expect(disconnect).toHaveBeenCalled();
  });

  it('limpia el observer al destruir', () => {
    fixture.componentInstance.stats = [{ label: 'A', value: '1', detail: 'd' }];
    fixture.detectChanges();
    fixture.destroy();
    expect(disconnect).toHaveBeenCalled();
  });
});
