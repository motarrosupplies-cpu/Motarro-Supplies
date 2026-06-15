import { supabase, supabaseAdmin } from "@/lib/supabaseClient";
import type { CatalogProductSnippet } from "@/lib/xai/types";

function buildSearchTerms(message: string): string[] {
  const words = message
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2);

  const unique = [...new Set(words)];
  return unique.slice(0, 8);
}

export async function searchCatalogForLead(
  message: string,
  limit = 12
): Promise<CatalogProductSnippet[]> {
  const client = supabaseAdmin || supabase;
  const terms = buildSearchTerms(message);
  const queryText = terms.length > 0 ? terms.join(" ") : message.slice(0, 80);
  const ilike = `%${queryText}%`;
  const results: CatalogProductSnippet[] = [];

  const { data: nativeRows } = await client
    .from("all_products_unified")
    .select("name, slug, seo_slug, category, price")
    .eq("status", "active")
    .or(`name.ilike.${ilike},description.ilike.${ilike},category.ilike.${ilike}`)
    .limit(6);

  for (const row of nativeRows || []) {
    const slug = row.slug || row.seo_slug;
    if (!slug || !row.name) continue;
    results.push({
      name: row.name,
      href: `https://www.motarro.co.za/products/${slug}`,
      category: row.category || "Products",
      price: Number(row.price) || null,
    });
  }

  const { data: kevroRows } = await client
    .from("kevro_products")
    .select("name, slug, stock_header_id, category, type, min_price")
    .eq("status", "active")
    .or(`name.ilike.${ilike},type.ilike.${ilike},category.ilike.${ilike},brand.ilike.${ilike}`)
    .limit(4);

  for (const row of kevroRows || []) {
    if (!row.name) continue;
    results.push({
      name: row.name,
      href: `https://www.motarro.co.za/branded-catalog/${row.slug || row.stock_header_id}`,
      category: [row.category, row.type].filter(Boolean).join(" · ") || "Branded catalog",
      price: Number(row.min_price) || null,
    });
  }

  const { data: titanRows } = await client
    .from("titan_jet_products")
    .select("name, slug, wc_product_id, category, min_price")
    .eq("status", "active")
    .or(`name.ilike.${ilike},category.ilike.${ilike},sku.ilike.${ilike}`)
    .limit(4);

  for (const row of titanRows || []) {
    if (!row.name) continue;
    results.push({
      name: row.name,
      href: `https://www.motarro.co.za/sublimation-supplies/${row.slug || row.wc_product_id}`,
      category: row.category || "Sublimation supplies",
      price: Number(row.min_price) || null,
    });
  }

  const seen = new Set<string>();
  return results
    .filter((item) => {
      const key = item.href.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, limit);
}
