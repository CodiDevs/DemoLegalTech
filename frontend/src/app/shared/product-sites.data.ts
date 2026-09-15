import { BehaviorSubject, Observable } from 'rxjs';
import { GalleryItem } from '../pages/saas/elastic-gallery.component';
import { ProgressStep } from './progress-steps.component';
import { ProductFlowTheme } from './product-flow-shell.component';

export const CANONICAL_SLOGAN = 'Trámites civiles con expediente digital y honorario de referencia.';

export interface QuestionField {
  id: string;
  label: string;
  type: 'text' | 'select' | 'boolean';
  placeholder?: string;
  options?: { value: string; label: string }[];
  required?: boolean;
}

export interface ProductCatalogEntry {
  id: string;
  name: string;
  tagline: string;
  pillDesc: string;
  icon: 'scale' | 'file' | 'building' | 'pen' | 'folder' | 'shield';
  iconBg: string;
  image: string;
  showcaseImage: string;
  showcaseDesc: string;
  features: string[];
  live: boolean;
  route: string;
}

export interface ProductSiteConfig {
  slug: string;
  id: string;
  name: string;
  theme: ProductFlowTheme;
  live?: boolean;
  accent: string;
  accentDeep: string;
  accentSoft: string;
  bg: string;
  bgSoft: string;
  price: number;
  heroTitle: string;
  heroHighlight: string;
  heroLede: string;
  heroImage: string;
  ctaTitle: string;
  workflow: { n: number; title: string; desc: string; screen: string }[];
  values?: { title: string; desc: string }[];
  gallery: GalleryItem[];
  docTypes: { type: string; label: string }[];
  flowSteps: ProgressStep[];
  questionnaire: QuestionField[];
  plans: { name: string; audience: string; price: number; items: string[]; featured: boolean }[];
}

export type MarketingRole = 'cliente' | 'abogado' | 'notario' | null;

export interface MarketingPrimaryAction {
  label: string;
  path: string;
  query?: Record<string, string>;
}

