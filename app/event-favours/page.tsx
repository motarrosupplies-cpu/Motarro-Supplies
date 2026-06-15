import { Metadata } from "next"
import { supabase, supabaseAdmin } from "@/lib/supabaseClient"
import { FlashSaleBanner } from "@/components/ready-to-ship/FlashSaleBanner"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Package, Gift } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { formatCurrency } from "@/lib/utils"
import { StockCounter } from "@/components/ready-to-ship/StockCounter"

export const metadata: Metadata = {
  title: "Event Favours & Party Favours | Affordable Event Gifts | MOTARRO Supplies",
  description: "Perfect event favours and party favours for weddings, conferences, corporate events, and celebrations. Affordable gifts under R200. Same-day dispatch from Kempton Park.",
  keywords: [
    "event favours",
    "party favours",
    "wedding favours",
    "corporate event gifts",
    "conference favours",
    "event gifts johannesburg",
    "affordable event favours"
  ],
  alternates: {
    canonical: "/event-favours"
  }
}

export default async function EventFavoursPage() {
  const client = supabaseAdmin || supabase
  
  const { data: products, error } = await client
    .from('ready_to_ship_products')
    .select('*')
    .eq('status', 'active')
    .eq('is_event_favour', true)
    .order('featured', { ascending: false })
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching event favours:', error)
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-lavender to-white">
      <FlashSaleBanner />
      
      <div className="container px-4 py-12 mx-auto max-w-7xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
            <Sparkles className="w-5 h-5" />
            <span className="font-semibold">Event Favours</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-primary mb-4">
            Event Favours & Party Favours
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
            Perfect affordable favours for weddings, conferences, corporate events, and celebrations. Premium quality items that your guests will love. Same-day dispatch available.
          </p>
        </div>

        {/* Use Cases */}
        <div className="grid md:grid-cols-4 gap-4 mb-12">
          <Card className="text-center p-4">
            <Gift className="w-8 h-8 text-primary mx-auto mb-2" />
            <h3 className="font-bold mb-1">Weddings</h3>
            <p className="text-xs text-muted-foreground">Elegant favours for your special day</p>
          </Card>
          <Card className="text-center p-4">
            <Package className="w-8 h-8 text-primary mx-auto mb-2" />
            <h3 className="font-bold mb-1">Conferences</h3>
            <p className="text-xs text-muted-foreground">Professional gifts for attendees</p>
          </Card>
          <Card className="text-center p-4">
            <Sparkles className="w-8 h-8 text-primary mx-auto mb-2" />
            <h3 className="font-bold mb-1">Corporate Events</h3>
            <p className="text-xs text-muted-foreground">Branded items for your event</p>
          </Card>
          <Card className="text-center p-4">
            <Gift className="w-8 h-8 text-primary mx-auto mb-2" />
            <h3 className="font-bold mb-1">Celebrations</h3>
            <p className="text-xs text-muted-foreground">Memorable favours for any occasion</p>
          </Card>
        </div>

        {/* Products Grid */}
        {processedProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
            {processedProducts.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No products found</h3>
            <p className="text-muted-foreground mb-6">
              We're currently updating our event favour selection. Check back soon!
            </p>
            <Button asChild>
              <Link href="/ready-to-ship">View All Ready-to-Ship Items</Link>
            </Button>
          </div>
        )}

        {/* CTA Section */}
        <div className="text-center bg-primary/5 rounded-lg p-8">
          <h2 className="text-3xl font-black mb-4">Need Custom Branding for Your Event?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            All event favours can be custom branded with your event logo, date, or message. Perfect for creating memorable keepsakes. Minimum order quantities apply.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/contact">Request Custom Branding Quote</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/gifts-under-r200">View Gifts Under R200</Link>
            </Button>
          </div>
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

