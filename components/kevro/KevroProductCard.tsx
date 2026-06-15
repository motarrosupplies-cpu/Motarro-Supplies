import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ProductThumbnail } from "@/components/optimized-image";
import { formatCurrency } from "@/lib/utils";
import type { KevroProduct } from "@/types/kevro";

export function KevroProductCard({ product }: { product: KevroProduct }) {
  const priceLabel =
    product.minPrice === product.maxPrice
      ? formatCurrency(product.minPrice)
      : `From ${formatCurrency(product.minPrice)}`;

  return (
    <Card className="overflow-hidden group rounded-2xl border-2 hover:border-primary transition-colors bg-white h-full flex flex-col">
      <Link href={`/branded-catalog/${product.slug || product.stockHeaderId}`}>
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          <ProductThumbnail
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-contain transition-transform group-hover:scale-105 bg-white"
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
            loading="lazy"
          />
          {!product.inStock && (
            <Badge className="absolute top-2 right-2" variant="secondary">
              Out of stock
            </Badge>
          )}
        </div>
      </Link>
      <CardContent className="p-4 flex-1">
        <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
          {product.brand} · {product.type}
        </p>
        <Link href={`/branded-catalog/${product.slug || product.stockHeaderId}`}>
          <h3 className="font-semibold text-sm md:text-base line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="text-xs text-muted-foreground mt-2">
          {product.colors.length} colour{product.colors.length === 1 ? "" : "s"} ·{" "}
          {product.sizes.length} size{product.sizes.length === 1 ? "" : "s"}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <span className="font-bold text-primary">{priceLabel}</span>
        <span className="text-xs text-muted-foreground">{product.category}</span>
      </CardFooter>
    </Card>
  );
}
