import { AfterViewChecked, AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService, QuestionnaireAnswers, QuestionnaireResult } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { IconComponent, IconName } from '../../shared/icon.component';
import { MeetingSchedulerComponent } from '../../shared/meeting-scheduler.component';
import { setActiveProduct } from '../../shared/product-sites.data';
import {
  DEFAULT_CITY,
  DEFAULT_COUNTRY_ID,
  DEFAULT_PROVINCE_ID,
  formatLocation,
  findCountry,
  findProvince,
  GEO_COUNTRIES,
  GeoProvince,
} from '../../shared/ecuador-locations.data';
import { Observable, Subscription } from 'rxjs';

type AnswerKey = keyof QuestionnaireAnswers;

interface Question {
  key: AnswerKey;
  text: string;
  /** Explicación en lenguaje llano de por qué se pregunta. */
  hint: string;
  icon: IconName;
  /** Resumen corto para la pantalla de revisión. */
  summary: string;
  showIf?: () => boolean;
}

@Component({
  selector: 'app-questionnaire',
  standalone: true,
  imports: [FormsModule, RouterLink, IconComponent, MeetingSchedulerComponent],
  template: `
    <div class="landing-page product-flow theme-divorcio">
      <div class="ob" [attr.data-stage]="stage" [attr.data-dir]="direction" [class.is-loading]="submitting">

        <!-- ============ Preguntas ============ -->
        @if (stage === 'questions') {
          <div class="ob-questions">
            <div class="ob-progress" role="group" [attr.aria-label]="'Paso ' + position + ' de ' + visibleQuestions.length">
              <div class="ob-segments">
                @for (q of visibleQuestions; track q.key; let i = $index) {
                  <button
                    type="button"
                    class="ob-seg"
                    [class.is-done]="i + 1 < position"
                    [class.is-current]="i + 1 === position"
                    [disabled]="i + 1 > position"
                    [attr.aria-label]="segLabel(i)"
                    [attr.title]="i + 1 < position ? 'Volver al paso ' + (i + 1) : null"
                    [attr.aria-current]="i + 1 === position ? 'step' : null"
                    (click)="goToStep(i)"
                  >
                    <span class="ob-seg-bar" aria-hidden="true"></span>
                  </button>
                }
              </div>
              <div class="ob-progress-meta">
                <p class="ob-step-label">Paso {{ position }} de {{ visibleQuestions.length }}</p>
                @if (canGoBack) {
                  <p class="ob-step-hint">Toca un paso anterior para volver</p>
                }
              </div>
            </div>

            <div class="ob-stage">
              <div class="ob-card-slot">
                <!-- Al hacer track por clave el nodo se recrea y la animación se reinicia -->
                @for (q of [current]; track q.key) {
                  <section class="ob-card" [class.ob-card--back]="direction === -1">
                <span class="ob-icon"><app-icon [name]="q.icon" [size]="22" /></span>

                <h1>{{ q.text }}</h1>
                <p class="ob-hint">{{ q.hint }}</p>

                @if (q.key === 'city') {
                  <div class="ob-location">
                    <div class="ob-field">
                      <label for="location-country">País</label>
                      <select
                        #locationCountrySelect
                        id="location-country"
                        name="location-country"
                        [(ngModel)]="answers.country"
                        (ngModelChange)="onCountryChange()"
                      >
                        @for (country of geoCountries; track country.id) {
                          <option [value]="country.id">{{ country.label }}</option>
                        }
                      </select>
                    </div>
                    <div class="ob-field">
                      <label for="location-province">Provincia</label>
                      <select
                        id="location-province"
                        name="location-province"
                        [(ngModel)]="answers.province"
                        (ngModelChange)="onProvinceChange()"
                      >
                        @for (province of provincesForCountry; track province.id) {
                          <option [value]="province.id">{{ province.label }}</option>
                        }
                      </select>
                    </div>
                    <div class="ob-field">
                      <label for="location-city">Ciudad</label>
                      <select
                        id="location-city"
                        name="location-city"
                        [(ngModel)]="answers.city"
                      >
                        @for (city of citiesForProvince; track city) {
                          <option [value]="city">{{ city }}</option>
                        }
                      </select>
                    </div>
                  </div>
                  <button
                    type="button"
                    class="btn btn-primary btn-lg btn-block"
                    [disabled]="!locationComplete"
                    (click)="submitCity()"
                  >Continuar</button>
                } @else {
                  <div class="ob-choices">
                    <button #firstChoice type="button" class="ob-choice" [class.is-selected]="isSelected(q.key, true)" (click)="answer(true)">
                      <span>Sí</span>
                      <app-icon name="chevron-right" [size]="17" />
                    </button>
                    <button type="button" class="ob-choice" [class.is-selected]="isSelected(q.key, false)" (click)="answer(false)">
                      <span>No</span>
                      <app-icon name="chevron-right" [size]="17" />
                    </button>
                  </div>
                }
              </section>
            }
              </div>

            <div class="ob-foot">
              @if (canGoBack) {
                <button type="button" class="btn btn-ghost btn-sm" (click)="back()">
                  <app-icon name="arrow-left" [size]="16" />
                  Atrás
                </button>
              } @else {
                <a routerLink="/productos/divorcio360" class="btn btn-ghost btn-sm">
                  <app-icon name="arrow-left" [size]="16" />
                  Salir
                </a>
              }
            </div>
            </div>
          </div>
        }

        <!-- ============ Revisión ============ -->
        @if (stage === 'review') {
          <section class="ob-card" [class.ob-card--back]="direction === -1">
            <span class="ob-icon"><app-icon name="clipboard" [size]="22" /></span>
            <h1>Revisa tus respuestas</h1>
            <p class="ob-hint">Toca cualquier respuesta si quieres cambiarla.</p>

            <ul class="ob-review">
              @for (row of reviewRows; track row.key) {
                <li>
                  <button type="button" class="ob-review-row" (click)="editAnswer(row.key)">
                    <span class="ob-review-label">{{ row.label }}</span>
                    <span class="ob-review-value">
                      {{ row.value }}
                      <app-icon name="pen" [size]="14" />
                    </span>
                  </button>
                </li>
              }
            </ul>

            @if (submitError) {
              <div class="ob-alert" role="alert">
                <app-icon name="alert-triangle" [size]="18" />
                <span>{{ submitError }}</span>
              </div>
            }

            <button
              type="button"
              class="btn btn-primary btn-lg btn-block"
              [disabled]="submitting"
              (click)="submit()"
            >
              @if (submitting) {
                <span class="spinner" aria-hidden="true"></span>
                <span>Comprobando</span>
              } @else {
                <span>Ver mi resultado</span>
              }
            </button>
          </section>

          <div class="ob-foot">
            <button type="button" class="btn btn-ghost btn-sm" (click)="backToQuestions()">
              <app-icon name="arrow-left" [size]="16" />
              Atrás
            </button>
          </div>
        }

        <!-- ============ Resultado ============ -->
        @if (stage === 'result' && result) {
          <section [class]="'ob-card is-' + result.code + (direction === -1 ? ' ob-card--back' : '')">
            <span class="ob-icon"><app-icon [name]="resultIcon" [size]="26" /></span>

            <h1>{{ result.title }}</h1>
            <p class="ob-message">{{ result.message }}</p>

            @if (result.price_usd > 0) {
              <div class="ob-price">
                <span class="ob-price-value">\${{ result.price_usd }}</span>
                <span class="ob-price-note">Pago único, todo incluido</span>
              </div>
            }

            @if (result.code === 'apto' || result.code === 'evaluacion') {
              <div class="ob-actions">
                @if (auth.isLoggedIn && auth.user()?.role === 'cliente') {
                  <button
                    type="button"
                    class="btn btn-primary btn-lg btn-block"
                    [disabled]="submitting"
                    (click)="startCase()"
                  >
                    @if (submitting) {
                      <span class="spinner" aria-hidden="true"></span>
                      <span>Preparando tu expediente</span>
                    } @else {
                      <span>{{ result.cta }}</span>
                    }
                  </button>
                } @else if (!auth.isLoggedIn) {
                  <a
                    class="btn btn-primary btn-lg btn-block"
                    routerLink="/auth"
                    [queryParams]="{ next: 'checkout', result: result.code, city: locationLabel, product: 'divorcio360' }"
                  >Continuar y crear mi cuenta</a>
                  <a
                    class="btn btn-secondary btn-block"
                    routerLink="/auth"
                    [queryParams]="{ mode: 'login', product: 'divorcio360' }"
                  >Ya tengo cuenta</a>
                }
              </div>

              @if (submitError) {
                <div class="ob-alert" role="alert">
                  <app-icon name="alert-triangle" [size]="18" />
                  <span>{{ submitError }}</span>
                </div>
              }
            } @else {
              <div class="ob-schedule-block">
                <h2>Agendar reunión con un abogado</h2>
                <p>
                  Tu caso necesita la vía judicial. Elige fecha y hora para una consulta virtual;
                  te enviaremos el enlace por correo.
                </p>
                <app-meeting-scheduler
                  #noAplicaScheduler
                  storageKey="ls_meeting_no_aplica"
                  confirmLabel="Confirmar reunión con abogado"
                  scheduledSubtitle="Consulta con abogado · vía judicial"
                  [requireLogin]="true"
                  authReturnUrl="/cuestionario?resume=result"
                  authProduct="divorcio360"
                  [saveFn]="noAplicaSaveFn"
                />
              </div>
              <div class="ob-actions">
                <a class="btn btn-ghost btn-block" routerLink="/productos/divorcio360">Volver a Divorcio360</a>
              </div>
            }

            <p class="ob-note is-centered">Evaluación orientativa. No sustituye una consulta legal.</p>
          </section>

          <div class="ob-foot">
            <button type="button" class="btn btn-ghost btn-sm" (click)="backToReview()">
              <app-icon name="arrow-left" [size]="16" />
              Atrás
            </button>
          </div>
        }
      </div>
    </div>
  `,
})
export class QuestionnaireComponent implements OnInit, AfterViewInit, AfterViewChecked, OnDestroy {
  @ViewChild('firstChoice') firstChoice?: ElementRef<HTMLButtonElement>;
  @ViewChild('locationCountrySelect') locationCountrySelect?: ElementRef<HTMLSelectElement>;
  @ViewChild('noAplicaScheduler') noAplicaScheduler?: MeetingSchedulerComponent;

