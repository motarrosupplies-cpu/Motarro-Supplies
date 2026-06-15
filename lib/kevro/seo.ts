import type { Metadata } from "next";
import type { KevroProduct } from "@/types/kevro";
import {
  availabilityToSchemaUrl,
  resolveAvailability,
} from "@/lib/utils";

const SITE_URL = "https://www.motarro.co.za";

export function kevroProductPath(product: KevroProduct): string {
  return `/branded-catalog/${product.slug || product.stockHeaderId}`;
}

export function kevroProductAbsoluteUrl(product: KevroProduct): string {
  return `${SITE_URL}${kevroProductPath(product)}`;
}

export function buildKevroProductKeywords(product: KevroProduct): string[] {
  const keywords = new Set<string>();

  const add = (value?: string | null) => {
    const trimmed = value?.trim();
    if (trimmed) keywords.add(trimmed);
  };

  add(product.name);
  add(product.brand);
  add(product.type);
  add(product.category);
  add(product.gender);
  add(product.stockCode);
  add(`${product.brand} ${product.type}`.trim());
  add(`${product.type} South Africa`);
  add(`${product.type} Johannesburg`);
  add(`${product.type} Kempton Park`);
  add(`custom printed ${product.type}`.toLowerCase());
  add(`branded ${product.type}`.toLowerCase());
  add(`promotional ${product.type}`.toLowerCase());
  add(`corporate ${product.type}`.toLowerCase());
  add("custom printing South Africa");
  add("branded apparel South Africa");
  add("promotional products South Africa");
  add("embroidery South Africa");
  add("screen printing Johannesburg");
  add("MOTARRO Supplies");

  if (product.gender) {
    add(`${product.gender} ${product.type}`.trim());
  }

  return [...keywords].filter(Boolean);
}

export function buildKevroProductDescription(product: KevroProduct): string {
  const price =
    product.minPrice > 0
      ? ` From R${product.minPrice.toFixed(2)} excl. VAT.`
      : "";
  const stock = product.inStock ? "In stock" : "Check availability";
  const colours =
    product.colors.length > 0
      ? ` Available in ${product.colors.length} colour${product.colors.length === 1 ? "" : "s"}.`
      : "";

  return [
    `Order ${product.name} by ${product.brand || "leading supplier"}.`,
    `${product.type}${product.category ? ` · ${product.category}` : ""}.`,
    `${stock} from our live branded catalog.${colours}`,
    `Custom printing, embroidery, and branding from MOTARRO Supplies in Kempton Park & Johannesburg.${price}`,
    `SKU ${product.stockCode}.`,
  ].join(" ");
}

export function buildKevroProductTitle(product: KevroProduct): string {
  const brand = product.brand?.trim();
  const type = product.type?.trim();
  const base = [product.name, brand, type].filter(Boolean).join(" | ");
  const withSite = base.length <= 52 ? `${base} | MOTARRO Supplies` : `${product.name} | MOTARRO Supplies`;

  if (withSite.length <= 60) {
    return withSite;
  }

  return `${product.name.slice(0, 40).trim()}… | MOTARRO Supplies`;
}

export function buildKevroProductMetadata(product: KevroProduct): Metadata {
  const title = buildKevroProductTitle(product);
  const description = buildKevroProductDescription(product).slice(0, 160);
  const canonical = kevroProductPath(product);
  const image = product.image || product.images[0] || undefined;
  const absoluteUrl = `${SITE_URL}${canonical}`;

  return {
    title,
    description,
    keywords: buildKevroProductKeywords(product),
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

export function kevroProductBreadcrumbs(product: KevroProduct) {
  return [
    { name: "Home", url: "/" },
    { name: "Branded Catalog", url: "/branded-catalog" },
    ...(product.category
      ? [
          {
            name: product.category,
            url: `/branded-catalog?category=${encodeURIComponent(product.category)}`,
          },
        ]
      : []),
    {
      name: product.name,
      url: kevroProductPath(product),
    },
  ];
}

export function kevroProductSchemaInput(product: KevroProduct) {
  const images = [
    ...(product.image ? [product.image] : []),
    ...product.images.filter((url) => url && url !== product.image),
  ];
  const availability = availabilityToSchemaUrl(
    resolveAvailability(undefined, product.totalStock)
  );

  return {
    product: {
      id: String(product.stockHeaderId),
      name: product.name,
      description: buildKevroProductDescription(product),
      image: images.length > 0 ? images : undefined,
      sku: product.stockCode,
      slug: product.slug,
      price: product.minPrice,
      category: [product.category, product.type, product.gender]
        .filter(Boolean)
        .join(" > "),
      brand: product.brand || "MOTARRO Supplies",
      availability,
      condition: "https://schema.org/NewCondition",
      offers: {
        price: product.minPrice,
        priceCurrency: "ZAR",
        availability,
        url: kevroProductAbsoluteUrl(product),
      },
    },
    productUrl: kevroProductPath(product),
  };
}

export function buildBrandedCatalogListingMetadata(filters?: {
  category?: string | null;
  brand?: string | null;
  type?: string | null;
}): Metadata {
  const parts = [
    filters?.category,
    filters?.brand,
    filters?.type,
  ].filter(Boolean);

  const title =
    parts.length > 0
      ? `${parts.join(" · ")} | Branded Catalog | MOTARRO Supplies`
      : "Branded Apparel Catalog | Custom Printing South Africa | MOTARRO Supplies";

  const description =
    parts.length > 0
      ? `Browse ${parts.join(", ")} from our live branded supplier catalog. Custom printing, embroidery, and corporate branding from MOTARRO Supplies in Johannesburg & Kempton Park.`
      : "Browse live branded apparel, headwear, bags, and promotional products from our supplier catalog. Custom printing and embroidery from MOTARRO Supplies in South Africa.";

  const query = new URLSearchParams();
  if (filters?.category) query.set("category", filters.category);
  if (filters?.brand) query.set("brand", filters.brand);
  if (filters?.type) query.set("type", filters.type);
  const canonical = query.toString()
    ? `/branded-catalog?${query.toString()}`
    : "/branded-catalog";

  return {
    title,
    description: description.slice(0, 160),
    keywords: [
      "branded apparel South Africa",
      "promotional products Johannesburg",
      "custom printing Kempton Park",
      "corporate gifts South Africa",
      "branded catalog",
      "live stock apparel",
      ...(filters?.category ? [filters.category] : []),
      ...(filters?.brand ? [filters.brand, `${filters.brand} South Africa`] : []),
      ...(filters?.type ? [filters.type, `custom ${filters.type}`] : []),
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
    },
  };
}

export function kevroListingSchemaItems(products: KevroProduct[]) {
  return products.map((product) => ({
    name: product.name,
    url: kevroProductPath(product),
    image: product.image || product.images[0],
    description: buildKevroProductDescription(product).slice(0, 200),
    price: product.minPrice,
    priceCurrency: "ZAR",
    availability: product.inStock
      ? "https://schema.org/InStock"
      : "https://schema.org/OutOfStock",
  }));
}
