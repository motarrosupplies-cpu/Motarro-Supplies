import { Metadata } from "next"
import { isSupabaseConfigured, supabase, supabaseAdmin } from "@/lib/supabaseClient"

export const dynamic = "force-dynamic"
import { FlashSaleBanner } from "@/components/ready-to-ship/FlashSaleBanner"
import { BundleBuilder } from "@/components/ready-to-ship/BundleBuilder"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Package, Gift, Sparkles, ShoppingBag } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { formatCurrency } from "@/lib/utils"
import { StockCounter } from "@/components/ready-to-ship/StockCounter"

export const metadata: Metadata = {
  title: "Ready-to-Ship Gifts & Corporate Items | MOTARRO Supplies",
  description: "Shop ready-to-ship gifts, corporate items, and event favours. Stainless steel tumblers, canvas totes, coasters, keychains, and gift sets. Same-day dispatch from Kempton Park. Perfect for Christmas 2025 and corporate gifting.",
  keywords: [
    "ready to ship gifts",
    "corporate gifts johannesburg",
    "event favours",
    "gifts under r200",
    "stainless steel tumblers",
    "canvas tote bags",
    "custom keychains",
    "corporate gift sets",
    "same day dispatch",
    "christmas gifts 2025"
  ],
  alternates: {
    canonical: "/ready-to-ship"
  }
}

export default async function ReadyToShipPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="container px-4 py-12 mx-auto text-center text-muted-foreground">
        Ready-to-ship products will appear here once the store is connected.
      </div>
    )
  }

  const client = supabaseAdmin || supabase
  
  const { data: products, error } = await client
    .from('ready_to_ship_products')
    .select('*')
    .eq('status', 'active')
    .order('featured', { ascending: false })
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching ready-to-ship products:', error)
  }

  const processedProducts = (products || []).map((product: any) => {
    const now = new Date()
    const flashSaleEnds = product.flash_sale_ends_at ? new Date(product.flash_sale_ends_at) : null
    const isFlashSale = product.flash_sale_price && flashSaleEnds && flashSaleEnds > now

    let currentPrice = parseFloat(product.base_price)
    if (isFlashSale) {
      currentPrice = parseFloat(product.flash_sale_price)
    } else if (product.is_on_sale && product.sale_price) {
      currentPrice = parseFloat(product.sale_price)
    }

    const stockStatus = 
      product.stock_quantity <= 0 && !product.allow_backorder ? 'out_of_stock' :
      product.stock_quantity <= product.low_stock_threshold ? 'low_stock' :
      'in_stock'

    return {
      ...product,
      currentPrice,
      isFlashSale,
      stockStatus
    }
  })

  const featuredProducts = processedProducts.filter((p: any) => p.featured)
  const bundleEligibleProducts = processedProducts.filter((p: any) => p.is_bundle_eligible && p.stockStatus !== 'out_of_stock')

  return (
    <div className="min-h-screen bg-gradient-to-b from-lavender to-white">
      <FlashSaleBanner />
      
      <div className="container px-4 py-12 mx-auto max-w-7xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
            <Package className="w-5 h-5" />
            <span className="font-semibold">Ready-to-Ship</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-primary mb-4">
            Ready-to-Ship Gifts & Corporate Items
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
            Premium pre-made gifts, corporate items, and event favours. Same-day dispatch from Kempton Park. Perfect for Christmas 2025 and year-round corporate gifting.
          </p>
          
          {/* Quick Links */}
          <div className="flex flex-wrap gap-3 justify-center">
            <Button asChild variant="outline">
              <Link href="/gifts-under-r200">
                <Gift className="w-4 h-4 mr-2" />
                Gifts Under R200
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/corporate-gifts">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Corporate Gifts
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/event-favours">
                <Sparkles className="w-4 h-4 mr-2" />
                Event Favours
              </Link>
            </Button>
          </div>
        </div>

        {/* Bundle Builder */}
        {bundleEligibleProducts.length > 0 && (
          <div className="mb-12">
            <BundleBuilder products={bundleEligibleProducts} />
          </div>
        )}

        {/* Featured Products */}
        {featuredProducts.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              Featured Products
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}

        {/* All Products */}
        {processedProducts.length > 0 ? (
          <div>
            <h2 className="text-2xl font-bold mb-6">All Ready-to-Ship Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {processedProducts.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No products available yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              We're currently setting up our ready-to-ship collection. Check back soon for premium gifts, corporate items, and event favours!
            </p>
            <div className="flex gap-4 justify-center">
              <Button asChild>
                <Link href="/products">Browse All Products</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-12 text-center bg-primary/5 rounded-lg p-8">
          <h2 className="text-3xl font-black mb-4">Need Custom Branding?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            All our ready-to-ship items can be custom branded with your logo or design. Perfect for corporate gifts, events, and promotions.
          </p>
          <Button asChild size="lg">
            <Link href="/contact">Request Custom Branding Quote</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

function ProductCard({ product }: { product: any }) {
  const discountPercent = product.is_on_sale && product.sale_price
    ? Math.round(((product.base_price - product.sale_price) / product.base_price) * 100)
    : 0

  return (
    <Card className="group hover:shadow-lg transition-all overflow-hidden">
      <Link href={`/ready-to-ship/${product.slug}`}>
        <div className="aspect-square relative bg-muted overflow-hidden">
          {product.primary_image ? (
            <Image
              src={product.primary_image}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-12 h-12 text-muted-foreground" />
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.isFlashSale && (
              <Badge className="bg-red-500 text-white">Flash Sale</Badge>
            )}
            {product.is_on_sale && !product.isFlashSale && (
              <Badge variant="secondary">{discountPercent}% OFF</Badge>
            )}
            {product.featured && (
              <Badge className="bg-primary text-white">Featured</Badge>
            )}
          </div>
        </div>
        
        <CardContent className="p-4">
          <h3 className="font-bold mb-1 line-clamp-2 text-sm">{product.name}</h3>
          
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-lg font-black text-primary">
                {formatCurrency(product.currentPrice)}
              </p>
              {product.is_on_sale && product.base_price > product.currentPrice && (
                <p className="text-xs text-muted-foreground line-through">
                  {formatCurrency(product.base_price)}
                </p>
              )}
            </div>
          </div>
          
          <StockCounter
            productId={product.id}
            initialStock={product.stock_quantity}
            lowStockThreshold={product.low_stock_threshold}
            className="mb-2"
          />
          
          <Button className="w-full" size="sm" asChild>
            <Link href={`/ready-to-ship/${product.slug}`}>
              View Details
            </Link>
          </Button>
        </CardContent>
      </Link>
    </Card>
  )
}

