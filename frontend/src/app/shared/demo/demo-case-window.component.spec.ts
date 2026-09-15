import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  CASE_STATUS_HEADLINES,
  DemoCaseWindowComponent,
  caseStatusHeadline,
  padEstado,
} from './demo-case-window.component';

describe('padEstado / caseStatusHeadline', () => {
  it('rellena el estado a dos dígitos', () => {
    expect(padEstado(4)).toBe('04');
    expect(padEstado(1)).toBe('01');
  });

  it('usa titular de estado o el fallback', () => {
    expect(caseStatusHeadline(5, 'Firmar')).toBe('Minuta lista para firma');
    expect(caseStatusHeadline(99, 'Otro')).toBe('Otro');
    expect(CASE_STATUS_HEADLINES[1]).toBe('Cuestionario en curso');
  });
});

describe('DemoCaseWindowComponent', () => {
  let fixture: ComponentFixture<DemoCaseWindowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DemoCaseWindowComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(DemoCaseWindowComponent);
  });

  afterEach(() => fixture.destroy());

  it('muestra el producto sin “expediente de ejemplo”', () => {
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Divorcio360');
    expect(text).not.toContain('expediente de ejemplo');
  });

  it('anima el estado al pulsar un paso', () => {
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const buttons = root.querySelectorAll<HTMLButtonElement>('.demo-case-step');
    expect(buttons.length).toBe(6);

    buttons[4].click();
    fixture.detectChanges();

    expect(fixture.componentInstance.currentStep).toBe(5);
    expect(root.querySelector('.demo-case-status h3')?.textContent?.trim()).toBe(
      'Minuta lista para firma',
    );
    expect(buttons[4].classList.contains('is-on')).toBeTrue();
    expect(buttons[4].getAttribute('aria-current')).toBe('step');
  });
});
