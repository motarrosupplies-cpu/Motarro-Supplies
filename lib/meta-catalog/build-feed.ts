import {
  buildMerchantFeedProducts,
  isPublishableMerchantFeedProduct,
} from "@/lib/google-merchant/build-feed";
import {
  getAdditionalMerchantImageUrls,
  getPrimaryMerchantImageUrl,
} from "@/lib/google-merchant/images";
import type { MerchantFeedProduct } from "@/lib/google-merchant/kevro";
import {
  escapeCsvField,
  formatMetaAvailability,
  formatMetaPrice,
  formatMetaTitle,
  plainMetaDescription,
} from "@/lib/meta-catalog/format";

export const META_CATALOG_CSV_HEADERS = [
  "id",
  "title",
  "description",
  "availability",
  "condition",
  "price",
  "link",
  "image_link",
  "brand",
  "additional_image_link",
  "google_product_category",
  "product_type",
  "quantity_to_sell_on_facebook",
  "wa_compliance_category",
  "origin_country",
] as const;

export type MetaCatalogRow = Record<
  (typeof META_CATALOG_CSV_HEADERS)[number],
  string
>;

function merchantProductToMetaRow(product: MerchantFeedProduct): MetaCatalogRow | null {
  if (!isPublishableMerchantFeedProduct(product)) {
    return null;
  }

  const imageLink = getPrimaryMerchantImageUrl(product);
  if (!imageLink) return null;

  const additionalImages = getAdditionalMerchantImageUrls(product);
  const stock = Math.max(
    0,
    Math.floor(Number(product.total_stock ?? product.stock ?? 0))
  );

  return {
    id: product.id,
    title: formatMetaTitle(product.name),
    description: plainMetaDescription(product.description || product.name),
    availability: formatMetaAvailability(
      product.availability,
      product.total_stock ?? product.stock
    ),
    condition: "new",
    price: formatMetaPrice(Number(product.price)),
    link: product.link,
    image_link: imageLink,
    brand: (product.brand || "MOTARRO Supplies").trim() || "MOTARRO Supplies",
    additional_image_link: additionalImages.slice(0, 10).join(","),
    google_product_category: product.google_product_category || "1604",
    product_type: (product.category || "Apparel").trim(),
    quantity_to_sell_on_facebook: String(stock),
    wa_compliance_category: "DEFAULT",
    origin_country: "ZA",
  };
}

export function metaCatalogRowToCsvLine(row: MetaCatalogRow): string {
  return META_CATALOG_CSV_HEADERS.map((header) =>
    escapeCsvField(row[header] ?? "")
  ).join(",");
}

export type MetaCatalogSource = "all" | "kevro" | "titan-jet" | "motarro";

export function filterMerchantProductsBySource(
  products: MerchantFeedProduct[],
  source: MetaCatalogSource
): MerchantFeedProduct[] {
  if (source === "all") return products;
  if (source === "kevro") {
    return products.filter((product) => product.id.startsWith("kevro-"));
  }
  if (source === "titan-jet") {
    return products.filter((product) => product.id.startsWith("titan-jet-"));
  }
  return products.filter(
    (product) =>
      !product.id.startsWith("kevro-") && !product.id.startsWith("titan-jet-")
  );
}

export async function buildMetaCatalogFeed(source: MetaCatalogSource = "all") {
  const feed = await buildMerchantFeedProducts();
  const scopedProducts = filterMerchantProductsBySource(feed.publishable, source);
  const rows = scopedProducts
    .map(merchantProductToMetaRow)
    .filter((row): row is MetaCatalogRow => row !== null);

  const header = META_CATALOG_CSV_HEADERS.join(",");
  const body = rows.map(metaCatalogRowToCsvLine).join("\n");
  const csv = `${header}\n${body}`;

  return {
    csv,
    source,
    counts: {
      ...feed.counts,
      metaPublishable: rows.length,
    },
  };
}
