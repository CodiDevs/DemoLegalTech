import { Component, Input } from '@angular/core';
import { IconComponent, IconName } from '../../shared/icon.component';

/**
 * Alias histórico de `app-icon` para las páginas de marketing.
 * Existe solo para no duplicar geometría: el set real vive en shared/icon.component.ts.
 */
export type LandingIconName = Extract<
  IconName,
  'file' | 'search' | 'pen' | 'users' | 'folder' | 'shield' | 'building' | 'scale' | 'check'
>;

@Component({
  selector: 'app-landing-icon',
  standalone: true,
  imports: [IconComponent],
  template: `<app-icon [name]="name" [size]="size" />`,
  styles: [`:host { display: inline-flex; color: inherit; }`],
})
export class LandingIconComponent {
  @Input({ required: true }) name!: LandingIconName;
  @Input() size = 20;
}
