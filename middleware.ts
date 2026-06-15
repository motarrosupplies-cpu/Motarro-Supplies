import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { isUUID } from './lib/product-slug-utils'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Handle product URL redirects: /products/[uuid] -> /products/[slug]
  if (pathname.startsWith('/products/')) {
    const segments = pathname.split('/')
    const productIdentifier = segments[segments.length - 1]

    // If it's a UUID, we'll let the page handle the redirect
    // (The page component will fetch the product and redirect to slug)
    // This middleware just ensures we don't block the request
    if (isUUID(productIdentifier)) {
      // Allow the request through - the page will handle the redirect
      return NextResponse.next()
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/products/:path*',
  ],
}

