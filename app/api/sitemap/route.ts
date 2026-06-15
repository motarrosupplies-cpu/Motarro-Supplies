import { buildSitemapEntries } from "@/lib/sitemap"

/** Escape string for use inside XML element content (loc, lastmod, etc.) */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

export async function GET() {
  try {
    const entries = await buildSitemapEntries()
    
    // Ensure we always have at least some entries (static pages)
    if (!entries || entries.length === 0) {
      // Fallback to minimal sitemap if everything failed
      const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.motarro.co.za</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`
      
      return new Response(fallbackXml, {
        headers: {
          "Content-Type": "application/xml",
          "Cache-Control": "public, max-age=3600, s-maxage=3600",
        },
      })
    }
    
    const xml = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...entries.map((entry) => {
        const lastmod =
          entry.lastModified instanceof Date
            ? entry.lastModified.toISOString()
            : entry.lastModified ?? new Date().toISOString()
        const safeUrl = escapeXml(entry.url)
        const safeLastmod = escapeXml(lastmod)
        return [
          "  <url>",
          `    <loc>${safeUrl}</loc>`,
          `    <lastmod>${safeLastmod}</lastmod>`,
          entry.changeFrequency
            ? `    <changefreq>${entry.changeFrequency}</changefreq>`
            : "",
          typeof entry.priority === "number"
            ? `    <priority>${entry.priority.toFixed(1)}</priority>`
            : "",
          "  </url>",
        ]
          .filter(Boolean)
          .join("\n")
      }),
      "</urlset>",
    ]
      .flat()
      .join("\n")

    return new Response(xml, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    })
  } catch (error) {
    console.error("Error generating sitemap xml:", error)
    // Return a minimal valid sitemap instead of error
    const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.motarro.co.za</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`
    
    return new Response(fallbackXml, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    })
  }
}