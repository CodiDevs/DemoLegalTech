import { Component, Input } from '@angular/core';

export interface DemoSheet {
  src: string;
  alt: string;
}

@Component({
  selector: 'app-demo-document-stack',
  standalone: true,
  template: `
    <div class="demo-stack" [attr.data-variant]="variant" aria-hidden="true">
      @for (sheet of sheets; track sheet.src; let i = $index) {
        <figure class="demo-sheet" [style.--i]="i">
          <img [src]="sheet.src" [alt]="sheet.alt" width="420" height="560" />
          <figcaption>DOCUMENTO FICTICIO · DEMO</figcaption>
        </figure>
      }
    </div>
  `,
})
export class DemoDocumentStackComponent {
  @Input() variant: 'stack' | 'orbit' | 'archive' = 'stack';
  @Input() sheets: DemoSheet[] = [
    { src: '/demo-scenes/identity-demo.svg', alt: 'Identidad ficticia DEMO' },
    { src: '/demo-scenes/marriage-record-demo.svg', alt: 'Partida ficticia DEMO' },
    { src: '/demo-scenes/legal-draft-demo.svg', alt: 'Minuta ficticia DEMO' },
  ];
}
