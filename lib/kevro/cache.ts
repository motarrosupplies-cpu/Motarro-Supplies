import { unstable_cache } from "next/cache";
import { fetchKevroCategories, fetchKevroStockFeed } from "@/lib/kevro/client";
import { getKevroConfig, isKevroConfigured } from "@/lib/kevro/config";
import { resolveKevroMarkupPercent } from "@/lib/kevro/markup";
import {
  getSyncedKevroFilterOptions,
  getSyncedKevroProduct,
  getSyncedKevroProducts,
  getSyncedKevroProductsPaginated,
} from "@/lib/kevro/repository";
import { filterKevroProducts, groupKevroStockRows } from "@/lib/kevro/transform";
import type { KevroCategory, KevroProduct } from "@/types/kevro";

const DEFAULT_CACHE_SECONDS = 1800;

const getCachedStockRows = unstable_cache(
  async () => fetchKevroStockFeed(),
  ["kevro-stock-feed"],
  {
    revalidate: DEFAULT_CACHE_SECONDS,
    tags: ["kevro-feed"],
  }
);

const getCachedCategories = unstable_cache(
  async () => fetchKevroCategories(),
  ["kevro-categories"],
  {
    revalidate: DEFAULT_CACHE_SECONDS,
    tags: ["kevro-feed"],
  }
);

export function getKevroCacheSeconds(): number {
  const seconds = getKevroConfig().cacheSeconds;
  return Number.isFinite(seconds) && seconds > 0
    ? seconds
    : DEFAULT_CACHE_SECONDS;
}

async function getLiveKevroProducts(filters?: {
  category?: string | null;
  brand?: string | null;
  type?: string | null;
  search?: string | null;
  inStock?: boolean;
}): Promise<KevroProduct[]> {
  const rows = await getCachedStockRows();
  const products = await groupKevroStockRows(rows, resolveKevroMarkupPercent);
  return filterKevroProducts(products, filters ?? {});
}

export async function getKevroProducts(filters?: {
  category?: string | null;
  brand?: string | null;
  type?: string | null;
  search?: string | null;
  inStock?: boolean;
}): Promise<KevroProduct[]> {
  if (!isKevroConfigured()) {
    throw new Error("Kevro feed is not configured");
  }

  try {
    const synced = await getSyncedKevroProducts(filters);
    if (synced.length > 0) {
      return synced;
    }
  } catch (error) {
    console.warn("[kevro/cache] synced catalog unavailable, using live feed", error);
  }

  return getLiveKevroProducts(filters);
}

export async function getKevroProductBySlugOrId(
  slugOrId: string
): Promise<KevroProduct | null> {
  if (!isKevroConfigured()) {
    throw new Error("Kevro feed is not configured");
  }

  try {
    const synced = await getSyncedKevroProduct(slugOrId);
    if (synced) return synced;
  } catch (error) {
    console.warn("[kevro/cache] synced product lookup failed", error);
  }

  const products = await getLiveKevroProducts();
  return (
    products.find(
      (product) =>
        product.slug === slugOrId ||
        String(product.stockHeaderId) === slugOrId ||
        product.id === slugOrId
    ) ?? null
  );
}

export async function getKevroProductByHeaderId(
  stockHeaderId: number
): Promise<KevroProduct | null> {
  return getKevroProductBySlugOrId(String(stockHeaderId));
}

export async function getKevroCategories(): Promise<KevroCategory[]> {
  if (!isKevroConfigured()) {
    throw new Error("Kevro feed is not configured");
  }

  try {
    const products = await getSyncedKevroProducts();
    if (products.length > 0) {
      return [...new Set(products.map((product) => product.category))]
        .filter(Boolean)
        .sort()
        .map((category) => ({ Category: category }));
    }
  } catch {
    // fall through to live categories
  }

  return getCachedCategories();
}

export async function getKevroBrands(): Promise<string[]> {
  const products = await getKevroProducts();
  return [...new Set(products.map((product) => product.brand))].sort();
}

export async function getKevroTypes(category?: string | null): Promise<string[]> {
  const products = await getKevroProducts(
    category ? { category } : undefined
  );
  return [...new Set(products.map((product) => product.type))].sort();
}

export async function getKevroCatalogPage(options: {
  category?: string | null;
  brand?: string | null;
  type?: string | null;
  search?: string | null;
  inStock?: boolean;
  page?: number;
  pageSize?: number;
}): Promise<{
  products: KevroProduct[];
  total: number;
  categories: string[];
  brands: string[];
  types: string[];
}> {
  if (!isKevroConfigured()) {
    throw new Error("Kevro feed is not configured");
  }

  try {
    const [paginated, filterOptions] = await Promise.all([
      getSyncedKevroProductsPaginated(options),
      getSyncedKevroFilterOptions(),
    ]);

    if (paginated.total > 0) {
      let types = filterOptions.types;
      if (options.category) {
        const scoped = await getSyncedKevroProducts({ category: options.category });
        types = [...new Set(scoped.map((product) => product.type))].sort();
      }

      return {
        products: paginated.products,
        total: paginated.total,
        categories: filterOptions.categories,
        brands: filterOptions.brands,
        types,
      };
    }
  } catch (error) {
    console.warn("[kevro/cache] paginated synced catalog unavailable", error);
  }

  const products = await getLiveKevroProducts(options);
  const page = Math.max(1, options.page ?? 1);
  const pageSize = options.pageSize ?? 48;
  const from = (page - 1) * pageSize;

  return {
    products: products.slice(from, from + pageSize),
    total: products.length,
    categories: [...new Set(products.map((product) => product.category))].sort(),
    brands: [...new Set(products.map((product) => product.brand))].sort(),
    types: [...new Set(products.map((product) => product.type))].sort(),
  };
}
