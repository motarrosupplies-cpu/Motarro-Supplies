import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Shirt, AlertCircle } from "lucide-react";
import { KevroProductCard } from "@/components/kevro/KevroProductCard";
import { KevroCatalogFilters } from "@/components/kevro/KevroCatalogFilters";
import { CollectionPageSchema } from "@/components/seo/schema-org";
import { isKevroConfigured } from "@/lib/kevro/config";
import { getKevroCatalogPage } from "@/lib/kevro/cache";
import {
  buildBrandedCatalogListingMetadata,
  kevroListingSchemaItems,
} from "@/lib/kevro/seo";
import type { KevroProduct } from "@/types/kevro";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    category?: string;
    brand?: string;
    type?: string;
    search?: string;
    inStock?: string;
    page?: string;
  }>;
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const params = await searchParams;
  return buildBrandedCatalogListingMetadata({
    category: params.category ?? null,
    brand: params.brand ?? null,
    type: params.type ?? null,
  });
}

export default async function BrandedCatalogPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page || "1") || 1);

  if (!isKevroConfigured()) {
    return (
      <div className="container px-4 py-16 mx-auto max-w-3xl text-center">
        <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Catalog feed not configured</h1>
        <p className="text-muted-foreground mb-6">
          Add your Kevro credentials to the server environment to enable the live
          branded apparel catalog.
        </p>
        <Button asChild>
          <Link href="/contact">Contact us for a quote</Link>
        </Button>
      </div>
    );
  }

  let products: KevroProduct[] = [];
  let total = 0;
  let categories: string[] = [];
  let brands: string[] = [];
  let types: string[] = [];
  let loadError: string | null = null;

  try {
    const catalog = await getKevroCatalogPage({
      category: params.category ?? null,
      brand: params.brand ?? null,
      type: params.type ?? null,
      search: params.search ?? null,
      inStock: params.inStock === "true",
      page,
      pageSize: 48,
    });

    products = catalog.products;
    total = catalog.total;
    categories = catalog.categories;
    brands = catalog.brands;
    types = catalog.types;
  } catch (error) {
    console.error("[branded-catalog]", error);
    loadError = "Unable to load the supplier feed right now. Please try again shortly.";
  }

  const totalPages = Math.max(1, Math.ceil(total / 48));
  const query = new URLSearchParams();
  if (params.category) query.set("category", params.category);
  if (params.brand) query.set("brand", params.brand);
  if (params.type) query.set("type", params.type);
  if (params.search) query.set("search", params.search);
  if (params.inStock === "true") query.set("inStock", "true");

  const listingDescription =
    params.category || params.brand || params.type
      ? `Browse ${[params.category, params.brand, params.type].filter(Boolean).join(", ")} from our branded supplier catalog.`
      : "Browse live branded apparel, headwear, bags, and promotional products with custom printing from MOTARRO Supplies.";

  const listingCanonical = (() => {
    const query = new URLSearchParams();
    if (params.category) query.set("category", params.category);
    if (params.brand) query.set("brand", params.brand);
    if (params.type) query.set("type", params.type);
    return query.toString() ? `/branded-catalog?${query.toString()}` : "/branded-catalog";
  })();

  return (
    <div className="min-h-screen bg-gradient-to-b from-lavender to-white">
      <CollectionPageSchema
        name="Branded Apparel Catalog"
        description={listingDescription}
        url={listingCanonical}
        items={kevroListingSchemaItems(products)}
      />
      <div className="container px-4 py-12 mx-auto max-w-7xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
            <Shirt className="w-5 h-5" />
            <span className="font-semibold">Live supplier catalog</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-primary mb-4">
            Branded Apparel &amp; Promotional Goods
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Live stock, colours, and pricing from our Kevro feed. Choose your garment and
            request a custom branding quote from MOTARRO Supplies.
          </p>
        </div>

        <Suspense fallback={<div className="h-32 rounded-2xl bg-white/70 animate-pulse" />}>
          <KevroCatalogFilters
            categories={categories}
            brands={brands}
            types={types}
          />
        </Suspense>

        {loadError ? (
          <div className="text-center py-16">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">{loadError}</p>
          </div>
        ) : products.length > 0 ? (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              Showing {(page - 1) * 48 + 1}–{(page - 1) * 48 + products.length} of{" "}
              {total} product{total === 1 ? "" : "s"}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <KevroProductCard key={product.id} product={product} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-3 mt-10">
                {page > 1 && (
                  <Button asChild variant="outline">
                    <Link
                      href={`/branded-catalog?${new URLSearchParams({
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
                      href={`/branded-catalog?${new URLSearchParams({
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
              Try clearing filters or searching for another brand or category.
            </p>
            <Button asChild variant="outline">
              <Link href="/branded-catalog">View all products</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
