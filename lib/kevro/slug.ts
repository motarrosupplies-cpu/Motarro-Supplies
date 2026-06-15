export function buildKevroSlug(name: string, stockHeaderId: number): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);

  return `${base || "product"}-${stockHeaderId}`;
}

export function isNumericKevroId(value: string): boolean {
  return /^\d+$/.test(value);
}
