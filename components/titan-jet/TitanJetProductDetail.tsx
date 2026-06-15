"use client";

import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { PreviousPageButton } from "@/components/previous-page-button";
import { ProductDetailImage } from "@/components/optimized-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/components/cart-provider";
import { formatCurrency } from "@/lib/utils";
import { calculateVatBreakdown, roundCurrency } from "@/lib/pricing/vat";
import { PriceBreakdown } from "@/components/pricing/PriceBreakdown";
import { toast } from "sonner";
import type { TitanJetProduct } from "@/types/titan-jet";

export function TitanJetProductDetail({ product }: { product: TitanJetProduct }) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const variant = product.variants[0];
  const unitPrice = variant?.displayPrice ?? product.minPrice;
  const garmentTotal = roundCurrency(unitPrice * quantity);
  const priceBreakdown = calculateVatBreakdown(garmentTotal);

  function handleAddToCart() {
    if (!product.id) {
      toast.error("This product is not synced yet. Please try again after the catalog sync completes.");
      return;
    }
    if (!variant?.inStock) {
      toast.error("This product is currently out of stock");
      return;
    }
    if (quantity < 1) {
      toast.error("Quantity must be at least 1");
      return;
    }

    addToCart({
      id: product.id,
      name: product.name,
      price: unitPrice,
      image: product.image,
      images: product.images,
      category: "accessories",
      description: product.description,
      stock: variant.qtyAvailable,
      isNew: false,
      selectedSize: undefined,
      selectedColor: undefined,
      variantId: String(variant.wcProductId),
      quantity,
      titanJet: {
        source: "titan-jet",
        wcProductId: product.wcProductId,
        sku: product.sku,
        supplierUnitPrice: variant.basePrice,
      },
    } as any);

    toast.success("Added to cart");
  }

  return (
    <div className="container px-4 py-8 mx-auto max-w-6xl">
      <PreviousPageButton fallbackHref="/sublimation-supplies" />

      <div className="grid md:grid-cols-2 gap-10">
        <div className="relative aspect-square bg-white border rounded-2xl overflow-hidden">
          <ProductDetailImage
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-contain p-6"
            priority
          />
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-sm uppercase tracking-wide text-muted-foreground">
              {product.brand} · {product.category}
            </p>
            <h1 className="text-3xl font-black text-primary mt-2">{product.name}</h1>
            {product.sku && (
              <p className="text-sm text-muted-foreground mt-2">SKU: {product.sku}</p>
            )}
          </div>

          {!product.inStock && <Badge variant="secondary">Out of stock</Badge>}

          <PriceBreakdown
            garmentTotal={garmentTotal}
            brandingTotal={0}
            setupFee={0}
            subtotalExVat={priceBreakdown.subtotalExVat}
            vat={priceBreakdown.vat}
            totalInclVat={priceBreakdown.totalInclVat}
          />

          {product.shortDescription && (
            <p className="text-sm text-muted-foreground">{product.shortDescription}</p>
          )}

          {product.attributes.length > 0 && (
            <div className="rounded-lg border p-4 space-y-2 text-sm">
              {product.attributes.map((attr) => (
                <div key={attr.name} className="flex justify-between gap-4">
                  <span className="text-muted-foreground">{attr.name}</span>
                  <span className="font-medium text-right">{attr.value}</span>
                </div>
              ))}
            </div>
          )}

          <div>
            <label className="text-sm font-medium mb-2 block">Quantity</label>
            <Input
              type="number"
              min={1}
              max={variant?.qtyAvailable || 999}
              value={quantity}
              onChange={(event) =>
                setQuantity(Math.max(1, Number(event.target.value) || 1))
              }
              className="max-w-[120px]"
            />
          </div>

          {variant && (
            <p className="text-sm text-muted-foreground">
              {variant.inStock
                ? `${variant.qtyAvailable} available from supplier feed`
                : "Currently unavailable"}
            </p>
          )}

          <Button
            size="lg"
            className="w-full"
            onClick={handleAddToCart}
            disabled={!variant?.inStock}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Add to cart
          </Button>

          {product.description && (
            <p className="text-sm text-muted-foreground whitespace-pre-line">
              {product.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
