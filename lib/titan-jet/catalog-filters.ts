/** Treat empty and legacy "all" query values as no filter. */
export function normalizeTitanJetCatalogFilter(
  value?: string | null
): string | null {
  const trimmed = value?.trim();
  if (!trimmed || trimmed === "all") {
    return null;
  }
  return trimmed;
}
