import { MOTARRO_CATEGORIES } from "@/lib/motarro/categories";

export type MenuPageOption = {
  label: string;
  href: string;
};

/** Public storefront routes available in Admin → Menu Management page link picker. */
export const AVAILABLE_MENU_PAGES: MenuPageOption[] = [
  { label: "Home", href: "/" },
  { label: "All Products", href: "/products" },
  { label: "New Arrivals", href: "/products/new" },
  { label: "Sale Items", href: "/sale" },
  ...MOTARRO_CATEGORIES.map((cat) => ({
    label: cat.name,
    href: `/shop/${cat.slug}`,
  })),
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Blog", href: "/blog" },
  { label: "FAQ", href: "/faq" },
  { label: "Shipping", href: "/shipping" },
  { label: "Help Center", href: "/help" },
  { label: "Checkout", href: "/checkout" },
  { label: "Cart", href: "/cart" },
];
