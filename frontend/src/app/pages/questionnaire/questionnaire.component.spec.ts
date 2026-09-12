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
