import { CaseItem } from '../../../core/api.service';
import { caseBall, caseDaysIn, caseLawyerHint, caseNeedsLawyer, caseShort } from '../../../shared/case-status.data';
import { getProductDisplayName } from '../../../shared/product-sites.data';

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const LIST_CAP = 4;

export interface DeskBrief {
  kicker: string;
  meta: string;
  summary: string;
  next: string;
  late: string;
}

export function foldQuery(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');
}

export function intakeMs(c: Pick<CaseItem, 'created_at'>): number {
  const t = Date.parse(c.created_at || '');
  return Number.isFinite(t) ? t : Number.POSITIVE_INFINITY;
}

export function intakeLabel(iso: string | undefined): string {
  const t = Date.parse(iso || '');
  if (!Number.isFinite(t)) return 'sin fecha de ingreso';
  const d = new Date(t);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
}

export function daysLabel(n: number | null): string {
  if (n === null) return 'sin días';
  if (n <= 0) return 'hoy';
  if (n === 1) return '1 día';
  return `${n} días`;
}

export function isLateCase(c: CaseItem): boolean {
  if (c.sla_warning) return true;
  const days = caseDaysIn(c);
  return days !== null && days >= 5;
}

export function openCases(list: CaseItem[]): CaseItem[] {
  return list.filter((c) => (c.status || '').trim() !== '10');
}

export function lawyerPile(list: CaseItem[]): CaseItem[] {
  return list.filter((c) => caseNeedsLawyer(c.status));
}

export function clientPile(list: CaseItem[]): CaseItem[] {
  return openCases(list).filter((c) => caseBall(c.status) === 'client');
}

/** Más urgente: fuera de plazo, luego ingreso más viejo, luego días en etapa. */
export function sortByIntake(list: CaseItem[]): CaseItem[] {
  return [...list].sort((a, b) => {
    const sla = Number(!!b.sla_warning) - Number(!!a.sla_warning);
    if (sla) return sla;
    const late = Number(isLateCase(b)) - Number(isLateCase(a));
    if (late) return late;
    const created = intakeMs(a) - intakeMs(b);
    if (created) return created;
    const days = (caseDaysIn(b) ?? 0) - (caseDaysIn(a) ?? 0);
    if (days) return days;
    return a.id - b.id;
  });
}

export function productName(c: Pick<CaseItem, 'product'>): string {
  return getProductDisplayName(c.product || 'divorcio360');
}

export function clientName(c: Pick<CaseItem, 'client_name'>): string {
  return (c.client_name || '').trim() || 'Cliente';
}

export function ballLabel(c: CaseItem): string {
  switch (caseBall(c.status)) {
    case 'lawyer':
      return 'te toca';
    case 'closed':
      return 'cerrado';
    default:
      return 'espera al cliente';
  }
}

export function caseRef(c: CaseItem): string {
  const stage = caseShort(c.status, c.status_label || c.status);
  const days = daysLabel(caseDaysIn(c));
  return `#${c.id} · ${stage} · ${days} · ${ballLabel(c)}`;
}

function capped(list: CaseItem[]): string {
  if (!list.length) return '';
  const head = list.slice(0, LIST_CAP).map(caseRef);
  const extra = list.length - head.length;
  if (extra > 0) head.push(`y ${extra} más`);
  return head.join('; ');
}

function findCase(list: CaseItem[], id: number): CaseItem | undefined {
  if (id <= 0) return undefined;
  return list.find((c) => c.id === id);
}

function lateLine(list: CaseItem[]): string {
  const late = sortByIntake(openCases(list).filter(isLateCase));
  if (!late.length) return '';
  return `Fuera de plazo: ${capped(late)}.`;
}

export function briefDesk(list: CaseItem[], selectedId: number): DeskBrief {
  const selected = findCase(list, selectedId);
  if (selected) {
    const stage = caseShort(selected.status, selected.status_label || selected.status);
    const hint = caseLawyerHint(selected.status, selected.status_label || 'Abrir el expediente.');
    const days = daysLabel(caseDaysIn(selected));
    const first = sortByIntake(openCases(list))[0];
    let next = '';
    if (first && first.id !== selected.id) {
      next = `En la bandeja, primero por ingreso: ${caseRef(first)} (ingreso ${intakeLabel(first.created_at)}).`;
    } else if (caseBall(selected.status) === 'lawyer') {
      next = hint;
    } else if (caseBall(selected.status) === 'client') {
      next = `Espera al cliente. ${hint}`;
    }
    return {
      kicker: `#${selected.id} · ${clientName(selected)}`,
      meta: `${productName(selected)} · ${stage}`,
      summary: `Ingreso ${intakeLabel(selected.created_at)}. ${days} en esta etapa. ${hint}`,
      next,
      late: isLateCase(selected) ? `Fuera de plazo: ${days} en ${stage}.` : '',
    };
  }

  const mine = sortByIntake(lawyerPile(list));
  const waiting = sortByIntake(clientPile(list));
  const first = sortByIntake(openCases(list))[0];
  const kMine = mine.length === 1 ? '1 te toca' : `${mine.length} te tocan`;
  const kWait = waiting.length === 1 ? '1 espera al cliente' : `${waiting.length} esperan al cliente`;
  if (!list.length) {
    return {
      kicker: 'Bandeja',
      meta: '',
      summary: 'No hay expedientes en la bandeja.',
      next: '',
      late: '',
    };
  }
  if (!openCases(list).length) {
    return {
      kicker: 'Bandeja',
      meta: 'Nada abierto',
      summary: 'Todos los expedientes están cerrados.',
      next: '',
      late: '',
    };
  }
  return {
    kicker: 'Bandeja',
    meta: `${kMine} · ${kWait}`,
    summary: first
      ? `Primero por ingreso: ${caseRef(first)} (ingreso ${intakeLabel(first.created_at)}).`
      : 'Nada abierto.',
    next: mine.length ? `Te toca: ${capped(mine)}.` : waiting.length ? `Espera al cliente: ${capped(waiting)}.` : '',
    late: lateLine(list),
  };
}

