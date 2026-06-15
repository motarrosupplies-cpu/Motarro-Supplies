import type { MockupGarmentId } from "@/components/custom-printing/mockupModelConfig"

const MUG_PRODUCT_ID = "66e265a8-7781-4b2c-b398-25db73495d54"

/** Pick a default 3D garment from product naming / category. */
export function inferMockupGarmentId(product: {
  id?: string | null
  name?: string | null
  category?: string | null
  subcategory?: string | null
}): MockupGarmentId {
  if (product.id === MUG_PRODUCT_ID) {
    return "mug"
  }

  const hay = `${product.name ?? ""} ${product.category ?? ""} ${product.subcategory ?? ""}`.toLowerCase()

  if (/\b(mug|mugs|11\s*oz|11oz|drinkware|ceramic\s*mug)\b/.test(hay)) {
    return "mug"
  }
  if (/\b(hoodie|hoodies|sweatshirt|sweat\s*shirt)\b/.test(hay)) {
    return "hoodie"
  }
  if (/\b(6[\s-]*panel|baseball\s*cap|\bcap\b|\bcaps\b)\b/.test(hay)) {
    return "cap"
  }
  return "tshirt"
}
