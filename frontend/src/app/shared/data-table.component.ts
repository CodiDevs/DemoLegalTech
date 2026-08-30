import { Component, Input } from '@angular/core';

export interface DataTableColumn {
  key: string;
  label: string;
  mono?: boolean;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  template: `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            @for (col of columns; track col.key) {
              <th>{{ col.label }}</th>
            }
          </tr>
        </thead>
        <tbody>
          @for (row of rows; track trackRow(row)) {
            <tr>
              @for (col of columns; track col.key) {
                <td [class.mono]="col.mono">{{ row[col.key] }}</td>
              }
            </tr>
          }
          @if (!rows.length) {
            <tr><td [attr.colspan]="columns.length" class="empty muted">Sin registros.</td></tr>
          }
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .table-wrap { overflow-x: auto; border: 1px solid var(--line); border-radius: var(--radius); background: white; }
    table { width: 100%; border-collapse: collapse; font-size: 0.88rem; }
    th, td { padding: 0.65rem 0.85rem; text-align: left; border-bottom: 1px solid var(--line); }
    th { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.04em; color: var(--ink-soft); background: oklch(0.98 0.004 220); }
    tr:last-child td { border-bottom: 0; }
    .mono { font-family: ui-monospace, monospace; font-size: 0.82rem; }
    .empty { text-align: center; padding: 1.5rem !important; }
  `]
})
export class DataTableComponent {
  @Input({ required: true }) columns!: DataTableColumn[];
  @Input({ required: true }) rows: Record<string, string | number>[] = [];

  trackRow(row: Record<string, string | number>): string {
    return String(row['id'] ?? row['case_id'] ?? JSON.stringify(row));
  }
}
