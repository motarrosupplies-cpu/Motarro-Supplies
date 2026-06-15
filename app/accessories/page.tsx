import type { Metadata } from "next"
import { ProductGrid } from "@/components/product-grid"
import { SEOContent } from "@/components/seo-content"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { Suspense } from "react"
import {
  availabilityToSchemaUrl,
  conditionToSchemaUrl,
  resolveAvailability,
  sanitizeCondition,
} from "@/lib/utils"
import { SectionCatalogFilters } from "@/components/catalog/SectionCatalogFilters"
import {
  buildSectionCatalogMetadata,
  getSectionCollectionSchemaMeta,
} from "@/lib/catalog/section-seo"
import { fetchPageCatalog, productSchemaUrl } from "@/lib/products/catalog"

export const revalidate = 3600

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string
    brand?: string
    type?: string
    inStock?: string
  }>
}): Promise<Metadata> {
  const params = await searchParams
  return buildSectionCatalogMetadata("accessories", {
    category: params.category ?? null,
    brand: params.brand ?? null,
    type: params.type ?? null,
  })
}

export default async function AccessoriesPage({
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
  const collectionSchema = getSectionCollectionSchemaMeta("accessories", {
    category: params.category ?? null,
    brand: params.brand ?? null,
    type: params.type ?? null,
  })
  const { products, filterOptions, activeFilters } = await fetchPageCatalog({
    section: "accessories",
    subcategory: params?.category,
    brand: params?.brand,
    type: params?.type,
    inStock: params.inStock === "true",
  })
  const breadcrumbFilter =
    activeFilters.subcategory ?? activeFilters.kevroCategory ?? null

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": collectionSchema.name,
            "description": collectionSchema.description,
            "url": collectionSchema.url,
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
                  "image": product.image || (product.images?.[0] || ''),
                  "brand": {
                    "@type": "Brand",
                    "name": product.isKevro ? (product.kevroBrand || "Kevro") : "MOTARRO Supplies"
                  },
                  "offers": {
                    "@type": "Offer",
                    "priceCurrency": "ZAR",
                    "price": (Number.isFinite(product.price)
                      ? Number(product.price).toFixed(2)
                      : String(product.price)),
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
                    "seller": {
                      "@type": "Organization",
                      "name": "MOTARRO Supplies"
                    },
                    "priceValidUntil": new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
                      .toISOString()
                      .split('T')[0]
                  },
                  "aggregateRating": {
                    "@type": "AggregateRating",
                    "ratingValue": "4.8",
                    "reviewCount": "127"
                  }
                }
              }))
            }
          })
        }}
      />
      <div className="container px-4 py-12 mx-auto max-w-full overflow-x-hidden">
        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-8 flex-wrap">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <ChevronRight className="h-4 w-4 shrink-0" />
          <span className="text-foreground">Accessories</span>
          {breadcrumbFilter && (
            <>
              <ChevronRight className="h-4 w-4 shrink-0" />
              <span className="text-foreground capitalize">
                {breadcrumbFilter.replace(/-/g, " ")}
              </span>
            </>
          )}
        </div>

        <div className="flex flex-col items-center text-center space-y-2 mb-12 w-full">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary break-words overflow-wrap-anywhere px-2">Custom Printed Accessories</h1>
          <p className="text-muted-foreground max-w-[600px] break-words px-4">
            Premium custom printed accessories and branded supplier catalog items. Hats, bags, and promotional products with fast delivery to Johannesburg and Kempton Park.
          </p>
        </div>

        <Suspense fallback={<div className="h-32 rounded-2xl bg-white/70 animate-pulse mb-8" />}>
          <SectionCatalogFilters
            basePath="/accessories"
            categories={filterOptions.categories}
            types={filterOptions.types}
            brands={filterOptions.brands}
            activeSubcategory={activeFilters.subcategory}
            activeKevroCategory={activeFilters.kevroCategory}
          />
        </Suspense>

        <ProductGrid products={products} priorityCount={2} />

        <SEOContent
          category="Accessories"
          features={[
            {
              title: "Versatile Style",
              description: "Our accessories complement any wardrobe, from casual everyday wear to professional business attire."
            },
            {
              title: "Durable Construction",
              description: "Built to last with premium materials and expert craftsmanship that withstands daily wear and tear."
            },
            {
              title: "Brand Enhancement",
              description: "Perfect for corporate branding, events, and promotional campaigns to increase brand visibility."
            }
          ]}
          bottomText="Accessories are the secret weapon of great style and effective branding. They add personality to your look, complete your outfit, and serve as powerful tools for brand recognition. Whether you're looking for personal style accessories or promotional items for your business, our collection offers endless possibilities."
        />
      </div>
    </>
  );
}
