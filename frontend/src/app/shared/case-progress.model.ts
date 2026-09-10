import { IconName } from './icon.component';

export type CaseProgressStatus = 'done' | 'current' | 'upcoming';
export type CaseProgressLayout = 'auto' | 'horizontal' | 'vertical';
export type CaseProgressVariant = 'marketing' | 'case';

export interface CaseProgressStage {
  id: string;
  label: string;
  description?: string;
  icon: IconName;
  status: CaseProgressStatus;
  date?: string;
  meta?: string;
}

/** Iconos de UI para los 10 estados del expediente (labels vienen del backend). */
export const CASE_STATUS_ICONS: Record<string, IconName> = {
  '01': 'inbox',
  '02': 'file-text',
  '03': 'scale',
  '04': 'folder',
  '05': 'signature',
  '06': 'building',
  '07': 'users',
  '08': 'check-circle',
  '09': 'flag',
  '10': 'check-circle',
};

export const CASE_STATUS_KEYS = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10'] as const;

export interface CaseProgressEventLike {
  status?: string;
  created_at?: string;
}

/** Construye etapas visuales desde el estado actual y el mapa `states` del API. */
export function buildCaseProgressStages(
  currentStatus: string,
  states: Record<string, string>,
  events?: CaseProgressEventLike[],
  orderedKeys: readonly string[] = CASE_STATUS_KEYS,
): CaseProgressStage[] {
  const dateByStatus = new Map<string, string>();
  for (const event of events || []) {
    if (!event.status || !event.created_at || dateByStatus.has(event.status)) continue;
    dateByStatus.set(event.status, event.created_at);
  }

  return orderedKeys.map((key) => {
    let status: CaseProgressStatus = 'upcoming';
    if (key < currentStatus) status = 'done';
    else if (key === currentStatus) status = 'current';

    return {
      id: key,
      label: states[key] || key,
      icon: CASE_STATUS_ICONS[key] || 'flag',
      status,
      date: dateByStatus.get(key),
      meta: key,
    };
  });
}

export interface MarketingWorkflowStep {
  id?: string;
  n: number;
  title: string;
  desc: string;
  icon: IconName;
  screen?: string;
}

/** Etapas de marketing: hasta `currentIndex` completadas, ese índice en curso. */
export function buildMarketingProgressStages(
  steps: MarketingWorkflowStep[],
  currentIndex = 0,
): CaseProgressStage[] {
  return steps.map((step, index) => {
    let status: CaseProgressStatus = 'upcoming';
    if (index < currentIndex) status = 'done';
    else if (index === currentIndex) status = 'current';

    return {
      id: step.id || String(step.n),
      label: step.title,
      description: step.desc,
      icon: step.icon,
      status,
      meta: step.screen,
    };
  });
}
