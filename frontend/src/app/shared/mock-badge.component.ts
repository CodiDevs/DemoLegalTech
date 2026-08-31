import { Component } from '@angular/core';
import { IconComponent } from './icon.component';

@Component({
  selector: 'app-mock-badge',
  standalone: true,
  imports: [IconComponent],
  template: `
    <span class="badge-demo">
      <app-icon name="sparkle" [size]="13" />
      Fase 2 · Vista previa
    </span>
  `,
  styles: [`
    .badge-demo {
      line-height: 1.4;
    }
    .badge-demo svg {
      flex-shrink: 0;
    }
  `]
})
export class MockBadgeComponent {}
