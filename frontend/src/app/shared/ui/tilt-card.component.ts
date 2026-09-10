import {
  Component,
  ElementRef,
  HostListener,
  Input,
  OnDestroy,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'app-tilt-card',
  standalone: true,
  template: `
    <div class="tilt-host" #host>
      <div
        class="tilt-body"
        #body
        [class.is-tracking]="tracking"
        [style.--rx]="rx"
        [style.--ry]="ry"
      >
        <ng-content />
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }

    .tilt-host {
      height: 100%;
      perspective: 900px;
    }

    .tilt-body {
      height: 100%;
      transform-style: preserve-3d;
      transform: rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg));
      transition: transform 420ms cubic-bezier(0.22, 1, 0.36, 1);
      will-change: auto;
    }

    .tilt-body.is-tracking {
      transition: none;
      will-change: transform;
    }

    :host ::ng-deep .tilt-z-media {
      transform: translateZ(22px);
    }

    :host ::ng-deep .tilt-z-copy {
      transform: translateZ(10px);
    }

    @media (hover: none), (pointer: coarse) {
      .tilt-body {
        transform: none !important;
      }

      :host ::ng-deep .tilt-z-media,
      :host ::ng-deep .tilt-z-copy {
        transform: none;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .tilt-body {
        transform: none !important;
        transition: none;
      }

      :host ::ng-deep .tilt-z-media,
      :host ::ng-deep .tilt-z-copy {
        transform: none;
      }
    }
  `],
})
export class TiltCardComponent implements OnDestroy {
  /** Max tilt in degrees (each axis). */
  @Input() maxTilt = 6;

  @ViewChild('host', { static: true }) host!: ElementRef<HTMLElement>;

  rx = '0deg';
  ry = '0deg';
  tracking = false;

  private raf = 0;
  private enabled = true;

  constructor() {
    if (typeof matchMedia !== 'undefined') {
      const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
      const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.enabled = fine && !reduce;
    }
  }

  ngOnDestroy(): void {
    if (this.raf) cancelAnimationFrame(this.raf);
  }

  @HostListener('pointerenter')
  onEnter(): void {
    if (!this.enabled) return;
    this.tracking = true;
  }

  @HostListener('pointerleave')
  onLeave(): void {
    if (!this.enabled) return;
    this.tracking = false;
    this.rx = '0deg';
    this.ry = '0deg';
  }

  @HostListener('pointermove', ['$event'])
  onMove(e: PointerEvent): void {
    if (!this.enabled) return;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = requestAnimationFrame(() => {
      const el = this.host.nativeElement;
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      const max = this.maxTilt;
      this.rx = `${(-py * max * 2).toFixed(2)}deg`;
      this.ry = `${(px * max * 2).toFixed(2)}deg`;
    });
  }
}
