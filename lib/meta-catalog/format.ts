const HTML_TAG_RE = /<[^>]*>/g;
const URL_RE = /https?:\/\/\S+/gi;

export function escapeCsvField(value: string): string {
  if (
    value.includes(",") ||
    value.includes('"') ||
    value.includes("\n") ||
    value.includes("\r")
  ) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function plainMetaDescription(value: string): string {
  return value
    .replace(HTML_TAG_RE, " ")
    .replace(URL_RE, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 9999);
}

export function formatMetaTitle(value: string): string {
  return value.trim().slice(0, 200);
}

export function formatMetaPrice(amount: number): string {
  return `${amount.toFixed(2)} ZAR`;
}

export function formatMetaAvailability(
  availability: string | null | undefined,
  stock: number | null | undefined
): "in stock" | "out of stock" {
  const normalized = (availability || "").toLowerCase().trim();
  if (normalized === "in stock" || normalized === "instock") {
    return "in stock";
  }
  if (
    normalized === "out of stock" ||
    normalized === "outofstock" ||
    normalized === "sold out"
  ) {
    return "out of stock";
  }
  if (normalized === "preorder" || normalized === "backorder") {
    return "in stock";
  }

  const stockNum = Number(stock ?? 0);
  return stockNum > 0 ? "in stock" : "out of stock";
}

export function isMetaCatalogFeedAuthorized(request: Request): boolean {
  const secret = process.env.META_CATALOG_FEED_SECRET?.trim();
  if (!secret) return true;

  const url = new URL(request.url);
  const key = url.searchParams.get("key");
  const authHeader = request.headers.get("authorization");

  return key === secret || authHeader === `Bearer ${secret}`;
}
