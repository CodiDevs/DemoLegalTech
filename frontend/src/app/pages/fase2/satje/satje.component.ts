import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ApiService } from '../../../core/api.service';
import { DataTableComponent } from '../../../shared/data-table.component';
import { StatusBadgeComponent } from '../../../shared/status-badge.component';
import { IconComponent } from '../../../shared/icon.component';

@Component({
  selector: 'app-fase2-satje',
  standalone: true,
  imports: [FormsModule, DatePipe, DecimalPipe, DataTableComponent, StatusBadgeComponent, IconComponent],
  template: `
    <header class="satje-head">
      <h1>Causas judiciales</h1>
    </header>

    <div class="panel satje-action">
      <button class="btn btn-primary" type="button" (click)="sync()" [disabled]="loading">
        <app-icon name="clock" [size]="16" />
        {{ loading ? 'Sincronizando… ' + syncCount : 'Sincronizar SATJE' }}
      </button>
    </div>

    @if (data) {
      <div class="stats panel">
        <app-status-badge label="Sincronización completada" variant="ok" />
        <p>{{ data.message }}</p>
        <p class="muted">
          Última revisión: {{ data.last_sync | date:'medium' }} ·
          Próxima automática: {{ data.next_scheduled | date:'medium' }} ·
          {{ data.records_pulled }} movimientos encontrados
        </p>
      </div>

      <section class="fase2-section">
        <h2>Causas en el juzgado</h2>
        <app-data-table [columns]="recordCols" [rows]="recordRows" />
      </section>

      <section class="fase2-section">
        <h2>Vincular expediente</h2>
        @for (m of data.suggested_matches; track m.case_id) {
          <div class="panel match">
            <div class="match-body">
              <strong>{{ m.label }}</strong>
              <span class="muted">Coincidencia {{ (m.confidence * 100) | number:'1.0-0' }}%</span>
            </div>
            <button type="button" class="btn btn-primary btn-sm" (click)="linkMatch(m)" [disabled]="linking === m.case_id">
              {{ linking === m.case_id ? 'Vinculando…' : 'Vincular con expediente' }}
            </button>
          </div>
        }
      </section>
    }
  `,
  styleUrls: ['../fase2-shared.scss'],
  styles: [`
    .satje-head { margin-bottom: var(--space-4); }
    .satje-head h1 { margin: 0 0 var(--space-2); }

    .satje-intro {
      display: flex;
      align-items: flex-start;
      gap: var(--space-4);
      margin-bottom: var(--space-4);
      padding: var(--space-4);
    }

    .satje-intro p {
      margin: var(--space-1) 0 0;
      font-size: var(--text-sm);
      color: var(--text-secondary);
    }

    .satje-action {
      max-width: 36rem;
      margin-bottom: var(--space-4);
      padding: var(--space-5);
    }

    .satje-action h2 {
      margin: 0 0 var(--space-2);
      font-size: var(--text-lg);
    }

    .satje-steps {
      margin: var(--space-3) 0 var(--space-4);
      padding-left: 1.2rem;
      font-size: var(--text-sm);
      color: var(--text-secondary);
      display: grid;
      gap: var(--space-1);
    }

    .stats { margin-bottom: var(--space-4); padding: var(--space-4); }

    .section-hint {
      margin: 0 0 var(--space-3);
      font-size: var(--text-sm);
      color: var(--text-secondary);
    }

    .match {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-4);
      flex-wrap: wrap;
      margin-bottom: var(--space-3);
      padding: var(--space-4);
    }

    .match-body { flex: 1; min-width: 12rem; }
    .match-body .muted { display: block; font-size: var(--text-sm); margin-top: 0.15rem; }
  `]
})
export class Fase2SatjeComponent {
  data: any = null;
  loading = false;
  syncCount = '';
  recordCols = [
    { key: 'cause_no', label: 'Número de causa', mono: true },
    { key: 'court', label: 'Juzgado' },
    { key: 'status', label: 'Estado procesal' },
    { key: 'match', label: 'Expediente LegalStation' },
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
          match: r.match_case_id ? `#${r.match_case_id}` : 'Sin vincular',
        }));
      },
      error: () => { this.loading = false; clearInterval(tick); },
    });
  }

  linkMatch(m: { case_id: number; label: string; confidence: number; cause_no?: string; court?: string }): void {
    this.linking = m.case_id;
    const causeNo = m.cause_no || `SATJE-${m.case_id}`;
    const court = m.court || 'Juzgado de Familia';
    this.api.mockSatjeLink(m.case_id, causeNo, court, m.confidence).subscribe({
      next: () => { this.linking = null; },
      error: () => { this.linking = null; },
    });
  }
}
