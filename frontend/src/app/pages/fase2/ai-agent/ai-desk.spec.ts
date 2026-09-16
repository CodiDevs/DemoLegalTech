import { CaseItem } from '../../../core/api.service';
import { answerDesk, briefDesk, intakeLabel, sortByIntake } from './ai-desk';

function item(partial: Partial<CaseItem> & Pick<CaseItem, 'id' | 'status'>): CaseItem {
  return {
    client_id: 1,
    status_label: 'En trámite',
    result: 'apto',
    city: 'Quito',
    paid: true,
    amount_cents: 34900,
    created_at: '2026-09-10T00:00:00Z',
    updated_at: '2026-09-14T00:00:00Z',
    product: 'divorcio360',
    client_name: 'Carlos Mendoza',
    days_in_status: 2,
    sla_warning: false,
    ...partial,
  };
}

describe('ai-desk bandeja', () => {
  const reviewOld = item({
    id: 8,
    status: '03',
    status_label: 'Revisión jurídica',
    created_at: '2026-08-01T00:00:00Z',
    days_in_status: 4,
    sla_warning: true,
    client_name: 'Elena',
  });
  const signNew = item({
    id: 15,
    status: '05',
    status_label: 'Firmas',
    created_at: '2026-09-12T00:00:00Z',
    days_in_status: 6,
    client_name: 'Carlos Mendoza',
  });
  const minuta = item({
    id: 12,
    status: '04',
    status_label: 'Documentos preparados',
    created_at: '2026-09-05T00:00:00Z',
    days_in_status: 1,
    has_minuta: true,
  });
  const closed = item({ id: 9, status: '10', created_at: '2026-07-01T00:00:00Z' });
  const list = [signNew, reviewOld, minuta, closed];

  it('prioriza ingreso viejo y fuera de plazo, no el id más alto', () => {
    expect(sortByIntake(list.filter((c) => c.status !== '10')).map((c) => c.id)).toEqual([8, 15, 12]);
    expect(intakeLabel('2026-08-01T00:00:00Z')).toBe('1 ago');
  });

  it('el brief de bandeja cuenta te toca vs cliente', () => {
    const b = briefDesk(list, 0);
    expect(b.kicker).toBe('Bandeja');
    expect(b.meta).toContain('te tocan');
    expect(b.meta).toContain('espera al cliente');
    expect(b.summary).toContain('#8');
    expect(b.late).toMatch(/Fuera de plazo/);
    expect(b.summary).not.toMatch(/legible|cédula|PDF/i);
  });

  it('responde prioridad y pendiente sin leer documentos', () => {
    const first = answerDesk('¿Cuál va primero?', list, 0);
    expect(first).toContain('#8');
    expect(first).toContain('1 ago');
    expect(first).toMatch(/Fuera de plazo/);

    const pending = answerDesk('¿Qué está pendiente?', list, 0);
    expect(pending).toContain('Te toca');
    expect(pending).toContain('#8');
    expect(pending).toContain('Espera al cliente');
    expect(pending).toContain('#15');

    const ball = answerDesk('¿Quién espera?', list, 0);
    expect(ball).toMatch(/te espera/);
    expect(ball).toMatch(/cliente/);
  });

  it('si preguntan el PDF, no inventa contenido', () => {
    const reply = answerDesk('¿Qué dice el PDF de la cédula?', list, 8);
    expect(reply).toMatch(/No leo/);
    expect(reply).not.toMatch(/coinciden|legible|Revisé/i);
    expect(reply).toContain('Revisión');
  });

  it('minuta usa la etapa, no un archivo leído', () => {
    expect(answerDesk('¿Listo para minuta?', list, 12)).toMatch(/Minuta/);
    expect(answerDesk('¿Listo para minuta?', list, 12)).toMatch(/No leo el archivo/);
    expect(answerDesk('¿Listo para minuta?', list, 8)).toMatch(/viene después/);
  });
});
