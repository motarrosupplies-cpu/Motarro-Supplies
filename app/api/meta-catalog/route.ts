import { buildMetaCatalogFeed } from "@/lib/meta-catalog/build-feed";
import { isMetaCatalogFeedAuthorized } from "@/lib/meta-catalog/format";
import { metaCatalogResponse } from "@/lib/meta-catalog/respond";

export const maxDuration = 60;
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Meta Commerce / WhatsApp catalog CSV feed (all products).
 *
 * Split feeds (add as extra data sources if Meta stops at ~1000 items):
 * - https://www.motarro.co.za/api/meta-catalog/kevro
 * - https://www.motarro.co.za/api/meta-catalog/titan-jet
 * - https://www.motarro.co.za/api/meta-catalog/motarro
 */
export async function GET(request: Request) {
  if (!isMetaCatalogFeedAuthorized(request)) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const { csv, counts } = await buildMetaCatalogFeed("all");
    return metaCatalogResponse(csv, counts, "all");
  } catch (error) {
    console.error("[meta-catalog] feed generation failed", error);
    return new Response("Error generating Meta catalog feed", { status: 500 });
  }
}
