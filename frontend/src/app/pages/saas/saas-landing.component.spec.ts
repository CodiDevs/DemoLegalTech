import { signal } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { SaasLandingComponent } from './saas-landing.component';

describe('SaasLandingComponent', () => {
  let fixture: ComponentFixture<SaasLandingComponent>;
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
      imports: [SaasLandingComponent],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: { isLoggedIn: false, user: signal(null) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SaasLandingComponent);
  });

  afterEach(() => {
    if (fixture && !fixture.componentRef.hostView.destroyed) fixture.destroy();
    window.IntersectionObserver = OriginalIO;
  });

  it('pinta las tarjetas del catálogo de trámites', () => {
    fixture.detectChanges();
    const cards = fixture.nativeElement.querySelectorAll('.catalog-card');
    expect(cards.length).toBeGreaterThanOrEqual(1);
  });

  it('desconecta el observer tras marcar capítulos en vista', () => {
    spyOnProperty(window, 'innerHeight', 'get').and.returnValue(1);
    fixture.detectChanges();
    expect(observed).toBeDefined();

    const nodes = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('.ls-choreo, .lp-reveal'),
    );
    if (nodes.length > 0) {
      observed!(
        nodes.map((target) => ({ isIntersecting: true, target } as IntersectionObserverEntry)),
        {} as IntersectionObserver,
      );
      expect(nodes[0].classList.contains('is-in-view')).toBeTrue();
      expect(disconnect).toHaveBeenCalled();
    }
  });

  it('recorrido: cinco estaciones del flujo civil y selección de estación', () => {
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const stations = Array.from(root.querySelectorAll('.journey-step-btn'));

    expect(stations.length).toBe(5);
    const cmp = fixture.componentInstance;
    expect(cmp.journeyFocus).toBe(0);

    cmp.selectStation(2);
    expect(cmp.journeyFocus).toBe(2);
  });

  it('pinta los planes de licenciamiento con precio e items', () => {
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const plans = Array.from(root.querySelectorAll('.plan-card'));
    expect(plans.length).toBe(3);
  });

  it('alterna precios entre servicios y licenciamiento', () => {
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const cmp = fixture.componentInstance;

    expect(cmp.pricingMode).toBe('licenciamiento');
    expect(root.textContent).toContain('Professional');

    cmp.setPricingMode('servicios');
    fixture.detectChanges();
    expect(root.textContent).toContain('Divorcio360');
    expect(root.textContent).toContain('$349');
    expect(root.textContent).toContain('Traslado360');
    expect(root.textContent).toContain('BienRaiz360');
    expect(root.querySelectorAll('.plan-card').length).toBe(3);

    cmp.setPricingMode('licenciamiento');
    fixture.detectChanges();
    expect(root.textContent).toContain('Starter');
  });

  it('cancela el timer del toast al reemplazarlo y al destruir', fakeAsync(() => {
    fixture.detectChanges();
    const cmp = fixture.componentInstance;
    cmp.notify('SignDesk');
    tick(1000);
    cmp.notify('Enterprise');
    tick(3500);
    expect(cmp.toast).toBe('');

    cmp.notify('MatterFlow');
    fixture.destroy();
    tick(5000);
  }));
});
