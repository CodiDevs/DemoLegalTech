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

  it('lleva el CTA de Divorcio360 a la landing del producto, no al cuestionario', () => {
    fixture.detectChanges();
    const featured = (fixture.nativeElement as HTMLElement).querySelector(
      '.ls-feature .lp-btn-primary',
    );
    expect(featured?.getAttribute('href')).toBe('/productos/divorcio360');
    expect(featured?.getAttribute('href')).not.toBe('/cuestionario');
  });

  it('desconecta el observer tras marcar capítulos en vista', () => {
    spyOnProperty(window, 'innerHeight', 'get').and.returnValue(1);
    fixture.detectChanges();
    expect(observed).toBeDefined();

    const nodes = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('.ls-choreo, .lp-reveal'),
    );
    expect(nodes.length).toBeGreaterThan(0);
    observed!(
      nodes.map((target) => ({ isIntersecting: true, target } as IntersectionObserverEntry)),
      {} as IntersectionObserver,
    );

    expect(nodes[0].classList.contains('is-in-view')).toBeTrue();
    expect(disconnect).toHaveBeenCalled();
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
