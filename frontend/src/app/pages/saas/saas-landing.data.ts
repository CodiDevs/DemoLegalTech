import { LEGALSTATION_CATALOG } from '../../shared/product-sites.data';

const heroShot = LEGALSTATION_CATALOG.find((p) => p.live)?.showcaseImage ?? '';

export const LEGALSTATION_HERO_IMAGES: [string, string, string] = [heroShot, heroShot, heroShot];

export const LEGALSTATION_WORKFLOW = [
  { n: 1, title: 'Intake', desc: 'Cuestionario y clasificación automática del caso.' },
  { n: 2, title: 'Expediente', desc: 'Documentos, pago y mensajes en un solo lugar.' },
  { n: 3, title: 'Revisión', desc: 'Operador aprueba, genera minuta y comunica al cliente.' },
  { n: 4, title: 'Firma', desc: 'Firma electrónica con evidencia y notificaciones.' },
  { n: 5, title: 'Cierre', desc: 'Notaría, registro y archivo con auditoría completa.' },
];

export const LEGALSTATION_PLANS = [
  { name: 'Starter', audience: 'Bufete pequeño. Licencia demo', price: 99, items: ['1 producto activo', '3 usuarios operador', 'Link a clientes incluido', '15% comisión demo por venta'], featured: false },
  { name: 'Professional', audience: 'Equipo en crecimiento. Licencia demo', price: 249, items: ['3 productos live', '10 usuarios', 'SLA y notificaciones', 'Link personalizado + comisión', 'SATJE sync demo'], featured: true },
  { name: 'Enterprise', audience: 'Multi-sede. Licencia demo', price: 599, items: ['Productos ilimitados', 'SSO demo', 'Comisión negociable', 'White-label ready'], featured: false },
];

export const LEGALSTATION_ENTERPRISE = [
  { title: 'Aislamiento completo', desc: 'Infraestructura dedicada: tus datos separados del resto de tenants demo.' },
  { title: 'En tus términos', desc: 'On-prem o nube privada con SSO, logs y control administrativo.' },
  { title: 'White-label', desc: 'Marca y flujos adaptados a tu firma o grupo legal.' },
  { title: 'SLA y partnership', desc: 'Colaboración con tu equipo de TI y soporte prioritario demo.' },
];
