import { esignQrPayload, qrMatrix } from './qr-png';

describe('qr-png', () => {
  it('arma payload alfanumérico corto', () => {
    expect(esignQrPayload(6)).toBe('LEGALSTATION.EC/V/6');
    expect(esignQrPayload(16).length).toBeLessThanOrEqual(25);
  });

  it('matriz v1 con buscadores en las esquinas', () => {
    const m = qrMatrix(esignQrPayload(6));
    expect(m.length).toBe(21);
    expect(m[0].length).toBe(21);
    expect(m[0][0]).toBeTrue();
    expect(m[0][6]).toBeTrue();
    expect(m[6][0]).toBeTrue();
    expect(m[1][1]).toBeFalse();
    expect(m[3][3]).toBeTrue();
    expect(m[0][14]).toBeTrue();
    expect(m[14][0]).toBeTrue();
  });
});
