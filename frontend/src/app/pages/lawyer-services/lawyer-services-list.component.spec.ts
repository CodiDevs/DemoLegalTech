import { ApiService } from '../../core/api.service';
import { ConfirmService } from '../../core/confirm.service';
import { LawyerServicesListComponent } from './lawyer-services-list.component';

describe('LawyerServicesListComponent', () => {
  it('conteos viven en el masthead, no en tiles de filtro', () => {
    const api = { listLawyerServices: () => ({ subscribe: () => undefined }) } as unknown as ApiService;
    const confirm = {} as ConfirmService;
    const c = new LawyerServicesListComponent(api, confirm);
    c.loading = false;
    c.services = [
      { id: 1, status: 'publicado', category: 'familia' } as any,
      { id: 2, status: 'publicado', category: 'penal' } as any,
      { id: 3, status: 'borrador', category: 'civil' } as any,
    ];
    expect(c.count('all')).toBe(3);
    expect(c.headAside).toBe('2 publicados · 1 borrador');
    expect(c.lanes.every((l) => !('n' in l))).toBeTrue();
    expect(c.categoryLabel('familia')).toBe('Familia');
  });
});
