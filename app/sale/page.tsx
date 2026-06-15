import { ProductGrid } from "@/components/product-grid"
import { Button } from "@/components/ui/button"
import { SEOContent } from "@/components/seo-content"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { Product } from "@/types/product"
import { Metadata } from "next"
import { isSupabaseConfigured, supabase, supabaseAdmin } from "@/lib/supabaseClient"

export const dynamic = "force-dynamic"

import { MOTARRO_BRAND_NAME, MOTARRO_SITE_URL } from "@/lib/brand"

export const metadata: Metadata = {
  title: "Sale — Discounted Stationery & Craft Supplies",
  description:
    "Save on selected stationery and craft supplies at MOTARRO Supplies. Discounted plastic, paper, art materials, and more — limited-time offers in South African Rands.",
  keywords: [
    "sale",
    "discount stationery",
    "craft supplies sale",
    "clearance",
    "special offers",
    "motarro sale",
    "school supplies sale",
  ],
  openGraph: {
    title: `Sale Items | ${MOTARRO_BRAND_NAME}`,
    description:
      "Great prices on selected stationery and craft supplies — shop MOTARRO sale items in ZAR.",
    url: `${MOTARRO_SITE_URL}/sale`,
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
  if (!isSupabaseConfigured()) {
    return (
      <div className="container px-4 py-12 mx-auto text-center text-muted-foreground">
        Sale items will appear here once the store is connected.
      </div>
    )
  }

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
          Save on selected stationery and craft supplies — quality MOTARRO products at reduced prices for a limited time.
        </p>
      </div>

      <ProductGrid products={products} priorityCount={2} />

      {/* SEO Content - Collapsible */}
      <SEOContent
        category="Sale Items"
        features={[
          {
            title: "Limited-Time Savings",
            description:
              "Selected stationery and craft products at reduced prices — grab essentials for schools and creative projects while stocks last.",
          },
          {
            title: "MOTARRO Quality",
            description:
              "Sale items are the same trusted MOTARRO products — durable supplies for education, craft, and everyday organisation.",
          },
          {
            title: "Nationwide Delivery",
            description:
              "Enjoy delivery across South Africa on all sale items. Most orders ship within 1–2 business days.",
          },
          {
            title: "Easy Returns",
            description:
              "Our returns policy applies to sale items. Shop with confidence at MOTARRO Supplies.",
          },
        ]}
        bottomText="Our sale selection includes popular stationery, art supplies, and craft materials from across the MOTARRO catalogue — exceptional value for classrooms, offices, and home crafters."
      />
    </div>
  );
}