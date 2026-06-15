"use client";

import { useEffect, useMemo, useState } from "react";
import { MessageCircle, ShoppingCart } from "lucide-react";
import { PreviousPageButton } from "@/components/previous-page-button";
import { ProductDetailImage } from "@/components/optimized-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCart } from "@/components/cart-provider";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import {
  getBrandingSizeOptions,
  resolveBrandingPrice,
  STANDARD_BRANDING_SIZE_VALUE,
} from "@/lib/kevro/branding-pricing";
import { PriceBreakdown } from "@/components/pricing/PriceBreakdown";
import { calculateVatBreakdown, roundCurrency } from "@/lib/pricing/vat";
import type {
  KevroBrandingPosition,
  KevroBrandingPrice,
  KevroBrandingSelection,
  KevroProduct,
  KevroVariant,
} from "@/types/kevro";

type BrandingResponse = {
  brandingTypes: string[];
  positions: KevroBrandingPosition[];
  pricing: KevroBrandingPrice[];
};

export function KevroProductDetail({ product }: { product: KevroProduct }) {
  const { addToCart } = useCart();
  const [selectedColour, setSelectedColour] = useState(product.colors[0]?.name || "");
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || "");
  const [quantity, setQuantity] = useState(1);
  const [brandingTypes, setBrandingTypes] = useState<string[]>([]);
  const [positions, setPositions] = useState<KevroBrandingPosition[]>([]);
  const [pricing, setPricing] = useState<KevroBrandingPrice[]>([]);
  const [selectedBrandingType, setSelectedBrandingType] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("");
  const [selectedBrandingSize, setSelectedBrandingSize] = useState("");
  const [wantsBranding, setWantsBranding] = useState(false);

  useEffect(() => {
    fetch(`/api/kevro/branding/${product.stockHeaderId}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((data: BrandingResponse | null) => {
        if (!data) return;
        setBrandingTypes(data.brandingTypes);
        setPositions(data.positions);
        setPricing(data.pricing);
        if (data.brandingTypes[0]) setSelectedBrandingType(data.brandingTypes[0]);
      })
      .catch(() => {});
  }, [product.stockHeaderId]);

  const availableSizes = useMemo(() => {
    const sizes = new Set(
      product.variants
        .filter((variant) => variant.colour === selectedColour)
        .map((variant) => variant.size)
    );
    return product.sizes.filter((size) => sizes.has(size));
  }, [product, selectedColour]);

  const selectedVariant: KevroVariant | undefined = useMemo(
    () =>
      product.variants.find(
        (variant) =>
          variant.colour === selectedColour && variant.size === selectedSize
      ),
    [product.variants, selectedColour, selectedSize]
  );

  const positionOptions = useMemo(
    () =>
      positions.filter(
        (position) => position.brandingType === selectedBrandingType
      ),
    [positions, selectedBrandingType]
  );

  const sizeOptions = useMemo(
    () => getBrandingSizeOptions(pricing, selectedBrandingType),
    [pricing, selectedBrandingType]
  );

  useEffect(() => {
    if (positionOptions[0]) {
      setSelectedPosition(positionOptions[0].brandingPosition);
    }
  }, [positionOptions]);

  useEffect(() => {
    if (
      sizeOptions.length > 0 &&
      !sizeOptions.some((option) => option.value === selectedBrandingSize)
    ) {
      setSelectedBrandingSize(sizeOptions[0].value);
    }
  }, [sizeOptions, selectedBrandingSize]);

  const selectedPricing = useMemo(
    () =>
      resolveBrandingPrice(
        pricing,
        selectedBrandingType,
        selectedBrandingSize,
        quantity
      ),
    [pricing, selectedBrandingType, selectedBrandingSize, quantity]
  );

  const garmentUnitPrice = selectedVariant?.displayPrice ?? product.minPrice;
  const brandingUnitPrice = selectedPricing?.unitPrice ?? 0;
  const setupFee = selectedPricing?.setupFee ?? 0;
  const brandingSizeLabel =
    selectedBrandingSize === STANDARD_BRANDING_SIZE_VALUE
      ? "Standard"
      : selectedBrandingSize;

  const brandingSelection: KevroBrandingSelection | undefined =
    wantsBranding && selectedPricing && selectedPosition
      ? {
          brandingType: selectedBrandingType,
          brandingPosition: selectedPosition,
          brandingSize: brandingSizeLabel,
          unitPrice: brandingUnitPrice,
          setupFee,
        }
      : undefined;

  const appliedBrandingUnitPrice = wantsBranding ? brandingUnitPrice : 0;
  const appliedSetupFee = wantsBranding ? setupFee : 0;
  const unitPrice = garmentUnitPrice + appliedBrandingUnitPrice;
  const garmentTotal = roundCurrency(garmentUnitPrice * quantity);
  const brandingTotal = roundCurrency(appliedBrandingUnitPrice * quantity);
  const subtotalExVat = roundCurrency(garmentTotal + brandingTotal + appliedSetupFee);
  const priceBreakdown = calculateVatBreakdown(subtotalExVat);

  const displayImage =
    product.colors.find((color) => color.name === selectedColour)?.image ||
    selectedVariant?.image ||
    product.image;

  const quoteMessage = encodeURIComponent(
    wantsBranding
      ? `Hi MOTARRO Supplies, I'm interested in branding:\n${product.name} (${product.stockCode})\nColour: ${selectedColour}\nSize: ${selectedSize}\nQty: ${quantity}\nBranding: ${selectedBrandingType || "TBC"} ${selectedPosition || ""}`
      : `Hi MOTARRO Supplies, I'm interested in a plain garment:\n${product.name} (${product.stockCode})\nColour: ${selectedColour}\nSize: ${selectedSize}\nQty: ${quantity}\nNo branding required`
  );

  function handleAddToCart() {
    if (!selectedVariant) {
      toast.error("Please select a colour and size");
      return;
    }
    if (!selectedVariant.inStock) {
      toast.error("This colour/size is currently out of stock");
      return;
    }
    if (quantity < 1) {
      toast.error("Quantity must be at least 1");
      return;
    }
    if (wantsBranding && brandingTypes.length > 0 && !brandingSelection) {
      toast.error("Please complete your branding options");
      return;
    }

    addToCart({
      id: product.id,
      name: product.name,
      price: unitPrice,
      image: displayImage || product.image,
      images: product.images,
      category: "unisex",
      description: product.description,
      stock: selectedVariant.qtyAvailable,
      isNew: false,
      selectedColor: selectedColour,
      selectedSize: selectedSize,
      variantId: String(selectedVariant.stockId),
      quantity,
      kevro: {
        source: "kevro",
        stockHeaderId: product.stockHeaderId,
        stockId: selectedVariant.stockId,
        stockCode: selectedVariant.stockCode,
        garmentUnitPrice,
        wantsBranding,
        branding: brandingSelection,
        setupFee: appliedSetupFee,
      },
    } as any);

    toast.success("Added to cart");
  }

  return (
    <div className="container px-4 py-8 mx-auto max-w-6xl">
      <PreviousPageButton fallbackHref="/branded-catalog" />

      <div className="grid md:grid-cols-2 gap-10">
        <div className="relative aspect-square bg-white border rounded-2xl overflow-hidden">
          <ProductDetailImage
            src={displayImage || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-contain p-6"
            priority
          />
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-sm uppercase tracking-wide text-muted-foreground">
              {product.brand} · {product.category} · {product.type}
            </p>
            <h1 className="text-3xl font-black text-primary mt-2">{product.name}</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Stock code: {product.stockCode}
            </p>
          </div>

          {selectedVariant && !selectedVariant.inStock && (
            <Badge variant="secondary">Out of stock</Badge>
          )}

          <PriceBreakdown
            garmentTotal={garmentTotal}
            brandingTotal={brandingTotal}
            setupFee={appliedSetupFee}
            subtotalExVat={priceBreakdown.subtotalExVat}
            vat={priceBreakdown.vat}
            totalInclVat={priceBreakdown.totalInclVat}
          />

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Colour</label>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <Button
                    key={color.name}
                    type="button"
                    size="sm"
                    variant={selectedColour === color.name ? "default" : "outline"}
                    onClick={() => {
                      setSelectedColour(color.name);
                      const nextSizes = product.variants
                        .filter((variant) => variant.colour === color.name)
                        .map((variant) => variant.size);
                      if (!nextSizes.includes(selectedSize)) {
                        setSelectedSize(nextSizes[0] || "");
                      }
                    }}
                  >
                    {color.name}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Size</label>
              <Select value={selectedSize} onValueChange={setSelectedSize}>
                <SelectTrigger>
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  {availableSizes.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {brandingTypes.length > 0 && (
              <>
                <div className="rounded-lg border p-4 space-y-3">
                  <Label className="text-sm font-medium">Order type</Label>
                  <RadioGroup
                    value={wantsBranding ? "branded" : "plain"}
                    onValueChange={(value) => setWantsBranding(value === "branded")}
                    className="grid gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <RadioGroupItem value="plain" id="kevro-plain" className="mt-1" />
                      <Label htmlFor="kevro-plain" className="font-normal cursor-pointer">
                        <span className="font-medium block">Plain garment only</span>
                        <span className="text-sm text-muted-foreground">
                          Base item with no custom branding — {formatCurrency(garmentUnitPrice)} per unit
                        </span>
                      </Label>
                    </div>
                    <div className="flex items-start gap-3">
                      <RadioGroupItem value="branded" id="kevro-branded" className="mt-1" />
                      <Label htmlFor="kevro-branded" className="font-normal cursor-pointer">
                        <span className="font-medium block">Add custom branding</span>
                        <span className="text-sm text-muted-foreground">
                          Choose method, position, and size — branding fees apply
                        </span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {wantsBranding && (
                  <>
                <div>
                  <label className="text-sm font-medium mb-2 block">Branding method</label>
                  <Select
                    value={selectedBrandingType}
                    onValueChange={setSelectedBrandingType}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select branding" />
                    </SelectTrigger>
                    <SelectContent>
                      {brandingTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {positionOptions.length > 0 && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Position</label>
                    <Select value={selectedPosition} onValueChange={setSelectedPosition}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                      <SelectContent>
                        {positionOptions.map((position) => (
                          <SelectItem
                            key={position.brandingPosition}
                            value={position.brandingPosition}
                          >
                            {position.brandingPosition}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {sizeOptions.length > 0 && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Branding size</label>
                    <Select
                      value={selectedBrandingSize}
                      onValueChange={setSelectedBrandingSize}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        {sizeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                  </>
                )}
              </>
            )}

            <div>
              <label className="text-sm font-medium mb-2 block">Quantity</label>
              <Input
                type="number"
                min={1}
                max={selectedVariant?.qtyAvailable || 999}
                value={quantity}
                onChange={(event) =>
                  setQuantity(Math.max(1, Number(event.target.value) || 1))
                }
                className="max-w-[120px]"
              />
            </div>

            {selectedVariant && (
              <p className="text-sm text-muted-foreground">
                {selectedVariant.inStock
                  ? `${selectedVariant.qtyAvailable} available from supplier feed`
                  : "Currently unavailable in this colour/size"}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              size="lg"
              className="w-full sm:flex-1 h-12 min-h-12 px-6 text-base"
              onClick={handleAddToCart}
              disabled={!selectedVariant?.inStock}
            >
              <ShoppingCart className="w-5 h-5" />
              Add to cart
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="w-full sm:flex-1 h-12 min-h-12 px-6 text-base"
            >
              <a
                href={`https://wa.me/27696228848?text=${quoteMessage}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="w-5 h-5" />
                WhatsApp us
              </a>
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}
