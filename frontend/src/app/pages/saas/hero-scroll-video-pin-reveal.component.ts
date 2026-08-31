import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  ViewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';

export interface HeroTagItem {
  text: string;
  background: string;
  color?: string;
}

@Component({
  selector: 'app-hero-scroll-video-pin-reveal',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="hsvr">
      <p class="hsvr-kicker">Divorcio360 · por LegalStation</p>
      <h1>Al mismo costo que presencial, sin filas ni trámites.</h1>
      <p class="hsvr-sub">{{ subText }}</p>
      <ul class="hsvr-tags">
        @for (tag of tags; track tag.text) {
          <li
            [style.background]="tag.background"
            [style.color]="tag.color || '#ffffff'"
          >{{ tag.text }}</li>
        }
      </ul>
      <div class="hsvr-cta">
        @if (auth.isLoggedIn && auth.user()?.role === 'cliente') {
          <a routerLink="/cliente" class="hsvr-btn hsvr-btn-primary">Mi expediente</a>
          <a routerLink="/productos/divorcio360" class="hsvr-btn hsvr-btn-outline">Volver a Divorcio360</a>
        } @else if (auth.isLoggedIn) {
          <a routerLink="/abogado" class="hsvr-btn hsvr-btn-primary">Panel del operador</a>
        } @else {
          <a routerLink="/cuestionario" class="hsvr-btn hsvr-btn-primary">Comenzar</a>
          <a routerLink="/auth" [queryParams]="authQuery" class="hsvr-btn hsvr-btn-outline">Ingresar</a>
        }
      </div>
      <div class="hsvr-media">
        <video
          #videoRef
          muted
          loop
          playsinline
          preload="metadata"
          [src]="videoSrc"
          aria-label="Recorrido visual Divorcio360"
        ></video>
        <p class="hsvr-caption">Expediente demo · 10 estados · firma documental</p>
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }

    .hsvr {
      max-width: 44rem;
      margin: 0 auto;
      padding: clamp(1.5rem, 4vw, 3rem) 1.25rem 2.5rem;
      text-align: center;
      font-family: var(--font-body);
      color: var(--ink);
    }

    .hsvr-kicker {
      margin: 0 0 0.75rem;
      font-size: 0.78rem;
      font-weight: 600;
      color: var(--brand);
    }

    h1 {
      margin: 0 0 1rem;
      font-size: clamp(1.75rem, 4.5vw, 2.75rem);
      font-weight: 700;
      letter-spacing: -0.03em;
      line-height: 1.12;
      text-wrap: balance;
    }

    .hsvr-sub {
      margin: 0 auto 1.25rem;
      max-width: 42ch;
      font-size: 1.05rem;
      line-height: 1.55;
      color: var(--ink-soft);
    }

    .hsvr-tags {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 0.5rem;
      list-style: none;
      margin: 0 0 1.5rem;
      padding: 0;
    }

    .hsvr-tags li {
      padding: 0.4rem 0.85rem;
      border-radius: 999px;
      font-size: 0.82rem;
      font-weight: 600;
    }

    .hsvr-cta {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      justify-content: center;
      margin-bottom: 1.75rem;
    }

    .hsvr-btn {
      display: inline-flex;
      align-items: center;
      padding: 0.85rem 1.45rem;
      border-radius: 999px;
      font-weight: 600;
      font-size: 0.95rem;
      text-decoration: none;
      transition: transform 0.15s ease, background 0.15s ease;
    }

    .hsvr-btn:hover { transform: translateY(-1px); }

    .hsvr-btn-primary {
      background: var(--brand);
      color: white;
      box-shadow: 0 10px 24px oklch(0.42 0.09 210 / 0.28);
    }

    .hsvr-btn-outline {
      border: 1.5px solid var(--line);
      color: var(--ink);
      background: transparent;
    }

    .hsvr-media {
      position: relative;
      border-radius: var(--radius);
      overflow: hidden;
      background: var(--surface);
      border: 1px solid var(--line);
    }

    .hsvr-media video {
      display: block;
      width: 100%;
      aspect-ratio: 16 / 9;
      max-height: 28rem;
      object-fit: cover;
      background: var(--paper);
    }

    .hsvr-caption {
      position: absolute;
      left: 0.85rem;
      bottom: 0.75rem;
      margin: 0;
      font-size: 0.72rem;
      font-weight: 600;
      color: white;
      text-shadow: 0 1px 8px rgb(0 0 0 / 0.55);
    }

    @media (prefers-reduced-motion: reduce) {
      .hsvr-btn { transition: none; }
      .hsvr-btn:hover { transform: none; }
    }
  `],
})
export class HeroScrollVideoPinRevealComponent implements AfterViewInit {
  @Input() videoSrc =
    'https://res.cloudinary.com/dsuwzuaxp/video/upload/856381-hd_1920_1080_30fps_gsq11b.mp4';
  @Input() authQuery: Record<string, string> = {
    product: 'divorcio360',
    returnUrl: '/productos/divorcio360',
  };
  @Input() subText =
    'Cuestionario, expediente, consulta y firma en un solo flujo. Al mismo costo que presencial.';

  @ViewChild('videoRef') videoRef?: ElementRef<HTMLVideoElement>;

  tags: HeroTagItem[] = [
    { text: 'Cuestionario', background: '#3a827b', color: '#ffffff' },
    { text: 'Expediente', background: '#4a9e96', color: '#ffffff' },
    { text: 'Firma demo', background: '#e8f6f4', color: '#2a4542' },
    { text: '10 estados', background: '#2a4542', color: '#ffffff' },
  ];

  constructor(public auth: AuthService) {}

  ngAfterViewInit(): void {
    const video = this.videoRef?.nativeElement;
    if (!video) return;
    video.muted = true;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    void video.play().catch(() => {});
  }
}
