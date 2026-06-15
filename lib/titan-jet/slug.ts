export function buildTitanJetSlug(name: string, wcProductId: number): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);

  return base || `product-${wcProductId}`;
}

export function isNumericTitanJetId(value: string): boolean {
  return /^\d+$/.test(value);
}
