import {
  CASE_STATUS,
  CASE_STATUS_CODES,
  CASE_STATUS_FILTER_OPTIONS,
  CASE_STATUS_SHORT,
  caseClientHint,
  caseFilterLabel,
  caseLawyerHint,
  caseShort,
} from './case-status.data';

describe('case-status.data', () => {
  it('cubre los 10 estados del motor, sin huecos', () => {
    expect(Object.keys(CASE_STATUS).sort()).toEqual([...CASE_STATUS_CODES].sort());
    expect(CASE_STATUS_CODES.length).toBe(10);
  });

  it('completa las cuatro vistas en cada estado', () => {
    for (const code of CASE_STATUS_CODES) {
      const entry = CASE_STATUS[code];
      expect(entry.short.trim()).withContext(code).not.toBe('');
      expect(entry.clientHint.trim()).withContext(code).not.toBe('');
      expect(entry.lawyerHint.trim()).withContext(code).not.toBe('');
      expect(entry.filterLabel.trim()).withContext(code).not.toBe('');
    }
  });

  it('publica vocabulario en español, sin jerga de plantilla', () => {
    const publico = JSON.stringify(CASE_STATUS).toLowerCase();

    expect(publico).not.toMatch(/intake|timeline|pipeline|kanban|status/);
    expect(publico).not.toMatch(/demo|demostración/);
    expect(publico).not.toMatch(/[—–]/);
  });

  it('expone la vista corta y el filtro alineados con la fuente', () => {
    expect(CASE_STATUS_SHORT['05']).toBe('Firma');
    expect(CASE_STATUS_SHORT['01']).toBe('Recepción');
    expect(CASE_STATUS_FILTER_OPTIONS[0]).toEqual({ id: '', label: 'Todos los estados' });
    expect(CASE_STATUS_FILTER_OPTIONS.length).toBe(11);
    expect(CASE_STATUS_FILTER_OPTIONS.map((o) => o.id)).toEqual(['', ...CASE_STATUS_CODES]);
  });

  it('resuelve por código y cae al fallback cuando no existe', () => {
    expect(caseShort('05')).toBe('Firma');
    expect(caseClientHint('01')).toContain('pago');
    expect(caseLawyerHint('03')).toContain('aprueba');
    expect(caseFilterLabel('10')).toBe('Finalizado');

    expect(caseShort('99', 'Sin estado')).toBe('Sin estado');
    expect(caseShort(undefined, 'Sin estado')).toBe('Sin estado');
    expect(caseClientHint('', 'Sin indicar')).toBe('Sin indicar');
    expect(caseLawyerHint(null, 'Sin indicar')).toBe('Sin indicar');
    expect(caseFilterLabel('99', 'Sin indicar')).toBe('Sin indicar');
  });
});
