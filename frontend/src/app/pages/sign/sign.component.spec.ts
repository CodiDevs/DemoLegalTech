import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
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
    expect(api.listOutputs).not.toHaveBeenCalled();
    expect(api.listSignatures).not.toHaveBeenCalled();
  });

  it('carga firma previa como done', () => {
    api.listSignatures.and.returnValue(of([{ image_url: '/a.pdf', signed_at: 'hoy', ip: '0.0.0.0' }]));
    fixture.detectChanges();
    expect(fixture.componentInstance.mode).toBe('done');
    expect(fixture.componentInstance.isPdf('/a.pdf')).toBeTrue();
    expect(fixture.componentInstance.isPdf('/a.png')).toBeFalse();
  });

  it('bloquea el formulario si getCase falla', () => {
    api.getCase.and.returnValue(throwError(() => ({ status: 500 })));
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    expect(fixture.componentInstance.signBlocked).toContain('No pudimos cargar');
    expect(root.querySelector('.sign-blocked')).not.toBeNull();
    expect(root.querySelector('.up-dropzone')).toBeNull();
    expect(api.listOutputs).not.toHaveBeenCalled();
    expect(api.sign).not.toHaveBeenCalled();
  });

  it('no desbloquea hasta el snapshot de minuta', () => {
    const outs = new Subject<{ output_type: string; url: string }[]>();
    api.listOutputs.and.returnValue(outs);
    fixture.detectChanges();
    expect(fixture.componentInstance.signBlocked).toContain('Cargando');
    expect((fixture.nativeElement as HTMLElement).querySelector('.up-dropzone')).toBeNull();
    expect(api.listOutputs).toHaveBeenCalled();
    expect(api.listSignatures).toHaveBeenCalled();

    outs.next([{ output_type: 'minuta', url: '/m.pdf' }]);
    outs.complete();
    fixture.detectChanges();
    expect(fixture.componentInstance.signBlocked).toBe('');
    expect((fixture.nativeElement as HTMLElement).querySelector('.up-dropzone')).not.toBeNull();
  });

  it('sigue bloqueada si outputs no traen minuta', () => {
    api.listOutputs.and.returnValue(of([{ output_type: 'otro', url: '/x.pdf' }]));
    fixture.detectChanges();
    expect(fixture.componentInstance.signBlocked).toContain('Falta la minuta');
    expect((fixture.nativeElement as HTMLElement).querySelector('.up-dropzone')).toBeNull();
  });

  it('sigue bloqueada si listOutputs falla', () => {
    api.listOutputs.and.returnValue(throwError(() => ({ status: 500 })));
    fixture.detectChanges();
    expect(fixture.componentInstance.signBlocked).toContain('No pudimos confirmar la minuta');
    expect((fixture.nativeElement as HTMLElement).querySelector('.up-dropzone')).toBeNull();
  });

  it('acepta archivo por drop', () => {
    fixture.detectChanges();
    const file = new File(['x'], 'f.png', { type: 'image/png' });
    fixture.componentInstance.onDrop({
      preventDefault() {},
      stopPropagation() {},
      dataTransfer: { files: [file] },
    } as unknown as DragEvent);
    expect(fixture.componentInstance.selectedFile?.name).toBe('f.png');
  });

  it('muestra el QR de LegalStation y cobra sin lienzo', () => {
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('.sign-pad')).toBeNull();
    expect(root.querySelector('.sign-qr')).not.toBeNull();
    expect(root.textContent).toContain('Sello QR LegalStation');
    expect(root.textContent).toContain('No es una rúbrica');
    expect(root.textContent).toContain('Pagar $15.00 y obtener QR');
    expect(root.textContent).not.toContain('Limpiar');
    expect(root.textContent).not.toContain('Confirmar');
    const steps = root.querySelector('.sign-steps') as HTMLElement;
    expect(getComputedStyle(steps).pointerEvents).toBe('none');
    expect(fixture.componentInstance.signatureFileName).toBe('sello-qr.png');
    expect(fixture.componentInstance.platformSignatureDataUrl.startsWith('data:image/png')).toBeTrue();
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
    const cta = (fixture.nativeElement as HTMLElement).querySelector('a.btn-primary');
    expect(cta?.getAttribute('href')).toBe('/caso/4');

    cmp.startReupload();
    expect(cmp.mode).toBe('upload');
    expect(cmp.selectedFile).toBeNull();
    expect(cmp.stampSrc).toBe('');
  });

  it('tras el cobro entrega el QR: descargar o aplicar a la minuta', fakeAsync(() => {
    api.sign.and.returnValue(of({
      image_url: '/sello-qr.png',
      signed_at: '2026-09-13',
      ip: '1.1.1.1',
      channel: 'platform',
      fee_cents: 1500,
    }));
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.textContent).toContain('$15.00');
    expect(root.textContent).toContain('Sello QR LegalStation');
    const cmp = fixture.componentInstance;
    cmp.submitPlatform();
    expect(api.sign).not.toHaveBeenCalled();
    expect(cmp.payStage).toBe('preparing');
    tick(500);
    expect(cmp.payStage).toBe('processing');
    tick(600);
    expect(cmp.payStage).toBe('approved');
    tick(600);
    expect(cmp.payStage).toBe('signed');
    tick(500);
    expect(api.sign).not.toHaveBeenCalled();
    expect(cmp.assetReady).toBeTrue();
    expect(cmp.mode).toBe('upload');
    expect(cmp.stampSrc).toContain('data:image/png');
    fixture.detectChanges();
    expect(root.textContent).toContain('Descargar');
    expect(root.textContent).toContain('Aplicar a la minuta');
    expect(root.textContent).toContain('sello-qr.png');
    cmp.applyToMinuta();
    expect(api.sign).toHaveBeenCalled();
    const [id, file, channel] = api.sign.calls.mostRecent().args;
    expect(id).toBe(4);
    expect(channel).toBe('platform');
    expect(file).toBeInstanceOf(File);
    expect((file as File).name).toBe('sello-qr.png');
    expect(cmp.mode).toBe('done');
    expect(cmp.payingPlatform).toBeFalse();
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('QR aplicado');
    cmp.startReupload();
    expect(cmp.stampSrc).toBe('');
    expect(cmp.signedAtLabel('2026-09-13T21:40:45Z')).toContain('2026');
    expect(cmp.signedAtLabel('t')).toBe('t');
  }));

  it('si aplicar falla, el QR sigue listo', fakeAsync(() => {
    api.sign.and.returnValue(throwError(() => ({ error: { error: 'cobro' } })));
    fixture.detectChanges();
    const cmp = fixture.componentInstance;
    cmp.submitPlatform();
    tick(2200);
    expect(cmp.assetReady).toBeTrue();
    cmp.applyToMinuta();
    expect(cmp.mode).toBe('upload');
    expect(cmp.assetReady).toBeTrue();
    expect(cmp.error).toBe('cobro');
  }));
});
