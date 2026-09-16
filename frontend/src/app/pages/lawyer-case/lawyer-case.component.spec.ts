import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { ConfirmService } from '../../core/confirm.service';
import { LawyerCaseComponent } from './lawyer-case.component';

function makeCase(): LawyerCaseComponent {
  const api = {
    getLawyerWorkspace: () => ({ subscribe: () => undefined }),
    mockSatjeLinks: () => ({ subscribe: () => undefined }),
  } as unknown as ApiService;
  const route = { snapshot: { paramMap: { get: () => '6' } } } as unknown as ActivatedRoute;
  const confirm = {} as ConfirmService;
  return new LawyerCaseComponent(route, api, confirm);
}

describe('LawyerCaseComponent expediente', () => {
  it('cuestionario arranca cerrado y omite tenencia/liquidación irrelevantes', () => {
    const c = makeCase();
    expect(c.qOpen).toBeFalse();

    const rows = c.buildQRows({
      have_children: false,
      custody_regulated: false,
      has_mediation_acta: false,
      minor_dependents: false,
      have_assets: false,
      want_liquidate_assets: true,
      city: 'Quito',
      country: 'ec',
    });
    const keys = rows.map((r) => r.key);
    expect(keys).not.toContain('custody_regulated');
    expect(keys).not.toContain('has_mediation_acta');
    expect(keys).not.toContain('minor_dependents');
    expect(keys).not.toContain('want_liquidate_assets');
    expect(keys).toContain('city');
    expect(rows.find((r) => r.key === 'country')?.value).toBe('Ecuador');
  });

  it('etapas usan nombre corto, no el código 01-10', () => {
    const c = makeCase();
    expect(c.stageName('03')).toBe('Revisión');
    expect(c.stageName('04')).toBe('Minuta');
  });

  it('la primera acción que no sea revert_step es la primaria', () => {
    const c = makeCase();
    c.ws = {
      next_actions: [
        { id: 'revert_step', label: 'Revertir' },
        { id: 'approve_pack', label: 'Aprobar' },
      ],
    };
    expect(c.isPrimaryAction({ id: 'revert_step' })).toBeFalse();
    expect(c.isPrimaryAction({ id: 'approve_pack' })).toBeTrue();
  });

  it('quita el em dash del aviso de firma', () => {
    const c = makeCase();
    expect(c.plainCopy('Aviso de firma virtual — el cliente firma')).toBe(
      'Aviso de firma virtual. El cliente firma',
    );
  });
});
