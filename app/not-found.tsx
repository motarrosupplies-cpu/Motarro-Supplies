import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, Search, ShoppingBag, ArrowLeft } from 'lucide-react'

export const metadata = {
  title: '404 - Page Not Found | MOTARRO Supplies',
  description: 'The page you are looking for does not exist. Return to MOTARRO Supplies homepage or browse our products.',
  robots: {
    index: false,
    follow: true,
  },
}

export default function NotFound() {
  return (
    <div className="min-h-screen bg-lavender flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* 404 Display */}
        <div className="space-y-4">
          <h1 className="text-9xl font-black text-primary/20">404</h1>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
            Page Not Found
          </h2>
          <p className="text-xl text-gray-600 max-w-md mx-auto">
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button asChild size="lg" className="rounded-full">
            <Link href="/">
              <Home className="mr-2 h-5 w-5" />
              Go Home
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-full">
            <Link href="/products">
              <ShoppingBag className="mr-2 h-5 w-5" />
              Browse Products
            </Link>
          </Button>
          <Button asChild variant="ghost" size="lg" className="rounded-full">
            <Link href="/contact">
              <Search className="mr-2 h-5 w-5" />
              Contact Us
            </Link>
          </Button>
        </div>

        {/* Popular Links */}
        <div className="pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">Popular Pages:</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/shop/plastic" className="text-primary hover:underline text-sm">
              Plastic Supplies
            </Link>
            <span className="text-gray-300">•</span>
            <Link href="/shop/paper" className="text-primary hover:underline text-sm">
              Paper &amp; Stationery
            </Link>
            <span className="text-gray-300">•</span>
            <Link href="/shop/art-supplies" className="text-primary hover:underline text-sm">
              Art Supplies
            </Link>
            <span className="text-gray-300">•</span>
            <Link href="/sale" className="text-primary hover:underline text-sm">
              Sale
            </Link>
            <span className="text-gray-300">•</span>
            <Link href="/blog" className="text-primary hover:underline text-sm">
              Blog
            </Link>
          </div>
        </div>

        {/* Help Text */}
        <div className="pt-4">
          <p className="text-sm text-gray-500">
            If you believe this is an error, please{' '}
            <Link href="/contact" className="text-primary hover:underline font-medium">
              contact us
            </Link>
            {' '}and we'll help you find what you're looking for.
          </p>
        </div>
      </div>
    </div>
  )
}

