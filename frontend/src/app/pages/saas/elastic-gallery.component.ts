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
            (mouseenter)="activeId = item.id"
            (focus)="activeId = item.id"
            (click)="activeId = item.id"
          >
            <img [src]="item.src" [alt]="item.alt" loading="lazy" />
            <div class="eg-overlay"></div>
            <div class="eg-active-copy">
              <span class="eg-tag">{{ item.category }}</span>
              <h3>{{ item.title }}</h3>
              <span class="eg-cta">Ver más →</span>
            </div>
            <span class="eg-idle-label">{{ item.title }}</span>
          </button>
        }
      </div>
    </div>
  `,
  styles: [`
    .eg {
      --eg-accent: #4455c4;
      width: 100%;
      padding: 0.5rem 0 1rem;
    }

    .eg.theme-divorcio { --eg-accent: #4a9e96; }

    .eg-track {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      height: 500px;
      max-width: 72rem;
      margin: 0 auto;
    }

    .eg-panel {
      position: relative;
      flex: 1;
      min-height: 0;
      border: 1px solid rgb(58 52 47 / 0.1);
      border-radius: 1rem;
      overflow: hidden;
      cursor: pointer;
      padding: 0;
      background: white;
      transition: flex 0.7s cubic-bezier(0.25, 1, 0.5, 1), filter 0.5s ease;
      filter: brightness(0.55);
    }

    .eg-panel.active {
      flex: 4;
      filter: brightness(1);
    }

    .eg-panel:not(.active):hover { filter: brightness(0.75); }

    .eg-panel img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 1s ease;
      transform: scale(1.1);
    }

    .eg-panel.active img { transform: scale(1); }

    .eg-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, rgb(0 0 0 / 0.75), rgb(0 0 0 / 0.15) 55%, transparent);
      opacity: 0;
      transition: opacity 0.5s ease;
    }

    .eg-panel.active .eg-overlay { opacity: 1; }

    .eg-active-copy {
      position: absolute;
      inset: auto 0 0 0;
      padding: 1rem 1.25rem 1.25rem;
      text-align: left;
      opacity: 0;
      transform: translateY(2rem);
      transition: opacity 0.5s ease 0.15s, transform 0.5s ease 0.15s;
      z-index: 2;
    }

    .eg-panel.active .eg-active-copy {
      opacity: 1;
      transform: translateY(0);
    }

    .eg-tag {
      display: inline-block;
      padding: 0.25rem 0.65rem;
      border-radius: 999px;
      border: 1px solid rgb(255 255 255 / 0.35);
      background: rgb(255 255 255 / 0.12);
      backdrop-filter: blur(6px);
      font-size: 0.65rem;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: white;
    }

    .eg-active-copy h3 {
      margin: 0.65rem 0 0;
      font-size: clamp(1.25rem, 3vw, 2.25rem);
      font-weight: 800;
      text-transform: uppercase;
      line-height: 1.05;
      color: white;
      letter-spacing: -0.02em;
    }

    .eg-cta {
      display: inline-block;
      margin-top: 0.65rem;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: rgb(255 255 255 / 0.85);
    }

    .eg-idle-label {
      position: absolute;
      bottom: 1rem;
      left: 50%;
      transform: translateX(-50%);
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: white;
      writing-mode: vertical-rl;
      opacity: 1;
      transition: opacity 0.4s ease, transform 0.4s ease;
      z-index: 1;
    }

    .eg-panel.active .eg-idle-label {
      opacity: 0;
      transform: translateX(-50%) scale(0.5);
    }

    @media (min-width: 768px) {
      .eg-track {
        flex-direction: row;
        height: 560px;
        gap: 0.65rem;
      }

      .eg-idle-label { font-size: 0.85rem; bottom: 1.5rem; }
      .eg-active-copy { padding: 1.5rem 2rem 2rem; }
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
