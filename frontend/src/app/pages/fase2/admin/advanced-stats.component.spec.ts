import { ApiService, CaseItem } from '../../../core/api.service';
import { AdvancedStatsComponent } from './advanced-stats.component';

function make(): AdvancedStatsComponent {
  const api = { listCases: () => ({ subscribe: () => undefined }) } as unknown as ApiService;
  const c = new AdvancedStatsComponent(api);
  c.loading = false;
  c.error = false;
  return c;
}

function item(partial: Partial<CaseItem> & Pick<CaseItem, 'id' | 'status'>): CaseItem {
  return {
    client_id: 1,
    status_label: 'Revisión',
    result: 'apto',
    city: 'Quito',
    paid: true,
    amount_cents: 34900,
    created_at: '2026-09-01T00:00:00Z',
    updated_at: '2026-09-10T00:00:00Z',
    client_name: 'A',
    days_in_status: 2,
    sla_warning: false,
    product: 'divorcio360',
    ...partial,
  };
}

describe('AdvancedStatsComponent escritorio', () => {
  it('el escritorio carga dos libros de cifras de ejemplo aunque no haya folios', () => {
    const c = make();
    c.cases = [];
    expect(c.books.map((b) => b.title)).toEqual(['Tu práctica', 'La página']);
    expect(c.books[0].rows[0].value).toBe('$7.396');
    expect(c.books[1].rows[0].value).toBe('1.158');
    expect(c.barHeight(c.books[1].bars, 246)).toBe(100);
  });

  it('el aside cuenta folios reales, no dinero ni KPIs', () => {
    const c = make();
    c.cases = [
      item({ id: 1, status: '03', sla_warning: true, days_in_status: 5 }),
      item({ id: 2, status: '04', days_in_status: 1 }),
      item({ id: 3, status: '05', days_in_status: 6 }),
    ];

    expect(c.deskCases.map((x) => x.id)).toEqual([1, 2]);
    expect(c.headAside).toBe('2 folios te esperan');
    expect(c.headAside).not.toMatch(/\$|USD|KPI|activos|pendiente/i);
    expect(c.headTitle).toBe('Hoy te toca.');
  });

  it('el stack muestra 4 folios y el resto en la lista', () => {
    const c = make();
    c.cases = [1, 2, 3, 4, 5, 6].map((id) => item({ id, status: '03', days_in_status: id }));

    expect(c.leadCase?.id).toBe(6);
    expect(c.peekCases.map((x) => x.id)).toEqual([5, 4, 3]);
    expect(c.moreCases.map((x) => x.id)).toEqual([2, 1]);
  });

  it('si no te toca, el blotter usa folios en espera reales', () => {
    const c = make();
    c.cases = [
      item({ id: 9, status: '10', days_in_status: 1 }),
      item({ id: 8, status: '05', days_in_status: 6, client_name: 'Carlos Mendoza' }),
      item({ id: 7, status: '02', days_in_status: 3 }),
    ];
    expect(c.deskCases.length).toBe(0);
    expect(c.leadCase?.id).toBe(8);
    expect(c.headTitle).toBe('Nada te toca.');
    expect(c.headAside).toBe('2 en espera');
  });

  it('cerrados solos no inventan métricas', () => {
    const c = make();
    c.cases = [item({ id: 9, status: '10', days_in_status: 1 })];
    expect(c.leadCase).toBeNull();
    expect(c.headTitle).toBe('Nada te toca.');
    expect(c.headAside).toBe('Nada pendiente en el escritorio');
    expect(c.holds.length).toBe(0);
  });

  it('Detenidos manda estado a la bandeja y cuenta casos', () => {
    const c = make();
    c.cases = [
      item({ id: 1, status: '03', days_in_status: 4 }),
      item({ id: 2, status: '03', days_in_status: 2 }),
      item({ id: 3, status: '05', days_in_status: 6 }),
    ];

    expect(c.holdCaseCount).toBe(3);
    const firma = c.holds.find((h) => h.stage_code === '05');
    expect(firma?.count).toBe(1);
    expect(c.holdQuery({
      stage: 'Firma',
      stage_code: '05',
      count: 1,
      avg_days: 6,
    })).toEqual({ estado: '05' });
  });
});
