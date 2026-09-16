/** Libro de cifras ficticias del escritorio. Demo: no es tráfico ni caja reales. */

export const DESK_WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'] as const;

export interface DeskBar {
  label: string;
  value: number;
}

export interface DeskRow {
  label: string;
  value: string;
  lead?: boolean;
  stack?: boolean;
}

export interface DeskBook {
  title: string;
  note: string;
  rows: DeskRow[];
  bars: DeskBar[];
  barsCaption: string;
}

/** Bufete de ejemplo, septiembre 2026, Quito. */
export const DESK_DEMO: { practice: DeskBook; site: DeskBook } = {
  practice: {
    title: 'Tu práctica',
    note: 'Septiembre · cifras de ejemplo',
    rows: [
      { label: 'Honorarios cobrados', value: '$7.396', lead: true },
      { label: 'Por cobrar', value: '$1.047' },
      { label: 'Neto del mes', value: '$7.147' },
      { label: 'Folios abiertos', value: '18' },
      { label: 'Te toca hoy', value: '4' },
      { label: 'Tiempo medio de revisión', value: '1,4 días' },
      { label: 'Mix', value: '14 Divorcio · 6 Traslado · 4 BienRaíz', stack: true },
    ],
    bars: [
      { label: 'Lun', value: 698 },
      { label: 'Mar', value: 1047 },
      { label: 'Mié', value: 349 },
      { label: 'Jue', value: 1396 },
      { label: 'Vie', value: 698 },
      { label: 'Sáb', value: 0 },
      { label: 'Dom', value: 0 },
    ],
    barsCaption: 'Cobros de la semana, USD',
  },
  site: {
    title: 'La página',
    note: 'legalstation.ec · visitas de ejemplo',
    rows: [
      { label: 'Visitas esta semana', value: '1.158', lead: true },
      { label: 'Visitas del mes', value: '4.820' },
      { label: 'Trámites iniciados', value: '52' },
      { label: 'Trámites pagados', value: '24' },
      { label: 'Tasa de cierre', value: '46 %' },
      { label: 'Página más vista', value: 'Divorcio360' },
      { label: 'Licencia LegalStation', value: '$249' },
    ],
    bars: [
      { label: 'Lun', value: 168 },
      { label: 'Mar', value: 194 },
      { label: 'Mié', value: 211 },
      { label: 'Jue', value: 187 },
      { label: 'Vie', value: 246 },
      { label: 'Sáb', value: 88 },
      { label: 'Dom', value: 64 },
    ],
    barsCaption: 'Visitas de lun a dom',
  },
};

export function barPct(value: number, max: number): number {
  if (max <= 0) return 0;
  return Math.round((value / max) * 100);
}

export function barMax(bars: DeskBar[]): number {
  return Math.max(1, ...bars.map((b) => b.value));
}
