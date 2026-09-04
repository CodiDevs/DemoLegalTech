import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ViewportScroller } from '@angular/common';
import { filter } from 'rxjs/operators';
import { AuthService } from '../core/auth.service';
import { ApiService } from '../core/api.service';
import { getActiveProduct, getProductSite, getProductQuestionnairePath, setActiveProduct, detectProductFromPath } from '../shared/product-sites.data';
import { IconComponent, IconName } from '../shared/icon.component';

const DIVORCIO_FLOW = ['/cuestionario', '/cliente', '/checkout', '/upload', '/consulta', '/firma', '/caso', '/intake', '/productos/traslado360/cuestionario', '/productos/bienraiz360/cuestionario'];

interface NavLink {
  label: string;
  path: string;
  fragment?: string;
  exact?: boolean;
}

interface ActionLink {
  label: string;
  path: string;
  query?: Record<string, string>;
  variant: 'primary' | 'quiet';
}

interface ProductSwitcherItem {
  id: string;
  label: string;
  path: string;
}

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, IconComponent],
  template: `
    <a class="skip-link" href="#contenido">Saltar al contenido</a>

    <header
      class="site-header"
      [class.on-marketing]="isMarketing"
      [class.is-scrolled]="headerScrolled"
      [style.--header-accent]="headerAccent"
    >
      <div class="header-bar">
        <a [routerLink]="brand.home" class="brand" (click)="closeAll()">
          @if (brand.mark === 'logo') {
            <span class="brand-mark" aria-hidden="true"><app-icon name="scale" [size]="16" /></span>
          } @else {
            <span class="brand-mark brand-mark-360" aria-hidden="true">360</span>
          }
          <span class="brand-text">
            {{ brand.name }}
            @if (brand.sub) { <small>{{ brand.sub }}</small> }
          </span>
        </a>

        @if (navLinks.length || showProductSwitcher) {
          <nav class="header-nav" aria-label="Secciones">
            @if (showProductSwitcher) {
              <div class="product-switcher">
                <button
                  type="button"
                  class="nav-link dropdown-trigger"
                  [attr.aria-expanded]="showProducts"
                  aria-haspopup="true"
                  (click)="toggleProducts($event)"
                >
                  Productos
                  <app-icon name="chevron-down" [size]="14" />
                </button>
                @if (showProducts) {
                  <div class="dropdown-panel" role="menu">
                    @for (item of productSwitcherItems; track item.id) {
                      <a
                        role="menuitem"
                        [routerLink]="item.path"
                        class="dropdown-item"
                        [class.is-active]="item.id === activeProduct"
                        (click)="switchProduct(item.id); closeAll()"
                      >{{ item.label }}</a>
                    }
                  </div>
                }
              </div>
            }
            @for (link of navLinks; track link.label) {
              @if (link.fragment) {
                <a
                  class="nav-link"
                  [href]="link.path + '#' + link.fragment"
                  (click)="goToSection($event, link.path, link.fragment)"
                >{{ link.label }}</a>
              } @else {
                <a
                  class="nav-link"
                  [routerLink]="link.path"
                  routerLinkActive="is-active"
                  [routerLinkActiveOptions]="{ exact: !!link.exact }"
                >{{ link.label }}</a>
              }
            }
          </nav>
        }

        <div class="header-actions">
          @if (auth.isLoggedIn) {
            <div class="notif-wrap">
              <button
                type="button"
                class="btn btn-ghost btn-icon notif-trigger"
                [attr.aria-label]="notifLabel"
                [attr.aria-expanded]="showNotifs"
                (click)="toggleNotifs($event)"
              >
                <app-icon name="bell" [size]="19" />
                @if (unreadCount) { <span class="notif-count" aria-hidden="true">{{ unreadCount }}</span> }
              </button>

              @if (showNotifs) {
                <div class="notif-panel" role="dialog" aria-label="Notificaciones">
                  <header class="notif-head">
                    <strong>Notificaciones</strong>
                    @if (unreadNotifications.length) {
                      <button type="button" class="btn btn-ghost btn-sm" (click)="markAllRead($event)">
                        Marcar todas como leídas
                      </button>
                    }
                  </header>

                  @if (unreadNotifications.length) {
                    <ul class="notif-list">
                      @for (n of unreadNotifications.slice(0, 10); track n.id) {
                        <li>
                          <button
                            type="button"
                            class="notif-item"
                            (click)="openNotif(n)"
                          >
                            <span class="notif-item-title">{{ n.title }}</span>
                            <span class="notif-item-body">{{ n.body }}</span>
                          </button>
                        </li>
                      }
                    </ul>
                  } @else {
                    <div class="notif-empty">
                      <app-icon name="inbox" [size]="22" />
                      <p>Estás al día. No tienes avisos pendientes.</p>
                    </div>
                  }
                </div>
              }
            </div>

            <a [routerLink]="homeForRole" class="btn btn-secondary btn-sm account-link">
              <app-icon name="user" [size]="16" />
              <span>{{ userFirstName }}</span>
            </a>
            <button type="button" class="btn btn-ghost btn-sm" (click)="auth.logout()">Salir</button>
          } @else {
            @for (action of guestActions; track action.label) {
              <a
                [routerLink]="action.path"
                [queryParams]="action.query"
                [class]="action.variant === 'primary' ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm'"
              >{{ action.label }}</a>
            }
          }
        </div>

        <button
          type="button"
          class="btn btn-ghost btn-icon menu-trigger"
          [attr.aria-label]="showMenu ? 'Cerrar menú' : 'Abrir menú'"
          [attr.aria-expanded]="showMenu"
          (click)="toggleMenu($event)"
        >
          <app-icon [name]="showMenu ? 'x' : 'menu'" [size]="20" />
        </button>
      </div>

      @if (showMenu) {
        <div class="mobile-menu">
          @if (showProductSwitcher) {
            <p class="mobile-menu-label">Productos</p>
            @for (item of productSwitcherItems; track item.id) {
              <a [routerLink]="item.path" (click)="switchProduct(item.id); closeAll()">{{ item.label }}</a>
            }
          }

          @for (link of navLinks; track link.label) {
            @if (link.fragment) {
              <a [href]="link.path + '#' + link.fragment" (click)="goToSection($event, link.path, link.fragment)">
                {{ link.label }}
              </a>
            } @else {
              <a [routerLink]="link.path" (click)="closeAll()">{{ link.label }}</a>
            }
          }

          <div class="mobile-menu-actions">
            @if (auth.isLoggedIn) {
              <a [routerLink]="homeForRole" class="btn btn-secondary btn-block" (click)="closeAll()">
                {{ roleHomeLabel }}
              </a>
              <button type="button" class="btn btn-ghost btn-block" (click)="auth.logout()">Salir</button>
            } @else {
              @for (action of guestActions; track action.label) {
                <a
                  [routerLink]="action.path"
                  [queryParams]="action.query"
                  (click)="closeAll()"
                  [class]="action.variant === 'primary' ? 'btn btn-primary btn-block' : 'btn btn-secondary btn-block'"
                >{{ action.label }}</a>
              }
            }
          </div>
        </div>
      }
    </header>

    <main id="contenido">
      <router-outlet />
    </main>

    @if (!isDivorcioFlow) {
    <footer class="site-footer" [class.is-compact]="isAuthPage">
      @if (!isAuthPage) {
      <div class="shell footer-grid">
        <div class="footer-col footer-brand">
          <strong>{{ footerBrandName }}</strong>
          @if (footerBrandName !== 'LegalStation') { <p class="footer-by">por LegalStation</p> }
          <p>{{ footerPitch }}</p>
        </div>

        <div class="footer-col">
          <h2>Productos</h2>
          <a routerLink="/productos/divorcio360">Divorcio360</a>
          <a routerLink="/productos/traslado360">Traslado360</a>
          <a routerLink="/productos/bienraiz360">BienRaiz360</a>
          <span class="footer-soon">Estate360 · próximamente</span>
          <span class="footer-soon">SignDesk · próximamente</span>
        </div>

        <div class="footer-col">
          <h2>Tu cuenta</h2>
          @if (auth.isLoggedIn) {
            <a [routerLink]="homeForRole">{{ roleHomeLabel }}</a>
            @if (auth.user()?.role === 'abogado') { <a routerLink="/fase2/admin">Fase 2</a> }
          } @else {
            <a [routerLink]="['/auth']" [queryParams]="{ returnUrl: '/' }">Ingresar</a>
            <a routerLink="/cuestionario">Comprobar si aplico</a>
          }
          <a routerLink="/">Inicio</a>
        </div>

        <div class="footer-col">
          <h2>Ayuda</h2>
          <span class="footer-soon">Política de datos</span>
          <span class="footer-soon">Términos de uso</span>
          <a href="mailto:soporte@legalstation.ec">soporte&#64;legalstation.ec</a>
        </div>
      </div>
      }

      <div class="shell footer-bottom">
        <span>© 2026 LegalStation</span>
        <span class="footer-soon">Pagos y firmas procesados de forma segura.</span>
      </div>
    </footer>
    }
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100dvh;
    }

    .skip-link {
      position: absolute;
      top: var(--space-2);
      left: var(--space-2);
      z-index: 999;
      padding: var(--space-2) var(--space-4);
      border-radius: var(--radius-md);
      background: var(--surface);
      border: 1px solid var(--border-strong);
      font-size: var(--text-sm);
      font-weight: 600;
      text-decoration: none;
      transform: translateY(-200%);
    }

    .skip-link:focus-visible { transform: translateY(0); }

    /* ---------- Cabecera ---------- */

    .site-header {
      --header-accent: var(--primary);
      position: sticky;
      top: 0;
      z-index: var(--z-header);
      background: color-mix(in srgb, var(--bg) 88%, transparent);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border);
      transition:
        background 280ms cubic-bezier(0.32, 0.72, 0, 1),
        border-color 280ms cubic-bezier(0.32, 0.72, 0, 1),
        padding 280ms cubic-bezier(0.32, 0.72, 0, 1);
    }

    /* Isla flotante en marketing — cambio bien visible */
    .site-header.on-marketing {
      background: transparent;
      border-bottom: none;
      padding: 0.85rem clamp(0.75rem, 2vw, 1.25rem) 0;
      pointer-events: none;
    }

    .site-header.on-marketing .header-bar,
    .site-header.on-marketing .mobile-menu {
      pointer-events: auto;
    }

    .site-header.on-marketing .header-bar {
      max-width: min(68rem, calc(100% - 0.5rem));
      min-height: 3.35rem;
      gap: var(--space-4);
      padding-inline: 0.85rem 0.55rem;
      border-radius: 999px;
      background: color-mix(in srgb, var(--bg) 78%, transparent);
      backdrop-filter: blur(18px) saturate(1.35);
      -webkit-backdrop-filter: blur(18px) saturate(1.35);
      border: 1px solid color-mix(in srgb, var(--border) 70%, transparent);
      box-shadow:
        0 1px 0 color-mix(in srgb, #fff 55%, transparent) inset,
        0 10px 36px color-mix(in srgb, var(--header-accent) 10%, rgb(27 25 23 / 0.08));
      transition:
        box-shadow 280ms cubic-bezier(0.32, 0.72, 0, 1),
        background 280ms cubic-bezier(0.32, 0.72, 0, 1),
        border-color 280ms cubic-bezier(0.32, 0.72, 0, 1);
    }

    .site-header.on-marketing.is-scrolled .header-bar {
      background: color-mix(in srgb, var(--bg) 92%, transparent);
      border-color: color-mix(in srgb, var(--border) 90%, var(--header-accent));
      box-shadow:
        0 1px 0 color-mix(in srgb, #fff 40%, transparent) inset,
        0 14px 40px color-mix(in srgb, var(--header-accent) 14%, rgb(27 25 23 / 0.12));
    }

    .site-header.on-marketing .brand {
      font-family: var(--font-display);
      font-weight: 600;
      letter-spacing: -0.03em;
    }

    .site-header.on-marketing .brand-mark {
      width: 2rem;
      height: 2rem;
      border-radius: 999px;
      background: color-mix(in srgb, var(--header-accent) 16%, transparent);
      box-shadow: 0 0 0 1px color-mix(in srgb, var(--header-accent) 22%, transparent);
    }

    .site-header.on-marketing .nav-link,
    .site-header.on-marketing .dropdown-trigger {
      padding: 0.35rem 0.55rem;
      border-radius: 999px;
      transition:
        color 200ms cubic-bezier(0.32, 0.72, 0, 1),
        background 200ms cubic-bezier(0.32, 0.72, 0, 1);
    }

    .site-header.on-marketing .nav-link:hover,
    .site-header.on-marketing .nav-link.is-active,
    .site-header.on-marketing .dropdown-trigger:hover,
    .site-header.on-marketing .dropdown-trigger[aria-expanded='true'] {
      color: var(--text);
      background: color-mix(in srgb, var(--header-accent) 10%, transparent);
    }

    .site-header.on-marketing .btn-primary {
      border-radius: 999px;
      padding-inline: 1.1rem;
      font-weight: 600;
      box-shadow: 0 8px 20px color-mix(in srgb, var(--header-accent) 28%, transparent);
    }

    .site-header.on-marketing .mobile-menu {
      margin: 0.65rem clamp(0.75rem, 2vw, 1.25rem) 0;
      border-radius: 1.35rem;
      border: 1px solid var(--border);
      background: color-mix(in srgb, var(--bg) 94%, transparent);
      backdrop-filter: blur(16px);
      box-shadow: var(--shadow-lg);
    }

    .header-bar {
      display: flex;
      align-items: center;
      gap: var(--space-5);
      width: 100%;
      max-width: var(--container-wide);
      margin-inline: auto;
      padding-inline: var(--container-pad);
      min-height: var(--header-height);
    }

    .brand {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      font-size: var(--text-base);
      font-weight: 650;
      letter-spacing: var(--tracking-tight);
      color: var(--text);
      text-decoration: none;
      margin-right: auto;
    }

    .brand-mark {
      display: grid;
      place-items: center;
      width: 1.75rem;
      height: 1.75rem;
      border-radius: var(--radius-sm);
      background: color-mix(in srgb, var(--header-accent) 12%, transparent);
      color: var(--header-accent);
    }

    .brand-mark-360 {
      font-size: 0.6rem;
      font-weight: 700;
      letter-spacing: 0;
    }

    .brand-text { display: grid; line-height: 1.2; }

    .brand-text small {
      font-size: var(--text-xs);
      font-weight: 500;
      color: var(--text-muted);
      letter-spacing: 0;
    }

    .header-nav {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }

    .nav-link {
      font-size: var(--text-sm);
      font-weight: 500;
      color: var(--text-secondary);
      text-decoration: none;
      white-space: nowrap;
      cursor: pointer;
      transition: color var(--dur-fast) var(--ease);
    }

    .nav-link:hover,
    .nav-link.is-active { color: var(--text); }

    .dropdown-trigger {
      display: inline-flex;
      align-items: center;
      gap: var(--space-1);
      background: none;
      border: 0;
      padding: 0;
      font: inherit;
      font-size: var(--text-sm);
      font-weight: 500;
      line-height: inherit;
      color: var(--text-secondary);
      cursor: pointer;
    }

    .dropdown-trigger:hover { color: var(--text); }

    .product-switcher {
      position: relative;
      display: flex;
      align-items: center;
    }

    .dropdown-panel {
      position: absolute;
      top: calc(100% + var(--space-2));
      left: 0;
      min-width: 11rem;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      padding: var(--space-2);
      z-index: var(--z-dropdown);
      animation: notif-in var(--dur-base) var(--ease-out);
    }

    .dropdown-item {
      display: block;
      padding: var(--space-2) var(--space-3);
      border-radius: var(--radius-md);
      font-size: var(--text-sm);
      font-weight: 500;
      color: var(--text-secondary);
      text-decoration: none;
    }

    .dropdown-item:hover,
    .dropdown-item.is-active {
      background: var(--bg-subtle);
      color: var(--text);
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      margin-left: auto;
    }

    .account-link { max-width: 11rem; }
    .account-link span { overflow: hidden; text-overflow: ellipsis; }

    .site-header .btn-primary {
      --btn-bg: var(--header-accent);
      --btn-border: var(--header-accent);
    }

    .site-header .btn-primary:hover:not(:disabled) {
      --btn-bg: color-mix(in srgb, var(--header-accent) 85%, #000);
      --btn-border: color-mix(in srgb, var(--header-accent) 85%, #000);
    }

    /* ---------- Notificaciones ---------- */

    .notif-wrap { position: relative; }

    .notif-trigger { position: relative; }

    .notif-count {
      position: absolute;
      top: 2px;
      right: 2px;
      min-width: 1.05rem;
      padding: 0 0.2rem;
      border-radius: var(--radius-full);
      background: var(--danger);
      color: #fff;
      font-size: 0.65rem;
      font-weight: 700;
      line-height: 1.05rem;
      text-align: center;
    }

    .notif-panel {
      position: absolute;
      top: calc(100% + var(--space-2));
      right: 0;
      width: min(22rem, calc(100vw - 2rem));
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      overflow: hidden;
      z-index: var(--z-dropdown);
      animation: notif-in var(--dur-base) var(--ease-out);
    }

    @keyframes notif-in {
      from { opacity: 0; transform: translateY(-6px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .notif-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-2);
      padding: var(--space-3) var(--space-3) var(--space-3) var(--space-4);
      border-bottom: 1px solid var(--border);
    }

    .notif-head strong { font-size: var(--text-sm); }

    .notif-list {
      list-style: none;
      margin: 0;
      padding: 0;
      max-height: 24rem;
      overflow-y: auto;
      overflow-x: hidden;
    }

    .notif-list li {
      display: block;
      width: 100%;
      margin: 0;
      padding: 0;
    }

    .notif-item {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 0.375rem;
      width: 100%;
      min-height: auto;
      height: auto;
      box-sizing: border-box;
      margin: 0;
      padding: var(--space-4);
      text-align: left;
      background: none;
      border: 0;
      border-bottom: 1px solid var(--border);
      border-radius: 0;
      cursor: pointer;
      transition: background var(--dur-fast) var(--ease);
    }

    .notif-list li:last-child .notif-item { border-bottom: 0; }
    .notif-item:hover { background: var(--bg-subtle); }

    .notif-item-title {
      display: block;
      width: 100%;
      font-size: var(--text-sm);
      font-weight: 500;
      line-height: 1.45;
      color: var(--text);
      word-break: break-word;
      overflow-wrap: anywhere;
    }

    .notif-item-body {
      display: block;
      width: 100%;
      font-size: var(--text-xs);
      font-weight: 400;
      line-height: 1.5;
      color: var(--text-muted);
      word-break: break-word;
      overflow-wrap: anywhere;
      white-space: normal;
    }

    .notif-empty {
      display: grid;
      justify-items: center;
      gap: var(--space-2);
      padding: var(--space-6) var(--space-4);
      color: var(--text-muted);
      text-align: center;
    }

    .notif-empty p { margin: 0; font-size: var(--text-sm); }

    /* ---------- Menú móvil ---------- */

    .menu-trigger { display: none; }

    .mobile-menu {
      display: grid;
      gap: var(--space-1);
      padding: var(--space-3) var(--container-pad) var(--space-5);
      border-top: 1px solid var(--border);
      background: var(--surface);
      animation: notif-in var(--dur-base) var(--ease-out);
    }

    .mobile-menu > a {
      padding: var(--space-3) 0;
      font-size: var(--text-base);
      font-weight: 500;
      color: var(--text);
      text-decoration: none;
    }

    .mobile-menu-label {
      margin: 0;
      padding: var(--space-2) 0 0;
      font-size: var(--text-xs);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: var(--tracking-wide);
      color: var(--text-muted);
    }

    .mobile-menu-actions {
      display: grid;
      gap: var(--space-2);
      margin-top: var(--space-3);
      padding-top: var(--space-4);
      border-top: 1px solid var(--border);
    }

    /* ---------- Contenido ---------- */

    main {
      flex: 1;
    }

    /* ---------- Pie ---------- */

    .site-footer {
      margin-top: var(--space-8);
      padding-top: var(--space-7);
      background: var(--bg-subtle);
      border-top: 1px solid var(--border);
      color: var(--text-secondary);
      font-size: var(--text-sm);
    }

    /* En autenticación el pie se reduce para que el formulario quepa en pantalla */
    .site-footer.is-compact {
      margin-top: 0;
      padding-top: 0;
      background: transparent;
    }

    .site-footer.is-compact .footer-bottom {
      border-top: 0;
      padding-block: var(--space-4);
    }

    .footer-grid {
      display: grid;
      grid-template-columns: 1.6fr repeat(3, 1fr);
      gap: var(--space-6) var(--space-5);
      padding-bottom: var(--space-6);
    }

    .footer-col {
      display: grid;
      gap: var(--space-2);
      align-content: start;
    }

    .footer-col h2 {
      margin: 0 0 var(--space-1);
      font-size: var(--text-xs);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: var(--tracking-wide);
      color: var(--text);
    }

    .footer-brand strong {
      font-size: var(--text-lg);
      font-weight: 650;
      color: var(--text);
    }

    .footer-by {
      margin: 0;
      font-size: var(--text-xs);
      font-weight: 500;
      color: var(--text-muted);
    }

    .footer-brand p {
      margin: 0;
      max-width: 32ch;
      line-height: var(--leading-normal);
    }

    .footer-col a {
      color: inherit;
      text-decoration: none;
      font-size: var(--text-sm);
    }

    .footer-col a:hover { color: var(--primary); text-decoration: underline; }

    .footer-soon {
      font-size: var(--text-sm);
      color: var(--text-muted);
    }

    .footer-bottom {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: var(--space-2);
      padding: var(--space-4) var(--container-pad) var(--space-6);
      border-top: 1px solid var(--border);
      font-size: var(--text-xs);
    }

    /* ---------- Responsive ---------- */

    @media (max-width: 900px) {
      .footer-grid { grid-template-columns: 1fr 1fr; }
    }

    @media (max-width: 820px) {
      .header-nav { display: none; }
      .menu-trigger { display: inline-flex; }
      .header-actions .account-link span,
      .header-actions .btn-ghost:not(.notif-trigger):not(.menu-trigger) { display: none; }
      .header-actions .account-link { max-width: none; }
    }

    @media (max-width: 560px) {
      .footer-grid { grid-template-columns: 1fr; }
      .brand-text small { display: none; }
    }
  `]
})
export class ShellComponent implements OnInit, OnDestroy {
  isLegalStationMarketing = false;
  isDivorcioMarketing = false;
  isTrasladoMarketing = false;
  isBienraizMarketing = false;
  isProductLanding = false;
  isDivorcioFlow = false;
  isAuthPage = false;
  isDivorcioAuth = false;
  activeProduct = 'divorcio360';
  productSite = getProductSite('divorcio360');
  notifications: any[] = [];
  unreadCount = 0;
  showNotifs = false;
  showMenu = false;
  showProducts = false;
  headerScrolled = false;

