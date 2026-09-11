import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { ConfirmService } from '../../core/confirm.service';
import { UploadComponent } from './upload.component';

describe('UploadComponent', () => {
  let fixture: ComponentFixture<UploadComponent>;
  let api: {
    getCase: jasmine.Spy;
    listDocs: jasmine.Spy;
    uploadDoc: jasmine.Spy;
    deleteDoc: jasmine.Spy;
  };
  let confirm: { confirm: jasmine.Spy };

  beforeEach(async () => {
    api = {
      getCase: jasmine.createSpy('getCase').and.returnValue(of({
        case: { product: 'divorcio360', can_sign: false, has_signature: false, sign_hint: 'Falta minuta' },
      })),
      listDocs: jasmine.createSpy('listDocs').and.returnValue(of([])),
      uploadDoc: jasmine.createSpy('uploadDoc').and.returnValue(of({})),
      deleteDoc: jasmine.createSpy('deleteDoc').and.returnValue(of({})),
    };
    confirm = { confirm: jasmine.createSpy('confirm').and.resolveTo(true) };
    await TestBed.configureTestingModule({
      imports: [UploadComponent],
      providers: [
        provideRouter([
          { path: 'consulta/:id', component: UploadComponent },
          { path: 'firma/:id', component: UploadComponent },
          { path: 'caso/:id', component: UploadComponent },
        ]),
        { provide: ApiService, useValue: api },
        { provide: ConfirmService, useValue: confirm },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '3' } } } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(UploadComponent);
  });

  afterEach(() => {
    if (fixture && !fixture.componentRef.hostView.destroyed) fixture.destroy();
  });

  it('expone progreso 0 / 0.5 / 1 y canSign del expediente', () => {
    fixture.detectChanges();
    const cmp = fixture.componentInstance;
    expect(cmp.progressPct).toBe(0);
    cmp.docs = [{ id: 1, doc_type: 'cedula', filename: 'c.pdf' }];
    expect(cmp.progressPct).toBe(50);
    cmp.docs = [
      { id: 1, doc_type: 'cedula', filename: 'c.pdf' },
      { id: 2, doc_type: 'partida', filename: 'p.pdf' },
    ];
    expect(cmp.progressPct).toBe(100);
    expect(cmp.canSign).toBeFalse();
    expect(cmp.signHint).toBe('Falta minuta');
  });

  it('sube por input y drag, y muestra error de API', () => {
    fixture.detectChanges();
    const file = new File(['x'], 'c.pdf', { type: 'application/pdf' });
    const cmp = fixture.componentInstance;
    cmp.onFile({ target: { files: [file], value: '' } } as unknown as Event, 'cedula');
    expect(api.uploadDoc).toHaveBeenCalled();

    api.uploadDoc.and.returnValue(throwError(() => ({ error: { error: 'peso' } })));
    const dt = { files: [file] } as unknown as DataTransfer;
    cmp.onDrop({ preventDefault() {}, stopPropagation() {}, dataTransfer: dt } as DragEvent, 'partida');
    expect(cmp.error).toBe('peso');
  });

  it('confirma delete y cancela sin llamar API; recarga docs', async () => {
    fixture.detectChanges();
    const doc = { id: 9, doc_type: 'cedula', filename: 'c.pdf' };
    fixture.componentInstance.docs = [doc];
    confirm.confirm.and.resolveTo(false);
    await fixture.componentInstance.deleteDoc(doc);
    expect(api.deleteDoc).not.toHaveBeenCalled();

    confirm.confirm.and.resolveTo(true);
    await fixture.componentInstance.deleteDoc(doc);
    expect(api.deleteDoc).toHaveBeenCalledWith(3, 9);
    expect(api.listDocs).toHaveBeenCalled();
  });

  it('muestra CTA de firma solo con can_sign', () => {
    api.getCase.and.returnValue(of({
      case: { product: 'divorcio360', can_sign: true, has_signature: false, sign_hint: '' },
    }));
    fixture.detectChanges();
    const hrefs = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('a'))
      .map((a) => a.getAttribute('href'));
    expect(hrefs).toContain('/firma/3');
  });
});
