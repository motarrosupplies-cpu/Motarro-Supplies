import { supabase, supabaseAdmin } from "@/lib/supabaseClient";
import type { KevroProduct, KevroProductRecord } from "@/types/kevro";
import { isNumericKevroId } from "@/lib/kevro/slug";
import {
  matchesSubcategoryFilter,
  productBelongsToSection,
  resolveKevroStoreSection,
  type StoreSection,
} from "@/lib/kevro/store-section";

function mapRecord(row: KevroProductRecord): KevroProduct {
  return {
    id: row.id,
    slug: row.slug,
    stockHeaderId: row.stock_header_id,
    stockCode: row.stock_code,
    name: row.name,
    description: row.description || row.name,
    category: row.category || "",
    type: row.type || "",
    brand: row.brand || "",
    image: row.image || "",
    images: row.images || [],
    colors: row.colors || [],
    sizes: row.sizes || [],
    variants: row.variants || [],
    minPrice: Number(row.min_price) || 0,
    maxPrice: Number(row.max_price) || 0,
    totalStock: Number(row.total_stock) || 0,
    inStock: Boolean(row.in_stock),
    garmentType: row.garment_type || undefined,
    gender: row.gender || undefined,
  };
}

export async function getSyncedKevroProducts(filters?: {
  category?: string | null;
  brand?: string | null;
  type?: string | null;
  search?: string | null;
  inStock?: boolean;
}): Promise<KevroProduct[]> {
  const client = supabaseAdmin || supabase;
  let query = client
    .from("kevro_products")
    .select("*")
    .eq("status", "active");

  if (filters?.category) query = query.eq("category", filters.category);
  if (filters?.brand) query = query.eq("brand", filters.brand);
  if (filters?.type) query = query.eq("type", filters.type);
  if (filters?.inStock) query = query.eq("in_stock", true);
  if (filters?.search) {
    const term = `%${filters.search.trim()}%`;
    query = query.or(
      `name.ilike.${term},stock_code.ilike.${term},brand.ilike.${term},type.ilike.${term}`
    );
  }

  const { data, error } = await query.order("name", { ascending: true });
  if (error) {
    if (error.code === "42P01") return [];
    throw error;
  }

  return (data as KevroProductRecord[]).map(mapRecord);
}

const LIST_COLUMNS =
  "id, stock_header_id, stock_code, slug, name, description, category, type, brand, image, images, colors, sizes, min_price, max_price, total_stock, in_stock, garment_type, gender, variants";

const LIST_COLUMNS_LITE =
  "id, stock_header_id, stock_code, slug, name, description, category, type, brand, image, min_price, max_price, total_stock, in_stock, gender, store_section, subcategory_slug";

export type CatalogStoreSection = StoreSection | "all";

type KevroLiteRow = Pick<
  KevroProductRecord,
  | "id"
  | "stock_header_id"
  | "stock_code"
  | "slug"
  | "name"
  | "description"
  | "category"
  | "type"
  | "brand"
  | "image"
  | "min_price"
  | "max_price"
  | "total_stock"
  | "in_stock"
  | "gender"
  | "store_section"
  | "subcategory_slug"
>;

function mapLiteRecord(row: KevroLiteRow): KevroProduct {
  return {
    id: row.id,
    slug: row.slug,
    stockHeaderId: row.stock_header_id,
    stockCode: row.stock_code,
    name: row.name,
    description: row.description || row.name,
    category: row.category || "",
    type: row.type || "",
    brand: row.brand || "",
    image: row.image || "",
    images: row.image ? [row.image] : [],
    colors: [],
    sizes: [],
    variants: [],
    minPrice: Number(row.min_price) || 0,
    maxPrice: Number(row.max_price) || 0,
    totalStock: Number(row.total_stock) || 0,
    inStock: Boolean(row.in_stock),
    gender: row.gender || undefined,
    storeSection: row.store_section || resolveKevroStoreSection(row),
    subcategorySlug: row.subcategory_slug || undefined,
  };
}

