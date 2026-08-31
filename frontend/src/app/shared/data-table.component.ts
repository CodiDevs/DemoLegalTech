import { Component, Input } from '@angular/core';
import { IconComponent, IconName } from './icon.component';

export interface DataTableColumn {
  key: string;
  label: string;
  mono?: boolean;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [IconComponent],
  template: `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            @for (col of columns; track col.key) {
              <th scope="col">{{ col.label }}</th>
            }
          </tr>
        </thead>
        <tbody>
          @if (loading) {
            <tr>
              <td [attr.colspan]="columns.length" class="state">
                <span class="loading">
                  <span class="spinner" aria-hidden="true"></span>
                  {{ loadingText }}
                </span>
              </td>
            </tr>
          } @else if (!rows.length) {
            <tr>
              <td [attr.colspan]="columns.length" class="state">
                <div class="empty-state">
                  <span class="empty-icon"><app-icon [name]="emptyIcon" [size]="20" /></span>
                  <strong>{{ emptyTitle }}</strong>
                  @if (emptyText) { <p>{{ emptyText }}</p> }
                </div>
              </td>
            </tr>
          } @else {
            @for (row of rows; track trackRow(row)) {
              <tr>
                @for (col of columns; track col.key) {
                  <td [class.mono]="col.mono">{{ row[col.key] }}</td>
                }
              </tr>
            }
          }
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .table-wrap {
      overflow-x: auto;
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      background: var(--surface);
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: var(--text-sm);
    }
    th, td {
      padding: var(--space-3) var(--space-4);
      text-align: left;
      border-bottom: 1px solid var(--border);
    }
    th {
      font-size: var(--text-xs);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: var(--tracking-wide);
      color: var(--text-muted);
      background: var(--bg-subtle);
      white-space: nowrap;
    }
    tr:last-child td { border-bottom: 0; }
    .mono { font-variant-numeric: tabular-nums; }

    .state {
      padding: var(--space-6) var(--space-5);
      text-align: center;
    }
    .loading {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      color: var(--text-secondary);
      font-size: var(--text-sm);
    }
    .empty-state {
      display: grid;
      justify-items: center;
      gap: var(--space-2);
    }
    .empty-icon {
      display: grid;
      place-items: center;
      width: 40px;
      height: 40px;
      border-radius: var(--radius-md);
      background: var(--bg-subtle);
      border: 1px solid var(--border);
      color: var(--text-muted);
    }
    .empty-state strong {
      font-weight: 650;
      font-size: var(--text-base);
      color: var(--text);
    }
    .empty-state p {
      margin: 0;
      max-width: 42ch;
      color: var(--text-secondary);
      font-size: var(--text-sm);
      line-height: var(--leading-snug);
    }
  `]
})
export class DataTableComponent {
  @Input({ required: true }) columns!: DataTableColumn[];
  @Input({ required: true }) rows: Record<string, string | number>[] = [];
  @Input() loading = false;
  @Input() loadingText = 'Cargando registros…';
  @Input() emptyTitle = 'Todavía no hay registros';
  @Input() emptyText = '';
  @Input() emptyIcon: IconName = 'inbox';

  trackRow(row: Record<string, string | number>): string {
    return String(row['id'] ?? row['case_id'] ?? JSON.stringify(row));
  }
}
