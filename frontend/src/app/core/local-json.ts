/** JSON in localStorage. sessionStorage is a read fallback for older drafts. */

export const Q_RESULT_KEY = 'd360_q_result';
export const DIVORCIO_Q_DRAFT_KEY = 'd360_q_draft_divorcio360';

export function productQDraftKey(slug: string): string {
  return `ls_product_q_${slug}`;
}

export function readLocalJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key) ?? sessionStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function writeLocalJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota / private mode */
  }
}

export function writeLocalAndSessionJson(key: string, value: unknown): void {
  const raw = JSON.stringify(value);
  try {
    localStorage.setItem(key, raw);
  } catch {
    /* quota / private mode */
  }
  try {
    sessionStorage.setItem(key, raw);
  } catch {
    /* quota / private mode */
  }
}

export function clearLocalJson(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    /* private mode */
  }
  try {
    sessionStorage.removeItem(key);
  } catch {
    /* private mode */
  }
}
