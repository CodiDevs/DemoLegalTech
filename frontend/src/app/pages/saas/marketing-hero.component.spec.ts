import { signal } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService, User } from '../../core/auth.service';
import { MarketingHeroComponent } from './marketing-hero.component';

function userFor(role: User['role']): User {
  return { id: 1, email: 'demo@legalstation.test', full_name: 'Demo', phone: '', role };
}

async function renderHero(role: User['role'] | null): Promise<ComponentFixture<MarketingHeroComponent>> {
  TestBed.resetTestingModule();
  await TestBed.configureTestingModule({
    imports: [MarketingHeroComponent],
    providers: [
      provideRouter([]),
      {
        provide: AuthService,
        useValue: {
          isLoggedIn: !!role,
          user: signal(role ? userFor(role) : null),
        },
      },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(MarketingHeroComponent);
  fixture.detectChanges();
  return fixture;
}

describe('MarketingHeroComponent CTA', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('en home el CTA abre el catálogo de trámites, no el cuestionario', async () => {
    const guest = await renderHero(null);
    const root = guest.nativeElement as HTMLElement;
    const btn = root.querySelector('.mk-cta .btn-primary') as HTMLButtonElement | null;
    expect(btn?.tagName).toBe('BUTTON');
    expect(btn?.getAttribute('href')).toBeNull();
    expect(btn?.textContent).toContain('Iniciar un trámite');
    expect(root.querySelector('#mk-service-menu')).toBeNull();

    btn?.click();
    guest.detectChanges();
    const items = Array.from(root.querySelectorAll('#mk-service-menu a')) as HTMLAnchorElement[];
    expect(items.map((a) => a.querySelector('strong')?.textContent?.trim())).toEqual([
      'Divorcio360',
      'Traslado360',
      'BienRaiz360',
    ]);
    expect(items[0].getAttribute('href')).toBe('/cuestionario');
    expect(items[1].getAttribute('href')).toBe('/productos/traslado360/cuestionario');
    expect(items[2].getAttribute('href')).toBe('/productos/bienraiz360/cuestionario');
    expect(root.textContent).not.toContain('SignDesk');
    guest.destroy();

    const cliente = await renderHero('cliente');
    expect((cliente.nativeElement as HTMLElement).querySelector('.mk-cta .btn-primary')?.tagName).toBe('BUTTON');
    cliente.destroy();

    const abogado = await renderHero('abogado');
    expect((abogado.nativeElement as HTMLElement).querySelector('a.mk-cta-btn[href="/cuestionario"]')).toBeNull();
    expect((abogado.nativeElement as HTMLElement).textContent).not.toContain('Ver Fase 2');
    abogado.destroy();
  });

  it('si pickService está apagado, el CTA sigue yendo al cuestionario', async () => {
    const fixture = await renderHero(null);
    fixture.componentInstance.pickService = false;
    fixture.detectChanges();
    const cta = (fixture.nativeElement as HTMLElement).querySelector('.mk-cta .btn-primary');
    expect(cta?.tagName).toBe('A');
    expect(cta?.getAttribute('href')).toBe('/cuestionario');
    fixture.destroy();
  });

  it('muestra poster/fallback y oculta el video si falla la carga', async () => {
    const fixture = await renderHero(null);
    fixture.componentInstance.onVideoError();
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('video')).toBeNull();
    expect(root.querySelector('.mk-hero--static')).not.toBeNull();
    expect(root.querySelector('.mk-cta .btn-primary')).not.toBeNull();
    const hero = root.querySelector('.mk-hero') as HTMLElement;
    expect(hero.style.getPropertyValue('--mk-poster')).toContain('legalstation-hero-poster');
    fixture.destroy();
  });

  it('cae al fallback estático si autoplay se rechaza', fakeAsync(async () => {
    spyOn(HTMLMediaElement.prototype, 'play').and.returnValue(Promise.reject(new Error('autoplay')));
    const fixture = await renderHero(null);
    tick();
    fixture.detectChanges();
    expect(fixture.componentInstance.useStaticFallback).toBeTrue();
    expect((fixture.nativeElement as HTMLElement).querySelector('video')).toBeNull();
    expect((fixture.nativeElement as HTMLElement).querySelector('.mk-cta .btn-primary')).not.toBeNull();
    fixture.destroy();
  }));

  it('ignora un rechazo tardío si otra reproducción ya está activa', fakeAsync(async () => {
    let rejectFirst: (reason: Error) => void = () => undefined;
    const first = new Promise<void>((_, reject) => {
      rejectFirst = reject;
    });
    spyOn(HTMLMediaElement.prototype, 'play').and.returnValues(
      first as Promise<void>,
      Promise.resolve(),
    );
    const fixture = await renderHero(null);
    fixture.componentInstance.tryPlay();
    const video = (fixture.nativeElement as HTMLElement).querySelector('video') as HTMLVideoElement | null;
    if (video) {
      Object.defineProperty(video, 'paused', { configurable: true, get: () => false });
    }
    rejectFirst(new Error('autoplay'));
    tick();
    fixture.detectChanges();
    expect(fixture.componentInstance.useStaticFallback).toBeFalse();
    expect((fixture.nativeElement as HTMLElement).querySelector('video')).not.toBeNull();
    fixture.destroy();
  }));
});
