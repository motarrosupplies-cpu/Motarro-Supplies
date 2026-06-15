import { OptimizedImage } from "@/components/optimized-image"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProductGrid } from "@/components/product-grid"
import { Product } from "@/types/product"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SEOContent } from "@/components/seo-content"
import { Metadata } from "next"
import { isSupabaseConfigured, supabase, supabaseAdmin } from "@/lib/supabaseClient"

export const metadata: Metadata = {
  title: "Sublimation & Custom Printing Johannesburg | MOTARRO Supplies",
  description: "Sublimation printing Johannesburg and custom printing services in South Africa. Professional printed apparel, DTG printing, screen printing. Create custom t-shirts, hoodies, mugs, and accessories. Serving Kempton Park & nationwide.",
  keywords: [
    // HIGH PRIORITY: Service-specific keywords
    "sublimation printing johannesburg",
    "sublimation printing south africa",
    "custom printing johannesburg",
    "custom printing south africa",
    "DTG printing johannesburg",
    "DTG printing south africa",
    "direct to garment printing johannesburg",
    "screen printing kempton park",
    "screen printing johannesburg",
    "t-shirt printing johannesburg",
    "apparel printing south africa",
    "clothing printing services johannesburg",
    // Related keywords
    "printed apparel",
    "printed apparel johannesburg",
    "printed apparel south africa",
    "custom printing",
    "sublimation printing",
    "DTG printing",
    "screen printing",
    "heat transfer printing",
    "embroidery services johannesburg",
    "personalized gifts",
    "custom design",
    "printing services",
    "Johannesburg",
    "Kempton Park",
    "custom printed clothing",
    "printed clothing"
  ],
  openGraph: {
    title: "Sublimation & Custom Printing Johannesburg | MOTARRO Supplies",
    description: "Sublimation printing Johannesburg and custom printing services in South Africa. Professional printed apparel, DTG printing, screen printing. Create custom t-shirts, hoodies, mugs, and accessories.",
    url: "https://www.motarro.co.za/custom-printing"
  },
  alternates: {
    canonical: "/custom-printing"
  }
}

// Always fetch fresh product data so image order and backend changes show immediately
export const dynamic = 'force-dynamic'
export const revalidate = 0

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

