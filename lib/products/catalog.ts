import type { Product } from "@/types/product";
import { isSupabaseConfigured, supabase, supabaseAdmin } from "@/lib/supabaseClient";
import { mapUnifiedRowToProduct } from "@/lib/products/map-native-product";
import { getMenuFilterKeywords } from "@/lib/menu/filter-keywords";
import { MOTARRO_SITE_URL } from "@/lib/brand";
import { MOTARRO_CATEGORIES } from "@/lib/motarro/categories";

export type CatalogPageSection =
  | "all"
  | "men"
  | "women"
  | "kids"
  | "accessories"
  | (typeof MOTARRO_CATEGORIES)[number]["dbCategory"];

export interface PageCatalogFilters {
  section: CatalogPageSection;
  subcategory?: string | null;
  kevroCategory?: string | null;
  brand?: string | null;
  type?: string | null;
  inStock?: boolean;
  excludeCustomPrinting?: boolean;
}

const emptyCatalogResult = {
  products: [] as Product[],
  filterOptions: {
    categories: [] as string[],
    subcategories: [] as string[],
    brands: [] as string[],
    types: [] as string[],
  },
  activeFilters: {
    subcategory: null as string | null,
    kevroCategory: null as string | null,
    brand: null as string | null,
    type: null as string | null,
  },
};

export async function fetchPageCatalog(filters: PageCatalogFilters) {
  if (!isSupabaseConfigured()) {
    return {
      ...emptyCatalogResult,
      activeFilters: {
        ...emptyCatalogResult.activeFilters,
        subcategory: filters.subcategory ?? null,
        brand: filters.brand ?? null,
        type: filters.type ?? null,
      },
    };
  }

  const filterKeywords =
    filters.section !== "all"
      ? await getMenuFilterKeywords(filters.section, filters.subcategory)
      : [];

  const client = supabaseAdmin || supabase;
  let query = client
    .from("all_products_unified")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (filters.section !== "all") {
    query = query.eq("category", filters.section);
  }

  if (filters.subcategory) {
    const normalized = filters.subcategory
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-");
    query = query.ilike("subcategory", `%${normalized}%`);
  }

  if (filters.type) {
    const normalizedType = filters.type.toLowerCase().trim();
    query = query.ilike("subcategory", `%${normalizedType}%`);
  }

  const { data, error } = await query;
  if (error) {
    console.error("[catalog] products", error);
  }

  let products = (data || [])
    .map((row) => mapUnifiedRowToProduct(row))
    .filter((product): product is Product => product !== null);

  if (filters.subcategory && filterKeywords.length > 0) {
    const normalized = filters.subcategory
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-");
    products = products.filter((product) => {
      const subcategory = (product.subcategory || "").toLowerCase();
      const name = product.name.toLowerCase();
      if (subcategory.includes(normalized)) return true;
      return filterKeywords.some(
        (keyword) => subcategory.includes(keyword) || name.includes(keyword)
      );
    });
  }

  if (filters.excludeCustomPrinting) {
    products = products.filter(
      (product) =>
        (product.category || "").toLowerCase().trim() !== "custom printing"
    );
  }

  if (filters.inStock) {
    products = products.filter((product) => (product.stock ?? 0) > 0);
  }

  products.sort((left, right) => left.name.localeCompare(right.name));

  const subcategories = [
    ...new Set(
      products
        .map((p) => p.subcategory)
        .filter((s): s is string => Boolean(s))
    ),
  ].sort();

  return {
    products,
    filterOptions: {
      categories: subcategories,
      subcategories,
      brands: [] as string[],
      types: subcategories,
    },
    activeFilters: {
      subcategory: filters.subcategory ?? null,
      kevroCategory: null,
      brand: filters.brand ?? null,
      type: filters.type ?? null,
    },
  };
}

export function productSchemaUrl(product: Product): string {
  return `${MOTARRO_SITE_URL}/products/${product.slug || product.seoSlug || product.id}`;
}
