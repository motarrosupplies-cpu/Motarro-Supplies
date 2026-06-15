let userConfig = undefined
try {
  userConfig = await import('./v0-user-next.config')
} catch (e) {
  // ignore error
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer }) => {
    // Externalize qrcode and canvas for server-side only to prevent client bundling
    if (isServer) {
      // Ensure externals is an array
      if (!Array.isArray(config.externals)) {
        config.externals = [];
      }
      // Add qrcode and canvas as external dependencies
      config.externals.push({
        'qrcode': 'commonjs qrcode',
        'canvas': 'commonjs canvas',
      });
    }
    return config;
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  compress: true, // Enable gzip compression
  poweredByHeader: false, // Remove X-Powered-By header
  reactStrictMode: true, // Enable React strict mode for better performance
  images: {
    loader: 'custom',
    loaderFile: './lib/supabase-image-loader.ts',
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.shopify.com', pathname: '/**' },
      { protocol: 'https', hostname: '*.supabase.co', pathname: '/**' },
      { protocol: 'https', hostname: 'dkxvsitqxxkxtielgpxd.supabase.co', pathname: '/**' },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [320, 480, 640, 768, 1024, 1280, 1536, 1920],
    minimumCacheTTL: 31536000, // Cache images for 1 year
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self';",
              "base-uri 'self';",
              "form-action 'self' https://www.payfast.co.za https://*.payfast.co.za;",
              "object-src 'none';",
              "frame-ancestors 'self';",
              "img-src 'self' data: blob: https://cdn.shopify.com https://*.shopify.com https://dkxvsitqxxkxtielgpxd.supabase.co https://*.supabase.co https://*.blob.core.windows.net https://titanjet.co.za https://*.titanjet.co.za https://www.google-analytics.com https://www.googletagmanager.com https://*.google.com https://www.google.co.za https://*.g.doubleclick.net https://i.ytimg.com https://img.youtube.com https://www.facebook.com https://facebook.com;",
              "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://www.google.com https://www.gstatic.com https://vercel.live https://va.vercel-scripts.com https://connect.facebook.net;",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;",
              "font-src 'self' data: https://fonts.gstatic.com;",
              // blob: required for GLTF embedded textures and Draco decoder workers (custom-printing 3D hoodie).
              "connect-src 'self' blob: https://dkxvsitqxxkxtielgpxd.supabase.co https://*.supabase.co https://www.google-analytics.com https://www.googletagmanager.com https://*.analytics.google.com https://analytics.google.com https://www.google.com https://www.gstatic.com https://www.google.com/recaptcha https://www.gstatic.com/recaptcha https://*.merchant-center-analytics.goog https://vitals.vercel-insights.com https://va.vercel-scripts.com https://vercel.live https://www.payfast.co.za https://*.payfast.co.za https://www.google.co.za https://www.facebook.com https://connect.facebook.net https://graph.facebook.com;",
              "frame-src 'self' https://www.google.com https://www.gstatic.com https://www.youtube.com https://www.youtube-nocookie.com https://www.facebook.com;",
              "manifest-src 'self';",
              "media-src 'self' blob:;",
              "worker-src 'self' blob:;"
            ].join(' ')
          }
        ]
      },
      // Cache static assets for 1 year
      {
        source: '/favicon.ico',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      // Cache images for 30 days
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=2592000, stale-while-revalidate=86400'
          }
        ]
      },
      // Cache API responses for 1 hour
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=86400'
          }
        ]
      }
    ];
  },
  async rewrites() {
    return [
      // Serve llms.txt via API so https://www.motarro.co.za/llms.txt always returns 200
      { source: '/llms.txt', destination: '/api/llms' },
    ]
  },
  async redirects() {
    return [
      // Ensure legal pages are reachable (fix 404s for /terms, /privacy, /cookies)
      { source: '/terms/', destination: '/terms', permanent: true },
      { source: '/privacy/', destination: '/privacy', permanent: true },
      { source: '/cookies/', destination: '/cookies', permanent: true },
      { source: '/men', destination: '/shop/plastic', permanent: true },
      { source: '/women', destination: '/shop/paper', permanent: true },
      { source: '/kids', destination: '/shop/art-supplies', permanent: true },
      { source: '/accessories', destination: '/shop/foam-craft', permanent: true },
      { source: '/branded-catalog', destination: '/products', permanent: true },
      { source: '/branded-catalog/:path*', destination: '/products', permanent: true },
      { source: '/sublimation-supplies', destination: '/products', permanent: true },
      { source: '/sublimation-supplies/:path*', destination: '/products', permanent: true },
      { source: '/custom-printing', destination: '/products', permanent: true },
      { source: '/custom-printing/:path*', destination: '/products', permanent: true },
      { source: '/admin/kevro', destination: '/admin/products', permanent: true },
      { source: '/admin/titan-jet', destination: '/admin/products', permanent: true },
      { source: '/custom-t-shirt-printing-johannesburg', destination: '/products', permanent: true },
      { source: '/custom-t-shirt-printing-kempton-park', destination: '/products', permanent: true },
      { source: '/custom-printing-sandton', destination: '/products', permanent: true },
      { source: '/custom-apparel-randburg', destination: '/products', permanent: true },
      { source: '/branded-corporate-clothing-johannesburg', destination: '/products', permanent: true },
      { source: '/corporate-uniforms-johannesburg', destination: '/products', permanent: true },
      { source: '/event-merchandise-johannesburg', destination: '/products', permanent: true },
      { source: '/sublimation-printing-johannesburg', destination: '/products', permanent: true },
      { source: '/printing-methods-comparison', destination: '/products', permanent: true },
      { source: '/gifts-under-r200', destination: '/products', permanent: true },
      { source: '/corporate-gifts', destination: '/products', permanent: true },
      { source: '/event-favours', destination: '/products', permanent: true },
      { source: '/portfolio', destination: '/about', permanent: true },
      { source: '/videos', destination: '/about', permanent: true },
      { source: '/size-guide', destination: '/products', permanent: true },
      { source: '/school-events', destination: '/products', permanent: true },
      { source: '/school-events/:path*', destination: '/products', permanent: true },
      { source: '/pricing', destination: '/products', permanent: true },
      { source: '/rush-orders', destination: '/products', permanent: true },
      { source: '/ready-to-ship', destination: '/sale', permanent: true },
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'motarro.co.za' }],
        destination: 'https://www.motarro.co.za/:path*',
        permanent: true,
      },
      // Redirect school-events query parameter variations to canonical
      {
        source: '/school-events',
        has: [
          {
            type: 'query',
            key: 'event',
            value: '(?<event>.*)',
          },
        ],
        destination: '/school-events',
        permanent: true,
      },
    ]
  }
  // experimental: {
  //   webpackBuildWorker: true,
  //   parallelServerBuildTraces: true,
  //   parallelServerCompiles: true,
  // },
}

mergeConfig(nextConfig, userConfig)

function mergeConfig(nextConfig, userConfig) {
  if (!userConfig) {
    return
  }

  for (const key in userConfig) {
    if (
      typeof nextConfig[key] === 'object' &&
      !Array.isArray(nextConfig[key])
    ) {
      nextConfig[key] = {
        ...nextConfig[key],
        ...userConfig[key],
      }
    } else {
      nextConfig[key] = userConfig[key]
    }
  }
}

export default nextConfig
