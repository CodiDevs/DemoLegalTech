import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { VirtualMeetingComponent } from '../../shared/virtual-meeting.component';

@Component({
  selector: 'app-virtual-meeting-page',
  standalone: true,
  imports: [VirtualMeetingComponent],
  template: `<app-virtual-meeting [caseId]="caseId" />`,
})
export class VirtualMeetingPageComponent implements OnInit {
  caseId = 0;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.caseId = Number(this.route.snapshot.paramMap.get('caseId'));
  }
}
