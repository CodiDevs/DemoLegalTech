/**
 * Fuente única de los 10 estados del trámite.
 *
 * Antes convivían seis definiciones con cuatro vocabularios distintos para el
 * mismo estado (client-panel STAGE_HINT/STAGE_SHORT, lawyer-panel STAGE_HINT/
 * STAGE_SHORT/STATUS_OPTIONS y lawyer-case STATE_LABELS). Eso permitía que la
 * misma etapa se llamara `Minuta`, `Docs preparados` y `Documentos preparados`
 * según la pantalla. Acá vive una sola vez, con una vista por audiencia.
 */

import { CASE_STATUS_KEYS } from './case-progress.model';

export interface CaseStatusEntry {
  /** Etiqueta corta: línea de estados, chips y meta de la fila. */
  readonly short: string;
  /** Qué le toca al cliente, en tuteo. */
  readonly clientHint: string;
  /** Qué le toca al operador, en tercera persona. */
  readonly lawyerHint: string;
  /** Etiqueta descriptiva para el filtro de la bandeja del abogado. */
  readonly filterLabel: string;
}

export const CASE_STATUS: Record<string, CaseStatusEntry> = {
  '01': {
    short: 'Recepción',
    clientHint: 'Completa el pago para abrir el expediente.',
    lawyerHint: 'Caso recibido. Espera el pago o la carga inicial.',
    filterLabel: 'Información recibida',
  },
  '02': {
    short: 'Documentos',
    clientHint: 'Sube los documentos que faltan.',
    lawyerHint: 'El cliente debe subir los documentos.',
    filterLabel: 'Documentos pendientes',
  },
  '03': {
    short: 'Revisión',
    clientHint: 'El abogado está revisando tus documentos.',
    lawyerHint: 'Revisa y aprueba cada documento.',
    filterLabel: 'Revisión',
  },
  '04': {
    short: 'Minuta',
    clientHint: 'Espera la minuta del abogado.',
    lawyerHint: 'Carga la minuta del notario.',
    filterLabel: 'Documentos preparados',
  },
  '05': {
    short: 'Firma',
    clientHint: 'Firma la minuta.',
    lawyerHint: 'El cliente firma. Puedes reenviar el aviso.',
    filterLabel: 'Firmas',
  },
  '06': {
    short: 'Notaría',
    clientHint: 'El trámite va a notaría.',
    lawyerHint: 'Registra el envío a notaría.',
    filterLabel: 'Enviado a notaría',
  },
  '07': {
    short: 'Cita',
    clientHint: 'Pendiente la comparecencia.',
    lawyerHint: 'Registra la comparecencia.',
    filterLabel: 'Comparecencia',
  },
  '08': {
    short: 'Acta',
    clientHint: 'Pendiente el acta.',
    lawyerHint: 'Registra el acta emitida.',
    filterLabel: 'Acta emitida',
  },
  '09': {
    short: 'Registro',
    clientHint: 'Inscripción en Registro Civil.',
    lawyerHint: 'Inscribe en Registro Civil y cierra.',
    filterLabel: 'Registro',
  },
  '10': {
    short: 'Cierre',
    clientHint: 'Trámite cerrado.',
    lawyerHint: 'Trámite cerrado.',
    filterLabel: 'Finalizado',
  },
};

/** Vista corta indexada por código, para templates. */
export const CASE_STATUS_SHORT: Record<string, string> = Object.fromEntries(
  Object.entries(CASE_STATUS).map(([code, entry]) => [code, entry.short]),
);

/** Opciones del filtro de estado del abogado (incluye el comodín). */
export const CASE_STATUS_FILTER_OPTIONS: { id: string; label: string }[] = [
  { id: '', label: 'Todos los estados' },
  ...CASE_STATUS_KEYS.map((code) => ({ id: code as string, label: CASE_STATUS[code].filterLabel })),
];

export function caseShort(code: string | undefined | null, fallback = ''): string {
  const key = (code || '').trim();
  return CASE_STATUS[key]?.short ?? fallback;
}

export function caseClientHint(code: string | undefined | null, fallback = 'Abre el expediente.'): string {
  const key = (code || '').trim();
  return CASE_STATUS[key]?.clientHint ?? fallback;
}

export function caseLawyerHint(code: string | undefined | null, fallback = 'Abrir el expediente.'): string {
  const key = (code || '').trim();
  return CASE_STATUS[key]?.lawyerHint ?? fallback;
}

export function caseFilterLabel(code: string | undefined | null, fallback = ''): string {
  const key = (code || '').trim();
  return CASE_STATUS[key]?.filterLabel ?? fallback;
}

/** Etapas en las que el abogado debe actuar (escritorio / te toca). */
export function caseNeedsLawyer(code: string | undefined | null): boolean {
  switch ((code || '').trim()) {
    case '03':
    case '04':
    case '06':
    case '07':
    case '08':
    case '09':
      return true;
    default:
      return false;
  }
}

/** Quién tiene la pelota, según la etapa. Cerrado = 10; el resto abierto sin te-toca es el cliente. */
export type CaseBall = 'lawyer' | 'client' | 'closed';

export function caseBall(code: string | undefined | null): CaseBall {
  const key = (code || '').trim();
  if (key === '10') return 'closed';
  if (caseNeedsLawyer(key)) return 'lawyer';
  return 'client';
}

export interface HoldStage {
  stage_code: string;
  stage: string;
  count: number;
  avg_days: number;
}

export interface CaseHoldInput {
  status: string;
  days_in_status?: number;
  updated_at?: string;
  created_at?: string;
}

export function caseDaysIn(c: CaseHoldInput): number | null {
  if (typeof c.days_in_status === 'number') return c.days_in_status;
  const t = Date.parse(c.updated_at || c.created_at || '');
  if (!t) return null;
  return Math.max(0, Math.floor((Date.now() - t) / 86400000));
}

export function caseHolds(cases: CaseHoldInput[]): HoldStage[] {
  const by = new Map<string, { count: number; days: number }>();
  for (const c of cases) {
    if (!CASE_STATUS[c.status] || c.status === '10') continue;
    const cur = by.get(c.status) || { count: 0, days: 0 };
    cur.count += 1;
    cur.days += caseDaysIn(c) ?? 0;
    by.set(c.status, cur);
  }
  return [...by.entries()]
    .map(([code, v]) => ({
      stage_code: code,
      stage: caseShort(code, code),
      count: v.count,
      avg_days: v.count ? v.days / v.count : 0,
    }))
    .sort((a, b) => b.avg_days - a.avg_days || b.count - a.count);
}

export function holdWait(h: HoldStage): string {
  const d = Math.round(h.avg_days);
  if (d <= 0) return 'Hoy';
  if (d === 1) return '1 día';
  return `${d} días`;
}
