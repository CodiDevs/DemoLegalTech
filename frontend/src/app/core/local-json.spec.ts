import {
  clearLocalJson,
  readLocalJson,
  writeLocalAndSessionJson,
  writeLocalJson,
} from './local-json';

describe('local-json', () => {
  const key = 'd360_test_local_json';

  afterEach(() => clearLocalJson(key));

  it('roundtrips in localStorage', () => {
    writeLocalJson(key, { n: 2 });
    expect(readLocalJson<{ n: number }>(key)).toEqual({ n: 2 });
  });

  it('lee sessionStorage si local está vacío', () => {
    sessionStorage.setItem(key, JSON.stringify({ from: 'session' }));
    expect(readLocalJson<{ from: string }>(key)).toEqual({ from: 'session' });
  });

  it('escribe las dos capas', () => {
    writeLocalAndSessionJson(key, { both: true });
    expect(JSON.parse(localStorage.getItem(key) || '{}')).toEqual({ both: true });
    expect(JSON.parse(sessionStorage.getItem(key) || '{}')).toEqual({ both: true });
  });
});
