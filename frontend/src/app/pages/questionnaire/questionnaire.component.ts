import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService, QuestionnaireAnswers, QuestionnaireResult } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { ProgressStepsComponent, ProgressStep } from '../../shared/progress-steps.component';

interface Q {
  key: keyof QuestionnaireAnswers;
  text: string;
  icon: string;
  group: number;
  showIf?: () => boolean;
}

const GROUPS: ProgressStep[] = [
  { id: 'g0', label: 'Elegibilidad' },
  { id: 'g1', label: 'Menores' },
  { id: 'g2', label: 'Bienes' },
  { id: 'g3', label: 'Identidad' },
];

const Q_HINTS: Record<string, string> = {
  conjugal_society: 'Régimen de bienes del matrimonio. Si no estás seguro, responde Sí.',
  has_mediation_acta: 'Documento de mediación o sentencia sobre alimentos, tenencia o visitas.',
};

const Q_LABELS: Record<string, string> = {
  both_want_divorce: 'Ambos desean divorciarse',
  marriage_in_ecuador: 'Matrimonio en Ecuador',
  have_children: 'Tienen hijos',
  minor_dependents: 'Hijos menores',
  custody_regulated: 'Alimentos/tenencia regulados',
  has_mediation_acta: 'Acta mediación/judicial',
  someone_abroad: 'Residencia fuera EC',
  have_assets: 'Bienes en matrimonio',
  conjugal_society: 'Sociedad conyugal',
  ids_valid: 'IDs vigentes',
  want_liquidate_assets: 'Liquidar bienes',
  city: 'Ciudad',
};

