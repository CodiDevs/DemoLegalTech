import { TestBed } from '@angular/core/testing';
import { LandingFaqComponent } from './landing-faq.component';

describe('LandingFaqComponent', () => {
  const items = [
    { question: 'Uno', answer: 'A' },
    { question: 'Dos', answer: 'B' },
    { question: 'Tres', answer: 'C' },
    { question: 'Cuatro', answer: 'D' },
  ];

  it('pinta marquee infinito con dos copias idénticas por fila', async () => {
    await TestBed.configureTestingModule({
      imports: [LandingFaqComponent],
    }).compileComponents();
    const fixture = TestBed.createComponent(LandingFaqComponent);
    fixture.componentInstance.items = items;
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('.faq-accordion')).toBeNull();
    const rows = root.querySelectorAll('.faq-row');
    expect(rows.length).toBe(3);

    for (const row of Array.from(rows)) {
      const sets = row.querySelectorAll('.faq-set');
      expect(sets.length).toBe(2);
      expect(sets[0].textContent).toBe(sets[1].textContent);
      expect(sets[1].getAttribute('aria-hidden')).toBe('true');
    }

    fixture.destroy();
  });
});
