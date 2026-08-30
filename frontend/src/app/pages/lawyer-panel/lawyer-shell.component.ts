import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-lawyer-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="lawyer-workspace">
      <div class="shell lawyer-grid">
        <aside class="lawyer-sidebar">
          <h2>Operador legal</h2>
          <nav>
            <a routerLink="/abogado" routerLinkActive="on" [routerLinkActiveOptions]="{exact:true}">Bandeja</a>
            <a routerLink="/fase2/admin" routerLinkActive="on">Fase 2</a>
          </nav>
        </aside>
        <div class="lawyer-main">
          <router-outlet />
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./lawyer-shared.scss'],
})
export class LawyerShellComponent {}
