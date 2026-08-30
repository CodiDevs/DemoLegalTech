import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { ApiService, CaseItem } from '../../../core/api.service';
import { StatusBadgeComponent } from '../../../shared/status-badge.component';

@Component({
  selector: 'app-fase2-ai',
  standalone: true,
  imports: [FormsModule, StatusBadgeComponent, DecimalPipe],
  template: `
    <h1>Agente de IA</h1>
    <p class="muted">Análisis asistido de expedientes — respuesta simulada para demo.</p>

    <div class="panel controls">
      <label for="caseId">Expediente a analizar</label>
      <select id="caseId" [(ngModel)]="selectedCaseId">
        <option [ngValue]="0">Demo genérico</option>
        @for (c of cases; track c.id) {
          <option [ngValue]="c.id">#{{ c.id }} — {{ c.client_name }} ({{ c.status_label }})</option>
        }
      </select>
      <button class="btn btn-primary" type="button" (click)="run()" [disabled]="loading">
        {{ loading ? 'Analizando…' : 'Analizar expediente' }}
      </button>
    </div>

    @if (data) {
      <div class="layout">
        <div class="stack">
          <div class="panel fase2-preview-card">
            <h2>Resumen ejecutivo</h2>
            <p>{{ data.summary }}</p>
            <div class="gauge-wrap">
              <div class="gauge" [style.--pct]="data.confidence * 100 + '%'">
                <span>{{ (data.confidence * 100) | number:'1.0-0' }}%</span>
              </div>
              <p class="muted">Confianza del análisis</p>
            </div>
          </div>

          <div class="panel fase2-preview-card">
            <h2>Riesgos</h2>
            @for (r of data.risks; track r) {
              <app-status-badge [label]="r" variant="warn" />
            }
          </div>

          <div class="panel fase2-preview-card">
            <h2>Recomendaciones</h2>
            <ul>
              @for (r of data.recommendations; track r) { <li>{{ r }}</li> }
            </ul>
          </div>
        </div>

        <div class="stack">
          <div class="panel fase2-preview-card">
            <h2>Cross-check documentos</h2>
            @for (c of data.cross_check; track c.field) {
              <div class="check-row">
                <app-status-badge [label]="c.status === 'ok' ? 'OK' : 'Alerta'" [variant]="c.status === 'ok' ? 'ok' : 'warn'" />
                <div>
                  <strong>{{ c.field }}</strong>
                  <p class="muted">{{ c.detail }}</p>
                </div>
              </div>
            }
          </div>

          <div class="panel fase2-preview-card chat">
            <h2>Asistente (simulado)</h2>
            @for (m of data.chat; track $index) {
              <div class="msg" [class.user]="m.role === 'user'">{{ m.text }}</div>
            }
          </div>

          <button type="button" class="btn btn-ghost" disabled title="Fase 2 mock">
            Exportar informe PDF (Fase 2)
          </button>
        </div>
      </div>
    }
  `,
  styleUrls: ['../fase2-shared.scss'],
  styles: [`
    .controls { display: grid; gap: 0.75rem; max-width: 480px; margin-top: 1rem; }
    .layout { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; margin-top: 1.25rem; }
    .stack { display: grid; gap: 1rem; align-content: start; }
    .gauge-wrap { text-align: center; margin-top: 1rem; }
    .gauge {
      width: 100px; height: 100px; border-radius: 50%; margin: 0 auto 0.5rem;
      background: conic-gradient(var(--brand) var(--pct), var(--line) 0);
      display: grid; place-items: center;
    }
    .gauge span {
      width: 72px; height: 72px; border-radius: 50%; background: white;
      display: grid; place-items: center; font-weight: 700; font-size: 1.1rem;
    }
    .check-row { display: flex; gap: 0.75rem; padding: 0.5rem 0; border-top: 1px solid var(--line); }
    .check-row:first-of-type { border-top: 0; }
    .check-row p { margin: 0; font-size: 0.85rem; }
    .chat .msg {
      padding: 0.65rem 0.85rem; border-radius: 10px; margin-bottom: 0.5rem;
      background: oklch(0.96 0.01 230); font-size: 0.9rem;
    }
    .chat .msg.user { background: oklch(0.94 0.02 210); margin-left: 1.5rem; }
    @media (max-width: 900px) { .layout { grid-template-columns: 1fr; } }
  `]
})
export class Fase2AiComponent implements OnInit {
  cases: CaseItem[] = [];
  selectedCaseId = 1;
  data: any = null;
  loading = false;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.listCases().subscribe((c) => this.cases = c);
  }

  run(): void {
    this.loading = true;
    this.api.mockAI(this.selectedCaseId).subscribe({
      next: (d) => { this.data = d; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }
}
