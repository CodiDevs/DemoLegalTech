import { ApiService, CaseItem } from '../../core/api.service';
import { ClientPanelComponent } from './client-panel.component';

function caseItem(partial: Partial<CaseItem> & Pick<CaseItem, 'id' | 'status'>): CaseItem {
  return {
    client_id: 1,
    status_label: partial.status_label || 'En trámite',
    result: 'apto',
    city: partial.city || 'Quito',
    paid: partial.paid ?? true,
    amount_cents: partial.amount_cents ?? 34900,
    created_at: '',
    updated_at: '',
    product: partial.product || 'divorcio360',
    can_sign: partial.can_sign,
    sign_hint: partial.sign_hint,
    has_signature: partial.has_signature,
    ...partial,
  };
}

function makePanel(cases: CaseItem[]): ClientPanelComponent {
  const api = { listCases: () => ({ subscribe: () => undefined }) } as unknown as ApiService;
  const router = { navigate: () => Promise.resolve(true) } as unknown as import('@angular/router').Router;
  const panel = new ClientPanelComponent(api, router);
  panel.cases = cases;
  panel.loading = false;
  panel.error = false;
  return panel;
}

describe('ClientPanelComponent expediente layout', () => {
  const unpaid = caseItem({ id: 1, status: '01', paid: false, status_label: 'Por pagar' });
  const upload = caseItem({ id: 2, status: '02', status_label: 'Documentos' });
  const waiting = caseItem({ id: 3, status: '03', status_label: 'Revisión' });
  const signable = caseItem({
    id: 5,
    status: '05',
    can_sign: true,
    sign_hint: 'Firma registrada — puedes volver a firmar si lo necesitas (100% virtual).',
    status_label: 'Firmas',
  });
  const closed = caseItem({ id: 9, status: '10', status_label: 'Cerrado' });

  it('parte needsYou en actionInView y el resto en archiveInView', () => {
    const panel = makePanel([unpaid, upload, waiting, signable, closed]);
    panel.filter = 'all';

    expect(panel.actionInView.map((c) => c.id)).toEqual([unpaid.id, signable.id, upload.id]);
    expect(panel.archiveInView.map((c) => c.id)).toEqual([closed.id, waiting.id]);
  });

  it('lo más urgente encabeza la lista y es el caso abierto del desk', () => {
    const panel = makePanel([upload, signable, unpaid]);
    panel.product = 'divorcio360';

    expect(panel.actionInView[0].id).toBe(unpaid.id);
    expect(panel.openCaseId).toBe(unpaid.id);
    expect(panel.openCaseInView).toBeTrue();
  });

  it('títulos de dossier usan verbo humano', () => {
    const panel = makePanel([]);
    expect(panel.dossierTitle(unpaid)).toBe('Completa el pago');
    expect(panel.dossierTitle(signable)).toBe('Firma tu minuta');
    expect(panel.dossierTitle(upload)).toBe('Sube tus documentos');
    expect(panel.dossierTitle(waiting)).toBe('Revisión');
  });

  it('rowLink apunta al siguiente paso del flujo', () => {
    const panel = makePanel([]);
    expect(panel.rowLink(unpaid)).toEqual(['/checkout', 1]);
    expect(panel.rowLink(signable)).toEqual(['/firma', 5]);
    expect(panel.rowLink(upload)).toEqual(['/upload', 2]);
    expect(panel.rowLink(waiting)).toEqual(['/caso', 3]);
  });

  it('metaLine describe pago y etapa en prosa sin pips', () => {
    const panel = makePanel([]);
    expect(panel.metaLine(signable)).toBe('Pagado · $349 · Etapa 5: Firma');
    expect(panel.metaLine(unpaid)).toBe('Por pagar · $349 · Etapa 1: Recepción');
  });

  it('lede solo cuando el archivo es todo lo que queda', () => {
    const withAction = makePanel([signable, waiting]);
    expect(withAction.pageLede).toBe('');

    const archiveOnly = makePanel([waiting, closed]);
    expect(archiveOnly.pageLede).toContain('Nada pendiente');
  });

  it('archiveHeading refleja el filtro activo', () => {
    const panel = makePanel([waiting, closed]);
    panel.filter = 'done';
    expect(panel.archiveHeading).toBe('Cerrados');
    panel.filter = 'open';
    expect(panel.archiveHeading).toBe('En curso');
    panel.filter = 'all';
    expect(panel.archiveHeading).toBe('Todos');
  });

  it('sidebar lista el catálogo y filtra el mismo panel', () => {
    const traslado = caseItem({ id: 8, status: '03', product: 'traslado360' });
    const panel = makePanel([signable, waiting, traslado]);
    panel.filter = 'all';

    expect(panel.liveServices.every((s) => s.live)).toBeTrue();
    expect(panel.liveServices.some((s) => s.id === 'divorcio360')).toBeTrue();
    expect(panel.countProductTotal('divorcio360')).toBe(2);
    expect(panel.countProductTotal('traslado360')).toBe(1);

    panel.setProduct('traslado360');
    expect(panel.product).toBe('traslado360');
    expect(panel.pageTitle).toBe('Traslado360');
    expect(panel.filtered.map((c) => c.id)).toEqual([8]);
    expect(panel.startPath).toBe('/productos/traslado360/cuestionario');
  });

  it('Divorcio360 abre escritorio in-panel con timeline', () => {
    const panel = makePanel([signable, waiting]);
    panel.setProduct('divorcio360');

    expect(panel.product).toBe('divorcio360');
    expect(panel.divorcioCase?.id).toBe(signable.id);
    expect(panel.divorcioStep).toBe('sign');
    expect(panel.divorcioTimeline.map((s) => s.id)).toEqual([
      'pay', 'docs', 'call', 'sign', 'notary',
    ]);
    expect(panel.divorcioTimeline.find((s) => s.id === 'sign')?.state).toBe('current');
    expect(panel.divorcioTimeline.find((s) => s.id === 'pay')?.state).toBe('done');
  });

  it('Traslado360 abre el mismo escritorio in-panel', () => {
    const traslado = caseItem({
      id: 6,
      status: '02',
      product: 'traslado360',
      amount_cents: 19900,
      status_label: 'Documentos',
    });
    const panel = makePanel([signable, traslado]);
    panel.setProduct('traslado360');

    expect(panel.product).toBe('traslado360');
    expect(panel.deskCase?.id).toBe(6);
    expect(panel.deskStep).toBe('docs');
    expect(panel.deskTimeline.find((s) => s.id === 'docs')?.state).toBe('current');
    expect(panel.isDeskProduct('traslado360')).toBeTrue();
  });

  it('activateCase de divorcio no navega fuera del panel', () => {
    const panel = makePanel([signable]);
    panel.activateCase(signable);
    expect(panel.product).toBe('divorcio360');
    expect(panel.divorcioStep).toBe('sign');
  });

  it('activateCase de traslado entra al escritorio', () => {
    const traslado = caseItem({ id: 6, status: '02', product: 'traslado360', amount_cents: 19900 });
    const panel = makePanel([traslado]);
    panel.activateCase(traslado);
    expect(panel.product).toBe('traslado360');
    expect(panel.deskStep).toBe('docs');
  });

  it('no activa servicios próximamente desde el sidebar', () => {
    const panel = makePanel([signable]);
    panel.setProduct('signdesk');
    expect(panel.product).toBe('all');
  });
});
