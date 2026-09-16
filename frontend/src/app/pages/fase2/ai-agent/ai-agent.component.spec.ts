import { ApiService, CaseItem } from '../../../core/api.service';
import { Fase2AiComponent } from './ai-agent.component';

function caseItem(partial: Partial<CaseItem> & Pick<CaseItem, 'id' | 'status'>): CaseItem {
  return {
    client_id: 1,
    status_label: partial.status_label || 'En trámite',
    result: 'apto',
    city: 'Quito',
    paid: true,
    amount_cents: 34900,
    created_at: '',
    updated_at: '',
    product: partial.product || 'divorcio360',
    client_name: partial.client_name || 'Carlos Mendoza',
    ...partial,
  };
}

describe('Fase2AiComponent asistente', () => {
  function make(): Fase2AiComponent {
    const api = {
      listCases: () => ({ subscribe: () => undefined }),
      mockAI: () => ({ subscribe: () => undefined }),
    } as unknown as ApiService;
    return new Fase2AiComponent(api);
  }

  it('elige el primer caso del sort, no el #1 a palo', () => {
    const c = make();
    const review = caseItem({
      id: 12,
      status: '03',
      product: 'traslado360',
      status_label: 'Revisión',
    });
    const firstSeed = caseItem({
      id: 1,
      status: '07',
      product: 'divorcio360',
      status_label: 'Comparecencia',
    });

    expect(c.pickDefaultCaseId([review, firstSeed])).toBe(12);
    expect(c.optionLabel(review)).toBe('#12 · Traslado360 · Revisión');
    expect(c.optionLabel(firstSeed)).toBe('#1 · Divorcio360 · Cita');
    expect(c.optionLabel(review)).not.toContain('Carlos Mendoza');
  });

  it('sin lista no selecciona expediente', () => {
    const c = make();
    expect(c.pickDefaultCaseId([])).toBe(0);
  });
});
