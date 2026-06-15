import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Package, AlertCircle } from "lucide-react";
import { TitanJetProductCard } from "@/components/titan-jet/TitanJetProductCard";
import { TitanJetCatalogFilters } from "@/components/titan-jet/TitanJetCatalogFilters";
import { isTitanJetConfigured } from "@/lib/titan-jet/config";
import { normalizeTitanJetCatalogFilter } from "@/lib/titan-jet/catalog-filters";
import { getTitanJetCatalogPage } from "@/lib/titan-jet/cache";
import {
  buildTitanJetCatalogListingMetadata,
  titanJetListingSchemaItems,
} from "@/lib/titan-jet/seo";
import type { TitanJetProduct } from "@/types/titan-jet";
import { Button } from "@/components/ui/button";
import { CollectionPageSchema } from "@/components/seo/schema-org";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    category?: string;
    brand?: string;
    search?: string;
    inStock?: string;
    page?: string;
  }>;
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const params = await searchParams;
  return buildTitanJetCatalogListingMetadata({
    category: params.category ?? null,
    brand: params.brand ?? null,
    search: params.search ?? null,
  });
}

export default async function SublimationSuppliesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page || "1") || 1);

  if (!isTitanJetConfigured()) {
    return (
      <div className="container px-4 py-16 mx-auto max-w-3xl text-center">
        <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Catalog feed not configured</h1>
        <Button asChild className="mt-6">
          <Link href="/contact">Contact us</Link>
        </Button>
      </div>
    );
  }

  let products: TitanJetProduct[] = [];
  let total = 0;
  let categories: string[] = [];
  let brands: string[] = [];
  let loadError: string | null = null;

  try {
    const catalog = await getTitanJetCatalogPage({
      category: normalizeTitanJetCatalogFilter(params.category),
      brand: normalizeTitanJetCatalogFilter(params.brand),
      search: normalizeTitanJetCatalogFilter(params.search),
      inStock: params.inStock === "true",
      page,
      pageSize: 48,
    });

    products = catalog.products;
    total = catalog.total;
    categories = catalog.categories;
    brands = catalog.brands;
  } catch (error) {
    console.error("[sublimation-supplies]", error);
    loadError = "Unable to load the Titan Jet catalog right now. Please try again shortly.";
  }

  const totalPages = Math.max(1, Math.ceil(total / 48));
  const query = new URLSearchParams();
  const category = normalizeTitanJetCatalogFilter(params.category);
  const brand = normalizeTitanJetCatalogFilter(params.brand);
  const search = normalizeTitanJetCatalogFilter(params.search);
  if (category) query.set("category", category);
  if (brand) query.set("brand", brand);
  if (search) query.set("search", search);
  if (params.inStock === "true") query.set("inStock", "true");

  const listingDescription =
    category || brand || search
      ? `Browse ${[category, brand, search].filter(Boolean).join(", ")} from our Titan Jet sublimation supplies catalog.`
      : "Shop sublimation blanks, mugs, tumblers, vinyl, and heat transfer products from MOTARRO Supplies.";

  const listingCanonical = query.toString()
    ? `/sublimation-supplies?${query.toString()}`
    : "/sublimation-supplies";

  return (
    <div className="min-h-screen bg-gradient-to-b from-lavender to-white">
      <CollectionPageSchema
        name="Sublimation Supplies & Blanks"
        description={listingDescription}
        url={listingCanonical}
        items={titanJetListingSchemaItems(products)}
      />
      <div className="container px-4 py-12 mx-auto max-w-7xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
            <Package className="w-5 h-5" />
            <span className="font-semibold">Titan Jet supplier catalog</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-primary mb-4">
            Sublimation Supplies &amp; Blanks
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Mugs, tumblers, vinyl, heat transfer products, and printing supplies synced from
            Titan Jet — available through MOTARRO Supplies with your markup applied.
          </p>
        </div>

        <Suspense fallback={<div className="h-32 rounded-2xl bg-white/70 animate-pulse" />}>
          <TitanJetCatalogFilters categories={categories} brands={brands} />
        </Suspense>

        {loadError ? (
          <div className="text-center py-16">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">{loadError}</p>
          </div>
        ) : products.length > 0 ? (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              Showing {(page - 1) * 48 + 1}–{(page - 1) * 48 + products.length} of {total}{" "}
              product{total === 1 ? "" : "s"}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <TitanJetProductCard key={product.id || product.wcProductId} product={product} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-3 mt-10">
                {page > 1 && (
                  <Button asChild variant="outline">
                    <Link
                      href={`/sublimation-supplies?${new URLSearchParams({
                        ...Object.fromEntries(query),
                        page: String(page - 1),
                      }).toString()}`}
                    >
                      Previous
                    </Link>
                  </Button>
                )}
                <span className="flex items-center text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                {page < totalPages && (
                  <Button asChild variant="outline">
                    <Link
                      href={`/sublimation-supplies?${new URLSearchParams({
                        ...Object.fromEntries(query),
                        page: String(page + 1),
                      }).toString()}`}
                    >
                      Next
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <h2 className="text-xl font-bold mb-2">No products match your filters</h2>
            <p className="text-muted-foreground mb-6">
              Run a sync from Admin → Titan Jet Catalog, or clear your filters.
            </p>
            <Button asChild variant="outline">
              <Link href="/sublimation-supplies">View all products</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
