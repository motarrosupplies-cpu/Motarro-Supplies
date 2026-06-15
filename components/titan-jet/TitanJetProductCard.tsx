import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ProductThumbnail } from "@/components/optimized-image";
import { formatCurrency } from "@/lib/utils";
import type { TitanJetProduct } from "@/types/titan-jet";

export function TitanJetProductCard({ product }: { product: TitanJetProduct }) {
  return (
    <Card className="overflow-hidden group rounded-2xl border-2 hover:border-primary transition-colors bg-white h-full flex flex-col">
      <Link href={`/sublimation-supplies/${product.slug || product.wcProductId}`}>
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          <ProductThumbnail
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-contain transition-transform group-hover:scale-105 bg-white p-2"
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
          {product.brand} · {product.category}
        </p>
        <Link href={`/sublimation-supplies/${product.slug || product.wcProductId}`}>
          <h3 className="font-semibold text-sm md:text-base line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        {product.sku && (
          <p className="text-xs text-muted-foreground mt-2">SKU: {product.sku}</p>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <span className="font-bold text-primary">{formatCurrency(product.minPrice)}</span>
      </CardFooter>
    </Card>
  );
}
