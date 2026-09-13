import { AfterViewInit, Component, ElementRef, Input, OnDestroy } from '@angular/core';
import { LandingIconComponent, LandingIconName } from './landing-icon.component';

export interface StatItem {
  label: string;
  value: string;
  detail: string;
  trend?: string;
  icon?: LandingIconName;
}

@Component({
  selector: 'app-landing-statistics',
  standalone: true,
  imports: [LandingIconComponent],
  template: `
    <div
      class="ls-stats"
      [class.theme-divorcio]="theme === 'divorcio'"
      [class.ls-stats--band]="variant === 'band'"
      [class.ls-stats--4]="stats.length === 4"
    >
      @for (s of stats; track s.label; let i = $index) {
        <article class="ls-stat" [style.--i]="i">
          @if (s.icon && variant !== 'band') {
            <span class="ls-stat-icon"><app-landing-icon [name]="s.icon" [size]="20" /></span>
          }
          <span class="ls-value">{{ s.value }}</span>
          <h3>{{ s.label }}</h3>
          <p>{{ s.detail }}</p>
        </article>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }

    .ls-stats {
      --ls-accent: var(--lp-accent, var(--primary));
      --ls-accent-soft: var(--lp-accent-soft, var(--primary-subtle));
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 1rem;
    }

    .ls-stats--4 {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .ls-stats.theme-divorcio {
      --ls-accent: var(--lp-accent, var(--primary));
      --ls-accent-soft: var(--lp-accent-soft, var(--primary-subtle));
    }

    .ls-stat {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 1.35rem 1.25rem;
      box-shadow: var(--shadow-sm);
      display: grid;
      gap: 0.35rem;
    }

    .ls-stat-icon {
      width: 2.25rem;
      height: 2.25rem;
      border-radius: var(--radius-md);
      background: var(--ls-accent-soft);
      color: var(--ls-accent);
      display: grid;
      place-items: center;
      margin-bottom: 0.25rem;
    }

    .ls-value {
      font-family: var(--font-sans);
      font-size: clamp(2rem, 4vw, 3.15rem);
      font-weight: 750;
      letter-spacing: -0.04em;
      color: var(--text);
      line-height: 1;
      font-variant-numeric: tabular-nums;
    }

    .ls-stat h3 {
      margin: 0;
      font-family: var(--font-sans);
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--text);
    }

    .ls-stat p {
      margin: 0;
      font-size: 0.88rem;
      line-height: 1.55;
      color: var(--text-muted);
    }

    .ls-stats--band {
      gap: 0;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      overflow: hidden;
    }

    .ls-stats--band .ls-stat {
      background: transparent;
      border: 0;
      border-radius: 0;
      box-shadow: none;
      padding: 1.5rem 1.15rem;
      border-right: 1px solid var(--border);
      border-bottom: 1px solid var(--border);
    }

    .ls-stats--band .ls-stat:nth-child(3n) { border-right: 0; }
    .ls-stats--band .ls-stat:nth-last-child(-n+3) { border-bottom: 0; }

    .ls-stats--4.ls-stats--band .ls-stat:nth-child(3n) { border-right: 1px solid var(--border); }
    .ls-stats--4.ls-stats--band .ls-stat:nth-child(2n) { border-right: 0; }
    .ls-stats--4.ls-stats--band .ls-stat:nth-last-child(-n+3) { border-bottom: 1px solid var(--border); }
    .ls-stats--4.ls-stats--band .ls-stat:nth-last-child(-n+2) { border-bottom: 0; }

    .ls-stats--band .ls-stat-icon { display: none; }

    :host.is-in-view .ls-stat {
      animation: ls-stat-in var(--dur-cine) var(--ease-out) both;
      animation-delay: calc(var(--i, 0) * 60ms);
    }

    @keyframes ls-stat-in {
      from { opacity: 0.001; transform: translateY(16px); filter: blur(6px); }
      to { opacity: 1; transform: none; filter: blur(0); }
    }

    @media (max-width: 960px) {
      .ls-stats { grid-template-columns: 1fr 1fr; }
      .ls-stats--band .ls-stat:nth-child(3n) { border-right: 1px solid var(--border); }
      .ls-stats--band .ls-stat:nth-child(2n) { border-right: 0; }
      .ls-stats--band .ls-stat:nth-last-child(-n+3) { border-bottom: 1px solid var(--border); }
      .ls-stats--band .ls-stat:nth-last-child(-n+2) { border-bottom: 0; }
    }

    @media (max-width: 560px) {
      .ls-stats { grid-template-columns: 1fr; }
      .ls-stats--band .ls-stat {
        border-right: 0;
        border-bottom: 1px solid var(--border);
      }
      .ls-stats--band .ls-stat:last-child { border-bottom: 0; }
    }
  `],
})
export class LandingStatisticsComponent implements AfterViewInit, OnDestroy {
  @Input() theme: 'legalstation' | 'divorcio' = 'legalstation';
  @Input() variant: 'cards' | 'band' = 'cards';
  @Input() stats: StatItem[] = [];
  private io?: IntersectionObserver;

  constructor(private host: ElementRef<HTMLElement>) {}

  ngAfterViewInit(): void {
    this.io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        this.host.nativeElement.classList.add('is-in-view');
        this.io?.disconnect();
      },
      { threshold: 0.18 },
    );
    this.io.observe(this.host.nativeElement);
  }

  ngOnDestroy(): void {
    this.io?.disconnect();
  }
}
