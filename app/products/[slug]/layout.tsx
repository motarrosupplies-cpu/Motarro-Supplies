import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getProductBySlugOrId } from '@/lib/server/product-utils'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 60 // ISR: Revalidate every 60 seconds

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.NEXT_PUBLIC_VERCEL_URL
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL.replace(/^https?:\/\//, '')}`
    : 'https://www.motarro.co.za')

function ensureArray<T>(value: T | T[] | null | undefined): T[] {
  if (!value) return []
  if (Array.isArray(value)) return value
  return [value]
}

async function loadProductMetadata(identifier: string) {
  const product = await getProductBySlugOrId(identifier)

  if (!product) return null

  // Don't redirect in layout - let the page component handle redirects
  // This prevents redirect loops during metadata generation

  let images: string[] = []
  if (typeof product.images === 'string') {
    try {
      const parsed = JSON.parse(product.images)
      images = ensureArray(parsed)
    } catch {
      images = ensureArray(product.images)
    }
  } else {
    images = ensureArray(product.images)
  }

  if (images.length === 0 && product.image) {
    images.push(product.image)
  }

  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    category: product.category,
    status: product.status,
    seoTitle: product.seo_title,
    seoDescription: product.seo_description,
    seoKeywords: product.seo_keywords,
    seoSlug: product.seo_slug || product.slug,
    slug: product.slug || product.seo_slug,
    images,
  }
}

export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const identifier = params.slug
  const product = await loadProductMetadata(identifier)

  if (!product) {
    return {
      title: 'Product Not Found | MOTARRO Supplies',
      description: 'The product you are looking for does not exist.',
      robots: {
        index: false,
        follow: true,
      },
    }
  }

  const price = product.price ? `From R${Number(product.price).toFixed(2)}` : ''
  let title = product.seoTitle || `${product.name}${price ? ` | ${price}` : ''}`
  if (title.length > 48) title = title.substring(0, 47) + '…'
  const description =
    product.seoDescription ||
    product.description ||
    `Shop ${product.name} at MOTARRO Supplies. High-quality custom apparel and printing services in Johannesburg, South Africa.`

  const rawImages = Array.isArray(product.images) ? product.images : []
  const images = rawImages.filter(Boolean)

  const keywords = product.seoKeywords
    ? Array.isArray(product.seoKeywords)
      ? product.seoKeywords
      : [product.seoKeywords]
    : [product.name, product.category, 'custom apparel', 'South Africa', 'Johannesburg', 'printing services']

  // Use slug in URL (always use slug, never UUID)
  const productSlug = product.slug || product.seoSlug || product.id
  const productUrl = `${SITE_URL.replace(/\/$/, '')}/products/${productSlug}`

  return {
    title,
    description: description.substring(0, 160),
    keywords,
    openGraph: {
      title,
      description: description.substring(0, 160),
      url: productUrl,
      siteName: 'MOTARRO Supplies',
      images:
        images.length > 0
          ? images.map((img: string) => ({
              url: img,
              width: 1200,
              height: 630,
              alt: product.name,
            }))
          : [],
      type: 'website',
      locale: 'en_ZA',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: description.substring(0, 160),
      images: images.length > 0 ? [images[0]] : [],
    },
    alternates: {
      canonical: productUrl,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}

export async function generateStaticParams() {
  try {
    const { getAllProductSlugs } = await import('@/lib/server/product-utils')
    const slugs = await getAllProductSlugs()
    
    return slugs.map((item) => ({
      slug: item.slug,
    }))
  } catch (error) {
    console.error('Error generating static params:', error)
    return []
  }
}

export default async function ProductLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const product = await loadProductMetadata(slug)
  if (!product) notFound()
  return <>{children}</>
}