  private pollId?: ReturnType<typeof setInterval>;

  constructor(
    public auth: AuthService,
    private router: Router,
    private api: ApiService,
    private viewport: ViewportScroller,
  ) {}

  /* ---------- Identidad de la cabecera ---------- */

  get isMarketing(): boolean {
    return this.isLegalStationMarketing || this.isDivorcioMarketing
      || this.isTrasladoMarketing || this.isBienraizMarketing || this.isProductLanding;
  }

  get isProductContext(): boolean {
    const path = this.cleanPath(this.router.url);
    const inClientWithProduct = path === '/cliente' && !!getActiveProduct();
    return !this.isLegalStationMarketing && (
      this.isProductLanding || this.isDivorcioFlow || this.isDivorcioAuth || inClientWithProduct
    );
  }

  get showProductSwitcher(): boolean {
    return !this.isAuthPage;
  }

  get navLinks(): NavLink[] {
    if (this.isAuthPage) return [];

    const links: NavLink[] = [];

    if (this.isLegalStationMarketing) {
      // "Productos" ya está en el switcher — aquí Catálogo evita duplicado
      links.push(
        { label: 'Catálogo', path: '/', fragment: 'catalogo' },
        { label: 'Precios', path: '/', fragment: 'precios' },
      );
    } else if (this.isMarketing) {
      links.push(
        { label: 'Inicio', path: this.productHome, exact: true },
        { label: 'Cómo funciona', path: this.productHome, fragment: 'flujo' },
        { label: 'Precios', path: this.productHome, fragment: 'precios' },
      );
    } else if (this.isProductContext || this.isDivorcioFlow) {
      links.push({ label: 'Inicio', path: this.productHome, exact: true });
    }

    // Guest ya tiene CTA primary en header-actions — no duplicar
    if (this.auth.isLoggedIn) {
      links.push({ label: 'Evaluar mi caso', path: getProductQuestionnairePath(this.activeProduct) });
      const role = this.auth.user()?.role;
      if (role === 'cliente') {
        links.push({ label: 'Mis expedientes', path: '/cliente' });
      } else if (role === 'abogado') {
        links.push({ label: 'Casos', path: '/abogado' });
        links.push({ label: 'Fase 2', path: '/fase2/admin' });
      }
    }

    return links;
  }

