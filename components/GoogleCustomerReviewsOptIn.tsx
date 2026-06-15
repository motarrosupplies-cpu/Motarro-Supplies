"use client";

import { useEffect, useMemo } from "react";
import Script from "next/script";

/**
 * Google Customer Reviews opt-in module.
 * @see https://support.google.com/merchants/answer/14629205
 * Requirements: order confirmation on your domain, HTTPS, DOCTYPE html (Next.js default).
 */

const MERCHANT_ID = 5592910569;

/** Optional opt-in dialog position per GCR integration guide. */
export type OptInStyle =
  | "CENTER_DIALOG"
  | "BOTTOM_RIGHT_DIALOG"
  | "BOTTOM_LEFT_DIALOG"
  | "TOP_RIGHT_DIALOG"
  | "TOP_LEFT_DIALOG"
  | "BOTTOM_TRAY";

export interface GoogleCustomerReviewsOptInProps {
  orderId: string;
  email: string;
  deliveryCountry?: string;
  estimatedDeliveryDate?: string;
  /** Optional GTINs per product. */
  products?: Array<{ gtin: string }>;
  /** Optional. Default CENTER_DIALOG. */
  optInStyle?: OptInStyle;
  /** Optional language (e.g. en-ZA, en-GB). Sets window.___gcfg.lang. */
  lang?: string;
}

function formatDeliveryDate(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().slice(0, 10);
}

declare global {
  interface Window {
    gapi?: {
      load: (name: string, cb: () => void) => void;
      surveyoptin?: { render: (config: Record<string, unknown>) => void };
    };
    ___gcfg?: { lang?: string };
  }
}

export function GoogleCustomerReviewsOptIn({
  orderId,
  email,
  deliveryCountry = "ZA",
  estimatedDeliveryDate,
  products,
  optInStyle = "CENTER_DIALOG",
  lang = "en-ZA",
}: GoogleCustomerReviewsOptInProps) {
  const config = useMemo(() => {
    const c: Record<string, unknown> = {
      merchant_id: MERCHANT_ID,
      order_id: orderId,
      email,
      delivery_country: deliveryCountry,
      estimated_delivery_date:
        estimatedDeliveryDate || formatDeliveryDate(7),
    };
    if (Array.isArray(products) && products.length > 0) c.products = products;
    if (optInStyle) c.opt_in_style = optInStyle;
    return c;
  }, [
    orderId,
    email,
    deliveryCountry,
    estimatedDeliveryDate,
    products,
    optInStyle,
  ]);

  useEffect(() => {
    if (!orderId || !email) return;
    (window as unknown as { __gcr_config?: Record<string, unknown> }).__gcr_config =
      config;
    if (lang) window.___gcfg = { lang };
    (window as unknown as { renderOptIn?: () => void }).renderOptIn =
      function () {
        if (typeof window.gapi === "undefined") return;
        window.gapi.load("surveyoptin", function () {
          const cfg = (window as unknown as { __gcr_config?: Record<string, unknown> })
            .__gcr_config;
          if (cfg && window.gapi?.surveyoptin?.render) {
            window.gapi.surveyoptin.render(cfg);
          }
        });
      };
  }, [config, orderId, email, lang]);

  if (!orderId || !email) return null;

  return (
    <>
      {/* GCR opt-in: script from https://support.google.com/merchants/answer/14629205 */}
      <Script
        src="https://apis.google.com/js/platform.js?onload=renderOptIn"
        strategy="afterInteractive"
        async
        defer
        onLoad={() => {
          const r = (window as unknown as { renderOptIn?: () => void })
            .renderOptIn;
          if (typeof r === "function") r();
        }}
      />
      {/* Do not obscure this area; GCR dialog renders here or per opt_in_style */}
      <div id="gcr-opt-in" className="mt-4 min-h-[60px]" aria-live="polite" />
    </>
  );
}
