import { LEGALSTATION_CATALOG } from '../../shared/product-sites.data';
import { IconName } from '../../shared/icon.component';

export interface StationStep {
  id: string;
  n: number;
  title: string;
  badge: string;
  desc: string;
  icon: IconName;
}

export const LEGALSTATION_WORKFLOW: StationStep[] = [
  {
    id: 'admision',
    n: 1,
    title: 'Admisión y calificación',
    badge: 'Recepción',
    desc: 'Califica admisibilidad notarial y mutuo consentimiento.',
    icon: 'clipboard',
  },
  {
    id: 'expediente',
    n: 2,
    title: 'Expediente digital',
    badge: 'Cotejo',
    desc: 'Consolida recaudos y asigna abogado del Foro.',
    icon: 'folder',
  },
  {
    id: 'minuta',
    n: 3,
    title: 'Minuta solemne',
    badge: 'Visado',
    desc: 'Redacta la petición formal al notario.',
    icon: 'file-text',
  },
  {
    id: 'firma',
    n: 4,
    title: 'Firma electrónica',
    badge: 'PKI',
    desc: 'Suscripción con certificado acreditado.',
    icon: 'signature',
  },
  {
    id: 'notaria',
    n: 5,
    title: 'Notaría y Registro',
    badge: 'Acta',
    desc: 'Protocoliza la escritura y marginación.',
    icon: 'building',
  },
];

export const LEGALSTATION_PLANS = [
  { name: 'Starter', tag: 'Despachos independientes', audience: 'Bufete pequeño. Licencia operadores', price: 99, items: ['1 producto civil activo', '3 usuarios operadores', 'Enlace de admisión para clientes', 'Soporte por correo'], featured: false },
  { name: 'Professional', tag: '10 operadores', audience: 'Equipo en crecimiento. Licencia operadores', price: 249, items: ['Catálogo civil completo', '10 usuarios operadores', 'Notificaciones automáticas al cliente', 'Asistente de minutas', 'Plantillas notariales maestras'], featured: true },
  { name: 'Enterprise', tag: 'Multi-sede', audience: 'Grandes firmas y notarías', price: 599, items: ['Operadores ilimitados', 'Instancia dedicada con SSO', 'Marca blanca y flujos a medida', 'Acompañamiento en la puesta en marcha'], featured: false },
];

/** Honorarios de trámites live — pago único del cliente (no licencia B2B). */
export const LEGALSTATION_SERVICE_PLANS = [
  {
    id: 'divorcio360',
    name: 'Divorcio360',
    tag: 'Civil & Familia',
    audience: 'Mutuo acuerdo · honorario de referencia',
    price: 349,
    items: ['Evaluación inicial', 'Expediente digital', 'Revisión documental', 'Carga de firma'],
    featured: true,
    route: '/productos/divorcio360',
  },
  {
    id: 'traslado360',
    name: 'Traslado360',
    tag: 'Vehicular & Civil',
    audience: 'Mutuo acuerdo · vehículo al día',
    price: 199,
    items: ['Cuestionario de elegibilidad', 'Pago único sin suscripción', 'Consulta + notaría virtual', 'Expediente trazable'],
    featured: false,
    route: '/productos/traslado360',
  },
  {
    id: 'bienraiz360',
    name: 'BienRaiz360',
    tag: 'Inmobiliario & Notarial',
    audience: 'Mutuo acuerdo · sin gravámenes',
    price: 299,
    items: ['Flujo completo', 'Pago único sin suscripción', 'Consulta + notaría virtual', 'Expediente 10 estados'],
    featured: false,
    route: '/productos/bienraiz360',
  },
];

export type PricingMode = 'servicios' | 'licenciamiento';

/** Live catalog entries used by the home product grid. */
export const LEGALSTATION_LIVE = LEGALSTATION_CATALOG.filter((p) => p.live);

/** Landing FAQ — grounded in demo capabilities, no invented legal promises. */
export const LEGALSTATION_FAQ = [
  {
    question: '¿Qué es LegalStation?',
    answer:
      'Una plataforma legal-tech para tramitar divorcio, traslado vehicular e inmuebles con recepción digital del caso, expediente y operadores.',
  },
  {
    question: '¿Cómo funciona?',
    answer:
      'Eliges el producto, completas el cuestionario, pagas el trámite y das seguimiento al expediente hasta firma y finalización.',
  },
  {
    question: '¿Qué trámites puedo realizar?',
    answer:
      'Hoy están Divorcio360, Traslado360 y BienRaiz360. Otros módulos aparecen como próximos lanzamientos.',
  },
  {
    question: '¿Necesito crear una cuenta?',
    answer:
      'Sí, para guardar el expediente, pagar y ver el estado. Puedes empezar el cuestionario y autenticarte cuando el flujo lo pida.',
  },
  {
    question: '¿Puedo consultar el estado de mi trámite?',
    answer:
      'Sí. En el panel de cliente ves el expediente, mensajes y avances que el operador registra.',
  },
  {
    question: '¿Qué documentos necesito?',
    answer:
      'Depende del trámite. El cuestionario y el expediente te indican qué subir en cada paso.',
  },
  {
    question: '¿Mis documentos están protegidos?',
    answer:
      'El acceso al expediente es por cuenta autenticada. En este entorno de ejemplo no hay cifrado empresarial adicional; en producción aplica el despliegue del operador.',
  },
  {
    question: '¿Cómo funciona el pago?',
    answer:
      'El cliente paga el honorario del trámite en el checkout del producto. La licencia mensual de bufete es aparte, en Precios.',
  },
  {
    question: '¿Qué sucede después de iniciar mi trámite?',
    answer:
      'Se crea el expediente: puedes cargar documentos, el operador revisa, y el flujo sigue a firma y finalización según el producto.',
  },
  {
    question: '¿Puedo consultar mis expedientes desde LegalStation?',
    answer:
      'Sí. Clientes en /cliente y operadores en /abogado (incluye Fase 2: bandeja, billing y herramientas del bufete).',
  },
];
