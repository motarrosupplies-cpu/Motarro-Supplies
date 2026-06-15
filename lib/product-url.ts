/**
 * Helper function to get product URL
 * Uses slug if available, falls back to ID
 */
export function getProductUrl(product: { id: string; slug?: string; seoSlug?: string }): string {
  return `/products/${product.slug || product.seoSlug || product.id}`;
}

/**
 * Helper function to get full product URL with domain
 */
export function getProductUrlFull(product: { id: string; slug?: string; seoSlug?: string }): string {
  const slug = product.slug || product.seoSlug || product.id;
  return `https://www.motarro.co.za/products/${slug}`;
}

