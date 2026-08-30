import { Component } from '@angular/core';
import { DataTableComponent } from '../../../shared/data-table.component';

@Component({
  selector: 'app-fase2-mobile',
  standalone: true,
  imports: [DataTableComponent],
  template: `
    <h1>Aplicación móvil nativa</h1>
    <p class="muted">
      Fuera del MVP. Mientras tanto se usa la <strong>versión web responsive</strong>
      como app provisional para clientes y abogados.
    </p>

    <div class="layout">
      <div class="phones">
        @for (screen of screens; track screen.title) {
          <div class="phone panel fase2-preview-card">
            <div class="notch"></div>
            <p class="screen-title">{{ screen.title }}</p>
            <div class="screen-body">
              @for (line of screen.lines; track line) {
                <div class="line">{{ line }}</div>
              }
            </div>
          </div>
        }
      </div>

      <div class="info">
        <h2>Roadmap móvil</h2>
        <ul class="roadmap">
          @for (item of roadmap; track item) { <li>{{ item }}</li> }
        </ul>

        <h2>PWA vs nativa</h2>
        <app-data-table [columns]="compareCols" [rows]="compareRows" />

        <div class="panel fase2-preview-card qr">
          <strong>Abrir en móvil (demo)</strong>
          <p class="muted mono">http://localhost:4200/cliente</p>
          <p class="muted">Escanea o abre la URL en tu teléfono en la misma red.</p>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['../fase2-shared.scss'],
  styles: [`
    .layout { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-top: 1.5rem; }
    .phones { display: flex; gap: 1rem; flex-wrap: wrap; }
    .phone {
      width: 160px; min-height: 280px; border-radius: 24px; padding: 1rem 0.75rem;
      background: linear-gradient(160deg, oklch(0.35 0.06 210), oklch(0.25 0.04 230));
      color: white; text-align: center;
    }
    .notch { width: 60px; height: 8px; border-radius: 99px; background: oklch(0.15 0.02 230); margin: 0 auto 1rem; }
    .screen-title { font-family: var(--font-display); font-size: 0.95rem; margin: 0 0 0.75rem; }
    .screen-body { text-align: left; font-size: 0.72rem; opacity: 0.9; }
    .line { padding: 0.35rem 0; border-bottom: 1px solid oklch(1 0 0 / 0.15); }
    .roadmap { color: var(--ink-soft); }
    .qr { margin-top: 1rem; }
    .mono { font-family: ui-monospace, monospace; font-size: 0.82rem; }
    @media (max-width: 900px) { .layout { grid-template-columns: 1fr; } }
  `]
})
export class Fase2MobileComponent {
  screens = [
    { title: 'Mi expediente', lines: ['Caso #1', 'Revisión jurídica', 'Documentos ✓', 'Timeline 10 estados'] },
    { title: 'Timeline', lines: ['01 Información recibida', '02 Documentos pendientes', '03 Revisión jurídica ←'] },
    { title: 'Firma', lines: ['Minuta lista', 'Canvas firma', 'Evidencia IP/fecha'] },
  ];
  roadmap = [
    'Push notifications de cambio de estado',
    'Biometría para acceso rápido',
    'Firma nativa con ECI acreditada',
    'Carga de docs desde cámara',
  ];
  compareCols = [
    { key: 'feature', label: 'Capacidad' },
    { key: 'pwa', label: 'PWA (ahora)' },
    { key: 'native', label: 'Nativa (Fase 2)' },
  ];
  compareRows = [
    { feature: 'Timeline expediente', pwa: 'Sí', native: 'Sí' },
    { feature: 'Push notifications', pwa: 'Limitado', native: 'Sí' },
    { feature: 'Firma ECI', pwa: 'Canvas mock', native: 'SDK nativo' },
    { feature: 'Offline', pwa: 'Parcial', native: 'Sí' },
  ];
}
