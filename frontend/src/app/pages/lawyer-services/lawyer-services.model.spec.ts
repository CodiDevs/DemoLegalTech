import { categoryLabel, moneyUSD } from './lawyer-services.model';

describe('lawyer services model', () => {
  it('labels known categories', () => {
    expect(categoryLabel('penal')).toBe('Penal');
    expect(categoryLabel('otro')).toBe('otro');
  });

  it('formats honorario in USD', () => {
    expect(moneyUSD(189)).toBe('$189.00');
  });
});
