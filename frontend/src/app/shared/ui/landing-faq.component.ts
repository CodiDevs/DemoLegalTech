import { Component, Input, OnChanges, OnInit } from '@angular/core';

export interface LandingFaqItem {
  question: string;
  answer: string;
}

@Component({
  selector: 'app-landing-faq',
  standalone: true,
  template: `
    <div class="faq faq--marquee">
      <div class="faq-scroller">
        @for (row of rows; track row.id) {
          <div
            class="faq-row"
            [class.faq-row--right]="row.direction === 'right'"
            [style.--dur]="row.duration"
          >
            <div class="faq-track">
              <div class="faq-set">
                @for (item of row.items; track $index) {
                  <article class="faq-card">
                    <h3>{{ item.question }}</h3>
                    <p>{{ item.answer }}</p>
                  </article>
                }
              </div>
              <div class="faq-set" aria-hidden="true">
                @for (item of row.items; track $index) {
                  <article class="faq-card">
                    <h3>{{ item.question }}</h3>
                    <p>{{ item.answer }}</p>
                  </article>
                }
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .faq-scroller {
      display: grid;
      gap: 0.85rem;
      margin: 0 calc(-1 * clamp(1rem, 4vw, 2rem));
    }

    .faq-row {
      overflow: hidden;
      isolation: isolate;
      mask-image: linear-gradient(
        to right,
        transparent,
        #000 5%,
        #000 95%,
        transparent
      );
    }

    .faq-track {
      display: flex;
      width: max-content;
      animation: ls-faq-marquee var(--dur, 55s) linear infinite;
    }

    .faq-row--right .faq-track {
      animation-direction: reverse;
    }

    .faq-row:hover .faq-track {
      animation-play-state: paused;
    }

    .faq-set {
      display: flex;
      flex: none;
      gap: 0.85rem;
      padding-right: 0.85rem;
    }

    .faq-card {
      flex: 0 0 18.5rem;
      box-sizing: border-box;
      padding: 1.1rem 1.15rem;
      border-radius: var(--radius-lg);
      border: 1px solid var(--border);
      border-left: 3px solid var(--primary);
      background: var(--surface);
      box-shadow: var(--shadow-sm);
    }

    .faq-card h3 {
      margin: 0 0 0.45rem;
      font-family: var(--font-sans);
      font-size: 0.98rem;
      font-weight: 650;
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

    @media (max-width: 420px) {
      .faq-card {
        flex-basis: min(18.5rem, calc(100vw - 3rem));
      }
    }

    @keyframes ls-faq-marquee {
      from { transform: translate3d(0, 0, 0); }
      to { transform: translate3d(-50%, 0, 0); }
    }
  `],
})
export class LandingFaqComponent implements OnInit, OnChanges {
  @Input({ required: true }) items: LandingFaqItem[] = [];

  rows: { id: string; direction: 'left' | 'right'; duration: string; items: LandingFaqItem[] }[] = [];

  ngOnInit(): void {
    this.rows = this.buildRows();
  }

  ngOnChanges(): void {
    this.rows = this.buildRows();
  }

  private buildRows() {
    const durations = ['52s', '64s', '58s'];
    const buckets: LandingFaqItem[][] = [[], [], []];
    this.items.forEach((item, i) => buckets[i % 3].push(item));
    return buckets
      .filter((b) => b.length > 0)
      .map((items, i) => ({
        id: `row-${i}`,
        direction: (i % 2 === 0 ? 'left' : 'right') as 'left' | 'right',
        duration: durations[i % durations.length],
        items,
      }));
  }
}

