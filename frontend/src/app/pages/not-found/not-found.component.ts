import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="nf">
      <p class="code">404</p>
      <h1>Esta página no existe</h1>
      <p class="muted">La ruta no coincide con ningún producto ni panel de LegalStation.</p>
      <a routerLink="/" class="btn btn-primary">Volver a LegalStation</a>
    </div>
  `,
  styles: [`
    .nf {
      max-width: 36rem;
      margin: 0 auto;
      padding: 4rem 1.25rem 5rem;
      text-align: center;
    }
    .code {
      font-variant-numeric: tabular-nums;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: var(--brand);
      margin: 0 0 0.5rem;
    }
    h1 { font-size: 1.75rem; }
    .muted { margin-bottom: 1.5rem; }
  `],
})
export class NotFoundComponent implements OnInit {
  constructor(private title: Title) {}
  ngOnInit(): void {
    this.title.setTitle('Página no encontrada · LegalStation');
  }
}
