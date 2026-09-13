import { AfterViewInit, Directive, ElementRef, EventEmitter, Input, OnDestroy, Output } from '@angular/core';

type GsapNs = typeof import('gsap');

@Directive({
  selector: '[appScrollScene]',
  standalone: true,
})
export class ScrollSceneDirective implements AfterViewInit, OnDestroy {
  /** Pin the host while scrubbing. Desktop/tablet only if pinMobile is false. */
  @Input() appScrollScenePin = false;
  @Input() appScrollSceneEnd = '+=220%';
  @Input() appScrollScenePinMobile = false;
  @Output() sceneProgress = new EventEmitter<number>();

  private ctx?: { revert: () => void };
  private media?: { add: (query: string, fn: () => void) => unknown; revert: () => void };
  private destroyed = false;

  constructor(private host: ElementRef<HTMLElement>) {}

  ngAfterViewInit(): void {
    void this.boot();
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.media?.revert();
    this.ctx?.revert();
  }

  private async boot(): Promise<void> {
    const gsapMod: GsapNs = await import('gsap');
    const { ScrollTrigger } = await import('gsap/ScrollTrigger');
    if (this.destroyed) return;

    const gsap = gsapMod.default;
    gsap.registerPlugin(ScrollTrigger);
    const el = this.host.nativeElement;

    this.ctx = gsap.context(() => {
      this.media = gsap.matchMedia();
      const run = (pin: boolean, end: string) => {
        gsap.to(el, {
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top top',
            end,
            pin,
            scrub: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => this.sceneProgress.emit(self.progress),
          },
        });
      };

      this.media.add('(max-width: 639.9px)', () => {
        run(this.appScrollScenePin && this.appScrollScenePinMobile, '+=80%');
      });
      this.media.add('(min-width: 640px) and (max-width: 1023.9px)', () => {
        run(this.appScrollScenePin, '+=160%');
      });
      this.media.add('(min-width: 1024px)', () => {
        run(this.appScrollScenePin, this.appScrollSceneEnd);
      });
    }, el);
  }
}
