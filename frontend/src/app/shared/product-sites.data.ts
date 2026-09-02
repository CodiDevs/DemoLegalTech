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
  divorcio360: {
    slug: 'divorcio360',
    id: 'divorcio360',
    name: 'Divorcio360',
    theme: 'divorcio',
    live: true,
    accent: '#4a9e96',
    accentDeep: '#3a827b',
    accentSoft: '#e8f6f4',
    bg: '#f7fcfb',
    bgSoft: '#eef8f6',
    price: 349,
    heroTitle: 'Divorcio por mutuo acuerdo',
    heroHighlight: 'sin filas ni papeleo.',
    heroLede: 'Califica tu caso en minutos, paga una sola vez y gestiona todo el trámite desde tu expediente digital.',
    heroImage: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1400&q=80',
    workflow: [
      { n: 1, title: 'Evaluar caso', desc: 'Cuestionario condicional con resultado inmediato.', screen: 'Registro' },
      { n: 2, title: 'Pago único', desc: 'Honorario único sin suscripción.', screen: 'Pago' },
      { n: 3, title: 'Documentos', desc: 'Cédula y partida de matrimonio.', screen: 'Documentos' },
      { n: 4, title: 'Consulta', desc: 'Videollamada con abogado.', screen: 'Consulta' },
      { n: 5, title: 'Firma', desc: 'Minuta y firma documental.', screen: 'Firma' },
      { n: 6, title: 'Notaría', desc: 'Reunión virtual y cierre.', screen: 'Notaría' },
    ],
    stats: [
      { label: 'Estados trazables', value: '10', detail: 'Timeline único cliente y operador.', icon: 'file' },
      { label: 'Tiempo intake', value: '5 min', detail: 'Cuestionario con resultado inmediato.', icon: 'check' },
      { label: 'Honorarios desde', value: '$349', detail: 'Pago único si calificas.', icon: 'scale' },
      { label: 'Firma electrónica', value: '1 paso', detail: 'Evidencia y trazabilidad.', icon: 'pen' },
    ],
    gallery: [
      { id: '01', title: 'Cuestionario Divorcio360', category: 'Intake', src: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=900&q=80', alt: 'Formulario divorcio' },
      { id: '02', title: 'Expediente', category: 'Timeline', src: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=900&q=80', alt: 'Expediente' },
    ],
    testimonials: [
      { quote: 'Resolvimos el divorcio sin ir dos veces a la notaría.', author: 'Ana R.', role: 'Cliente demo Quito' },
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
      { name: 'Apto notarial', audience: 'Mutuo consentimiento sin conflictos', price: 349, items: ['Cuestionario verde', 'Flujo completo demo', 'Expediente trazable'], featured: true },
      { name: 'Evaluación', audience: 'Casos con complejidad media', price: 749, items: ['Revisión humana', 'Plan personalizado'], featured: false },
    ],
  },
  traslado360: {
    slug: 'traslado360',
    id: 'traslado360',
    name: 'Traslado360',
    theme: 'traslado',
    live: true,
    accent: '#2f5f9e',
    accentDeep: '#274e83',
    accentSoft: '#e8eff8',
    bg: '#f7f7f5',
    bgSoft: '#e8eff8',
    price: 199,
    heroTitle: 'Traslado vehicular',
    heroHighlight: 'sin filas ni trámites.',
    heroLede: 'Mutuo acuerdo, pago único y reunión notarial virtual — al mismo costo que presencial, desde tu pantalla.',
    heroImage: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=1400&q=80',
    workflow: [
      { n: 1, title: 'Cuestionario', desc: 'Datos del vehículo y acuerdo entre partes.', screen: 'Registro' },
      { n: 2, title: 'Pago único', desc: 'Honorario único sin suscripción mensual.', screen: 'Pago' },
      { n: 3, title: 'Documentos', desc: 'Matrícula y acuerdo de traslado.', screen: 'Documentos' },
      { n: 4, title: 'Consulta', desc: 'Videollamada con abogado revisando el caso.', screen: 'Consulta' },
      { n: 5, title: 'Firma', desc: 'Minuta y firma electrónica con evidencia.', screen: 'Firma' },
      { n: 6, title: 'Notaría', desc: 'Reunión virtual con notario y cierre.', screen: 'Notaría' },
    ],
    stats: [
      { label: 'Tiempo intake', value: '4 min', detail: 'Formulario corto siempre apto demo.', icon: 'check' },
      { label: 'Honorario desde', value: '$199', detail: 'Pago único — sin membresía.', icon: 'scale' },
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
    live: true,
    accent: '#7a5a38',
    accentDeep: '#63482c',
    accentSoft: '#f4efe7',
    bg: '#f7f7f5',
    bgSoft: '#f4efe7',
    price: 299,
    heroTitle: 'Traslado de inmueble',
    heroHighlight: 'al mismo costo, sin filas.',
    heroLede: 'Dominio de terreno o propiedad con comparecencia digital — pago único por trámite, sin membresía.',
    heroImage: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1400&q=80',
    workflow: [
      { n: 1, title: 'Cuestionario', desc: 'Datos del inmueble y partes de acuerdo.', screen: 'Registro' },
      { n: 2, title: 'Pago único', desc: 'Honorario único sin plan mensual.', screen: 'Pago' },
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
  signdesk: {
    slug: 'signdesk',
    id: 'signdesk',
    name: 'SignDesk',
    theme: 'legalstation',
    live: false,
    accent: '#4455c4',
    accentDeep: '#3344a8',
    accentSoft: '#eef0fb',
    bg: '#f7f7f5',
    bgSoft: '#eef0fb',
    price: 149,
    heroTitle: 'Firma electrónica',
    heroHighlight: 'para documentos legales.',
    heroLede: 'Sobres de firma, auditoría y plantillas reutilizables en un hub de firma acreditada.',
    heroImage: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=1400&q=80',
    workflow: [
      { n: 1, title: 'Evaluar caso', desc: 'Define el tipo de documento y firmantes.', screen: 'Registro' },
      { n: 2, title: 'Configurar', desc: 'Plantilla y orden de firma.', screen: 'Configuración' },
      { n: 3, title: 'Enviar', desc: 'Sobre de firma a las partes.', screen: 'Envío' },
      { n: 4, title: 'Auditoría', desc: 'Evidencia y trazabilidad.', screen: 'Auditoría' },
    ],
    stats: [
      { label: 'Firmantes', value: 'Ilimitado', detail: 'Demo multi-parte.', icon: 'users' },
      { label: 'Plantillas', value: '12+', detail: 'Reutilizables por bufete.', icon: 'file' },
    ],
    gallery: [],
    testimonials: [],
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
    plans: [{ name: 'Sobre estándar', audience: 'Hasta 3 firmantes', price: 149, items: ['Firma ECI demo', 'Auditoría legal'], featured: true }],
  },
  matterflow: {
    slug: 'matterflow',
    id: 'matterflow',
    name: 'MatterFlow',
    theme: 'legalstation',
    live: false,
    accent: '#4455c4',
    accentDeep: '#3344a8',
    accentSoft: '#eef0fb',
    bg: '#f7f7f5',
    bgSoft: '#eef0fb',
    price: 0,
    heroTitle: 'CRM de expedientes',
    heroHighlight: 'para operadores legales.',
    heroLede: 'Bandeja, alertas SLA, pipeline kanban y notas visibles al cliente.',
    heroImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1400&q=80',
    workflow: [
      { n: 1, title: 'Evaluar', desc: 'Tipo de operación y volumen.', screen: 'Registro' },
      { n: 2, title: 'Configurar', desc: 'Pipeline y SLA.', screen: 'Configuración' },
    ],
    stats: [{ label: 'Casos demo', value: '50+', detail: 'Bandeja unificada.', icon: 'folder' }],
    gallery: [],
    testimonials: [],
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
    plans: [{ name: 'Licencia demo', audience: 'Operadores', price: 249, items: ['Kanban', 'SLA', 'Notas al cliente'], featured: true }],
  },
  compliancehub: {
    slug: 'compliancehub',
    id: 'compliancehub',
    name: 'ComplianceHub',
    theme: 'legalstation',
    live: false,
    accent: '#4455c4',
    accentDeep: '#3344a8',
    accentSoft: '#eef0fb',
    bg: '#f7f7f5',
    bgSoft: '#eef0fb',
    price: 0,
    heroTitle: 'Cumplimiento LOPDP',
    heroHighlight: 'y auditoría de datos.',
    heroLede: 'Consentimiento, trazas de acceso y exportes para cumplimiento normativo.',
    heroImage: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1400&q=80',
    workflow: [
      { n: 1, title: 'Evaluar', desc: 'Alcance de datos personales.', screen: 'Registro' },
      { n: 2, title: 'Implementar', desc: 'Políticas y consentimiento.', screen: 'Configuración' },
    ],
    stats: [{ label: 'Trazas', value: '100%', detail: 'Acceso auditado.', icon: 'shield' }],
    gallery: [],
    testimonials: [],
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
    plans: [{ name: 'Cumplimiento demo', audience: 'Bufetes', price: 199, items: ['LOPDP', 'Exportes'], featured: true }],
  },
  notarylink: {
    slug: 'notarylink',
    id: 'notarylink',
    name: 'NotaryLink',
    theme: 'legalstation',
    live: false,
    accent: '#4455c4',
    accentDeep: '#3344a8',
    accentSoft: '#eef0fb',
    bg: '#f7f7f5',
    bgSoft: '#eef0fb',
    price: 0,
    heroTitle: 'Agenda notarial',
    heroHighlight: 'y comparecencia digital.',
    heroLede: 'Directorio de notarías, comparecencia y seguimiento hasta acta emitida.',
    heroImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1400&q=80',
    workflow: [
      { n: 1, title: 'Evaluar', desc: 'Tipo de acto notarial.', screen: 'Registro' },
      { n: 2, title: 'Agendar', desc: 'Notaría y fecha.', screen: 'Agenda' },
    ],
    stats: [{ label: 'Notarías demo', value: '24', detail: 'Directorio EC.', icon: 'building' }],
    gallery: [],
    testimonials: [],
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
    plans: [{ name: 'Agenda demo', audience: 'Comparecencias', price: 99, items: ['Directorio', 'SATJE sync demo'], featured: true }],
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
    id: 'divorcio360', name: 'Divorcio360', tagline: 'Mutuo consentimiento con intake, pago y expediente trazable.',
    pillDesc: 'Contratos de divorcio notarial', icon: 'scale', iconBg: '#e8efe6',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=80',
    showcaseImage: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1400&q=80',
    showcaseDesc: 'Intake con cuestionario inteligente, pago, expediente de 10 estados y firma — el flujo completo en vivo.',
    features: ['Cuestionario inteligente', '10 estados de trámite', 'Firma y minuta'],
    live: true, route: '/productos/divorcio360',
  },
  {
    id: 'traslado360', name: 'Traslado360', tagline: 'Traslado vehicular con acuerdo mutuo y firma notarial.',
    pillDesc: 'Traslado de vehículo', icon: 'file', iconBg: '#e8f4f8',
    image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=800&q=80',
    showcaseImage: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=1400&q=80',
    showcaseDesc: 'Mutuo acuerdo, pago único, documentos y reunión virtual con notario.',
    features: ['Sitio producto completo', 'Pago único', 'Consulta + notaría virtual'],
    live: true, route: '/productos/traslado360',
  },
  {
    id: 'bienraiz360', name: 'BienRaiz360', tagline: 'Traslado de bienes inmuebles con comparecencia digital.',
    pillDesc: 'Traslado de inmueble', icon: 'building', iconBg: '#f0ebe3',
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80',
    showcaseImage: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1400&q=80',
    showcaseDesc: 'Traslado de dominio de terreno o inmueble con reunión virtual.',
    features: ['Sitio producto completo', 'Honorario único', 'Expediente trazable'],
    live: true, route: '/productos/bienraiz360',
  },
  {
    id: 'signdesk', name: 'SignDesk', tagline: 'Hub de firma electrónica para documentos legales.',
    pillDesc: 'Firma ECI integrada', icon: 'pen', iconBg: '#f5ebe3',
    image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=800&q=80',
    showcaseImage: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=1400&q=80',
    showcaseDesc: 'Sobres de firma, auditoría legal y plantillas reutilizables.',
    features: ['Sobre de firma', 'Auditoría legal', 'Plantillas reutilizables'],
    live: false, route: '/productos/signdesk',
  },
  {
    id: 'matterflow', name: 'MatterFlow', tagline: 'Bandeja, SLA y pipeline para operadores jurídicos.',
    pillDesc: 'CRM de expedientes', icon: 'folder', iconBg: '#e3eef5',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    showcaseImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1400&q=80',
    showcaseDesc: 'Bandeja operador, alertas SLA, pipeline kanban y notas al cliente.',
    features: ['Vista kanban', 'Alertas SLA', 'Notas al cliente'],
    live: false, route: '/productos/matterflow',
  },
  {
    id: 'compliancehub', name: 'ComplianceHub', tagline: 'Consentimiento, retención y exportes de cumplimiento.',
    pillDesc: 'Cumplimiento LOPDP', icon: 'shield', iconBg: '#e3f5ef',
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
    showcaseImage: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1400&q=80',
    showcaseDesc: 'Consentimiento en registro, trazas de acceso y exportes de auditoría.',
    features: ['Registro LOPDP', 'Trazas de acceso', 'Reportes demo'],
    live: false, route: '/productos/compliancehub',
  },
  {
    id: 'notarylink', name: 'NotaryLink', tagline: 'Agenda, comparecencia y seguimiento de actas.',
    pillDesc: 'Agenda notarial EC', icon: 'building', iconBg: '#f0ebe3',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
    showcaseImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1400&q=80',
    showcaseDesc: 'Directorio de notarías, comparecencia y sync SATJE demo.',
    features: ['Directorio notarías', 'Estado comparecencia', 'Sync SATJE demo'],
    live: false, route: '/productos/notarylink',
  },
];

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
