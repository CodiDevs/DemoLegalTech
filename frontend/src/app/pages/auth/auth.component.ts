import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { ApiService } from '../../core/api.service';
import { IconComponent } from '../../shared/icon.component';
import { getProductQuestionnairePath } from '../../shared/product-sites.data';

type Field = 'fullName' | 'phone' | 'email' | 'password' | 'lopdp';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [FormsModule, IconComponent],
  template: `
    <div class="auth-page" [class.is-register]="isRegister">
      <div class="auth-grid">
        <!-- Formulario -->
        <section class="auth-form-col">
          <header class="auth-head">
            <h1>{{ isRegister ? 'Crea tu cuenta' : 'Entra a tu cuenta' }}</h1>
            <p>
              {{ isRegister
                ? 'Con una sola cuenta gestionas cualquier trámite de LegalStation.'
                : 'Continúa tu trámite donde lo dejaste.' }}
            </p>
          </header>

          <form class="auth-form" (ngSubmit)="submit()" novalidate>
            @if (isRegister) {
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

            <div class="field">
              <label for="password">Contraseña</label>
              <div class="password-wrap">
                <input
                  id="password"
                  name="password"
                  [type]="showPassword ? 'text' : 'password'"
                  [autocomplete]="isRegister ? 'new-password' : 'current-password'"
                  [placeholder]="isRegister ? 'Al menos 6 caracteres' : 'Tu contraseña'"
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

            @if (isRegister) {
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
              <div class="alert" role="alert">
                <app-icon name="alert-triangle" [size]="18" />
                <span>{{ serverError }}</span>
              </div>
            }

            <button type="submit" class="btn btn-primary btn-lg btn-block" [disabled]="submitting">
              @if (submitting) {
                <span class="spinner" aria-hidden="true"></span>
                <span>{{ isRegister ? 'Creando tu cuenta' : 'Entrando' }}</span>
              } @else {
                <span>{{ isRegister ? 'Crear cuenta' : 'Entrar' }}</span>
              }
            </button>

            <p class="auth-switch">
              {{ isRegister ? '¿Ya tienes cuenta?' : '¿Es tu primera vez?' }}
              <button type="button" class="link-button" (click)="switchMode()">
                {{ isRegister ? 'Entrar' : 'Crear una cuenta' }}
              </button>
            </p>
          </form>

          <aside class="demo-box">
            <p class="demo-title">Acceso rápido</p>
            <div class="demo-actions">
              <button type="button" class="btn btn-secondary btn-sm" (click)="useDemo('cliente')">
                <app-icon name="user" [size]="15" /> Cliente
              </button>
              <button type="button" class="btn btn-secondary btn-sm" (click)="useDemo('abogado')">
                <app-icon name="scale" [size]="15" /> Abogado
              </button>
            </div>
            <p class="demo-hint">Rellenan el formulario para que solo pulses Entrar.</p>
          </aside>
        </section>

        <!-- Panel de contexto -->
        <aside class="auth-aside">
          <p class="aside-eyebrow">Qué sigue después</p>
          <ol class="aside-steps">
            @for (step of nextSteps; track step.title) {
              <li>
                <span class="aside-icon"><app-icon [name]="step.icon" [size]="17" /></span>
                <span>
                  <strong>{{ step.title }}</strong>
                  <small>{{ step.body }}</small>
                </span>
              </li>
            }
          </ol>
          <p class="aside-foot">
            <app-icon name="lock" [size]="15" />
            Tus documentos solo los ve el abogado asignado a tu caso.
          </p>
        </aside>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      display: grid;
      place-items: center;
      min-height: calc(100dvh - var(--header-height) - 3.5rem);
      padding: var(--space-6) var(--container-pad);
    }

    .auth-grid {
      display: grid;
      grid-template-columns: minmax(0, 26rem) minmax(0, 20rem);
      gap: var(--space-8);
      align-items: center;
      width: 100%;
      max-width: 52rem;
    }

    /* ---------- Formulario ---------- */

    .auth-head { margin-bottom: var(--space-5); }
    .auth-head h1 { font-size: var(--text-3xl); margin-bottom: var(--space-2); }

    .auth-head p {
      margin: 0;
      color: var(--text-secondary);
      line-height: var(--leading-snug);
    }

    .auth-form { display: block; }

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

    .password-toggle:hover { color: var(--text); }

    .consent {
      display: flex;
      align-items: flex-start;
      gap: var(--space-3);
      margin: 0;
      font-size: var(--text-sm);
      font-weight: 400;
      line-height: var(--leading-snug);
      color: var(--text-secondary);
      cursor: pointer;
    }

    .consent input { margin-top: 0.15rem; }

    .alert {
      display: flex;
      align-items: flex-start;
      gap: var(--space-3);
      margin-bottom: var(--space-4);
      padding: var(--space-3) var(--space-4);
      border: 1px solid var(--danger-border);
      border-radius: var(--radius-md);
      background: var(--danger-subtle);
      color: var(--danger);
      font-size: var(--text-sm);
      line-height: var(--leading-snug);
    }

    .alert app-icon { margin-top: 0.05rem; }

    .auth-switch {
      margin: var(--space-4) 0 0;
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
    }

    /* ---------- Cuentas de prueba ---------- */

    .demo-box {
      margin-top: var(--space-5);
      padding-top: var(--space-4);
      border-top: 1px solid var(--border);
    }

    .demo-title {
      margin: 0 0 var(--space-3);
      font-size: var(--text-xs);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: var(--tracking-wide);
      color: var(--text-muted);
    }

    .demo-actions {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
    }

    .demo-hint {
      margin: var(--space-2) 0 0;
      font-size: var(--text-xs);
      color: var(--text-muted);
    }

    /* ---------- Panel lateral ---------- */

    .auth-aside {
      padding: var(--space-5);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      background: var(--surface);
    }

    .aside-eyebrow {
      margin: 0 0 var(--space-4);
      font-size: var(--text-xs);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: var(--tracking-wide);
      color: var(--text-muted);
    }

    .aside-steps {
      list-style: none;
      margin: 0;
      padding: 0;
      display: grid;
      gap: var(--space-4);
    }

    .aside-steps li {
      display: flex;
      align-items: flex-start;
      gap: var(--space-3);
    }

    .aside-icon {
      display: grid;
      place-items: center;
      flex-shrink: 0;
      width: 1.9rem;
      height: 1.9rem;
      border-radius: var(--radius-sm);
      background: var(--primary-subtle);
      color: var(--primary);
    }

    .aside-steps strong {
      display: block;
      font-size: var(--text-sm);
      font-weight: 600;
      color: var(--text);
    }

    .aside-steps small {
      display: block;
      margin-top: 0.15rem;
      font-size: var(--text-xs);
      line-height: var(--leading-snug);
      color: var(--text-secondary);
    }

    .aside-foot {
      display: flex;
      align-items: flex-start;
      gap: var(--space-2);
      margin: var(--space-5) 0 0;
      padding-top: var(--space-4);
      border-top: 1px solid var(--border);
      font-size: var(--text-xs);
      line-height: var(--leading-snug);
      color: var(--text-muted);
    }

    /* ---------- Responsive ---------- */

    @media (max-width: 860px) {
      .auth-grid {
        grid-template-columns: minmax(0, 26rem);
        justify-content: center;
        gap: var(--space-6);
      }

      .auth-aside { display: none; }
    }

    /* Registro: más campos — evita scroll accidental en viewports bajos (p. ej. 1440×900) */
    @media (max-height: 920px) {
      .auth-page.is-register .auth-aside { display: none; }
      .auth-page.is-register .auth-grid {
        grid-template-columns: minmax(0, 26rem);
        justify-content: center;
        gap: var(--space-5);
      }
      .auth-page.is-register {
        padding-block: var(--space-4);
        min-height: calc(100dvh - var(--header-height) - 2.5rem);
      }
      .auth-page.is-register .auth-head {
        margin-bottom: var(--space-4);
      }
      .auth-page.is-register .auth-head h1 {
        font-size: var(--text-2xl);
      }
      .auth-page.is-register .demo-box {
        margin-top: var(--space-3);
        padding-top: var(--space-3);
      }
    }
  `]
})
export class AuthComponent implements OnInit {
  mode: 'login' | 'register' = 'login';
  email = '';
  password = '';
  fullName = '';
  phone = '';
  lopdpAccepted = false;
  showPassword = false;
  serverError = '';
  submitting = false;

