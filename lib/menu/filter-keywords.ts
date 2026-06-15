import { supabase, supabaseAdmin } from "@/lib/supabaseClient";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function getMenuFilterKeywords(
  section: string,
  subcategory?: string | null
): Promise<string[]> {
  if (!subcategory) return [];

  const client = supabaseAdmin || supabase;
  const { data: menuItems, error } = await client
    .from("menu_items")
    .select("id, label, href, parent_id, filter_keywords")
    .eq("is_active", true);

  if (error || !menuItems?.length) {
    return [];
  }

  const sectionPath = `/${section}`;
  const sectionRoots = menuItems.filter((item) => {
    const href = (item.href || "").split("?")[0];
    return href === sectionPath || slugify(item.label || "") === section;
  });

  const rootIds = new Set(sectionRoots.map((item) => item.id));
  const subSlug = slugify(subcategory);

  const matchingChild = menuItems.find((item) => {
    if (!item.parent_id || !rootIds.has(item.parent_id)) {
      return false;
    }
    const labelSlug = slugify(item.label || "");
    const hrefCategory = (item.href || "").match(/[?&]category=([^&]+)/)?.[1];
    const hrefSlug = hrefCategory ? slugify(decodeURIComponent(hrefCategory)) : "";
    return labelSlug === subSlug || hrefSlug === subSlug || labelSlug.includes(subSlug);
  });

  if (!matchingChild?.filter_keywords) {
    return [];
  }

  return matchingChild.filter_keywords
    .split(",")
    .map((keyword) => keyword.trim().toLowerCase())
    .filter(Boolean);
}
