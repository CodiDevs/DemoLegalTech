import { Component, Input } from '@angular/core';

/**
 * Único set de iconos del producto.
 * Reglas: viewBox 24, trazo 1.5, terminaciones redondeadas, color heredado.
 * No se usan emojis ni caracteres Unicode como icono en ninguna parte.
 */
export type IconName =
  // Navegación
  | 'arrow-left' | 'arrow-right' | 'chevron-left' | 'chevron-right'
  | 'chevron-down' | 'external-link' | 'menu' | 'x'
  // Estado
  | 'check' | 'check-circle' | 'alert-triangle' | 'alert-circle'
  | 'x-circle' | 'info' | 'clock'
  // Documentos
  | 'file' | 'file-text' | 'folder' | 'clipboard' | 'upload'
  | 'download' | 'paperclip' | 'signature' | 'pen' | 'eye'
  // Personas
  | 'user' | 'users' | 'baby' | 'id-card'
  // Contexto legal / trámite
  | 'scale' | 'shield' | 'building' | 'home' | 'briefcase'
  | 'map-pin' | 'flag' | 'plane' | 'chart' | 'calendar'
  // Sistema
  | 'bell' | 'search' | 'lock' | 'log-out' | 'credit-card'
  | 'video' | 'mail' | 'plus' | 'trash' | 'inbox' | 'sparkle';

