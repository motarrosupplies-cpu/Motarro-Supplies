import { buildMerchantFeedProducts } from "@/lib/google-merchant/build-feed";
import {
  buildLocalInventoryTsv,
  type LocalInventoryRow,
  resolveMerchantStoreCode,
} from "@/lib/google-merchant/local-inventory";

export const maxDuration = 60;
export const dynamic = "force-dynamic";
export const revalidate = 0;

const FEED_VERSION = "5";

/**
 * Google Merchant Center – Local inventory feed for Free Local Listings.
 * Feed URL: https://www.motarro.co.za/api/google-merchant/local-inventory?v=5
 *
 * Rows are limited to products that also appear in the primary product feed so
 * GMC does not create orphan items missing title/image/link.
 */
export async function GET() {
  try {
    const storeCode = resolveMerchantStoreCode();
    const feed = await buildMerchantFeedProducts();

    const localRows: LocalInventoryRow[] = feed.publishable.map((product) => ({
      id: product.id,
      price: Number(product.price) || 0,
      stock: Number(product.total_stock ?? product.stock ?? 0),
      availability: product.availability,
    }));

    const tsv = buildLocalInventoryTsv(localRows, storeCode);

    const titanJetRows = localRows.filter((row) => row.id.startsWith("titan-jet-")).length;
    const kevroRows = localRows.filter((row) => row.id.startsWith("kevro-")).length;
    const nativeRows = localRows.length - titanJetRows - kevroRows;

    return new Response(tsv, {
      status: 200,
      headers: {
        "Content-Type": "text/tab-separated-values; charset=utf-8",
        "Content-Disposition": 'attachment; filename="local-inventory.tsv"',
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        "CDN-Cache-Control": "no-store",
        "Vercel-CDN-Cache-Control": "no-store",
        "X-Feed-Version": FEED_VERSION,
        "X-Feed-Native-Rows": String(nativeRows),
        "X-Feed-Kevro-Rows": String(kevroRows),
        "X-Feed-Titan-Jet-Rows": String(titanJetRows),
        "X-Feed-Total-Rows": String(localRows.length),
        "X-Feed-Total-Bytes": String(Buffer.byteLength(tsv, "utf8")),
      },
    });
  } catch (err) {
    console.error("[Local inventory feed]", err);
    return new Response("Error generating local inventory feed", { status: 500 });
  }
}
