"use client"

import Link from "next/link"
import { ProductThumbnail } from "@/components/optimized-image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart } from "lucide-react"
import { useCart } from "@/components/cart-provider"
import { Product } from "@/types/product"
import { useEffect, useState } from "react"

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        // Add cache-busting parameter to prevent stale data
        const cacheBuster = Date.now();
        const response = await fetch(`/api/products/optimized?limit=8&cb=${cacheBuster}`, {
          cache: 'no-store', // Disable Next.js caching
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        
        console.log('🔍 Featured Products Debug:', {
          rawData: data,
          productsCount: data.products?.length || 0,
          firstProduct: data.products?.[0]
        });
        
        // Convert price strings to numbers and filter out inactive and custom printing
        const productsArray = data.products || data || [];
        const safeData = Array.isArray(productsArray) ? productsArray : [];
        const formattedProducts = safeData
          .filter((product: Product) => product.status === 'active' && product.category !== 'custom printing') // FIXED: Use lowercase
          .map((product: any) => ({
            ...product,
            price: Number(product.price),
            originalPrice: product.originalPrice ? Number(product.originalPrice) : undefined,
          }));
        
        console.log('🔍 Formatted Products Debug:', {
          formattedCount: formattedProducts.length,
          stockValues: formattedProducts.map(p => ({ name: p.name, stock: p.stock, type: typeof p.stock }))
        });
        
        setProducts(formattedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProducts();
  }, []);

  // Select 2 newest and 2 random (not already in newest)
  let featured: Product[] = [];
  if (products.length > 0) {
    // Sort by id descending (assuming higher id = newer)
    const sorted = [...products].sort((a, b) => Number(b.id) - Number(a.id));
    const newest = sorted.slice(0, 2);
    // Get remaining products not in newest
    const remaining = sorted.slice(2);
    // Shuffle remaining for randomness
    for (let i = remaining.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
    }
    const random = remaining.slice(0, 2);
    featured = [...newest, ...random];
  }

  return (
    <section className="py-20 space-y-16">
      <div className="flex flex-col items-center text-center space-y-4">
        <h3 className="text-4xl md:text-5xl font-black tracking-tight text-primary">Featured Products</h3>
        <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
          Apparently what people want!
        </p>
      </div>
      {isLoading ? (
        <div className="text-center py-16">
          <div className="inline-flex items-center gap-2 text-lg text-muted-foreground">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            Loading featured products...
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  )
}

interface ProductCardProps {
  product: Product;
}

function ProductCard({ product }: ProductCardProps) {
  const inStock = Number(product.stock) > 0;
  
  // Debug logging for stock values
  console.log(`🔍 ProductCard Debug - ${product.name}:`, {
    stock: product.stock,
    stockType: typeof product.stock,
    stockNumber: Number(product.stock),
    inStock,
    productType: product.productType
  });

  return (
    <Card className="overflow-hidden group rounded-3xl border-0 hover:shadow-2xl transition-all duration-500 bg-white shadow-lg group-hover:scale-[1.02]">
      <Link href={`/products/${product.slug || product.seoSlug || product.id}`}>
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          <ProductThumbnail
            src={product.images?.[0] || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-contain transition-transform duration-700 group-hover:scale-110 bg-white"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 25vw"
            loading="lazy"
            placeholder="blur"
            blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23f3f4f6'/%3E%3C/svg%3E"
          />
          {product.isNew && (
            <Badge className="absolute top-4 right-4 bg-accent hover:bg-accent/90 text-white font-semibold px-3 py-1 rounded-full shadow-lg">
              New
            </Badge>
          )}
          
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
        </div>
      </Link>
      
      <CardContent className="p-6 space-y-3">
        <Link href={`/products/${product.slug || product.seoSlug || product.id}`} className="hover:text-primary transition-colors">
          <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        
        <div className="flex items-center justify-between">
          <p className="font-black text-2xl text-primary">R{product.price.toFixed(2)}</p>
          {product.originalPrice && (
            <p className="text-sm text-muted-foreground line-through">
              R{product.originalPrice.toFixed(2)}
            </p>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-6 pt-0">
        {inStock ? (
          <div className="w-full rounded-full bg-green-100 text-green-800 text-center py-3 font-bold text-sm shadow-sm">
            ✓ In Stock
          </div>
        ) : (
          <div className="w-full rounded-full bg-red-100 text-red-800 text-center py-3 font-bold text-sm shadow-sm">
            Out of Stock
          </div>
        )}
      </CardFooter>
    </Card>
  )
}

