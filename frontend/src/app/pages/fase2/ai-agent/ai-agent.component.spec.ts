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
    created_at: '2026-08-01T00:00:00Z',
    updated_at: '',
    product: partial.product || 'divorcio360',
    client_name: partial.client_name || 'Carlos Mendoza',
    days_in_status: 4,
    sla_warning: partial.status === '03',
    ...partial,
  };
}

describe('Fase2AiComponent asistente', () => {
  function make(): Fase2AiComponent {
    const api = {
      listCases: () => ({ subscribe: () => undefined }),
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

  it('no promete haber leído documentos', () => {
    const c = make();
    expect(c.seedText()).toMatch(/No leo documentos/);
    expect(c.seedText()).not.toMatch(/Revisé|PDF|cédula/i);
    expect(c.prompts.join(' ')).toMatch(/pendiente/);
    expect(c.prompts.join(' ')).toMatch(/primero/);
    expect(c.prompts.join(' ')).toMatch(/espera/);
    expect(c.prompts.join(' ')).not.toMatch(/menores|minuta/i);
  });

  it('responde prioridad desde la bandeja cargada', () => {
    const c = make();
    c.cases = [
      caseItem({ id: 15, status: '05', created_at: '2026-09-12T00:00:00Z', days_in_status: 1, sla_warning: false }),
      caseItem({ id: 8, status: '03', created_at: '2026-08-01T00:00:00Z', days_in_status: 4, sla_warning: true }),
    ];
    c.selectedCaseId = 8;
    c.draft = '¿Cuál va primero?';
    c.send();
    const last = c.messages[c.messages.length - 1];
    expect(last.role).toBe('assistant');
    expect(last.text).toContain('#8');
    expect(last.text).not.toMatch(/legible|coinciden|Revisé/i);
  });
});