@Component({
  selector: 'app-questionnaire',
  standalone: true,
  imports: [FormsModule, RouterLink, ProgressStepsComponent],
  styleUrls: ['../../../styles/landing-shared.scss', '../../../styles/product-flow.scss'],
  template: `
    <div class="landing-page product-flow theme-divorcio">
      <div class="lp-shell wrap">
        @if (!result && !reviewMode) {
          <app-progress-steps [steps]="groups" [activeIndex]="activeGroup" />
            <p class="legal muted">Evaluación orientativa. No constituye asesoría legal.</p>

          <div class="panel q-card">
            <p class="step muted">Pregunta {{ visibleIndex + 1 }} de {{ visibleQuestions.length }}</p>
            <h1>{{ current.text }}</h1>
            @if (hintFor(current.key); as hint) {
              <p class="muted q-hint">{{ hint }}</p>
            }

            @if (current.key === 'city') {
              <div class="field">
                <label for="city">Ciudad</label>
                <input id="city" [(ngModel)]="answers.city" placeholder="Ej. Quito" (keyup.enter)="answers.city && nextCity()" />
              </div>
              <div class="q-nav">
                <button class="btn btn-ghost" type="button" [disabled]="visibleIndex === 0" (click)="back()">Atrás</button>
                <button class="btn btn-primary" type="button" [disabled]="!answers.city" (click)="nextCity()">Continuar</button>
              </div>
            } @else {
              <div class="yesno" role="group" [attr.aria-label]="current.text">
                <button
                  class="btn btn-choice"
                  type="button"
                  [class.on]="isYes(current.key)"
                  (click)="answer(true)"
                >Sí</button>
                <button
                  class="btn btn-choice"
                  type="button"
                  [class.on]="isNo(current.key)"
                  (click)="answer(false)"
                >No</button>
              </div>
              <div class="q-nav">
                <button class="btn btn-ghost" type="button" [disabled]="visibleIndex === 0" (click)="back()">Atrás</button>
              </div>
            }
          </div>
        }

        @if (!result && reviewMode) {
          <div class="panel q-card">
            <h1>Revisa tus respuestas</h1>
            <p class="muted">Confirma antes de obtener el resultado de elegibilidad.</p>
            <ul class="review-list">
              @for (row of reviewRows; track row.key) {
                <li><span>{{ row.label }}</span><strong>{{ row.value }}</strong></li>
              }
            </ul>
            <div class="yesno">
              <button class="btn btn-ghost" type="button" (click)="back()">Atrás</button>
              <button class="btn btn-primary" type="button" (click)="submit()" [disabled]="submitting">{{ submitting ? 'Evaluando…' : 'Confirmar y ver resultado' }}</button>
            </div>
            @if (evalError) { <p class="err">{{ evalError }}</p> }
          </div>
        }

        @if (result) {
          <div class="panel result-card" [class]="result.code">
            <p class="result-kicker">{{ result.code === 'apto' ? 'Apto' : result.code === 'evaluacion' ? 'Evaluación' : 'No aplica' }}</p>
            <p class="badge-demo">Resultado automático</p>
            <h1>{{ result.title }}</h1>
            <p class="message">{{ result.message }}</p>
            @if (result.price_usd > 0) {
              <p class="price">\${{ result.price_usd }} <span class="muted">· {{ result.product }}</span></p>
            }
            <p class="legal muted">Evaluación orientativa LegalStation. No sustituye consulta legal.</p>

            @if (startError) { <p class="err">{{ startError }}</p> }
            @if (result.code === 'apto') {
              <div class="actions stack-actions">
                @if (auth.isLoggedIn && auth.user()?.role === 'cliente') {
                  <button class="btn btn-primary" type="button" [disabled]="starting" (click)="startCase()">{{ starting ? 'Creando expediente…' : result.cta }}</button>
                } @else if (!auth.isLoggedIn) {
                  <a class="btn btn-primary" routerLink="/auth" [queryParams]="{next:'checkout', result: result.code, city: answers.city, product:'divorcio360', returnUrl:'/productos/divorcio360'}">Crear cuenta</a>
                  <a class="btn btn-ghost" routerLink="/auth" [queryParams]="{mode:'login', product:'divorcio360', returnUrl:'/productos/divorcio360'}">Ya tengo cuenta</a>
                }
              </div>
            } @else if (result.code === 'evaluacion') {
              <p class="muted">En la versión completa se agenda evaluación. Demo: flujo \$749+.</p>
              <div class="actions stack-actions">
                @if (auth.isLoggedIn && auth.user()?.role === 'cliente') {
                  <button class="btn btn-accent" type="button" [disabled]="starting" (click)="startCase()">{{ starting ? 'Creando expediente…' : result.cta }}</button>
                } @else if (!auth.isLoggedIn) {
                  <a class="btn btn-accent" routerLink="/auth" [queryParams]="{next:'checkout', result: result.code, city: answers.city, product:'divorcio360', returnUrl:'/productos/divorcio360'}">Crear cuenta</a>
                  <a class="btn btn-ghost" routerLink="/auth" [queryParams]="{mode:'login', product:'divorcio360', returnUrl:'/productos/divorcio360'}">Ya tengo cuenta</a>
                }
              </div>
            } @else {
              <p class="muted">Derivación al área jurídica tradicional (fuera del flujo digital de pago).</p>
              <a class="btn btn-ghost" routerLink="/productos/divorcio360">Volver a Divorcio360</a>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .wrap { padding-block: 2rem 3rem; max-width: 640px; }
    .legal { font-size: 0.82rem; margin-bottom: 1rem; }
    .q-card { text-align: center; padding: 2rem 1.5rem; animation: rise 0.45s ease both; }
    .q-card h1 { font-size: 1.45rem; margin-bottom: 1.25rem; }
    .yesno { display: flex; gap: 0.75rem; justify-content: center; margin-top: 1.25rem; }
    .btn-choice {
      min-width: 7.5rem;
      background: transparent;
      color: var(--ink);
      border: 1.5px solid var(--line);
    }
    .btn-choice.on {
      border-color: var(--brand);
      background: oklch(0.94 0.03 190);
      color: var(--brand-deep);
    }
    .q-nav { display: flex; justify-content: center; gap: 0.75rem; margin-top: 1.1rem; }
    .q-hint { max-width: 36ch; margin: -0.5rem auto 1rem; font-size: 0.88rem; }
    .err { color: var(--bad); margin-top: 0.85rem; }
    @media (prefers-reduced-motion: reduce) {
      .q-card, .result-card { animation: none; }
    }
    .review-list { list-style: none; padding: 0; text-align: left; margin: 1.25rem 0; }
    .review-list li {
      display: flex; justify-content: space-between; gap: 1rem;
      padding: 0.5rem 0; border-bottom: 1px solid var(--line); font-size: 0.92rem;
    }
    .review-list span { color: var(--ink-soft); }
    .result-card { text-align: center; padding: 2rem 1.5rem; animation: pop 0.45s ease both; }
    .result-kicker {
      font-size: 0.78rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--brand);
      margin: 0 0 0.35rem;
    }
    .result-card.apto { outline: 2px solid oklch(0.55 0.12 150 / 0.35); }
    .result-card.evaluacion { outline: 2px solid oklch(0.72 0.14 85 / 0.45); }
    .result-card.no_aplica { outline: 2px solid oklch(0.52 0.16 25 / 0.35); }
    .message { font-size: 1.05rem; max-width: 42ch; margin: 0 auto 1rem; }
    .price { font-family: var(--font-display); font-size: 2rem; color: var(--brand-deep); margin: 0.5rem 0 1rem; }
    .actions { margin-top: 1.25rem; }
    .stack-actions { display: flex; flex-wrap: wrap; gap: 0.75rem; justify-content: center; }
    @keyframes rise {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: none; }
    }
    @keyframes pop {
      from { opacity: 0; transform: scale(0.98) translateY(8px); }
      to { opacity: 1; transform: none; }
    }
  `]
})
export class QuestionnaireComponent {
  groups = GROUPS;
  reviewMode = false;