  get productSwitcherItems(): ProductSwitcherItem[] {
    return [
      { id: 'divorcio360', label: 'Divorcio360', path: '/productos/divorcio360' },
      { id: 'traslado360', label: 'Traslado360', path: '/productos/traslado360' },
      { id: 'bienraiz360', label: 'BienRaiz360', path: '/productos/bienraiz360' },
      { id: 'legalstation', label: 'LegalStation', path: '/' },
    ];
  }

  get brand(): { home: string; name: string; sub: string; mark: 'logo' | '360' } {
    if (this.isProductContext) {
      return { home: this.productHome, name: this.productDisplayName, sub: 'por LegalStation', mark: '360' };
    }
    return { home: '/', name: 'LegalStation', sub: '', mark: 'logo' };
  }

  get headerAccent(): string {
    if (!this.isProductContext) return 'var(--primary)';
    return this.productSite?.accent || 'var(--primary)';
  }

  get guestActions(): ActionLink[] {
    if (this.isAuthPage) {
      return [{ label: 'Volver', path: this.isDivorcioAuth ? this.productHome : '/', variant: 'quiet' }];
    }

    const query: Record<string, string> = this.isProductContext
      ? { product: this.activeProduct, returnUrl: getProductQuestionnairePath(this.activeProduct) }
      : { returnUrl: '/' };

    return [
      { label: 'Ingresar', path: '/auth', query, variant: 'quiet' },
      { label: 'Evaluar mi caso', path: getProductQuestionnairePath(this.activeProduct), variant: 'primary' },
    ];
  }

