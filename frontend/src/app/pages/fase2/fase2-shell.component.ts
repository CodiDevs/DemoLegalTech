import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MockBadgeComponent } from '../../shared/mock-badge.component';

@Component({
  selector: 'app-fase2-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MockBadgeComponent],
  template: `
    <div class="fase2-layout">
      <div class="shell fase2-grid">
        <aside class="fase2-sidebar">
          <app-mock-badge />
          <h2>Roadmap Fase 2</h2>
          <nav>
            <a routerLink="/fase2/admin" routerLinkActive="on">Admin / Socio</a>
            <a routerLink="/fase2/templates" routerLinkActive="on">Plantillas</a>
            <a routerLink="/fase2/ai" routerLinkActive="on">Agente IA</a>
            <a routerLink="/fase2/satje" routerLinkActive="on">SATJE</a>
            <a routerLink="/fase2/billing" routerLinkActive="on">B2B Billing</a>
            <a routerLink="/fase2/mobile" routerLinkActive="on">App móvil</a>
          </nav>
          <p class="back muted"><a routerLink="/abogado">← Bandeja abogado</a></p>
        </aside>
        <div class="fase2-main">
          <router-outlet />
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./fase2-shared.scss'],
  styles: [`
    .back { margin-top: 1.25rem; font-size: 0.85rem; }
    .back a { text-decoration: none; color: var(--ink-soft); }
  `]
})
export class Fase2ShellComponent {}
