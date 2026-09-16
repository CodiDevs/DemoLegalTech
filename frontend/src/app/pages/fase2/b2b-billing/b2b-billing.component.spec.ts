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

  it('cobros de trámites suman cobrado y pendiente, no un grid de KPIs', () => {
    const api = {
      mockBilling: () => ({ subscribe: () => undefined }),
      listCases: () => ({ subscribe: () => undefined }),
    } as unknown as ApiService;
    const c = new Fase2BillingComponent(api);
    c.chargesLoading = false;
    c.charges = [
      {
        id: 6,
        client_id: 1,
        status: '03',
        status_label: 'Revisión',
        result: 'apto',
        city: 'Quito',
        paid: true,
        amount_cents: 34900,
        created_at: '',
        updated_at: '',
        product: 'divorcio360',
        client_name: 'Carlos Mendoza',
      },
      {
        id: 8,
        client_id: 1,
        status: '01',
        status_label: 'Recepción',
        result: 'apto',
        city: 'Quito',
        paid: false,
        amount_cents: 19900,
        created_at: '',
        updated_at: '',
        product: 'traslado360',
        client_name: 'María Salazar',
      },
    ];
    expect(c.cobradoUsd).toBe(349);
    expect(c.pendienteUsd).toBe(199);
    expect(c.chargeRows.map((row) => row.id)).toEqual([8, 6]);
    expect(c.chargesAside).toContain('cobrado');
    expect(c.chargesAside).toContain('pendiente');
    expect(c.chargesAside).not.toContain('KPI');
  });
});
