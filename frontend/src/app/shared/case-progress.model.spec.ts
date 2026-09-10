import {
  buildCaseProgressStages,
  buildMarketingProgressStages,
} from './case-progress.model';

describe('case-progress.model', () => {
  const states = {
    '01': 'Información recibida',
    '02': 'Documentos pendientes',
    '03': 'Revisión jurídica',
    '04': 'Documentos preparados',
    '05': 'Firmas',
    '06': 'Enviado a notaría',
    '07': 'Comparecencia',
    '08': 'Acta emitida',
    '09': 'Registro',
    '10': 'Finalizado',
  };

  it('marca done/current/upcoming según estado del caso', () => {
    const stages = buildCaseProgressStages('03', states, [
      { status: '01', created_at: '2026-09-01T10:00:00Z' },
      { status: '02', created_at: '2026-09-02T10:00:00Z' },
      { status: '03', created_at: '2026-09-03T10:00:00Z' },
    ]);

    expect(stages.length).toBe(10);
    expect(stages[0].status).toBe('done');
    expect(stages[1].status).toBe('done');
    expect(stages[2].status).toBe('current');
    expect(stages[2].label).toBe('Revisión jurídica');
    expect(stages[2].date).toBe('2026-09-03T10:00:00Z');
    expect(stages[3].status).toBe('upcoming');
  });

  it('arma etapas de marketing en español sin Intake', () => {
    const stages = buildMarketingProgressStages(
      [
        { n: 1, title: 'Recepción del caso', desc: 'Cuestionario', icon: 'clipboard' },
        { n: 2, title: 'Expediente digital', desc: 'Docs', icon: 'folder' },
        { n: 3, title: 'Revisión', desc: 'Operador', icon: 'eye' },
      ],
      1,
    );

    expect(stages.map((s) => s.status)).toEqual(['done', 'current', 'upcoming']);
    expect(JSON.stringify(stages)).not.toMatch(/intake|timeline/i);
  });
});