export const PRODUCT_SITES: Record<string, ProductSiteConfig> = {
  divorcio360: {
    slug: 'divorcio360',
    id: 'divorcio360',
    name: 'Divorcio360',
    theme: 'divorcio',
    live: true,
    accent: 'var(--primary)',
    accentDeep: 'var(--primary-hover)',
    accentSoft: 'var(--primary-subtle)',
    bg: 'var(--bg)',
    bgSoft: 'var(--bg-subtle)',
    price: 349,
    heroTitle: 'Divorcio por',
    heroHighlight: 'mutuo acuerdo.',
    heroLede: 'Evalúa si tu caso encaja. Luego documentos, consulta, firma y cierre en un solo expediente.',
    heroImage: '/demo-scenes/legal-draft-demo.svg',
    ctaTitle: 'Evalúa si tu caso encaja',
    workflow: [
      {
        n: 1,
        title: 'Evaluar',
        desc: 'Cuestionario guiado con un resultado explicado en lenguaje claro.',
        screen: 'Cuestionario',
      },
      {
        n: 2,
        title: 'Confirmar',
        desc: 'Revisión del resultado antes de generar cualquier cobro.',
        screen: 'Resultado',
      },
      {
        n: 3,
        title: 'Documentar',
        desc: 'Carga de cédula y partida para revisión del operador.',
        screen: 'Documentos',
      },
      {
        n: 4,
        title: 'Consultar',
        desc: 'Solicitud de consulta para revisar el expediente con un abogado.',
        screen: 'Consulta',
      },
      {
        n: 5,
        title: 'Firmar',
        desc: 'Carga del documento firmado con fecha y evidencia técnica.',
        screen: 'Firma',
      },
      {
        n: 6,
        title: 'Cerrar',
        desc: 'Seguimiento del cierre hasta el acta y el archivo del expediente.',
        screen: 'Resultado',
      },
    ],
    values: [
      {
        title: 'Evaluación antes del cobro',
        desc: 'El cuestionario explica si el caso puede continuar por este recorrido.',
      },
      {
        title: 'Un expediente compartido',
        desc: 'Cliente y operador consultan documentos, mensajes y estado en el mismo lugar.',
      },
      {
        title: 'Acciones visibles',
        desc: 'Cada etapa muestra qué falta y quién debe realizar la siguiente acción.',
      },
    ],
    gallery: [
      { id: '01', title: 'Cuestionario Divorcio360', category: 'Cuestionario', src: '/demo-scenes/legal-draft-demo.svg', alt: 'Minuta de ejemplo' },
      { id: '02', title: 'Expediente', category: 'Línea de estados', src: '/demo-scenes/identity-demo.svg', alt: 'Identidad de ejemplo' },
    ],
    docTypes: [
      { type: 'cedula', label: 'Cédula de identidad' },
      { type: 'partida', label: 'Partida de matrimonio' },
    ],
    flowSteps: [
      { id: 'q', label: 'Cuestionario' },
      { id: 'pay', label: 'Pago' },
      { id: 'docs', label: 'Documentos' },
      { id: 'call', label: 'Consulta' },
      { id: 'sign', label: 'Firma' },
      { id: 'notary', label: 'Notaría' },
    ],
    questionnaire: [],
    plans: [
      {
        name: 'Caso por mutuo acuerdo',
        audience: 'Mutuo acuerdo · honorario de referencia',
        price: 349,
        items: [
          'Evaluación inicial',
          'Expediente digital',
          'Revisión documental',
          'Carga de firma',
        ],
        featured: true,
      },
    ],
  },
  traslado360: {
    slug: 'traslado360',
    id: 'traslado360',
    name: 'Traslado360',
    theme: 'traslado',
    live: true,
    accent: 'var(--primary)',
    accentDeep: 'var(--primary-hover)',
    accentSoft: 'var(--primary-subtle)',
    bg: 'var(--bg)',
    bgSoft: 'var(--bg-subtle)',
    price: 199,
    heroTitle: 'Traslado vehicular',
    heroHighlight: 'sin filas.',
    heroLede: 'Mutuo acuerdo, pago único y reunión notarial virtual. El mismo recorrido que en presencial, desde tu pantalla.',
    heroImage: '/demo-scenes/identity-demo.svg',
    ctaTitle: 'Traslado y notaría en un solo recorrido',
    workflow: [
      { n: 1, title: 'Cuestionario', desc: 'Datos del vehículo y acuerdo entre partes.', screen: 'Registro' },
      { n: 2, title: 'Pago único', desc: 'Honorario único sin suscripción mensual.', screen: 'Pago' },
      { n: 3, title: 'Documentos', desc: 'Matrícula y acuerdo de traslado.', screen: 'Documentos' },
      { n: 4, title: 'Consulta', desc: 'Videollamada con abogado revisando el caso.', screen: 'Consulta' },
      { n: 5, title: 'Firma', desc: 'Minuta y firma electrónica con evidencia.', screen: 'Firma' },
      { n: 6, title: 'Notaría', desc: 'Reunión virtual con notario y cierre.', screen: 'Notaría' },
    ],
    gallery: [
      { id: '01', title: 'Cuestionario Traslado360', category: 'Cuestionario', src: '/demo-scenes/legal-draft-demo.svg', alt: 'Formulario traslado' },
      { id: '02', title: 'Pago único', category: 'Pago', src: '/demo-scenes/signature-demo.svg', alt: 'Pago trámite' },
      { id: '03', title: 'Expediente trazable', category: 'Línea de estados', src: '/demo-scenes/marriage-record-demo.svg', alt: 'Expediente' },
      { id: '04', title: 'Reunión notarial', category: 'Notaría', src: '/demo-scenes/legal-seal-demo.svg', alt: 'Videollamada notario' },
    ],
    docTypes: [
      { type: 'matricula', label: 'Matrícula vehicular' },
      { type: 'acuerdo', label: 'Acuerdo de traslado firmado' },
    ],
    flowSteps: [
      { id: 'q', label: 'Cuestionario' },
      { id: 'pay', label: 'Pago' },
      { id: 'docs', label: 'Documentos' },
      { id: 'call', label: 'Consulta' },
      { id: 'sign', label: 'Firma' },
      { id: 'notary', label: 'Notaría' },
    ],
    questionnaire: [
      { id: 'city', label: 'Ciudad del trámite', type: 'text', placeholder: 'Quito', required: true },
      { id: 'plate', label: 'Placa del vehículo', type: 'text', placeholder: 'ABC-1234', required: true },
      { id: 'brand', label: 'Marca y modelo', type: 'text', placeholder: 'Toyota Corolla 2020', required: true },
      { id: 'mutual', label: '¿Ambas partes están de acuerdo?', type: 'boolean', required: true },
      { id: 'debts', label: '¿Multas o gravámenes pendientes?', type: 'select', options: [
        { value: 'no', label: 'No, vehículo al día' },
        { value: 'si', label: 'Sí, requiere revisión' },
      ], required: true },
      { id: 'notary_pref', label: 'Preferencia de notaría', type: 'select', options: [
        { value: 'virtual', label: 'Reunión virtual (recomendado)' },
        { value: 'presencial', label: 'Comparecencia presencial' },
      ], required: true },
    ],
    plans: [
      { name: 'Traslado estándar', audience: 'Mutuo acuerdo · vehículo al día', price: 199, items: ['Cuestionario de elegibilidad', 'Pago único sin suscripción', 'Consulta + notaría virtual', 'Expediente trazable'], featured: true },
      { name: 'Con gravámenes', audience: 'Requiere revisión previa', price: 349, items: ['Evaluación jurídica', 'Plan de regularización', 'Honorario orientativo', 'Sin cobro automático'], featured: false },
    ],
  },
  bienraiz360: {
    slug: 'bienraiz360',
    id: 'bienraiz360',
    name: 'BienRaiz360',
    theme: 'bienraiz',
    live: true,
    accent: 'var(--primary)',
    accentDeep: 'var(--primary-hover)',
    accentSoft: 'var(--primary-subtle)',
    bg: 'var(--bg)',
    bgSoft: 'var(--bg-subtle)',
    price: 299,
    heroTitle: 'Traslado de inmueble',
    heroHighlight: 'sin gravámenes.',
    heroLede: 'Dominio de terreno o propiedad con comparecencia digital y pago único por trámite, sin membresía.',
    heroImage: '/demo-scenes/marriage-record-demo.svg',
    ctaTitle: 'Inmueble y notaría en un solo recorrido',
    workflow: [
      { n: 1, title: 'Cuestionario', desc: 'Datos del inmueble y partes de acuerdo.', screen: 'Registro' },
      { n: 2, title: 'Pago único', desc: 'Honorario único sin plan mensual.', screen: 'Pago' },
      { n: 3, title: 'Documentos', desc: 'Título y acuerdo mutuo de traslado.', screen: 'Documentos' },
      { n: 4, title: 'Consulta', desc: 'Revisión jurídica por videollamada.', screen: 'Consulta' },
      { n: 5, title: 'Firma', desc: 'Escritura y firma electrónica documental.', screen: 'Firma' },
      { n: 6, title: 'Notaría', desc: 'Reunión virtual y registro.', screen: 'Notaría' },
    ],
    gallery: [
      { id: '01', title: 'Cuestionario BienRaiz360', category: 'Cuestionario', src: '/demo-scenes/marriage-record-demo.svg', alt: 'Formulario inmueble' },
      { id: '02', title: 'Honorario único', category: 'Precios', src: '/demo-scenes/signature-demo.svg', alt: 'Pago único' },
      { id: '03', title: 'Línea de estados del expediente', category: 'Expediente', src: '/demo-scenes/marriage-record-demo.svg', alt: 'Estados trámite' },
      { id: '04', title: 'Consulta abogado', category: 'Consulta', src: '/demo-scenes/legal-seal-demo.svg', alt: 'Videollamada' },
    ],
    docTypes: [
      { type: 'titulo', label: 'Escritura o título del inmueble' },
      { type: 'acuerdo', label: 'Acuerdo mutuo de traslado' },
    ],
    flowSteps: [
      { id: 'q', label: 'Cuestionario' },
      { id: 'pay', label: 'Pago' },
      { id: 'docs', label: 'Documentos' },
      { id: 'call', label: 'Consulta' },
      { id: 'sign', label: 'Firma' },
      { id: 'notary', label: 'Notaría' },
    ],
    questionnaire: [
      { id: 'city', label: 'Ciudad del inmueble', type: 'text', placeholder: 'Guayaquil', required: true },
      { id: 'property_type', label: 'Tipo de bien', type: 'select', options: [
        { value: 'casa', label: 'Casa / departamento' },
        { value: 'terreno', label: 'Terreno' },
        { value: 'local', label: 'Local comercial' },
      ], required: true },
      { id: 'cadastre', label: 'Referencia catastral (opcional)', type: 'text', placeholder: 'Nº registro' },
      { id: 'mutual', label: '¿Vendedor y comprador de acuerdo?', type: 'boolean', required: true },
      { id: 'liens', label: '¿Gravámenes o hipotecas?', type: 'select', options: [
        { value: 'no', label: 'Libre de gravámenes' },
        { value: 'si', label: 'Con gravamen, sujeto a evaluación' },
      ], required: true },
      { id: 'meeting', label: 'Modalidad notarial', type: 'select', options: [
        { value: 'virtual', label: 'Reunión virtual' },
        { value: 'mixta', label: 'Híbrida' },
      ], required: true },
    ],
    plans: [
      { name: 'Traslado simple', audience: 'Mutuo acuerdo · sin gravámenes', price: 299, items: ['Flujo completo', 'Pago único sin suscripción', 'Consulta + notaría virtual', 'Expediente 10 estados'], featured: true },
      { name: 'Con gravamen', audience: 'Requiere plan de pago', price: 499, items: ['Evaluación jurídica', 'Estrategia de liberación', 'Honorario orientativo', 'Contacto operador'], featured: false },
    ],
  },
  signdesk: {
    slug: 'signdesk',
    id: 'signdesk',
    name: 'SignDesk',
    theme: 'legalstation',
    live: false,
    accent: '#2f6f68',
    accentDeep: '#275c56',
    accentSoft: '#e7f1f0',
    bg: '#f7f7f5',
    bgSoft: '#e7f1f0',
    price: 149,
    heroTitle: 'Firma electrónica',
    heroHighlight: 'para documentos legales.',
    heroLede: 'Sobres de firma, auditoría y plantillas reutilizables en un hub de firma acreditada.',
    heroImage: '/demo-scenes/signature-demo.svg',
    ctaTitle: 'Firma documentos legales con trazabilidad',
    workflow: [
      { n: 1, title: 'Evaluar caso', desc: 'Define el tipo de documento y firmantes.', screen: 'Registro' },
      { n: 2, title: 'Configurar', desc: 'Plantilla y orden de firma.', screen: 'Configuración' },
      { n: 3, title: 'Enviar', desc: 'Sobre de firma a las partes.', screen: 'Envío' },
      { n: 4, title: 'Auditoría', desc: 'Evidencia y trazabilidad.', screen: 'Auditoría' },
    ],
    gallery: [],
    docTypes: [{ type: 'documento', label: 'Documento a firmar' }],
    flowSteps: [
      { id: 'q', label: 'Evaluación' },
      { id: 'config', label: 'Configuración' },
      { id: 'send', label: 'Envío' },
    ],
    questionnaire: [
      { id: 'doc_type', label: '¿Qué tipo de documento necesitas firmar?', type: 'select', options: [
        { value: 'contrato', label: 'Contrato' },
        { value: 'poder', label: 'Poder notarial' },
        { value: 'acuerdo', label: 'Acuerdo entre partes' },
      ], required: true },
      { id: 'signers', label: '¿Cuántos firmantes participan?', type: 'select', options: [
        { value: '2', label: '2 personas' },
        { value: '3', label: '3 o más' },
      ], required: true },
      { id: 'urgency', label: '¿Cuándo necesitas la firma?', type: 'select', options: [
        { value: 'hoy', label: 'Hoy' },
        { value: 'semana', label: 'Esta semana' },
      ], required: true },
    ],
    plans: [{ name: 'Sobre estándar', audience: 'Hasta 3 firmantes', price: 149, items: ['Firma ECI', 'Auditoría legal'], featured: true }],
  },
  matterflow: {
    slug: 'matterflow',
    id: 'matterflow',
    name: 'MatterFlow',
    theme: 'legalstation',
    live: false,
    accent: '#2f6f68',
    accentDeep: '#275c56',
    accentSoft: '#e7f1f0',
    bg: '#f7f7f5',
    bgSoft: '#e7f1f0',
    price: 0,
    heroTitle: 'CRM de expedientes',
    heroHighlight: 'para bufetes.',
    heroLede: 'Bandeja, alertas de plazos y notas visibles al cliente.',
    heroImage: '/demo-scenes/legal-seal-demo.svg',
    ctaTitle: 'Ordena la operación del bufete',
    workflow: [
      { n: 1, title: 'Evaluar', desc: 'Tipo de operación y volumen.', screen: 'Registro' },
      { n: 2, title: 'Configurar', desc: 'Bandeja y plazos.', screen: 'Configuración' },
    ],
    gallery: [],
    docTypes: [],
    flowSteps: [{ id: 'q', label: 'Evaluación' }, { id: 'setup', label: 'Configuración' }],
    questionnaire: [
      { id: 'team_size', label: '¿Cuántos abogados hay en tu bufete?', type: 'select', options: [
        { value: '1-3', label: '1 a 3' },
        { value: '4-10', label: '4 a 10' },
        { value: '10+', label: 'Más de 10' },
      ], required: true },
      { id: 'volume', label: '¿Cuántos casos activos gestionas al mes?', type: 'select', options: [
        { value: 'bajo', label: 'Menos de 20' },
        { value: 'medio', label: '20 a 100' },
        { value: 'alto', label: 'Más de 100' },
      ], required: true },
    ],
    plans: [{ name: 'Licencia operadores', audience: 'Operadores', price: 249, items: ['Bandeja unificada', 'Plazos y alertas', 'Notas al cliente'], featured: true }],
  },
  compliancehub: {
    slug: 'compliancehub',
    id: 'compliancehub',
    name: 'ComplianceHub',
    theme: 'legalstation',
    live: false,
    accent: '#2f6f68',
    accentDeep: '#275c56',
    accentSoft: '#e7f1f0',
    bg: '#f7f7f5',
    bgSoft: '#e7f1f0',
    price: 0,
    heroTitle: 'Cumplimiento LOPDP',
    heroHighlight: 'con auditoría.',
    heroLede: 'Consentimiento, trazas de acceso y exportes para cumplimiento normativo.',
    heroImage: '/demo-scenes/paper-fibers.svg',
    ctaTitle: 'Cumple la LOPDP con evidencia',
    workflow: [
      { n: 1, title: 'Evaluar', desc: 'Alcance de datos personales.', screen: 'Registro' },
      { n: 2, title: 'Implementar', desc: 'Políticas y consentimiento.', screen: 'Configuración' },
    ],
    gallery: [],
    docTypes: [],
    flowSteps: [{ id: 'q', label: 'Evaluación' }],
    questionnaire: [
      { id: 'data_types', label: '¿Qué datos personales procesas?', type: 'select', options: [
        { value: 'clientes', label: 'Datos de clientes' },
        { value: 'empleados', label: 'Datos de empleados' },
        { value: 'ambos', label: 'Clientes y empleados' },
      ], required: true },
      { id: 'records', label: '¿Tienes registro de tratamiento de datos?', type: 'boolean', required: true },
    ],
    plans: [{ name: 'Cumplimiento', audience: 'Bufetes', price: 199, items: ['LOPDP', 'Exportes'], featured: true }],
  },
  notarylink: {
    slug: 'notarylink',
    id: 'notarylink',
    name: 'NotaryLink',
    theme: 'legalstation',
    live: false,
    accent: '#2f6f68',
    accentDeep: '#275c56',
    accentSoft: '#e7f1f0',
    bg: '#f7f7f5',
    bgSoft: '#e7f1f0',
    price: 0,
    heroTitle: 'Agenda notarial',
    heroHighlight: 'y comparecencia digital.',
    heroLede: 'Directorio de notarías, comparecencia y seguimiento hasta acta emitida.',
    heroImage: '/demo-scenes/legal-seal-demo.svg',
    ctaTitle: 'Agenda notaría y comparecencia',
    workflow: [
      { n: 1, title: 'Evaluar', desc: 'Tipo de acto notarial.', screen: 'Registro' },
      { n: 2, title: 'Agendar', desc: 'Notaría y fecha.', screen: 'Agenda' },
    ],
    gallery: [],
    docTypes: [],
    flowSteps: [{ id: 'q', label: 'Evaluación' }],
    questionnaire: [
      { id: 'act_type', label: '¿Qué acto notarial necesitas?', type: 'select', options: [
        { value: 'poder', label: 'Poder' },
        { value: 'escritura', label: 'Escritura' },
        { value: 'comparecencia', label: 'Comparecencia' },
      ], required: true },
      { id: 'city', label: 'Ciudad', type: 'text', placeholder: 'Quito', required: true },
    ],
    plans: [{ name: 'Agenda', audience: 'Comparecencias', price: 99, items: ['Directorio de notarías', 'Seguimiento de actas'], featured: true }],
  },
};