  get homeForRole(): string {
    const role = this.auth.user()?.role;
    if (role === 'abogado') return '/abogado';
    return '/cliente';
  }

  get roleHomeLabel(): string {
    const role = this.auth.user()?.role;
    if (role === 'abogado') return 'Panel de casos';
    return 'Mis expedientes';
  }

  get userFirstName(): string {
    return this.auth.user()?.full_name?.split(' ')[0] ?? 'Mi cuenta';
  }

  get productHome(): string {
    return `/productos/${this.activeProduct}`;
  }

  get productQuestionnaire(): string {
    return getProductQuestionnairePath(this.activeProduct);
  }

  get productDisplayName(): string {
    if (this.activeProduct === 'divorcio360') return 'Divorcio360';
    return this.productSite?.name || 'LegalStation';
  }

  get footerBrandName(): string {
    return this.isProductContext ? this.productDisplayName : 'LegalStation';
  }

  get footerPitch(): string {
    if (this.isProductContext) {
      return 'Al mismo costo que presencial, sin filas ni desplazamientos. Todo el trámite desde casa.';
    }
    return 'Servicios jurídicos al mismo costo, sin filas ni trámites.';
  }

  /* ---------- Notificaciones ---------- */

  get unreadNotifications(): any[] {
    return this.notifications.filter((n: any) => !n.read);
  }

