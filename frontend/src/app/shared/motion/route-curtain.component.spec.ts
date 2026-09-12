import { Component } from '@angular/core';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router, RouterLink, RouterOutlet, provideRouter } from '@angular/router';
import { RouteCurtainComponent } from './route-curtain.component';

@Component({
  selector: 'app-page-a',
  standalone: true,
  template: '<p>a</p>',
})
class PageAComponent {}

@Component({
  selector: 'app-page-b',
  standalone: true,
  template: '<p>b</p>',
})
class PageBComponent {}

@Component({
  selector: 'app-curtain-host',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouteCurtainComponent],
  template: `<app-route-curtain /><router-outlet />`,
})
class HostComponent {}

describe('RouteCurtainComponent', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('cubre visualmente sin bloquear la navegación', fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [HostComponent, PageAComponent, PageBComponent],
      providers: [
        provideRouter([
          { path: '', component: PageAComponent },
          { path: 'b', component: PageBComponent },
        ]),
      ],
    });
    const fixture = TestBed.createComponent(HostComponent);
    const router = TestBed.inject(Router);
    fixture.detectChanges();
    void router.navigateByUrl('/');
    tick();
    fixture.detectChanges();

    const curtain = fixture.nativeElement.querySelector('.route-curtain') as HTMLElement;
    expect(curtain).not.toBeNull();
    expect(getComputedStyle(curtain).pointerEvents).toBe('none');

    void router.navigateByUrl('/b');
    tick();
    fixture.detectChanges();
    expect(router.url).toBe('/b');
    expect(curtain.classList.contains('is-on')).toBeTrue();
    tick(520);
    fixture.detectChanges();
    expect(curtain.classList.contains('is-on')).toBeFalse();
    fixture.destroy();
  }));

  it('no se enciende entre abogado y fase2', fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [HostComponent, PageAComponent, PageBComponent],
      providers: [
        provideRouter([
          { path: 'abogado', component: PageAComponent },
          { path: 'fase2/admin', component: PageBComponent },
        ]),
      ],
    });
    const fixture = TestBed.createComponent(HostComponent);
    const router = TestBed.inject(Router);
    fixture.detectChanges();
    void router.navigateByUrl('/abogado');
    tick();
    fixture.detectChanges();
    const curtainCmp = fixture.debugElement.query(By.directive(RouteCurtainComponent)).componentInstance as RouteCurtainComponent;
    curtainCmp.on = false;
    fixture.detectChanges();

    void router.navigateByUrl('/fase2/admin');
    tick();
    fixture.detectChanges();
    expect(router.url).toBe('/fase2/admin');
    expect(curtainCmp.on).toBeFalse();
    fixture.destroy();
  }));

  it('se enciende al salir de abogado hacia home', fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [HostComponent, PageAComponent, PageBComponent],
      providers: [
        provideRouter([
          { path: '', component: PageBComponent },
          { path: 'abogado', component: PageAComponent },
        ]),
      ],
    });
    const fixture = TestBed.createComponent(HostComponent);
    const router = TestBed.inject(Router);
    fixture.detectChanges();
    void router.navigateByUrl('/abogado');
    tick();
    fixture.detectChanges();
    const curtainCmp = fixture.debugElement.query(By.directive(RouteCurtainComponent)).componentInstance as RouteCurtainComponent;
    curtainCmp.on = false;
    fixture.detectChanges();

    void router.navigateByUrl('/');
    tick();
    fixture.detectChanges();
    expect(router.url).toBe('/');
    expect(curtainCmp.on).toBeTrue();
    fixture.destroy();
  }));
});
