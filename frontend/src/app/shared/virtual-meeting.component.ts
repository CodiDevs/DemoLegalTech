import { Component, Input, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { ApiService, CaseItem } from '../core/api.service';
import { ProductFlowShellComponent } from './product-flow-shell.component';
import { productThemeFromCase } from './product-sites.data';
import { MeetingSchedulerComponent } from './meeting-scheduler.component';
import { ScheduledMeetingCardComponent } from './scheduled-meeting-card.component';

@Component({
  selector: 'app-virtual-meeting',
  standalone: true,
  imports: [RouterLink, ProductFlowShellComponent, MeetingSchedulerComponent, ScheduledMeetingCardComponent],
  template: `
    @if (caseItem) {
      <app-product-flow-shell
        [theme]="theme"
        [crumb]="[{ label: 'LegalStation', link: '/' }, { label: 'Expediente #' + caseItem.id, link: '/caso/' + caseItem.id }, { label: 'Agendar consulta' }]"
        eyebrow="Consulta virtual"
        title="Agendar consulta con abogado"
        subtitle="Selecciona fecha y hora."
      >
        <div class="pf-card lp-lift vm-card">
          @if (caseItem.consultation_at) {
            <app-scheduled-meeting-card
              [scheduledAt]="caseItem.consultation_at"
              subtitle="Consulta con abogado · Expediente #{{ caseItem.id }}"
            />
            <a [routerLink]="['/caso', caseItem.id]" class="lp-btn lp-btn-outline">Volver al expediente</a>
          } @else {
            <app-meeting-scheduler
              [storageKey]="storageKey"
              confirmLabel="Confirmar fecha"
              scheduledSubtitle="Consulta con abogado"
              [saveFn]="consultSaveFn"
              (scheduled)="onScheduled()"
            />
          }
        </div>
      </app-product-flow-shell>
    }
  `,
  styles: [`
    .vm-card {
      max-width: 28rem;
      display: grid;
      gap: var(--space-4);
    }
  `],
})
export class VirtualMeetingComponent implements OnInit {
  @Input() caseId = 0;

  caseItem: CaseItem | null = null;
  theme = productThemeFromCase();
  storageKey = '';

  consultSaveFn = (at: string): Observable<unknown> => {
    if (!this.caseItem) throw new Error('no case');
    return this.api.scheduleConsultation(this.caseItem.id, at);
  };

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    if (!this.caseId) return;
    this.storageKey = `ls_meeting_case_${this.caseId}`;
    this.api.getCase(this.caseId).subscribe((d) => {
      this.caseItem = d.case;
      this.theme = productThemeFromCase(this.caseItem?.product);
    });
  }

  onScheduled(): void {
    this.api.getCase(this.caseId).subscribe((d) => { this.caseItem = d.case; });
  }
}