export function getProductSite(slug: string): ProductSiteConfig | null {
  return PRODUCT_SITES[slug] ?? null;
}

/** Ruta del cuestionario según producto. */
export function getProductQuestionnairePath(slug: string): string {
  const id = normalizeProductId(slug);
  if (id === 'divorcio360') return '/cuestionario';
  return `/productos/${id}/cuestionario`;
}

export function getMarketingPrimaryAction(
  role: MarketingRole,
  product = 'divorcio360',
): MarketingPrimaryAction {
  if (role === 'cliente') {
    return { label: 'Mis expedientes', path: '/cliente' };
  }
  if (role === 'abogado') return { label: 'Panel de casos', path: '/abogado' };
  if (role === 'notario') return { label: 'Inicio', path: '/' };
  return {
    label: 'Evaluar mi caso',
    path: getProductQuestionnairePath(product),
  };
}

/** CTA “Iniciar Formulario” — guest y cliente van al cuestionario; auth al cobrar. */
export function getDivorcioFormAction(
  role: MarketingRole,
  product = 'divorcio360',
): MarketingPrimaryAction | null {
  if (role === 'abogado' || role === 'notario') return null;
  return {
    label: 'Iniciar Formulario',
    path: getProductQuestionnairePath(product),
  };
}

/** Ruta del expediente filtrado por producto. */
export function getProductExpedientePath(slug: string): string {
  return `/productos/${normalizeProductId(slug)}/expediente`;
}

