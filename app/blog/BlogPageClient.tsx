"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, User, ArrowRight, Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface BlogPost {
  id: string
  title: string
  excerpt: string
  slug: string
  category: string
  author: string
  publish_date: string
  read_time: string
  featured: boolean
  images?: string[]
  image_url?: string
  tags: string[]
  status: string
}

const categories = [
  "All Categories",
  "Printing Techniques",
  "Corporate Branding",
  "Sustainability",
  "Event Marketing",
  "Fashion Tips",
  "Industry Insights",
  "How-to Guides"
]

export default function BlogPageClient() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All Categories")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch blog posts from API
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/blog?status=published')
        if (!response.ok) {
          throw new Error('Failed to fetch blog posts')
        }
        const data = await response.json()
        console.log('Fetched blog posts:', {
          total: data.length,
          posts: data.map((p: any) => ({
            title: p.title,
            slug: p.slug,
            status: p.status,
            images: p.images?.length || 0,
            image_url: p.image_url ? 'has image_url' : 'no image_url'
          }))
        })
        setPosts(data)
        setFilteredPosts(data)
      } catch (err) {
        console.error('Error fetching blog posts:', err)
        setError('Failed to load blog posts. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPosts()
  }, [])

  // Add Blog CollectionPage schema for SEO
  useEffect(() => {
    if (posts.length === 0) return

    const schema = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "MOTARRO Supplies Blog - Custom Apparel & Printing Insights",
      "description": "Expert insights on custom apparel, printing techniques, corporate branding, and industry trends",
      "url": "https://www.motarro.co.za/blog",
      "mainEntity": {
        "@type": "ItemList",
        "itemListElement": posts.filter(p => p.status === 'published').map((post, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "item": {
            "@type": "Article",
            "headline": post.title,
            "description": post.excerpt,
            "url": `https://www.motarro.co.za/blog/${post.slug}`,
            "image": post.images && post.images.length > 0 && post.images.filter(Boolean).length > 0 
              ? post.images.filter(Boolean)[0] 
              : post.image_url || "",
            "datePublished": post.publish_date,
            "author": {
              "@type": "Organization",
              "name": post.author || "MOTARRO Supplies Team"
            }
          }
        }))
      }
    }
    
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.text = JSON.stringify(schema)
    script.id = 'blog-collection-schema'
    
    // Remove existing schema if present
    const existing = document.getElementById('blog-collection-schema')
    if (existing) existing.remove()
    
    document.head.appendChild(script)
    
    return () => {
      const scriptToRemove = document.getElementById('blog-collection-schema')
      if (scriptToRemove) scriptToRemove.remove()
    }
  }, [posts])

  // Filter posts based on search and category
  useEffect(() => {
    let filtered = posts

    if (searchQuery) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    if (selectedCategory !== "All Categories") {
      filtered = filtered.filter(post => post.category === selectedCategory)
    }

    setFilteredPosts(filtered)
  }, [posts, searchQuery, selectedCategory])

  // Get featured post - prioritize most recent by publish_date
  const featuredPosts = posts.filter(post => post.featured && post.status === 'published')
  const featuredPost = featuredPosts.length > 0 
    ? featuredPosts.sort((a, b) => new Date(b.publish_date).getTime() - new Date(a.publish_date).getTime())[0]
    : null
  
  // Get non-featured posts (exclude the selected featured post)
  const regularPosts = filteredPosts.filter(post => 
    post.status === 'published' && 
    (!post.featured || post.id === featuredPost?.id)
  )

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 bg-lavender min-h-screen">
        <div className="text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20 max-w-md mx-auto">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-primary mb-2">Loading Blog Posts</h2>
            <p className="text-muted-foreground">Please wait while we fetch the latest articles...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 bg-lavender min-h-screen">
        <div className="text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20 max-w-md mx-auto">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <strong>Error:</strong> {error}
            </div>
            <h2 className="text-2xl font-bold text-primary mb-2">Unable to Load Blog</h2>
            <p className="text-muted-foreground mb-4">Please try refreshing the page or contact support if the issue persists.</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-lavender min-h-screen">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
          <h1 className="text-4xl md:text-5xl font-black text-primary mb-4 tracking-tight">
            MOTARRO Supplies Blog
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Expert insights on custom apparel, printing techniques, corporate branding, and industry trends. 
            Stay ahead with our latest articles and tips.
          </p>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Featured Post */}
      {featuredPost && (
        <Card className="mb-8 border-2 border-primary/20 shadow-lg">
          {/* Featured Post Image */}
          {(() => {
            const featuredImage = (featuredPost.images && Array.isArray(featuredPost.images) && featuredPost.images.length > 0)
              ? featuredPost.images[0]
              : (featuredPost.image_url && featuredPost.image_url.trim() !== '' ? featuredPost.image_url : null);
            
            if (!featuredImage || typeof featuredImage !== 'string' || featuredImage.trim() === '') {
              return null;
            }
            
            return (
              <div className="relative aspect-video w-full overflow-hidden rounded-t-lg">
                <Image
                  src={featuredImage.trim()}
                  alt={featuredPost.title}
                  fill
                  className="object-cover"
                  sizes="100vw"
                  priority
                  unoptimized={true}
                />
              </div>
            );
          })()}
          <CardHeader className="text-center">
            <Badge variant="secondary" className="w-fit mx-auto mb-2">
              {featuredPost.category}
            </Badge>
            <CardTitle className="text-2xl md:text-3xl">
              {featuredPost.title}
            </CardTitle>
            <CardDescription className="text-lg">
              {featuredPost.excerpt}
            </CardDescription>
            <div className="flex items-center justify-center gap-4 text-sm text-gray-500 mt-4">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {featuredPost.author}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(featuredPost.publish_date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {featuredPost.read_time}
              </div>
            </div>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild size="lg" className="rounded-full">
              <Link href={`/blog/${featuredPost.slug}`}>
                Read Full Article
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Blog Posts Grid */}
      {regularPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {regularPosts.map((post) => (
            <Card key={post.id} className="min-w-0 overflow-visible hover:shadow-lg transition-shadow duration-300">
              {/* Blog Post Image */}
              {(() => {
                const postImage = (post.images && Array.isArray(post.images) && post.images.length > 0)
                  ? post.images[0]
                  : (post.image_url && post.image_url.trim() !== '' ? post.image_url : null);
                
                if (!postImage || typeof postImage !== 'string' || postImage.trim() === '') {
                  return null;
                }
                
                return (
                  <div className="relative aspect-video w-full overflow-hidden rounded-t-lg">
                    <Image
                      src={postImage.trim()}
                      alt={post.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      loading="lazy"
                      unoptimized={true}
                    />
                  </div>
                );
              })()}
              <CardHeader>
                <Badge variant="outline" className="w-fit">
                  {post.category}
                </Badge>
                <CardTitle className="line-clamp-2">
                  {post.title}
                </CardTitle>
                <CardDescription className="line-clamp-3">
                  {post.excerpt}
                </CardDescription>
              </CardHeader>
              <CardContent className="overflow-visible">
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {post.author}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {post.read_time}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-sm text-gray-500">
                    {new Date(post.publish_date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="h-auto min-h-9 w-full justify-start whitespace-normal px-3 py-2 text-left focus-visible:ring-inset focus-visible:ring-offset-0 [&_svg]:shrink-0"
                  >
                    <Link
                      href={`/blog/${post.slug}`}
                      aria-label={`Read blog post: ${post.title}`}
                      className="inline-flex w-full items-start gap-1.5 break-words rounded-md"
                    >
                      <span className="min-w-0">
                        Read: {post.title}
                      </span>
                      <ArrowRight className="ml-0 mt-0.5 h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">
            {searchQuery || selectedCategory !== "All Categories" 
              ? "No posts found matching your criteria." 
              : "No blog posts available yet. Check back soon!"}
          </p>
        </div>
      )}

      {/* Blog Introduction Section */}
      <div className="mt-16 mb-12 bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-primary mb-4">Your Ultimate Guide to Custom Apparel & Printing</h2>
          <p className="text-lg text-muted-foreground max-w-4xl mx-auto">
            Welcome to the MOTARRO Supplies blog, your comprehensive resource for everything related to custom apparel, 
            printing techniques, and corporate branding. Our expert team shares industry insights, practical tips, 
            and the latest trends to help you make informed decisions about your custom printing projects.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="text-center p-6 bg-primary/5 rounded-xl">
            <h3 className="text-lg font-semibold mb-3 text-primary">Printing Techniques</h3>
            <p className="text-muted-foreground text-sm">
              Learn about sublimation, screen printing, embroidery, and other methods to choose the best option for your project.
            </p>
          </div>
          <div className="text-center p-6 bg-primary/5 rounded-xl">
            <h3 className="text-lg font-semibold mb-3 text-primary">Corporate Branding</h3>
            <p className="text-muted-foreground text-sm">
              Discover strategies for building brand awareness through custom apparel and promotional merchandise.
            </p>
          </div>
          <div className="text-center p-6 bg-primary/5 rounded-xl">
            <h3 className="text-lg font-semibold mb-3 text-primary">Sustainability</h3>
            <p className="text-muted-foreground text-sm">
              Explore eco-friendly printing options and sustainable materials for responsible custom apparel production.
            </p>
          </div>
          <div className="text-center p-6 bg-primary/5 rounded-xl">
            <h3 className="text-lg font-semibold mb-3 text-primary">Industry Insights</h3>
            <p className="text-muted-foreground text-sm">
              Stay updated with market trends, pricing strategies, and emerging technologies in the custom apparel industry.
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-6 text-center">
          <h3 className="text-xl font-semibold mb-3">Why Follow Our Blog?</h3>
          <p className="text-muted-foreground max-w-3xl mx-auto">
            Our blog combines years of industry experience with practical, actionable advice. Whether you're a business owner 
            looking to enhance your brand, an event organizer planning custom merchandise, or simply someone interested in 
            quality apparel, our content is designed to educate, inspire, and guide you toward successful custom printing projects.
          </p>
        </div>
      </div>

      {/* Newsletter Signup */}
      <div className="mt-16 text-center">
        <Card className="max-w-2xl mx-auto bg-gradient-to-r from-primary/10 to-secondary/10">
          <CardHeader>
            <CardTitle className="text-2xl">Stay Updated</CardTitle>
            <CardDescription>
              Get the latest custom apparel insights, printing tips, and industry news delivered to your inbox.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                type="email"
                placeholder="Enter your email address"
                className="flex-1"
              />
              <Button className="rounded-full">
                Subscribe
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