function applyStoreSectionFilter(
  products: KevroProduct[],
  section: CatalogStoreSection
): KevroProduct[] {
  if (section === "all") {
    return products;
  }

  return products.filter((product) =>
    productBelongsToSection(
      {
        storeSection: product.storeSection,
        gender: product.gender,
        category: product.category,
        type: product.type,
        name: product.name,
      },
      section
    )
  );
}

async function fetchKevroLiteRows(
  section: CatalogStoreSection
): Promise<KevroLiteRow[]> {
  const client = supabaseAdmin || supabase;
  const pageSize = 1000;
  let from = 0;
  const rows: KevroLiteRow[] = [];

  while (true) {
    let query = client
      .from("kevro_products")
      .select(LIST_COLUMNS_LITE)
      .eq("status", "active")
      .order("name", { ascending: true })
      .range(from, from + pageSize - 1);

    if (section === "men") {
      query = query.in("store_section", ["men", "unisex"]);
    } else if (section === "women") {
      query = query.in("store_section", ["women", "unisex"]);
    } else if (section !== "all") {
      query = query.eq("store_section", section);
    }

    const { data, error } = await query;

    if (error) {
      if (error.code === "42P01") return [];
      if (
        section !== "all" &&
        (error.message.includes("store_section") ||
          error.message.includes("column"))
      ) {
        return fetchKevroLiteRowsUnfiltered(section);
      }
      throw error;
    }

    const batch = (data as KevroLiteRow[]) ?? [];
    rows.push(...batch);

    if (batch.length < pageSize) {
      break;
    }
    from += pageSize;
  }

  return rows;
}

async function fetchKevroLiteRowsUnfiltered(
  section: CatalogStoreSection
): Promise<KevroLiteRow[]> {
  const client = supabaseAdmin || supabase;
  const pageSize = 1000;
  let from = 0;
  const rows: KevroLiteRow[] = [];

  while (true) {
    const { data, error } = await client
      .from("kevro_products")
      .select(
        "id, stock_header_id, stock_code, slug, name, description, category, type, brand, image, min_price, max_price, total_stock, in_stock, gender"
      )
      .eq("status", "active")
      .order("name", { ascending: true })
      .range(from, from + pageSize - 1);

    if (error) {
      if (error.code === "42P01") return [];
      throw error;
    }

    const batch = (data as KevroLiteRow[]) ?? [];
    rows.push(...batch);

    if (batch.length < pageSize) {
      break;
    }
    from += pageSize;
  }

  if (section === "all") {
    return rows;
  }

  if (section === "unisex") {
    return rows.filter(
      (row) => resolveKevroStoreSection(row) === "unisex"
    );
  }

  return rows.filter((row) =>
    productBelongsToSection(
      {
        storeSection: resolveKevroStoreSection(row),
        gender: row.gender,
        category: row.category,
        type: row.type,
        name: row.name,
      },
      section
    )
  );
}

export function resolveKevroCategoryFilter(
  value: string | null | undefined,
  categories: string[]
): { kevroCategory: string | null; subcategory: string | null } {
  const trimmed = value?.trim();
  if (!trimmed || trimmed === "all") {
    return { kevroCategory: null, subcategory: null };
  }

  const exact = categories.find(
    (category) => category.toLowerCase() === trimmed.toLowerCase()
  );
  if (exact) {
    return { kevroCategory: exact, subcategory: null };
  }

  const slug = trimmed.toLowerCase().replace(/\s+/g, "-");
  const bySlug = categories.find(
    (category) => category.toLowerCase().replace(/\s+/g, "-") === slug
  );
  if (bySlug) {
    return { kevroCategory: bySlug, subcategory: null };
  }

  return { kevroCategory: null, subcategory: trimmed };
}

