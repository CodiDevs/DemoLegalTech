import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService, CaseItem } from '../../../core/api.service';
import { IconComponent } from '../../../shared/icon.component';
import { getProductDisplayName } from '../../../shared/product-sites.data';
import { caseShort } from '../../../shared/case-status.data';
import { WorkspaceHeadComponent } from '../../lawyer-panel/workspace-head.component';

interface AIResult {
  summary: string;
  risks: string[];
  recommendations: string[];
}

interface ChatMsg {
  role: 'user' | 'assistant';
  text: string;
}

@Component({
  selector: 'app-fase2-ai',
  standalone: true,
  imports: [FormsModule, RouterLink, IconComponent, WorkspaceHeadComponent],
  template: `
    <div class="desk">
      <app-workspace-head title="Asistente" [aside]="headAside">
        <label class="sr-only" for="caseId">Expediente</label>
        <select id="caseId" [(ngModel)]="selectedCaseId" (ngModelChange)="onCaseChange($event)">
          <option [ngValue]="0">Sin expediente</option>
          @for (c of cases; track c.id) {
            <option [ngValue]="c.id">{{ optionLabel(c) }}</option>
          }
        </select>
        @if (selectedCaseId > 0) {
          <a class="btn btn-ghost" [routerLink]="['/abogado/caso', selectedCaseId]">
            Abrir
            <app-icon name="arrow-right" [size]="16" />
          </a>
        }
      </app-workspace-head>

      @if (casesError) {
        <div class="panel state" role="alert">
          <strong>No cargaron los expedientes</strong>
          <button type="button" class="btn btn-secondary" (click)="loadCases()">Reintentar</button>
        </div>
      } @else {
        <div class="board">
          <aside class="brief panel">
            @if (loading && !data) {
              <p class="muted"><span class="spinner" aria-hidden="true"></span> Leyendo…</p>
            } @else if (analyzeError && !data) {
              <p class="muted">El análisis no respondió.</p>
              <button type="button" class="btn btn-secondary" (click)="run()">Reintentar</button>
            } @else if (data) {
              <p class="brief-k">{{ selectedLabel }}</p>
              @if (selectedCase; as c) {
                <p class="muted">{{ productName(c) }} · {{ c.status_label }}</p>
              }
              <p class="brief-sum">{{ data.summary }}</p>
              @if (data.risks?.[0]; as risk) {
                <p class="brief-risk">
                  <app-icon name="alert-triangle" [size]="16" />
                  {{ risk }}
                </p>
              }
              @if (data.recommendations?.[0]; as next) {
                <p class="brief-next"><strong>Siguiente.</strong> {{ next }}</p>
              }
            }
          </aside>

          <section class="chat panel" aria-label="Chat con el asistente">
            <div class="chat-log" #log>
              @for (m of messages; track $index) {
                <div class="bubble" [class.me]="m.role === 'user'">{{ m.text }}</div>
              }
              @if (chatLoading) {
                <div class="bubble pending" aria-live="polite">Escribiendo…</div>
              }
            </div>
            <div class="chips" role="group" aria-label="Preguntas">
              @for (q of prompts; track q) {
                <button type="button" class="chip" (click)="ask(q)" [disabled]="chatLoading">{{ q }}</button>
              }
            </div>
            <form class="composer" (ngSubmit)="send()">
              <label class="sr-only" for="aiDraft">Mensaje</label>
              <input
                id="aiDraft"
                name="draft"
                type="text"
                [(ngModel)]="draft"
                placeholder="Pregunta sobre este expediente"
                autocomplete="off"
                [disabled]="chatLoading"
              />
              <button class="btn btn-primary" type="submit" [disabled]="chatLoading || !draft.trim()">
                Enviar
              </button>
            </form>
          </section>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      flex: 1 1 auto;
      min-height: 0;
      height: 100%;
    }

    .desk {
      display: grid;
      grid-template-rows: auto minmax(0, 1fr);
      gap: var(--space-4);
      flex: 1 1 auto;
      min-height: 0;
      height: 100%;
      padding-block: var(--space-1) 0;
    }

    .desk select {
      min-width: 16rem;
      max-width: 28rem;
    }

    .desk .btn-ghost {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
    }

    .board {
      display: grid;
      grid-template-columns: minmax(15rem, 18rem) minmax(0, 1fr);
      gap: var(--space-4);
      align-items: stretch;
      min-height: 0;
      height: 100%;
    }

    .brief {
      display: grid;
      align-content: start;
      gap: var(--space-3);
      min-height: 0;
      overflow: auto;
      animation: desk-in 420ms var(--ease-out);
    }

    .brief-k {
      margin: 0;
      font-weight: 650;
      font-size: var(--text-sm);
    }

    .brief-sum {
      margin: 0;
      font-size: var(--text-sm);
      line-height: 1.5;
    }

    .brief-risk {
      display: flex;
      gap: var(--space-2);
      align-items: flex-start;
      margin: 0;
      font-size: var(--text-sm);
      color: var(--warning);
    }

    .brief-risk app-icon { flex-shrink: 0; margin-top: 1px; }

    .brief-next {
      margin: 0;
      font-size: var(--text-sm);
    }

    .brief-next strong {
      font-weight: 650;
    }

    .muted {
      margin: 0;
      color: var(--text-secondary);
      font-size: var(--text-sm);
    }

    .chat {
      display: grid;
      grid-template-rows: minmax(0, 1fr) auto auto;
      gap: var(--space-3);
      min-height: 0;
      height: 100%;
      animation: desk-in 480ms var(--ease-out);
    }

    .chat-log {
      overflow: auto;
      display: grid;
      align-content: start;
      gap: var(--space-2);
      padding-right: 2px;
      scrollbar-width: thin;
      min-height: 0;
    }

    .bubble {
      max-width: 42rem;
      padding: var(--space-3) var(--space-4);
      border-radius: var(--radius-md);
      background: var(--bg-muted);
      font-size: var(--text-sm);
      line-height: 1.45;
      white-space: pre-wrap;
    }

    .bubble.me {
      justify-self: end;
      background: var(--primary-subtle);
      color: var(--primary-active, var(--primary));
    }

    .bubble.pending { color: var(--text-muted); font-style: italic; }

    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
      flex-shrink: 0;
    }

    .chip {
      min-height: 2rem;
      padding: 0 var(--space-3);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      background: var(--surface);
      color: var(--text-secondary);
      font-size: var(--text-xs);
      font-weight: 600;
    }

    .chip:hover:not(:disabled) {
      border-color: var(--primary-border);
      color: var(--primary);
    }

    .composer {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: var(--space-2);
      flex-shrink: 0;
      background: var(--surface);
    }

    .state {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--space-3);
    }

    @keyframes desk-in {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: none; }
    }

    @media (max-width: 860px) {
      :host { height: auto; flex: none; min-height: 0; }
      .desk { height: auto; flex: none; }
      .board {
        grid-template-columns: 1fr;
        height: auto;
      }
      .chat {
        height: auto;
        min-height: 24rem;
      }
    }
  `]
})
export class Fase2AiComponent implements OnInit {
  @ViewChild('log') log?: ElementRef<HTMLElement>;

