import { ProductGrid } from "@/components/product-grid"
import { Button } from "@/components/ui/button"
import { SEOContent } from "@/components/seo-content"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { Product } from "@/types/product"
import { Metadata } from "next"
import { supabase, supabaseAdmin } from "@/lib/supabaseClient"

export const metadata: Metadata = {
  title: "Sale Items - Up to 50% Off Custom Apparel",
  description: "Great style at even better prices. Up to 50% off on selected custom printed apparel, accessories, and promotional goods. Limited time offers with fast delivery.",
  keywords: ["sale", "discount", "custom apparel", "promotional goods", "clearance", "special offers", "custom printing"],
  openGraph: {
    title: "Sale Items - Up to 50% Off Custom Apparel",
    description: "Great style at even better prices. Up to 50% off on selected custom printed apparel and accessories.",
    url: "https://www.motarro.co.za/sale"
  },
  alternates: {
    canonical: "/sale"
  }
}

// Helper function to parse images
function parseImages(images: any): string[] {
  if (!images) return []
  if (typeof images === 'string') {
    try {
      const parsed = JSON.parse(images)
      return Array.isArray(parsed) ? parsed : [parsed]
    } catch {
      return [images]
    }
  }
  if (Array.isArray(images)) return images
  return []
}

export default async function SalePage() {
      // Fetch sale products from Supabase using optimized structure
      const client = supabaseAdmin || supabase;
      const { data: productsData, error } = await client
        .from('all_products_unified')
        .select('*')
        .eq('on_sale', true)
        .neq('category', 'custom printing')
        .eq('status', 'active')

  if (error) {
    console.error('Error fetching products:', error)
  }

  const products: Product[] = (productsData || []).map(product => ({
    ...product,
    stock: Number(product.total_stock || product.stock || 0),
    price: Number(product.price),
    originalPrice: product.originalPrice ? Number(product.originalPrice) : undefined,
    images: parseImages(product.images),
    image: product.image || parseImages(product.images)[0] || "/placeholder.svg"
  }))

  return (
    <div className="container px-3 py-8 mx-auto bg-lavender max-w-full overflow-x-hidden">
      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-6 flex-wrap">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <ChevronRight className="h-4 w-4 shrink-0" />
        <span className="text-foreground">Sale</span>
      </div>

      <div className="flex flex-col items-center text-center space-y-2 mb-8 w-full">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary break-words overflow-wrap-anywhere px-2">Sale</h1>
        <p className="text-muted-foreground max-w-[600px] break-words px-4">
          Great style at even better prices. Up to 50% off on selected custom printed apparel, accessories, and promotional goods.
        </p>
      </div>

      <ProductGrid products={products} priorityCount={2} />

      {/* SEO Content - Collapsible */}
      <SEOContent
        category="Sale Items"
        features={[
          {
            title: "Limited Time Offers",
            description: "These sale prices are available for a limited time only. Don't miss out on these incredible deals on quality custom apparel."
          },
          {
            title: "Premium Quality",
            description: "All sale items maintain our high standards for materials and craftsmanship."
          },
          {
            title: "Fast Shipping", 
            description: "Enjoy quick delivery on all sale items. Most orders ship within 1-2 business days."
          },
          {
            title: "Easy Returns",
            description: "Our 30-day return policy applies to all sale items. Shop with confidence."
          }
        ]}
        bottomText="Our sale items are carefully selected from our best-selling collections, offering exceptional value with professional craftsmanship and sustainable materials."
      />
    </div>
  );
}