  get notifLabel(): string {
    if (!this.unreadCount) return 'Notificaciones, ninguna sin leer';
    return `Notificaciones, ${this.unreadCount} sin leer`;
  }

  /* ---------- Ciclo de vida ---------- */

  ngOnInit(): void {
    this.applyMode(this.router.url);
    if (this.auth.isLoggedIn) this.loadNotifs();

    this.pollId = setInterval(() => {
      if (this.auth.isLoggedIn) this.loadNotifs();
    }, 20000);

    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe((e: NavigationEnd) => {
      this.applyMode(e.urlAfterRedirects);
      this.closeAll();
      if (this.auth.isLoggedIn) this.loadNotifs();

      const path = this.cleanPath(e.urlAfterRedirects);
      if (path.startsWith('/productos/divorcio360') && !e.urlAfterRedirects.includes('#')) {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
      }

      const fragment = e.urlAfterRedirects.split('#')[1];
      if (fragment) setTimeout(() => this.scrollToId(fragment), 50);
    });
  }

  ngOnDestroy(): void {
    if (this.pollId) clearInterval(this.pollId);
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.headerScrolled = (window.scrollY || 0) > 12;
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    if (this.showNotifs || this.showMenu || this.showProducts) this.closeAll();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeAll();
  }

  closeAll(): void {
    this.showNotifs = false;
    this.showMenu = false;
    this.showProducts = false;
  }

