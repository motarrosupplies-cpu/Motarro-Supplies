import { formatCurrency } from "@/lib/utils";

/** User-facing label for the base product line in price breakdowns (not only apparel). */
export const PRICE_ITEM_LABEL = "Item";

interface PriceBreakdownProps {
  garmentTotal: number;
  brandingTotal?: number;
  setupFee?: number;
  subtotalExVat: number;
  vat: number;
  totalInclVat: number;
  compact?: boolean;
}

export function PriceBreakdown({
  garmentTotal,
  brandingTotal = 0,
  setupFee = 0,
  subtotalExVat,
  vat,
  totalInclVat,
  compact = false,
}: PriceBreakdownProps) {
  const rowClass = compact
    ? "flex justify-between text-xs text-muted-foreground"
    : "flex justify-between text-sm";

  return (
    <div className={compact ? "space-y-1" : "space-y-2 rounded-xl border bg-muted/30 p-4"}>
      <div className={rowClass}>
        <span>{PRICE_ITEM_LABEL}</span>
        <span>{formatCurrency(garmentTotal)}</span>
      </div>
      {brandingTotal > 0 && (
        <div className={rowClass}>
          <span>Branding</span>
          <span>{formatCurrency(brandingTotal)}</span>
        </div>
      )}
      {setupFee > 0 && (
        <div className={rowClass}>
          <span>Setup fee</span>
          <span>{formatCurrency(setupFee)}</span>
        </div>
      )}
      <div className={`${rowClass} border-t pt-2`}>
        <span>Subtotal (excl. VAT)</span>
        <span>{formatCurrency(subtotalExVat)}</span>
      </div>
      <div className={rowClass}>
        <span>VAT (15%)</span>
        <span>{formatCurrency(vat)}</span>
      </div>
      <div
        className={
          compact
            ? "flex justify-between text-sm font-semibold text-primary"
            : "flex justify-between text-base font-bold text-primary border-t pt-2"
        }
      >
        <span>Total (incl. VAT)</span>
        <span>{formatCurrency(totalInclVat)}</span>
      </div>
    </div>
  );
}
