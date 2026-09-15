import { ApiService, CaseItem } from '../../core/api.service';
import { LawyerPanelComponent } from './lawyer-panel.component';

function caseItem(partial: Partial<CaseItem> & Pick<CaseItem, 'id' | 'status'>): CaseItem {
  return {
    client_id: 1,
    status_label: partial.status_label || 'En trámite',
    result: 'apto',
    city: partial.city || 'Quito',
    paid: true,
    amount_cents: 34900,
    created_at: '',
    updated_at: '',
    product: partial.product || 'divorcio360',
    client_name: partial.client_name || 'Carlos Mendoza',
    ...partial,
  };
}

function makePanel(cases: CaseItem[]): LawyerPanelComponent {
  const api = { listCases: () => ({ subscribe: () => undefined }) } as unknown as ApiService;
  const panel = new LawyerPanelComponent(api);
  panel.cases = cases;
  panel.loading = false;
  panel.error = false;
  return panel;
}

describe('LawyerPanelComponent bandeja', () => {
  const docs = caseItem({ id: 13, status: '02', status_label: 'Documentos pendientes' });
  const minuta = caseItem({ id: 6, status: '04', status_label: 'Documentos preparados' });

  it('abre en todos los estados, no en Revisión', () => {
    const panel = makePanel([docs, minuta]);
    expect(panel.statusFilter).toBe('');
    expect(panel.filtered.map((c) => c.id)).toEqual([minuta.id, docs.id]);
  });

  it('si el filtro deja la lista vacía, dice cuántos hay en la bandeja', () => {
    const panel = makePanel([docs, minuta]);
    panel.statusFilter = '03';

    expect(panel.filtered.length).toBe(0);
    expect(panel.emptyFilterTitle).toBe('Ninguno en Revisión');
    expect(panel.emptyFilterBody).toBe('Hay 2 en la bandeja.');
    expect(panel.headAside).toBe('0 de 2');
  });
});
