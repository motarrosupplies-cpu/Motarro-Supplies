import type { MerchantFeedProduct } from "@/lib/google-merchant/kevro";
import { normalizeMerchantImageUrl } from "@/lib/google-merchant/images";
import type { TitanJetProductRecord } from "@/types/titan-jet";

export function resolveTitanJetGoogleCategory(
  category?: string | null,
  name?: string | null
): string {
  const haystack = `${category || ""} ${name || ""}`.toLowerCase();

  if (
    haystack.includes("mug") ||
    haystack.includes("tumbler") ||
    haystack.includes("bottle") ||
    haystack.includes("drinkware")
  ) {
    return "1009";
  }
  if (haystack.includes("bag") || haystack.includes("backpack")) {
    return "6551";
  }
  if (
    haystack.includes("heat press") ||
    haystack.includes("printer") ||
    haystack.includes("technology")
  ) {
    return "222";
  }
  if (
    haystack.includes("vinyl") ||
    haystack.includes("paper") ||
    haystack.includes("sublimation") ||
    haystack.includes("heat transfer") ||
    haystack.includes("ink")
  ) {
    return "505328";
  }
  if (haystack.includes("plate") || haystack.includes("homeware")) {
    return "536";
  }
  if (haystack.includes("sock") || haystack.includes("baby") || haystack.includes("grow")) {
    return "1604";
  }
  if (haystack.includes("keyring") || haystack.includes("key ring")) {
    return "5941";
  }

  return "505328";
}

export function titanJetRowToMerchantFeedProduct(
  row: TitanJetProductRecord
): MerchantFeedProduct {
  const description =
    row.short_description?.trim() ||
    row.description?.trim() ||
    `${row.name} — sublimation supplies from Titan Jet, available through MOTARRO Supplies in South Africa.`;
  const image = normalizeMerchantImageUrl(row.image);
  const images = (row.images || [])
    .map((url) => normalizeMerchantImageUrl(url))
    .filter(Boolean);

  return {
    id: `titan-jet-${row.wc_product_id}`,
    name: row.name?.trim() || `Titan Jet product ${row.wc_product_id}`,
    description: description.slice(0, 5000),
    link: `https://www.motarro.co.za/sublimation-supplies/${row.slug || row.wc_product_id}`,
    price: Number(row.min_price) || 0,
    image: image || images[0] || null,
    images,
    availability: row.in_stock ? "in stock" : "out of stock",
    total_stock: row.total_stock,
    stock: row.total_stock,
    category: row.category || "Sublimation Supplies",
    brand: row.brand?.trim() || "Titan Jet",
    sku: row.sku || String(row.wc_product_id),
    google_product_category: resolveTitanJetGoogleCategory(row.category, row.name),
    identifier_exists: false,
  };
}

export const TITAN_JET_LOCAL_INVENTORY_COLUMNS =
  "wc_product_id, min_price, total_stock, in_stock";

export const TITAN_JET_MERCHANT_FEED_COLUMNS =
  "wc_product_id, slug, sku, name, description, short_description, category, brand, image, images, min_price, total_stock, in_stock";

export async function fetchAllTitanJetMerchantRows(
  client: { from: (table: string) => any },
  columns: string = TITAN_JET_MERCHANT_FEED_COLUMNS
): Promise<TitanJetProductRecord[]> {
  const pageSize = 1000;
  let from = 0;
  const rows: TitanJetProductRecord[] = [];

  while (true) {
    const { data, error } = await client
      .from("titan_jet_products")
      .select(columns)
      .eq("status", "active")
      .order("wc_product_id", { ascending: true })
      .range(from, from + pageSize - 1);

    if (error) {
      if (error.code === "42P01") return [];
      throw error;
    }

    const batch = (data as TitanJetProductRecord[]) ?? [];
    rows.push(...batch);

    if (batch.length < pageSize) {
      break;
    }

    from += pageSize;
  }

  return rows;
}
