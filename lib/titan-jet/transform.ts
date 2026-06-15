import type { WcStoreProduct } from "@/lib/titan-jet/client";
import { applyTitanJetMarkup } from "@/lib/titan-jet/markup";
import { buildTitanJetSlug } from "@/lib/titan-jet/slug";
import { resolveTitanJetStoreSection } from "@/lib/titan-jet/store-section";
import type { TitanJetProduct } from "@/types/titan-jet";

function minorUnitsToZar(value: string | number | undefined): number {
  const cents = Number(value);
  if (!Number.isFinite(cents)) return 0;
  return Math.round((cents / 100) * 100) / 100;
}

function stripHtml(value: string): string {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function resolveStock(product: WcStoreProduct): number {
  const maximum = Number(product.add_to_cart?.maximum);
  if (Number.isFinite(maximum) && maximum > 0) {
    return Math.floor(maximum);
  }
  return product.is_in_stock ? 999 : 0;
}

export async function transformWcStoreProduct(
  product: WcStoreProduct,
  resolveMarkup: (category: string, brand: string) => Promise<number>
): Promise<TitanJetProduct> {
  const categories = product.categories?.map((c) => c.name).filter(Boolean) ?? [];
  const category = categories[0] || "Sublimation Supplies";
  const brand = product.brands?.[0]?.name || "Titan Jet";
  const markupPercent = await resolveMarkup(category, brand);
  const basePrice = minorUnitsToZar(product.prices?.price);
  const displayPrice = applyTitanJetMarkup(basePrice, markupPercent);
  const stock = resolveStock(product);
  const images = product.images?.map((img) => img.src).filter(Boolean) ?? [];
  const image = images[0] || "";
  const attributes =
    product.attributes?.map((attr) => ({
      name: attr.name,
      value: attr.terms?.map((term) => term.name).filter(Boolean).join(", "),
    })).filter((attr) => attr.value) ?? [];

  const slug = product.slug?.trim() || buildTitanJetSlug(product.name, product.id);

  return {
    id: "",
    slug,
    wcProductId: product.id,
    sku: product.sku || String(product.id),
    name: product.name,
    description: stripHtml(product.description || product.short_description || product.name),
    shortDescription: stripHtml(product.short_description || ""),
    category,
    categories,
    brand,
    image,
    images,
    tags: product.tags?.map((tag) => tag.name).filter(Boolean) ?? [],
    attributes,
    variants: [
      {
        wcProductId: product.id,
        sku: product.sku || String(product.id),
        displayPrice,
        basePrice,
        qtyAvailable: stock,
        inStock: product.is_in_stock && stock > 0,
      },
    ],
    minPrice: displayPrice,
    maxPrice: displayPrice,
    totalStock: stock,
    inStock: product.is_in_stock && stock > 0,
    productType: product.type || "simple",
    storeSection: resolveTitanJetStoreSection({
      category,
      categories,
      name: product.name,
    }),
  };
}

export async function transformWcStoreProducts(
  products: WcStoreProduct[],
  resolveMarkup: (category: string, brand: string) => Promise<number>
): Promise<TitanJetProduct[]> {
  const transformed: TitanJetProduct[] = [];
  for (const product of products) {
    transformed.push(await transformWcStoreProduct(product, resolveMarkup));
  }
  return transformed;
}

export function filterTitanJetProducts(
  products: TitanJetProduct[],
  filters: {
    category?: string | null;
    brand?: string | null;
    search?: string | null;
    inStock?: boolean;
  }
): TitanJetProduct[] {
  let result = products;

  if (filters.category) {
    result = result.filter((product) => product.category === filters.category);
  }
  if (filters.brand) {
    result = result.filter((product) => product.brand === filters.brand);
  }
  if (filters.inStock) {
    result = result.filter((product) => product.inStock);
  }
  if (filters.search?.trim()) {
    const term = filters.search.trim().toLowerCase();
    result = result.filter(
      (product) =>
        product.name.toLowerCase().includes(term) ||
        product.sku.toLowerCase().includes(term) ||
        product.brand.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term)
    );
  }

  return result.sort((a, b) => a.name.localeCompare(b.name));
}
