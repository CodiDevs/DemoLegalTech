import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ColophonComponent } from './colophon.component';

describe('ColophonComponent', () => {
  let fixture: ComponentFixture<ColophonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ColophonComponent],
      providers: [provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(ColophonComponent);
  });

  afterEach(() => fixture.destroy());

  it('marketing: wordmark, CodiDevs en Fraunces y aviso en minúsculas', () => {
    fixture.componentInstance.density = 'marketing';
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.textContent).toContain('LegalStation');
    expect(root.textContent).toContain('Hecho por');
    expect(root.textContent).toContain('CodiDevs');
    expect(root.textContent).toContain('Casos de ejemplo. No es un trámite real.');
    expect(root.textContent).not.toMatch(/ESTO ES UNA DEMO/);
    expect(root.querySelector('.colophon-brand')).not.toBeNull();
  });

  it('folio y despacho: una línea, sin aviso de marketing', () => {
    fixture.componentInstance.density = 'folio';
    fixture.detectChanges();
    let root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('.colophon--folio')).not.toBeNull();
    expect(root.textContent).toContain('Hecho por');
    expect(root.textContent).toContain('CodiDevs');
    expect(root.textContent).not.toContain('Casos de ejemplo');

    fixture.componentInstance.density = 'despacho';
    fixture.detectChanges();
    root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('.colophon--despacho')).not.toBeNull();
    expect(root.textContent).toContain('CodiDevs');
  });
});
