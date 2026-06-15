/**
 * School event stack — Postgres column names as used in production (Supabase).
 *
 * Convention:
 * - `school_event_orders`, `school_event_order_items`, `school_event_order_item_addons`:
 *   snake_case for relational columns (event_id, order_number, payment_status, …).
 * - Invoice link columns on `school_event_orders` were added as quoted identifiers:
 *   "invoiceId", "invoiceEmailSent" (see migration 20260410120000).
 * - `school_events`, `event_products`, `event_product_variants`, addon catalog tables:
 *   largely camelCase / quoted Prisma-style names ("eventId", "isActive", "basePrice", …).
 *
 * Always map to camelCase for application code / JSON APIs after reading from Supabase.
 * Never change image URLs or file paths — only column keys in queries.
 */

/** SELECT fragment for school_event_orders — matches snake + invoice columns */
export const SCHOOL_EVENT_ORDER_HEADER_SELECT = `
  id,
  event_id,
  order_number,
  parent_name,
  parent_email,
  parent_phone,
  school_name,
  grade,
  class_name,
  total_amount,
  status,
  payment_status,
  payment_method,
  notes,
  created_at,
  updated_at,
  "invoiceId",
  "invoiceEmailSent"
`.replace(/\s+/g, " ");

/** SELECT for line items */
export const SCHOOL_EVENT_ORDER_ITEM_SELECT = `
  id,
  order_id,
  product_id,
  variant_id,
  child_name,
  child_age,
  quantity,
  unit_price,
  total_price,
  special_instructions
`.replace(/\s+/g, " ");

export type SchoolEventOrderNormalized = {
  id: string;
  eventId: string;
  orderNumber: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  schoolName: string;
  grade?: string | null;
  className?: string | null;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  paymentMethod?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  invoiceId?: string | null;
  invoiceEmailSent?: boolean | null;
};

export type SchoolEventOrderItemNormalized = {
  id: string;
  orderId: string;
  productId: string;
  variantId?: string | null;
  childName: string;
  childAge?: number | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  specialInstructions?: string | null;
};

function pickStr(...vals: unknown[]): string {
  for (const v of vals) {
    if (v !== undefined && v !== null && String(v).length) return String(v);
  }
  return "";
}

function pickNum(...vals: unknown[]): number {
  for (const v of vals) {
    if (v === undefined || v === null) continue;
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return 0;
}

function pickBool(v: unknown): boolean | null {
  if (v === undefined || v === null) return null;
  return Boolean(v);
}

/** Normalize one row from Supabase (snake or legacy camel keys). */
export function normalizeSchoolEventOrderRow(
  raw: Record<string, unknown> | null | undefined
): SchoolEventOrderNormalized | null {
  if (!raw || raw.id == null) return null;
  return {
    id: pickStr(raw.id),
    eventId: pickStr(raw.event_id, raw.eventId),
    orderNumber: pickStr(raw.order_number, raw.orderNumber),
    parentName: pickStr(raw.parent_name, raw.parentName),
    parentEmail: pickStr(raw.parent_email, raw.parentEmail),
    parentPhone: pickStr(raw.parent_phone, raw.parentPhone),
    schoolName: pickStr(raw.school_name, raw.schoolName),
    grade: pickStr(raw.grade) || null,
    className: pickStr(raw.class_name, raw.className) || null,
    totalAmount: pickNum(raw.total_amount, raw.totalAmount),
    status: pickStr(raw.status),
    paymentStatus: pickStr(raw.payment_status, raw.paymentStatus),
    paymentMethod:
      pickStr(raw.payment_method, raw.paymentMethod) || null,
    notes: pickStr(raw.notes) || null,
    createdAt: pickStr(raw.created_at, raw.createdAt),
    updatedAt: pickStr(raw.updated_at, raw.updatedAt),
    invoiceId: pickStr(raw.invoiceId) || null,
    invoiceEmailSent: pickBool(raw.invoiceEmailSent),
  };
}

export function normalizeSchoolEventOrderItemRow(
  raw: Record<string, unknown>
): SchoolEventOrderItemNormalized {
  return {
    id: pickStr(raw.id),
    orderId: pickStr(raw.order_id, raw.orderId),
    productId: pickStr(raw.product_id, raw.productId),
    variantId: (raw.variant_id ?? raw.variantId ?? null) as string | null,
    childName: pickStr(raw.child_name, raw.childName),
    childAge:
      raw.child_age != null || raw.childAge != null
        ? pickNum(raw.child_age, raw.childAge)
        : null,
    quantity: pickNum(raw.quantity),
    unitPrice: pickNum(raw.unit_price, raw.unitPrice),
    totalPrice: pickNum(raw.total_price, raw.totalPrice),
    specialInstructions:
      pickStr(raw.special_instructions, raw.specialInstructions) || null,
  };
}

/** PATCH body fields → Postgres school_event_orders (snake + quoted invoice keys as needed) */
export function schoolEventOrderPaymentUpdatePayload(input: {
  paymentMethod?: string;
  paymentStatus?: string;
}): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (input.paymentMethod !== undefined)
    out.payment_method = input.paymentMethod;
  if (input.paymentStatus !== undefined)
    out.payment_status = input.paymentStatus;
  return out;
}
