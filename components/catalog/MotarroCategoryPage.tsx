import { Suspense } from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { ProductGrid } from "@/components/product-grid"
import { SectionCatalogFilters } from "@/components/catalog/SectionCatalogFilters"
import {
  getCategoryForSlug,
  type MotarroCategory,
} from "@/lib/motarro/categories"
import { MOTARRO_SITE_URL } from "@/lib/brand"
import {
  availabilityToSchemaUrl,
  conditionToSchemaUrl,
  resolveAvailability,
  sanitizeCondition,
} from "@/lib/utils"
import { fetchPageCatalog, productSchemaUrl } from "@/lib/products/catalog"
import { notFound } from "next/navigation"

interface Props {
  category: MotarroCategory
  searchParams: Promise<{ type?: string; inStock?: string }>
}

export async function buildMotarroCategoryMetadata(
  category: MotarroCategory
): Promise<Metadata> {
  return {
    title: category.seoTitle,
    description: category.seoDescription,
    keywords: category.seoKeywords,
    alternates: { canonical: `/shop/${category.slug}` },
    openGraph: {
      title: category.seoTitle,
      description: category.seoDescription,
      url: `${MOTARRO_SITE_URL}/shop/${category.slug}`,
      siteName: "MOTARRO Supplies",
    },
  }
}

export async function MotarroCategoryPage({
  category,
  searchParams,
}: Props) {
  const params = await searchParams
  const resolved = getCategoryForSlug(category.slug)
  if (!resolved) notFound()

  const { products, filterOptions, activeFilters } = await fetchPageCatalog({
    section: resolved.dbCategory,
    type: params?.type,
    inStock: params.inStock === "true",
    excludeCustomPrinting: true,
  })

  const pageUrl = `${MOTARRO_SITE_URL}/shop/${category.slug}`

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: `${category.name} — MOTARRO Supplies`,
            description: category.description,
            url: pageUrl,
            mainEntity: {
              "@type": "ItemList",
              itemListElement: products.slice(0, 50).map((product, index) => ({
                "@type": "ListItem",
                position: index + 1,
                item: {
                  "@type": "Product",
                  name: product.name,
                  url: productSchemaUrl(product),
                  image: product.image,
                  offers: {
                    "@type": "Offer",
                    price: product.price,
                    priceCurrency: "ZAR",
                    availability: availabilityToSchemaUrl(
                      resolveAvailability(
                        product.availability,
                        product.stock ?? 0
                      )
                    ),
                    itemCondition: conditionToSchemaUrl(
                      sanitizeCondition(product.condition)
                    ),
                  },
                },
              })),
            },
          }),
        }}
      />

      <div className="container px-4 py-8 mx-auto">
        <nav className="flex items-center text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-primary">
            Home
          </Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <Link href="/products" className="hover:text-primary">
            Shop
          </Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span className="text-foreground font-medium">{category.name}</span>
        </nav>

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-primary mb-3">
            {category.name}
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            {category.description}
          </p>
        </div>

        <Suspense fallback={<div className="h-32 rounded-2xl bg-white/70 animate-pulse mb-8" />}>
          <SectionCatalogFilters
            basePath={`/shop/${category.slug}`}
            categories={filterOptions.categories}
            types={filterOptions.types}
            brands={filterOptions.brands}
            activeSubcategory={activeFilters.subcategory}
            activeKevroCategory={activeFilters.kevroCategory}
          />
        </Suspense>

        <ProductGrid products={products} />
      </div>
    </>
  )
}