export async function getKevroSectionCatalog(
  section: CatalogStoreSection,
  filters?: {
    categoryParam?: string | null;
    subcategory?: string | null;
    kevroCategory?: string | null;
    brand?: string | null;
    type?: string | null;
    inStock?: boolean;
    filterKeywords?: string[];
  }
): Promise<{
  products: KevroProduct[];
  filterOptions: { categories: string[]; types: string[]; brands: string[] };
  activeFilters: { kevroCategory: string | null; subcategory: string | null };
}> {
  const rows = await fetchKevroLiteRows(section);
  let products = rows.map(mapLiteRecord);

  const filterOptions = {
    categories: [...new Set(rows.map((row) => row.category).filter(Boolean))].sort(),
    types: [] as string[],
    brands: [] as string[],
  };

  const resolvedCategory = resolveKevroCategoryFilter(
    filters?.categoryParam ?? filters?.kevroCategory ?? filters?.subcategory ?? null,
    filterOptions.categories
  );
  const subcategory = filters?.subcategory ?? resolvedCategory.subcategory;
  const kevroCategory = filters?.kevroCategory ?? resolvedCategory.kevroCategory;

  if (subcategory) {
    products = products.filter((product) =>
      matchesSubcategoryFilter(
        product.type,
        subcategory,
        filters.filterKeywords ?? []
      )
    );
  }

  if (kevroCategory) {
    products = products.filter((product) => product.category === kevroCategory);
  }

  filterOptions.types = [
    ...new Set(products.map((product) => product.type).filter(Boolean)),
  ].sort();
  filterOptions.brands = [
    ...new Set(products.map((product) => product.brand).filter(Boolean)),
  ].sort();

  if (filters?.brand) {
    products = products.filter((product) => product.brand === filters.brand);
  }
  if (filters?.type) {
    products = products.filter((product) => product.type === filters.type);
  }
  if (filters?.inStock) {
    products = products.filter((product) => product.inStock);
  }

  return {
    products,
    filterOptions,
    activeFilters: {
      kevroCategory,
      subcategory: kevroCategory ? null : subcategory,
    },
  };
}

export async function getKevroProductsForStoreSection(
  section: CatalogStoreSection,
  filters?: {
    subcategory?: string | null;
    brand?: string | null;
    type?: string | null;
    filterKeywords?: string[];
  }
): Promise<KevroProduct[]> {
  const { products } = await getKevroSectionCatalog(section, filters);
  return products;
}

export async function getStoreSectionFilterOptions(
  section: CatalogStoreSection,
  filters?: { subcategory?: string | null; filterKeywords?: string[] }
): Promise<{ types: string[]; brands: string[] }> {
  const { filterOptions } = await getKevroSectionCatalog(section, {
    subcategory: filters?.subcategory,
    filterKeywords: filters?.filterKeywords,
  });
  return filterOptions;
}

export async function getKevroTaxonomySummary(): Promise<{
  categories: Array<{ name: string; count: number }>;
  types: Array<{ name: string; count: number; storeSections: string[] }>;
  brands: Array<{ name: string; count: number }>;
}> {
  const client = supabaseAdmin || supabase;
  const { data, error } = await client
    .from("kevro_products")
    .select("category, type, brand, gender, store_section")
    .eq("status", "active");

  if (error) {
    if (error.code === "42P01") {
      return { categories: [], types: [], brands: [] };
    }
    throw error;
  }

  const categoryMap = new Map<string, number>();
  const typeMap = new Map<string, Set<string>>();
  const typeCountMap = new Map<string, number>();
  const brandMap = new Map<string, number>();

  for (const row of data ?? []) {
    if (row.category) {
      categoryMap.set(row.category, (categoryMap.get(row.category) ?? 0) + 1);
    }
    if (row.type) {
      typeCountMap.set(row.type, (typeCountMap.get(row.type) ?? 0) + 1);
      const sections = typeMap.get(row.type) ?? new Set<string>();
      const section =
        row.store_section ||
        resolveKevroStoreSection({
          gender: row.gender,
          category: row.category,
          type: row.type,
        });
      sections.add(section);
      typeMap.set(row.type, sections);
    }
    if (row.brand) {
      brandMap.set(row.brand, (brandMap.get(row.brand) ?? 0) + 1);
    }
  }

  return {
    categories: [...categoryMap.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name)),
    types: [...typeMap.entries()]
      .map(([name, storeSections]) => ({
        name,
        count: typeCountMap.get(name) ?? 0,
        storeSections: [...storeSections].sort(),
      }))
      .sort((a, b) => a.name.localeCompare(b.name)),
    brands: [...brandMap.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name)),
  };
}