  stage: 'questions' | 'review' | 'result' = 'questions';
  direction: 1 | -1 = 1;
  submitting = false;
  submitError = '';
  result: QuestionnaireResult | null = null;

  noAplicaSaveFn = (at: string): Observable<unknown> =>
    this.api.requestMeeting(at, 'divorcio360', 'no_aplica');

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
    country: DEFAULT_COUNTRY_ID,
    province: DEFAULT_PROVINCE_ID,
    city: DEFAULT_CITY,
  };

  readonly geoCountries = GEO_COUNTRIES;

  readonly all: Question[] = [
    {
      key: 'both_want_divorce',
      text: '¿Los dos quieren divorciarse?',
      hint: 'Si están de acuerdo, el trámite se resuelve en notaría y es mucho más rápido.',
      icon: 'users',
      summary: 'Ambos de acuerdo',
    },
    {
      key: 'marriage_in_ecuador',
      text: '¿Se casaron en Ecuador?',
      hint: 'Lo necesitamos para pedir el acta de matrimonio correcta.',
      icon: 'flag',
      summary: 'Matrimonio en Ecuador',
    },
    {
      key: 'someone_abroad',
      text: '¿Alguno de los dos vive fuera del país?',
      hint: 'Se puede firmar igual desde el extranjero, solo cambian algunos pasos.',
      icon: 'plane',
      summary: 'Alguien vive fuera',
    },
    {
      key: 'have_children',
      text: '¿Tienen hijos en común?',
      hint: 'De esto depende qué documentos hacen falta.',
      icon: 'baby',
      summary: 'Tienen hijos',
    },
    {
      key: 'minor_dependents',
      text: '¿Alguno es menor de edad o depende de ustedes?',
      hint: 'Cuenta cualquier hijo menor de 18 años o que dependa económicamente de ustedes.',
      icon: 'calendar',
      summary: 'Hijos menores o dependientes',
      showIf: () => this.answers.have_children,
    },
    {
      key: 'custody_regulated',
      text: '¿Ya acordaron manutención, con quién viven y las visitas?',
      hint: 'Es decir, si ya está definido cuánto se paga, dónde viven y cada cuánto se visitan.',
      icon: 'scale',
      summary: 'Manutención y visitas acordadas',
      showIf: () => this.answers.have_children && this.answers.minor_dependents,
    },
    {
      key: 'has_mediation_acta',
      text: '¿Tienen ese acuerdo por escrito y firmado?',
      hint: 'Un acta de mediación o una resolución de un juez donde consta lo acordado.',
      icon: 'file-text',
      summary: 'Acuerdo por escrito',
      showIf: () => this.answers.have_children && this.answers.minor_dependents,
    },
    {
      key: 'have_assets',
      text: '¿Compraron bienes mientras estuvieron casados?',
      hint: 'Casas, terrenos, vehículos o cuentas que consiguieron durante el matrimonio.',
      icon: 'home',
      summary: 'Bienes en el matrimonio',
    },
    {
      key: 'conjugal_society',
      text: '¿Sus bienes están en sociedad conyugal?',
      hint: 'Es lo habitual en Ecuador, salvo que firmaran separación de bienes ante notario.',
      icon: 'chart',
      summary: 'Sociedad conyugal',
      showIf: () => this.answers.have_assets,
    },
    {
      key: 'want_liquidate_assets',
      text: '¿Quieren repartir los bienes ahora?',
      hint: 'También pueden divorciarse primero y repartir más adelante.',
      icon: 'briefcase',
      summary: 'Repartir bienes ahora',
      showIf: () => this.answers.have_assets,
    },
    {
      key: 'ids_valid',
      text: '¿Los dos tienen la cédula o el pasaporte vigente?',
      hint: 'Sin documentos vigentes la notaría no puede firmar.',
      icon: 'id-card',
      summary: 'Documentos vigentes',
    },
    {
      key: 'city',
      text: '¿Dónde están ubicados?',
      hint: 'Indica país, provincia y ciudad donde realizan el trámite.',
      icon: 'map-pin',
      summary: 'Ubicación',
    },
  ];

  /** Índice en `all` de la pregunta actual. */
  private cursor = 0;
  /** Preguntas ya contestadas, para volver atrás en el orden real recorrido. */
  private trail: number[] = [];
  private answered = new Set<AnswerKey>();
  private restoreTimer?: ReturnType<typeof setTimeout>;
  private restoreSub?: Subscription;
  private pendingFocus = false;
  private destroyed = false;

  constructor(
    private api: ApiService,
    public auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    setActiveProduct('divorcio360');
    this.normalizeLocation();
    if (this.route.snapshot.queryParamMap.get('resume') === 'result') {
      this.restoreResult();
    }
  }

  private restoreResult(): void {
    const cached = sessionStorage.getItem('d360_q_result');
    if (!cached) return;
    try {
      const p = JSON.parse(cached);
      if (p.answers) {
        this.answers = { ...this.answers, ...p.answers };
        this.normalizeLocation();
      }
      this.restoreSub = this.api.evaluate(this.answers).subscribe({
        next: (res) => {
          if (this.destroyed) return;
          this.result = res;
          this.stage = 'result';
          this.restoreTimer = setTimeout(() => {
            if (this.destroyed) return;
            this.tryPendingMeeting();
          }, 0);
        },
      });
    } catch { /* ignore */ }
  }

  ngAfterViewInit(): void {
    if (this.stage === 'result') this.tryPendingMeeting();
  }

  ngAfterViewChecked(): void {
    if (!this.pendingFocus) return;
    this.pendingFocus = false;
    const el = this.current.key === 'city'
      ? this.locationCountrySelect?.nativeElement
      : this.firstChoice?.nativeElement;
    el?.focus();
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.restoreSub?.unsubscribe();
    if (this.restoreTimer !== undefined) clearTimeout(this.restoreTimer);
  }

  private tryPendingMeeting(): void {
    this.noAplicaScheduler?.tryPendingSave((at) => this.api.requestMeeting(at, 'divorcio360', 'no_aplica'));
  }

  get visibleQuestions(): Question[] {
    return this.all.filter((q) => !q.showIf || q.showIf());
  }

  get current(): Question {
    return this.all[this.cursor];
  }

  get position(): number {
    return this.visibleQuestions.findIndex((q) => q.key === this.current.key) + 1;
  }

  get progressPercent(): number {
    const total = this.visibleQuestions.length;
    if (!total) return 0;
    return Math.round(((this.position - 1) / total) * 100);
  }

  segLabel(visibleIndex: number): string {
    const n = visibleIndex + 1;
    if (n < this.position) return `Paso ${n}: volver`;
    if (n === this.position) return `Paso ${n}: actual`;
    return `Paso ${n}`;
  }

  /** Solo pasos ya respondidos (anteriores al actual). */
  goToStep(visibleIndex: number): void {
    if (visibleIndex < 0 || visibleIndex >= this.position - 1) return;
    const q = this.visibleQuestions[visibleIndex];
    if (!q) return;
    this.editAnswer(q.key);
  }

  get canGoBack(): boolean {
    return this.trail.length > 0;
  }

  get reviewRows(): { key: AnswerKey; label: string; value: string }[] {
    return this.visibleQuestions.map((q) => ({
      key: q.key,
      label: q.summary,
      value: q.key === 'city'
        ? (this.locationLabel || 'Sin indicar')
        : ((this.answers as any)[q.key] ? 'Sí' : 'No'),
    }));
  }

  get resultIcon(): IconName {
    if (!this.result) return 'info';
    if (this.result.code === 'apto') return 'check-circle';
    if (this.result.code === 'evaluacion') return 'alert-triangle';
    return 'x-circle';
  }

  /* ---------- Navegación entre pasos ---------- */

  answer(value: boolean): void {
    (this.answers as any)[this.current.key] = value;
    this.answered.add(this.current.key);
    this.goForward();
  }

  get provincesForCountry(): GeoProvince[] {
    return findCountry(this.answers.country)?.provinces ?? [];
  }

  get citiesForProvince(): string[] {
    return findProvince(this.answers.country, this.answers.province)?.cities ?? [];
  }

  get locationComplete(): boolean {
    return Boolean(
      this.answers.country &&
      this.answers.province &&
      this.answers.city.trim(),
    );
  }

  get locationLabel(): string {
    return formatLocation(this.answers.country, this.answers.province, this.answers.city);
  }

  onCountryChange(): void {
    const provinces = this.provincesForCountry;
    const province = provinces[0];
    this.answers.province = province?.id ?? '';
    this.answers.city = province?.cities[0] ?? '';
  }

  onProvinceChange(): void {
    const cities = this.citiesForProvince;
    this.answers.city = cities[0] ?? '';
  }

  private normalizeLocation(): void {
    if (!findCountry(this.answers.country)) {
      this.answers.country = DEFAULT_COUNTRY_ID;
    }
    if (!findProvince(this.answers.country, this.answers.province)) {
      const province = findCountry(this.answers.country)?.provinces[0];
      this.answers.province = province?.id ?? DEFAULT_PROVINCE_ID;
    }
    if (!this.citiesForProvince.includes(this.answers.city)) {
      this.answers.city = this.citiesForProvince[0] ?? DEFAULT_CITY;
    }
  }

  submitCity(): void {
    if (!this.locationComplete) return;
    this.answers.city = this.answers.city.trim();
    this.answered.add('city');
    this.goForward();
  }

  private goForward(): void {
    const next = this.nextVisibleAfter(this.cursor);
    this.direction = 1;

    if (next === -1) {
      this.stage = 'review';
      return;
    }

    this.trail.push(this.cursor);
    this.cursor = next;
    this.pendingFocus = true;
  }

  back(): void {
    const previous = this.trail.pop();
    if (previous === undefined) return;
    this.direction = -1;
    this.cursor = previous;
    this.pendingFocus = true;
  }

  backToQuestions(): void {
    this.direction = -1;
    this.stage = 'questions';
    this.pendingFocus = true;
  }

  backToReview(): void {
    this.direction = -1;
    this.stage = 'review';
  }

  /** Vuelve a una pregunta concreta desde la pantalla de revisión. */
  editAnswer(key: AnswerKey): void {
    const index = this.all.findIndex((q) => q.key === key);
    if (index === -1) return;

    const visiblePos = this.visibleQuestions.findIndex((q) => q.key === key);
    this.trail = this.visibleQuestions
      .slice(0, visiblePos)
      .map((q) => this.all.findIndex((item) => item.key === q.key));

    this.cursor = index;
    this.direction = -1;
    this.stage = 'questions';
    this.pendingFocus = true;
  }

  isSelected(key: AnswerKey, value: boolean): boolean {
    return this.answered.has(key) && this.answers[key] === value;
  }

  /** Primera pregunta visible después de `from`, o -1 si no queda ninguna. */
  private nextVisibleAfter(from: number): number {
    for (let i = from + 1; i < this.all.length; i++) {
      const q = this.all[i];
      if (!q.showIf || q.showIf()) return i;
    }
    return -1;
  }

  /* ---------- Envío ---------- */

  submit(): void {
    if (this.submitting) return;
    this.submitting = true;
    this.submitError = '';

    this.api.evaluate(this.answers).subscribe({
      next: (res) => {
        if (this.destroyed) return;
        this.submitting = false;
        this.result = res;
        this.stage = 'result';
        this.direction = 1;
        sessionStorage.setItem('d360_q_result', JSON.stringify({
          result: res.code,
          city: this.locationLabel,
          answers: this.answers,
        }));
      },
      error: () => {
        if (this.destroyed) return;
        this.submitting = false;
        this.submitError = 'No pudimos calcular tu resultado. Revisa tu conexión e inténtalo de nuevo.';
      },
    });
  }

  startCase(): void {
    if (!this.result || this.submitting) return;
    this.submitting = true;
    this.submitError = '';

    this.api.createCase(this.result.code, this.locationLabel, this.answers).subscribe({
      next: (c) => void this.router.navigate(['/checkout', c.id]),
      error: () => {
        this.submitting = false;
        this.submitError = 'No pudimos crear tu expediente. Inténtalo de nuevo en unos segundos.';
      },
    });
  }
}
