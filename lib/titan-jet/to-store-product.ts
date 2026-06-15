import type { Product } from "@/types/product";
import type { TitanJetProduct } from "@/types/titan-jet";

export function mapTitanJetToStoreProduct(product: TitanJetProduct): Product {
  return {
    id: `titan-jet-${product.wcProductId}`,
    name: product.name,
    description: product.description,
    price: product.minPrice,
    image: product.image || product.images[0] || "/placeholder.svg",
    images: product.images.length ? product.images : product.image ? [product.image] : [],
    category: "accessories",
    stock: product.totalStock,
    isNew: false,
    status: "active",
    slug: product.slug,
    sku: product.sku,
    hasColorOptions: false,
    hasSizeOptions: false,
    variants: product.variants.map((variant) => ({
      id: String(variant.wcProductId),
      productId: `titan-jet-${product.wcProductId}`,
      sku: variant.sku,
      priceOverride: variant.displayPrice,
      stockAvailable: variant.qtyAvailable,
      stockIncoming: 0,
      stockReserved: 0,
      isActive: variant.inStock,
    })),
    isTitanJet: true,
    subcategory: product.category,
    titanJetBrand: product.brand,
  };
}
