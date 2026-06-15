import type { KevroBrandingPrice } from "@/types/kevro";

export const STANDARD_BRANDING_SIZE_VALUE = "standard";

export interface BrandingSizeOption {
  value: string;
  label: string;
}

function isWildcardBrandingSize(size: string): boolean {
  const normalized = size.trim().toLowerCase();
  return !normalized || normalized === "all";
}

export function getBrandingSizeOptions(
  pricing: KevroBrandingPrice[],
  brandingType: string
): BrandingSizeOption[] {
  const rows = pricing.filter((row) => row.brandingType === brandingType);
  const seen = new Set<string>();
  const options: BrandingSizeOption[] = [];

  for (const row of rows) {
    const raw = row.brandingSize?.trim() || "";
    if (isWildcardBrandingSize(raw)) {
      continue;
    }
    if (seen.has(raw)) {
      continue;
    }
    seen.add(raw);
    options.push({ value: raw, label: raw });
  }

  if (options.length === 0 && rows.length > 0) {
    return [{ value: STANDARD_BRANDING_SIZE_VALUE, label: "Standard" }];
  }

  return options.sort((left, right) => left.label.localeCompare(right.label));
}

export function resolveBrandingPrice(
  pricing: KevroBrandingPrice[],
  brandingType: string,
  brandingSize: string,
  quantity: number
): KevroBrandingPrice | undefined {
  const rows = pricing
    .filter((row) => row.brandingType === brandingType)
    .filter((row) => {
      if (brandingSize === STANDARD_BRANDING_SIZE_VALUE) {
        return isWildcardBrandingSize(row.brandingSize || "");
      }
      return row.brandingSize === brandingSize;
    })
    .sort((left, right) => right.qty - left.qty);

  if (rows.length === 0) {
    return undefined;
  }

  const safeQty = Math.max(1, quantity);
  return (
    rows.find((row) => safeQty >= row.qty) ?? rows[rows.length - 1]
  );
}
