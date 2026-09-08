import {
  AfterViewInit, Directive, ElementRef, HostBinding, Input, Renderer2,
} from '@angular/core';

@Directive({
  selector: '[appTimelineAnimation]',
  standalone: true,
})
export class TimelineAnimationDirective implements AfterViewInit {
  @Input() animationNum = 1;
  @Input() timelineRoot?: HTMLElement;

  // ponytail: inline wins over leftover .adv-stat-animate { opacity: 0 } CSS
  @HostBinding('style.opacity') hostOpacity = '1';
  @HostBinding('style.transform') hostTransform = 'none';

  constructor(private el: ElementRef<HTMLElement>, private renderer: Renderer2) {}

  ngAfterViewInit(): void {
    if (this.prefersReducedMotion()) return;

    const node = this.el.nativeElement;
    this.renderer.addClass(node, 'adv-stat-animate');
    this.renderer.setAttribute(node, 'data-anim', String(this.animationNum));
  }

  private prefersReducedMotion(): boolean {
    return typeof matchMedia === 'function'
      && matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
}
