import { LawyerAnswerType, LawyerServiceQuestion } from '../../core/api.service';

export const SERVICE_CATEGORIES = [
  { id: 'familia', label: 'Familia' },
  { id: 'penal', label: 'Penal' },
  { id: 'administrativo', label: 'Administrativo' },
  { id: 'civil', label: 'Civil' },
  { id: 'laboral', label: 'Laboral' },
  { id: 'notarial', label: 'Notarial' },
  { id: 'transito', label: 'Tránsito' },
] as const;

export const ANSWER_TYPES: { id: LawyerAnswerType; label: string }[] = [
  { id: 'boolean', label: 'Sí / No' },
  { id: 'text', label: 'Texto libre' },
  { id: 'cedula_ec', label: 'Cédula ecuatoriana' },
  { id: 'passport', label: 'Pasaporte' },
  { id: 'number', label: 'Número' },
  { id: 'date', label: 'Fecha' },
  { id: 'no_aplica', label: 'No aplica' },
];

export function categoryLabel(id: string): string {
  return SERVICE_CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

export function answerTypeLabel(id: string): string {
  return ANSWER_TYPES.find((t) => t.id === id)?.label ?? id;
}

export function moneyUSD(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value || 0);
}

export function centsToUsdInput(cents?: number): number {
  return Math.round((cents || 0) / 100);
}

export function usdInputToCents(usd: number | string): number {
  const n = Number(usd);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.round(n * 100);
}

export function apiErrorMessage(err: unknown, fallback: string): string {
  const e = err as { error?: { error?: string; message?: string } };
  return e?.error?.error || e?.error?.message || fallback;
}

export function newQuestionId(existing: LawyerServiceQuestion[]): string {
  let n = existing.length + 1;
  const used = new Set(existing.map((q) => q.id).filter(Boolean));
  while (used.has(`q${n}`)) n += 1;
  return `q${n}`;
}

export function newNoAplicaId(existing: LawyerServiceQuestion[]): string {
  const used = new Set(existing.map((q) => q.id).filter(Boolean));
  if (!used.has('no_aplica')) return 'no_aplica';
  let n = 2;
  while (used.has(`no_aplica_${n}`)) n += 1;
  return `no_aplica_${n}`;
}

/** Upgrade legacy {prompt, kind} rows into graph nodes. */
export function hydrateQuestions(raw: LawyerServiceQuestion[] | undefined): LawyerServiceQuestion[] {
  const list = raw ?? [];
  return list.map((q, i) => {
    const id = q.id || `q${i + 1}`;
    let answer_type = (q.answer_type || '') as string;
    if (!answer_type) {
      answer_type = q.kind === 'texto' || q.kind === 'text' ? 'text' : q.kind === 'no_aplica' ? 'no_aplica' : 'boolean';
    }
    if (answer_type === 'si_no') answer_type = 'boolean';
    if (answer_type === 'texto') answer_type = 'text';
    const kind =
      answer_type === 'boolean' ? 'si_no' : answer_type === 'text' ? 'texto' : answer_type;
    return {
      id,
      prompt: q.prompt,
      kind,
      answer_type,
      required: answer_type === 'no_aplica' ? false : (q.required ?? true),
      price_delta_cents: q.price_delta_cents || 0,
      price_on_yes_cents: q.price_on_yes_cents || 0,
      price_on_no_cents: q.price_on_no_cents || 0,
      next: q.next || '',
      branch_yes: q.branch_yes || '',
      branch_no: q.branch_no || '',
    };
  });
}

export function isBooleanQuestion(q: LawyerServiceQuestion): boolean {
  const t = q.answer_type || q.kind;
  return t === 'boolean' || q.kind === 'si_no';
}

export function isNoAplicaQuestion(q: LawyerServiceQuestion): boolean {
  return (q.answer_type || q.kind) === 'no_aplica';
}

export function defaultNoAplicaPrompt(): string {
  return 'Este trámite no aplica a tu caso. Puedes agendar una asesoría para revisar otras opciones.';
}
