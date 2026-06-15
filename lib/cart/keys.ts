import type { KevroCartMetadata } from "@/types/kevro";

export function buildCartItemKey(item: {
  id: string;
  variantId?: string;
  selectedSize?: string;
  selectedColor?: string;
  kevro?: KevroCartMetadata;
}): string {
  const brandingKey = item.kevro?.branding
    ? `${item.kevro.branding.brandingType}|${item.kevro.branding.brandingPosition}|${item.kevro.branding.brandingSize}`
    : "";
  return `${item.id}|${item.variantId ?? ""}|${item.selectedSize ?? ""}|${item.selectedColor ?? ""}|${brandingKey}`;
}
