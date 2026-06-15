import { ProductGrid } from "@/components/product-grid"
import { SEOContent } from "@/components/seo-content"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { Suspense } from "react"
import { Metadata } from "next"
import {
  resolveAvailability,
  sanitizeCondition,
  conditionToSchemaUrl,
  availabilityToSchemaUrl,
} from "@/lib/utils"
import { SectionCatalogFilters } from "@/components/catalog/SectionCatalogFilters"
import { fetchPageCatalog, productSchemaUrl } from "@/lib/products/catalog"

import { MOTARRO_BRAND_NAME, MOTARRO_DESCRIPTION, MOTARRO_SITE_URL } from "@/lib/brand"
import { MOTARRO_CATEGORIES } from "@/lib/motarro/categories"

export const metadata: Metadata = {
  title: `All Stationery & Craft Products South Africa | ${MOTARRO_BRAND_NAME}`,
  description: MOTARRO_DESCRIPTION,
  keywords: [
    "stationery south africa",
    "craft supplies south africa",
    "school supplies",
    "art supplies",
    "plastic stationery",
    "paper stationery",
    "wooden craft supplies",
    "motarro supplies",
    "motarro products",
    "prices in rands",
  ],
  openGraph: {
    title: `Shop All Products | ${MOTARRO_BRAND_NAME}`,
    description: MOTARRO_DESCRIPTION,
    url: `${MOTARRO_SITE_URL}/products`,
  },
  alternates: {
    canonical: "/products",
  },
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string
    brand?: string
    type?: string
    inStock?: string
  }>
}) {
  const params = await searchParams
  const { products, filterOptions, activeFilters } = await fetchPageCatalog({
    section: "all",
    subcategory: params?.category,
    brand: params?.brand,
    type: params?.type,
    inStock: params.inStock === "true",
    excludeCustomPrinting: true,
  })

  return (
    <div className="container px-4 py-12 mx-auto max-w-full overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "All Products",
            "description":
              "Browse the complete MOTARRO Supplies catalogue of stationery and craft products for South Africa.",
            "url": `${MOTARRO_SITE_URL}/products`,
            "mainEntity": {
              "@type": "ItemList",
              "itemListElement": products.map((product, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "item": {
                  "@type": "Product",
                  "name": product.name,
                  "description": product.description || product.name,
                  "sku": product.sku || product.id,
                  "url": productSchemaUrl(product),
                  "image": product.image || (product.images?.[0] || ""),
                  "brand": {
                    "@type": "Brand",
                    "name": "MOTARRO Supplies",
                  },
                  "offers": {
                    "@type": "Offer",
                    "priceCurrency": "ZAR",
                    "price": Number.isFinite(product.price)
                      ? Number(product.price).toFixed(2)
                      : String(product.price ?? ""),
                    "availability": availabilityToSchemaUrl(
                      resolveAvailability(product.availability, product.stock),
                    ),
                    ...(product.availabilityDate
                      ? { availabilityStarts: product.availabilityDate }
                      : {}),
                    "itemCondition": conditionToSchemaUrl(
                      sanitizeCondition(product.condition),
                    ),
                    "url": productSchemaUrl(product),
                    "priceValidUntil": new Date(
                      Date.now() + 365 * 24 * 60 * 60 * 1000,
                    )
                      .toISOString()
                      .split("T")[0],
                  },
                },
              })),
            },
          }),
        }}
      />
      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-8 flex-wrap">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <ChevronRight className="h-4 w-4 shrink-0" />
        <span className="text-foreground">Products</span>
      </div>

      <div className="flex flex-col items-center text-center space-y-2 mb-12 w-full">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary break-words px-2">
          All Products — Stationery &amp; Craft Supplies
        </h1>
        <p className="text-muted-foreground max-w-[600px] break-words px-4">
          Explore {MOTARRO_CATEGORIES.length} product categories including plastic, paper, wooden, metal,
          acrylic, art supplies, foam craft, and tiles — all priced in South African Rands.
        </p>
      </div>

      <Suspense fallback={<div className="h-32 rounded-2xl bg-white/70 animate-pulse mb-8" />}>
        <SectionCatalogFilters
          basePath="/products"
          categories={filterOptions.categories}
          types={filterOptions.types}
          brands={filterOptions.brands}
          activeSubcategory={activeFilters.subcategory}
          activeKevroCategory={activeFilters.kevroCategory}
        />
      </Suspense>

      <ProductGrid products={products} priorityCount={2} />

      <SEOContent
        category="All Products"
        features={[
          {
            title: "Full MOTARRO Catalogue",
            description: "Over 1,000 stationery and craft products aligned with the MOTARRO Australia range, adapted for the South African market.",
          },
          {
            title: "Prices in Rands",
            description: "All prices displayed in ZAR for easy shopping across South Africa with secure online checkout.",
          },
          {
            title: "Schools & Creators",
            description: "Essential supplies for classrooms, crafters, offices, and creative projects nationwide.",
          },
        ]}
        bottomText="MOTARRO Supplies brings the trusted MOTARRO stationery range to South Africa — quality products for education, creativity, and everyday organisation."
      />
    </div>
  );
}
