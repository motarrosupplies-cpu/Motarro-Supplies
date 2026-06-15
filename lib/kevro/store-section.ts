export type StoreSection = "men" | "women" | "kids" | "accessories" | "unisex";

const ACCESSORY_CATEGORIES = new Set([
  "Head Wear",
  "Bags",
  "Gifting",
  "Homeware",
  "Display",
  "Drinkware",
  "Stationery",
  "Technology",
  "Outdoor",
  "Sport",
  "Leisure",
  "Writing",
]);

const APPAREL_CATEGORIES = new Set([
  "Apparel",
  "Work Wear",
  "Chef Wear",
  "Corporate",
  "Active Wear",
]);

const KIDS_PATTERN = /\b(kids?|kiddies|youth|junior|school|children|infant|toddler)\b/i;

const SUBCATEGORY_ALIASES: Record<string, string[]> = {
  "t-shirts": ["t-shirts", "tshirts", "tee-shirts", "tees"],
  hoodies: ["hoodies", "sweatshirts", "fleece"],
  polo: ["polo", "polo-shirts", "golf-shirts", "shirts-corporate", "corporate-shirts"],
  dresses: ["dresses", "dress"],
  caps: ["caps", "hats", "beanies", "headwear"],
  bags: ["bags", "backpacks", "tote-bags"],
  mugs: ["mugs", "drinkware", "bottles"],
};

export function slugifyKevroLabel(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function resolveKevroSubcategorySlug(type: string): string {
  return slugifyKevroLabel(type || "");
}

export function resolveKevroStoreSection(product: {
  gender?: string | null;
  category?: string | null;
  type?: string | null;
  name?: string;
}): StoreSection {
  const gender = (product.gender || "").trim().toLowerCase();
  const category = (product.category || "").trim();
  const type = product.type || "";
  const name = product.name || "";

  if (ACCESSORY_CATEGORIES.has(category)) {
    return "accessories";
  }

  if (KIDS_PATTERN.test(gender) || KIDS_PATTERN.test(type) || KIDS_PATTERN.test(name)) {
    return "kids";
  }

  if (
    gender.includes("women") ||
    gender.includes("ladies") ||
    gender.includes("female") ||
    gender.includes("girl")
  ) {
    return "women";
  }

  if (
    gender.includes("men") ||
    gender === "male" ||
    (gender.includes("male") && !gender.includes("female"))
  ) {
    return "men";
  }

  if (gender.includes("unisex") || gender.includes("neutral")) {
    return "unisex";
  }

  if (APPAREL_CATEGORIES.has(category)) {
    return "unisex";
  }

  return "accessories";
}

export function productBelongsToSection(
  product: {
    storeSection?: string | null;
    gender?: string | null;
    category?: string | null;
    type?: string | null;
    name?: string;
  },
  section: Exclude<StoreSection, "unisex">
): boolean {
  const resolved =
    (product.storeSection as StoreSection | undefined) ||
    resolveKevroStoreSection(product);

  if (section === "men") {
    return resolved === "men" || resolved === "unisex";
  }
  if (section === "women") {
    return resolved === "women" || resolved === "unisex";
  }
  return resolved === section;
}

export function matchesSubcategoryFilter(
  kevroType: string,
  filterSlug: string,
  extraKeywords: string[] = []
): boolean {
  const typeSlug = resolveKevroSubcategorySlug(kevroType);
  const filter = filterSlug.toLowerCase().trim().replace(/\s+/g, "-");
  const typeLower = (kevroType || "").toLowerCase();

  if (!filter) return true;
  if (typeSlug === filter) return true;
  if (typeSlug.includes(filter) || filter.includes(typeSlug)) return true;
  if (typeLower.includes(filter.replace(/-/g, " "))) return true;

  for (const keyword of extraKeywords) {
    const keywordSlug = slugifyKevroLabel(keyword);
    if (
      typeSlug.includes(keywordSlug) ||
      keywordSlug.includes(typeSlug) ||
      typeLower.includes(keyword.toLowerCase())
    ) {
      return true;
    }
  }

  for (const [canonical, aliases] of Object.entries(SUBCATEGORY_ALIASES)) {
    const group = [canonical, ...aliases];
    if (group.includes(filter)) {
      return group.includes(typeSlug) || typeSlug.includes(canonical);
    }
  }

  return false;
}
