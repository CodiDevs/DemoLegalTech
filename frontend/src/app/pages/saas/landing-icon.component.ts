import { Component, Input } from '@angular/core';

export type LandingIconName =
  | 'file'
  | 'search'
  | 'pen'
  | 'users'
  | 'folder'
  | 'shield'
  | 'building'
  | 'scale'
  | 'check';

@Component({
  selector: 'app-landing-icon',
  standalone: true,
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      @switch (name) {
        @case ('file') {
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round"/>
          <path d="M14 2v6h6M8 13h8M8 17h5" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>
        }
        @case ('search') {
          <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.75"/>
          <path d="m20 20-3.5-3.5" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>
        }
        @case ('pen') {
          <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round"/>
        }
        @case ('users') {
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>
          <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="1.75"/>
          <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>
        }
        @case ('folder') {
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round"/>
        }
        @case ('shield') {
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round"/>
        }
        @case ('building') {
          <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round"/>
          <path d="M6 12h12M10 6h4M10 10h4M10 14h4M10 18h4" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>
        }
        @case ('scale') {
          <path d="M12 3v18M5 7h14M7 7l-2 5h4L7 7Zm10 0-2 5h4l-2-5Z" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round" stroke-linecap="round"/>
        }
        @case ('check') {
          <path d="M20 6 9 17l-5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        }
      }
    </svg>
  `,
  styles: [`:host { display: inline-flex; color: inherit; }`],
})
export class LandingIconComponent {
  @Input({ required: true }) name!: LandingIconName;
  @Input() size = 20;
}
