import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-cinematic-scene',
  standalone: true,
  template: `
    <section
      class="cine-scene lp-reveal"
      [class.is-sticky]="sticky"
      [class.is-pinned]="pinned"
      [attr.id]="sceneId || null"
      [attr.data-act]="act"
      [attr.data-theme]="theme"
      [style.--cine-depth]="depth"
    >
      <ng-content />
    </section>
  `,
  styles: [`
    :host { display: block; }
  `],
})
export class CinematicSceneComponent {
  @Input() theme: 'cream' | 'ink' | 'teal' = 'cream';
  @Input() act = 1;
  @Input() sticky = false;
  @Input() pinned = false;
  @Input() sceneId = '';
  @Input() depth = 0;
}
