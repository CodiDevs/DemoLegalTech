import { ApiService } from '../../../core/api.service';
import { AdvancedStatsComponent } from './advanced-stats.component';

function make(): AdvancedStatsComponent {
  const api = { mockMetrics: () => ({ subscribe: () => undefined }) } as unknown as ApiService;
  const c = new AdvancedStatsComponent(api);
  c.loading = false;
  c.error = false;
  return c;
}

describe('AdvancedStatsComponent resumen', () => {
  it('headAside es dinero · activos · pendientes, no un grid de KPIs', () => {
    const c = make();
    c.metrics = { ingreso_mes_usd: 4200, casos_activos: 12 };
    c.cases = [
      { id: 1, client: 'A', status: '03', status_label: 'Revisión', days: 5, action_required: true },
      { id: 2, client: 'B', status: '04', status_label: 'Minuta', days: 1, action_required: false },
    ];

    expect(c.pendingActionCount).toBe(1);
    expect(c.headAside).toContain('12 activos');
    expect(c.headAside).toContain('1 pendiente');
    expect(c.headAside).not.toContain('KPI');
  });

  it('Detenidos manda estado a la bandeja', () => {
    const c = make();
    expect(c.holdQuery({
      stage: 'Firma',
      stage_code: '05',
      count: 8,
      avg_days: 6.4,
      impact: 'high',
      detail: '',
      action: '',
      action_url: '/abogado',
    })).toEqual({ estado: '05' });
  });
});
