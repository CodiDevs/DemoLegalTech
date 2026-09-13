/** Cobro aparte de firma de plataforma. Keep in sync with backend PlatformFeeCents. */
export const ESIGN_FEE_CENTS = 1500;

export function signatureChannelLabel(channel?: string): string {
  return channel === 'platform'
    ? `Firma LegalStation ($${ESIGN_FEE_CENTS / 100} aparte)`
    : 'Documento subido por el cliente';
}
