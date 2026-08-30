import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="shell wrap">
      <h1>Documentos del trámite</h1>
      <p class="muted">Sube cédula y partida de matrimonio (PDF o imagen). Caso #{{ caseId }}</p>
      <div class="grid">
        <div class="panel">
          <h2>Cédula</h2>
          <input type="file" accept=".pdf,image/*" (change)="onFile($event, 'cedula')" />
          @if (msg['cedula']) { <p class="ok">{{ msg['cedula'] }}</p> }
        </div>
        <div class="panel">
          <h2>Partida de matrimonio</h2>
          <input type="file" accept=".pdf,image/*" (change)="onFile($event, 'partida')" />
          @if (msg['partida']) { <p class="ok">{{ msg['partida'] }}</p> }
        </div>
      </div>
      @if (error) { <p class="err">{{ error }}</p> }
      <div class="actions">
        <a class="btn btn-ghost" [routerLink]="['/caso', caseId]">Ver expediente</a>
        <a class="btn btn-primary" [routerLink]="['/firma', caseId]">Ir a firma</a>
      </div>
      @if (docs.length) {
        <ul class="docs">
          @for (d of docs; track d.id) {
            <li>{{ d.doc_type }} — {{ d.filename }}</li>
          }
        </ul>
      }
    </div>
  `,
  styles: [`
    .wrap { padding-block: 2.5rem; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin: 1.25rem 0; }
    .ok { color: var(--ok); font-weight: 600; } .err { color: var(--bad); }
    .actions { display: flex; gap: 0.75rem; flex-wrap: wrap; }
    .docs { margin-top: 1.5rem; color: var(--ink-soft); }
    @media (max-width: 700px) { .grid { grid-template-columns: 1fr; } }
  `]
})
export class UploadComponent implements OnInit {
  caseId = 0;
  docs: any[] = [];
  msg: Record<string, string> = {};
  error = '';

  constructor(private route: ActivatedRoute, private api: ApiService) {}

  ngOnInit(): void {
    this.caseId = Number(this.route.snapshot.paramMap.get('id'));
    this.reload();
  }

  onFile(ev: Event, docType: string): void {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.error = '';
    this.api.uploadDoc(this.caseId, docType, file).subscribe({
      next: () => {
        this.msg[docType] = 'Cargado';
        this.reload();
      },
      error: (e) => this.error = e?.error?.error || 'Error al subir',
    });
  }

  private reload(): void {
    this.api.listDocs(this.caseId).subscribe((d) => this.docs = d);
  }
}
