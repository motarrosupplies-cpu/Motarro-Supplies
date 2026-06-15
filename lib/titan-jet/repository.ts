import { supabase, supabaseAdmin } from "@/lib/supabaseClient";
import { isNumericTitanJetId } from "@/lib/titan-jet/slug";
import type { TitanJetProduct, TitanJetProductRecord } from "@/types/titan-jet";

function mapRecord(row: TitanJetProductRecord): TitanJetProduct {
  return {
    id: row.id,
    slug: row.slug,
    wcProductId: row.wc_product_id,
    sku: row.sku || String(row.wc_product_id),
    name: row.name,
    description: row.description || row.name,
    shortDescription: row.short_description || "",
    category: row.category || "",
    categories: row.categories || [],
    brand: row.brand || "",
    image: row.image || "",
    images: row.images || [],
    tags: row.tags || [],
    attributes: row.attributes || [],
    variants: row.variants || [],
    minPrice: Number(row.min_price) || 0,
    maxPrice: Number(row.max_price) || 0,
    totalStock: Number(row.total_stock) || 0,
    inStock: Boolean(row.in_stock),
    productType: row.product_type || "simple",
    storeSection: row.store_section || undefined,
  };
}

const LIST_COLUMNS =
  "id, wc_product_id, slug, sku, name, description, short_description, category, categories, brand, image, images, tags, attributes, variants, min_price, max_price, total_stock, in_stock, product_type, store_section";

export async function getSyncedTitanJetProducts(filters?: {
  category?: string | null;
  brand?: string | null;
  search?: string | null;
  inStock?: boolean;
}): Promise<TitanJetProduct[]> {
  const client = supabaseAdmin || supabase;
  let query = client.from("titan_jet_products").select(LIST_COLUMNS).eq("status", "active");

  if (filters?.category && filters.category !== "all") {
    query = query.eq("category", filters.category);
  }
  if (filters?.brand && filters.brand !== "all") {
    query = query.eq("brand", filters.brand);
  }
  if (filters?.inStock) query = query.eq("in_stock", true);
  if (filters?.search?.trim()) {
    const term = `%${filters.search.trim()}%`;
    query = query.or(
      `name.ilike.${term},sku.ilike.${term},brand.ilike.${term},category.ilike.${term},description.ilike.${term},short_description.ilike.${term}`
    );
  }

  const { data, error } = await query.order("name", { ascending: true });
  if (error) {
    if (error.code === "42P01") return [];
    throw error;
  }

  return (data as TitanJetProductRecord[]).map(mapRecord);
}

export async function getSyncedTitanJetProductsPaginated(options: {
  category?: string | null;
  brand?: string | null;
  search?: string | null;
  inStock?: boolean;
  page: number;
  pageSize: number;
}): Promise<{ products: TitanJetProduct[]; total: number }> {
  const client = supabaseAdmin || supabase;
  const from = (options.page - 1) * options.pageSize;
  const to = from + options.pageSize - 1;

  let query = client
    .from("titan_jet_products")
    .select(LIST_COLUMNS, { count: "exact" })
    .eq("status", "active");

  if (options.category && options.category !== "all") {
    query = query.eq("category", options.category);
  }
  if (options.brand && options.brand !== "all") {
    query = query.eq("brand", options.brand);
  }
  if (options.inStock) query = query.eq("in_stock", true);
  if (options.search?.trim()) {
    const term = `%${options.search.trim()}%`;
    query = query.or(
      `name.ilike.${term},sku.ilike.${term},brand.ilike.${term},category.ilike.${term},description.ilike.${term},short_description.ilike.${term}`
    );
  }

  const { data, error, count } = await query
    .order("name", { ascending: true })
    .range(from, to);

  if (error) {
    if (error.code === "42P01") return { products: [], total: 0 };
    throw error;
  }

  return {
    products: ((data as TitanJetProductRecord[]) ?? []).map(mapRecord),
    total: count ?? 0,
  };
}

export async function getSyncedTitanJetFilterOptions(): Promise<{
  categories: string[];
  brands: string[];
}> {
  const client = supabaseAdmin || supabase;
  const { data, error } = await client
    .from("titan_jet_products")
    .select("category, brand")
    .eq("status", "active");

  if (error) {
    if (error.code === "42P01") return { categories: [], brands: [] };
    throw error;
  }

  const categories = new Set<string>();
  const brands = new Set<string>();
  for (const row of data ?? []) {
    if (row.category) categories.add(row.category);
    if (row.brand) brands.add(row.brand);
  }

  return {
    categories: [...categories].sort(),
    brands: [...brands].sort(),
  };
}

export async function getSyncedTitanJetProduct(
  slugOrId: string
): Promise<TitanJetProduct | null> {
  const client = supabaseAdmin || supabase;
  let query = client.from("titan_jet_products").select(LIST_COLUMNS).eq("status", "active");

  if (isNumericTitanJetId(slugOrId)) {
    query = query.eq("wc_product_id", Number(slugOrId));
  } else {
    query = query.eq("slug", slugOrId);
  }

  const { data, error } = await query.maybeSingle();
  if (error) {
    if (error.code === "42P01") return null;
    throw error;
  }

  return data ? mapRecord(data as TitanJetProductRecord) : null;
}

export async function getTitanJetProductStock(wcProductId: number): Promise<number> {
  const client = supabaseAdmin || supabase;
  const { data, error } = await client
    .from("titan_jet_products")
    .select("total_stock, in_stock")
    .eq("wc_product_id", wcProductId)
    .eq("status", "active")
    .maybeSingle();

  if (error || !data) return 0;
  if (!data.in_stock) return 0;
  return Math.max(0, Number(data.total_stock) || 0);
}

export async function searchSyncedTitanJetProducts(
  search: string,
  limit = 12
): Promise<TitanJetProduct[]> {
  const products = await getSyncedTitanJetProducts({ search, inStock: false });
  return products.slice(0, limit);
}
