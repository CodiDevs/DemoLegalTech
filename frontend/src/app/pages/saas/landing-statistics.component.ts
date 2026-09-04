import { Component, Input } from '@angular/core';
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
    <div class="ls-stats" [class.theme-divorcio]="theme === 'divorcio'">
      @for (s of stats; track s.label) {
        <article class="ls-stat">
          @if (s.icon) {
            <span class="ls-stat-icon"><app-landing-icon [name]="s.icon" [size]="20" /></span>
          }
          <div class="ls-stat-top">
            <span class="ls-value">{{ s.value }}</span>
            @if (s.trend) { <span class="ls-trend">{{ s.trend }}</span> }
          </div>
          <h3>{{ s.label }}</h3>
          <p>{{ s.detail }}</p>
        </article>
      }
    </div>
  `,
  styles: [`
    .ls-stats {
      --ls-accent: var(--lp-accent, #4455c4);
      --ls-accent-soft: var(--lp-accent-soft, #eef0fb);
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 1rem;
    }

    .ls-stats.theme-divorcio {
      --ls-accent: var(--lp-accent, #4a9e96);
      --ls-accent-soft: var(--lp-accent-soft, #e8f6f4);
    }

    .ls-stat {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 1rem;
      padding: 1.35rem 1.25rem;
      box-shadow: 0 8px 28px rgb(27 25 23 / 0.06);
      display: grid;
      gap: 0.35rem;
    }

    .ls-stat-icon {
      width: 2.25rem;
      height: 2.25rem;
      border-radius: 999px;
      background: var(--ls-accent-soft);
      color: var(--ls-accent);
      display: grid;
      place-items: center;
      margin-bottom: 0.25rem;
    }

    .ls-stat-top {
      display: flex;
      align-items: baseline;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .ls-value {
      font-size: clamp(1.75rem, 3vw, 2.25rem);
      font-weight: 800;
      letter-spacing: -0.03em;
      color: var(--text);
      line-height: 1;
    }

    .ls-trend {
      font-size: 0.78rem;
      font-weight: 700;
      color: var(--success);
      background: var(--success-subtle);
      padding: 0.2rem 0.45rem;
      border-radius: 999px;
    }

    .ls-stat h3 {
      margin: 0;
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

    @media (max-width: 960px) {
      .ls-stats { grid-template-columns: 1fr 1fr; }
    }

    @media (max-width: 560px) {
      .ls-stats { grid-template-columns: 1fr; }
    }
  `],
})
export class LandingStatisticsComponent {
  @Input() theme: 'legalstation' | 'divorcio' = 'legalstation';
  @Input() stats: StatItem[] = [];
}