  cases: CaseItem[] = [];
  selectedCaseId = 0;
  data: AIResult | null = null;
  loading = false;
  casesError = false;
  analyzeError = false;
  messages: ChatMsg[] = [];
  draft = '';
  chatLoading = false;
  readonly prompts = ['¿Qué sigue ahora?', '¿Hay menores?', '¿Listo para minuta?'];

  private analyzeSeq = 0;
  private chatSeq = 0;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadCases();
  }

  get selectedCase(): CaseItem | undefined {
    return this.cases.find((c) => c.id === this.selectedCaseId);
  }

  get selectedLabel(): string {
    const c = this.selectedCase;
    if (!c) return 'Sin expediente';
    return `#${c.id} · ${c.client_name || 'Cliente'}`;
  }

  get headAside(): string {
    if (this.selectedCaseId <= 0) return '';
    return this.selectedLabel;
  }

  productName(c: CaseItem): string {
    return getProductDisplayName(c.product || 'divorcio360');
  }

  optionLabel(c: CaseItem): string {
    return `#${c.id} · ${this.productName(c)} · ${caseShort(c.status, c.status_label || c.status)}`;
  }

  pickDefaultCaseId(list: CaseItem[]): number {
    return list[0]?.id ?? 0;
  }

  loadCases(): void {
    this.casesError = false;
    this.api.listCases().subscribe({
      next: (list) => {
        this.cases = [...list].sort((a, b) => {
          const aw = a.status === '03' ? 0 : 1;
          const bw = b.status === '03' ? 0 : 1;
          return aw - bw || b.id - a.id;
        });
        this.selectedCaseId = this.pickDefaultCaseId(this.cases);
        this.run();
      },
      error: () => {
        this.casesError = true;
      },
    });
  }

  onCaseChange(id: number): void {
    this.selectedCaseId = id;
    this.messages = [];
    this.run();
  }

  run(): void {
    const n = ++this.analyzeSeq;
    this.loading = true;
    this.analyzeError = false;
    this.api.mockAI(this.selectedCaseId).subscribe({
      next: (d) => {
        if (n !== this.analyzeSeq) return;
        this.data = d;
        this.loading = false;
        this.messages = [{ role: 'assistant', text: this.seedText() }];
        this.stickChat();
      },
      error: () => {
        if (n !== this.analyzeSeq) return;
        this.loading = false;
        this.analyzeError = true;
      },
    });
  }

  ask(q: string): void {
    this.draft = q;
    this.send();
  }

  send(): void {
    const text = this.draft.trim();
    if (!text || this.chatLoading) return;
    this.draft = '';
    this.messages = [...this.messages, { role: 'user', text }];
    this.stickChat();
    const n = ++this.chatSeq;
    this.chatLoading = true;
    this.api.mockAIChat(this.selectedCaseId, text).subscribe({
      next: (res) => {
        if (n !== this.chatSeq) return;
        this.chatLoading = false;
        this.messages = [...this.messages, { role: 'assistant', text: res.reply || 'Sin respuesta.' }];
        this.stickChat();
      },
      error: () => {
        if (n !== this.chatSeq) return;
        this.chatLoading = false;
        this.messages = [...this.messages, { role: 'assistant', text: 'El asistente no respondió. Reintenta.' }];
        this.stickChat();
      },
    });
  }

  private seedText(): string {
    return 'Revisé el expediente. Pregunta por minuta, menores o el siguiente paso.';
  }

  private stickChat(): void {
    queueMicrotask(() => {
      const el = this.log?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    });
  }
}
