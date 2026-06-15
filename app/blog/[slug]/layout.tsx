import { Metadata } from 'next'
import { supabase } from '@/lib/supabaseClient'

// Generate metadata for blog posts server-side
// This layout wraps the client component page and generates SEO metadata
export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const slug = params.slug

  try {
    const { data: post } = await supabase
      .from('blog_posts')
      .select('id, title, excerpt, content, slug, category, author, publish_date, images, meta_title, meta_description, seo_keywords, tags, status')
      .eq('slug', slug)
      .eq('status', 'published')
      .single()

    if (!post) {
      return {
        title: 'Blog Post Not Found | MOTARRO Supplies',
        description: 'The blog post you are looking for does not exist.',
        robots: {
          index: false,
          follow: true,
        },
      }
    }

    const title = post.meta_title || post.title || 'Blog Post | MOTARRO Supplies'
    const description = post.meta_description || post.excerpt || post.content?.substring(0, 160) || 'Read our latest blog posts about custom apparel and printing services.'
    
    // Handle images
    let images: string[] = []
    if (post.images) {
      if (Array.isArray(post.images)) {
        images = post.images.filter(Boolean)
      } else if (typeof post.images === 'string') {
        try {
          const parsed = JSON.parse(post.images)
          images = Array.isArray(parsed) ? parsed.filter(Boolean) : []
        } catch {
          // If not JSON, skip
        }
      }
    }

    const keywords = post.seo_keywords && Array.isArray(post.seo_keywords)
      ? post.seo_keywords
      : post.tags && Array.isArray(post.tags)
        ? post.tags
        : [post.category, 'custom apparel', 'printing services', 'South Africa']

    return {
      title,
      description: description.substring(0, 160),
      keywords,
      authors: [{ name: post.author || 'MOTARRO Supplies Team' }],
      openGraph: {
        title,
        description: description.substring(0, 160),
        url: `https://www.motarro.co.za/blog/${post.slug}`,
        siteName: 'MOTARRO Supplies',
        images: images.length > 0 ? images.map((img) => ({
          url: img,
          width: 1200,
          height: 630,
          alt: post.title,
        })) : [],
        type: 'article',
        publishedTime: post.publish_date,
        locale: 'en_ZA',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description: description.substring(0, 160),
        images: images.length > 0 ? [images[0]] : [],
      },
      alternates: {
        canonical: `https://www.motarro.co.za/blog/${post.slug}`,
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
  } catch (error) {
    console.error('Error generating blog metadata:', error)
    return {
      title: 'Blog Post | MOTARRO Supplies',
      description: 'Read our latest blog posts about custom apparel and printing services.',
    }
  }
}

export default function BlogPostLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

