/**
 * Sitemap – served natively at /sitemap.xml by Next.js (no rewrite).
 * Single source of truth: lib/sitemap buildSitemapEntries.
 */

import { buildSitemapEntries } from "@/lib/sitemap"

export default async function sitemap() {
  return await buildSitemapEntries()
}
