import type { Product } from "@/types/product";
import {
  normalizeSupabaseUrl,
  normalizeSupabaseUrls,
  resolveAvailability,
  sanitizeCondition,
} from "@/lib/utils";

export function mapUnifiedRowToProduct(row: Record<string, unknown>): Product | null {
  const price = Number(row.price) || 0;
  const stock = Number(row.total_stock || row.stock || 0);
  const images = normalizeSupabaseUrls(row.images as string[] | null | undefined);
  const image = normalizeSupabaseUrl(
    (row.image as string | undefined) || images[0] || ""
  );

  if (price <= 0 || !image) {
    return null;
  }

  return {
    ...(row as object),
    id: String(row.id),
    name: String(row.name || ""),
    description: String(row.description || ""),
    price,
    originalPrice: row.original_price ? Number(row.original_price) : undefined,
    stock,
    category: row.category as Product["category"],
    images,
    image,
    sku: (row.sku as string | null) || null,
    availability: resolveAvailability(
      row.availability as Product["availability"],
      stock
    ),
    availabilityDate: (row.availability_date as string | null) ?? null,
    condition: sanitizeCondition(row.condition as Product["condition"]),
    slug: (row.slug as string) || (row.seo_slug as string) || null,
    seoSlug: (row.seo_slug as string) || (row.slug as string) || null,
    status: (row.status as Product["status"]) || "active",
    isNew: Boolean(row.is_new),
    onSale: Boolean(row.on_sale),
    hasColorOptions:
      row.product_type === "color_only" || row.product_type === "full_variant",
    hasSizeOptions:
      row.product_type === "size_only" || row.product_type === "full_variant",
    subcategory: (row.subcategory as string | null) ?? null,
  };
}
