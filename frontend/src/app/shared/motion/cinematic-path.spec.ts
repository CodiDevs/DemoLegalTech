import { cinematicPath, shouldPlayRouteCurtain } from './cinematic-path';

describe('cinematicPath', () => {
  it('trata marketing y trámites como cinematicos', () => {
    expect(cinematicPath('/')).toBeTrue();
    expect(cinematicPath('/productos/divorcio360?x=1')).toBeTrue();
    expect(cinematicPath('/cuestionario#paso')).toBeTrue();
    expect(cinematicPath('/auth')).toBeTrue();
  });

  it('excluye abogado y fase2', () => {
    expect(cinematicPath('/abogado')).toBeFalse();
    expect(cinematicPath('/abogado/caso/1')).toBeFalse();
    expect(cinematicPath('/fase2/admin')).toBeFalse();
  });
});

describe('shouldPlayRouteCurtain', () => {
  it('cubre entrada al cliente path desde abogado', () => {
    expect(shouldPlayRouteCurtain('/abogado', '/')).toBeTrue();
    expect(shouldPlayRouteCurtain('/abogado', '/productos/divorcio360')).toBeTrue();
  });

  it('no cubre abogado ↔ fase2', () => {
    expect(shouldPlayRouteCurtain('/abogado', '/fase2/admin')).toBeFalse();
    expect(shouldPlayRouteCurtain('/abogado/caso/1', '/abogado')).toBeFalse();
  });
});
