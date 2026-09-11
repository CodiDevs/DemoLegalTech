import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { CheckoutComponent } from './checkout.component';

const CASE = {
  id: 7,
  paid: false,
  amount_cents: 34900,
  product: 'divorcio360',
  status_label: 'Pago pendiente',
  questionnaire_json: '{}',
};

describe('CheckoutComponent', () => {
  let fixture: ComponentFixture<CheckoutComponent>;
  let api: { getCase: jasmine.Spy; mockPay: jasmine.Spy };

  beforeEach(async () => {
    document.body.style.overflow = 'auto';
    api = {
      getCase: jasmine.createSpy('getCase').and.returnValue(of({ case: { ...CASE } })),
      mockPay: jasmine.createSpy('mockPay').and.returnValue(of({ reference: 'LS-7' })),
    };
    await TestBed.configureTestingModule({
      imports: [CheckoutComponent],
      providers: [
        provideRouter([{ path: 'upload/:id', component: CheckoutComponent }]),
        { provide: ApiService, useValue: api },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '7' } } } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(CheckoutComponent);
  });

  afterEach(() => {
    if (fixture && !fixture.componentRef.hostView.destroyed) fixture.destroy();
    document.body.style.overflow = '';
  });

  it('ignora doble click y transiciona processing → success', fakeAsync(() => {
    fixture.detectChanges();
    const cmp = fixture.componentInstance;
    cmp.pay();
    cmp.pay();
    expect(api.mockPay).toHaveBeenCalledTimes(1);
    expect(cmp.paymentStep).toBe('processing');
    tick(1800);
    expect(cmp.paymentStep).toBe('success');
    fixture.detectChanges();
    const link = (fixture.nativeElement as HTMLElement).querySelector('.upload-link');
    expect(link?.getAttribute('href')).toBe('/upload/7');
  }));

  it('muestra error recuperable y no deja el overlay', () => {
    api.mockPay.and.returnValue(throwError(() => ({ error: { error: 'tarjeta' } })));
    fixture.detectChanges();
    fixture.componentInstance.pay();
    expect(fixture.componentInstance.paymentStep).toBe('idle');
    expect(fixture.componentInstance.error).toContain('tarjeta');
    expect(document.body.style.overflow).toBe('auto');
  });

  it('no aplica el timer si se destruye y restaura overflow previo', fakeAsync(() => {
    document.body.style.overflow = 'scroll';
    fixture.detectChanges();
    fixture.componentInstance.pay();
    expect(document.body.style.overflow).toBe('hidden');
    fixture.destroy();
    tick(1800);
    expect(document.body.style.overflow).toBe('scroll');
  }));

  it('abre éxito si el caso ya está pagado', () => {
    api.getCase.and.returnValue(of({ case: { ...CASE, paid: true } }));
    fixture.detectChanges();
    expect(fixture.componentInstance.paymentStep).toBe('success');
  });
});
