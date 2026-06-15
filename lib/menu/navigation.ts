import type { NavCategory } from "@/lib/menu/navigation-types";
import { MOTARRO_CATEGORIES } from "@/lib/motarro/categories";

export type { NavCategory, NavSubcategory } from "@/lib/menu/navigation-types";

export const staticNavigationCategories: NavCategory[] = [
  {
    name: "Shop",
    href: "/products",
    subcategories: [
      { name: "All Products", href: "/products" },
      { name: "New Arrivals", href: "/products/new" },
      { name: "Sale", href: "/sale" },
    ],
  },
  ...MOTARRO_CATEGORIES.map((cat) => ({
    name: cat.name,
    href: `/shop/${cat.slug}`,
    subcategories: [
      {
        name: `All ${cat.name}`,
        href: `/shop/${cat.slug}`,
        description: cat.description,
      },
    ],
  })),
  {
    name: "Blog",
    href: "/blog",
  },
];

export function normalizeMenuHref(rawHref: string | null | undefined): string {
  if (!rawHref) return "#";

  let href = rawHref.trim();
  if (!href) return "#";

  if (!href.startsWith("/")) {
    href = `/${href}`;
  }

  return href;
}

export function convertMenuItemsToCategories(menuItems: any[]): NavCategory[] {
  return menuItems.map((item) => ({
    name: item.label,
    href: normalizeMenuHref(item.href),
    subcategories:
      item.children && item.children.length > 0
        ? item.children.map((child: any) => ({
            name: child.label,
            href: normalizeMenuHref(child.href),
            description: child.description,
          }))
        : undefined,
  }));
}

export async function fetchNavigationCategories(): Promise<NavCategory[]> {
  const response = await fetch(`/api/menu?t=${Date.now()}`, {
    cache: "no-store",
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
    },
  });

  if (!response.ok) {
    return staticNavigationCategories;
  }

  const data = await response.json();
  if (data && Array.isArray(data) && data.length > 0) {
    return convertMenuItemsToCategories(data);
  }

  return staticNavigationCategories;
}
