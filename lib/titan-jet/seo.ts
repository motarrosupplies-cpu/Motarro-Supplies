import type { Metadata } from "next";
import type { TitanJetProduct } from "@/types/titan-jet";
import {
  availabilityToSchemaUrl,
  resolveAvailability,
} from "@/lib/utils";

const SITE_URL = "https://www.motarro.co.za";

export function titanJetProductPath(product: TitanJetProduct): string {
  return `/sublimation-supplies/${product.slug || product.wcProductId}`;
}

export function titanJetProductAbsoluteUrl(product: TitanJetProduct): string {
  return `${SITE_URL}${titanJetProductPath(product)}`;
}

export function buildTitanJetProductKeywords(product: TitanJetProduct): string[] {
  const keywords = new Set<string>();

  const add = (value?: string | null) => {
    const trimmed = value?.trim();
    if (trimmed) keywords.add(trimmed);
  };

  add(product.name);
  add(product.brand);
  add(product.category);
  add(product.sku);
  add(`${product.brand} ${product.category}`.trim());
  add(`${product.name} South Africa`);
  add(`${product.category} South Africa`);
  add("sublimation supplies South Africa");
  add("sublimation blanks Johannesburg");
  add("sublimation blanks Kempton Park");
  add("heat transfer products South Africa");
  add("sublimation mugs South Africa");
  add("sublimation tumblers South Africa");
  add("vinyl printing supplies");
  add("Titan Jet supplies");
  add("sublimation printing supplies");
  add("MOTARRO Supplies");

  for (const tag of product.tags ?? []) {
    add(tag);
  }

  return [...keywords].filter(Boolean);
}

export function buildTitanJetProductDescription(product: TitanJetProduct): string {
  const price =
    product.minPrice > 0
      ? ` From R${product.minPrice.toFixed(2)} incl. VAT.`
      : "";
  const stock = product.inStock ? "In stock" : "Check availability";

  return [
    `Order ${product.name}${product.brand ? ` by ${product.brand}` : ""}.`,
    `${product.category || "Sublimation supplies"} · Titan Jet catalog.`,
    `${stock} from our live sublimation supplies feed.`,
    `Mugs, tumblers, vinyl, heat transfer blanks and printing supplies from MOTARRO Supplies in Johannesburg & Kempton Park.${price}`,
    product.sku ? `SKU ${product.sku}.` : "",
  ]
    .filter(Boolean)
    .join(" ");
}

export function buildTitanJetProductTitle(product: TitanJetProduct): string {
  const base = [product.name, product.brand, "Sublimation Supplies"]
    .filter(Boolean)
    .join(" | ");
  const withSite = base.length <= 52 ? `${base} | MOTARRO Supplies` : `${product.name} | MOTARRO Supplies`;

  if (withSite.length <= 60) {
    return withSite;
  }

  return `${product.name.slice(0, 40).trim()}… | MOTARRO Supplies`;
}

export function buildTitanJetProductMetadata(product: TitanJetProduct): Metadata {
  const title = buildTitanJetProductTitle(product);
  const description = buildTitanJetProductDescription(product).slice(0, 160);
  const canonical = titanJetProductPath(product);
  const image = product.image || product.images[0] || undefined;
  const absoluteUrl = titanJetProductAbsoluteUrl(product);

  return {
    title,
    description,
    keywords: buildTitanJetProductKeywords(product),
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: absoluteUrl,
      siteName: "MOTARRO Supplies",
      type: "website",
      locale: "en_ZA",
      images: image
        ? [
            {
              url: image,
              alt: product.name,
            },
          ]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : [],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export function titanJetProductBreadcrumbs(product: TitanJetProduct) {
  return [
    { name: "Home", url: "/" },
    { name: "Sublimation Supplies", url: "/sublimation-supplies" },
    ...(product.category
      ? [
          {
            name: product.category,
            url: `/sublimation-supplies?category=${encodeURIComponent(product.category)}`,
          },
        ]
      : []),
    {
      name: product.name,
      url: titanJetProductPath(product),
    },
  ];
}

export function titanJetProductSchemaInput(product: TitanJetProduct) {
  const images = [
    ...(product.image ? [product.image] : []),
    ...product.images.filter((url) => url && url !== product.image),
  ];
  const availability = availabilityToSchemaUrl(
    resolveAvailability(undefined, product.totalStock)
  );

  return {
    product: {
      id: String(product.wcProductId),
      name: product.name,
      description: buildTitanJetProductDescription(product),
      image: images.length > 0 ? images : undefined,
      sku: product.sku,
      slug: product.slug,
      price: product.minPrice,
      category: [product.category, product.brand, "Sublimation Supplies"]
        .filter(Boolean)
        .join(" > "),
      brand: product.brand || "Titan Jet",
      availability,
      condition: "https://schema.org/NewCondition",
      offers: {
        price: product.minPrice,
        priceCurrency: "ZAR",
        availability,
        url: titanJetProductAbsoluteUrl(product),
      },
    },
    productUrl: titanJetProductPath(product),
  };
}

export function buildTitanJetCatalogListingMetadata(filters?: {
  category?: string | null;
  brand?: string | null;
  search?: string | null;
}): Metadata {
  const parts = [filters?.category, filters?.brand, filters?.search].filter(
    Boolean
  );

  const title =
    parts.length > 0
      ? `${parts.join(" · ")} | Sublimation Supplies | MOTARRO Supplies`
      : "Sublimation Supplies & Blanks | Titan Jet Catalog | MOTARRO Supplies";

  const description =
    parts.length > 0
      ? `Shop ${parts.join(", ")} from our Titan Jet sublimation supplies catalog. Mugs, tumblers, vinyl, heat transfer products and printing blanks from MOTARRO Supplies in Johannesburg & Kempton Park.`
      : "Shop sublimation blanks, mugs, tumblers, vinyl, heat transfer products and printing supplies from Titan Jet — available through MOTARRO Supplies with local support in South Africa.";

  const query = new URLSearchParams();
  if (filters?.category) query.set("category", filters.category);
  if (filters?.brand) query.set("brand", filters.brand);
  if (filters?.search) query.set("search", filters.search);
  const canonical = query.toString()
    ? `/sublimation-supplies?${query.toString()}`
    : "/sublimation-supplies";

  return {
    title,
    description: description.slice(0, 160),
    keywords: [
      "sublimation supplies South Africa",
      "sublimation blanks Johannesburg",
      "sublimation blanks Kempton Park",
      "sublimation mugs South Africa",
      "sublimation tumblers",
      "heat transfer vinyl South Africa",
      "heat transfer paper",
      "sublimation printing supplies",
      "Titan Jet catalog",
      "sublimation products South Africa",
      "printing supplies Johannesburg",
      ...(filters?.category ? [filters.category, `${filters.category} sublimation`] : []),
      ...(filters?.brand ? [filters.brand, `${filters.brand} supplies`] : []),
      ...(filters?.search ? [filters.search] : []),
    ],
    alternates: { canonical },
    openGraph: {
      title,
      description,
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

export function titanJetListingSchemaItems(products: TitanJetProduct[]) {
  return products.map((product) => ({
    name: product.name,
    url: titanJetProductPath(product),
    image: product.image || product.images[0],
    description: buildTitanJetProductDescription(product).slice(0, 200),
    price: product.minPrice,
    priceCurrency: "ZAR",
    availability: product.inStock
      ? "https://schema.org/InStock"
      : "https://schema.org/OutOfStock",
  }));
}
