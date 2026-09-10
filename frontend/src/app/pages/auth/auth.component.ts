import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { ApiService } from '../../core/api.service';
import { IconComponent } from '../../shared/icon.component';
import { getProductQuestionnairePath } from '../../shared/product-sites.data';
import { AuthAlertComponent } from './auth-alert.component';
import { AUTH_COPY, AuthMode } from './auth-copy.data';
import { AuthLayoutComponent } from './auth-layout.component';

type Field = 'fullName' | 'phone' | 'email' | 'password' | 'lopdp';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [FormsModule, IconComponent, AuthLayoutComponent, AuthAlertComponent],
  template: `
    <app-auth-layout [showPanel]="showPanel" [ready]="layoutReady">
      <header class="auth-head">
        <h1>{{ title }}</h1>
        @if (lead) {
          <p>{{ lead }}</p>
        }
      </header>

      @if (mode === 'forgot-sent') {
        <app-auth-alert
          tone="success"
          title="Solicitud registrada"
          [message]="copy.forgotSentLead"
        />
        <button type="button" class="btn btn-primary btn-lg btn-block" (click)="goLogin()">
          {{ copy.backToLogin }}
        </button>
      } @else {
        <form class="auth-form" (ngSubmit)="submit()" novalidate>
          @if (mode === 'register') {
            <div class="field">
              <label for="fullName">Nombre y apellido</label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                autocomplete="name"
                placeholder="María Pérez"
                [(ngModel)]="fullName"
                (blur)="touch('fullName')"
                [attr.aria-invalid]="!!errorFor('fullName')"
                [attr.aria-describedby]="errorFor('fullName') ? 'err-fullName' : null"
              />
              @if (errorFor('fullName')) {
                <p class="field-error" id="err-fullName" role="alert">
                  <app-icon name="alert-circle" [size]="15" />
                  {{ errorFor('fullName') }}
                </p>
              }
            </div>

            <div class="field">
              <label for="phone">Teléfono <span class="label-optional">(opcional)</span></label>
              <input
                id="phone"
                name="phone"
                type="tel"
                autocomplete="tel"
                placeholder="09 9999 9999"
                [(ngModel)]="phone"
              />
              <p class="field-hint">Lo usamos solo para avisarte de tu cita.</p>
            </div>
          }

          <div class="field">
            <label for="email">Correo electrónico</label>
            <input
              id="email"
              name="email"
              type="email"
              autocomplete="email"
              placeholder="tu@correo.com"
              [(ngModel)]="email"
              (blur)="touch('email')"
              [attr.aria-invalid]="!!errorFor('email')"
              [attr.aria-describedby]="errorFor('email') ? 'err-email' : null"
            />
            @if (errorFor('email')) {
              <p class="field-error" id="err-email" role="alert">
                <app-icon name="alert-circle" [size]="15" />
                {{ errorFor('email') }}
              </p>
            }
          </div>

          @if (mode === 'login' || mode === 'register') {
            <div class="field">
              <div class="field-label-row">
                <label for="password">Contraseña</label>
                @if (mode === 'login') {
                  <button type="button" class="link-button link-quiet" (click)="goForgot()">
                    {{ copy.forgotLink }}
                  </button>
                }
              </div>
              <div class="password-wrap">
                <input
                  id="password"
                  name="password"
                  [type]="showPassword ? 'text' : 'password'"
                  [autocomplete]="mode === 'register' ? 'new-password' : 'current-password'"
                  [placeholder]="mode === 'register' ? 'Al menos 6 caracteres' : 'Tu contraseña'"
                  [(ngModel)]="password"
                  (blur)="touch('password')"
                  [attr.aria-invalid]="!!errorFor('password')"
                  [attr.aria-describedby]="errorFor('password') ? 'err-password' : null"
                />
                <button
                  type="button"
                  class="password-toggle"
                  [attr.aria-label]="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                  (click)="showPassword = !showPassword"
                >
                  <app-icon [name]="showPassword ? 'x-circle' : 'eye'" [size]="17" />
                </button>
              </div>
              @if (errorFor('password')) {
                <p class="field-error" id="err-password" role="alert">
                  <app-icon name="alert-circle" [size]="15" />
                  {{ errorFor('password') }}
                </p>
              }
            </div>
          }

          @if (mode === 'register') {
            <div class="field">
              <label class="consent" [class.consent-error]="!!errorFor('lopdp')">
                <input
                  type="checkbox"
                  name="lopdp"
                  [(ngModel)]="lopdpAccepted"
                  (change)="touch('lopdp')"
                  [attr.aria-invalid]="!!errorFor('lopdp')"
                />
                <span>
                  Autorizo el tratamiento de mis datos para gestionar el trámite,
                  según la política de datos de LegalStation.
                </span>
              </label>
              @if (errorFor('lopdp')) {
                <p class="field-error" role="alert">
                  <app-icon name="alert-circle" [size]="15" />
                  {{ errorFor('lopdp') }}
                </p>
              }
            </div>
          }

          @if (serverError) {
            <app-auth-alert
              title="No pudimos continuar"
              [message]="serverError"
            />
          }

          <button type="submit" class="btn btn-primary btn-lg btn-block" [disabled]="submitting">
            @if (submitting) {
              <span class="spinner" aria-hidden="true"></span>
              <span>{{ submittingLabel }}</span>
            } @else {
              <span>{{ submitLabel }}</span>
            }
          </button>

          <p class="auth-switch">
            @if (mode === 'forgot') {
              <button type="button" class="link-button" (click)="goLogin()">
                {{ copy.backToLogin }}
              </button>
            } @else if (mode === 'register') {
              {{ copy.switchToLogin }}
              <button type="button" class="link-button" (click)="goLogin()">
                {{ copy.switchToLoginCta }}
              </button>
            } @else {
              {{ copy.switchToRegister }}
              <button type="button" class="link-button" (click)="goRegister()">
                {{ copy.switchToRegisterCta }}
              </button>
            }
          </p>
        </form>
      }

      @if (mode === 'login') {
        <aside class="demo-box">
          <p class="demo-title">{{ copy.demoTitle }}</p>
          <div class="demo-actions">
            <button type="button" class="btn btn-secondary btn-sm" (click)="useDemo('cliente')">
              <app-icon name="user" [size]="15" /> Cliente
            </button>
            <button type="button" class="btn btn-secondary btn-sm" (click)="useDemo('abogado')">
              <app-icon name="scale" [size]="15" /> Abogado
            </button>
          </div>
          <p class="demo-hint">{{ copy.demoHint }}</p>
        </aside>
      }
    </app-auth-layout>
  `,
  styles: [`
    .auth-head {
      margin-bottom: 1.5rem;
      text-align: center;
    }

    .auth-head h1 {
      margin: 0 0 0.45rem;
      font-family: var(--font-display);
      font-size: clamp(1.45rem, 2.8vw, 1.75rem);
      font-weight: 600;
      letter-spacing: -0.03em;
      color: var(--text);
    }

    .auth-head p {
      margin: 0 auto;
      max-width: 28ch;
      color: var(--text-secondary);
      line-height: 1.5;
      font-size: var(--text-sm);
    }

    .auth-form { display: block; }

    .field-label-row {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 0.75rem;
      margin-bottom: 0.35rem;
    }

    .field-label-row label { margin-bottom: 0; }

    .label-optional {
      font-weight: 400;
      color: var(--text-muted);
    }

    .password-wrap { position: relative; }
    .password-wrap input { padding-right: 2.75rem; }

    .password-toggle {
      position: absolute;
      top: 0;
      right: 0;
      width: var(--control-height);
      min-height: var(--control-height);
      padding: 0;
      background: none;
      border: 0;
      color: var(--text-muted);
    }

    .password-toggle:hover,
    .password-toggle:focus-visible {
      color: var(--text);
      outline: none;
    }

    .consent {
      display: flex;
      align-items: flex-start;
      gap: var(--space-3);
      margin: 0;
      font-size: var(--text-sm);
      font-weight: 400;
      line-height: 1.45;
      color: var(--text-secondary);
      cursor: pointer;
    }

    .consent input { margin-top: 0.15rem; }

    .auth-switch {
      margin: 1rem 0 0;
      text-align: center;
      font-size: var(--text-sm);
      color: var(--text-secondary);
    }

    .link-button {
      min-height: 0;
      padding: 0;
      background: none;
      border: 0;
      font-size: var(--text-sm);
      font-weight: 600;
      color: var(--primary);
      text-decoration: underline;
      text-underline-offset: 3px;
      cursor: pointer;
    }

    .link-quiet {
      font-size: var(--text-xs);
      font-weight: 550;
      text-decoration: none;
    }

    .link-quiet:hover { text-decoration: underline; }

    .demo-box {
      margin-top: 1.25rem;
      padding-top: 1rem;
      border-top: 1px solid var(--border);
    }

    .demo-title {
      margin: 0 0 0.65rem;
      font-size: var(--text-xs);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--text-muted);
    }

    .demo-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .demo-hint {
      margin: 0.5rem 0 0;
      font-size: var(--text-xs);
      color: var(--text-muted);
    }

    :host ::ng-deep .field input:focus,
    :host ::ng-deep .field input:focus-visible {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px var(--primary-subtle);
      outline: none;
    }
  `]
})
export class AuthComponent implements OnInit {
  mode: AuthMode = 'login';
  email = '';
  password = '';
  fullName = '';
  phone = '';
  lopdpAccepted = false;
  showPassword = false;
  serverError = '';
  submitting = false;
  layoutReady = false;

