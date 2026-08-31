import { GalleryItem } from '../pages/saas/elastic-gallery.component';
import { StatItem } from '../pages/saas/landing-statistics.component';
import { ProgressStep } from './progress-steps.component';
import { ProductFlowTheme } from './product-flow-shell.component';

export const CANONICAL_SLOGAN = 'Servicios jurídicos al mismo costo, sin filas ni trámites.';

export interface QuestionField {
  id: string;
  label: string;
  type: 'text' | 'select' | 'boolean';
  placeholder?: string;
  options?: { value: string; label: string }[];
  required?: boolean;
}

export interface ProductSiteConfig {
  slug: string;
  id: string;
  name: string;
  theme: ProductFlowTheme;
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
  workflow: { n: number; title: string; desc: string; screen: string }[];
  stats: StatItem[];
  gallery: GalleryItem[];
  testimonials: { quote: string; author: string; role: string }[];
  docTypes: { type: string; label: string }[];
  flowSteps: ProgressStep[];
  questionnaire: QuestionField[];
  plans: { name: string; audience: string; price: number; items: string[]; featured: boolean }[];
}

export const PRODUCT_SITES: Record<string, ProductSiteConfig> = {
  traslado360: {
    slug: 'traslado360',
    id: 'traslado360',
    name: 'Traslado360',
    theme: 'traslado',
    accent: 'oklch(0.42 0.09 210)',
    accentDeep: 'oklch(0.32 0.08 210)',
    accentSoft: 'oklch(0.94 0.03 190)',
    bg: 'oklch(0.97 0.008 220)',
    bgSoft: 'oklch(0.94 0.03 190)',
    price: 199,
    heroTitle: 'Traslado vehicular',
    heroHighlight: 'sin filas ni trámites.',
    heroLede: 'Mutuo acuerdo, pago único y reunión notarial virtual. Al mismo costo que presencial, desde tu pantalla.',
    heroImage: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=1400&q=80',
    workflow: [
      { n: 1, title: 'Cuestionario', desc: 'Datos del vehículo y acuerdo entre partes.', screen: 'Registro' },
      { n: 2, title: 'Pago único', desc: 'Honorario de demostración sin suscripción mensual.', screen: 'Pago' },
      { n: 3, title: 'Documentos', desc: 'Matrícula y acuerdo de traslado.', screen: 'Documentos' },
      { n: 4, title: 'Consulta', desc: 'Videollamada con abogado revisando el caso.', screen: 'Consulta' },
      { n: 5, title: 'Firma', desc: 'Minuta y firma electrónica con evidencia.', screen: 'Firma' },
      { n: 6, title: 'Notaría', desc: 'Reunión virtual con notario y cierre.', screen: 'Notaría' },
    ],
    stats: [
      { label: 'Tiempo intake', value: '4 min', detail: 'Formulario corto siempre apto demo.', icon: 'check' },
      { label: 'Honorario desde', value: '$199', detail: 'Pago único, sin membresía.', icon: 'scale' },
      { label: 'Documentos', value: '2', detail: 'Matrícula + acuerdo mutuo.', icon: 'file' },
      { label: 'Reuniones', value: '2', detail: 'Consulta abogado + notaría virtual.', icon: 'users' },
    ],
    gallery: [
      { id: '01', title: 'Cuestionario Traslado360', category: 'Intake', src: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=900&q=80', alt: 'Formulario traslado' },
      { id: '02', title: 'Pago único', category: 'Pago', src: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=900&q=80', alt: 'Pago trámite' },
      { id: '03', title: 'Expediente trazable', category: 'Timeline', src: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=900&q=80', alt: 'Expediente' },
      { id: '04', title: 'Reunión notarial', category: 'Notaría', src: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=900&q=80', alt: 'Videollamada notario' },
    ],
    testimonials: [
      { quote: 'Vendimos el auto en un día — sin ir a la notaría dos veces.', author: 'María V.', role: 'Cliente demo Quito' },
      { quote: 'El link Traslado360 nos da comisión por cada trámite cerrado.', author: 'Bufete Ruiz', role: 'Licencia LegalStation' },
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
        { value: 'no', label: 'No — vehículo al día' },
        { value: 'si', label: 'Sí — requiere revisión' },
      ], required: true },
      { id: 'notary_pref', label: 'Preferencia de notaría', type: 'select', options: [
        { value: 'virtual', label: 'Reunión virtual (recomendado)' },
        { value: 'presencial', label: 'Comparecencia presencial' },
      ], required: true },
    ],
    plans: [
      { name: 'Traslado estándar', audience: 'Mutuo acuerdo · vehículo al día', price: 199, items: ['Cuestionario apto demo', 'Pago único sin suscripción', 'Consulta + notaría virtual', 'Expediente trazable'], featured: true },
      { name: 'Con gravámenes', audience: 'Requiere revisión previa', price: 349, items: ['Evaluación jurídica', 'Plan de regularización', 'Honorario orientativo', 'Sin cobro automático'], featured: false },
    ],
  },
  bienraiz360: {
    slug: 'bienraiz360',
    id: 'bienraiz360',
    name: 'BienRaiz360',
    theme: 'bienraiz',
    accent: 'oklch(0.42 0.09 210)',
    accentDeep: 'oklch(0.32 0.08 210)',
    accentSoft: 'oklch(0.94 0.03 190)',
    bg: 'oklch(0.97 0.008 220)',
    bgSoft: 'oklch(0.94 0.03 190)',
    price: 299,
    heroTitle: 'Traslado de inmueble',
    heroHighlight: 'al mismo costo, sin filas.',
    heroLede: 'Dominio de terreno o propiedad con comparecencia digital. Pago único por trámite, sin membresía.',
    heroImage: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1400&q=80',
    workflow: [
      { n: 1, title: 'Cuestionario', desc: 'Datos del inmueble y partes de acuerdo.', screen: 'Registro' },
      { n: 2, title: 'Pago único', desc: 'Honorario de demostración sin plan mensual.', screen: 'Pago' },
      { n: 3, title: 'Documentos', desc: 'Título y acuerdo mutuo de traslado.', screen: 'Documentos' },
      { n: 4, title: 'Consulta', desc: 'Revisión jurídica por videollamada.', screen: 'Consulta' },
      { n: 5, title: 'Firma', desc: 'Escritura y firma electrónica documental.', screen: 'Firma' },
      { n: 6, title: 'Notaría', desc: 'Reunión virtual y registro.', screen: 'Notaría' },
    ],
    stats: [
      { label: 'Tiempo intake', value: '5 min', detail: 'Cuestionario con review lateral.', icon: 'check' },
      { label: 'Honorario desde', value: '$299', detail: 'Un solo pago al cliente.', icon: 'scale' },
      { label: 'Documentos', value: '2', detail: 'Título + acuerdo mutuo.', icon: 'file' },
      { label: 'Comparecencia', value: 'Virtual', detail: 'Notario en videollamada de demostración.', icon: 'building' },
    ],
    gallery: [
      { id: '01', title: 'Intake BienRaiz360', category: 'Cuestionario', src: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=900&q=80', alt: 'Formulario inmueble' },
      { id: '02', title: 'Honorario único', category: 'Precios', src: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=900&q=80', alt: 'Pago único' },
      { id: '03', title: 'Timeline expediente', category: 'Expediente', src: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=900&q=80', alt: 'Estados trámite' },
      { id: '04', title: 'Consulta abogado', category: 'Consulta', src: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=900&q=80', alt: 'Videollamada' },
    ],
    testimonials: [
      { quote: 'Trasladamos el terreno familiar sin perder un día en filas.', author: 'Carlos M.', role: 'Cliente demo Guayaquil' },
      { quote: 'BienRaiz360 cierra ventas inmobiliarias con trazabilidad.', author: 'Vega & Asociados', role: 'Bufete partner' },
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
        { value: 'si', label: 'Con gravamen — evaluación' },
      ], required: true },
      { id: 'meeting', label: 'Modalidad notarial', type: 'select', options: [
        { value: 'virtual', label: 'Reunión virtual' },
        { value: 'mixta', label: 'Híbrida demo' },
      ], required: true },
    ],
    plans: [
      { name: 'Traslado simple', audience: 'Mutuo acuerdo · sin gravámenes', price: 299, items: ['Flujo completo demo', 'Pago único sin suscripción', 'Consulta + notaría virtual', 'Expediente 10 estados'], featured: true },
      { name: 'Con gravamen', audience: 'Requiere plan de pago', price: 499, items: ['Evaluación jurídica', 'Estrategia de liberación', 'Honorario orientativo', 'Contacto operador'], featured: false },
    ],
  },
};

export function getProductSite(slug: string): ProductSiteConfig | null {
  return PRODUCT_SITES[slug] ?? null;
}

export function productThemeFromCase(product?: string): ProductFlowTheme {
  if (product === 'traslado360') return 'traslado';
  if (product === 'bienraiz360') return 'bienraiz';
  return 'divorcio';
}

export function setActiveProduct(product: string): void {
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem('ls_active_product', product);
  }
}

export function getActiveProduct(): string {
  if (typeof sessionStorage === 'undefined') return 'divorcio360';
  return sessionStorage.getItem('ls_active_product') || 'divorcio360';
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
}

export function getProductFlowMeta(product?: string): ProductFlowMeta {
  const p = product || 'divorcio360';
  if (p === 'traslado360' || p === 'bienraiz360') {
    const s = getProductSite(p);
    if (s) {
      return {
        name: s.name,
        productHome: `/productos/${s.slug}`,
        docTypes: s.docTypes,
        flowSteps: s.flowSteps,
      };
    }
  }
  return {
    name: 'Divorcio360',
    productHome: '/productos/divorcio360',
    docTypes: DIVORCIO_DOC_TYPES,
    flowSteps: DIVORCIO_FLOW_STEPS,
  };
}
