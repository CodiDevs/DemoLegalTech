import { signal } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { ApiService, QuestionnaireResult } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { QuestionnaireComponent } from './questionnaire.component';

const APTO: QuestionnaireResult = {
  code: 'apto',
  title: 'Puedes continuar',
  message: 'Encaja en mutuo acuerdo.',
  cta: 'Abrir expediente',
  price_usd: 349,
  product: 'divorcio360',
};

describe('QuestionnaireComponent', () => {
  let fixture: ComponentFixture<QuestionnaireComponent>;
  let api: { evaluate: jasmine.Spy; createCase: jasmine.Spy; requestMeeting: jasmine.Spy };
  let router: Router;
  let resume: string | null = null;

  beforeEach(async () => {
    resume = null;
    api = {
      evaluate: jasmine.createSpy('evaluate').and.returnValue(of(APTO)),
      createCase: jasmine.createSpy('createCase').and.returnValue(of({ id: 42 })),
      requestMeeting: jasmine.createSpy('requestMeeting').and.returnValue(of({})),
    };
    await TestBed.configureTestingModule({
      imports: [QuestionnaireComponent],
      providers: [
        provideRouter([{ path: 'checkout/:id', component: QuestionnaireComponent }]),
        { provide: ApiService, useValue: api },
        {
          provide: AuthService,
          useValue: { isLoggedIn: true, user: signal({ id: 1, email: 'c@x', full_name: 'C', phone: '', role: 'cliente' }) },
        },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: { get: (key: string) => (key === 'resume' ? resume : null) } } },
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(QuestionnaireComponent);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    if (fixture && !fixture.componentRef.hostView.destroyed) fixture.destroy();
    sessionStorage.removeItem('d360_q_result');
  });

  function cmp(): QuestionnaireComponent {
    return fixture.componentInstance;
  }

  it('no pone un lede bajo la pregunta', () => {
    fixture.detectChanges();
    const sheet = (fixture.nativeElement as HTMLElement).querySelector('.ob-sheet');
    expect(sheet?.querySelector('h1')?.textContent).toContain('¿Los dos quieren divorciarse?');
    expect(sheet?.querySelector('.ob-hint')).toBeNull();
  });

  it('enseña que un paso hecho vuelve al clic en la barra', () => {
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.textContent).not.toContain('Clic en un paso hecho para volver');
    expect(root.querySelector('.ob-seg-hit')).toBeNull();

    cmp().answer(true);
    fixture.detectChanges();
    expect(cmp().current.key).toBe('marriage_in_ecuador');
    expect(root.textContent).toContain('Clic en un paso hecho para volver');
    const hit = root.querySelector('.ob-seg-hit') as HTMLButtonElement | null;
    expect(hit).not.toBeNull();
    hit?.click();
    fixture.detectChanges();
    expect(cmp().current.key).toBe('both_want_divorce');
  });

  it('muestra preguntas condicionales solo cuando aplican', () => {
    fixture.detectChanges();
    expect(cmp().visibleQuestions.some((q) => q.key === 'minor_dependents')).toBeFalse();
    cmp().answer(false);
    cmp().answer(false);
    cmp().answer(false);
    cmp().answer(true);
    expect(cmp().current.key).toBe('minor_dependents');
    expect(cmp().visibleQuestions.some((q) => q.key === 'minor_dependents')).toBeTrue();
  });

  it('conserva respuestas al volver y marca dirección atrás', () => {
    fixture.detectChanges();
    cmp().answer(true);
    expect(cmp().direction).toBe(1);
    cmp().back();
    expect(cmp().direction).toBe(-1);
    expect(cmp().current.key).toBe('both_want_divorce');
    fixture.detectChanges();
    const selected = (fixture.nativeElement as HTMLElement).querySelector('.ob-choice.is-selected');
    expect(selected?.textContent).toContain('Sí');
  });

  it('permite editar desde revisión y evita doble submit', () => {
    fixture.detectChanges();
    while (cmp().stage === 'questions') {
      if (cmp().current.key === 'city') cmp().submitCity();
      else cmp().answer(false);
    }
    expect(cmp().stage).toBe('review');
    cmp().editAnswer('both_want_divorce');
    expect(cmp().stage).toBe('questions');
    expect(cmp().current.key).toBe('both_want_divorce');
    expect(cmp().direction).toBe(-1);

    while (cmp().stage === 'questions') {
      if (cmp().current.key === 'city') cmp().submitCity();
      else cmp().answer(false);
    }

    const pending = new Subject<QuestionnaireResult>();
    api.evaluate.and.returnValue(pending);
    cmp().submit();
    cmp().submit();
    expect(api.evaluate).toHaveBeenCalledTimes(1);
    pending.next(APTO);
    pending.complete();
    expect(cmp().stage).toBe('result');
  });

  it('recupera error de evaluación y navega a checkout', () => {
    fixture.detectChanges();
    api.evaluate.and.returnValue(throwError(() => ({ error: { error: 'fail' } })));
    while (cmp().stage === 'questions') {
      if (cmp().current.key === 'city') cmp().submitCity();
      else cmp().answer(false);
    }
    cmp().submit();
    expect(cmp().submitError).toContain('No pudimos calcular');
    expect(cmp().stage).toBe('review');
    expect(cmp().submitting).toBeFalse();

    api.evaluate.and.returnValue(of(APTO));
    cmp().submit();
    expect(cmp().stage).toBe('result');

    const nav = spyOn(router, 'navigate');
    cmp().startCase();
    expect(nav).toHaveBeenCalledWith(['/checkout', 42]);
  });

  it('cancela restoreResult si el HTTP llega después de destroy', fakeAsync(() => {
    resume = 'result';
    sessionStorage.setItem('d360_q_result', JSON.stringify({ answers: { both_want_divorce: true } }));
    const pending = new Subject<QuestionnaireResult>();
    api.evaluate.and.returnValue(pending);
    const local = TestBed.createComponent(QuestionnaireComponent);
    local.detectChanges();
    local.destroy();
    pending.next(APTO);
    pending.complete();
    tick(20);
    expect(api.requestMeeting).not.toHaveBeenCalled();
  }));

  it('mueve el foco al control de la nueva pregunta', () => {
    fixture.detectChanges();
    cmp().answer(false);
    fixture.detectChanges();
    const active = document.activeElement as HTMLElement | null;
    expect(active?.classList.contains('ob-choice')).toBeTrue();
  });
});

