import { Component } from '@angular/core';
import { AdvancedStatsComponent } from './advanced-stats.component';

@Component({
  selector: 'app-fase2-admin',
  standalone: true,
  imports: [AdvancedStatsComponent],
  template: `<app-advanced-stats />`,
})
export class Fase2AdminComponent {}