export function normalizeProductId(product?: string | null): string {
  const p = (product || '').trim();
  return p || 'divorcio360';
}

export function getProductDisplayName(slug: string): string {
  return getProductSite(slug)?.name ?? (slug === 'divorcio360' ? 'Divorcio360' : slug);
}

export function detectProductFromPath(path: string): string | null {
  const clean = path.split('?')[0].split('#')[0];
  if (clean === '/cuestionario') return 'divorcio360';
  const m = clean.match(/^\/productos\/([^/]+)/);
  return m ? m[1] : null;
}

export const LEGALSTATION_CATALOG: ProductCatalogEntry[] = [
  {
    id: 'divorcio360', name: 'Divorcio360', tagline: 'Mutuo consentimiento con cuestionario, pago y expediente trazable.',
    pillDesc: 'Contratos de divorcio notarial', icon: 'scale', iconBg: '#e8efe6',
    image: '/demo-scenes/legal-draft-demo.svg',
    showcaseImage: '/demo-scenes/legal-draft-demo.svg',
    showcaseDesc: 'Cuestionario de elegibilidad, pago, expediente de 10 estados y firma.',
    features: ['Cuestionario de elegibilidad', '10 estados de trámite', 'Firma y minuta'],
    live: true, route: '/productos/divorcio360',
  },
  {
    id: 'traslado360', name: 'Traslado360', tagline: 'Traslado vehicular con acuerdo mutuo y firma notarial.',
    pillDesc: 'Traslado de vehículo', icon: 'file', iconBg: '#e8f4f8',
    image: '/demo-scenes/traslado360-shot.png',
    showcaseImage: '/demo-scenes/traslado360-shot.png',
    showcaseDesc: 'Mutuo acuerdo, pago único, documentos y reunión virtual con notario.',
    features: ['Sitio producto completo', 'Pago único', 'Consulta + notaría virtual'],
    live: true, route: '/productos/traslado360',
  },
  {
    id: 'bienraiz360', name: 'BienRaiz360', tagline: 'Traslado de bienes inmuebles con comparecencia digital.',
    pillDesc: 'Traslado de inmueble', icon: 'building', iconBg: '#f0ebe3',
    image: '/demo-scenes/bienraiz360-shot.png',
    showcaseImage: '/demo-scenes/bienraiz360-shot.png',
    showcaseDesc: 'Traslado de dominio de terreno o inmueble con reunión virtual.',
    features: ['Sitio producto completo', 'Honorario único', 'Expediente trazable'],
    live: true, route: '/productos/bienraiz360',
  },
  {
    id: 'signdesk', name: 'SignDesk', tagline: 'Hub de firma electrónica para documentos legales.',
    pillDesc: 'Firma ECI integrada', icon: 'pen', iconBg: '#f5ebe3',
    image: '/demo-scenes/signature-demo.svg',
    showcaseImage: '/demo-scenes/signature-demo.svg',
    showcaseDesc: 'Sobres de firma, auditoría legal y plantillas reutilizables.',
    features: ['Sobre de firma', 'Auditoría legal', 'Plantillas reutilizables'],
    live: false, route: '/productos/signdesk',
  },
  {
    id: 'matterflow', name: 'MatterFlow', tagline: 'Bandeja, plazos y notas para operadores jurídicos.',
    pillDesc: 'CRM de expedientes', icon: 'folder', iconBg: '#e3eef5',
    image: '/demo-scenes/legal-seal-demo.svg',
    showcaseImage: '/demo-scenes/legal-seal-demo.svg',
    showcaseDesc: 'Bandeja del operador, alertas de plazos y notas al cliente.',
    features: ['Bandeja unificada', 'Alertas de plazos', 'Notas al cliente'],
    live: false, route: '/productos/matterflow',
  },
  {
    id: 'compliancehub', name: 'ComplianceHub', tagline: 'Consentimiento, retención y exportes de cumplimiento.',
    pillDesc: 'Cumplimiento LOPDP', icon: 'shield', iconBg: '#e3f5ef',
    image: '/demo-scenes/paper-fibers.svg',
    showcaseImage: '/demo-scenes/paper-fibers.svg',
    showcaseDesc: 'Consentimiento en registro, trazas de acceso y exportes de auditoría.',
    features: ['Registro LOPDP', 'Trazas de acceso', 'Reportes de auditoría'],
    live: false, route: '/productos/compliancehub',
  },
  {
    id: 'notarylink', name: 'NotaryLink', tagline: 'Agenda, comparecencia y seguimiento de actas.',
    pillDesc: 'Agenda notarial EC', icon: 'building', iconBg: '#f0ebe3',
    image: '/demo-scenes/legal-seal-demo.svg',
    showcaseImage: '/demo-scenes/legal-seal-demo.svg',
    showcaseDesc: 'Directorio de notarías, comparecencia y seguimiento de actas.',
    features: ['Directorio de notarías', 'Estado de comparecencia', 'Seguimiento de actas'],
    live: false, route: '/productos/notarylink',
  },
];

