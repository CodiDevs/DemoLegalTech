import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MockBadgeComponent } from '../../shared/mock-badge.component';
import { IconComponent } from '../../shared/icon.component';
import { AuthService } from '../../core/auth.service';

interface Fase2NavItem {
  path: string;
  label: string;
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
          <h2 id="fase2-nav-title">Herramientas</h2>
          <nav aria-labelledby="fase2-nav-title">
            @for (item of visibleNav; track item.path) {
              <a [routerLink]="item.path" routerLinkActive="on">
                <app-icon [name]="item.icon" [size]="16" />
                <span>{{ item.label }}</span>
              </a>
            }
          </nav>
          <p class="back">
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
})
export class Fase2ShellComponent implements OnInit {
  private readonly nav: Fase2NavItem[] = [
    {
      path: '/fase2/admin',
      label: 'Resumen del bufete',
      icon: 'chart',
      lawyerOnly: true,
    },
    {
      path: '/fase2/templates',
      label: 'Modelos de documentos',
      icon: 'file-text',
      lawyerOnly: true,
    },
    {
      path: '/fase2/ai',
      label: 'Asistente de revisión',
      icon: 'sparkle',
      lawyerOnly: true,
    },
    {
      path: '/fase2/satje',
      label: 'Causas judiciales',
      icon: 'scale',
      lawyerOnly: true,
    },
    {
      path: '/fase2/billing',
      label: 'Facturación B2B',
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
