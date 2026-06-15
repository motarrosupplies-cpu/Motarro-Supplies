import { calculateVatBreakdown, roundCurrency } from "@/lib/pricing/vat";
import type { KevroCartMetadata } from "@/types/kevro";

export interface KevroLineBreakdown {
  garmentUnitPrice: number;
  brandingUnitPrice: number;
  garmentTotal: number;
  brandingTotal: number;
  setupFee: number;
  subtotalExVat: number;
  vat: number;
  totalInclVat: number;
  brandingLabel?: string;
}

export interface CartTotals {
  garmentTotal: number;
  brandingTotal: number;
  setupFees: number;
  subtotalExVat: number;
  vat: number;
  totalInclVat: number;
}

export function getKevroLineBreakdown(
  item: {
    price: number;
    quantity?: number;
    kevro?: KevroCartMetadata;
  }
): KevroLineBreakdown | null {
  if (!item.kevro) {
    return null;
  }

  const quantity = item.quantity || 1;
  const includeBranding = item.kevro.wantsBranding !== false;
  const brandingUnitPrice = includeBranding
    ? (item.kevro.branding?.unitPrice ?? 0)
    : 0;
  const garmentUnitPrice =
    item.kevro.garmentUnitPrice ??
    roundCurrency((Number(item.price) || 0) - brandingUnitPrice);
  const setupFee = includeBranding ? Number(item.kevro.setupFee) || 0 : 0;
  const garmentTotal = roundCurrency(garmentUnitPrice * quantity);
  const brandingTotal = roundCurrency(brandingUnitPrice * quantity);
  const subtotalExVat = roundCurrency(garmentTotal + brandingTotal + setupFee);
  const vatBreakdown = calculateVatBreakdown(subtotalExVat);

  const brandingLabel =
    item.kevro.wantsBranding === false
      ? "Plain garment — no branding"
      : item.kevro.branding
        ? [
            item.kevro.branding.brandingType,
            item.kevro.branding.brandingPosition,
            item.kevro.branding.brandingSize,
          ]
            .filter(Boolean)
            .join(" · ")
        : undefined;

  return {
    garmentUnitPrice,
    brandingUnitPrice,
    garmentTotal,
    brandingTotal,
    setupFee,
    subtotalExVat,
    brandingLabel,
    ...vatBreakdown,
  };
}

export function getCartTotals(
  items: Array<{
    price: number;
    quantity?: number;
    kevro?: KevroCartMetadata;
  }>
): CartTotals {
  let garmentTotal = 0;
  let brandingTotal = 0;
  let setupFees = 0;

  for (const item of items) {
    const quantity = item.quantity || 1;
    const breakdown = getKevroLineBreakdown(item);

    if (breakdown) {
      garmentTotal += breakdown.garmentTotal;
      brandingTotal += breakdown.brandingTotal;
      setupFees += breakdown.setupFee;
      continue;
    }

    garmentTotal += roundCurrency((Number(item.price) || 0) * quantity);
  }

  const subtotalExVat = roundCurrency(garmentTotal + brandingTotal + setupFees);
  const vatBreakdown = calculateVatBreakdown(subtotalExVat);

  return {
    garmentTotal: roundCurrency(garmentTotal),
    brandingTotal: roundCurrency(brandingTotal),
    setupFees: roundCurrency(setupFees),
    subtotalExVat,
    ...vatBreakdown,
  };
}
