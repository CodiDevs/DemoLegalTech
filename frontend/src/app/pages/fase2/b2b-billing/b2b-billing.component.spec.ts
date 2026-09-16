import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ApiService } from '../../../core/api.service';
import { Fase2BillingComponent } from './b2b-billing.component';

describe('Fase2BillingComponent licencia', () => {
  it('headAside es plan y cupo, no el note con em dash', () => {
    const api = { mockBilling: () => ({ subscribe: () => undefined }) } as unknown as ApiService;
    const c = new Fase2BillingComponent(api);
    c.data = {
      note: 'Licencia LegalStation para bufetes — el cliente paga',
      current_tenant: { plan_label: 'Professional', cases_used: 18, cases_limit: 50 },
      plans: [
        { id: 'b2b-pro', name: 'Professional', features: { ai: true, satje: true } },
      ],
    };
    expect(c.headAside).toBe('Professional · 18 de 50 este mes');
    expect(c.headAside).not.toContain('—');
    expect(c.flagLabel(true)).toBe('Sí');
    expect(c.flagLabel(false)).toBe('No');
  });

  it('no carga cobros de trámites; eso vive en Escritorio', () => {
    const api = {
      mockBilling: () => ({ subscribe: () => undefined }),
      listCases: () => {
        throw new Error('listCases no pertenece a Facturación B2B');
      },
    } as unknown as ApiService;
    const c = new Fase2BillingComponent(api);
    expect(() => c.ngOnInit()).not.toThrow();
    expect('charges' in c).toBeFalse();
  });

  it('la plantilla de licencia no incluye cobros de trámites', async () => {
    await TestBed.configureTestingModule({
      imports: [Fase2BillingComponent],
      providers: [
        provideRouter([]),
        {
          provide: ApiService,
          useValue: {
            mockBilling: () => of({
              current_tenant: {
                name: 'Bufete Ruiz',
                plan: 'b2b-pro',
                plan_label: 'Professional',
                commission_pct: 85,
                platform_pct: 15,
                cases_used: 18,
                cases_limit: 50,
                suggested_client_price_usd: 349,
              },
              plans: [],
              invoices: [],
            }),
            listCases: () => {
              throw new Error('listCases no pertenece a Facturación B2B');
            },
          },
        },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(Fase2BillingComponent);
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent || '';
    expect(text).toContain('Licencia');
    expect(text).toContain('Historial de facturas');
    expect(text).not.toContain('Cobros de trámites');
    expect(text).not.toContain('Cobrado');
    fixture.destroy();
    TestBed.resetTestingModule();
  });
});
