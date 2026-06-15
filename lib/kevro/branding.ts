import {
  fetchKevroBrandingPositions,
  fetchKevroBrandingPricing,
} from "@/lib/kevro/client";
import type {
  KevroBrandingPosition,
  KevroBrandingPrice,
} from "@/types/kevro";

function normalizePositions(rows: unknown[]): KevroBrandingPosition[] {
  return (rows as Record<string, unknown>[]).map((row) => ({
    stockHeaderId: Number(row.StockHeaderID),
    description: String(row.Description ?? ""),
    brandingType: String(row.BrandingType ?? ""),
    brandingPosition: String(row.BrandingPosition ?? ""),
    notes: row.Notes ? String(row.Notes) : undefined,
  }));
}

function normalizePricing(rows: unknown[]): KevroBrandingPrice[] {
  return (rows as Record<string, unknown>[]).map((row) => ({
    stockHeaderId: Number(row.StockHeaderID),
    description: String(row.Description ?? ""),
    brandingType: String(row.BrandingType ?? ""),
    brandingSize: String(row.BrandingSize ?? ""),
    brandingColours: Number(row.BrandingColours ?? 1),
    unitPrice: Number(row.DiscountedUnitPrice ?? row.UnitPrice ?? 0),
    discountedUnitPrice: Number(row.DiscountedUnitPrice ?? row.UnitPrice ?? 0),
    setupFee: Number(row.DiscountedSetupFee ?? row.setupFee ?? 0),
    discountedSetupFee: Number(row.DiscountedSetupFee ?? row.setupFee ?? 0),
    qty: Number(row.Qty ?? 1),
  }));
}

export async function getKevroBrandingForProduct(stockHeaderId: number) {
  const [positions, pricing] = await Promise.all([
    fetchKevroBrandingPositions(stockHeaderId),
    fetchKevroBrandingPricing(stockHeaderId),
  ]);

  const normalizedPositions = normalizePositions(positions);
  const normalizedPricing = normalizePricing(pricing);
  const brandingTypes = [
    ...new Set(normalizedPositions.map((row) => row.brandingType)),
  ].sort();

  return {
    brandingTypes,
    positions: normalizedPositions,
    pricing: normalizedPricing,
  };
}
