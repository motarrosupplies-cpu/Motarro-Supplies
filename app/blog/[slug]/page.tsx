"use client"

import { useState, useEffect } from "react"
import { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Calendar, Clock, User, ArrowLeft, Share2, BookOpen, Tag, ArrowRight } from "lucide-react"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { ArticleSchema, BreadcrumbSchema, FAQPageSchema } from "@/components/seo/schema-org"

interface BlogPost {
  id: string
  title: string
  content: string
  excerpt: string
  category: string
  author: string
  publish_date: string
  read_time: string
  tags: string[]
  slug: string
  featured: boolean
  images?: string[]
  image_url?: string
  meta_title?: string
  meta_description?: string
  seo_keywords?: string[]
  status: string
}

interface BlogPostPageProps {
  params: { slug: string }
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const [post, setPost] = useState<BlogPost | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([])

  // Fetch blog post data
  useEffect(() => {
    const fetchPost = async () => {
      try {
        setIsLoading(true)
        // Add cache-busting to ensure fresh data
        const response = await fetch(`/api/blog/slug/${params.slug}?t=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        })
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Blog post not found')
          }
          throw new Error('Failed to fetch blog post')
        }
        const data = await response.json()
        const sanitizedContent = typeof data.content === 'string'
          ? data.content.replace(/<img[^>]*src=["']https?:\/\/upload\.wikimedia\.org[^"']*["'][^>]*>/gi, '')
          : data.content
        console.log('Fetched blog post data:', { 
          title: data.title, 
          excerpt: data.excerpt, 
          publish_date: data.publish_date,
          images: data.images,
          image_url: data.image_url,
          imagesCount: data.images?.length || 0
        })
        setPost({
          ...data,
          content: sanitizedContent
        })
        
        // Fetch related posts (same category, excluding current post)
        if (data.category) {
          const relatedResponse = await fetch(`/api/blog?category=${data.category}&status=published`)
          if (relatedResponse.ok) {
            const relatedData = await relatedResponse.json()
            const filtered = relatedData
              .filter((p: BlogPost) => p.id !== data.id && p.status === 'published')
              .slice(0, 3)
            setRelatedPosts(filtered)
          }
        }
      } catch (err) {
        console.error('Error fetching blog post:', err)
        setError(err instanceof Error ? err.message : 'Failed to load blog post')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPost()
  }, [params.slug])

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 bg-lavender min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading blog post...</p>
        </div>
      </div>
    )
  }

  // Note: Since this is a client component, we can't use Next.js notFound()
  // But we can ensure the API returns proper 404 status codes
  // The error state here is for user display only
  if (error || !post) {
    // If it's a 404 error, the API should have returned 404 status
    // This UI component is just for display
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">
          {error === 'Blog post not found' ? 'Blog Post Not Found' : 'Error Loading Post'}
        </h1>
        <p className="mb-6">
          {error === 'Blog post not found' 
            ? 'The requested blog post could not be found.' 
            : 'There was an error loading this blog post.'}
        </p>
        <Button asChild>
          <Link href="/blog">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Link>
        </Button>
      </div>
    )
  }

  // Calculate read time from content
  const calculateReadTime = (content: string) => {
    const wordsPerMinute = 200
    const words = content.split(' ').length
    const minutes = Math.ceil(words / wordsPerMinute)
    return `${minutes} min read`
  }

  const actualReadTime = post.read_time || calculateReadTime(post.content)

  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: 'Blog', url: '/blog' },
    { name: post.title, url: `/blog/${post.slug}` },
  ];

  // Extract FAQs from content if present (for future enhancement)
  const faqs: Array<{ question: string; answer: string }> = [];

  return (
    <div className="container mx-auto px-4 py-8 bg-lavender min-h-screen">
      <ArticleSchema
        headline={post.title}
        description={post.excerpt || post.meta_description || ''}
        image={post.images && post.images.length > 0 ? post.images : (post.image_url ? [post.image_url] : undefined)}
        datePublished={post.publish_date}
        dateModified={post.updated_at || post.publish_date}
        author={{
          name: post.author || "MOTARRO Supplies Team"
        }}
        url={`/blog/${post.slug}`}
      />
      <BreadcrumbSchema items={breadcrumbItems} />
      {faqs.length > 0 && <FAQPageSchema faqs={faqs} />}
      
      {/* Breadcrumb */}
      <div className="mb-6">
        <Breadcrumbs items={breadcrumbItems} />
      </div>

      {/* Article Header */}
      <article className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <Badge variant="secondary" className="mb-4">
            {post.category}
          </Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            {post.title}
          </h1>
          
          {/* Blog Post Images */}
          {(() => {
            // Get images array or fallback to image_url
            const displayImages = (post.images && Array.isArray(post.images) && post.images.length > 0) 
              ? post.images.filter((img: any) => img && typeof img === 'string' && img.trim() !== '')
              : (post.image_url && post.image_url.trim() !== '' ? [post.image_url] : []);
            
            if (displayImages.length === 0) return null;
            
            return (
              <div className="mb-6 w-full">
                {displayImages.length === 1 ? (
                  // Single image - full width
                  <div className="relative aspect-video w-full rounded-lg overflow-hidden shadow-lg max-w-4xl mx-auto">
                    <Image
                      src={displayImages[0]}
                      alt={`${post.title} - Featured Image`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 896px"
                      priority
                      unoptimized={true}
                    />
                  </div>
                ) : (
                  // Multiple images - grid layout
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
                    {displayImages.map((imageUrl: string, index: number) => (
                      <div key={index} className="relative aspect-video w-full rounded-lg overflow-hidden shadow-lg">
                        <Image
                          src={imageUrl}
                          alt={`${post.title} - Image ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          loading={index === 0 ? "eager" : "lazy"}
                          unoptimized={true}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}
          
          <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto">
            {post.excerpt}
          </p>
          
          {/* Article Meta */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500 mb-6">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              {post.author}
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {new Date(post.publish_date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {actualReadTime}
            </div>
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </header>

        {/* Article Content */}
        <div className="prose prose-lg max-w-none bg-white p-8 rounded-2xl shadow-lg [&_img]:rounded-lg [&_img]:max-w-full [&_img]:h-auto">
          <div 
            dangerouslySetInnerHTML={{ __html: post.content }}
            className="[&>h2]:text-2xl [&>h2]:font-bold [&>h2]:mt-8 [&>h2]:mb-4 [&>h2]:text-gray-900
                       [&>h3]:text-xl [&>h3]:font-semibold [&>h3]:mt-6 [&>h3]:mb-3 [&>h3]:text-gray-800
                       [&>p]:mb-4 [&>p]:leading-relaxed [&>p]:text-gray-700
                       [&>ul]:mb-4 [&>ul]:pl-6 [&>ul]:text-gray-700
                       [&>li]:mb-2 [&>li]:leading-relaxed
                       [&>strong]:font-semibold [&>strong]:text-gray-900"
          />
        </div>

        {/* Share Section */}
        <div className="text-center mt-8 mb-12">
          <Separator className="mb-6" />
          <h3 className="text-lg font-semibold mb-4">Share this article</h3>
          <div className="flex justify-center gap-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: post.title,
                    text: post.excerpt,
                    url: window.location.href
                  })
                } else {
                  navigator.clipboard.writeText(window.location.href)
                  // You could add a toast notification here
                }
              }}
            >
              <Share2 className="mr-2 h-4 w-4" />
              {navigator.share ? 'Share' : 'Copy Link'}
            </Button>
          </div>
        </div>

        {/* Internal Product Links for SEO */}
        <div className="bg-white rounded-lg p-6 border border-gray-200 mt-12">
          <h2 className="text-2xl font-bold mb-4">Explore Our Products & Services</h2>
          <p className="text-gray-700 mb-6">
            Ready to bring your custom apparel vision to life? Browse our comprehensive range of products and services designed for businesses, events, and individuals across Johannesburg and South Africa.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/products" className="text-primary hover:underline font-medium flex items-center gap-2">
              <ArrowRight className="h-4 w-4" />
              Browse All Products
            </Link>
            <Link href="/custom-printing" className="text-primary hover:underline font-medium flex items-center gap-2">
              <ArrowRight className="h-4 w-4" />
              Custom Printing Services
            </Link>
            <Link href="/contact" className="text-primary hover:underline font-medium flex items-center gap-2">
              <ArrowRight className="h-4 w-4" />
              Request a Quote
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/custom-t-shirt-printing-johannesburg" className="text-primary hover:underline text-sm">
              Custom T-Shirt Printing Johannesburg
            </Link>
            <Link href="/branded-corporate-clothing-johannesburg" className="text-primary hover:underline text-sm">
              Branded Corporate Clothing Johannesburg
            </Link>
            <Link href="/sublimation-printing-johannesburg" className="text-primary hover:underline text-sm">
              Sublimation Printing Johannesburg
            </Link>
            <Link href="/corporate-uniforms-johannesburg" className="text-primary hover:underline text-sm">
              Corporate Uniforms Johannesburg
            </Link>
          </div>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-12">
            <h3 className="text-2xl font-bold mb-6">Related Articles</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Card key={relatedPost.id} className="min-w-0 hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <CardTitle className="text-lg line-clamp-2">
                      {relatedPost.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-3">
                      {relatedPost.excerpt}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                      <Calendar className="h-4 w-4" />
                      {new Date(relatedPost.publish_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="h-auto min-h-9 w-full justify-start whitespace-normal px-3 py-2 text-left [&_svg]:shrink-0"
                    >
                      <Link
                        href={`/blog/${relatedPost.slug}`}
                        aria-label={`Read blog post: ${relatedPost.title}`}
                        className="inline-flex items-start gap-2 break-words"
                      >
                        <span className="min-w-0">Read: {relatedPost.title}</span>
                        <ArrowRight className="ml-0 mt-0.5 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center mt-16">
          <Card className="max-w-2xl mx-auto bg-gradient-to-r from-primary/10 to-secondary/10">
            <CardHeader>
              <CardTitle className="text-2xl">Ready to Create Custom Apparel?</CardTitle>
              <CardDescription>
                Get started with your custom printing project today. Our team of experts is ready to help you choose the perfect printing technique for your needs.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild size="lg" className="rounded-full">
                  <Link href="/custom-printing">
                    Start Custom Project
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-full">
                  <Link href="/contact">
                    Contact Us
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </article>
    </div>
  )
}
