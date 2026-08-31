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
          <p class="legal muted">Evaluación orientativa — no constituye asesoría legal.</p>

          <div class="panel q-card">
            <div class="icon" aria-hidden="true">{{ current.icon }}</div>
            <p class="step muted">Pregunta {{ visibleIndex + 1 }} de {{ visibleQuestions.length }}</p>
            <h1>{{ current.text }}</h1>

            @if (current.key === 'city') {
              <div class="field">
                <label for="city">Ciudad</label>
                <input id="city" [(ngModel)]="answers.city" placeholder="Ej. Quito" />
              </div>
              <button class="btn btn-primary" type="button" [disabled]="!answers.city" (click)="nextCity()">Continuar</button>
            } @else {
              <div class="yesno">
                <button class="btn btn-primary" type="button" (click)="answer(true)">Sí</button>
                <button class="btn btn-ghost" type="button" (click)="answer(false)">No</button>
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
              <button class="btn btn-ghost" type="button" (click)="reviewMode = false">Editar</button>
              <button class="btn btn-primary" type="button" (click)="submit()">Confirmar y ver resultado</button>
            </div>
          </div>
        }

        @if (result) {
          <div class="panel result-card" [class]="result.code">
            <div class="result-icon" aria-hidden="true">{{ resultIcon }}</div>
            <p class="badge-demo">Resultado automático</p>
            <h1>{{ result.title }}</h1>
            <p class="message">{{ result.message }}</p>
            @if (result.price_usd > 0) {
              <p class="price">\${{ result.price_usd }} <span class="muted">· {{ result.product }}</span></p>
            }
            <p class="legal muted">Evaluación orientativa LegalStation — no sustituye consulta legal.</p>

            @if (result.code === 'apto') {
              <div class="actions stack-actions">
                @if (auth.isLoggedIn && auth.user()?.role === 'cliente') {
                  <button class="btn btn-primary" type="button" (click)="startCase()">{{ result.cta }}</button>
                } @else if (!auth.isLoggedIn) {
                  <a class="btn btn-primary" routerLink="/auth" [queryParams]="{next:'checkout', result: result.code, city: answers.city, product:'divorcio360', returnUrl:'/productos/divorcio360'}">Crear cuenta</a>
                  <a class="btn btn-ghost" routerLink="/auth" [queryParams]="{mode:'login', product:'divorcio360', returnUrl:'/productos/divorcio360'}">Ya tengo cuenta</a>
                }
              </div>
            } @else if (result.code === 'evaluacion') {
              <p class="muted">En la versión completa se agenda evaluación. Demo: flujo \$749+.</p>
              <div class="actions stack-actions">
                @if (auth.isLoggedIn && auth.user()?.role === 'cliente') {
                  <button class="btn btn-accent" type="button" (click)="startCase()">{{ result.cta }}</button>
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
    .icon { font-size: 2.5rem; margin-bottom: 0.75rem; }
    .q-card h1 { font-size: 1.45rem; margin-bottom: 1.25rem; }
    .yesno { display: flex; gap: 0.75rem; justify-content: center; margin-top: 1.25rem; }
    .review-list { list-style: none; padding: 0; text-align: left; margin: 1.25rem 0; }
    .review-list li {
      display: flex; justify-content: space-between; gap: 1rem;
      padding: 0.5rem 0; border-bottom: 1px solid var(--line); font-size: 0.92rem;
    }
    .review-list span { color: var(--ink-soft); }
    .result-card { text-align: center; padding: 2rem 1.5rem; animation: pop 0.45s ease both; }
    .result-icon { font-size: 3rem; margin-bottom: 0.5rem; }
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

  get resultIcon(): string {
    if (!this.result) return '';
    return { apto: '✅', evaluacion: '⚠️', no_aplica: '⛔' }[this.result.code] || '';
  }

  answer(val: boolean): void {
    (this.answers as any)[this.current.key] = val;
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
    this.api.evaluate(this.answers).subscribe((res) => {
      this.result = res;
      this.reviewMode = false;
      sessionStorage.setItem('d360_q_result', JSON.stringify({ result: res.code, city: this.answers.city, answers: this.answers }));
    });
  }

  startCase(): void {
    this.api.createCase(this.result!.code, this.answers.city, this.answers).subscribe((c) => {
      void this.router.navigate(['/checkout', c.id]);
    });
  }
}
