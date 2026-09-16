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

/** Orden canónico del motor de 10 estados (una sola lista en el repo). */
export const CASE_STATUS_CODES = CASE_STATUS_KEYS;

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
  ...CASE_STATUS_CODES.map((code) => ({ id: code as string, label: CASE_STATUS[code].filterLabel })),
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
