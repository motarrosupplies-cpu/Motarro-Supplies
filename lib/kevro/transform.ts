import { applyKevroMarkup } from "@/lib/kevro/markup";
import { buildKevroSlug } from "@/lib/kevro/slug";
import type {
  KevroColorOption,
  KevroProduct,
  KevroStockRow,
  KevroVariant,
} from "@/types/kevro";

const SIZE_ORDER = [
  "XXS",
  "XS",
  "XSML",
  "SML",
  "S",
  "MED",
  "M",
  "LAR",
  "L",
  "XL",
  "2XL",
  "3XL",
  "4XL",
  "5XL",
  "STD",
  "OS",
] as const;

export type KevroMarkupResolver = (
  category: string,
  brand: string
) => number | Promise<number>;

function sizeIndex(size: string): number {
  const normalized = size.trim().toUpperCase();
  const index = SIZE_ORDER.indexOf(normalized as (typeof SIZE_ORDER)[number]);
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}

function rowSalePrice(row: KevroStockRow): number {
  const discounted = row.DiscountedPrice ?? row.DiscountBasePrice;
  if (typeof discounted === "number" && discounted > 0) {
    return discounted;
  }
  return row.BasePrice;
}

function toVariant(
  row: KevroStockRow,
  markupPercent: number
): KevroVariant {
  const salePrice = rowSalePrice(row);
  const displayPrice = applyKevroMarkup(salePrice, markupPercent);
  const qtyAvailable = Number(row.QtyAvailable ?? 0);

  return {
    stockId: row.StockID,
    stockCode:
      (row.StockCode && String(row.StockCode).trim()) ||
      `SKU-${row.StockID}`,
    colour: row.Colour,
    size: row.Size,
    colorStatus: row.ColorStatus,
    basePrice: applyKevroMarkup(row.BasePrice, markupPercent),
    salePrice: displayPrice,
    displayPrice,
    qtyAvailable,
    image: row.Image,
    inStock: qtyAvailable > 0,
  };
}

export async function groupKevroStockRows(
  rows: KevroStockRow[],
  resolveMarkup: KevroMarkupResolver = () => 0
): Promise<KevroProduct[]> {
  const grouped = new Map<number, KevroStockRow[]>();

  for (const row of rows) {
    const list = grouped.get(row.StockHeaderID) ?? [];
    list.push(row);
    grouped.set(row.StockHeaderID, list);
  }

  const products: KevroProduct[] = [];

  for (const [stockHeaderId, headerRows] of grouped.entries()) {
    const first = headerRows[0];
    const markupPercent = await resolveMarkup(first.Category, first.Brand);
    const variants = headerRows.map((row) => toVariant(row, markupPercent));
    const prices = variants.map((variant) => variant.displayPrice);
    const colorMap = new Map<string, KevroColorOption>();

    for (const row of headerRows) {
      if (!colorMap.has(row.Colour)) {
        colorMap.set(row.Colour, {
          name: row.Colour,
          image: row.Image,
          status: row.ColorStatus,
        });
      }
    }

    const sizes = [...new Set(headerRows.map((row) => row.Size))].sort(
      (a, b) => sizeIndex(a) - sizeIndex(b)
    );

    const images = [...new Set(headerRows.map((row) => row.Image).filter(Boolean))];
    const totalStock = variants.reduce(
      (sum, variant) => sum + variant.qtyAvailable,
      0
    );

    const stockCode =
      (first.StockCode && String(first.StockCode).trim()) ||
      `HDR-${stockHeaderId}`;

    products.push({
      id: `kevro-${stockHeaderId}`,
      slug: buildKevroSlug(first.Description || stockCode, stockHeaderId),
      stockHeaderId,
      stockCode,
      name: first.Description,
      description: first.Description,
      category: first.Category,
      type: first.Type,
      brand: first.Brand,
      image: images[0] || "",
      images,
      colors: [...colorMap.values()],
      sizes,
      variants,
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
      totalStock,
      inStock: totalStock > 0,
      garmentType: first.GarmentType,
      gender: first.Gender,
    });
  }

  return products.sort((a, b) => a.name.localeCompare(b.name));
}

export function filterKevroProducts(
  products: KevroProduct[],
  filters: {
    category?: string | null;
    brand?: string | null;
    type?: string | null;
    search?: string | null;
    inStock?: boolean;
  }
): KevroProduct[] {
  const search = filters.search?.trim().toLowerCase();

  return products.filter((product) => {
    if (filters.category && product.category !== filters.category) return false;
    if (filters.brand && product.brand !== filters.brand) return false;
    if (filters.type && product.type !== filters.type) return false;
    if (filters.inStock && !product.inStock) return false;

    if (search) {
      const haystack = [
        product.name,
        product.stockCode,
        product.brand,
        product.type,
        product.category,
        product.slug,
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(search)) return false;
    }

    return true;
  });
}