  next = '';
  qResult = 'apto';
  city = '';
  returnUrl = '';
  product = 'divorcio360';

  private touched: Partial<Record<Field, boolean>> = {};
  private submitAttempted = false;

  readonly nextSteps: { icon: 'clipboard' | 'users' | 'signature'; title: string; body: string }[] = [
    {
      icon: 'clipboard',
      title: 'Responde unas preguntas',
      body: 'Comprobamos en dos minutos si tu caso se puede resolver en notaría.',
    },
    {
      icon: 'users',
      title: 'Hablas con un abogado',
      body: 'Videollamada para revisar tu situación y resolver dudas.',
    },
    {
      icon: 'signature',
      title: 'Firmas sin salir de casa',
      body: 'Subes tus documentos y firmas en línea. Nosotros gestionamos la notaría.',
    },
  ];

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
      else if (this.next === 'checkout') this.mode = 'register';
    });
  }

  ngOnInit(): void {
    const u = this.auth.user();
    if (this.auth.isLoggedIn && u) {
      this.afterAuth(u.role);
    }
  }

  get isRegister(): boolean {
    return this.mode === 'register';
  }

  switchMode(): void {
    this.mode = this.isRegister ? 'login' : 'register';
    this.serverError = '';
    this.touched = {};
    this.submitAttempted = false;
  }

  touch(field: Field): void {
    this.touched[field] = true;
  }

  useDemo(role: 'cliente' | 'abogado'): void {
    this.mode = 'login';
    this.email = `${role}@demo.ec`;
    this.password = 'demo1234';
    this.serverError = '';
    this.touched = {};
    this.submitAttempted = false;
  }

  /** Mensaje de error de un campo. Vacío si aún no procede mostrarlo. */
  errorFor(field: Field): string {
    if (!this.touched[field] && !this.submitAttempted) return '';

    switch (field) {
      case 'fullName':
        if (this.isRegister && !this.fullName.trim()) {
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
        if (!this.password) return 'Escribe tu contraseña.';
        if (this.isRegister && this.password.length < 6) {
          return `Añade ${6 - this.password.length} caracteres más: la contraseña necesita al menos 6.`;
        }
        return '';

      case 'lopdp':
        if (this.isRegister && !this.lopdpAccepted) {
          return 'Marca la casilla para que podamos tramitar tu caso con tus datos.';
        }
        return '';

      default:
        return '';
    }
  }

  private get fieldsToValidate(): Field[] {
    return this.isRegister
      ? ['fullName', 'email', 'password', 'lopdp']
      : ['email', 'password'];
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

    this.submitting = true;
    const email = this.email.trim().toLowerCase();

    const request = this.isRegister
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

  /** Ruta del cuestionario inicial según el producto en contexto. */
  private get onboardingPath(): string {
    return this.product === 'divorcio360'
      ? '/cuestionario'
      : `/productos/${this.product}/cuestionario`;
  }

  /**
   * Resuelve el destino post-login según la intención del usuario.
   * - `/` → LegalStation
   * - landing de producto → cuestionario de ese producto
   * - rutas de flujo → tal cual
   */
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
    // 1. Venía del cuestionario con resultado apto: crear caso e ir a pagar.
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
        } catch { /* usamos los valores de la URL */ }
      }

      this.api.createCase(result, city, questionnaire, this.product).subscribe({
        next: (c) => this.go(`/checkout/${c.id}`),
        error: () => this.go('/cliente'),
      });
      return;
    }

    // 2. Personal interno: directo a su bandeja de trabajo.
    if (role === 'abogado') { this.go('/abogado'); return; }
    if (role === 'notario') { this.go('/'); return; }

    // 3. Cliente con destino explícito (LegalStation, cuestionario, flujo…).
    if (this.returnUrl && this.returnUrl !== '/auth') {
      const destination = this.resolveReturnUrl(this.returnUrl);
      if (destination) {
        void this.router.navigateByUrl(destination, { replaceUrl: true });
        return;
      }
    }

    // 4. Cliente con producto en contexto → cuestionario de ese producto.
    if (this.product) {
      this.go(this.onboardingPath);
      return;
    }

    // 5. Sin destino: volver a LegalStation (login desde home).
    this.go('/');
  }
}
