import { buildKevroProductDescription } from "@/lib/kevro/seo";
import type { KevroProduct, KevroProductRecord } from "@/types/kevro";

export interface MerchantFeedProduct {
  id: string;
  name: string;
  description: string;
  link: string;
  price: number;
  image?: string | null;
  images?: unknown;
  availability?: string | null;
  availability_date?: string | null;
  total_stock?: number | null;
  stock?: number | null;
  category?: string | null;
  brand?: string | null;
  sku?: string | null;
  colors?: unknown;
  sizes?: unknown;
  google_product_category?: string;
  identifier_exists?: boolean;
}

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

export function resolveKevroGoogleCategory(category?: string | null, type?: string | null): string {
  const haystack = `${category || ""} ${type || ""}`.toLowerCase();

  if (haystack.includes("head") || haystack.includes("cap") || haystack.includes("hat")) {
    return "173";
  }
  if (haystack.includes("bag") || haystack.includes("backpack")) {
    return "6551";
  }
  if (haystack.includes("mug") || haystack.includes("drink") || haystack.includes("bottle")) {
    return "1009";
  }
  if (haystack.includes("pen") || haystack.includes("stationery") || haystack.includes("writing")) {
    return "951";
  }
  if (haystack.includes("technology") || haystack.includes("usb")) {
    return "222";
  }
  if (haystack.includes("gift") || haystack.includes("homeware")) {
    return "536";
  }

  return "1604";
}

export function kevroRowToMerchantFeedProduct(row: KevroProductRecord): MerchantFeedProduct {
  const product = mapRecord(row);
  const description =
    row.description?.trim() || buildKevroProductDescription(product);

  return {
    id: `kevro-${row.stock_header_id}`,
    name: row.name,
    description: description.slice(0, 5000),
    link: `https://www.motarro.co.za/branded-catalog/${row.slug || row.stock_header_id}`,
    price: Number(row.min_price) || 0,
    image: row.image,
    images: row.images,
    availability: row.in_stock ? "in stock" : "out of stock",
    total_stock: row.total_stock,
    stock: row.total_stock,
    category: [row.store_section || row.category, row.type].filter(Boolean).join(" > "),
    brand: row.brand?.trim() || "MOTARRO Supplies",
    sku: row.stock_code,
    colors: row.colors,
    sizes: row.sizes,
    google_product_category: resolveKevroGoogleCategory(row.category, row.type),
    identifier_exists: false,
  };
}

/** Lightweight — local inventory only needs ids, price, and stock. */
export const KEVRO_LOCAL_INVENTORY_COLUMNS =
  "stock_header_id, min_price, total_stock, in_stock";

/** Product feed fields without heavy variants JSONB (can be megabytes at scale). */
export const KEVRO_MERCHANT_FEED_COLUMNS =
  "stock_header_id, stock_code, slug, name, description, category, type, brand, image, images, colors, sizes, min_price, total_stock, in_stock, store_section, gender";

export async function fetchAllKevroMerchantRows(
  client: { from: (table: string) => any },
  columns: string = KEVRO_MERCHANT_FEED_COLUMNS
): Promise<KevroProductRecord[]> {
  const pageSize = 1000;
  let from = 0;
  const rows: KevroProductRecord[] = [];

  while (true) {
    const { data, error } = await client
      .from("kevro_products")
      .select(columns)
      .eq("status", "active")
      .order("stock_header_id", { ascending: true })
      .range(from, from + pageSize - 1);

    if (error) {
      if (error.code === "42P01") return [];
      throw error;
    }

    const batch = (data as KevroProductRecord[]) ?? [];
    rows.push(...batch);

    if (batch.length < pageSize) {
      break;
    }

    from += pageSize;
  }

  return rows;
}
