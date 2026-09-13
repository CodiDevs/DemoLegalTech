import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationStart, Router } from '@angular/router';
import { shouldPlayRouteCurtain } from './cinematic-path';

@Component({
  selector: 'app-route-curtain',
  standalone: true,
  template: `<div class="route-curtain" [class.is-on]="on" aria-hidden="true"></div>`,
  styles: [`
    :host {
      pointer-events: none;
      position: fixed;
      inset: 0;
      z-index: 480;
    }
    .route-curtain { pointer-events: none; }
  `],
})
export class RouteCurtainComponent implements OnInit {
  on = false;
  private hideTimer?: ReturnType<typeof setTimeout>;
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);

  ngOnInit(): void {
    this.destroyRef.onDestroy(() => {
      if (this.hideTimer !== undefined) clearTimeout(this.hideTimer);
    });

    this.router.events.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((event) => {
      if (!(event instanceof NavigationStart)) return;
      if (!shouldPlayRouteCurtain(this.router.url, event.url)) return;
      this.on = true;
      if (this.hideTimer !== undefined) clearTimeout(this.hideTimer);
      this.hideTimer = setTimeout(() => {
        this.on = false;
        this.hideTimer = undefined;
      }, 520);
    });
  }
}
