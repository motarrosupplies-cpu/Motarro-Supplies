import { ProductGrid } from "@/components/product-grid"
import { Button } from "@/components/ui/button"
import { SEOContent } from "@/components/seo-content"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { Product } from "@/types/product"
import { Metadata } from "next"
import { isSupabaseConfigured, supabase } from "@/lib/supabaseClient"

export const dynamic = "force-dynamic"

import { MOTARRO_BRAND_NAME, MOTARRO_SITE_URL } from "@/lib/brand"

export const metadata: Metadata = {
  title: "New Arrivals — Latest Stationery & Craft Supplies",
  description:
    "Discover the latest stationery and craft supplies added to MOTARRO Supplies. New products for schools, offices, and creative projects — prices in South African Rands.",
  keywords: [
    "new arrivals",
    "new stationery south africa",
    "new craft supplies",
    "motarro new products",
    "school supplies",
    "art supplies",
  ],
  openGraph: {
    title: `New Arrivals | ${MOTARRO_BRAND_NAME}`,
    description:
      "Fresh additions to our stationery and craft catalogue — shop the latest MOTARRO products in ZAR.",
    url: `${MOTARRO_SITE_URL}/products/new`,
  },
  alternates: {
    canonical: "/products/new"
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

export default async function NewArrivalsPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="container px-4 py-12 mx-auto text-center text-muted-foreground">
        New arrivals will appear here once the store is connected.
      </div>
    )
  }

  // Fetch new products from unified view
  const { data: productsData, error } = await supabase
    .from('all_products_unified')
    .select('*')
    .eq('is_new', true)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching products:', error)
  }

  const products: Product[] = (productsData || []).map((product: any) => {
    const normalizedImages = parseImages(product.images);
    return {
      ...product,
      id: product.id,
      name: product.name,
      description: product.description,
      price: Number(product.price),
      originalPrice: product.original_price ? Number(product.original_price) : undefined,
      images: normalizedImages,
      image: product.image || normalizedImages[0] || "/placeholder.svg",
      isNew: Boolean(product.is_new),
      onSale: Boolean(product.on_sale),
      stock: Number(product.total_stock || product.stock || 0),
      category: product.category,
      slug: product.slug || product.seo_slug || null,
      seoSlug: product.seo_slug || product.slug || null,
    };
  })

  return (
    <div className="container px-3 py-8 mx-auto bg-lavender">
      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/products" className="hover:text-foreground">
          Products
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">New Arrivals</span>
      </div>

      <div className="flex flex-col items-center text-center space-y-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-primary">New Arrivals</h1>
        <p className="text-muted-foreground max-w-[600px]">
          The latest stationery and craft supplies added to our catalogue — perfect for schools, classrooms, and creative projects.
        </p>
      </div>

      <ProductGrid products={products} priorityCount={2} />

      {/* SEO Content - Collapsible */}
      <SEOContent
        category="New Arrivals"
        features={[
          {
            title: "Fresh Catalogue Additions",
            description:
              "We regularly add new stationery, craft materials, and educational supplies aligned with the MOTARRO Australia range.",
          },
          {
            title: "Quality You Can Trust",
            description:
              "Every new product meets MOTARRO quality standards — durable materials for classrooms, offices, and creative use.",
          },
          {
            title: "Prices in Rands",
            description:
              "All new arrivals are priced in ZAR with nationwide delivery across South Africa.",
          },
        ]}
        bottomText="Check back often for new plastic, paper, wooden, metal, acrylic, art, foam craft, and tile products — everything you need for stationery passion and creative imagination."
      />
    </div>
  );
}