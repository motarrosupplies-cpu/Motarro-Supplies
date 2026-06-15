import type { Product } from "@/types/product";
import type { KevroProduct } from "@/types/kevro";
import {
  resolveKevroStoreSection,
  resolveKevroSubcategorySlug,
  type StoreSection,
} from "@/lib/kevro/store-section";

function toProductCategory(
  section: StoreSection
): Product["category"] {
  if (section === "kids") return "kids";
  if (section === "men") return "men";
  if (section === "women") return "women";
  if (section === "accessories") return "accessories";
  return "unisex";
}

export function mapKevroToStoreProduct(
  product: KevroProduct,
  sectionOverride?: Exclude<StoreSection, "unisex">
): Product {
  const resolvedSection = resolveKevroStoreSection(product);
  const displaySection =
    sectionOverride && resolvedSection === "unisex"
      ? sectionOverride
      : resolvedSection;

  return {
    id: `kevro-${product.stockHeaderId}`,
    name: product.name,
    description: product.description,
    price: product.minPrice,
    image: product.image || product.images[0] || "/placeholder.svg",
    images: product.images.length
      ? product.images
      : product.image
        ? [product.image]
        : [],
    category: toProductCategory(displaySection),
    stock: product.totalStock,
    isNew: false,
    status: "active",
    slug: product.slug,
    sku: product.stockCode,
    hasColorOptions: product.colors.length > 0,
    hasSizeOptions: product.sizes.length > 0,
    variants: product.variants.map((variant) => ({
      id: String(variant.stockId),
      productId: `kevro-${product.stockHeaderId}`,
      colorName: variant.colour || null,
      size: variant.size || null,
      sku: variant.stockCode,
      priceOverride: variant.displayPrice,
      stockAvailable: variant.qtyAvailable,
      stockIncoming: 0,
      stockReserved: 0,
      isActive: variant.inStock,
    })),
    isKevro: true,
    subcategory: resolveKevroSubcategorySlug(product.type),
    kevroBrand: product.brand,
    kevroType: product.type,
  };
}