export function productThemeFromCase(product?: string): ProductFlowTheme {
  if (product === 'traslado360') return 'traslado';
  if (product === 'bienraiz360') return 'bienraiz';
  return 'divorcio';
}

const activeProductSubject = new BehaviorSubject<string>(
  typeof sessionStorage !== 'undefined'
    ? sessionStorage.getItem('ls_active_product') || 'divorcio360'
    : 'divorcio360',
);

/** Persist + broadcast product context so Shell branding stays in sync with case flows. */
export function setActiveProduct(product: string): void {
  const id = normalizeProductId(product);
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem('ls_active_product', id);
  }
  if (activeProductSubject.value !== id) {
    activeProductSubject.next(id);
  }
}

export function getActiveProduct(): string {
  if (typeof sessionStorage !== 'undefined') {
    return sessionStorage.getItem('ls_active_product') || 'divorcio360';
  }
  return activeProductSubject.value || 'divorcio360';
}

export function watchActiveProduct(): Observable<string> {
  return activeProductSubject.asObservable();
}

/** Breadcrumb for post-auth client steps: Mis trámites → Producto → (opcional expediente) → paso. */
export function buildClientFlowCrumb(
  product: string | undefined,
  step: string,
  opts?: { caseId?: number; includeExpediente?: boolean },
): { label: string; link?: string }[] {
  const meta = getProductFlowMeta(product);
  const crumbs: { label: string; link?: string }[] = [
    { label: 'Mis trámites', link: '/cliente' },
  ];
  if (meta.productHome) {
    crumbs.push({ label: meta.name, link: meta.productHome });
  }
  if (opts?.includeExpediente && opts.caseId) {
    crumbs.push({
      label: `Expediente #${opts.caseId}`,
      link: `/caso/${opts.caseId}`,
    });
  }
  crumbs.push({ label: step });
  return crumbs;
}

