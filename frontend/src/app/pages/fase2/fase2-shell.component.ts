import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MockBadgeComponent } from '../../shared/mock-badge.component';
import { IconComponent } from '../../shared/icon.component';
import { AuthService } from '../../core/auth.service';

interface Fase2NavItem {
  path: string;
  label: string;
  hint: string;
  icon: 'chart' | 'file-text' | 'sparkle' | 'scale' | 'credit-card';
  lawyerOnly?: boolean;
}

@Component({
  selector: 'app-fase2-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MockBadgeComponent, IconComponent],
  template: `
    <div class="fase2-layout">
      <div class="shell fase2-grid">
        <aside class="fase2-sidebar">
          <app-mock-badge />
          <h2>Herramientas del bufete</h2>
          <p class="sidebar-intro muted">
            Funciones avanzadas para socios y abogados. Cada sección indica qué hace en lenguaje sencillo.
          </p>
          <nav>
            @for (item of visibleNav; track item.path) {
              <a [routerLink]="item.path" routerLinkActive="on">
                <app-icon [name]="item.icon" [size]="16" />
                <span>
                  <strong>{{ item.label }}</strong>
                  <small>{{ item.hint }}</small>
                </span>
              </a>
            }
          </nav>
          <p class="back muted">
            <a routerLink="/abogado">
              <app-icon name="arrow-left" [size]="16" />
              Volver a la bandeja del abogado
            </a>
          </p>
        </aside>
        <div class="fase2-main">
          <router-outlet />
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./fase2-shared.scss'],
  styles: [`
    .sidebar-intro {
      font-size: var(--text-sm);
      line-height: var(--leading-snug);
      margin: 0 0 var(--space-4);
    }

    .fase2-sidebar nav a {
      display: flex;
      align-items: flex-start;
      gap: var(--space-3);
      padding: var(--space-3);
    }

    .fase2-sidebar nav a strong {
      display: block;
      font-size: var(--text-sm);
    }

    .fase2-sidebar nav a small {
      display: block;
      margin-top: 0.15rem;
      font-size: var(--text-xs);
      font-weight: 400;
      line-height: var(--leading-snug);
      color: var(--text-muted);
    }

    .back {
      margin-top: var(--space-5);
      font-size: var(--text-sm);
    }

    .back a {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      text-decoration: none;
      color: var(--text-secondary);
    }

    .back a:hover { color: var(--text); }
  `]
})
export class Fase2ShellComponent implements OnInit {
  private readonly nav: Fase2NavItem[] = [
    {
      path: '/fase2/admin',
      label: 'Resumen del bufete',
      hint: 'Casos, ingresos y actividad reciente',
      icon: 'chart',
      lawyerOnly: true,
    },
    {
      path: '/fase2/templates',
      label: 'Modelos de documentos',
      hint: 'Plantillas listas para usar en trámites',
      icon: 'file-text',
      lawyerOnly: true,
    },
    {
      path: '/fase2/ai',
      label: 'Asistente de revisión',
      hint: 'Resume expedientes y señala riesgos',
      icon: 'sparkle',
      lawyerOnly: true,
    },
    {
      path: '/fase2/satje',
      label: 'Causas judiciales',
      hint: 'Vincula expedientes con el sistema judicial',
      icon: 'scale',
      lawyerOnly: true,
    },
    {
      path: '/fase2/billing',
      label: 'Facturación B2B',
      hint: 'Planes y cobros entre bufetes',
      icon: 'credit-card',
    },
  ];

  visibleNav: Fase2NavItem[] = [];

  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    const isLawyer = this.auth.user()?.role === 'abogado';
    this.visibleNav = this.nav.filter((item) => !item.lawyerOnly || isLawyer);
  }
}
