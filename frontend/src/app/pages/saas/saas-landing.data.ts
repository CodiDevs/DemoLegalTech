import { GalleryItem } from './elastic-gallery.component';
import { StatItem } from './landing-statistics.component';

export const LEGALSTATION_PLATFORM_STATS: StatItem[] = [
  { label: 'Trámites en vivo', value: '3', detail: 'Divorcio360, Traslado360 y BienRaiz360.', icon: 'folder' },
  { label: 'Estados por expediente', value: '10', detail: 'Intake hasta cierre en un timeline.', icon: 'file' },
  { label: 'Honorario Divorcio360', value: '$349', detail: 'Pago único de demostración, sin membresía.', icon: 'scale' },
  { label: 'Roles demo', value: '3', detail: 'Cliente, operador y notario.', icon: 'users' },
];

export const LEGALSTATION_CLIENT_GALLERY: GalleryItem[] = [
  { id: '01', title: 'Firma Quito', category: 'Legal ops', src: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80', alt: 'Oficina legal' },
  { id: '02', title: 'Divorcio360 live', category: 'Producto', src: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80', alt: 'Divorcio360' },
  { id: '03', title: 'Panel operador', category: 'Abogado', src: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80', alt: 'Panel' },
  { id: '04', title: 'Cumplimiento', category: 'LOPDP', src: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80', alt: 'Compliance' },
  { id: '05', title: 'Pitch CodiDevs', category: 'Demo', src: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=80', alt: 'Demo' },
];
