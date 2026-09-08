import { Component, Input, OnInit } from '@angular/core';

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  src: string;
  alt: string;
}

@Component({
  selector: 'app-elastic-gallery',
  standalone: true,
  template: `
    <div class="eg" [class.theme-divorcio]="theme === 'divorcio'">
      <div class="eg-track">
        @for (item of items; track item.id) {
          <button
            type="button"
            class="eg-panel"
            [class.active]="activeId === item.id"
            (focus)="activeId = item.id"
            (click)="activeId = item.id"
          >
            <img [src]="item.src" [alt]="item.alt" loading="lazy" />
            <div class="eg-scrim"></div>
            <div class="eg-copy">
              <span class="eg-tag">{{ item.category }}</span>
              <h3>{{ item.title }}</h3>
            </div>
          </button>
        }
      </div>
    </div>
  `,
  styles: [`
    .eg {
      --eg-accent: var(--lp-accent, #4455c4);
      width: 100%;
      max-width: 100%;
      padding: 0.5rem 0 1rem;
    }

    .eg.theme-divorcio { --eg-accent: var(--lp-accent, #4a9e96); }

    .eg-track {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      max-width: min(72rem, 100%);
      margin: 0 auto;
    }

    .eg-panel {
      position: relative;
      flex: none;
      height: 12rem;
      border: 1px solid rgb(58 52 47 / 0.14);
      border-radius: var(--radius-lg);
      overflow: hidden;
      cursor: pointer;
      padding: 0;
      background: var(--surface, #fff);
      transition: border-color 160ms ease, opacity 160ms ease;
      opacity: 0.78;
    }

    .eg-panel:hover { opacity: 0.92; border-color: rgb(58 52 47 / 0.32); }

    .eg-panel.active {
      opacity: 1;
      border-color: var(--eg-accent);
    }

    .eg-panel:focus-visible {
      outline: 2px solid var(--eg-accent);
      outline-offset: 2px;
    }

    .eg-panel img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      opacity: 0.72;
      transition: opacity 160ms ease;
    }

    .eg-panel:hover img { opacity: 0.86; }
    .eg-panel.active img { opacity: 1; }

    .eg-scrim {
      position: absolute;
      inset: auto 0 0 0;
      height: 46%;
      background: rgb(12 10 9 / 0.62);
      z-index: 1;
    }

    .eg-copy {
      position: absolute;
      inset: auto 0 0 0;
      padding: 1rem 1.1rem 1.15rem;
      text-align: left;
      z-index: 2;
    }

    .eg-tag {
      display: block;
      font-size: 0.68rem;
      font-weight: 600;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: rgb(255 255 255 / 0.78);
    }

    .eg-copy h3 {
      margin: 0.35rem 0 0;
      font-size: clamp(0.95rem, 1.7vw, 1.2rem);
      font-weight: 700;
      line-height: 1.2;
      color: white;
      letter-spacing: -0.02em;
    }

    @media (min-width: 768px) {
      .eg-track {
        flex-direction: row;
        height: min(480px, 56vh);
        gap: 0.65rem;
      }

      .eg-panel {
        flex: 1;
        height: auto;
        min-width: 0;
      }

      .eg-copy { padding: 1.15rem 1.25rem 1.35rem; }
    }

    @media (prefers-reduced-motion: reduce) {
      .eg-panel,
      .eg-panel img {
        transition: none;
      }
    }
  `],
})
export class ElasticGalleryComponent implements OnInit {
  @Input() theme: 'legalstation' | 'divorcio' = 'legalstation';
  @Input() items: GalleryItem[] = [];
  @Input() defaultActive = '03';

  activeId = '03';

  ngOnInit(): void {
    this.activeId = this.items.some((i) => i.id === this.defaultActive)
      ? this.defaultActive
      : (this.items[0]?.id ?? '03');
  }
}
