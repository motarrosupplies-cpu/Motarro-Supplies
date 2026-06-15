import type { MetaCatalogSource } from "@/lib/meta-catalog/build-feed";

const FEED_VERSION = "2";

export function metaCatalogResponse(
  csv: string,
  counts: {
    native: number;
    kevro: number;
    titanJet: number;
    metaPublishable: number;
  },
  source: MetaCatalogSource
) {
  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `inline; filename="motarro-meta-catalog-${source}.csv"`,
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      "CDN-Cache-Control": "no-store",
      "Vercel-CDN-Cache-Control": "no-store",
      "X-Feed-Version": FEED_VERSION,
      "X-Feed-Source": source,
      "X-Feed-Native-Rows": String(counts.native),
      "X-Feed-Kevro-Rows": String(counts.kevro),
      "X-Feed-Titan-Jet-Rows": String(counts.titanJet),
      "X-Feed-Publishable-Rows": String(counts.metaPublishable),
      "X-Feed-Skipped-Rows": String(
        counts.native + counts.kevro + counts.titanJet - counts.metaPublishable
      ),
    },
  });
}
