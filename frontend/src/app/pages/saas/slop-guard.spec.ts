import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { ProductLandingComponent } from '../product-site/product-landing.component';
import { DivorcioLandingComponent } from './divorcio-landing.component';
import { SaasLandingComponent } from './saas-landing.component';

/** Patrones de plantilla que AGENTS.md §2 prohíbe en superficies de marketing. */
function expectNoSlop(root: HTMLElement): void {
  expect(root.querySelectorAll(
    '.section-kicker, .lp-eyebrow, .lp-cta-eyebrow, .cine-kicker, .dossier-kicker, .preview-kicker, .q-modal-kicker',
  ).length).toBe(0);
  expect(root.querySelectorAll(
    '.card-check, .plan-check, .ls-plan-items, .ls-choreo, app-landing-statistics, .ls-stats',
  ).length).toBe(0);

  const text = root.textContent || '';
  expect(text).not.toMatch(/[—–]/);
  expect(text).not.toMatch(/#LS-|LS-\d{3}|ACT-\d{4}/);
  expect(text).not.toMatch(/\b24h\b/i);
  expect(text).not.toMatch(/expediente real/i);
  expect(text).not.toMatch(/en minutos/i);
}

const authStub = {
  isLoggedIn: false,
  user: signal(null),
};

describe('slop guard — marketing', () => {
  let fixture: ComponentFixture<unknown>;

  afterEach(() => {
    if (fixture && !fixture.componentRef.hostView.destroyed) fixture.destroy();
    TestBed.resetTestingModule();
  });

  it('la home no muestra kickers, checks de garantía ni códigos de expediente', async () => {
    await TestBed.configureTestingModule({
      imports: [SaasLandingComponent],
      providers: [provideRouter([]), { provide: AuthService, useValue: authStub }],
    }).compileComponents();

    fixture = TestBed.createComponent(SaasLandingComponent);
    fixture.detectChanges();
    expectNoSlop(fixture.nativeElement as HTMLElement);
    const home = fixture.nativeElement as HTMLElement;
    expect(home.querySelectorAll('.lp-reveal').length).toBe(0);
    const featuredTag = home.querySelector('.plan-card.is-featured .plan-tag')?.textContent?.trim();
    expect(featuredTag).not.toBe('Recomendado');
  });

  it('la landing de producto no muestra kickers, checks de garantía ni testimonios', async () => {
    await TestBed.configureTestingModule({
      imports: [ProductLandingComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authStub },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ slug: 'traslado360' }) } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductLandingComponent);
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    expectNoSlop(root);
    expect(root.querySelectorAll('.lp-testimonials, .ps-quote, .ps-badge').length).toBe(0);
  });

  it('la landing de Divorcio360 no muestra kickers de escena ni códigos falsos', async () => {
    await TestBed.configureTestingModule({
      imports: [DivorcioLandingComponent],
      providers: [provideRouter([]), { provide: AuthService, useValue: authStub }],
    }).compileComponents();

    fixture = TestBed.createComponent(DivorcioLandingComponent);
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    expectNoSlop(root);
    expect(root.querySelectorAll('.ls-stats').length).toBe(0);
  });
});
