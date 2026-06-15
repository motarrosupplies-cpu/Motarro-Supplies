import type { Metadata } from "next";

const SITE_URL = "https://www.motarro.co.za";

export type CatalogSection = "men" | "women" | "kids" | "accessories";

interface SectionSeoConfig {
  label: string;
  possessive: string;
  title: string;
  description: string;
  keywords: string[];
  openGraph: { title: string; description: string };
  collectionName: string;
  collectionDescription: string;
}

const SECTION_SEO: Record<CatalogSection, SectionSeoConfig> = {
  men: {
    label: "Men's",
    possessive: "Men's",
    title: "Men's Custom Apparel South Africa | MOTARRO Supplies",
    description:
      "Men's custom apparel and custom printed clothing in South Africa. Custom t-shirts, hoodies, polo shirts, and branded supplier catalog items. Fast delivery to Johannesburg, Kempton Park & nationwide.",
    keywords: [
      "men's custom apparel",
      "mens custom apparel south africa",
      "men's custom printed apparel",
      "branded men's clothing",
      "custom t-shirts",
      "men's hoodies",
      "Johannesburg",
      "Kempton Park",
    ],
    openGraph: {
      title: "Men's Custom Apparel - Printed Clothing & T-Shirts",
      description:
        "Premium men's custom apparel and branded catalog items including t-shirts, hoodies, and polo shirts with fast delivery.",
    },
    collectionName: "Men's Custom Printed Clothing",
    collectionDescription:
      "Custom printed men's clothing and branded apparel including t-shirts, hoodies, and accessories",
  },
  women: {
    label: "Women's",
    possessive: "Women's",
    title: "Women's Custom Apparel | Printed Clothing South Africa | MOTARRO Supplies",
    description:
      "Ladies custom apparel and women's custom printed clothing in South Africa. Custom t-shirts, hoodies, dresses, and branded supplier catalog items. Fast delivery to Johannesburg & Kempton Park.",
    keywords: [
      "ladies custom apparel",
      "women's custom apparel south africa",
      "women's custom printed apparel",
      "branded women's clothing",
      "custom t-shirts",
      "women's hoodies",
      "Johannesburg",
      "Kempton Park",
    ],
    openGraph: {
      title: "Women's Custom Apparel - Ladies Printed Clothing & T-Shirts",
      description:
        "Stylish ladies custom apparel and branded catalog items including t-shirts, hoodies, and dresses.",
    },
    collectionName: "Women's Custom Printed Clothing",
    collectionDescription:
      "Custom printed women's clothing and branded apparel including t-shirts, hoodies, and dresses",
  },
  kids: {
    label: "Kids",
    possessive: "Kids",
    title: "Kids Custom Apparel South Africa | MOTARRO Supplies",
    description:
      "Kids and youth custom apparel in South Africa. School wear, kiddies t-shirts, hoodies, and branded supplier catalog items with custom printing. Delivery to Johannesburg & Kempton Park.",
    keywords: [
      "kids custom apparel",
      "kids custom apparel south africa",
      "youth apparel",
      "school wear",
      "kiddies t-shirts",
      "children's clothing",
      "Johannesburg",
      "Kempton Park",
    ],
    openGraph: {
      title: "Kids Custom Apparel - Youth & School Wear",
      description:
        "Kids and youth custom apparel including school wear, t-shirts, and hoodies with custom printing.",
    },
    collectionName: "Kids Custom Apparel",
    collectionDescription:
      "Kids and youth custom apparel including school wear, t-shirts, and hoodies",
  },
  accessories: {
    label: "Accessories",
    possessive: "Custom",
    title: "Custom Accessories - Hats, Bags & More | Printed Accessories | MOTARRO Supplies",
    description:
      "Premium custom printed accessories and branded promotional items including caps, bags, mugs, and drinkware. Custom branding from MOTARRO Supplies in Johannesburg & Kempton Park.",
    keywords: [
      "custom accessories",
      "printed accessories",
      "promotional items",
      "branded caps",
      "custom bags",
      "corporate gifts",
      "Johannesburg",
      "Kempton Park",
    ],
    openGraph: {
      title: "Custom Accessories - Hats, Bags & More | Printed Accessories",
      description:
        "Premium custom printed accessories including caps, bags, mugs, and promotional items for branding and events.",
    },
    collectionName: "Custom Printed Accessories",
    collectionDescription:
      "Custom printed accessories including caps, bags, mugs, and promotional items",
  },
};

export interface SectionCatalogFilters {
  category?: string | null;
  brand?: string | null;
  type?: string | null;
}

export function buildSectionCatalogPath(
  section: CatalogSection,
  filters?: SectionCatalogFilters
): string {
  const query = new URLSearchParams();
  if (filters?.category) query.set("category", filters.category);
  if (filters?.brand) query.set("brand", filters.brand);
  if (filters?.type) query.set("type", filters.type);
  const qs = query.toString();
  return qs ? `/${section}?${qs}` : `/${section}`;
}

export function buildSectionCatalogAbsoluteUrl(
  section: CatalogSection,
  filters?: SectionCatalogFilters
): string {
  return `${SITE_URL}${buildSectionCatalogPath(section, filters)}`;
}

export function buildSectionCatalogMetadata(
  section: CatalogSection,
  filters?: SectionCatalogFilters
): Metadata {
  const config = SECTION_SEO[section];
  const filterParts = [
    filters?.brand,
    filters?.type,
    filters?.category?.replace(/-/g, " "),
  ].filter(Boolean) as string[];

  const canonical = buildSectionCatalogPath(section, filters);

  const title =
    filterParts.length > 0
      ? `${filterParts.join(" · ")} | ${config.possessive} Custom Apparel | MOTARRO Supplies`
      : config.title;

  const description =
    filterParts.length > 0
      ? `Shop ${filterParts.join(", ")} in our ${config.label.toLowerCase()} custom apparel and branded catalog. Custom printing and embroidery from MOTARRO Supplies in Johannesburg & Kempton Park.`
      : config.description;

  return {
    title,
    description: description.slice(0, 160),
    keywords: [
      ...config.keywords,
      ...(filters?.brand ? [filters.brand, `${filters.brand} South Africa`] : []),
      ...(filters?.type ? [filters.type, `custom ${filters.type}`] : []),
      ...(filters?.category
        ? [filters.category.replace(/-/g, " "), `${filters.category.replace(/-/g, " ")} South Africa`]
        : []),
    ],
    alternates: { canonical },
    openGraph: {
      title: filterParts.length > 0 ? title : config.openGraph.title,
      description:
        filterParts.length > 0 ? description.slice(0, 160) : config.openGraph.description,
      url: `${SITE_URL}${canonical}`,
      siteName: "MOTARRO Supplies",
      locale: "en_ZA",
      type: "website",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
      },
    },
  };
}

export function getSectionCollectionSchemaMeta(
  section: CatalogSection,
  filters?: SectionCatalogFilters
) {
  const config = SECTION_SEO[section];
  const filterParts = [
    filters?.brand,
    filters?.type,
    filters?.category?.replace(/-/g, " "),
  ].filter(Boolean) as string[];

  return {
    name:
      filterParts.length > 0
        ? `${filterParts.join(" · ")} | ${config.collectionName}`
        : config.collectionName,
    description:
      filterParts.length > 0
        ? `Browse ${filterParts.join(", ")} in our ${config.label.toLowerCase()} collection. ${config.collectionDescription}.`
        : config.collectionDescription,
    url: buildSectionCatalogAbsoluteUrl(section, filters),
  };
}
