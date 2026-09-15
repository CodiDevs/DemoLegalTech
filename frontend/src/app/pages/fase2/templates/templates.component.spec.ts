import { ApiService } from '../../../core/api.service';
import { ConfirmService } from '../../../core/confirm.service';
import { Fase2TemplatesComponent } from './templates.component';

describe('Fase2TemplatesComponent modelos', () => {
  it('categoría va en título, no en slug uppercase', () => {
    const api = { mockTemplates: () => ({ subscribe: () => undefined }) } as unknown as ApiService;
    const confirm = {} as ConfirmService;
    const c = new Fase2TemplatesComponent(api, confirm);
    expect(c.catLabel('familia')).toBe('Familia');
    expect(c.catLabel('penal')).toBe('Penal');
  });
});
