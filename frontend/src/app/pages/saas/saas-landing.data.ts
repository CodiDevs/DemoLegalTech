import { LEGALSTATION_CATALOG } from '../../shared/product-sites.data';

export const LEGALSTATION_WORKFLOW = [
  { n: 1, title: 'Intake', desc: 'Cuestionario y clasificación automática del caso.' },
  { n: 2, title: 'Expediente', desc: 'Documentos, pago y mensajes en un solo lugar.' },
  { n: 3, title: 'Revisión', desc: 'Operador aprueba, genera minuta y comunica al cliente.' },
  { n: 4, title: 'Firma', desc: 'Firma electrónica con evidencia y notificaciones.' },
  { n: 5, title: 'Cierre', desc: 'Notaría, registro y archivo con auditoría completa.' },
];

export const LEGALSTATION_PLANS = [
  { name: 'Starter', audience: 'Bufete pequeño. Licencia operadores', price: 99, items: ['1 producto activo', '3 usuarios operador', 'Link a clientes incluido', '15% comisión por venta'], featured: false },
  { name: 'Professional', audience: 'Equipo en crecimiento. Licencia operadores', price: 249, items: ['3 productos en vivo', '10 usuarios', 'SLA y notificaciones', 'Link personalizado + comisión', 'SATJE sync'], featured: true },
  { name: 'Enterprise', audience: 'Multi-sede. Licencia operadores', price: 599, items: ['Productos ilimitados', 'SSO', 'Comisión negociable', 'White-label ready'], featured: false },
];

export const LEGALSTATION_ENTERPRISE = [
  { title: 'Aislamiento completo', desc: 'Infraestructura dedicada: tus datos separados del resto de tenants.' },
  { title: 'En tus términos', desc: 'On-prem o nube privada con SSO, logs y control administrativo.' },
  { title: 'White-label', desc: 'Marca y flujos adaptados a tu firma o grupo legal.' },
  { title: 'SLA y partnership', desc: 'Colaboración con tu equipo de TI y soporte prioritario.' },
];

/** Live catalog entries used by the home product grid. */
export const LEGALSTATION_LIVE = LEGALSTATION_CATALOG.filter((p) => p.live);

/** Landing FAQ — grounded in demo capabilities, no invented legal promises. */
export const LEGALSTATION_FAQ = [
  {
    question: '¿Qué es LegalStation?',
    answer:
      'Una plataforma legal-tech para tramitar divorcio, traslado vehicular e inmuebles con intake digital, expediente y operadores.',
  },
  {
    question: '¿Cómo funciona?',
    answer:
      'Eliges el producto, completas el cuestionario, pagas el trámite y das seguimiento al expediente hasta firma y cierre.',
  },
  {
    question: '¿Qué trámites puedo realizar?',
    answer:
      'Hoy están Divorcio360, Traslado360 y BienRaiz360. Otros módulos aparecen como próximos lanzamientos.',
  },
  {
    question: '¿Necesito crear una cuenta?',
    answer:
      'Sí, para guardar el expediente, pagar y ver el estado. Puedes empezar el intake y autenticarte cuando el flujo lo pida.',
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
      'El acceso al expediente es por cuenta autenticada. En demo no hay cifrado empresarial adicional; en producción aplica el despliegue del operador.',
  },
  {
    question: '¿Cómo funciona el pago?',
    answer:
      'El cliente paga el honorario del trámite en el checkout del producto. La licencia mensual de bufete es aparte, en Precios.',
  },
  {
    question: '¿Qué sucede después de iniciar mi trámite?',
    answer:
      'Se crea el expediente: puedes cargar documentos, el operador revisa, y el flujo sigue a firma y cierre según el producto.',
  },
  {
    question: '¿Puedo consultar mis expedientes desde LegalStation?',
    answer:
      'Sí. Clientes en /cliente y operadores en /abogado (incluye Fase 2: bandeja, billing y herramientas del bufete).',
  },
];