describe('QuestionnaireComponent guest result', () => {
  let fixture: ComponentFixture<QuestionnaireComponent>;
  let api: { evaluate: jasmine.Spy; createCase: jasmine.Spy; requestMeeting: jasmine.Spy };

  beforeEach(async () => {
    api = {
      evaluate: jasmine.createSpy('evaluate').and.returnValue(of(APTO)),
      createCase: jasmine.createSpy('createCase').and.returnValue(of({ id: 42 })),
      requestMeeting: jasmine.createSpy('requestMeeting').and.returnValue(of({})),
    };
    await TestBed.configureTestingModule({
      imports: [QuestionnaireComponent],
      providers: [
        provideRouter([{ path: 'auth', component: QuestionnaireComponent }]),
        { provide: ApiService, useValue: api },
        { provide: AuthService, useValue: { isLoggedIn: false, user: signal(null) } },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: { get: () => null } } },
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(QuestionnaireComponent);
  });

  afterEach(() => {
    if (fixture && !fixture.componentRef.hostView.destroyed) fixture.destroy();
  });

  it('pide cuenta para pagar y no crea expediente', () => {
    const cmp = fixture.componentInstance;
    cmp.result = APTO;
    cmp.stage = 'result';
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.textContent).toContain('Crear cuenta para pagar');
    expect(root.textContent).toContain('Ya tengo cuenta');
    const href = root.querySelector('a.btn-primary')?.getAttribute('href') || '';
    expect(href).toContain('/auth');
    expect(href).toContain('next=checkout');
    expect(api.createCase).not.toHaveBeenCalled();
  });
});