const DIVORCIO_DOC_TYPES = [
  { type: 'cedula', label: 'Cédula de identidad' },
  { type: 'partida', label: 'Partida de matrimonio' },
];

const DIVORCIO_FLOW_STEPS: ProgressStep[] = [
  { id: 'q', label: 'Cuestionario' },
  { id: 'pay', label: 'Pago' },
  { id: 'docs', label: 'Documentos' },
  { id: 'call', label: 'Consulta' },
  { id: 'sign', label: 'Firma' },
  { id: 'notary', label: 'Notaría' },
];

export interface ProductFlowMeta {
  name: string;
  productHome?: string;
  docTypes: { type: string; label: string }[];
  flowSteps: ProgressStep[];
  /** Pasos visibles tras el pago (documentos → consulta → firma). */
  clientFlowSteps: ProgressStep[];
}

/** IDs de pasos que el cliente recorre en upload / consulta / firma. */
export const CLIENT_POST_PAYMENT_STEP_IDS = ['docs', 'call', 'sign'] as const;

export function getClientFlowSteps(steps: ProgressStep[]): ProgressStep[] {
  const allowed = new Set<string>(CLIENT_POST_PAYMENT_STEP_IDS);
  return steps.filter((s) => allowed.has(s.id));
}

export function clientFlowStepIndex(steps: ProgressStep[], stepId: string): number {
  const client = getClientFlowSteps(steps);
  const index = client.findIndex((s) => s.id === stepId);
  return Math.max(0, index);
}

export function getProductFlowMeta(product?: string): ProductFlowMeta {
  const p = normalizeProductId(product);
  const s = getProductSite(p);
  const flowSteps = s
    ? (s.flowSteps.length ? s.flowSteps : DIVORCIO_FLOW_STEPS)
    : DIVORCIO_FLOW_STEPS;
  if (s) {
    return {
      name: s.name,
      productHome: `/productos/${s.slug}`,
      docTypes: s.docTypes.length ? s.docTypes : DIVORCIO_DOC_TYPES,
      flowSteps,
      clientFlowSteps: getClientFlowSteps(flowSteps),
    };
  }
  return {
    name: 'Divorcio360',
    productHome: '/productos/divorcio360',
    docTypes: DIVORCIO_DOC_TYPES,
    flowSteps,
    clientFlowSteps: getClientFlowSteps(flowSteps),
  };
}
