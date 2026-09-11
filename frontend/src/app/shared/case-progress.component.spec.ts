import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CaseProgressComponent } from './case-progress.component';
import { CaseProgressStage } from './case-progress.model';

const STAGES: CaseProgressStage[] = [
  { id: '1', label: 'Uno', icon: 'clipboard', status: 'done', description: 'Primero' },
  { id: '2', label: 'Dos', icon: 'folder', status: 'current', description: 'Segundo' },
  { id: '3', label: 'Tres', icon: 'flag', status: 'upcoming', description: 'Tercero' },
];

describe('CaseProgressComponent', () => {
  let fixture: ComponentFixture<CaseProgressComponent>;
  let remove: jasmine.Spy;

  beforeEach(async () => {
    remove = jasmine.createSpy('removeEventListener');
    spyOn(window, 'matchMedia').and.returnValue({
      matches: false,
      media: '(max-width: 960px)',
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: jasmine.createSpy('addEventListener'),
      removeEventListener: remove,
      dispatchEvent: () => true,
    } as unknown as MediaQueryList);

    await TestBed.configureTestingModule({
      imports: [CaseProgressComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(CaseProgressComponent);
  });

  afterEach(() => {
    if (fixture && !fixture.componentRef.hostView.destroyed) fixture.destroy();
  });

  it('usa layout forzado y calcula el ratio', fakeAsync(() => {
    const cmp = fixture.componentInstance;
    cmp.stages = STAGES;
    cmp.layout = 'horizontal';
    cmp.variant = 'marketing';
    fixture.detectChanges();
    tick(40);
    expect(cmp.resolvedLayout).toBe('horizontal');
    expect(cmp.progressRatio).toBe(0.5);

    cmp.layout = 'vertical';
    cmp.ngOnChanges({ layout: { currentValue: 'vertical', previousValue: 'horizontal', firstChange: false, isFirstChange: () => false } });
    expect(cmp.resolvedLayout).toBe('vertical');
  }));

  it('emite selección y mueve el foco', () => {
    const cmp = fixture.componentInstance;
    cmp.stages = STAGES;
    cmp.interactive = true;
    cmp.layout = 'horizontal';
    const spy = jasmine.createSpy('select');
    cmp.stageSelect.subscribe(spy);
    fixture.detectChanges();
    cmp.selectStage(2);
    expect(cmp.focusedIndex).toBe(2);
    expect(spy).toHaveBeenCalledWith({ index: 2, stage: STAGES[2] });
  });

  it('limpia media query y timer al destruir', fakeAsync(() => {
    const cmp = fixture.componentInstance;
    cmp.stages = STAGES;
    fixture.detectChanges();
    tick(40);
    expect(cmp.ready).toBeTrue();
    fixture.destroy();
    expect(remove).toHaveBeenCalled();
  }));
});
