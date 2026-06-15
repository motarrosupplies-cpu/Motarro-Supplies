const CURRENCY = "ZAR";

type GtagFn = (
  command: "event" | "config" | "js",
  eventOrId: string,
  params?: Record<string, unknown>
) => void;

declare global {
  interface Window {
    gtag?: GtagFn;
  }
}

function gtagEvent(event: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", event, params);
}

export function trackGa4GenerateLead(params?: {
  method?: string;
  pageLocation?: string;
}) {
  gtagEvent("generate_lead", {
    currency: CURRENCY,
    value: 1,
    method: params?.method ?? "contact_form",
    page_location: params?.pageLocation ?? window.location.href,
  });
}

export function trackGa4Purchase(params: {
  transactionId: string;
  value: number;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
}) {
  gtagEvent("purchase", {
    transaction_id: params.transactionId,
    value: params.value,
    currency: CURRENCY,
    items: params.items.map((item) => ({
      item_id: item.id,
      item_name: item.name,
      price: item.price,
      quantity: item.quantity,
    })),
  });
}

export function trackGa4ViewItem(product: {
  id: string;
  name: string;
  price?: number;
  brand?: string;
  category?: string;
}) {
  gtagEvent("view_item", {
    currency: CURRENCY,
    value: Number(product.price) || 0,
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        price: Number(product.price) || 0,
        item_brand: product.brand,
        item_category: product.category,
      },
    ],
  });
}