  answers: QuestionnaireAnswers = {
    both_want_divorce: false,
    marriage_in_ecuador: false,
    have_children: false,
    minor_dependents: false,
    custody_regulated: false,
    has_mediation_acta: false,
    someone_abroad: false,
    have_assets: false,
    conjugal_society: false,
    ids_valid: false,
    want_liquidate_assets: false,
    city: '',
  };

  all: Q[] = [
    { key: 'both_want_divorce', text: '¿Ambos desean divorciarse?', icon: '🤝', group: 0 },
    { key: 'marriage_in_ecuador', text: '¿Su matrimonio está registrado en Ecuador?', icon: '🇪🇨', group: 0 },
    { key: 'have_children', text: '¿Tienen hijos?', icon: '👨‍👩‍👧', group: 1 },
    { key: 'minor_dependents', text: '¿Existen hijos menores o dependientes?', icon: '👶', group: 1, showIf: () => this.answers.have_children },
    { key: 'custody_regulated', text: '¿Están regulados alimentos, tenencia y visitas?', icon: '⚖️', group: 1, showIf: () => this.answers.have_children && this.answers.minor_dependents },
    { key: 'has_mediation_acta', text: '¿Existe acta de mediación o resolución judicial?', icon: '📋', group: 1, showIf: () => this.answers.have_children && this.answers.minor_dependents },
    { key: 'someone_abroad', text: '¿Alguno reside fuera del Ecuador?', icon: '✈️', group: 0 },
    { key: 'have_assets', text: '¿Tienen bienes adquiridos durante el matrimonio?', icon: '🏠', group: 2 },
    { key: 'conjugal_society', text: '¿Existe sociedad conyugal?', icon: '📊', group: 2 },
    { key: 'ids_valid', text: '¿Ambos cuentan con documentos de identificación vigentes?', icon: '🪪', group: 3 },
    { key: 'want_liquidate_assets', text: '¿Desean liquidar también los bienes?', icon: '💼', group: 2 },
    { key: 'city', text: '¿En qué ciudad se encuentran?', icon: '📍', group: 3 },
  ];

  visibleIndex = 0;
  result: QuestionnaireResult | null = null;
  submitting = false;
  starting = false;
  evalError = '';
  startError = '';
  private answeredKeys = new Set<string>();

  constructor(private api: ApiService, public auth: AuthService, private router: Router) {}

  get visibleQuestions(): Q[] {
    return this.all.filter((q) => !q.showIf || q.showIf());
  }

  get current(): Q {
    return this.visibleQuestions[this.visibleIndex];
  }

  get activeGroup(): number {
    return this.current?.group ?? 0;
  }

  get reviewRows(): { key: string; label: string; value: string }[] {
    return this.visibleQuestions.map((q) => ({
      key: q.key,
      label: Q_LABELS[q.key] || q.text,
      value: q.key === 'city'
        ? this.answers.city
        : typeof (this.answers as any)[q.key] === 'boolean'
          ? ((this.answers as any)[q.key] ? 'Sí' : 'No')
          : String((this.answers as any)[q.key] ?? '—'),
    }));
  }

  hintFor(key: string): string {
    return Q_HINTS[key] || '';
  }

  isYes(key: string): boolean {
    return this.answeredKeys.has(key) && (this.answers as any)[key] === true;
  }

  isNo(key: string): boolean {
    return this.answeredKeys.has(key) && (this.answers as any)[key] === false;
  }

  back(): void {
    this.evalError = '';
    if (this.reviewMode) {
      this.reviewMode = false;
      return;
    }
    if (this.visibleIndex > 0) this.visibleIndex--;
  }

  answer(val: boolean): void {
    (this.answers as any)[this.current.key] = val;
    this.answeredKeys.add(this.current.key);
    this.advance();
  }

  nextCity(): void {
    this.advance();
  }

  private advance(): void {
    if (this.visibleIndex < this.visibleQuestions.length - 1) {
      this.visibleIndex++;
      return;
    }
    this.reviewMode = true;
  }

  submit(): void {
    this.evalError = '';
    this.submitting = true;
    this.api.evaluate(this.answers).subscribe({
      next: (res) => {
        this.submitting = false;
        this.result = res;
        this.reviewMode = false;
        sessionStorage.setItem('d360_q_result', JSON.stringify({ result: res.code, city: this.answers.city, answers: this.answers }));
      },
      error: () => {
        this.submitting = false;
        this.evalError = 'No se pudo evaluar. Revisa la conexión e intenta de nuevo.';
      },
    });
  }

  startCase(): void {
    this.startError = '';
    this.starting = true;
    this.api.createCase(this.result!.code, this.answers.city, this.answers).subscribe({
      next: (c) => {
        this.starting = false;
        void this.router.navigate(['/checkout', c.id]);
      },
      error: () => {
        this.starting = false;
        this.startError = 'No se pudo crear el expediente. Intenta de nuevo.';
      },
    });
  }
}