  toggleProducts(event: Event): void {
    event.stopPropagation();
    const next = !this.showProducts;
    this.closeAll();
    this.showProducts = next;
  }

  switchProduct(id: string): void {
    if (id !== 'legalstation') setActiveProduct(id);
  }

  toggleNotifs(event: Event): void {
    event.stopPropagation();
    const next = !this.showNotifs;
    this.closeAll();
    this.showNotifs = next;
    if (next) this.loadNotifs();
  }

  toggleMenu(event: Event): void {
    event.stopPropagation();
    const next = !this.showMenu;
    this.closeAll();
    this.showMenu = next;
  }

  goToSection(event: Event, path: string, id: string): void {
    event.preventDefault();
    event.stopPropagation();
    this.closeAll();
    if (this.cleanPath(this.router.url) === path) {
      this.scrollToId(id);
      return;
    }
    void this.router.navigate([path], { fragment: id });
  }

  loadNotifs(): void {
    this.api.listNotifications().subscribe({
      next: (list) => {
        this.notifications = list.map((n: any) => ({
          ...n,
          title: this.sanitizeNotifText(n.title),
          body: this.sanitizeNotifText(n.body),
        }));
        this.unreadCount = this.unreadNotifications.length;
      },
      error: () => {},
    });
  }

  openNotif(n: any): void {
    this.api.markNotificationRead(n.id).subscribe(() => {
      n.read = true;
      this.unreadCount = this.unreadNotifications.length;
    });
    this.closeAll();
    if (n.case_id) {
      const base = this.auth.user()?.role === 'abogado' ? '/abogado/caso' : '/caso';
      void this.router.navigate([base, n.case_id]);
    }
  }

