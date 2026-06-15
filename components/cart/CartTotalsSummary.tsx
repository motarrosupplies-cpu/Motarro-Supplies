"use client";

import { useMemo } from "react";
import { useCart } from "@/components/cart-provider";
import { PriceBreakdown } from "@/components/pricing/PriceBreakdown";
import { getCartTotals } from "@/lib/cart/kevro-breakdown";

interface CartTotalsSummaryProps {
  compact?: boolean;
  showShippingNote?: boolean;
  freeDeliveryThreshold?: number;
}

export function CartTotalsSummary({
  compact = false,
  showShippingNote = false,
  freeDeliveryThreshold = 1000,
}: CartTotalsSummaryProps) {
  const { items } = useCart();
  const totals = useMemo(() => getCartTotals(items), [items]);

  return (
    <div className="space-y-3">
      <PriceBreakdown
        garmentTotal={totals.garmentTotal}
        brandingTotal={totals.brandingTotal}
        setupFee={totals.setupFees}
        subtotalExVat={totals.subtotalExVat}
        vat={totals.vat}
        totalInclVat={totals.totalInclVat}
        compact={compact}
      />
      {showShippingNote && (
        <p className="text-xs text-muted-foreground">
          {totals.totalInclVat >= freeDeliveryThreshold
            ? "You qualify for free delivery."
            : `Free delivery on orders over R${freeDeliveryThreshold.toFixed(2)} (incl. VAT).`}
        </p>
      )}
    </div>
  );
}
