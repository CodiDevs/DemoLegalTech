import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { IconComponent } from '../../shared/icon.component';
import { AuthService } from '../../core/auth.service';

interface WorkspaceNavItem {
  path: string;
  label: string;
  icon: 'inbox' | 'chart' | 'file-text' | 'sparkle' | 'scale' | 'credit-card';
  exact?: boolean;
  lawyerOnly?: boolean;
}

@Component({
  selector: 'app-lawyer-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, IconComponent],
  template: `
    <div class="lawyer-workspace">
      <div class="shell lawyer-grid">
        <aside class="lawyer-sidebar">
          <h2 id="lawyer-nav-casos">Casos</h2>
          <nav aria-labelledby="lawyer-nav-casos">
            @for (item of casosNav; track item.path) {
              <a
                [routerLink]="item.path"
                routerLinkActive="on"
                [routerLinkActiveOptions]="{ exact: !!item.exact }"
              >
                <app-icon [name]="item.icon" [size]="16" />
                <span>{{ item.label }}</span>
              </a>
            }
          </nav>

          <h2 id="lawyer-nav-tools" class="lawyer-nav-section">Herramientas</h2>
          <nav aria-labelledby="lawyer-nav-tools">
            @for (item of visibleTools; track item.path) {
              <a [routerLink]="item.path" routerLinkActive="on">
                <app-icon [name]="item.icon" [size]="16" />
                <span>{{ item.label }}</span>
              </a>
            }
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
export class LawyerShellComponent implements OnInit {
  readonly casosNav: WorkspaceNavItem[] = [
    { path: '/abogado', label: 'Bandeja', icon: 'inbox', exact: true },
  ];

  private readonly toolsNav: WorkspaceNavItem[] = [
    { path: '/abogado/fase2/admin', label: 'Resumen del bufete', icon: 'chart', lawyerOnly: true },
    { path: '/abogado/fase2/templates', label: 'Modelos de documentos', icon: 'file-text', lawyerOnly: true },
    { path: '/abogado/fase2/ai', label: 'Asistente de revisión', icon: 'sparkle', lawyerOnly: true },
    { path: '/abogado/fase2/satje', label: 'Causas judiciales', icon: 'scale', lawyerOnly: true },
    { path: '/abogado/fase2/billing', label: 'Facturación B2B', icon: 'credit-card' },
  ];

  visibleTools: WorkspaceNavItem[] = [];

  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    const isLawyer = this.auth.user()?.role === 'abogado';
    this.visibleTools = this.toolsNav.filter((item) => !item.lawyerOnly || isLawyer);
  }
}