@Component({
  selector: 'app-icon',
  standalone: true,
  template: `
    <svg
      [attr.width]="size"
      [attr.height]="size"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      [attr.stroke-width]="strokeWidth"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      @switch (name) {
        <!-- Navegación -->
        @case ('arrow-left') { <path d="M19 12H5m0 0 6-6m-6 6 6 6" /> }
        @case ('arrow-right') { <path d="M5 12h14m0 0-6-6m6 6-6 6" /> }
        @case ('chevron-left') { <path d="m15 18-6-6 6-6" /> }
        @case ('chevron-right') { <path d="m9 18 6-6-6-6" /> }
        @case ('chevron-down') { <path d="m6 9 6 6 6-6" /> }
        @case ('external-link') {
          <path d="M14 4h6v6" /><path d="M20 4 10 14" />
          <path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
        }
        @case ('menu') { <path d="M4 6h16M4 12h16M4 18h16" /> }
        @case ('x') { <path d="M18 6 6 18M6 6l12 12" /> }

        <!-- Estado -->
        @case ('check') { <path d="M20 6 9 17l-5-5" /> }
        @case ('check-circle') {
          <circle cx="12" cy="12" r="9" /><path d="m8.5 12 2.5 2.5 4.5-5" />
        }
        @case ('alert-triangle') {
          <path d="M10.3 3.9 2.4 17.5A1.9 1.9 0 0 0 4 20.4h16a1.9 1.9 0 0 0 1.6-2.9L13.7 3.9a1.9 1.9 0 0 0-3.4 0Z" />
          <path d="M12 9v4M12 16.5h.01" />
        }
        @case ('alert-circle') {
          <circle cx="12" cy="12" r="9" /><path d="M12 8v4.5M12 16h.01" />
        }
        @case ('x-circle') {
          <circle cx="12" cy="12" r="9" /><path d="m14.8 9.2-5.6 5.6M9.2 9.2l5.6 5.6" />
        }
        @case ('info') {
          <circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" />
        }
        @case ('clock') {
          <circle cx="12" cy="12" r="9" /><path d="M12 7.5V12l3 2" />
        }

        <!-- Documentos -->
        @case ('file') {
          <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" />
          <path d="M14 3v5h5" />
        }
        @case ('file-text') {
          <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" />
          <path d="M14 3v5h5M8.5 13h7M8.5 17h4.5" />
        }
        @case ('folder') {
          <path d="M21 19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4l2 3h8a2 2 0 0 1 2 2Z" />
        }
        @case ('clipboard') {
          <rect x="7" y="4" width="10" height="17" rx="2" />
          <path d="M9.5 4V3h5v1M10 10h4M10 14h4" />
        }
        @case ('upload') {
          <path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
          <path d="M12 15V3m0 0-4.5 4.5M12 3l4.5 4.5" />
        }
        @case ('download') {
          <path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
          <path d="M12 3v12m0 0-4.5-4.5M12 15l4.5-4.5" />
        }
        @case ('paperclip') {
          <path d="M20 11.5 12 19.5a5 5 0 0 1-7-7l8-8a3.4 3.4 0 0 1 4.8 4.8l-8 8a1.8 1.8 0 0 1-2.5-2.5l7.2-7.2" />
        }
        @case ('signature') {
          <path d="M3 17c3.5 0 4-11 7-11s2 9 5 9 2-4 4-4" />
          <path d="M3 21h18" />
        }
        @case ('pen') {
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
        }
        @case ('eye') {
          <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
          <circle cx="12" cy="12" r="3" />
        }

        <!-- Personas -->
        @case ('user') {
          <circle cx="12" cy="8" r="4" />
          <path d="M5 21v-1a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v1" />
        }
        @case ('users') {
          <circle cx="9" cy="8" r="3.5" />
          <path d="M3 21v-1a4.5 4.5 0 0 1 4.5-4.5h3A4.5 4.5 0 0 1 15 20v1" />
          <path d="M16 4.2a3.5 3.5 0 0 1 0 7.6M17 15.5a4.5 4.5 0 0 1 4 4.5v1" />
        }
        @case ('baby') {
          <circle cx="12" cy="7" r="3.2" />
          <path d="M7.5 21v-2.5A4.5 4.5 0 0 1 12 14a4.5 4.5 0 0 1 4.5 4.5V21" />
          <path d="M10.6 6.4h.01M13.4 6.4h.01" />
        }
        @case ('id-card') {
          <rect x="2.5" y="5" width="19" height="14" rx="2" />
          <circle cx="8.5" cy="11" r="2" />
          <path d="M5.5 16.2a3.5 3.5 0 0 1 6 0M14.5 10h4M14.5 13.5h4" />
        }

        <!-- Contexto legal / trámite -->
        @case ('scale') {
          <path d="M12 3.5v17M6 20.5h12M5 7.5h14" />
          <path d="M5 7.5 2.5 13h5L5 7.5ZM19 7.5 16.5 13h5L19 7.5Z" />
        }
        @case ('shield') {
          <path d="M12 21s7.5-3.8 7.5-9.5V5.5L12 3 4.5 5.5v6c0 5.7 7.5 9.5 7.5 9.5Z" />
        }
        @case ('building') {
          <path d="M6 21V4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21" />
          <path d="M3 21h18M10 7h4M10 11h4M10 15h4M10 21v-2.5h4V21" />
        }
        @case ('home') {
          <path d="M3.5 10.5 12 3.5l8.5 7" />
          <path d="M5.5 9.5V20a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1V9.5" />
          <path d="M10 21v-6h4v6" />
        }
        @case ('briefcase') {
          <rect x="2.5" y="7.5" width="19" height="12" rx="2" />
          <path d="M9 7.5v-2a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5.5v2M2.5 12.5h19" />
        }
        @case ('map-pin') {
          <path d="M19 10.5c0 5.2-7 10.5-7 10.5s-7-5.3-7-10.5a7 7 0 0 1 14 0Z" />
          <circle cx="12" cy="10.5" r="2.5" />
        }
        @case ('flag') {
          <path d="M5 21V4" />
          <path d="M5 4.5h11l-1.5 4 1.5 4H5" />
        }
        @case ('plane') {
          <path d="M10.5 19.5 12 21l1.5-1.5-.6-4.4 6.6 2 1.4-1.4-6-5.2 1.1-5.3L14.6 3l-2.6 5.6-5.6-1.5L5 8.5l4.8 3.4-5.3 1.6L3 15l6.9.1Z" />
        }
        @case ('chart') {
          <path d="M3 21h18" />
          <path d="M6.5 21V13M12 21V6M17.5 21v-6" />
        }
        @case ('calendar') {
          <rect x="3.5" y="5.5" width="17" height="15" rx="2" />
          <path d="M8 3.5v4M16 3.5v4M3.5 10.5h17" />
        }

        <!-- Sistema -->
        @case ('bell') {
          <path d="M18 9.5a6 6 0 1 0-12 0c0 4-1.5 5.5-1.5 5.5h15S18 13.5 18 9.5Z" />
          <path d="M10.3 18.5a2 2 0 0 0 3.4 0" />
        }
        @case ('search') {
          <circle cx="11" cy="11" r="7" /><path d="m20 20-3.6-3.6" />
        }
        @case ('lock') {
          <rect x="4.5" y="10.5" width="15" height="10.5" rx="2" />
          <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
        }
        @case ('log-out') {
          <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
          <path d="M11 16.5 15.5 12 11 7.5M15.5 12H4" />
        }
        @case ('credit-card') {
          <rect x="2.5" y="5.5" width="19" height="13" rx="2" />
          <path d="M2.5 10h19M6 14.5h4" />
        }
        @case ('video') {
          <rect x="2.5" y="6.5" width="13" height="11" rx="2" />
          <path d="m15.5 11 6-3.5v9l-6-3.5Z" />
        }
        @case ('mail') {
          <rect x="2.5" y="5" width="19" height="14" rx="2" />
          <path d="m3.5 7 8.5 6 8.5-6" />
        }
        @case ('plus') { <path d="M12 5v14M5 12h14" /> }
        @case ('trash') {
          <path d="M4 7h16M9.5 7V4.5h5V7M6 7l1 13.5h10L18 7M10.5 11v6M13.5 11v6" />
        }
        @case ('inbox') {
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7" />
          <path d="M3 12h5l1.5 2.5h5L16 12h5L18.5 4.5A2 2 0 0 0 16.6 3H7.4a2 2 0 0 0-1.9 1.5Z" />
        }
        @case ('sparkle') {
          <path d="M11 3.5 12.7 8.3 17.5 10 12.7 11.7 11 16.5 9.3 11.7 4.5 10 9.3 8.3Z" />
          <path d="M18 15.5 18.7 17.8 21 18.5 18.7 19.2 18 21.5 17.3 19.2 15 18.5 17.3 17.8Z" />
        }
      }
    </svg>
  `,
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: inherit;
      flex-shrink: 0;
    }
  `],
})
export class IconComponent {
  @Input({ required: true }) name!: IconName;
  @Input() size: number | string = 20;
  @Input() strokeWidth: number | string = 1.5;
}
