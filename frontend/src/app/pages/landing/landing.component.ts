import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="hero shell">
      <div class="copy">
        <p class="firm">Miguel López &amp; Cía Abogados S.A.</p>
        <h1 class="logo-hero">Divorcio360</h1>
        <p class="lede">
          Divorcio notarial por mutuo consentimiento: calificación automática,
          expediente digital y seguimiento sin llamadas interminables.
        </p>
        <div class="cta">
          @if (auth.user()?.role === 'abogado') {
            <a routerLink="/abogado" class="btn btn-primary">Ir al panel abogado</a>
            <a routerLink="/fase2/admin" class="btn btn-ghost">Ver Fase 2</a>
          } @else if (auth.user()?.role === 'cliente') {
            <a routerLink="/cuestionario" class="btn btn-primary">Empezar cuestionario</a>
            <a routerLink="/cliente" class="btn btn-ghost">Mi expediente</a>
          } @else {
            <a routerLink="/cuestionario" class="btn btn-primary">Empezar cuestionario</a>
            <a routerLink="/auth" class="btn btn-ghost">Ya tengo cuenta</a>
          }
        </div>
        @if (auth.user()?.role !== 'abogado') {
          <p class="price muted">Desde <strong>$349</strong> si tu caso califica · Demo sin cobro real</p>
        } @else {
          <p class="price muted">Vista operador · bandeja de casos y roadmap Fase 2</p>
        }
      </div>
      <div class="visual" aria-hidden="true">
        <div class="sheet s1"></div>
        <div class="sheet s2"></div>
        <div class="sheet s3">
          <span>Expediente</span>
          <em>10 estados · trazable</em>
        </div>
      </div>
    </section>

    <section class="shell benefits">
      <h2>Qué resuelve el MVP</h2>
      <div class="grid">
        <article>
          <h3>Filtro inteligente</h3>
          <p>12–15 preguntas con lógica condicional. Resultado verde, amarillo o rojo antes de pedir documentos.</p>
        </article>
        <article>
          <h3>Expediente único</h3>
          <p>Documentos, pago, firma y notas del abogado en un solo lugar visible para el cliente.</p>
        </article>
        <article>
          <h3>Autoservicio</h3>
          <p>El cliente ve el estado real del trámite. Menos carga operativa para el bufete.</p>
        </article>
      </div>
    </section>
  `,
  styles: [`
    .hero {
      display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 2.5rem;
      align-items: center; padding-block: 3.5rem 2.5rem;
      animation: rise 0.7s ease both;
    }
    .firm { font-size: 0.95rem; color: var(--ink-soft); margin-bottom: 0.35rem; }
    .logo-hero {
      font-size: clamp(2.8rem, 7vw, 4.6rem); color: var(--ink); margin-bottom: 0.75rem;
    }
    .lede { font-size: 1.15rem; max-width: 36ch; color: var(--ink-soft); }
    .cta { display: flex; flex-wrap: wrap; gap: 0.75rem; margin: 1.5rem 0 1rem; }
    .price strong { color: var(--brand-deep); }
    .visual { position: relative; min-height: 320px; }
    .sheet {
      position: absolute; border-radius: 18px; border: 1px solid var(--line);
      background: white; box-shadow: var(--shadow);
    }
    .s1 { inset: 40px 40px auto auto; width: 70%; height: 70%; background: oklch(0.94 0.02 210); animation: float 5s ease-in-out infinite; }
    .s2 { inset: 80px auto auto 10%; width: 55%; height: 55%; background: oklch(0.95 0.03 55); animation: float 6s ease-in-out 0.4s infinite; }
    .s3 {
      inset: auto 8% 10% 18%; padding: 1.5rem; display: grid; gap: 0.35rem;
      animation: float 7s ease-in-out 0.8s infinite;
    }
    .s3 span { font-family: var(--font-display); font-size: 1.4rem; }
    .s3 em { font-style: normal; color: var(--ink-soft); font-size: 0.9rem; }
    .benefits { padding-block: 2rem 4rem; }
    .benefits h2 { margin-bottom: 1.25rem; font-size: 1.8rem; }
    .grid {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem;
    }
    .grid article {
      padding: 1.25rem 0; border-top: 1px solid var(--line);
      animation: rise 0.6s ease both;
    }
    .grid article:nth-child(2) { animation-delay: 0.08s; }
    .grid article:nth-child(3) { animation-delay: 0.16s; }
    .grid h3 { font-size: 1.25rem; }
    .grid p { color: var(--ink-soft); margin: 0; }
    @keyframes rise {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: none; }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-8px); }
    }
    @media (max-width: 860px) {
      .hero { grid-template-columns: 1fr; }
      .visual { min-height: 240px; }
      .grid { grid-template-columns: 1fr; }
    }
  `]
})
export class LandingComponent {
  constructor(public auth: AuthService) {}
}