  markAllRead(event?: Event): void {
    event?.stopPropagation();
    event?.preventDefault();
    this.api.markAllNotificationsRead().subscribe({
      next: () => {
        this.notifications = this.notifications.map((n: any) => ({ ...n, read: true }));
        this.unreadCount = 0;
        this.closeAll();
      },
      error: () => {
        this.loadNotifs();
      },
    });
  }

  private sanitizeNotifText(text: string): string {
    if (!text) return text;
    let t = text
      .replace(/Minuta del notario/gi, 'Minuta disponible')
      .replace(/Actualización notarial/gi, 'Actualización de expediente')
      .replace(/Enviado a notar[ií]a/gi, 'En revisión jurídica')
      .replace(/notar[ií]a/gi, 'bufete')
      .replace(/notario/gi, 'abogado')
      .replace(/bufetel/gi, 'bufete');

    t = t.replace(/\d{4}-\d{2}-\d{2}T[\d:.]+Z?/g, (iso) => {
      try {
        return new Intl.DateTimeFormat('es-EC', {
          dateStyle: 'medium',
          timeStyle: 'short',
        }).format(new Date(iso));
      } catch {
        return iso;
      }
    });

    return t;
  }

  /* ---------- Detección de contexto ---------- */

  private scrollToId(id: string): void {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    else this.viewport.scrollToAnchor(id);
  }

