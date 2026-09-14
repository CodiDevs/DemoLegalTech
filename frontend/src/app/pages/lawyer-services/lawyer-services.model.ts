export const SERVICE_CATEGORIES = [
  { id: 'familia', label: 'Familia' },
  { id: 'penal', label: 'Penal' },
  { id: 'administrativo', label: 'Administrativo' },
  { id: 'civil', label: 'Civil' },
  { id: 'laboral', label: 'Laboral' },
  { id: 'notarial', label: 'Notarial' },
  { id: 'transito', label: 'Tránsito' },
] as const;

export function categoryLabel(id: string): string {
  return SERVICE_CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

export function moneyUSD(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value || 0);
}

export function apiErrorMessage(err: unknown, fallback: string): string {
  const e = err as { error?: { error?: string; message?: string } };
  return e?.error?.error || e?.error?.message || fallback;
}
