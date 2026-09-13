import { Component, Input, OnDestroy, OnInit } from '@angular/core';

export interface LandingFaqItem {
  question: string;
  answer: string;
}

@Component({
  selector: 'app-landing-faq',
  standalone: true,
  template: `
    <div class="faq" [class.faq--marquee]="showMarquee">
      @if (showMarquee) {
        <div class="faq-scroller">
          @for (row of rows; track row.id) {
            <div
              class="faq-row"
              [class.faq-row--right]="row.direction === 'right'"
              [style.--dur]="row.duration"
            >
              <div class="faq-track">
                @for (item of row.items; track item.question + '-a') {
                  <article class="faq-card">
                    <h3>{{ item.question }}</h3>
                    <p>{{ item.answer }}</p>
                  </article>
                }
                @for (item of row.items; track item.question + '-b') {
                  <article class="faq-card" aria-hidden="true">
                    <h3>{{ item.question }}</h3>
                    <p>{{ item.answer }}</p>
                  </article>
                }
              </div>
            </div>
          }
        </div>
      } @else {
        <div class="faq-accordion">
          @for (item of items; track item.question; let i = $index) {
            <div class="faq-acc-item" [class.is-open]="openIndex === i">
              <button
                type="button"
                class="faq-acc-btn"
                [attr.aria-expanded]="openIndex === i"
                (click)="toggle(i)"
              >
                <span>{{ item.question }}</span>
                <span class="faq-acc-mark" aria-hidden="true">{{ openIndex === i ? '−' : '+' }}</span>
              </button>
              @if (openIndex === i) {
                <div class="faq-acc-panel">
                  <p>{{ item.answer }}</p>
                </div>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }

    .faq-scroller {
      display: grid;
      gap: 0.85rem;
      margin: 0 calc(-1 * clamp(1rem, 4vw, 1.5rem));
    }

    .faq-row {
      overflow: hidden;
      mask-image: linear-gradient(
        to right,
        transparent,
        #000 6%,
        #000 94%,
        transparent
      );
    }

    .faq-track {
      display: flex;
      gap: 0.85rem;
      width: max-content;
      animation: ls-faq-marquee var(--dur, 55s) linear infinite;
    }

    .faq-row--right .faq-track {
      animation-direction: reverse;
    }

    .faq-row:hover .faq-track {
      animation-play-state: paused;
    }

    .faq-card {
      flex: 0 0 min(18.5rem, 72vw);
      padding: 1.1rem 1.15rem;
      border-radius: var(--radius-lg);
      border: 1px solid var(--border);
      border-left: 3px solid var(--primary);
      background: var(--surface);
      box-shadow: var(--shadow-sm);
    }

    .faq-card h3 {
      margin: 0 0 0.45rem;
      font-family: var(--font-display);
      font-size: 0.98rem;
      font-weight: 600;
      letter-spacing: -0.02em;
      color: var(--text);
      line-height: 1.35;
    }

    .faq-card p {
      margin: 0;
      font-size: 0.88rem;
      line-height: 1.55;
      color: var(--text-secondary);
    }

    .faq-accordion {
      display: grid;
      gap: 0.5rem;
      max-width: 44rem;
    }

    .faq-acc-item {
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      background: var(--surface);
      overflow: hidden;
    }

    .faq-acc-btn {
      display: flex;
      width: 100%;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 1rem 1.15rem;
      border: 0;
      background: transparent;
      color: var(--text);
      font-family: var(--font-display);
      font-size: 1rem;
      font-weight: 600;
      text-align: left;
      cursor: pointer;
    }

    .faq-acc-btn:hover,
    .faq-acc-btn:focus-visible {
      background: var(--bg-muted);
      outline: none;
    }

    .faq-acc-mark {
      flex: none;
      color: var(--primary);
      font-size: 1.25rem;
      line-height: 1;
    }

    .faq-acc-panel {
      padding: 0 1.15rem 1.1rem;
    }

    .faq-acc-panel p {
      margin: 0;
      font-size: 0.95rem;
      line-height: 1.6;
      color: var(--text-secondary);
    }

    @keyframes ls-faq-marquee {
      from { transform: translateX(0); }
      to { transform: translateX(-50%); }
    }
  `],
})
export class LandingFaqComponent implements OnInit, OnDestroy {
  @Input({ required: true }) items: LandingFaqItem[] = [];

  showMarquee = true;
  openIndex: number | null = 0;

  rows: { id: string; direction: 'left' | 'right'; duration: string; items: LandingFaqItem[] }[] = [];

  private mqNarrow?: MediaQueryList;
  private onMq = () => this.syncMode();

  ngOnInit(): void {
    if (typeof matchMedia !== 'undefined') {
      this.mqNarrow = matchMedia('(max-width: 768px)');
      this.mqNarrow.addEventListener('change', this.onMq);
      this.syncMode();
    }

    const durations = ['52s', '64s', '58s'];
    const buckets: LandingFaqItem[][] = [[], [], []];
    this.items.forEach((item, i) => buckets[i % 3].push(item));
    this.rows = buckets
      .filter((b) => b.length > 0)
      .map((items, i) => ({
        id: `row-${i}`,
        direction: (i % 2 === 0 ? 'left' : 'right') as 'left' | 'right',
        duration: durations[i % durations.length],
        items,
      }));
  }

  ngOnDestroy(): void {
    this.mqNarrow?.removeEventListener('change', this.onMq);
  }

  syncMode(): void {
    const narrow = this.mqNarrow?.matches ?? false;
    this.showMarquee = !narrow;
  }

  toggle(i: number): void {
    this.openIndex = this.openIndex === i ? null : i;
  }
}
