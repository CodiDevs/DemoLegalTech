import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { ApiService } from '../../core/api.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="auth-page" [class.divorcio-auth]="isDivorcioContext">
      <div class="shell wrap">
        <div class="panel">
          @if (isDivorcioContext) {
            <p class="by-line muted">Divorcio360 · by LegalStation</p>
          } @else {
            <a routerLink="/" class="ls-link">LegalStation</a>
          }
          <h1>{{ mode === 'login' ? 'Ingresar' : 'Crear cuenta' }}</h1>
          <p class="muted">
            @if (isDivorcioContext) {
              Accede para continuar tu trámite. La sesión aplica en toda la plataforma.
            } @else {
              Una cuenta LegalStation para todos los productos — Divorcio360 incluido.
            }
          </p>
          <p class="demo-hint muted">Demo: cliente&#64;demo.ec / abogado&#64;demo.ec — contraseña demo1234</p>

          @if (mode === 'register') {
            <div class="field">
              <label>Nombre completo</label>
              <input [(ngModel)]="fullName" autocomplete="name" />
            </div>
            <div class="field">
              <label>Teléfono</label>
              <input [(ngModel)]="phone" autocomplete="tel" />
            </div>
          }
          <div class="field">
            <label>Correo</label>
            <input type="email" [(ngModel)]="email" autocomplete="email" />
          </div>
          <div class="field">
            <label>Contraseña</label>
            <input type="password" [(ngModel)]="password" autocomplete="current-password" />
          </div>
          @if (error) { <p class="err">{{ error }}</p> }
          @if (mode === 'register') {
            <label class="lopdp">
              <input type="checkbox" [(ngModel)]="lopdpAccepted" />
              Acepto el tratamiento de datos personales según la política LOPDP demo de LegalStation (Ecuador).
            </label>
          }
          <button class="btn btn-primary" type="button" [disabled]="submitting" (click)="submit()">
            {{ submitting ? 'Procesando…' : (mode === 'login' ? 'Entrar' : 'Registrarme') }}
          </button>
          <p class="switch muted">
            @if (mode === 'login') {
              ¿Nuevo? <button type="button" class="link" (click)="mode='register'">Crear cuenta</button>
            } @else {
              ¿Ya tienes cuenta? <button type="button" class="link" (click)="mode='login'">Ingresar</button>
            }
          </p>
          @if (!isDivorcioContext) {
            <p class="back muted"><a routerLink="/">← Volver a LegalStation</a></p>
          } @else {
            <p class="back muted"><a routerLink="/productos/divorcio360">← Volver a Divorcio360</a></p>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: calc(100vh - 10rem);
      background: linear-gradient(180deg, #fdfcfa, #f5f3ef);
      padding-block: 1rem 2rem;
    }

    .auth-page.divorcio-auth {
      background: linear-gradient(180deg, #f7fcfb, #ffffff);
    }

    .wrap { max-width: 480px; padding-block: 2rem; }
    .ls-link {
      display: inline-block;
      font-weight: 700;
      font-size: 0.95rem;
      color: #4455c4;
      text-decoration: none;
      margin-bottom: 0.35rem;
    }
    .by-line { font-size: 0.82rem; font-weight: 600; margin-bottom: 0.35rem; }
    .demo-hint { font-size: 0.82rem; margin-bottom: 1rem; }
    .err { color: var(--bad); }
    .switch { margin-top: 1rem; }
    .back { margin-top: 0.75rem; font-size: 0.88rem; }
    .back a { color: inherit; }
    .link { background: none; border: 0; color: var(--brand-deep); font-weight: 600; cursor: pointer; padding: 0; }
    .lopdp { display: flex; gap: 0.5rem; align-items: start; font-size: 0.85rem; color: var(--ink-soft); margin: 0.75rem 0; }
    .btn[disabled] { opacity: 0.65; cursor: wait; }
  `]
})
export class AuthComponent {
  mode: 'login' | 'register' = 'login';
  email = '';
  password = '';
  fullName = '';
  phone = '';
  lopdpAccepted = false;
  error = '';
  submitting = false;
  next = '';
  qResult = 'apto';
  city = '';
  returnUrl = '/';
  product = 'divorcio360';
  isDivorcioContext = false;

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
      this.returnUrl = q.get('returnUrl') || '/';
      this.product = q.get('product') || 'divorcio360';
      this.isDivorcioContext = this.next === 'checkout' || q.get('product') === 'divorcio360';
      const mode = q.get('mode');
      if (mode === 'login') {
        this.mode = 'login';
      } else if (this.next === 'checkout') {
        this.mode = 'register';
      }
    });
  }

  submit(): void {
    this.error = '';
    const email = this.email.trim().toLowerCase();
    if (!email || !this.password) {
      this.error = 'Correo y contraseña son obligatorios';
      return;
    }
    if (this.mode === 'register') {
      if (!this.fullName.trim()) {
        this.error = 'Nombre completo requerido';
        return;
      }
      if (this.password.length < 6) {
        this.error = 'La contraseña debe tener al menos 6 caracteres';
        return;
      }
      if (!this.lopdpAccepted) {
        this.error = 'Debes aceptar la política LOPDP demo';
        return;
      }
    }

    this.submitting = true;
    const obs = this.mode === 'login'
      ? this.auth.login(email, this.password)
      : this.auth.register({
          email,
          password: this.password,
          full_name: this.fullName.trim(),
          phone: this.phone.trim(),
          lopdp_accepted: this.lopdpAccepted,
        });

    obs.subscribe({
      next: (res) => {
        this.submitting = false;
        this.afterAuth(res.user.role);
      },
      error: (e) => {
        this.submitting = false;
        if (e.status === 0) {
          this.error = e?.error?.error
            || 'No se pudo conectar con el servidor. ¿Está corriendo la API en el puerto 8080?';
          return;
        }
        const body = e?.error;
        this.error = (typeof body === 'string' ? body : body?.error) || 'No se pudo autenticar';
      },
    });
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
        } catch { /* ignore */ }
      }
      this.api.createCase(result, city, questionnaire, this.product).subscribe({
        next: (c) => void this.router.navigate(['/checkout', c.id]),
        error: () => void this.router.navigateByUrl('/cliente'),
      });
      return;
    }

    if (this.returnUrl && this.returnUrl !== '/auth') {
      const [path, fragment] = this.returnUrl.split('#');
      void this.router.navigate([path || '/'], { fragment: fragment || undefined, replaceUrl: true });
      return;
    }

    void this.router.navigateByUrl(
      role === 'abogado' ? '/abogado' : role === 'notario' ? '/notario' : '/',
      { replaceUrl: true },
    );
  }
}
