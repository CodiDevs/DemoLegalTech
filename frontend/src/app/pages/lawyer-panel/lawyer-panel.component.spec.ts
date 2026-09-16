import { ActivatedRoute } from '@angular/router';
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

function makeRoute(estado: string | null = null): ActivatedRoute {
  return {
    snapshot: { queryParamMap: { get: (key: string) => (key === 'estado' ? estado : null) } },
  } as unknown as ActivatedRoute;
}

function makePanel(cases: CaseItem[], estado: string | null = null): LawyerPanelComponent {
  const api = { listCases: () => ({ subscribe: () => undefined }) } as unknown as ApiService;
  const panel = new LawyerPanelComponent(api, makeRoute(estado));
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

  it('Detenidos abre la bandeja con el estado de esa etapa', () => {
    const panel = makePanel([docs, minuta], '04');
    panel.applyEstadoQuery('04');
    expect(panel.statusFilter).toBe('04');
    expect(panel.filtered.map((c) => c.id)).toEqual([minuta.id]);

    panel.applyEstadoQuery('99');
    expect(panel.statusFilter).toBe('');
  });

  it('needsYou ordena, no pinta lavado teal', () => {
    const panel = makePanel([minuta, docs]);
    expect(panel.needsYou(minuta)).toBeTrue();
    expect(panel.needsYou(docs)).toBeFalse();
    expect(panel.filtered[0].id).toBe(minuta.id);
  });
});
