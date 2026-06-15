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
  { label: "Men", href: "/men" },
  { label: "Women", href: "/women" },
  { label: "Kids", href: "/kids" },
  { label: "Accessories", href: "/accessories" },
  { label: "Branded Catalog", href: "/branded-catalog" },
  { label: "Sublimation Supplies", href: "/sublimation-supplies" },
  { label: "Custom Printing", href: "/custom-printing" },
  { label: "School Events", href: "/school-events" },
  { label: "Ready to Ship", href: "/ready-to-ship" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Checkout", href: "/checkout" },
  { label: "Cart", href: "/cart" },
  { label: "FAQ", href: "/faq" },
  { label: "Shipping", href: "/shipping" },
  { label: "Size Guide", href: "/size-guide" },
  { label: "Blog", href: "/blog" },
  { label: "Pricing", href: "/pricing" },
  { label: "Portfolio", href: "/portfolio" },
];
