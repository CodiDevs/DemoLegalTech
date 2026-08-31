import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';

export interface LogoCloudClient {
  name: string;
  tone?: 'default' | 'bold' | 'serif' | 'wide' | 'accent' | 'lowercase';
  src?: string;
}

@Component({
  selector: 'app-cinematic-logo-cloud',
  standalone: true,
  template: `
    <div
      #root
      class="clc"
      [class.theme-divorcio]="theme === 'divorcio'"
      [class.theme-legalstation]="theme === 'legalstation'"
      [class.clc-visible]="visible"
      [class.clc-marquee-wrap]="variant === 'marquee'"
    >
      @if (variant === 'grid') {
        <div class="clc-grid">
          @for (client of clients; track client.name; let i = $index) {
            <div class="clc-item" [style.--clc-i]="i" [class]="toneClass(client)">
              @if (client.src) {
                <img [src]="client.src" [alt]="client.name" loading="lazy" />
              } @else {
                <span>{{ client.name }}</span>
              }
            </div>
          }
        </div>
      } @else {
        <div class="clc-marquee" aria-hidden="false">
          <div class="clc-marquee-track">
            @for (client of loopedClients; track $index) {
              <div class="clc-marquee-item" [class]="toneClass(client)">
                @if (client.src) {
                  <img [src]="client.src" [alt]="client.name" loading="lazy" />
                } @else {
                  <span>{{ client.name }}</span>
                }
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .clc {
      --clc-accent: #4455c4;
      width: 100%;
      min-height: 360px;
      display: flex;
      align-items: center;
      padding: 1.5rem 0;
    }

    .clc.theme-divorcio { --clc-accent: #4a9e96; }

    .clc-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 1rem 1.25rem;
      width: 100%;
      max-width: 72rem;
      margin: 0 auto;
    }

    .clc-item {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 4.5rem;
      padding: 1rem 1.25rem;
      border-radius: 1rem;
      border: 1px solid rgb(58 52 47 / 0.08);
      background: rgb(255 255 255 / 0.88);
      opacity: 0;
      filter: blur(10px);
      transform: translateY(18px);
    }

    .clc-visible .clc-item {
      animation: clc-reveal 0.75s cubic-bezier(0.22, 1, 0.36, 1) forwards;
      animation-delay: calc(var(--clc-i, 0) * 0.07s);
    }

    .clc-item span,
    .clc-marquee-item span {
      color: #3a342f;
      font-size: 1rem;
      font-weight: 600;
      letter-spacing: -0.01em;
      text-align: center;
      line-height: 1.2;
    }

    .clc-item img,
    .clc-marquee-item img {
      max-height: 2rem;
      max-width: 9rem;
      object-fit: contain;
      filter: grayscale(1);
      opacity: 0.85;
    }

    .tone-bold span { font-size: 1.1rem; font-weight: 800; letter-spacing: -0.02em; }
    .tone-serif span { font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; font-size: 0.92rem; }
    .tone-wide span { font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; font-size: 0.82rem; }
    .tone-accent span { color: var(--clc-accent); font-weight: 800; }
    .tone-lowercase span { font-weight: 500; text-transform: lowercase; font-size: 1.05rem; }

    .clc-marquee {
      width: 100%;
      overflow: hidden;
      mask-image: linear-gradient(to right, transparent, #000 8%, #000 92%, transparent);
    }

    .clc-marquee-track {
      display: flex;
      gap: 1rem;
      width: max-content;
      animation: clc-marquee 40s linear infinite;
    }

    .clc-marquee-wrap:hover .clc-marquee-track {
      animation-play-state: paused;
    }

    .clc-marquee-item {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 11rem;
      padding: 0.85rem 1.25rem;
      border-radius: 999px;
      border: 1px solid rgb(58 52 47 / 0.1);
      background: var(--surface);
    }

    @keyframes clc-reveal {
      to {
        opacity: 1;
        filter: blur(0);
        transform: translateY(0);
      }
    }

    @keyframes clc-marquee {
      from { transform: translateX(0); }
      to { transform: translateX(-50%); }
    }

    @media (min-width: 640px) {
      .clc-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    }

    @media (min-width: 960px) {
      .clc-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 1.15rem 1.5rem; }
      .clc { min-height: 400px; }
    }

    @media (prefers-reduced-motion: reduce) {
      .clc-item {
        opacity: 1;
        filter: none;
        transform: none;
        animation: none;
      }

      .clc-marquee-track { animation: none; }
    }
  `],
})
export class CinematicLogoCloudComponent implements AfterViewInit {
  @Input() theme: 'legalstation' | 'divorcio' = 'divorcio';
  @Input() variant: 'grid' | 'marquee' = 'grid';
  @Input() clients: LogoCloudClient[] = [];

  @ViewChild('root') root?: ElementRef<HTMLElement>;

  visible = false;

  get loopedClients(): LogoCloudClient[] {
    return [...this.clients, ...this.clients];
  }

  ngAfterViewInit(): void {
    if (this.variant === 'marquee') {
      this.visible = true;
      return;
    }

    const el = this.root?.nativeElement;
    if (!el || typeof IntersectionObserver === 'undefined') {
      this.visible = true;
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          this.visible = true;
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
  }

  toneClass(client: LogoCloudClient): string {
    return client.tone ? `tone-${client.tone}` : 'tone-default';
  }
}
