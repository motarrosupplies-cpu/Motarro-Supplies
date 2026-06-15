/**
 * Robots.txt Generation
 * Next.js 14+ Metadata Route for SEO
 * Do not disallow /_next/ or /static/ — crawlers need these to render pages (avoids hundreds of "blocked internal resource" issues).
 */

import { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.motarro.co.za';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          // Don't blanket-disallow /api/ — many pages fetch JSON from /api/* during render.
          // Disallow only admin/private API surfaces.
          '/api/admin/',
          '/private/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/admin/',
          '/private/',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

