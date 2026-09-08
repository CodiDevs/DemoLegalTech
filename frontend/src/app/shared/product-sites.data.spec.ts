import {
  PRODUCT_SITES,
  getMarketingPrimaryAction,
  getProductQuestionnairePath,
} from './product-sites.data';

describe('product-sites.data', () => {
  it('resuelve una sola acción primaria por rol', () => {
    expect(getMarketingPrimaryAction(null, 'divorcio360')).toEqual({
      label: 'Evaluar mi caso',
      path: '/cuestionario',
    });
    expect(getMarketingPrimaryAction('cliente', 'divorcio360')).toEqual({
      label: 'Mis expedientes',
      path: '/cliente',
    });
    expect(getMarketingPrimaryAction('abogado', 'divorcio360')).toEqual({
      label: 'Panel de casos',
      path: '/abogado',
    });
    expect(getMarketingPrimaryAction('notario', 'divorcio360')).toEqual({
      label: 'Inicio',
      path: '/',
    });
  });

  it('conserva la ruta canónica del cuestionario Divorcio360', () => {
    expect(getProductQuestionnairePath('divorcio360')).toBe('/cuestionario');
  });

  it('publica solo métricas verificables dentro de la demostración', () => {
    const site = PRODUCT_SITES['divorcio360'];
    const visibleCopy = JSON.stringify({
      heroLede: site.heroLede,
      workflow: site.workflow,
      values: site.values,
      stats: site.stats,
      plans: site.plans,
    });

    expect(site.stats.map((stat) => stat.value)).toEqual(['6 etapas', '1 expediente', '$349 demo']);
    expect(site.plans.length).toBe(1);
    expect(visibleCopy).not.toMatch(/24\/7|1 click|SLA|timeline|intake|mismo costo/i);
    expect(visibleCopy).toContain('demostración');
  });
});