export default async function CustomPrintingPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="container px-4 py-12 mx-auto text-center text-muted-foreground">
        Custom printing products will appear here once the store is connected.
      </div>
    )
  }

  // FIXED: Fetch from all_products_unified view to get products from optimized tables
  const client = supabaseAdmin || supabase;
  const { data: productsData, error } = await client
    .from('all_products_unified')
    .select('*')
    .eq('category', 'custom printing')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error)
  }

  // Transform products with stock mapping
  const products: Product[] = (productsData || []).map((product: any) => {
    // Calculate stock - use total_stock from view, or sum of variants if available
    let stock = Number(product.total_stock || 0);
    
    // If product has variants, we need to calculate from variant data
    if (product.product_type === 'color_only' || product.product_type === 'size_only' || product.product_type === 'full_variant') {
      // For variant products, the total_stock from unified view should already be correct
      stock = Number(product.total_stock || 0);
    } else {
      // For simple products, use the stock field
      stock = Number(product.stock || product.total_stock || 0);
    }
    
    return {
      ...product,
      stock: stock,
      price: Number(product.price),
      originalPrice: product.original_price ? Number(product.original_price) : undefined,
      images: parseImages(product.images),
      image: product.image || parseImages(product.images)[0] || "/placeholder.svg",
      isNew: Boolean(product.is_new),
      onSale: Boolean(product.on_sale),
      slug: product.slug || product.seo_slug || null,
      seoSlug: product.seo_slug || product.slug || null,
    }
  })

  // Group by subcategory if available, else show all in one list
  const grouped = products.reduce((acc, product) => {
    const subcat = (product as any).subcategory;
    if (subcat) {
      if (!acc[subcat]) acc[subcat] = [];
      acc[subcat].push(product);
    } else {
      if (!acc['All']) acc['All'] = [];
      acc['All'].push(product);
    }
    return acc;
  }, {} as Record<string, Product[]>);

  const tabs = Object.keys(grouped).filter(tab => tab !== 'Other');
  const selectedTab = tabs.length > 0 ? tabs[0] : 'All';

  return (
    <div className="container px-4 py-12 mx-auto bg-lavender max-w-full overflow-x-hidden">
      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-8 flex-wrap">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <ChevronRight className="h-4 w-4 shrink-0" />
        <span className="text-foreground">Custom Printing</span>
      </div>

      <div className="flex flex-col items-center text-center space-y-2 mb-12 w-full">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary break-words overflow-wrap-anywhere px-2">Custom Printing - Printed Apparel & Sublimation Services</h1>
        <p className="text-muted-foreground max-w-[800px] break-words px-4">
          Professional printed apparel and custom printing services using sublimation technology. Transform your ideas into reality with our high-quality printed clothing, sublimation printing, and custom design services. Perfect for personal gifts, business merchandise, or special events in Johannesburg and Kempton Park.
        </p>
      </div>

      {tabs.length === 1 && tabs[0] === 'All' ? (
        <div className="space-y-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Products</h2>
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Available Products</h3>
            <CustomPrintingProductGrid products={grouped['All']} linkPrefix="/custom-printing/" useIdForLink />
          </div>
        </div>
      ) : (
        <Tabs defaultValue={selectedTab} className="space-y-8">
          <TabsList className="flex w-full overflow-x-auto gap-2 bg-transparent md:grid md:grid-cols-5">
            {tabs.map(tab => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>
          {tabs.map(tab => (
            <TabsContent key={tab} value={tab} className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">{tab}</h2>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Available Products</h3>
                <CustomPrintingProductGrid products={grouped[tab]} linkPrefix="/custom-printing/" useIdForLink />
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}

      {/* SEO Content - Collapsible */}
      <SEOContent
        category="Custom Printing"
        features={[
          {
            title: "Advanced Technology",
            description: "State-of-the-art sublimation printing technology that creates vibrant, fade-resistant designs."
          },
          {
            title: "Design Flexibility",
            description: "Upload your own designs or work with our creative team to develop custom artwork."
          },
          {
            title: "Fast Turnaround",
            description: "Most custom printing orders completed within 3-5 business days with rush options available."
          }
        ]}
        bottomText="Our custom printing services are ideal for a wide range of applications. Create memorable gifts for birthdays, anniversaries, and holidays. Develop professional merchandise for corporate events, team building, and brand promotion. Design unique items for weddings, graduations, and special celebrations."
      />

      <div className="mt-12 p-6 bg-primary/5 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Custom Printing Process</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <h3 className="font-semibold">1. Design Upload</h3>
            <p className="text-sm text-muted-foreground">
              Upload your design or work with our team to create something special.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold">2. Preview & Approve</h3>
            <p className="text-sm text-muted-foreground">
              Review a digital preview of your design on the chosen products.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold">3. Print & Deliver</h3>
            <p className="text-sm text-muted-foreground">
              We'll print your items using high-quality sublimation and deliver them to you.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Custom Printing Product Card (local to this page)
function CustomPrintingProductCard({ product, linkPrefix = "/products/", useIdForLink = false }: { product: Product, linkPrefix?: string, useIdForLink?: boolean }) {
  const inStock = Number(product.stock) > 0;
  const pathSegment = useIdForLink ? product.id : (product.slug || product.seoSlug || product.id);
  return (
    <Card className="overflow-hidden group rounded-2xl border-2 hover:border-primary transition-colors bg-white">
      <Link href={`${linkPrefix}${pathSegment}`}>
        <div className="relative aspect-square overflow-hidden">
          <OptimizedImage
            src={product.image || product.images?.[0] || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-contain transition-transform group-hover:scale-105 bg-white"
            supabaseTransform={{ width: 600, resize: "contain" }}
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
        <Link href={`${linkPrefix}${pathSegment}`} className="hover:text-primary transition-colors">
          <h3 className="font-medium">{product.name}</h3>
        </Link>
        <div className="mt-1">
          <div className="flex items-center gap-2">
            <p className="font-bold text-primary">R{product.price.toFixed(2)}</p>
            {product.originalPrice && product.onSale && (
              <p className="text-sm text-muted-foreground line-through">
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
  );
}

function CustomPrintingProductGrid({ products, linkPrefix = "/products/", useIdForLink = false }: { products: Product[], linkPrefix?: string, useIdForLink?: boolean }) {
  const activeProducts = products.filter(product => product.status === 'active');
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {activeProducts.map((product) => (
        <CustomPrintingProductCard key={product.id} product={product} linkPrefix={linkPrefix} useIdForLink={useIdForLink} />
      ))}
    </div>
  );
} 