  next = '';
  qResult = 'apto';
  city = '';
  returnUrl = '';
  product = 'divorcio360';

  readonly copy = AUTH_COPY;

  private touched: Partial<Record<Field, boolean>> = {};
  private submitAttempted = false;

  constructor(
    private auth: AuthService,
    private api: ApiService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.route.queryParamMap.subscribe((q) => {
      this.next = q.get('next') || '';
      this.qResult = q.get('result') || 'apto';
      this.city = q.get('city') || '';
      this.returnUrl = q.get('returnUrl') || '';
      this.product = q.get('product') || 'divorcio360';

      if (q.get('mode') === 'login') this.mode = 'login';
      else if (q.get('mode') === 'forgot') this.mode = 'forgot';
      else if (this.next === 'checkout' && this.mode !== 'forgot' && this.mode !== 'forgot-sent') {
        this.mode = 'register';
      }
    });
  }

  ngOnInit(): void {
    const reduce =
      typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    setTimeout(() => (this.layoutReady = true), reduce ? 0 : 30);

    const u = this.auth.user();
    if (this.auth.isLoggedIn && u) {
      this.afterAuth(u.role);
    }
  }

  get showPanel(): boolean {
    return true;
  }

  get title(): string {
    if (this.mode === 'register') return this.copy.registerTitle;
    if (this.mode === 'forgot') return this.copy.forgotTitle;
    if (this.mode === 'forgot-sent') return this.copy.forgotSentTitle;
    return this.copy.loginTitle;
  }

