import { Metadata } from "next"
import { isSupabaseConfigured, supabase, supabaseAdmin } from "@/lib/supabaseClient"

export const dynamic = "force-dynamic"
import { FlashSaleBanner } from "@/components/ready-to-ship/FlashSaleBanner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingBag, Package, TrendingDown } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { formatCurrency } from "@/lib/utils"
import { StockCounter } from "@/components/ready-to-ship/StockCounter"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export const metadata: Metadata = {
  title: "Corporate Gifts & Bulk Pricing | Custom Branded Gifts | MOTARRO Supplies",
  description: "Premium corporate gifts with quantity pricing. Stainless steel tumblers, canvas totes, coasters, keychains, and gift sets. Perfect for client gifts, employee appreciation, and corporate events. Custom branding available.",
  keywords: [
    "corporate gifts johannesburg",
    "bulk corporate gifts",
    "custom branded gifts",
    "corporate gift sets",
    "employee gifts",
    "client gifts",
    "corporate merchandise",
    "quantity pricing"
  ],
  alternates: {
    canonical: "/corporate-gifts"
  }
}

export default async function CorporateGiftsPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="container px-4 py-12 mx-auto text-center text-muted-foreground">
        Corporate gifts will appear here once the store is connected.
      </div>
    )
  }

  const client = supabaseAdmin || supabase
  
  const { data: products, error } = await client
    .from('ready_to_ship_products')
    .select('*')
    .eq('status', 'active')
    .eq('is_gift_item', true)
    .not('quantity_pricing', 'is', null)
    .order('featured', { ascending: false })
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('Error fetching corporate gifts:', error)
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

    // Parse quantity pricing
    let quantityPricing = null
    if (product.quantity_pricing) {
      try {
        quantityPricing = typeof product.quantity_pricing === 'string' 
          ? JSON.parse(product.quantity_pricing)
          : product.quantity_pricing
      } catch (e) {
        console.error('Error parsing quantity pricing:', e)
      }
    }

    const stockStatus = 
      product.stock_quantity <= 0 && !product.allow_backorder ? 'out_of_stock' :
      product.stock_quantity <= product.low_stock_threshold ? 'low_stock' :
      'in_stock'

    return {
      ...product,
      currentPrice,
      isFlashSale,
      stockStatus,
      quantityPricing
    }
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-lavender to-white">
      <FlashSaleBanner />
      
      <div className="container px-4 py-12 mx-auto max-w-7xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
            <ShoppingBag className="w-5 h-5" />
            <span className="font-semibold">Corporate Gifts</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-primary mb-4">
            Corporate Gifts & Bulk Pricing
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
            Premium corporate gifts with quantity pricing. Perfect for client appreciation, employee recognition, and corporate events. Custom branding available on all items.
          </p>
        </div>

        {/* Products Grid */}
        {processedProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {processedProducts.map((product: any) => (
              <CorporateGiftCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 mb-12">
            <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No corporate gifts available yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              We're currently setting up our corporate gifts collection with quantity pricing. Check back soon for premium corporate gift options!
            </p>
            <div className="flex gap-4 justify-center">
              <Button asChild>
                <Link href="/ready-to-ship">View All Ready-to-Ship Items</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/contact">Request Custom Quote</Link>
              </Button>
            </div>
          </div>
        )}

        {/* Quantity Pricing Info */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="w-6 h-6 text-primary" />
              How Quantity Pricing Works
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Save more when you order in bulk! Our quantity pricing automatically applies discounts based on order size. Custom pricing available for orders over 100 units.
            </p>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Best For</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">1-9 units</TableCell>
                    <TableCell>Standard pricing</TableCell>
                    <TableCell>Small teams, individual gifts</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">10-24 units</TableCell>
                    <TableCell>5-10% off</TableCell>
                    <TableCell>Department gifts, small events</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">25-49 units</TableCell>
                    <TableCell>10-15% off</TableCell>
                    <TableCell>Company-wide gifts, conferences</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">50-99 units</TableCell>
                    <TableCell>15-20% off</TableCell>
                    <TableCell>Large events, client gifts</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">100+ units</TableCell>
                    <TableCell>20%+ off (custom pricing)</TableCell>
                    <TableCell>Enterprise orders, annual gifts</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center bg-primary/5 rounded-lg p-8">
          <h2 className="text-3xl font-black mb-4">Need Custom Branding?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            All corporate gifts can be custom branded with your logo or design. Minimum order quantities apply. Contact us for a custom quote.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/contact">Request Custom Branding Quote</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/ready-to-ship">View All Products</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function CorporateGiftCard({ product }: { product: any }) {
  const discountPercent = product.is_on_sale && product.sale_price
    ? Math.round(((product.base_price - product.sale_price) / product.base_price) * 100)
    : 0

  const quantityPricingEntries = product.quantityPricing 
    ? Object.entries(product.quantityPricing).sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
    : []

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
      </Link>
      
      <CardContent className="p-4">
        <Link href={`/ready-to-ship/${product.slug}`}>
          <h3 className="font-bold mb-2 line-clamp-2">{product.name}</h3>
        </Link>
        
        <div className="mb-3">
          <p className="text-xl font-black text-primary mb-1">
            From {formatCurrency(product.currentPrice)}
          </p>
          {product.is_on_sale && product.base_price > product.currentPrice && (
            <p className="text-xs text-muted-foreground line-through">
              {formatCurrency(product.base_price)}
            </p>
          )}
        </div>
        
        <StockCounter
          productId={product.id}
          initialStock={product.stock_quantity}
          lowStockThreshold={product.low_stock_threshold}
          className="mb-3"
        />

        {/* Quantity Pricing Preview */}
        {quantityPricingEntries.length > 0 && (
          <div className="mb-3 p-2 bg-muted rounded text-xs">
            <p className="font-semibold mb-1">Quantity Pricing:</p>
            <div className="space-y-0.5">
              {quantityPricingEntries.slice(0, 3).map(([qty, price]: [string, any]) => (
                <div key={qty} className="flex justify-between">
                  <span>{qty}+ units:</span>
                  <span className="font-semibold">{formatCurrency(parseFloat(price))}</span>
                </div>
              ))}
              {quantityPricingEntries.length > 3 && (
                <p className="text-muted-foreground italic">
                  +{quantityPricingEntries.length - 3} more tiers
                </p>
              )}
            </div>
          </div>
        )}
        
        <Button className="w-full" size="sm" asChild>
          <Link href={`/ready-to-ship/${product.slug}`}>
            View Details & Pricing
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

