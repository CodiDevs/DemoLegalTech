/** Etiquetas legibles para variables de plantilla — nunca mostrar {{ }} al abogado. */
const LABELS: Record<string, string> = {
  cliente_nombre: 'Nombre del cliente',
  conyuge_nombre: 'Nombre del cónyuge',
  ciudad_notaria: 'Ciudad del trámite',
  ciudad: 'Ciudad',
  causante: 'Persona fallecida',
  fecha_matrimonio: 'Fecha de matrimonio',
  fecha_divorcio: 'Fecha del divorcio',
  notaria: 'Oficina registral',
  abogado_nombre: 'Abogado responsable',
  monto: 'Monto acordado',
  bienes: 'Descripción de bienes',
};

export function friendlyFieldLabel(raw: string): string {
  const key = raw.replace(/^\{\{|\}\}$/g, '').trim();
  if (LABELS[key]) return LABELS[key];
  return key
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/** Token canónico `{{campo}}` para guardar. Acepta label humano o token. */
export function toFieldToken(raw: string): string {
  const trimmed = raw.replace(/^\{\{|\}\}$/g, '').trim();
  if (!trimmed) return '';
  const lower = trimmed.toLowerCase();
  for (const [key, label] of Object.entries(LABELS)) {
    if (label.toLowerCase() === lower || key === lower) return `{{${key}}}`;
  }
  const key = trimmed.toLowerCase().replace(/\s+/g, '_');
  return `{{${key}}}`;
}
