export const VAT_RATE = 0.15;

export interface VatBreakdown {
  subtotalExVat: number;
  vat: number;
  totalInclVat: number;
}

export function calculateVatBreakdown(subtotalExVat: number): VatBreakdown {
  const safe = Math.max(0, Number(subtotalExVat) || 0);
  const vat = roundCurrency(safe * VAT_RATE);
  return {
    subtotalExVat: roundCurrency(safe),
    vat,
    totalInclVat: roundCurrency(safe + vat),
  };
}

export function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}