  get lead(): string {
    if (this.mode === 'register') return this.copy.registerLead;
    if (this.mode === 'forgot') return this.copy.forgotLead;
    if (this.mode === 'forgot-sent') return '';
    return this.copy.loginLead;
  }

  get submitLabel(): string {
    if (this.mode === 'register') return this.copy.create;
    if (this.mode === 'forgot') return this.copy.sendLink;
    return this.copy.enter;
  }

  get submittingLabel(): string {
    if (this.mode === 'register') return this.copy.creating;
    if (this.mode === 'forgot') return this.copy.sending;
    return this.copy.entering;
  }

  goLogin(): void {
    this.mode = 'login';
    this.resetFormMeta();
  }

  goRegister(): void {
    this.mode = 'register';
    this.resetFormMeta();
  }

  goForgot(): void {
    this.mode = 'forgot';
    this.resetFormMeta();
  }

  touch(field: Field): void {
    this.touched[field] = true;
  }

  useDemo(role: 'cliente' | 'abogado'): void {
    this.mode = 'login';
    this.email = `${role}@demo.ec`;
    this.password = 'demo1234';
    this.resetFormMeta();
  }

  errorFor(field: Field): string {
    if (!this.touched[field] && !this.submitAttempted) return '';

    switch (field) {
      case 'fullName':
        if (this.mode === 'register' && !this.fullName.trim()) {
          return 'Escribe tu nombre y apellido para identificar tu expediente.';
        }
        return '';

      case 'email': {
        const value = this.email.trim();
        if (!value) return 'Escribe tu correo electrónico.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
          return 'Ese correo no parece completo. Debe tener el formato nombre@dominio.com.';
        }
        return '';
      }

      case 'password':
        if (this.mode === 'forgot' || this.mode === 'forgot-sent') return '';
        if (!this.password) return 'Escribe tu contraseña.';
        if (this.mode === 'register' && this.password.length < 6) {
          return `Añade ${6 - this.password.length} caracteres más: la contraseña necesita al menos 6.`;
        }
        return '';

      case 'lopdp':
        if (this.mode === 'register' && !this.lopdpAccepted) {
          return 'Marca la casilla para que podamos tramitar tu caso con tus datos.';
        }
        return '';

      default:
        return '';
    }
  }

  private get fieldsToValidate(): Field[] {
    if (this.mode === 'forgot') return ['email'];
    if (this.mode === 'register') return ['fullName', 'email', 'password', 'lopdp'];
    return ['email', 'password'];
  }

  submit(): void {
    if (this.submitting) return;

    this.serverError = '';
    this.submitAttempted = true;

    const firstInvalid = this.fieldsToValidate.find((f) => this.errorFor(f));
    if (firstInvalid) {
      document.getElementById(firstInvalid)?.focus();
      return;
    }

    if (this.mode === 'forgot') {
      this.submitting = true;
      // Demo: sin endpoint de recuperación. Feedback honesto.
      setTimeout(() => {
        this.submitting = false;
        this.mode = 'forgot-sent';
      }, 450);
      return;
    }

    this.submitting = true;
    const email = this.email.trim().toLowerCase();

    const request = this.mode === 'register'
      ? this.auth.register({
          email,
          password: this.password,
          full_name: this.fullName.trim(),
          phone: this.phone.trim(),
          lopdp_accepted: this.lopdpAccepted,
        })
      : this.auth.login(email, this.password);

    request.subscribe({
      next: (res) => this.afterAuth(res.user.role),
      error: (e) => {
        this.submitting = false;
        this.serverError = this.describeError(e);
      },
    });
  }

  private resetFormMeta(): void {
    this.serverError = '';
    this.touched = {};
    this.submitAttempted = false;
  }

  private describeError(e: any): string {
    if (e?.status === 0) {
      return e?.error?.error
        || 'No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.';
    }
    if (e?.status === 401) {
      return 'El correo o la contraseña no coinciden. Revísalos e inténtalo otra vez.';
    }
    if (e?.status === 409) {
      return 'Ya existe una cuenta con ese correo. Entra en lugar de registrarte.';
    }
    const body = e?.error;
    const raw = typeof body === 'string' ? body : body?.error;
    return raw || 'No pudimos completar la operación. Inténtalo de nuevo en unos segundos.';
  }

  private get onboardingPath(): string {
    return this.product === 'divorcio360'
      ? '/cuestionario'
      : `/productos/${this.product}/cuestionario`;
  }

  private resolveReturnUrl(url: string): string {
    const raw = (url || '').trim();
    if (!raw || raw === '/auth') return '';

    const hashIdx = raw.indexOf('#');
    const beforeHash = hashIdx >= 0 ? raw.slice(0, hashIdx) : raw;
    const fragment = hashIdx >= 0 ? raw.slice(hashIdx + 1) : '';

    const qIdx = beforeHash.indexOf('?');
    const pathOnly = qIdx >= 0 ? beforeHash.slice(0, qIdx) : beforeHash;
    const query = qIdx >= 0 ? beforeHash.slice(qIdx) : '';

    if (!pathOnly || pathOnly === '/') {
      return '/' + query + (fragment ? `#${fragment}` : '');
    }

    const productLanding = pathOnly.match(/^\/productos\/([^/]+)\/?$/);
    const destination = productLanding
      ? getProductQuestionnairePath(productLanding[1])
      : pathOnly;

    return destination + query + (fragment ? `#${fragment}` : '');
  }

  private go(url: string, fragment?: string): void {
    void this.router.navigate([url], { fragment, replaceUrl: true });
  }

  private afterAuth(role: string): void {
    if (this.next === 'checkout' && role === 'cliente') {
      const cached = sessionStorage.getItem('d360_q_result');
      let result = this.qResult;
      let city = this.city;
      let questionnaire: any = {};

      if (cached) {
        try {
          const p = JSON.parse(cached);
          result = p.result || result;
          city = p.city || city;
          questionnaire = p.answers || {};
        } catch { /* URL values */ }
      }

      this.api.createCase(result, city, questionnaire, this.product).subscribe({
        next: (c) => this.go(`/checkout/${c.id}`),
        error: () => this.go('/cliente'),
      });
      return;
    }

    if (role === 'abogado') { this.go('/abogado'); return; }
    if (role === 'notario') { this.go('/'); return; }

    if (this.returnUrl && this.returnUrl !== '/auth') {
      const destination = this.resolveReturnUrl(this.returnUrl);
      if (destination) {
        void this.router.navigateByUrl(destination, { replaceUrl: true });
        return;
      }
    }

    if (this.product) {
      this.go(this.onboardingPath);
      return;
    }

    this.go('/');
  }
}
