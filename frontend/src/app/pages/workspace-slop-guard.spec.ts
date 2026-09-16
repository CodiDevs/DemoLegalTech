import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import { ClientPanelComponent } from './client-panel/client-panel.component';
import { LawyerServicesEditorComponent } from './lawyer-services/lawyer-services-editor.component';

const KICKER_SEL =
  '.section-kicker, .lp-eyebrow, .lp-cta-eyebrow, .cine-kicker, .dossier-kicker, .preview-kicker, .q-modal-kicker';

function expectNoWorkspaceKickers(root: HTMLElement): void {
  expect(root.querySelectorAll(KICKER_SEL).length).toBe(0);
}

const apiStub = {
  listCases: () => of([]),
};

describe('slop guard — workspace', () => {
  let fixture: ComponentFixture<unknown>;

  afterEach(() => {
    if (fixture && !fixture.componentRef.hostView.destroyed) fixture.destroy();
    TestBed.resetTestingModule();
  });

  it('el panel cliente no muestra kickers de dossier', async () => {
    await TestBed.configureTestingModule({
      imports: [ClientPanelComponent],
      providers: [
        provideRouter([]),
        { provide: ApiService, useValue: apiStub },
        { provide: AuthService, useValue: { isLoggedIn: true, user: signal({ role: 'cliente' }) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ClientPanelComponent);
    fixture.detectChanges();
    expectNoWorkspaceKickers(fixture.nativeElement as HTMLElement);
  });

  it('el editor de servicios no usa kickers de preview ni de modal', async () => {
    await TestBed.configureTestingModule({
      imports: [LawyerServicesEditorComponent],
      providers: [
        provideRouter([]),
        { provide: ApiService, useValue: apiStub },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({}) } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LawyerServicesEditorComponent);
    const cmp = fixture.componentInstance as LawyerServicesEditorComponent;
    fixture.detectChanges();

    cmp.showPreview = true;
    cmp.addNode('question');
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    expectNoWorkspaceKickers(root);
    expect(root.querySelector('#preview-heading')?.textContent?.trim()).toBe('Así lo verá el cliente');
    expect(root.querySelector('#q-modal-title')?.textContent?.trim()).toBe('Nueva pregunta');
  });
});
