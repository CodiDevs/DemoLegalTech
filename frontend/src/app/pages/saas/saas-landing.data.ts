import { LEGALSTATION_CATALOG } from '../../shared/product-sites.data';
import { GalleryItem } from './elastic-gallery.component';
import { StatItem } from './landing-statistics.component';
import { HeroStat } from './marketing-hero.component';

export const LEGALSTATION_HERO_IMAGES = LEGALSTATION_CATALOG
  .filter((p) => p.live)
  .map((p) => p.showcaseImage)
  .slice(0, 3) as [string, string, string];

export const LEGALSTATION_HERO_STATS: HeroStat[] = [
  { value: '6', label: 'Productos conectados', icon: 'folder' },
  { value: '120+', label: 'Firmas demo', icon: 'users' },
  { value: '10', label: 'Estados por expediente', icon: 'file' },
];

export const LEGALSTATION_WORKFLOW = [
  { n: 1, title: 'Intake', desc: 'Cuestionario y clasificación automática del caso.' },
  { n: 2, title: 'Expediente', desc: 'Documentos, pago y mensajes en un solo lugar.' },
  { n: 3, title: 'Revisión', desc: 'Operador aprueba, genera minuta y comunica al cliente.' },
  { n: 4, title: 'Firma', desc: 'Firma electrónica con evidencia y notificaciones.' },
  { n: 5, title: 'Cierre', desc: 'Notaría, registro y archivo con auditoría completa.' },
];

export const LEGALSTATION_PLANS = [
  { name: 'Starter', audience: 'Bufete pequeño — licencia operador', price: 99, items: ['1 producto activo', '3 usuarios operador', 'Link a clientes incluido', '15% comisión demo por venta'], featured: false },
  { name: 'Professional', audience: 'Equipo en crecimiento', price: 249, items: ['3 productos live', '10 usuarios', 'SLA y notificaciones', 'Link personalizado + comisión', 'SATJE sync demo'], featured: true },
  { name: 'Enterprise', audience: 'Multi-sede', price: 599, items: ['Productos ilimitados', 'SSO demo', 'Comisión negociable', 'White-label ready'], featured: false },
];

export const LEGALSTATION_ENTERPRISE = [
  { title: 'Aislamiento completo', desc: 'Infraestructura dedicada — tus datos separados del resto de tenants demo.' },
  { title: 'En tus términos', desc: 'On-prem o nube privada con SSO, logs y control administrativo.' },
  { title: 'White-label', desc: 'Marca y flujos adaptados a tu firma o grupo legal.' },
  { title: 'SLA y partnership', desc: 'Colaboración con tu equipo de TI y soporte prioritario demo.' },
];

export const LEGALSTATION_PLATFORM_STATS: StatItem[] = [
  { label: 'Productos conectados', value: '6', detail: 'Verticales demo en un solo ecosistema.', trend: '+6', icon: 'folder' },
  { label: 'Firmas demo', value: '120+', detail: 'Organizaciones usando LegalStation en walkthrough.', icon: 'users' },
  { label: 'Estados por expediente', value: '10', detail: 'Seguimiento completo, desde el alta hasta el cierre.', icon: 'file' },
  { label: 'SLA operador', value: '3 días', detail: 'Alertas cuando un caso se detiene.', icon: 'shield' },
  { label: 'Firma integrada', value: '1 flujo', detail: 'SignDesk conectado al expediente.', icon: 'pen' },
  { label: 'Multi-tenant', value: 'Demo', detail: 'JWT compartido entre productos LegalStation.', icon: 'building' },
];

export const LEGALSTATION_CLIENT_GALLERY: GalleryItem[] = [
  { id: '01', title: 'Firma Quito', category: 'Legal ops', src: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80', alt: 'Oficina legal' },
  { id: '02', title: 'Divorcio360 live', category: 'Producto', src: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80', alt: 'Divorcio360' },
  { id: '03', title: 'Panel operador', category: 'Abogado', src: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80', alt: 'Panel' },
  { id: '04', title: 'Cumplimiento', category: 'LOPDP', src: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80', alt: 'Compliance' },
  { id: '05', title: 'Pitch CodiDevs', category: 'Demo', src: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=80', alt: 'Demo' },
];
