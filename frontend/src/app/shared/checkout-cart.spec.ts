import { buildCheckoutCart, chargedLineCents, NOTARY_FEE_CENTS } from './checkout-cart';

describe('checkout cart arithmetic', () => {
  it('las líneas cobradas igualan el total y excluyen billedSeparately', () => {
    const cart = buildCheckoutCart(34900, { have_children: true });
    expect(chargedLineCents(cart)).toBe(cart.totalCents);
    expect(cart.totalCents).toBe(34900);
    const notary = cart.lines.find((line) => line.id === 'notary');
    expect(notary?.billedSeparately).toBeTrue();
    expect(notary?.referenceCents).toBe(NOTARY_FEE_CENTS);
    expect(chargedLineCents(cart)).not.toBe(cart.totalCents + NOTARY_FEE_CENTS);
  });
});
