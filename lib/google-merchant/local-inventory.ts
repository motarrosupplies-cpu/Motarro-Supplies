export const DEFAULT_MERCHANT_STORE_CODE = "16947522768377102701";

/** Matches checkout: free standard shipping on orders over R1000, else R99.99. */
export const GMC_STANDARD_SHIPPING_ZAR = 99.99;

export type LocalAvailability =
  | "in_stock"
  | "limited_availability"
  | "on_display_to_order"
  | "out_of_stock";

export interface LocalInventoryRow {
  id: string;
  price: number;
  originalPrice?: number | null;
  onSale?: boolean;
  stock: number;
  availability?: string | null;
}

export function resolveMerchantStoreCode(): string {
  return process.env.GOOGLE_MERCHANT_STORE_CODE?.trim() || DEFAULT_MERCHANT_STORE_CODE;
}

export function toLocalAvailability(
  availability: string | null | undefined,
  stock: number
): LocalAvailability {
  if (stock <= 0) return "out_of_stock";
  if (availability === "preorder" || availability === "backorder_soon") {
    return "on_display_to_order";
  }
  if (stock <= 2) return "limited_availability";
  return "in_stock";
}

function escapeTsv(value: string): string {
  if (!value) return "";
  return String(value).replace(/\t/g, " ").replace(/\r?\n/g, " ");
}

function formatPrice(amount: number): string {
  return `${Number(amount).toFixed(2)} ZAR`;
}

export function buildLocalInventoryTsv(
  products: LocalInventoryRow[],
  storeCode: string = resolveMerchantStoreCode()
): string {
  // GMC local inventory spec: snake_case attribute names (not "Store code" etc.)
  const header = [
    "id",
    "store_code",
    "availability",
    "price",
    "sale_price",
    "sale_price_effective_date",
    "quantity",
  ].join("\t");

  const rows = [header];

  for (const product of products) {
    const stock = Math.max(0, Number(product.stock) || 0);
    const availability = toLocalAvailability(product.availability, stock);
    const price = Number(product.price) || 0;
    const onSale = Boolean(product.onSale);
    const originalPrice = Number(product.originalPrice) || 0;
    const regularPrice =
      onSale && originalPrice > 0 ? originalPrice : price;
    const priceStr = formatPrice(regularPrice > 0 ? regularPrice : price);
    const salePriceStr = onSale && price > 0 ? formatPrice(price) : "";
    const salePriceEffectiveDate = salePriceStr
      ? `${new Date().toISOString().slice(0, 19).replace("T", "T")}+02:00/2099-12-31T23:59+02:00`
      : "";

    rows.push(
      [
        escapeTsv(product.id),
        escapeTsv(storeCode),
        availability,
        priceStr,
        salePriceStr,
        salePriceEffectiveDate,
        String(stock),
      ].join("\t")
    );
  }

  return rows.join("\n");
}
