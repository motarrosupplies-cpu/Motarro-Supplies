"use client"

import Link from "next/link"
import { ProductThumbnail } from "@/components/optimized-image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart } from "lucide-react"
import { useCart } from "@/components/cart-provider"
import { Product } from "@/types/product"

interface ProductGridProps {
  products: Product[]
  isCustomPrinting?: boolean
  linkPrefix?: string
  priorityCount?: number // number of leading images to eagerly load for LCP
}

export function ProductGrid({ products, isCustomPrinting = false, linkPrefix = "/products/", priorityCount = 1 }: ProductGridProps) {
  // Filter out disabled products - ensure products is an array
  const safeProducts = Array.isArray(products) ? products : [];
  const activeProducts = safeProducts.filter(product => product.status === 'active');

  if (activeProducts.length === 0) {
    return (
      <div className="rounded-2xl border bg-white px-6 py-12 text-center text-muted-foreground">
        No products match your filters. Try clearing filters or turning off &quot;In stock only&quot;.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {activeProducts.map((product, index) => (
        <ProductCard key={product.id} product={product} linkPrefix={linkPrefix} eager={index < priorityCount} />
      ))}
    </div>
  )
}

function productHref(product: Product, linkPrefix: string): string {
  if (product.isKevro) {
    return `/branded-catalog/${product.slug || product.id.replace(/^kevro-/, "")}`;
  }
  if (product.isTitanJet) {
    return `/sublimation-supplies/${product.slug || product.id.replace(/^titan-jet-/, "")}`;
  }
  return `${linkPrefix}${product.slug || product.seoSlug || product.id}`;
}

function ProductCard({ product, linkPrefix = "/products/", eager = false }: { product: Product, linkPrefix?: string, eager?: boolean }) {
  // const { addToCart } = useCart()

  // const handleAddToCart = () => {
  //   addToCart({
  //     ...product,
  //     quantity: 1,
  //     selectedSize: undefined,
  //     selectedColor: undefined,
  //     customPrinting: undefined
  //   })
  // }

  // Check stock: for variant products, check if any variant has stock
  // For simple products, check the stock field directly
  const hasVariants = product.hasColorOptions || product.hasSizeOptions;
  let inStock = false;
  
  if (hasVariants) {
    // For variant products, check variants first, then fall back to total stock
    if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
      inStock = product.variants.some((v: any) => (Number(v.stockAvailable) || 0) > 0);
    } else {
      // If variants not loaded, use the stock field (which should be total_stock for variant products)
      inStock = Number(product.stock) > 0;
    }
  } else {
    // For simple products, check the stock field directly
    inStock = Number(product.stock) > 0;
  }

  return (
    <Card className="overflow-hidden group rounded-2xl border-2 hover:border-primary transition-colors bg-white">
      <Link href={productHref(product, linkPrefix)}>
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          <ProductThumbnail
            src={product.image || product.images?.[0] || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-contain transition-transform group-hover:scale-105 bg-white"
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
            loading={eager ? "eager" : "lazy"}
            priority={eager}
            placeholder="blur"
            blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23f3f4f6'/%3E%3C/svg%3E"
          />
          {product.isNew && <Badge className="absolute top-2 right-2 bg-accent hover:bg-accent/90">New</Badge>}
          {product.onSale && (
            <Badge variant="destructive" className="absolute top-2 left-2">
              Sale
            </Badge>
          )}
        </div>
      </Link>
      <CardContent className="p-4">
        <Link href={productHref(product, linkPrefix)} className="hover:text-primary transition-colors">
          <h3 className="font-medium min-h-[48px] leading-snug">{product.name}</h3>
        </Link>
        <div className="mt-1 h-6">
          <div className="flex items-center gap-2 h-6">
            <p className="font-bold text-primary leading-6">R{product.price.toFixed(2)}</p>
            {product.originalPrice && product.onSale && (
              <p className="text-sm text-muted-foreground line-through leading-6">
                R{product.originalPrice.toFixed(2)}
              </p>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        {inStock ? (
          <div className="w-full rounded-full bg-green-100 text-green-800 text-center py-2 font-semibold">
            In Stock
          </div>
        ) : (
          <div className="w-full rounded-full bg-red-100 text-red-800 text-center py-2 font-semibold">
            Out of Stock
          </div>
        )}
      </CardFooter>
    </Card>
  )
}

