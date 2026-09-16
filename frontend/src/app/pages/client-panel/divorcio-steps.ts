import { getProductDisplayName, getProductFlowMeta, getProductQuestionnairePath, normalizeProductId } from '../../shared/product-sites.data';
import { CaseItem } from '../../core/api.service';
import { IconName } from '../../shared/icon.component';

export type ProductDeskStepId = 'pay' | 'docs' | 'call' | 'sign' | 'notary';
export type ProductDeskStepState = 'done' | 'current' | 'upcoming' | 'locked';

export type TimelineProductId = 'divorcio360' | 'traslado360';

export interface ProductDeskStep {
  id: ProductDeskStepId;
  label: string;
  state: ProductDeskStepState;
  icon: IconName;
  hint: string;
}

const BASE_STEPS: { id: ProductDeskStepId; label: string; icon: IconName }[] = [
  { id: 'pay', label: 'Pago', icon: 'credit-card' },
  { id: 'docs', label: 'Documentos', icon: 'upload' },
  { id: 'call', label: 'Consulta', icon: 'video' },
  { id: 'sign', label: 'Firma', icon: 'signature' },
  { id: 'notary', label: 'Notaría', icon: 'building' },
];

export function isTimelineProduct(id: string): id is TimelineProductId {
  return id === 'divorcio360' || id === 'traslado360';
}

export function productEmptyCopy(product: string): {
  title: string;
  hint: string;
  cta: string;
  path: string;
  icon: IconName;
} {
  if (product === 'traslado360') {
    return {
      title: 'Tu traslado vehicular',
      hint: 'Mutuo acuerdo, pago único y notaría virtual. Abre tu expediente sin salir del panel.',
      cta: 'Iniciar traslado',
      path: getProductQuestionnairePath('traslado360'),
      icon: 'file',
    };
  }
  return {
    title: 'Un solo expediente',
    hint: 'El divorcio es un trámite único. Evalúa tu caso y ábrelo aquí, sin salir del panel.',
    cta: 'Evaluar mi caso',
    path: getProductQuestionnairePath('divorcio360'),
    icon: 'scale',
  };
}

function stepHint(product: string, id: ProductDeskStepId): string {
  const docs = getProductFlowMeta(product).docTypes.map((d) => d.label).join(' y ');
  switch (id) {
    case 'pay':
      return product === 'traslado360'
        ? 'Honorario único del traslado vehicular.'
        : 'Honorario único del trámite.';
    case 'docs':
      return docs ? `${docs}.` : 'Documentos requeridos del trámite.';
    case 'call':
      return 'Solicita videollamada con tu abogado.';
    case 'sign':
      return 'Firma la minuta cuando esté lista.';
    case 'notary':
      return product === 'traslado360'
        ? 'Reunión notarial virtual y cierre del traslado.'
        : 'Comparecencia y cierre notarial.';
  }
}

/** Urgencia del expediente: más alto, más te toca. Ordena la lista y elige el caso del desk,
    para que la tarjeta extendida sea la primera y no la última. */
export function caseUrgency(c: CaseItem): number {
  if (!c.paid) return 400;
  if (c.status === '02') return 300;
  if (c.can_sign) return 350;
  if (c.status === '05') return 280;
  if (c.status !== '10') return 100 + Number(c.status || '0');
  return 0;
}

/** Fecha larga en el idioma del producto: "15 sept 2026". */
export function formatDateLong(iso?: string): string {
  const d = new Date(iso || '');
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('es-EC', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Fecha corta, para las tarjetas de la lista: "15 sept". */
export function formatDateShort(iso?: string): string {
  const d = new Date(iso || '');
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('es-EC', { day: 'numeric', month: 'short' });
}

/** Prefer the case that needs action for this product. */
export function pickProductCase(cases: CaseItem[], product: string): CaseItem | null {
  const id = normalizeProductId(product);
  const list = cases.filter((c) => normalizeProductId(c.product) === id);
  if (!list.length) return null;
  return [...list].sort((a, b) => caseUrgency(b) - caseUrgency(a) || b.id - a.id)[0];
}

export function productStepState(c: CaseItem | null, id: ProductDeskStepId): ProductDeskStepState {
  if (!c) return 'locked';
  const status = c.status || '00';
  const statusNum = Number(status);
  const paid = !!c.paid;
  const docsDone = statusNum >= 3;
  const consultDone = Boolean(c.consultation_at);
  const signed = !!c.has_signature;
  const pastConsult = consultDone || !!c.can_sign || signed || statusNum >= 5;
  const notaryStarted = statusNum >= 6;

  switch (id) {
    case 'pay':
      if (paid) return 'done';
      return 'current';
    case 'docs':
      if (!paid) return 'locked';
      if (docsDone) return 'done';
      return 'current';
    case 'call':
      if (!paid || !docsDone) return 'locked';
      if (pastConsult) return 'done';
      return 'current';
    case 'sign':
      if (!paid || !docsDone) return 'locked';
      if (signed) return 'done';
      if (c.can_sign || status === '05') return 'current';
      if (notaryStarted) return 'done';
      return 'upcoming';
    case 'notary':
      if (!signed && !notaryStarted) return 'locked';
      if (status === '10') return 'done';
      if (notaryStarted) return 'current';
      return 'upcoming';
    default:
      return 'upcoming';
  }
}

export function buildProductSteps(c: CaseItem | null, product: string): ProductDeskStep[] {
  return BASE_STEPS.map((m) => ({
    ...m,
    hint: stepHint(product, m.id),
    state: productStepState(c, m.id),
  }));
}

export function currentProductStep(c: CaseItem | null, product: string): ProductDeskStepId {
  const steps = buildProductSteps(c, product);
  const current = steps.find((s) => s.state === 'current');
  if (current) return current.id;
  const upcoming = steps.find((s) => s.state === 'upcoming');
  if (upcoming) return upcoming.id;
  return 'notary';
}

export function productDocSlots(product: string): { type: string; label: string }[] {
  return getProductFlowMeta(product).docTypes.map((d) => ({ type: d.type, label: d.label }));
}

export function productStepTitle(id: ProductDeskStepId): string {
  switch (id) {
    case 'pay': return 'Completa el pago';
    case 'docs': return 'Sube tus documentos';
    case 'call': return 'Solicita tu consulta';
    case 'sign': return 'Firma tu minuta';
    case 'notary': return 'Notaría y cierre';
  }
}

export function productSideDesc(product: string): string {
  if (product === 'traslado360') return 'Un expediente · vehículo';
  if (product === 'divorcio360') return 'Un expediente · mutuo acuerdo';
  return getProductDisplayName(product);
}

/* --- Back-compat aliases used by existing divorcio specs --- */
export type DivorcioStepId = ProductDeskStepId;
export type DivorcioStepState = ProductDeskStepState;
export type DivorcioStep = ProductDeskStep;
export const pickDivorcioCase = (cases: CaseItem[]) => pickProductCase(cases, 'divorcio360');
export const divorcioStepState = productStepState;
export const buildDivorcioSteps = (c: CaseItem | null) => buildProductSteps(c, 'divorcio360');
export const currentDivorcioStep = (c: CaseItem | null) => currentProductStep(c, 'divorcio360');
export const divorcioDocSlots = productDocSlots;
export const divorcioStepTitle = productStepTitle;
