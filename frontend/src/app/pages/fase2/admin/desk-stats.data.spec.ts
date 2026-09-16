import { barMax, barPct, DESK_DEMO } from './desk-stats.data';

describe('desk-stats.data', () => {
  it('tiene dos libros de ejemplo con semana de 7 días', () => {
    expect(DESK_DEMO.practice.title).toBe('Tu práctica');
    expect(DESK_DEMO.site.title).toBe('La página');
    expect(DESK_DEMO.practice.bars.length).toBe(7);
    expect(DESK_DEMO.site.bars.length).toBe(7);
    expect(DESK_DEMO.practice.rows.some((r) => r.lead && r.value.includes('$'))).toBeTrue();
    expect(DESK_DEMO.site.rows[0].value).toBe('1.158');
  });

  it('barPct usa el máximo de la serie', () => {
    expect(barPct(50, 100)).toBe(50);
    expect(barPct(0, 10)).toBe(0);
    expect(barMax([{ label: 'a', value: 0 }, { label: 'b', value: 8 }])).toBe(8);
  });
});
