import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { IconComponent } from '../../shared/icon.component';
import {
  getProductSite,
  ProductSiteConfig,
  QuestionField,
  setActiveProduct,
  getProductQuestionnairePath,
} from '../../shared/product-sites.data';

type Stage = 'questions' | 'review' | 'done';

@Component({
  selector: 'app-product-questionnaire',
  standalone: true,
  imports: [FormsModule, RouterLink, IconComponent],
  template: `
    @if (site) {
      <div class="landing-page product-flow" [class]="'theme-' + site.theme">
        <div class="ob">
          <header class="pq-top">
            <a [routerLink]="['/productos', site.slug]" class="btn btn-ghost btn-sm">
              <app-icon name="arrow-left" [size]="16" />
              {{ site.name }}
            </a>
            <p class="pq-eyebrow">Evaluar mi caso</p>
          </header>

          @if (stage === 'questions' && currentField) {
            <div class="ob-questions">
              <div class="ob-progress">
                <div class="ob-track" role="presentation">
                  <div class="ob-fill" [style.width.%]="progressPct"></div>
                </div>
                <p class="ob-step-label">Paso {{ stepLabel }} de {{ totalSteps }}</p>
              </div>

              <div class="ob-stage">
                <div class="ob-card-slot">
                  @for (f of [currentField]; track f.id) {
                    <section class="ob-card">
                <span class="ob-icon"><app-icon name="clipboard" [size]="22" /></span>
                <h1>{{ f.label }}</h1>

                @if (f.type === 'text') {
                  <div class="ob-field">
                    <input
                      [id]="f.id"
                      type="text"
                      [(ngModel)]="answers[f.id]"
                      [placeholder]="f.placeholder || ''"
                      (keyup.enter)="canContinue && next()"
                    />
                  </div>
                } @else if (f.type === 'boolean') {
                  <div class="ob-choices">
                    <button type="button" class="ob-choice" (click)="setBoolean(f.id, true)">
                      <span>Sí</span><app-icon name="chevron-right" [size]="17" />
                    </button>
                    <button type="button" class="ob-choice" (click)="setBoolean(f.id, false)">
                      <span>No</span><app-icon name="chevron-right" [size]="17" />
                    </button>
                  </div>
                } @else if (f.type === 'select') {
                  <div class="ob-field">
                    <select [(ngModel)]="answers[f.id]">
                      @for (opt of f.options; track opt.value) {
                        <option [value]="opt.value">{{ opt.label }}</option>
                      }
                    </select>
                  </div>
                  <button type="button" class="btn btn-primary btn-lg btn-block" [disabled]="!canContinue" (click)="next()">
                    Continuar
                  </button>
                }

                @if (f.type !== 'boolean' && f.type !== 'select') {
                  <button type="button" class="btn btn-primary btn-lg btn-block" [disabled]="!canContinue" (click)="next()">
                    Continuar
                  </button>
                }
                    </section>
                  }
                </div>

                <div class="ob-foot">
                  @if (fieldIndex > 0) {
                    <button type="button" class="btn btn-ghost btn-sm" (click)="prev()">
                      <app-icon name="arrow-left" [size]="16" /> Atrás
                    </button>
                  }
                </div>
              </div>
            </div>
          }

          @if (stage === 'review') {
            <section class="ob-card">
              <span class="ob-icon"><app-icon name="clipboard" [size]="22" /></span>
              <h1>Revisa tu información</h1>
              <p class="ob-hint">Confirma los datos antes de crear tu expediente de {{ site.name }}.</p>

              <ul class="ob-review">
                @for (field of site.questionnaire; track field.id) {
                  <li>
                    <button type="button" class="ob-review-row" (click)="editField(field.id)">
                      <span class="ob-review-label">{{ field.label }}</span>
                      <span class="ob-review-value">{{ formatAnswer(field) }}<app-icon name="pen" [size]="14" /></span>
                    </button>
                  </li>
                }
              </ul>

              <p class="pq-price">Honorario orientativo: <strong>\${{ site.price }}</strong> — pago único.</p>

              @if (auth.isLoggedIn) {
                <button type="button" class="btn btn-primary btn-lg btn-block" [disabled]="busy" (click)="start()">
                  @if (busy) { <span class="spinner" aria-hidden="true"></span> Creando expediente… }
                  @else { Crear mi expediente }
                </button>
              } @else {
                <a [routerLink]="['/auth']" [queryParams]="authParams" class="btn btn-primary btn-lg btn-block" (click)="saveDraft()">
                  Registrarme para continuar
                </a>
              }
            </section>
          }

          @if (stage === 'done') {
            <section class="ob-card">
              <span class="ob-icon"><app-icon name="check-circle" [size]="22" /></span>
              <h1>Expediente creado</h1>
              <p class="ob-hint">Continúa con el pago único para activar tu trámite de {{ site.name }}.</p>
              <a [routerLink]="['/checkout', caseId]" class="btn btn-primary btn-lg btn-block">
                Pagar \${{ site.price }}
              </a>
            </section>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    .pq-top {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: var(--space-2);
      margin-bottom: var(--space-4);
      width: 100%;
      max-width: 28rem;
      margin-inline: auto;
    }
    .pq-eyebrow {
      margin: 0;
      font-size: var(--text-xs);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: var(--tracking-wide);
      color: var(--text-muted);
    }
    .pq-price {
      margin: var(--space-4) 0;
      font-size: var(--text-sm);
      color: var(--text-secondary);
      text-align: center;
    }
  `],
})
export class ProductQuestionnaireComponent implements OnInit {
  site: ProductSiteConfig | null = null;
  answers: Record<string, unknown> = {};
  fieldIndex = 0;
  stage: Stage = 'questions';
  busy = false;
  caseId = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
    public auth: AuthService,
  ) {}

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug') || '';
    if (slug === 'divorcio360') {
      void this.router.navigateByUrl('/cuestionario');
      return;
    }
    this.site = getProductSite(slug);
    if (!this.site || !this.site.questionnaire.length) {
      void this.router.navigate(['/']);
      return;
    }
    setActiveProduct(this.site.id);
    this.initAnswers();
    this.restoreDraft();
  }

  get fields(): QuestionField[] {
    return this.site?.questionnaire ?? [];
  }

  get currentField(): QuestionField | null {
    return this.fields[this.fieldIndex] ?? null;
  }

  get totalSteps(): number {
    return this.fields.length + 1;
  }

  get stepLabel(): number {
    if (this.stage === 'review') return this.fields.length + 1;
    return this.fieldIndex + 1;
  }

  get progressPct(): number {
    return Math.round((this.stepLabel / this.totalSteps) * 100);
  }

  get canContinue(): boolean {
    const f = this.currentField;
    if (!f) return false;
    if (!f.required) return true;
    const v = this.answers[f.id];
    if (f.type === 'boolean') return v === true || v === false;
    return v !== undefined && v !== null && String(v).trim() !== '';
  }

  get authParams() {
    return {
      product: this.site?.id,
      returnUrl: getProductQuestionnairePath(this.site?.slug || ''),
      next: 'checkout',
    };
  }

  setBoolean(id: string, value: boolean): void {
    this.answers[id] = value;
    this.saveDraft();
    this.next();
  }

  next(): void {
    if (!this.canContinue) return;
    if (this.fieldIndex < this.fields.length - 1) {
      this.fieldIndex++;
    } else {
      this.stage = 'review';
    }
    this.saveDraft();
  }

  prev(): void {
    if (this.stage === 'review') {
      this.stage = 'questions';
      this.fieldIndex = this.fields.length - 1;
    } else if (this.fieldIndex > 0) {
      this.fieldIndex--;
    }
    this.saveDraft();
  }

  editField(id: string): void {
    const idx = this.fields.findIndex((f) => f.id === id);
    if (idx >= 0) {
      this.fieldIndex = idx;
      this.stage = 'questions';
      this.saveDraft();
    }
  }

  formatAnswer(field: QuestionField): string {
    const v = this.answers[field.id];
    if (field.type === 'boolean') return v ? 'Sí' : 'No';
    if (field.type === 'select') {
      return field.options?.find((o) => o.value === v)?.label || String(v ?? '—');
    }
    return String(v ?? '—');
  }

  start(): void {
    if (!this.site) return;
    this.busy = true;
    const city = String(this.answers['city'] || 'Quito');
    const q = { ...this.answers, product: this.site.id };
    this.api.createCase('apto', city, q, this.site.id).subscribe({
      next: (c) => {
        this.caseId = c.id;
        this.stage = 'done';
        this.busy = false;
        setActiveProduct(this.site!.id);
        sessionStorage.setItem('d360_q_result', JSON.stringify({ result: 'apto', city, answers: q, product: this.site!.id }));
      },
      error: () => { this.busy = false; },
    });
  }

  private initAnswers(): void {
    if (!this.site) return;
    for (const f of this.site.questionnaire) {
      if (f.type === 'boolean') this.answers[f.id] = true;
      else if (f.type === 'select' && f.options?.length) this.answers[f.id] = f.options[0].value;
      else this.answers[f.id] = '';
    }
  }

  saveDraft(): void {
    if (!this.site) return;
    sessionStorage.setItem(
      this.storageKey(),
      JSON.stringify({ answers: this.answers, fieldIndex: this.fieldIndex, stage: this.stage }),
    );
  }

  private storageKey(): string {
    return `ls_product_q_${this.site?.slug || ''}`;
  }

  private restoreDraft(): void {
    const raw = sessionStorage.getItem(this.storageKey());
    if (!raw) return;
    try {
      const p = JSON.parse(raw);
      if (p.answers) this.answers = { ...this.answers, ...p.answers };
      if (typeof p.fieldIndex === 'number') this.fieldIndex = p.fieldIndex;
      if (p.stage === 'review') this.stage = 'review';
    } catch { /* ignore */ }
  }
}
