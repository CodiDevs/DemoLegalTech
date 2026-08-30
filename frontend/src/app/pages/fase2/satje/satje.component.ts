import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ApiService } from '../../../core/api.service';
import { DataTableComponent } from '../../../shared/data-table.component';
import { StatusBadgeComponent } from '../../../shared/status-badge.component';

@Component({
  selector: 'app-fase2-satje',
  standalone: true,
  imports: [FormsModule, DatePipe, DecimalPipe, DataTableComponent, StatusBadgeComponent],
  template: `
    <h1>SATJE / Función Judicial</h1>
    <p class="muted">Sincronización automática con causas judiciales — simulación sin scraping real.</p>

    <div class="panel fase2-preview-card config">
      <h2>Configuración sync</h2>
      <div class="field">
        <label>Frecuencia</label>
        <select disabled><option>Cada 6 horas (mock)</option></select>
      </div>
      <div class="field">
        <label>Credenciales SATJE</label>
        <input disabled value="••••••••••••" />
      </div>
      <button class="btn btn-primary" type="button" (click)="sync()" [disabled]="loading">
        {{ loading ? 'Sincronizando… ' + syncCount : 'Simular sync' }}
      </button>
    </div>

    @if (data) {
      <div class="stats panel fase2-preview-card">
        <app-status-badge label="Simulado OK" variant="ok" />
        <p>{{ data.message }}</p>
        <p class="muted">
          Última sync: {{ data.last_sync | date:'medium' }} ·
          Próxima: {{ data.next_scheduled | date:'medium' }} ·
          Registros: {{ data.records_pulled }}
        </p>
      </div>

      <section class="fase2-section">
        <h2>Registros judiciales</h2>
        <app-data-table [columns]="recordCols" [rows]="recordRows" />
      </section>

      <section class="fase2-section">
        <h2>Sugerencias de vinculación</h2>
        @for (m of data.suggested_matches; track m.case_id) {
          <div class="panel fase2-preview-card match">
            <strong>{{ m.label }}</strong>
            <span class="muted">Confianza {{ (m.confidence * 100) | number:'1.0-0' }}%</span>
            <button type="button" class="btn btn-ghost" (click)="linkMatch(m)" [disabled]="linking === m.case_id">
              {{ linking === m.case_id ? 'Vinculando…' : 'Vincular' }}
            </button>
          </div>
        }
      </section>
    }
  `,
  styleUrls: ['../fase2-shared.scss'],
  styles: [`
    .config { max-width: 480px; margin-top: 1rem; }
    .stats { margin-top: 1rem; }
    .match { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; margin-bottom: 0.65rem; }
    .match .muted { flex: 1; }
  `]
})
export class Fase2SatjeComponent {
  data: any = null;
  loading = false;
  syncCount = '';
  recordCols = [
    { key: 'cause_no', label: 'Causa', mono: true },
    { key: 'court', label: 'Juzgado' },
    { key: 'status', label: 'Estado' },
    { key: 'match', label: 'Match expediente' },
  ];
  recordRows: Record<string, string | number>[] = [];
  linking: number | null = null;

  constructor(private api: ApiService) {}

  sync(): void {
    this.loading = true;
    this.syncCount = '';
    let n = 0;
    const tick = setInterval(() => {
      n++;
      this.syncCount = `${n}/3`;
      if (n >= 3) clearInterval(tick);
    }, 400);

    this.api.mockSatje().subscribe({
      next: (d) => {
        this.data = d;
        this.loading = false;
        this.recordRows = (d.records || []).map((r: any) => ({
          cause_no: r.cause_no,
          court: r.court,
          status: r.status,
          match: r.match_case_id ? `#${r.match_case_id}` : '—',
        }));
      },
      error: () => { this.loading = false; clearInterval(tick); },
    });
  }

  linkMatch(m: { case_id: number; label: string; confidence: number; cause_no?: string; court?: string }): void {
    this.linking = m.case_id;
    const causeNo = m.cause_no || `SATJE-${m.case_id}`;
    const court = m.court || 'Juzgado de Familia (mock)';
    this.api.mockSatjeLink(m.case_id, causeNo, court, m.confidence).subscribe({
      next: () => { this.linking = null; },
      error: () => { this.linking = null; },
    });
  }
}
