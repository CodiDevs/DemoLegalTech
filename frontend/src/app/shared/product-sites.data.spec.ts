import {
  PRODUCT_SITES,
  buildClientFlowCrumb,
  getDivorcioFormAction,
  getMarketingPrimaryAction,
  getProductQuestionnairePath,
  setActiveProduct,
  getActiveProduct,
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
    expect(getMarketingPrimaryAction('cliente', 'traslado360')).toEqual({
      label: 'Mis expedientes',
      path: '/cliente',
    });
    expect(getMarketingPrimaryAction('cliente', 'bienraiz360')).toEqual({
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

  it('lleva Iniciar Formulario al cuestionario, con auth si es invitado', () => {
    expect(getDivorcioFormAction(null)).toEqual({
      label: 'Iniciar Formulario',
      path: '/auth',
      query: { returnUrl: '/cuestionario', product: 'divorcio360' },
    });
    expect(getDivorcioFormAction('cliente')).toEqual({
      label: 'Iniciar Formulario',
      path: '/cuestionario',
    });
    expect(getDivorcioFormAction('cliente', 'traslado360')).toEqual({
      label: 'Iniciar Formulario',
      path: '/productos/traslado360/cuestionario',
    });
    expect(getDivorcioFormAction('abogado')).toBeNull();
    expect(getDivorcioFormAction('notario')).toBeNull();
  });

  it('conserva la ruta canónica del cuestionario Divorcio360', () => {
    expect(getProductQuestionnairePath('divorcio360')).toBe('/cuestionario');
  });

  it('usa teal LegalStation en los productos live', () => {
    for (const id of ['divorcio360', 'traslado360', 'bienraiz360'] as const) {
      expect(PRODUCT_SITES[id].accent).toBe('var(--primary)');
      expect(PRODUCT_SITES[id].accentDeep).toBe('var(--primary-hover)');
    }
  });

  it('publica métricas de producto sin copy de demo', () => {
    const site = PRODUCT_SITES['divorcio360'];
    const visibleCopy = JSON.stringify({
      heroLede: site.heroLede,
      workflow: site.workflow,
      values: site.values,
      stats: site.stats,
      plans: site.plans,
    });

    expect(site.stats.map((stat) => stat.value)).toEqual(['6 etapas', '1 expediente', '$349']);
    expect(site.plans.length).toBe(1);
    expect(visibleCopy).not.toMatch(/24\/7|1 click|SLA|timeline|intake|mismo costo/i);
    expect(visibleCopy).not.toMatch(/demo|demostración/i);
  });

  it('arma migas del flujo cliente ancladas en Mis trámites', () => {
    expect(buildClientFlowCrumb('traslado360', 'Documentos')).toEqual([
      { label: 'Mis trámites', link: '/cliente' },
      { label: 'Traslado360', link: '/productos/traslado360' },
      { label: 'Documentos' },
    ]);
  });

  it('persiste el producto activo al sincronizar desde un caso', () => {
    setActiveProduct('traslado360');
    expect(getActiveProduct()).toBe('traslado360');
    setActiveProduct('divorcio360');
    expect(getActiveProduct()).toBe('divorcio360');
  });
});
