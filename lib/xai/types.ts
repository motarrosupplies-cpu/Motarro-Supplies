export type GeneratedProductContent = {
  description: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  faqs: Array<{ question: string; answer: string }>;
};

export type ProductContentInput = {
  name: string;
  category?: string | null;
  subcategory?: string | null;
  price?: number | null;
  sku?: string | null;
  colors?: string[];
  sizes?: string[];
  existingDescription?: string | null;
};

export type CatalogProductSnippet = {
  name: string;
  href: string;
  category: string;
  price: number | null;
};

export type QualifiedLead = {
  intent: string;
  products: string[];
  quantity: number | null;
  deadline: string | null;
  location: string | null;
  branding: boolean;
  budgetHint: string | null;
  urgency: "low" | "medium" | "high";
  suggestedReply: string;
  suggestedProducts: Array<{ name: string; href: string; reason: string }>;
};
