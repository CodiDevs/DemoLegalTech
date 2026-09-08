import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

type LegalDocumentKind = 'privacy' | 'terms';

@Component({
  selector: 'app-legal-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <article class="legal-page">
      <a routerLink="/" class="legal-back">Volver a LegalStation</a>

      @if (kind === 'privacy') {
        <h1>Política de datos</h1>
        <p class="legal-notice">
          Versión para entorno de demostración. No ingreses datos personales reales.
        </p>

        <section>
          <h2>Qué información usa esta demo</h2>
          <p>
            Las cuentas, expedientes, documentos, pagos y firmas mostrados deben contener
            información ficticia creada exclusivamente para probar el recorrido.
          </p>
        </section>

        <section>
          <h2>Para qué se usa</h2>
          <p>
            La información permite demostrar evaluación, seguimiento del expediente,
            carga documental y firma. No se usa para prestar asesoría jurídica real.
          </p>
        </section>

        <section>
          <h2>Antes de producción</h2>
          <p>
            Una operación real debe sustituir este texto por una política revisada
            conforme a la LOPDP y definir conservación, responsables y derechos del titular.
          </p>
        </section>
      } @else {
        <h1>Términos de uso</h1>
        <p class="legal-notice">
          Divorcio360 funciona aquí como demostración de producto.
        </p>

        <section>
          <h2>Sin asesoría ni cotización</h2>
          <p>
            El contenido no constituye asesoría legal, cotización, contrato ni promesa
            de plazo. Los valores y resultados visibles son ilustrativos.
          </p>
        </section>

        <section>
          <h2>Uso de información ficticia</h2>
          <p>
            No cargues cédulas, partidas, firmas ni información personal real en este entorno.
          </p>
        </section>

        <section>
          <h2>Contacto</h2>
          <p>
            Reporta dudas o problemas a
            <a href="mailto:soporte@legalstation.ec">soporte&#64;legalstation.ec</a>.
          </p>
        </section>
      }
    </article>
  `,
  styles: [`
    .legal-page {
      width: min(100% - 2rem, 48rem);
      margin-inline: auto;
      padding-block: var(--space-7) var(--space-9);
      color: var(--text);
    }

    .legal-back {
      display: inline-block;
      margin-bottom: var(--space-6);
      color: var(--primary);
      font-size: var(--text-sm);
      font-weight: 600;
    }

    h1 {
      margin: 0;
      font-family: var(--font-display);
      font-size: clamp(2.25rem, 6vw, 4rem);
      line-height: 1.05;
      letter-spacing: -0.04em;
    }

    .legal-notice {
      margin: var(--space-5) 0 var(--space-7);
      padding: var(--space-4);
      border: 1px solid var(--warning-border);
      border-radius: var(--radius-md);
      background: var(--warning-subtle);
      color: var(--text);
    }

    section {
      padding-block: var(--space-5);
      border-top: 1px solid var(--border);
    }

    h2 {
      margin: 0 0 var(--space-2);
      font-size: var(--text-xl);
    }

    p {
      margin: 0;
      max-width: 65ch;
      color: var(--text-secondary);
      line-height: var(--leading-normal);
    }

    a {
      color: var(--primary);
    }
  `],
})
export class LegalPageComponent {
  readonly kind: LegalDocumentKind;

  constructor(private route: ActivatedRoute) {
    this.kind = this.route.snapshot.data['legalDocument'] as LegalDocumentKind;
  }
}