function replyDocs(list: CaseItem[], selectedId: number): string {
  const first = sortByIntake(openCases(list))[0];
  const extra = first ? ` Primero por ingreso: ${caseRef(first)}.` : '';
  const selected = findCase(list, selectedId);
  const here = selected ? ` Este folio está en ${caseShort(selected.status, selected.status_label || selected.status)}.` : '';
  return `No leo el contenido de los documentos.${here}${extra} Pregunta por pendiente, prioridad o quién espera.`;
}

function replyMinuta(c: CaseItem | undefined): string {
  if (!c) {
    return 'Elige un expediente o pregunta qué está pendiente. La minuta es una etapa, no un PDF leído.';
  }
  const stage = caseShort(c.status, c.status_label || c.status);
  const hint = caseLawyerHint(c.status, c.status_label || 'Abrir el expediente.');
  if ((c.status || '') === '04' || c.has_minuta) {
    return `#${c.id} está en ${stage}. ${hint} No leo el archivo de la minuta.`;
  }
  if ((c.status || '') < '04') {
    return `#${c.id} sigue en ${stage}. La minuta viene después. ${hint}`;
  }
  return `#${c.id} ya pasó de minuta. Ahora: ${stage}. ${hint}`;
}

function replyPending(list: CaseItem[]): string {
  const mine = sortByIntake(lawyerPile(list));
  const waiting = sortByIntake(clientPile(list));
  if (!mine.length && !waiting.length) {
    return openCases(list).length ? 'Nada pendiente con etapa abierta.' : 'No hay expedientes en la bandeja.';
  }
  const parts: string[] = [];
  if (mine.length) parts.push(`Te toca: ${capped(mine)}.`);
  if (waiting.length) parts.push(`Espera al cliente: ${capped(waiting)}.`);
  const late = lateLine(list);
  if (late) parts.push(late);
  return parts.join(' ');
}

function replyPriority(list: CaseItem[]): string {
  const ranked = sortByIntake(openCases(list));
  if (!ranked.length) return 'No hay expedientes abiertos.';
  const first = ranked[0];
  const rest = ranked.slice(1, LIST_CAP);
  let out = `Primero #${first.id}: ingreso ${intakeLabel(first.created_at)}, ${caseRef(first)}.`;
  if (isLateCase(first)) out += ' Fuera de plazo.';
  if (rest.length) out += ` Siguen: ${rest.map(caseRef).join('; ')}.`;
  return out;
}

function replyBall(list: CaseItem[]): string {
  const mine = lawyerPile(list).length;
  const waiting = clientPile(list).length;
  const closed = list.length - openCases(list).length;
  const parts: string[] = [];
  if (mine) parts.push(mine === 1 ? '1 folio te espera' : `${mine} folios te esperan`);
  if (waiting) parts.push(waiting === 1 ? '1 espera al cliente' : `${waiting} esperan al cliente`);
  if (!parts.length) {
    return closed ? 'Nada en juego: todo cerrado.' : 'No hay expedientes en la bandeja.';
  }
  let out = `${parts.join('. ')}.`;
  const firstMine = sortByIntake(lawyerPile(list))[0];
  const firstWait = sortByIntake(clientPile(list))[0];
  if (firstMine) out += ` Te toca empezar por ${caseRef(firstMine)}.`;
  else if (firstWait) out += ` El más viejo del cliente: ${caseRef(firstWait)}.`;
  return out;
}

function replyCase(c: CaseItem): string {
  const hint = caseLawyerHint(c.status, c.status_label || 'Abrir el expediente.');
  const late = isLateCase(c) ? ' Fuera de plazo.' : '';
  return `#${c.id} · ${productName(c)} · ${caseShort(c.status, c.status_label || c.status)}. Ingreso ${intakeLabel(c.created_at)}. ${daysLabel(caseDaysIn(c))} en esta etapa. ${hint}${late}`;
}

export function answerDesk(message: string, list: CaseItem[], selectedId: number): string {
  const q = foldQuery(message.trim());
  if (!q) return 'Escribe una pregunta sobre pendiente, prioridad o quién espera.';

  const selected = findCase(list, selectedId);
  const readsDoc =
    q.includes('pdf') ||
    q.includes('ocr') ||
    q.includes('cedula') ||
    q.includes('partida') ||
    q.includes('lee el') ||
    q.includes('leer') ||
    q.includes('leyo') ||
    q.includes('leiste') ||
    (q.includes('documento') && !q.includes('pendiente'));

  if (readsDoc) return replyDocs(list, selectedId);
  if (q.includes('minuta')) return replyMinuta(selected);
  if (q.includes('quien') || q.includes('pelota') || q.includes('a quien')) return replyBall(list);
  if (
    q.includes('primero') ||
    q.includes('priorid') ||
    q.includes('important') ||
    q.includes('antigu') ||
    q.includes('ingreso') ||
    q.includes('viejo') ||
    q.includes('plazo') ||
    q.includes('atras')
  ) {
    return replyPriority(list);
  }
  if (q.includes('pendiente') || q.includes('detenid') || q.includes('me toca') || q.includes('te toca')) {
    return replyPending(list);
  }
  if (q.includes('sigue') || q.includes('siguiente') || q.includes('ahora')) {
    return selected ? replyCase(selected) : replyPending(list);
  }
  if (selected) return replyCase(selected);
  return replyPriority(list);
}
