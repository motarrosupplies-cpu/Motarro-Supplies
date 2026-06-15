import { unstable_cache } from "next/cache";
import { fetchAllTitanJetStoreProducts } from "@/lib/titan-jet/client";
import { getTitanJetConfig, isTitanJetConfigured } from "@/lib/titan-jet/config";
import { resolveTitanJetMarkupPercent } from "@/lib/titan-jet/markup";
import {
  getSyncedTitanJetFilterOptions,
  getSyncedTitanJetProduct,
  getSyncedTitanJetProducts,
  getSyncedTitanJetProductsPaginated,
} from "@/lib/titan-jet/repository";
import { filterTitanJetProducts, transformWcStoreProducts } from "@/lib/titan-jet/transform";
import type { TitanJetProduct } from "@/types/titan-jet";

const DEFAULT_CACHE_SECONDS = 1800;

const getCachedStoreProducts = unstable_cache(
  async () => fetchAllTitanJetStoreProducts(),
  ["titan-jet-store-feed"],
  {
    revalidate: DEFAULT_CACHE_SECONDS,
    tags: ["titan-jet-feed"],
  }
);

export function getTitanJetCacheSeconds(): number {
  const seconds = getTitanJetConfig().cacheSeconds;
  return Number.isFinite(seconds) && seconds > 0 ? seconds : DEFAULT_CACHE_SECONDS;
}

async function getLiveTitanJetProducts(filters?: {
  category?: string | null;
  brand?: string | null;
  search?: string | null;
  inStock?: boolean;
}): Promise<TitanJetProduct[]> {
  const rows = await getCachedStoreProducts();
  const products = await transformWcStoreProducts(rows, resolveTitanJetMarkupPercent);
  return filterTitanJetProducts(products, filters ?? {});
}

export async function getTitanJetProducts(filters?: {
  category?: string | null;
  brand?: string | null;
  search?: string | null;
  inStock?: boolean;
}): Promise<TitanJetProduct[]> {
  if (!isTitanJetConfigured()) {
    throw new Error("Titan Jet feed is not configured");
  }

  try {
    const synced = await getSyncedTitanJetProducts(filters);
    if (synced.length > 0) {
      return synced;
    }
  } catch (error) {
    console.warn("[titan-jet/cache] synced catalog unavailable, using live feed", error);
  }

  return getLiveTitanJetProducts(filters);
}

export async function getTitanJetProductBySlugOrId(
  slugOrId: string
): Promise<TitanJetProduct | null> {
  if (!isTitanJetConfigured()) {
    throw new Error("Titan Jet feed is not configured");
  }

  try {
    const synced = await getSyncedTitanJetProduct(slugOrId);
    if (synced) return synced;
  } catch (error) {
    console.warn("[titan-jet/cache] synced product lookup failed", error);
  }

  const products = await getLiveTitanJetProducts();
  return (
    products.find(
      (product) =>
        product.slug === slugOrId ||
        String(product.wcProductId) === slugOrId
    ) ?? null
  );
}

export async function getTitanJetCatalogPage(options: {
  category?: string | null;
  brand?: string | null;
  search?: string | null;
  inStock?: boolean;
  page: number;
  pageSize: number;
}): Promise<{
  products: TitanJetProduct[];
  total: number;
  categories: string[];
  brands: string[];
}> {
  if (!isTitanJetConfigured()) {
    throw new Error("Titan Jet feed is not configured");
  }

  try {
    const [pageResult, filterOptions] = await Promise.all([
      getSyncedTitanJetProductsPaginated(options),
      getSyncedTitanJetFilterOptions(),
    ]);

    if (pageResult.total > 0) {
      return {
        products: pageResult.products,
        total: pageResult.total,
        categories: filterOptions.categories,
        brands: filterOptions.brands,
      };
    }
  } catch (error) {
    console.warn("[titan-jet/cache] synced catalog page unavailable", error);
  }

  const products = await getLiveTitanJetProducts(options);
  const start = (options.page - 1) * options.pageSize;
  const categories = [...new Set(products.map((p) => p.category).filter(Boolean))].sort();
  const brands = [...new Set(products.map((p) => p.brand).filter(Boolean))].sort();

  return {
    products: products.slice(start, start + options.pageSize),
    total: products.length,
    categories,
    brands,
  };
}
