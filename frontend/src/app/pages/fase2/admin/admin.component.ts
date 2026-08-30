import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe, DatePipe } from '@angular/common';
import { ApiService } from '../../../core/api.service';
import { MetricCardComponent } from '../../../shared/metric-card.component';
import { DataTableComponent } from '../../../shared/data-table.component';

@Component({
  selector: 'app-fase2-admin',
  standalone: true,
  imports: [FormsModule, MetricCardComponent, DataTableComponent, DecimalPipe, DatePipe],
  template: `
    <h1>Panel Socio / Administrador</h1>
    <p class="muted">Métricas globales, embudo de conversión y operación LegalStation (híbrido demo + casos reales).</p>
    @if (data) {
      <div class="metrics">
        <app-metric-card [value]="data.metrics.casos_activos" label="Casos activos" hint="+3 vs mes anterior" />
        <app-metric-card [value]="data.metrics.casos_finalizados" label="Finalizados" />
        <app-metric-card [value]="(data.metrics.conversion_cuestionario * 100 | number:'1.0-0') + '%'" label="Conversión cuestionario" />
        <app-metric-card [value]="'$' + (data.metrics.ingreso_mes_usd | number)" label="Ingreso mes" />
        <app-metric-card [value]="data.metrics.tiempo_promedio_dias + ' días'" label="Tiempo promedio trámite" />
      </div>

      <section class="fase2-section">
        <h2>Embudo de conversión</h2>
        <div class="funnel">
          @for (step of data.funnel; track step.step) {
            <div class="funnel-step fase2-preview-card panel">
              <div class="funnel-head">
                <strong>{{ step.step }}</strong>
                <span>{{ step.count }} · {{ step.pct }}%</span>
              </div>
              <div class="bar"><span [style.width.%]="step.pct"></span></div>
            </div>
          }
        </div>
      </section>

      <section class="fase2-section two-col">
        <div>
          <h2>Ingresos del mes</h2>
          @for (r of data.revenue_breakdown; track r.product) {
            <div class="panel fase2-preview-card rev-row">
              <strong>{{ r.product }}</strong>
              <span>\${{ r.amount_usd | number }} · {{ r.cases }} casos</span>
            </div>
          }
        </div>
        <div>
          <h2>Actividad reciente</h2>
          <ul class="feed">
            @for (a of data.activity; track a.at) {
              <li class="panel fase2-preview-card">
                <span class="muted">{{ a.at | date:'short' }}</span>
                <p>{{ a.text }}</p>
              </li>
            }
          </ul>
        </div>
      </section>

      <section class="fase2-section">
        <h2>Casos recientes</h2>
        <app-data-table [columns]="caseCols" [rows]="caseRows" />
      </section>

      <section class="fase2-section two-col">
        <div>
          <h2>Equipo activo</h2>
          <app-data-table [columns]="teamCols" [rows]="teamRows" />
        </div>
        <div>
          <h2>Plantillas maestras</h2>
          @for (t of data.master_templates; track t.id) {
            <div class="panel fase2-preview-card tpl-row">
              <div>
                <strong>{{ t.name }}</strong>
                <p class="muted">{{ t.version }} · {{ t.status }}</p>
              </div>
              <button type="button" class="btn btn-ghost" (click)="openEdit(t)">Editar</button>
            </div>
          }
        </div>
      </section>
    }
    @if (editTpl) {
      <div class="modal-backdrop" (click)="editTpl = null">
        <div class="modal panel" (click)="$event.stopPropagation()">
          <h2>Editar {{ editTpl.name }}</h2>
          <div class="field"><label>Versión</label><input [(ngModel)]="editVersion" /></div>
          <div class="field"><label>Nota de cambio</label><textarea rows="3" [(ngModel)]="editNote"></textarea></div>
          <div class="actions">
            <button type="button" class="btn btn-ghost" (click)="editTpl = null">Cancelar</button>
            <button type="button" class="btn btn-primary" (click)="saveEdit()">Guardar</button>
          </div>
        </div>
      </div>
    }
  `,
  styleUrls: ['../fase2-shared.scss'],
  styles: [`
    .metrics { display: grid; grid-template-columns: repeat(5, 1fr); gap: 0.85rem; margin-top: 1.25rem; }
    .funnel { display: grid; gap: 0.65rem; }
    .funnel-head { display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.9rem; }
    .bar { height: 8px; background: var(--line); border-radius: 99px; overflow: hidden; }
    .bar span { display: block; height: 100%; background: var(--brand); }
    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
    .rev-row, .tpl-row { display: flex; justify-content: space-between; align-items: center; gap: 1rem; margin-bottom: 0.65rem; }
    .rev-row span, .tpl-row p { color: var(--ink-soft); font-size: 0.88rem; margin: 0; }
    .feed { list-style: none; padding: 0; margin: 0; display: grid; gap: 0.5rem; }
    .feed p { margin: 0.25rem 0 0; font-size: 0.9rem; }
    .modal-backdrop {
      position: fixed; inset: 0; background: oklch(0.15 0.02 230 / 0.45);
      display: grid; place-items: center; z-index: 50; padding: 1rem;
    }
    .modal { max-width: 420px; width: 100%; }
    .actions { display: flex; gap: 0.5rem; justify-content: flex-end; margin-top: 1rem; }
    @media (max-width: 1000px) {
      .metrics { grid-template-columns: repeat(2, 1fr); }
      .two-col { grid-template-columns: 1fr; }
    }
  `]
})
export class Fase2AdminComponent implements OnInit {
  data: any;
  caseCols = [
    { key: 'id', label: '#', mono: true },
    { key: 'client', label: 'Cliente' },
    { key: 'status_label', label: 'Estado' },
    { key: 'lawyer', label: 'Abogado' },
    { key: 'days', label: 'Días' },
  ];
  caseRows: Record<string, string | number>[] = [];
  teamCols = [
    { key: 'name', label: 'Nombre' },
    { key: 'role', label: 'Rol' },
    { key: 'active_cases', label: 'Casos' },
    { key: 'status', label: 'Estado' },
  ];
  teamRows: Record<string, string | number>[] = [];
  editTpl: any = null;
  editVersion = '';
  editNote = '';

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.mockMetrics().subscribe((d) => {
      this.data = d;
      this.caseRows = (d.recent_cases || []).map((c: any) => ({
        id: c.id,
        client: c.client,
        status_label: c.status_label,
        lawyer: c.lawyer,
        days: c.days,
      }));
      this.teamRows = d.team || [];
    });
  }

  openEdit(t: any): void {
    this.editTpl = t;
    this.editVersion = t.version || 'v1.0';
    this.editNote = '';
  }

  saveEdit(): void {
    if (!this.editTpl) return;
    this.api.patchMasterTemplate(this.editTpl.id, this.editVersion, this.editNote).subscribe(() => {
      this.editTpl = null;
      this.ngOnInit();
    });
  }
}
