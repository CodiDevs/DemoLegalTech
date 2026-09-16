/** QR v1, alphanumeric, ECC L. Enough for `LEGALSTATION.EC/V/{id}`. */

const ALPHANUM = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:';
const SIZE = 21;
const EC_COUNT = 7;
const DATA_COUNT = 19;
const FORMAT_L = [
  0b111011111000100, 0b111001011110011, 0b111110110101010, 0b111100010011101,
  0b110011000101111, 0b110001100011000, 0b110110001000001, 0b110100101110110,
];

const EXP = new Uint8Array(256);
const LOG = new Uint8Array(256);
(() => {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    EXP[i] = x;
    LOG[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
})();

function gfMul(a: number, b: number): number {
  if (!a || !b) return 0;
  return EXP[(LOG[a] + LOG[b]) % 255];
}

function rsEncode(data: Uint8Array): Uint8Array {
  let gen = [1];
  for (let i = 0; i < EC_COUNT; i++) {
    const next = new Array(gen.length + 1).fill(0);
    for (let j = 0; j < gen.length; j++) {
      next[j] ^= gen[j];
      next[j + 1] ^= gfMul(gen[j], EXP[i]);
    }
    gen = next;
  }
  const ecc = new Uint8Array(EC_COUNT);
  for (const byte of data) {
    const factor = byte ^ ecc[0];
    ecc.copyWithin(0, 1);
    ecc[EC_COUNT - 1] = 0;
    if (!factor) continue;
    for (let i = 0; i < EC_COUNT; i++) {
      ecc[i] ^= gfMul(gen[i + 1], factor);
    }
  }
  return ecc;
}

function pushBits(bits: number[], value: number, len: number): void {
  for (let i = len - 1; i >= 0; i--) bits.push((value >> i) & 1);
}

function encodeAlphanumeric(text: string): Uint8Array {
  const bits: number[] = [];
  pushBits(bits, 0b0010, 4);
  pushBits(bits, text.length, 9);
  for (let i = 0; i < text.length; ) {
    const a = ALPHANUM.indexOf(text[i]);
    if (i + 1 < text.length) {
      const b = ALPHANUM.indexOf(text[i + 1]);
      pushBits(bits, a * 45 + b, 11);
      i += 2;
    } else {
      pushBits(bits, a, 6);
      i += 1;
    }
  }
  const room = DATA_COUNT * 8 - bits.length;
  pushBits(bits, 0, Math.min(4, Math.max(0, room)));
  while (bits.length % 8) bits.push(0);
  const bytes = new Uint8Array(DATA_COUNT);
  for (let i = 0; i < bits.length && i / 8 < DATA_COUNT; i += 8) {
    let v = 0;
    for (let b = 0; b < 8; b++) v = (v << 1) | (bits[i + b] || 0);
    bytes[i / 8] = v;
  }
  const pads = [0xec, 0x11];
  let p = 0;
  for (let i = Math.ceil(bits.length / 8); i < DATA_COUNT; i++) {
    bytes[i] = pads[p & 1];
    p++;
  }
  return bytes;
}

function reserved(r: number, c: number): boolean {
  if (r < 9 && c < 9) return true;
  if (r < 9 && c >= SIZE - 8) return true;
  if (r >= SIZE - 8 && c < 9) return true;
  if (r === 6 || c === 6) return true;
  if (c === 8 && r < 9) return true;
  if (r === 8 && c < 9) return true;
  if (r === 8 && c >= SIZE - 8) return true;
  if (c === 8 && r >= SIZE - 8) return true;
  return false;
}

function paintFinder(m: boolean[][], r0: number, c0: number): void {
  for (let r = 0; r < 7; r++) {
    for (let c = 0; c < 7; c++) {
      const edge = r === 0 || r === 6 || c === 0 || c === 6;
      const core = r >= 2 && r <= 4 && c >= 2 && c <= 4;
      m[r0 + r][c0 + c] = edge || core;
    }
  }
}

function applyMask(r: number, c: number, bit: boolean, mask: number): boolean {
  let on = false;
  switch (mask) {
    case 0: on = (r + c) % 2 === 0; break;
    case 1: on = r % 2 === 0; break;
    case 2: on = c % 3 === 0; break;
    case 3: on = (r + c) % 3 === 0; break;
    case 4: on = (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0; break;
    case 5: on = ((r * c) % 2) + ((r * c) % 3) === 0; break;
    case 6: on = (((r * c) % 2) + ((r * c) % 3)) % 2 === 0; break;
    default: on = (((r + c) % 2) + ((r * c) % 3)) % 2 === 0; break;
  }
  return on ? !bit : bit;
}

function paintFormat(m: boolean[][], bits: number): void {
  const seq: [number, number][] = [];
  for (let c = 0; c <= 5; c++) seq.push([8, c]);
  seq.push([8, 7], [8, 8], [7, 8]);
  for (let r = 5; r >= 0; r--) seq.push([r, 8]);
  const seq2: [number, number][] = [];
  for (let r = SIZE - 1; r >= SIZE - 7; r--) seq2.push([r, 8]);
  for (let c = SIZE - 8; c < SIZE; c++) seq2.push([8, c]);
  for (let i = 0; i < 15; i++) {
    const bit = ((bits >> (14 - i)) & 1) === 1;
    m[seq[i][0]][seq[i][1]] = bit;
    m[seq2[i][0]][seq2[i][1]] = bit;
  }
  m[SIZE - 8][8] = true;
}

export function esignQrPayload(caseId: number): string {
  return `LEGALSTATION.EC/V/${Math.max(0, Math.floor(caseId))}`;
}

export function qrMatrix(text: string, mask = 0): boolean[][] {
  const raw = text
    .toUpperCase()
    .split('')
    .map((ch) => (ALPHANUM.includes(ch) ? ch : '/'))
    .join('')
    .slice(0, 25);
  const data = encodeAlphanumeric(raw);
  const ecc = rsEncode(data);
  const stream = new Uint8Array(DATA_COUNT + EC_COUNT);
  stream.set(data, 0);
  stream.set(ecc, DATA_COUNT);
  const bits: number[] = [];
  for (const b of stream) pushBits(bits, b, 8);

  const m = Array.from({ length: SIZE }, () => Array<boolean>(SIZE).fill(false));
  paintFinder(m, 0, 0);
  paintFinder(m, 0, SIZE - 7);
  paintFinder(m, SIZE - 7, 0);
  for (let i = 8; i < SIZE - 8; i++) {
    m[6][i] = i % 2 === 0;
    m[i][6] = i % 2 === 0;
  }

  let bi = 0;
  let up = true;
  for (let col = SIZE - 1; col > 0; col -= 2) {
    if (col === 6) col--;
    for (let i = 0; i < SIZE; i++) {
      const r = up ? SIZE - 1 - i : i;
      for (const c of [col, col - 1]) {
        if (c < 0 || reserved(r, c)) continue;
        const bit = (bits[bi] || 0) === 1;
        m[r][c] = applyMask(r, c, bit, mask);
        bi++;
      }
    }
    up = !up;
  }
  paintFormat(m, FORMAT_L[mask] ?? FORMAT_L[0]);
  return m;
}

export function qrPngDataUrl(text: string): string {
  const matrix = qrMatrix(text);
  const quiet = 4;
  const scale = 8;
  const dim = (SIZE + quiet * 2) * scale;
  const canvas = document.createElement('canvas');
  canvas.width = dim;
  canvas.height = dim;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, dim, dim);
  ctx.fillStyle = '#2b2824';
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (!matrix[r][c]) continue;
      ctx.fillRect((c + quiet) * scale, (r + quiet) * scale, scale, scale);
    }
  }
  return canvas.toDataURL('image/png');
}
