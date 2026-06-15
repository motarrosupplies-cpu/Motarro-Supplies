import { MOTARRO_CATEGORIES } from "@/lib/motarro/categories"

export interface StaticMenuItem {
  id: string
  label: string
  href: string
  description?: string | null
  children?: StaticMenuItem[]
}

/** Legacy Apparely routes that should not appear in navigation after rebrand. */
export const LEGACY_MENU_HREFS = new Set([
  "/men",
  "/women",
  "/kids",
  "/accessories",
  "/custom-printing",
  "/school-events",
  "/branded-catalog",
  "/sublimation-supplies",
  "/ready-to-ship",
  "/pricing",
  "/portfolio",
  "/size-guide",
])

function normalizeHref(href: string | null | undefined): string {
  if (!href) return ""
  const path = href.trim().split("?")[0]
  return path.startsWith("/") ? path : `/${path}`
}

export function isLegacyMenuItem(item: { href?: string | null; children?: StaticMenuItem[] }): boolean {
  const href = normalizeHref(item.href)
  if (href && LEGACY_MENU_HREFS.has(href)) return true
  return (item.children ?? []).some(isLegacyMenuItem)
}

export function isLegacyMenu(items: StaticMenuItem[]): boolean {
  return items.some(isLegacyMenuItem)
}

/** MOTARRO stationery & craft navigation — used when DB menu is empty or legacy. */
export function getMotarroStaticMenu(): StaticMenuItem[] {
  return [
    {
      id: "static-all-products",
      label: "All Products",
      href: "/products",
      children: [
        {
          id: "static-new-arrivals",
          label: "New Arrivals",
          href: "/products/new",
          description: "Latest stationery and craft additions",
        },
        {
          id: "static-sale-items",
          label: "Sale Items",
          href: "/sale",
          description: "Discounted supplies",
        },
      ],
    },
    ...MOTARRO_CATEGORIES.map((cat) => ({
      id: `static-${cat.slug}`,
      label: cat.name,
      href: `/shop/${cat.slug}`,
      children: [
        {
          id: `static-${cat.slug}-all`,
          label: `All ${cat.name}`,
          href: `/shop/${cat.slug}`,
          description: cat.description,
        },
      ],
    })),
    {
      id: "static-blog",
      label: "Blog",
      href: "/blog",
    },
  ]
}
