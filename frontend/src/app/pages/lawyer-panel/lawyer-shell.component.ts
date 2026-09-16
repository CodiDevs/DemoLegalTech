import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { IconComponent } from '../../shared/icon.component';
import { ColophonComponent } from '../../shared/colophon.component';
import { AuthService } from '../../core/auth.service';

const RAIL_PIN_KEY = 'd360_lawyer_rail_pinned';

interface WorkspaceNavItem {
  path: string;
  label: string;
  icon: 'inbox' | 'briefcase' | 'chart' | 'file-text' | 'search' | 'scale' | 'credit-card';
  exact?: boolean;
  lawyerOnly?: boolean;
}

@Component({
  selector: 'app-lawyer-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, IconComponent, ColophonComponent],
  template: `
    <div class="lawyer-workspace" [class.is-open]="railOpen">
      <aside
        class="lawyer-sidebar"
        (mouseenter)="openRail()"
        (mouseleave)="closeRail()"
        (focusin)="onRailFocusIn($event)"
        (focusout)="onRailFocusOut($event)"
      >
        <h2 id="lawyer-nav-casos">Casos</h2>
        <nav aria-labelledby="lawyer-nav-casos">
          @for (item of casosNav; track item.path) {
            <a
              [routerLink]="item.path"
              routerLinkActive="on"
              [routerLinkActiveOptions]="{ exact: !!item.exact }"
              [class.on]="item.path === '/abogado' && bandejaOn"
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

        <button
          type="button"
          class="rail-pin"
          [class.on]="railPinned"
          [attr.aria-pressed]="railPinned"
          [attr.aria-label]="railPinned ? 'Desbloquear menú' : 'Bloquear menú'"
          (click)="toggleRailPin()"
        >
          <app-icon [name]="railPinned ? 'lock' : 'unlock'" [size]="16" />
          <span>{{ railPinned ? 'Fijado' : 'Fijar' }}</span>
        </button>
        <app-colophon density="despacho" />
      </aside>
      <div class="lawyer-main">
        <router-outlet />
      </div>
    </div>
  `,
  styleUrls: ['./lawyer-shared.scss'],
})
export class LawyerShellComponent implements OnInit {
  readonly casosNav: WorkspaceNavItem[] = [
    { path: '/abogado', label: 'Bandeja', icon: 'inbox', exact: true },
    { path: '/abogado/servicios', label: 'Servicios', icon: 'briefcase' },
  ];

  private readonly toolsNav: WorkspaceNavItem[] = [
    { path: '/abogado/fase2/admin', label: 'Escritorio', icon: 'chart', lawyerOnly: true },
    { path: '/abogado/fase2/templates', label: 'Modelos de documentos', icon: 'file-text', lawyerOnly: true },
    { path: '/abogado/fase2/ai', label: 'Asistente de revisión', icon: 'search', lawyerOnly: true },
    { path: '/abogado/fase2/billing', label: 'Facturación B2B', icon: 'credit-card' },
  ];

  visibleTools: WorkspaceNavItem[] = [];
  railOpen = false;
  railPinned = false;
  private railPointer = false;

  constructor(
    private auth: AuthService,
    private router: Router,
  ) {}

  openRail(): void {
    this.railPointer = true;
    this.railOpen = true;
  }

  closeRail(): void {
    this.railPointer = false;
    if (!this.railPinned) this.railOpen = false;
  }

  toggleRailPin(): void {
    this.railPinned = !this.railPinned;
    this.writePinned(this.railPinned);
    if (this.railPinned) {
      this.railOpen = true;
      return;
    }
    if (!this.railPointer) this.railOpen = false;
  }

  onRailFocusIn(event: FocusEvent): void {
    const target = event.target as HTMLElement | null;
    if (this.railPointer || this.railPinned) return;
    if (target?.matches?.(':focus-visible')) this.railOpen = true;
  }

  onRailFocusOut(event: FocusEvent): void {
    if (this.railPointer || this.railPinned) return;
    const root = event.currentTarget as HTMLElement;
    const next = event.relatedTarget as Node | null;
    if (!next || !root.contains(next)) this.railOpen = false;
  }

  get bandejaOn(): boolean {
    const url = this.router.url.split('?')[0].split('#')[0];
    return url === '/abogado' || url.startsWith('/abogado/caso');
  }

  ngOnInit(): void {
    const isLawyer = this.auth.user()?.role === 'abogado';
    this.visibleTools = this.toolsNav.filter((item) => !item.lawyerOnly || isLawyer);
    this.railPinned = this.readPinned();
    if (this.railPinned) this.railOpen = true;
  }

  private readPinned(): boolean {
    try {
      return localStorage.getItem(RAIL_PIN_KEY) === '1';
    } catch {
      return false;
    }
  }

  private writePinned(on: boolean): void {
    try {
      localStorage.setItem(RAIL_PIN_KEY, on ? '1' : '0');
    } catch {
      /* private mode */
    }
  }
}
