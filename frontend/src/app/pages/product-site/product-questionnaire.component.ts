import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { ProductFlowShellComponent } from '../../shared/product-flow-shell.component';
import { getProductSite, ProductSiteConfig, QuestionField, setActiveProduct } from '../../shared/product-sites.data';

@Component({
  selector: 'app-product-questionnaire',
  standalone: true,
  imports: [FormsModule, RouterLink, ProductFlowShellComponent],
  template: `
    @if (site) {
      <app-product-flow-shell
        [theme]="site.theme"
        [crumb]="[{ label: 'LegalStation', link: '/' }, { label: site.name, link: '/productos/' + site.slug }, { label: 'Cuestionario' }]"
        eyebrow="Cuestionario · pago único"
        [title]="'Trámite ' + site.name"
        subtitle="Servicios jurídicos al mismo costo, sin filas ni trámites."
        [steps]="site.flowSteps"
        [activeStep]="0"
      >
        <div class="pq-layout">
          <aside class="pq-side lp-lift">
            <h3>Tu expediente</h3>
            <p class="pf-muted">Honorario único: <strong>\${{ site.price }}</strong></p>
            <p class="pf-muted">Sin membresía ni suscripción mensual.</p>
            <ul class="pq-docs">
              @for (d of site.docTypes; track d.type) {
                <li>{{ d.label }}</li>
              }
              <li>Consulta con abogado (virtual)</li>
              <li>Reunión notarial virtual</li>
            </ul>
            <div class="pq-progress">
              <div class="pq-progress-bar" [style.--p]="progressPct / 100"></div>
            </div>
            <p class="pf-muted">Paso {{ step }} de {{ totalSteps }}</p>
          </aside>

          <div class="pf-card lp-lift pq-main">
            @if (!done) {
              @if (step <= fieldGroups.length) {
                <h2>{{ groupTitle }}</h2>
                @for (field of currentFields; track field.id) {
                  <div class="pf-field">
                    <label>{{ field.label }}</label>
                    @if (field.type === 'text') {
                      <input [(ngModel)]="answers[field.id]" [placeholder]="field.placeholder || ''" />
                    } @else if (field.type === 'boolean') {
                      <select [(ngModel)]="answers[field.id]">
                        <option [ngValue]="true">Sí</option>
                        <option [ngValue]="false">No</option>
                      </select>
                    } @else if (field.type === 'select') {
                      <select [(ngModel)]="answers[field.id]">
                        @for (opt of field.options; track opt.value) {
                          <option [value]="opt.value">{{ opt.label }}</option>
                        }
                      </select>
                    }
                  </div>
                }
                <div class="pq-actions">
                  @if (step > 1) {
                    <button type="button" class="lp-btn lp-btn-outline" (click)="prev()">Atrás</button>
                  }
                  <button type="button" class="lp-btn lp-btn-primary" [disabled]="!canContinue" (click)="next()">
                    {{ step < fieldGroups.length ? 'Continuar' : 'Revisar' }}
                  </button>
                </div>
              } @else {
                <h2>Resumen del trámite</h2>
                <dl class="pq-review">
                  @for (field of site.questionnaire; track field.id) {
                    <dt>{{ field.label }}</dt>
                    <dd>{{ formatAnswer(field) }}</dd>
                  }
                </dl>
                <p class="pf-muted">Honorario demo: <strong>\${{ site.price }}</strong> — pago único al continuar.</p>
                @if (auth.isLoggedIn) {
                  <button type="button" class="lp-btn lp-btn-primary" (click)="start()" [disabled]="busy">
                    {{ busy ? 'Creando expediente…' : 'Iniciar trámite' }}
                  </button>
                } @else {
                  <a [routerLink]="['/auth']" [queryParams]="authParams" class="lp-btn lp-btn-primary" (click)="saveDraft()">Registrarme para continuar</a>
                }
                <button type="button" class="lp-btn lp-btn-outline" style="margin-left:0.5rem" (click)="prev()">Editar</button>
              }
            } @else {
              <p class="pf-ok">Expediente creado — continúa con el pago único.</p>
              <a [routerLink]="['/checkout', caseId]" class="lp-btn lp-btn-primary">Pagar \${{ site.price }} →</a>
            }
          </div>
        </div>
      </app-product-flow-shell>
    }
  `,
  styles: [`
    .pq-layout {
      display: grid;
      grid-template-columns: 260px 1fr;
      gap: 1.25rem;
      align-items: start;
    }

    .pq-side {
      padding: 1.25rem;
      border-radius: var(--lp-radius);
      background: white;
      border: 1px solid var(--lp-border);
    }

    .pq-side h3 { margin: 0 0 0.5rem; font-size: 1rem; }

    .pq-docs {
      margin: 1rem 0;
      padding-left: 1.1rem;
      font-size: 0.85rem;
      color: var(--lp-ink-muted);
      display: grid;
      gap: 0.35rem;
    }

    .pq-progress {
      height: 6px;
      background: var(--lp-border);
      border-radius: 999px;
      overflow: hidden;
      margin: 0.75rem 0 0.35rem;
    }

    .pq-progress-bar {
      height: 100%;
      width: 100%;
      transform: scaleX(var(--p, 0));
      transform-origin: left center;
      background: var(--lp-accent);
      transition: transform 0.2s ease;
    }

    .pq-actions {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
      margin-top: 1rem;
    }

    .pq-review {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.35rem 1rem;
      margin: 1rem 0;
    }

    .pq-review dt { font-weight: 600; font-size: 0.85rem; }
    .pq-review dd { margin: 0; color: var(--lp-ink-muted); font-size: 0.9rem; }

    @media (max-width: 800px) {
      .pq-layout { grid-template-columns: 1fr; }
      .pq-review { grid-template-columns: 1fr; }
    }
  `],
})
export class ProductQuestionnaireComponent implements OnInit {
  site: ProductSiteConfig | null = null;
  answers: Record<string, unknown> = {};
  step = 1;
  busy = false;
  done = false;
  caseId = 0;
  fieldGroups: QuestionField[][] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
    public auth: AuthService,
  ) {}

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug') || '';
    this.site = getProductSite(slug);
    if (!this.site) {
      void this.router.navigate(['/']);
      return;
    }
    setActiveProduct(this.site.id);
    this.initAnswers();
    this.restoreDraft();
    this.fieldGroups = this.buildGroups(this.site.questionnaire);
  }

  get totalSteps(): number {
    return this.fieldGroups.length + 1;
  }

  get progressPct(): number {
    return Math.round((this.step / this.totalSteps) * 100);
  }

  get currentFields(): QuestionField[] {
    return this.fieldGroups[this.step - 1] || [];
  }

  get groupTitle(): string {
    const titles = ['Datos del trámite', 'Partes y acuerdo', 'Preferencias'];
    return titles[this.step - 1] || 'Información';
  }

  get canContinue(): boolean {
    return this.currentFields.every((f) => {
      if (!f.required) return true;
      const v = this.answers[f.id];
      if (f.type === 'boolean') return v === true || v === false;
      return v !== undefined && v !== null && String(v).trim() !== '';
    });
  }

  get authParams() {
    return { product: this.site?.id, returnUrl: `/productos/${this.site?.slug}/cuestionario` };
  }

  next(): void {
    if (this.step < this.totalSteps) this.step++;
    this.saveDraft();
  }

  prev(): void {
    if (this.step > 1) this.step--;
    this.saveDraft();
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
        this.done = true;
        this.busy = false;
        setActiveProduct(this.site!.id);
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

  private buildGroups(fields: QuestionField[]): QuestionField[][] {
    const chunk = Math.ceil(fields.length / 3);
    const groups: QuestionField[][] = [];
    for (let i = 0; i < fields.length; i += chunk) {
      groups.push(fields.slice(i, i + chunk));
    }
    return groups.length ? groups : [fields];
  }

  saveDraft(): void {
    if (!this.site) return;
    sessionStorage.setItem(
      this.storageKey(),
      JSON.stringify({ answers: this.answers, step: this.step }),
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
      if (p.step) this.step = p.step;
    } catch { /* ignore */ }
  }
}
