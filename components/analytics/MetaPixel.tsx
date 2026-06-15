import { MetaPixelPageView } from "@/components/analytics/MetaPixelPageView";
import { MetaPixelScript } from "@/components/analytics/MetaPixelScript";
import { META_PIXEL_ENABLED } from "@/lib/meta-pixel";

export function MetaPixel() {
  if (!META_PIXEL_ENABLED) {
    return null;
  }

  return (
    <>
      <MetaPixelScript />
      <MetaPixelPageView />
    </>
  );
}
