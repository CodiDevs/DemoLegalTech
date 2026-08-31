import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { VirtualMeetingComponent, MeetingMode } from '../../shared/virtual-meeting.component';

@Component({
  selector: 'app-virtual-meeting-page',
  standalone: true,
  imports: [VirtualMeetingComponent],
  template: `
    <app-virtual-meeting [caseId]="caseId" [mode]="mode" />
  `,
})
export class VirtualMeetingPageComponent implements OnInit {
  caseId = 0;
  mode: MeetingMode = 'consultation';

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.caseId = Number(this.route.snapshot.paramMap.get('caseId'));
    const path = this.route.snapshot.routeConfig?.path || '';
    this.mode = path.startsWith('reunion-notarial') ? 'notary' : 'consultation';
  }
}
