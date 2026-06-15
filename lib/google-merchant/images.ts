const TRUSTED_IMAGE_HOSTS = [
  "titanjet.co.za",
  "hkervihhlhktjdxcekhi.supabase.co",
  "www.motarro.co.za",
];

const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"];

export function normalizeMerchantImageUrl(url?: string | null): string {
  if (!url || typeof url !== "string") return "";

  let normalized = url.trim();
  if (!normalized) return "";

  if (normalized.startsWith("http://")) {
    normalized = `https://${normalized.slice("http://".length)}`;
  }

  return normalized;
}

export function isValidMerchantImageUrl(url?: string | null): boolean {
  const normalized = normalizeMerchantImageUrl(url);
  if (!normalized.startsWith("https://")) return false;

  let parsed: URL;
  try {
    parsed = new URL(normalized);
  } catch {
    return false;
  }

  if (!parsed.hostname) return false;

  const urlLower = normalized.toLowerCase();
  if (IMAGE_EXTENSIONS.some((ext) => urlLower.includes(ext))) {
    return true;
  }

  const isTrustedHost = TRUSTED_IMAGE_HOSTS.some(
    (host) => parsed.hostname === host || parsed.hostname.endsWith(`.${host}`)
  );

  if (!isTrustedHost) return false;

  return (
    urlLower.includes("/wp-content/uploads/") ||
    urlLower.includes("/storage/v1/object/public/") ||
    urlLower.includes("/wp-content/")
  );
}

export function parseMerchantImages(images: unknown): string[] {
  if (!images) return [];
  if (Array.isArray(images)) {
    return images
      .filter((img): img is string => typeof img === "string" && img.trim() !== "")
      .map((img) => normalizeMerchantImageUrl(img))
      .filter(Boolean);
  }
  if (typeof images === "string") {
    try {
      const parsed = JSON.parse(images);
      return parseMerchantImages(parsed);
    } catch {
      const single = normalizeMerchantImageUrl(images);
      return single ? [single] : [];
    }
  }
  return [];
}

export function getPrimaryMerchantImageUrl(product: {
  image?: string | null;
  images?: unknown;
}): string {
  for (const img of parseMerchantImages(product.images)) {
    if (isValidMerchantImageUrl(img)) {
      return img;
    }
  }

  const single = normalizeMerchantImageUrl(product.image);
  if (isValidMerchantImageUrl(single)) {
    return single;
  }

  return "";
}

export function getAdditionalMerchantImageUrls(product: {
  image?: string | null;
  images?: unknown;
}): string[] {
  const primary = getPrimaryMerchantImageUrl(product);
  const additional: string[] = [];

  for (const img of parseMerchantImages(product.images)) {
    if (additional.length >= 10) break;
    if (isValidMerchantImageUrl(img) && img !== primary) {
      additional.push(img);
    }
  }

  const single = normalizeMerchantImageUrl(product.image);
  if (
    single &&
    isValidMerchantImageUrl(single) &&
    single !== primary &&
    additional.length < 10 &&
    !additional.includes(single)
  ) {
    additional.push(single);
  }

  return additional;
}