export async function getSyncedKevroProductsPaginated(
  options: {
    category?: string | null;
    brand?: string | null;
    type?: string | null;
    search?: string | null;
    inStock?: boolean;
    page?: number;
    pageSize?: number;
  } = {}
): Promise<{ products: KevroProduct[]; total: number }> {
  const client = supabaseAdmin || supabase;
  const page = Math.max(1, options.page ?? 1);
  const pageSize = Math.min(96, Math.max(1, options.pageSize ?? 48));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = client
    .from("kevro_products")
    .select(LIST_COLUMNS, { count: "exact" })
    .eq("status", "active");

  if (options.category) query = query.eq("category", options.category);
  if (options.brand) query = query.eq("brand", options.brand);
  if (options.type) query = query.eq("type", options.type);
  if (options.inStock) query = query.eq("in_stock", true);
  if (options.search) {
    const term = `%${options.search.trim()}%`;
    query = query.or(
      `name.ilike.${term},stock_code.ilike.${term},brand.ilike.${term},type.ilike.${term}`
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
    products: (data as KevroProductRecord[]).map(mapRecord),
    total: count ?? 0,
  };
}

export async function getSyncedKevroFilterOptions(): Promise<{
  categories: string[];
  brands: string[];
  types: string[];
}> {
  const client = supabaseAdmin || supabase;
  const { data, error } = await client
    .from("kevro_products")
    .select("category, brand, type")
    .eq("status", "active");

  if (error) {
    if (error.code === "42P01") return { categories: [], brands: [], types: [] };
    throw error;
  }

  const rows = data ?? [];
  return {
    categories: [...new Set(rows.map((row) => row.category).filter(Boolean))].sort(),
    brands: [...new Set(rows.map((row) => row.brand).filter(Boolean))].sort(),
    types: [...new Set(rows.map((row) => row.type).filter(Boolean))].sort(),
  };
}

export async function getSyncedKevroProduct(
  slugOrId: string
): Promise<KevroProduct | null> {
  const client = supabaseAdmin || supabase;
  let query = client.from("kevro_products").select("*").eq("status", "active");

  if (isNumericKevroId(slugOrId)) {
    query = query.eq("stock_header_id", Number(slugOrId));
  } else {
    query = query.eq("slug", slugOrId);
  }

  const { data, error } = await query.maybeSingle();
  if (error) {
    if (error.code === "42P01") return null;
    throw error;
  }
  if (!data) return null;
  return mapRecord(data as KevroProductRecord);
}

export async function getKevroVariantStock(
  stockHeaderId: number,
  stockId: number
): Promise<number> {
  const product = await getSyncedKevroProduct(String(stockHeaderId));
  if (!product) return 0;
  const variant = product.variants.find((row) => row.stockId === stockId);
  return variant?.qtyAvailable ?? 0;
}

export async function searchSyncedKevroProducts(query: string, limit = 5) {
  const products = await getSyncedKevroProducts({ search: query });
  return products.slice(0, limit).map((product) => ({
    id: product.id,
    name: product.name,
    price: product.minPrice,
    category: `Branded Catalog · ${product.category}`,
    image: product.image,
    slug: product.slug,
    description: `${product.brand} ${product.type}`,
    href: `/branded-catalog/${product.slug || product.stockHeaderId}`,
    source: "kevro" as const,
  }));
}
