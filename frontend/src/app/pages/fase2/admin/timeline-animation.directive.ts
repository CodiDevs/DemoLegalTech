import {
  AfterViewInit, Directive, ElementRef, Input, OnDestroy, Renderer2,
} from '@angular/core';

@Directive({
  selector: '[appTimelineAnimation]',
  standalone: true,
})
export class TimelineAnimationDirective implements AfterViewInit, OnDestroy {
  @Input() animationNum = 1;
  @Input() timelineRoot?: HTMLElement;

  private observer?: IntersectionObserver;

  constructor(private el: ElementRef<HTMLElement>, private renderer: Renderer2) {}

  ngAfterViewInit(): void {
    const node = this.el.nativeElement;
    this.renderer.addClass(node, 'adv-stat-animate');
    this.renderer.setAttribute(node, 'data-anim', String(this.animationNum));

    const root = this.timelineRoot ?? node.closest('.adv-stats-root');
    if (!root) {
      this.reveal(node);
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.renderer.addClass(root, 'is-visible');
            this.observer?.disconnect();
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    );
    this.observer.observe(root);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  private reveal(node: HTMLElement): void {
    this.renderer.setStyle(node, 'opacity', '1');
    this.renderer.setStyle(node, 'transform', 'none');
  }
}
