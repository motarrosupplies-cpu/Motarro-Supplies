"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const MERCHANT_ID = 5592910569;
const WIDGET_SCRIPT_ID = "merchantWidgetScript";
const WIDGET_SRC =
  "https://www.gstatic.com/shopping/merchant/merchantwidget.js";

/** Position: bottom-left or bottom-right. Use LEFT_BOTTOM to avoid overlapping WhatsApp (bottom-right). */
export type BadgePosition = "LEFT_BOTTOM" | "RIGHT_BOTTOM";

export interface GoogleCustomerReviewsBadgeProps {
  /** Default LEFT_BOTTOM so badge doesn't overlap WhatsApp button (right). */
  position?: BadgePosition;
  /** Region code e.g. ZA for South Africa. Optional; widget can infer. */
  region?: string;
}

declare global {
  interface Window {
    merchantwidget?: {
      start: (config: {
        merchant_id: number;
        position?: string;
        region?: string;
      }) => void;
    };
  }
}

function startWidget(position: string, region: string) {
  if (typeof window === "undefined" || !window.merchantwidget) return;
  window.merchantwidget.start({
    merchant_id: MERCHANT_ID,
    position,
    region,
  });
}

export function GoogleCustomerReviewsBadge({
  position = "LEFT_BOTTOM",
  region = "ZA",
}: GoogleCustomerReviewsBadgeProps) {
  const pathname = usePathname();
  const startedRef = useRef(false);

  // Don't show badge on admin
  if (pathname?.startsWith("/admin")) return null;

  // Use Google's exact pattern: attach load listener to script element so start() runs when script loads.
  // Also handle case where script is already loaded (e.g. cached).
  useEffect(() => {
    if (startedRef.current) return;

    const scriptEl = document.getElementById(WIDGET_SCRIPT_ID) as
      | HTMLScriptElement
      | null;

    if (!scriptEl) return;

    const onLoad = () => {
      if (startedRef.current) return;
      startedRef.current = true;
      startWidget(position, region);
    };

    if (scriptEl.getAttribute("data-loaded") === "true") {
      onLoad();
      return;
    }

    scriptEl.addEventListener("load", onLoad);

    // Script may already be loaded (e.g. cache); check readyState.
    if (scriptEl.readyState === "complete" || scriptEl.readyState === "loaded") {
      onLoad();
    }

    return () => scriptEl.removeEventListener("load", onLoad);
  }, [position, region]);

  return (
    <Script
      id={WIDGET_SCRIPT_ID}
      src={WIDGET_SRC}
      strategy="afterInteractive"
      defer
      onLoad={() => {
        const scriptEl = document.getElementById(WIDGET_SCRIPT_ID);
        if (scriptEl) scriptEl.setAttribute("data-loaded", "true");
        if (!startedRef.current) {
          startedRef.current = true;
          startWidget(position, region);
        }
      }}
    />
  );
}
