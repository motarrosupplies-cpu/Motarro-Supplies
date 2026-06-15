import { ProductGrid } from "@/components/product-grid"
import { Button } from "@/components/ui/button"
import { SEOContent } from "@/components/seo-content"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { Product } from "@/types/product"
import { Metadata } from "next"
import { supabase } from "@/lib/supabaseClient"

export const metadata: Metadata = {
  title: "New Arrivals - Latest Custom Apparel & Accessories",
  description: "Fresh styles just dropped! Check out our latest additions to help you look your best. New custom printed apparel, accessories, and trending designs.",
  keywords: ["new arrivals", "latest styles", "trending apparel", "custom clothing", "new products", "fashion", "custom printing"],
  openGraph: {
    title: "New Arrivals - Latest Custom Apparel & Accessories",
    description: "Fresh styles just dropped! Check out our latest additions to help you look your best.",
    url: "https://www.motarro.co.za/products/new"
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
          Fresh styles just dropped! Check out our latest additions to help you look your best.
        </p>
      </div>

      <ProductGrid products={products} priorityCount={2} />

      {/* SEO Content - Collapsible */}
      <SEOContent
        category="New Arrivals"
        features={[
          {
            title: "Trending Designs",
            description: "Our new arrivals feature the latest design trends and popular styles, ensuring you always have access to what's hot right now."
          },
          {
            title: "Premium Materials",
            description: "Each new item is crafted from high-quality materials, offering superior comfort, durability, and style that lasts season after season."
          },
          {
            title: "Limited Availability",
            description: "Many of our new arrivals are produced in limited quantities, so grab your favorites before they're gone!"
          }
        ]}
        bottomText="Our new arrivals go through rigorous quality testing and trend analysis before hitting our shelves. We work with experienced designers and manufacturers to bring you pieces that combine style, comfort, and value."
      />
    </div>
  );
}