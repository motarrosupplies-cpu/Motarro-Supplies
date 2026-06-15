export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() ?? "";
export const META_PIXEL_ENABLED = Boolean(META_PIXEL_ID);

const CURRENCY = "ZAR";

type MetaPixelFn = (
  command: "track" | "init",
  eventOrId: string,
  params?: Record<string, unknown>
) => void;

declare global {
  interface Window {
    fbq?: MetaPixelFn;
  }
}

function track(event: string, params?: Record<string, unknown>) {
  if (!META_PIXEL_ENABLED || typeof window === "undefined") return;
  window.fbq?.("track", event, params);
}

export function trackMetaPageView() {
  track("PageView");
}

export function trackMetaViewContent(product: {
  id: string;
  name: string;
  price?: number;
}) {
  track("ViewContent", {
    content_ids: [product.id],
    content_name: product.name,
    content_type: "product",
    value: Number(product.price) || 0,
    currency: CURRENCY,
  });
}

export function trackMetaAddToCart(item: {
  id: string;
  name: string;
  price?: number;
  quantity?: number;
}) {
  const quantity = item.quantity ?? 1;
  const price = Number(item.price) || 0;

  track("AddToCart", {
    content_ids: [item.id],
    content_name: item.name,
    content_type: "product",
    contents: [{ id: item.id, quantity }],
    value: price * quantity,
    currency: CURRENCY,
  });
}

export function trackMetaInitiateCheckout(
  items: Array<{ id: string; quantity?: number }>,
  total: number
) {
  track("InitiateCheckout", {
    content_ids: items.map((item) => item.id),
    contents: items.map((item) => ({
      id: item.id,
      quantity: item.quantity ?? 1,
    })),
    num_items: items.reduce((sum, item) => sum + (item.quantity ?? 1), 0),
    value: total,
    currency: CURRENCY,
  });
}

export function trackMetaPurchase(params: {
  orderId: string;
  value: number;
  contentIds: string[];
  numItems: number;
}) {
  track("Purchase", {
    order_id: params.orderId,
    content_ids: params.contentIds,
    num_items: params.numItems,
    value: params.value,
    currency: CURRENCY,
  });
}
