export function cinematicPath(url: string): boolean {
  const path = url.split('?')[0].split('#')[0];
  return !(path.startsWith('/abogado') || path.startsWith('/fase2'));
}

/** Play the paper curtain if origin or destination is cinematic. Never abogado ↔ fase2. */
export function shouldPlayRouteCurtain(fromUrl: string, toUrl: string): boolean {
  return cinematicPath(fromUrl) || cinematicPath(toUrl);
}
