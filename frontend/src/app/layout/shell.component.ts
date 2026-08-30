import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ViewportScroller } from '@angular/common';
import { filter } from 'rxjs/operators';
import { AuthService } from '../core/auth.service';
import { ApiService } from '../core/api.service';

const DIVORCIO_FLOW = ['/cuestionario', '/cliente', '/checkout', '/upload', '/firma', '/caso'];

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    @if (isLegalStationMarketing) {
      <header class="mk-header">
        <div class="mk-bar">
          <a routerLink="/" class="mk-brand">
            <span class="mk-logo" aria-hidden="true">⚖</span>
            LegalStation.
          </a>
          <nav class="mk-nav">
            <a routerLink="/" routerLinkActive="on" [routerLinkActiveOptions]="{exact:true}">Plataforma</a>
            <a href="/#catalogo" (click)="goToSection($event, '/', 'catalogo')">Productos</a>
            <a href="/#precios" (click)="goToSection($event, '/', 'precios')">Precios</a>
            @if (auth.user()?.role === 'abogado') {
              <a routerLink="/fase2/admin">Fase 2</a>
            }
          </nav>
          <div class="mk-actions">
            @if (auth.isLoggedIn) {
              <span class="mk-user">{{ userFirstName }}</span>
              @if (auth.user()?.role === 'abogado') {
                <a routerLink="/abogado" class="mk-cta">Panel</a>
              } @else {
                <a routerLink="/cliente" class="mk-cta">Mi expediente</a>
              }
              <button type="button" class="mk-signin" (click)="auth.logout()">Salir</button>
            } @else {
              <a [routerLink]="['/auth']" [queryParams]="{ returnUrl: '/' }" class="mk-signin">Ingresar</a>
              <a href="/#catalogo" (click)="goToSection($event, '/', 'catalogo')" class="mk-cta">Comenzar</a>
            }
          </div>
        </div>
      </header>
    } @else if (isDivorcioMarketing) {
      <header class="mk-header d360-header">
        <div class="mk-bar">
          <a routerLink="/productos/divorcio360" class="mk-brand d360-brand">
            <span class="mk-logo d360-logo" aria-hidden="true">360</span>
            <span>
              Divorcio360
              <small class="mk-by">by LegalStation</small>
            </span>
          </a>
          <nav class="mk-nav">
            <a href="/productos/divorcio360#flujo" (click)="goToSection($event, '/productos/divorcio360', 'flujo')">Flujo</a>
            <a href="/productos/divorcio360#precios" (click)="goToSection($event, '/productos/divorcio360', 'precios')">Precios</a>
            <a routerLink="/">LegalStation</a>
          </nav>
          <div class="mk-actions">
            @if (auth.isLoggedIn) {
              <span class="mk-user">{{ userFirstName }}</span>
              @if (auth.user()?.role === 'cliente') {
                <a routerLink="/cliente" class="mk-cta">Mi expediente</a>
              } @else if (auth.user()?.role === 'abogado') {
                <a routerLink="/abogado" class="mk-cta">Panel</a>
              }
              <button type="button" class="mk-signin" (click)="auth.logout()">Salir</button>
            } @else {
              <a [routerLink]="['/auth']" [queryParams]="{ product: 'divorcio360', returnUrl: '/productos/divorcio360' }" class="mk-signin">Ingresar</a>
              <a routerLink="/cuestionario" class="mk-cta">Comenzar</a>
            }
          </div>
        </div>
      </header>
    } @else if (isAuthPage && isDivorcioAuth) {
      <header class="mk-header d360-header">
        <div class="mk-bar">
          <a routerLink="/productos/divorcio360" class="mk-brand d360-brand">
            <span class="mk-logo d360-logo" aria-hidden="true">360</span>
            <span>Divorcio360<small class="mk-by">by LegalStation</small></span>
          </a>
          <nav class="mk-nav">
            <a routerLink="/productos/divorcio360">Inicio producto</a>
          </nav>
          <div class="mk-actions">
            <a routerLink="/productos/divorcio360" class="mk-signin">Volver a Divorcio360</a>
          </div>
        </div>
      </header>
    } @else if (isAuthPage) {
      <header class="mk-header">
        <div class="mk-bar">
          <a routerLink="/" class="mk-brand">
            <span class="mk-logo" aria-hidden="true">⚖</span>
            LegalStation.
          </a>
          <nav class="mk-nav">
            <a routerLink="/">Plataforma</a>
          </nav>
          <div class="mk-actions">
            <a routerLink="/" class="mk-signin">← Volver</a>
          </div>
        </div>
      </header>
    } @else if (isDivorcioFlow) {
      <header class="top d360-top">
        <div class="shell bar">
          <a routerLink="/productos/divorcio360" class="brand d360-brand-inline">
            Divorcio<span>360</span>
            <small class="by-ls">by LegalStation</small>
          </a>
          <nav>
            @if (auth.user()?.role !== 'abogado') {
              <a routerLink="/cuestionario" routerLinkActive="on">Cuestionario</a>
            }
            @if (auth.user()?.role === 'cliente') {
              <a routerLink="/cliente" routerLinkActive="on">Mi expediente</a>
            }
            <a routerLink="/productos/divorcio360" class="nav-back">Volver a Divorcio360</a>
            @if (auth.isLoggedIn) {
              <span class="user-chip">{{ userFirstName }}</span>
              <button type="button" class="bell btn btn-ghost" (click)="toggleNotifs()" aria-label="Notificaciones">
                🔔
                @if (unreadCount) { <span class="count">{{ unreadCount }}</span> }
              </button>
              @if (showNotifs && notifications.length) {
                <div class="notif-drop panel">
                  @for (n of notifications.slice(0, 8); track n.id) {
                    <button type="button" class="notif-item" (click)="openNotif(n)">
                      <strong>{{ n.title }}</strong>
                      <span class="muted">{{ n.body }}</span>
                    </button>
                  }
                </div>
              }
              <button type="button" class="btn btn-ghost" (click)="auth.logout()">Salir</button>
            } @else {
              <a [routerLink]="['/auth']" [queryParams]="{ product: 'divorcio360', returnUrl: '/productos/divorcio360' }" class="btn btn-primary nav-cta">Ingresar</a>
            }
          </nav>
        </div>
      </header>
    } @else {
      <header class="top">
        <div class="shell bar">
          <a routerLink="/" class="brand">Legal<span>Station</span></a>
          <nav>
            @if (auth.user()?.role !== 'abogado') {
              <a routerLink="/cuestionario" routerLinkActive="on">Cuestionario</a>
            }
            @if (auth.user()?.role === 'cliente') {
              <a routerLink="/cliente" routerLinkActive="on">Mi expediente</a>
            }
            @if (auth.user()?.role === 'abogado') {
              <a routerLink="/abogado" routerLinkActive="on">Panel operador</a>
              <a routerLink="/fase2/admin" routerLinkActive="on">Fase 2</a>
            }
            @if (auth.isLoggedIn) {
              <span class="user-chip">{{ userFirstName }}</span>
              <button type="button" class="bell btn btn-ghost" (click)="toggleNotifs()" aria-label="Notificaciones">
                🔔
                @if (unreadCount) { <span class="count">{{ unreadCount }}</span> }
              </button>
              @if (showNotifs && notifications.length) {
                <div class="notif-drop panel">
                  @for (n of notifications.slice(0, 8); track n.id) {
                    <button type="button" class="notif-item" (click)="openNotif(n)">
                      <strong>{{ n.title }}</strong>
                      <span class="muted">{{ n.body }}</span>
                    </button>
                  }
                </div>
              }
              <button type="button" class="btn btn-ghost" (click)="auth.logout()">Salir</button>
            } @else {
              <a routerLink="/auth" class="btn btn-primary nav-cta">Ingresar</a>
            }
          </nav>
        </div>
      </header>
    }
    <main>
      <router-outlet />
    </main>
    <footer class="foot" [class.marketing-foot]="isLegalStationMarketing || isDivorcioMarketing" [class.d360-foot]="isDivorcioFlow || isDivorcioMarketing">
      <div class="shell foot-grid">
        <div class="foot-col brand-col">
          @if (isDivorcioFlow || isDivorcioMarketing) {
            <strong class="foot-logo">Divorcio360</strong>
            <p class="foot-by">by LegalStation</p>
            <p>Divorcio notarial en Ecuador — intake, expediente y firma en un solo flujo demo.</p>
          } @else {
            <strong class="foot-logo">LegalStation</strong>
            <p>Plataforma legal ops para Latinoamérica. Intake, expedientes, firmas y cumplimiento en un solo lugar.</p>
          }
        </div>
        <div class="foot-col">
          <h4>Productos</h4>
          <a routerLink="/productos/divorcio360">Divorcio360</a>
          <span class="foot-muted">Estate360 · Próximamente</span>
          <span class="foot-muted">SignDesk · Próximamente</span>
        </div>
        <div class="foot-col">
          <h4>Plataforma</h4>
          @if (auth.user()?.role === 'abogado') {
            <a routerLink="/abogado">Panel operador</a>
            <a routerLink="/fase2/admin">Fase 2</a>
          } @else if (auth.user()?.role === 'cliente') {
            <a routerLink="/cliente">Mi expediente</a>
            <a routerLink="/productos/divorcio360">Divorcio360</a>
          } @else {
            <a [routerLink]="['/auth']" [queryParams]="{ returnUrl: '/' }">Ingresar</a>
            <a routerLink="/cuestionario">Comenzar</a>
          }
          <a routerLink="/">LegalStation</a>
        </div>
        <div class="foot-col">
          <h4>Legal y soporte</h4>
          <span class="foot-muted">Política LOPDP (demo)</span>
          <span class="foot-muted">Términos de uso (demo)</span>
          <a href="mailto:demo@codidevs.ec">demo&#64;codidevs.ec</a>
        </div>
      </div>
      <div class="shell foot-bottom">
        <span>© 2026 CodiDevs · Demo LegalStation</span>
        @if (isDivorcioFlow || isDivorcioMarketing) {
          <span class="foot-muted">Divorcio360 by LegalStation</span>
        } @else {
          <span class="foot-muted">Divorcio360 es el producto en vivo de esta demo.</span>
        }
      </div>
    </footer>
  `,
  styles: [`
    .mk-header {
      position: sticky;
      top: 0;
      z-index: 30;
      background: rgb(253 252 250 / 0.94);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid rgb(58 52 47 / 0.06);
      font-family: 'Inter', system-ui, sans-serif;
    }

    .d360-header {
      background: rgb(247 252 251 / 0.96);
      border-bottom-color: rgb(74 158 150 / 0.12);
    }

    .mk-bar {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
      align-items: center;
      gap: 1.5rem;
      max-width: 1320px;
      margin: 0 auto;
      padding: 0 clamp(1.25rem, 3vw, 2.5rem);
      min-height: 4.5rem;
    }

    .mk-brand {
      justify-self: start;
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      font-size: 1.12rem;
      font-weight: 700;
      letter-spacing: -0.02em;
      color: #3a342f;
      text-decoration: none;
    }

    .d360-brand { color: #2a4542; }

    .mk-by {
      display: block;
      font-size: 0.68rem;
      font-weight: 500;
      letter-spacing: 0.04em;
      color: #6b9088;
      margin-top: 0.1rem;
    }

    .mk-logo {
      width: 1.65rem;
      height: 1.65rem;
      border-radius: 999px;
      background: #eef0fb;
      color: #4455c4;
      display: grid;
      place-items: center;
      font-size: 0.85rem;
    }

    .d360-logo {
      background: #e8f6f4;
      color: #4a9e96;
      font-size: 0.62rem;
      font-weight: 800;
    }

    .mk-nav {
      justify-self: center;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: center;
      gap: clamp(1rem, 2.5vw, 2rem);
    }

    .mk-nav a {
      font-size: 0.92rem;
      font-weight: 500;
      color: #6b635c;
      text-decoration: none;
      white-space: nowrap;
      cursor: pointer;
    }

    .mk-nav a:hover,
    .mk-nav a.on { color: #3a342f; }

    .d360-header .mk-nav a:hover { color: #4a9e96; }

    .mk-actions {
      justify-self: end;
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }

    .mk-signin {
      font-size: 0.92rem;
      font-weight: 500;
      color: #3a342f;
      text-decoration: none;
      background: none;
      border: 0;
      cursor: pointer;
      font-family: inherit;
      padding: 0.35rem 0.25rem;
    }

    .mk-signin:hover { color: #4455c4; }
    .d360-header .mk-signin:hover { color: #4a9e96; }

    .mk-cta {
      display: inline-flex;
      align-items: center;
      padding: 0.62rem 1.25rem;
      border-radius: 999px;
      background: #4455c4;
      color: white;
      font-size: 0.92rem;
      font-weight: 600;
      text-decoration: none;
      box-shadow: 0 8px 20px rgb(68 85 196 / 0.28);
      transition: background 0.15s ease, transform 0.15s ease;
    }

    .mk-cta:hover {
      background: #3344a8;
      transform: translateY(-1px);
    }

    .d360-header .mk-cta {
      background: #4a9e96;
      box-shadow: 0 8px 20px rgb(74 158 150 / 0.28);
    }

    .d360-header .mk-cta:hover { background: #3a827b; }

    .mk-user {
      font-size: 0.82rem;
      font-weight: 600;
      color: #6b635c;
    }

    .top {
      position: sticky; top: 0; z-index: 20;
      backdrop-filter: blur(10px);
      background: oklch(0.99 0.004 220 / 0.92);
      border-bottom: 1px solid var(--line);
    }

    .d360-top {
      background: oklch(0.99 0.012 190 / 0.94);
      border-bottom-color: oklch(0.88 0.04 190);
    }

    .bar {
      display: flex; align-items: center; justify-content: space-between;
      gap: 1rem; min-height: 4.25rem; position: relative;
    }

    .brand {
      font-family: var(--font-body);
      font-size: 1.25rem; color: var(--ink); text-decoration: none;
      letter-spacing: -0.02em; font-weight: 700;
      display: inline-flex; flex-direction: column; line-height: 1.15;
    }

    .brand span { color: var(--brand); }

    .d360-brand-inline span { color: #4a9e96; }

    .by-ls {
      font-size: 0.65rem;
      font-weight: 500;
      color: #6b9088;
      letter-spacing: 0.03em;
    }

    nav { display: flex; flex-wrap: wrap; gap: 0.85rem; align-items: center; }
    nav a { text-decoration: none; color: var(--ink-soft); font-size: 0.92rem; font-weight: 500; }
    nav a.on, nav a:hover { color: var(--brand-deep); }
    .nav-back { color: #4a9e96 !important; font-weight: 600 !important; }
    .nav-cta { color: white !important; }
    .user-chip {
      font-size: 0.82rem; font-weight: 600; opacity: 0.85;
      padding: 0.25rem 0.5rem; border-radius: 999px;
      background: oklch(1 0 0 / 0.08);
    }
    .bell { position: relative; padding: 0.5rem 0.75rem; min-width: auto; }
    .count {
      position: absolute; top: 0; right: 0; background: var(--bad); color: white;
      font-size: 0.65rem; font-weight: 700; border-radius: 999px; padding: 0.1rem 0.35rem;
    }
    .notif-drop {
      position: absolute; top: 100%; right: 0; width: min(320px, 90vw);
      margin-top: 0.5rem; padding: 0.5rem; z-index: 30; max-height: 360px; overflow: auto;
    }
    .notif-item {
      display: grid; gap: 0.15rem; width: 100%; text-align: left;
      background: none; border: 0; border-bottom: 1px solid var(--line);
      padding: 0.65rem 0.5rem; cursor: pointer; font: inherit;
    }
    .notif-item:last-child { border-bottom: 0; }
    .notif-item span { font-size: 0.82rem; }
    main { min-height: calc(100vh - 12rem); }

    .foot {
      margin-top: 0;
      padding: 3rem 0 0;
      border-top: 1px solid var(--line);
      color: var(--ink-soft);
      font-size: 0.9rem;
      background: oklch(0.98 0.006 260);
    }

    .foot.marketing-foot {
      background: #f5f3ef;
      border-top-color: #e5e1da;
      color: #6b635c;
      font-family: 'Inter', system-ui, sans-serif;
    }

    .foot.d360-foot {
      background: #f0f9f7;
      border-top-color: rgb(74 158 150 / 0.15);
    }

    .foot-by {
      margin: -0.2rem 0 0.35rem;
      font-size: 0.78rem;
      color: #6b9088;
      font-weight: 600;
    }

    .marketing-foot .foot-col h4 { color: #3a342f; }
    .marketing-foot .foot-logo { color: #3a342f; }
    .d360-foot .foot-logo { color: #2a4542; }
    .foot-grid {
      display: grid;
      grid-template-columns: 1.4fr 1fr 1fr 1fr;
      gap: 2rem 1.5rem;
      padding-bottom: 2rem;
    }
    .foot-col { display: grid; gap: 0.45rem; align-content: start; }
    .foot-col h4 {
      margin: 0 0 0.35rem; font-size: 0.78rem; text-transform: uppercase;
      letter-spacing: 0.08em; color: var(--ink);
    }
    .foot-logo { font-size: 1.1rem; color: var(--ink); }
    .brand-col p { margin: 0.35rem 0 0; line-height: 1.55; max-width: 28ch; }
    .foot-col a {
      color: inherit; text-decoration: none; font-size: 0.88rem;
    }
    .foot-col a:hover { color: var(--brand-deep); text-decoration: underline; }
    .foot-muted { font-size: 0.85rem; opacity: 0.72; }
    .foot-bottom {
      display: flex; flex-wrap: wrap; justify-content: space-between; gap: 0.5rem;
      padding: 1.25rem 0 2rem;
      border-top: 1px solid var(--line);
      font-size: 0.82rem;
    }
    .marketing-foot .foot-bottom { border-top-color: #e5e1da; }
    .marketing-foot .foot-col a:hover { color: #4455c4; }
    .d360-foot .foot-col a:hover { color: #4a9e96; }

    @media (max-width: 860px) {
      .foot-grid { grid-template-columns: 1fr 1fr; }
    }
    @media (max-width: 720px) {
      .mk-bar {
        grid-template-columns: 1fr auto;
        grid-template-areas:
          "brand actions"
          "nav nav";
        padding-block: 0.75rem;
        row-gap: 0.65rem;
      }
      .mk-brand { grid-area: brand; }
      .mk-actions { grid-area: actions; }
      .mk-nav { grid-area: nav; justify-self: stretch; }
      .bar { flex-direction: column; align-items: flex-start; padding-block: 0.75rem; }
      .foot-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class ShellComponent implements OnInit {
  isLegalStationMarketing = false;
  isDivorcioMarketing = false;
  isDivorcioFlow = false;
  isAuthPage = false;
  isDivorcioAuth = false;
  notifications: any[] = [];
  unreadCount = 0;
  showNotifs = false;

  get userFirstName(): string {
    return this.auth.user()?.full_name?.split(' ')[0] ?? 'Usuario';
  }

  constructor(
    public auth: AuthService,
    private router: Router,
    private api: ApiService,
    private viewport: ViewportScroller,
  ) {}

  ngOnInit(): void {
    this.applyMode(this.router.url);
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe((e: NavigationEnd) => {
      this.applyMode(e.urlAfterRedirects);
      const fragment = e.urlAfterRedirects.split('#')[1];
      if (fragment) {
        setTimeout(() => this.scrollToId(fragment), 50);
      }
    });
  }

  goToSection(event: Event, path: string, id: string): void {
    event.preventDefault();
    const current = this.cleanPath(this.router.url);
    if (current === path) {
      this.scrollToId(id);
      return;
    }
    void this.router.navigate([path], { fragment: id });
  }

  private scrollToId(id: string): void {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      this.viewport.scrollToAnchor(id);
    }
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
    this.isDivorcioMarketing = path.startsWith('/productos/divorcio360');
    this.isDivorcioFlow = !this.isAuthPage && DIVORCIO_FLOW.some((p) => path.startsWith(p));

    document.body.classList.toggle('saas-mode', this.isLegalStationMarketing || (this.isAuthPage && !this.isDivorcioAuth));
    document.body.classList.toggle('product-landing-mode', this.isDivorcioMarketing || this.isDivorcioAuth);
    document.body.classList.toggle('divorcio-flow-mode', this.isDivorcioFlow || this.isDivorcioMarketing || this.isDivorcioAuth);
    document.body.classList.toggle('product-mode', !this.isLegalStationMarketing && !this.isDivorcioMarketing && !this.isDivorcioFlow && !this.isAuthPage);
  }

  loadNotifs(): void {
    this.api.listNotifications().subscribe({
      next: (list) => {
        this.notifications = list;
        this.unreadCount = list.filter((n: any) => !n.read).length;
      },
      error: () => {},
    });
  }

  toggleNotifs(): void {
    this.showNotifs = !this.showNotifs;
    if (this.showNotifs) this.loadNotifs();
  }

  openNotif(n: any): void {
    this.api.markNotificationRead(n.id).subscribe(() => this.loadNotifs());
    this.showNotifs = false;
    if (n.case_id) {
      const base = this.auth.user()?.role === 'abogado' ? '/abogado/caso' : '/caso';
      void this.router.navigate([base, n.case_id]);
    }
  }
}
