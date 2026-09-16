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
});