  private cleanPath(url: string): string {
    return url.split('?')[0].split('#')[0];
  }

  private applyMode(url: string): void {
    const path = this.cleanPath(url);
    const qs = url.includes('?') ? url.split('?')[1].split('#')[0] : '';
    const params = new URLSearchParams(qs);

    this.isAuthPage = path === '/auth';
    this.isDivorcioAuth = this.isAuthPage && (params.get('next') === 'checkout' || params.get('product') === 'divorcio360');
    this.isLegalStationMarketing = (path === '/' || path === '') && !this.isAuthPage;
    this.isDivorcioMarketing = path.startsWith('/productos/divorcio360') && !path.includes('/cuestionario') && !path.includes('/expediente');
    this.isTrasladoMarketing = path.startsWith('/productos/traslado360') && !path.includes('/cuestionario') && !path.includes('/expediente');
    this.isBienraizMarketing = path.startsWith('/productos/bienraiz360') && !path.includes('/cuestionario') && !path.includes('/expediente');
    this.isProductLanding = /^\/productos\/[^/]+$/.test(path);

    if (path.includes('traslado360')) this.activeProduct = 'traslado360';
    else if (path.includes('bienraiz360')) this.activeProduct = 'bienraiz360';
    else if (path.includes('divorcio360') || path === '/cuestionario') this.activeProduct = 'divorcio360';
    else if (path.includes('signdesk')) this.activeProduct = 'signdesk';
    else if (path.includes('matterflow')) this.activeProduct = 'matterflow';
    else if (path.includes('compliancehub')) this.activeProduct = 'compliancehub';
    else if (path.includes('notarylink')) this.activeProduct = 'notarylink';
    else {
      const fromPath = detectProductFromPath(path);
      this.activeProduct = fromPath || getActiveProduct();
    }

    if (detectProductFromPath(path) || path === '/cuestionario') {
      setActiveProduct(this.activeProduct);
    }

    this.productSite = getProductSite(this.activeProduct);

    this.isDivorcioFlow = !this.isAuthPage && (
      DIVORCIO_FLOW.some((p) => path.startsWith(p)) ||
      path.startsWith('/productos/traslado360') ||
      path.startsWith('/productos/bienraiz360') ||
      path.startsWith('/consulta')
    );

    document.body.classList.toggle('saas-mode', this.isLegalStationMarketing || (this.isAuthPage && !this.isDivorcioAuth));
    document.body.classList.toggle('product-landing-mode', this.isProductLanding || this.isDivorcioAuth);
    document.body.classList.toggle('divorcio-flow-mode', this.isDivorcioFlow || this.isProductLanding || this.isDivorcioAuth);
    document.body.classList.toggle('product-mode', !this.isMarketing && !this.isDivorcioFlow && !this.isAuthPage);
  }
}
