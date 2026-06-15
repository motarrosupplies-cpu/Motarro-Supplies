import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatCurrency(amount: number) {
  return `R${amount.toFixed(2)}`;
}

const SUPABASE_BASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "") ?? "";

export const PRODUCT_AVAILABILITY = ['in_stock', 'out_of_stock', 'preorder', 'backorder_soon'] as const;
export type ProductAvailability = typeof PRODUCT_AVAILABILITY[number];

export const PRODUCT_CONDITIONS = ['new', 'refurbished', 'used'] as const;
export type ProductCondition = typeof PRODUCT_CONDITIONS[number];

const AVAILABILITY_SCHEMA_URL: Record<ProductAvailability, string> = {
  in_stock: 'https://schema.org/InStock',
  out_of_stock: 'https://schema.org/OutOfStock',
  preorder: 'https://schema.org/PreOrder',
  backorder_soon: 'https://schema.org/BackOrder',
};

const AVAILABILITY_GMC_TEXT: Record<ProductAvailability, string> = {
  in_stock: 'in stock',
  out_of_stock: 'out of stock',
  preorder: 'preorder',
  backorder_soon: 'backorder',
};

const CONDITION_SCHEMA_URL: Record<ProductCondition, string> = {
  new: 'https://schema.org/NewCondition',
  refurbished: 'https://schema.org/RefurbishedCondition',
  used: 'https://schema.org/UsedCondition',
};

/**
 * Calculates VAT breakdown for VAT-inclusive pricing.
 * @param total VAT-inclusive total
 * @param vatRate VAT rate (default 0.15)
 * @returns { subtotal, vat, total }
 */
export function calculateVatInclusive(total: number, vatRate = 0.15) {
  const vat = total * vatRate / (1 + vatRate);
  const subtotal = total - vat;
  return { subtotal, vat, total };
}

function ensureSupabaseBasePath(path: string) {
  if (!SUPABASE_BASE_URL) {
    return path.startsWith("/") ? path : `/${path}`;
  }
  return `${SUPABASE_BASE_URL}/${path}`;
}

export function normalizeSupabaseUrl(
  value?: string | null,
  defaultBucket = "product-images",
) {
  if (!value) return "";

  const trimmed = value.trim();
  if (!trimmed) return "";

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  const withoutLeadingSlash = trimmed.replace(/^\/+/, "");

  if (withoutLeadingSlash.startsWith("storage/v1/object/public/")) {
    return ensureSupabaseBasePath(withoutLeadingSlash);
  }

  if (withoutLeadingSlash.startsWith("public/")) {
    return ensureSupabaseBasePath(`storage/v1/object/${withoutLeadingSlash}`);
  }

  const pathSegments = withoutLeadingSlash.split("/");
  if (pathSegments.length > 1) {
    return ensureSupabaseBasePath(
      `storage/v1/object/public/${withoutLeadingSlash}`,
    );
  }

  return ensureSupabaseBasePath(
    `storage/v1/object/public/${defaultBucket ? `${defaultBucket}/` : ""}${withoutLeadingSlash}`,
  );
}

export function normalizeSupabaseUrls(
  value?: unknown,
  defaultBucket = "product-images",
): string[] {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value
      .map((item) =>
        normalizeSupabaseUrl(
          typeof item === "string" ? item : String(item ?? ""),
          defaultBucket,
        ),
      )
      .filter(Boolean);
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return normalizeSupabaseUrls(parsed, defaultBucket);
      }
    } catch {
      return [normalizeSupabaseUrl(value, defaultBucket)].filter(Boolean);
    }
  }

  return [];
}

export function sanitizeAvailability(
  value: unknown,
  stock?: number | null,
): ProductAvailability {
  const lower = typeof value === 'string' ? value.toLowerCase().trim() : '';
  if (PRODUCT_AVAILABILITY.includes(lower as ProductAvailability)) {
    return lower as ProductAvailability;
  }
  const safeStock = typeof stock === 'number' ? stock : Number(stock);
  if (!isNaN(safeStock) && safeStock > 0) {
    return 'in_stock';
  }
  return 'out_of_stock';
}

export function sanitizeCondition(value: unknown): ProductCondition {
  const lower = typeof value === 'string' ? value.toLowerCase().trim() : '';
  if (PRODUCT_CONDITIONS.includes(lower as ProductCondition)) {
    return lower as ProductCondition;
  }
  return 'new';
}

export function resolveAvailability(
  availability: unknown,
  stock?: number | null,
): ProductAvailability {
  return sanitizeAvailability(availability, stock);
}

export function availabilityToSchemaUrl(availability: ProductAvailability): string {
  return AVAILABILITY_SCHEMA_URL[availability];
}

export function availabilityToGmcText(availability: ProductAvailability): string {
  return AVAILABILITY_GMC_TEXT[availability];
}

export function conditionToSchemaUrl(condition: ProductCondition): string {
  return CONDITION_SCHEMA_URL[condition];
}

export function shouldRequireAvailabilityDate(availability: ProductAvailability): boolean {
  return availability === 'preorder' || availability === 'backorder_soon';
}

export function toDateTimeLocalInput(value?: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (isNaN(date.getTime())) return '';
  const iso = date.toISOString();
  return iso.slice(0, 16);
}

export function fromDateTimeLocalInput(value?: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (isNaN(date.getTime())) return null;
  return date.toISOString();
}

export function normalizeAvailabilityDate(value?: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (isNaN(date.getTime())) return null;
  return date.toISOString();
}
