import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { SignComponent } from './sign.component';

describe('SignComponent', () => {
  let fixture: ComponentFixture<SignComponent>;
  let api: {
    getCase: jasmine.Spy;
    listOutputs: jasmine.Spy;
    listSignatures: jasmine.Spy;
    sign: jasmine.Spy;
  };

  beforeEach(async () => {
    api = {
      getCase: jasmine.createSpy('getCase').and.returnValue(of({
        case: { can_sign: true, has_minuta: true, product: 'divorcio360', sign_hint: '' },
      })),
      listOutputs: jasmine.createSpy('listOutputs').and.returnValue(of([{ output_type: 'minuta', url: '/m.pdf' }])),
      listSignatures: jasmine.createSpy('listSignatures').and.returnValue(of([])),
      sign: jasmine.createSpy('sign').and.returnValue(of({
        image_url: '/firma.png',
        signed_at: '2026-09-11',
        ip: '1.1.1.1',
      })),
    };
    await TestBed.configureTestingModule({
      imports: [SignComponent],
      providers: [
        provideRouter([{ path: 'caso/:id', component: SignComponent }]),
        { provide: ApiService, useValue: api },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '4' } } } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(SignComponent);
  });

  afterEach(() => {
    if (fixture && !fixture.componentRef.hostView.destroyed) fixture.destroy();
  });

  it('bloquea si can_sign es falso', () => {
    api.getCase.and.returnValue(of({ case: { can_sign: false, has_minuta: false } }));
    fixture.detectChanges();
    expect(fixture.componentInstance.signBlocked).toContain('minuta');
    expect((fixture.nativeElement as HTMLElement).querySelector('.sign-blocked')).not.toBeNull();
  });

  it('carga firma previa como done', () => {
    api.listSignatures.and.returnValue(of([{ image_url: '/a.pdf', signed_at: 'hoy', ip: '0.0.0.0' }]));
    fixture.detectChanges();
    expect(fixture.componentInstance.mode).toBe('done');
    expect(fixture.componentInstance.isPdf('/a.pdf')).toBeTrue();
    expect(fixture.componentInstance.isPdf('/a.png')).toBeFalse();
  });

  it('no envía sin archivo; busy durante envío; error recuperable y reupload', () => {
    fixture.detectChanges();
    const cmp = fixture.componentInstance;
    cmp.submit();
    expect(api.sign).not.toHaveBeenCalled();

    cmp.selectedFile = new File(['x'], 'f.png', { type: 'image/png' });
    api.sign.and.returnValue(throwError(() => ({ error: { error: 'servidor' } })));
    cmp.submit();
    expect(cmp.busy).toBeFalse();
    expect(cmp.sending).toBeFalse();
    expect(cmp.error).toBe('servidor');

    api.sign.and.returnValue(of({ image_url: '/ok.png', signed_at: 't', ip: '2.2.2.2' }));
    cmp.submit();
    expect(cmp.mode).toBe('done');
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Documento enviado');
    const cta = (fixture.nativeElement as HTMLElement).querySelector('a.lp-btn-primary');
    expect(cta?.getAttribute('href')).toBe('/caso/4');

    cmp.startReupload();
    expect(cmp.mode).toBe('upload');
    expect(cmp.selectedFile).toBeNull();
  });
});
