import { Component, HostListener, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

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
    <div
      class="eg"
      [class.theme-divorcio]="theme === 'divorcio'"
      [class.is-empty]="!items.length"
    >
      @if (items.length) {
        <div class="eg-track" role="listbox" [attr.aria-label]="'Galería'" tabindex="0">
          @for (item of items; track item.id) {
            <button
              type="button"
              class="eg-panel"
              role="option"
              [class.active]="activeId === item.id"
              [attr.aria-selected]="activeId === item.id"
              (focus)="select(item.id)"
              (click)="select(item.id)"
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
      } @else {
        <p class="eg-empty">Sin capturas para mostrar.</p>
      }
    </div>
  `,
  styles: [`
    .eg {
      --eg-accent: var(--lp-accent, var(--primary));
      width: 100%;
      max-width: 100%;
      padding: 0.5rem 0 1rem;
    }

    .eg.theme-divorcio { --eg-accent: var(--lp-accent, var(--primary)); }

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
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      overflow: hidden;
      cursor: pointer;
      padding: 0;
      background: var(--surface);
      opacity: 0.78;
      transition:
        opacity var(--dur-base) var(--ease-out),
        border-color var(--dur-fast) var(--ease),
        transform var(--dur-base) var(--ease-out);
    }

    .eg-panel:hover { opacity: 0.92; border-color: color-mix(in srgb, var(--eg-accent) 45%, var(--border)); }

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
      transform: scale(1.04);
      transition:
        opacity var(--dur-base) var(--ease-out),
        transform var(--dur-cine) var(--ease-out);
    }

    .eg-panel:hover img { opacity: 0.86; }
    .eg-panel.active img { opacity: 1; transform: scale(1); }

    .eg-scrim {
      position: absolute;
      inset: auto 0 0 0;
      height: 46%;
      background: color-mix(in srgb, var(--surface-inverse) 62%, transparent);
      z-index: 1;
    }

    .eg-copy {
      position: absolute;
      inset: auto 0 0 0;
      padding: 1rem 1.1rem 1.15rem;
      text-align: left;
      z-index: 2;
      opacity: 0.86;
      transform: translateY(6px);
      transition:
        opacity var(--dur-base) var(--ease-out),
        transform var(--dur-base) var(--ease-out);
    }

    .eg-panel.active .eg-copy {
      opacity: 1;
      transform: none;
    }

    .eg-tag {
      display: block;
      font-size: 0.68rem;
      font-weight: 600;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: color-mix(in srgb, var(--text-inverse) 78%, transparent);
    }

    .eg-copy h3 {
      margin: 0.35rem 0 0;
      font-family: var(--font-sans);
      font-size: clamp(0.95rem, 1.7vw, 1.2rem);
      font-weight: 700;
      line-height: 1.2;
      color: var(--text-inverse);
      letter-spacing: -0.02em;
    }

    .eg-empty {
      margin: 0;
      padding: var(--space-5);
      color: var(--text-muted);
      font-size: var(--text-sm);
    }

    @media (max-width: 767px) {
      .eg-track {
        flex-direction: row;
        overflow-x: auto;
        scroll-snap-type: x mandatory;
        height: 18rem;
        gap: 0.65rem;
        padding-bottom: 0.35rem;
        -webkit-overflow-scrolling: touch;
      }

      .eg-panel {
        flex: 0 0 78%;
        height: 100%;
        scroll-snap-align: center;
      }

      .eg-panel.active { flex-basis: 86%; }
    }

    @media (min-width: 768px) {
      .eg-track {
        flex-direction: row;
        height: min(480px, 56vh);
        gap: 0.65rem;
      }

      .eg-panel {
        flex: 0.62 1 0;
        height: auto;
        min-width: 0;
        transition:
          flex-grow var(--dur-cine) var(--ease-out),
          opacity var(--dur-base) var(--ease-out),
          border-color var(--dur-fast) var(--ease);
      }

      .eg-panel.active { flex-grow: 2.15; }
      .eg-copy { padding: 1.15rem 1.25rem 1.35rem; }
    }
  `],
})
export class ElasticGalleryComponent implements OnInit, OnChanges {
  @Input() theme: 'legalstation' | 'divorcio' = 'legalstation';
  @Input() items: GalleryItem[] = [];
  @Input() defaultActive = '03';

  activeId = '';

  ngOnInit(): void {
    this.syncActive();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['items'] || changes['defaultActive']) this.syncActive();
  }

  select(id: string): void {
    if (!this.items.some((item) => item.id === id)) return;
    this.activeId = id;
  }

  @HostListener('keydown', ['$event'])
  onKey(event: KeyboardEvent): void {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    this.shift(event.key === 'ArrowRight' ? 1 : -1);
  }

  private syncActive(): void {
    if (!this.items.length) {
      this.activeId = '';
      return;
    }
    const preferred = this.items.some((item) => item.id === this.defaultActive)
      ? this.defaultActive
      : this.items[0].id;
    this.activeId = this.items.some((item) => item.id === this.activeId)
      ? this.activeId
      : preferred;
  }

  private shift(delta: number): void {
    if (!this.items.length) return;
    const index = this.items.findIndex((item) => item.id === this.activeId);
    const next = Math.min(this.items.length - 1, Math.max(0, (index < 0 ? 0 : index) + delta));
    this.activeId = this.items[next].id;
  }
}
