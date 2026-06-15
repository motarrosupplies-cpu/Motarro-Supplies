export type TitanJetStoreSection =
  | "accessories"
  | "unisex"
  | "men"
  | "women"
  | "kids";

export function resolveTitanJetStoreSection(product: {
  category?: string | null;
  categories?: string[];
  name?: string;
}): TitanJetStoreSection {
  const haystack = [
    product.category || "",
    ...(product.categories || []),
    product.name || "",
  ]
    .join(" ")
    .toLowerCase();

  if (/\b(sock|shirt|hoodie|jacket|apron|wear)\b/.test(haystack)) {
    return "unisex";
  }

  return "accessories";
}
