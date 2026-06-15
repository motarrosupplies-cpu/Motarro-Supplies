"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { META_PIXEL_ENABLED, trackMetaPageView } from "@/lib/meta-pixel";

export function MetaPixelPageView() {
  const pathname = usePathname();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (!META_PIXEL_ENABLED) return;

    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    trackMetaPageView();
  }, [pathname]);

  return null;
}
