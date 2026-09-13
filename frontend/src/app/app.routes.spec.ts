import { routes } from './app.routes';

describe('lazy routes', () => {
  it('carga páginas cliente con loadComponent y conserva guards', () => {
    const children = routes.find((route) => route.path === '')?.children ?? [];
    const byPath = (path: string) => children.find((route) => route.path === path);

    expect(byPath('')?.loadComponent).toEqual(jasmine.any(Function));
    expect(byPath('productos/divorcio360')?.loadComponent).toEqual(jasmine.any(Function));
    expect(byPath('cuestionario')?.loadComponent).toEqual(jasmine.any(Function));
    expect(byPath('checkout/:id')?.loadComponent).toEqual(jasmine.any(Function));
    expect(byPath('upload/:id')?.loadComponent).toEqual(jasmine.any(Function));
    expect(byPath('firma/:id')?.loadComponent).toEqual(jasmine.any(Function));
    expect(byPath('abogado')?.loadComponent).toEqual(jasmine.any(Function));
    expect(byPath('abogado')?.canActivate?.length).toBeGreaterThan(0);
    expect(byPath('cuestionario')?.canActivate?.length).toBeGreaterThan(0);
  });
});
