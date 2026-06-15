import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'
import { normalizeSupabaseUrl, normalizeSupabaseUrls } from '@/lib/utils'

export const dynamic = 'force-dynamic'

// GET /api/blog/slug/[slug] - Fetch blog post by slug
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { data: post, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', params.slug)
      .eq('status', 'published')
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Blog post not found' }, { status: 404 })
      }
      console.error('Error fetching blog post by slug:', error)
      return NextResponse.json({ error: 'Failed to fetch blog post' }, { status: 500 })
    }

    // Handle images: prioritize images array, fallback to image_url
    // Don't over-normalize - preserve original URLs if they're already valid
    let finalImages: string[] = []
    
    // First, try the images array
    if (post.images && Array.isArray(post.images) && post.images.length > 0) {
      finalImages = post.images
        .filter((img: any) => img && typeof img === 'string' && img.trim() !== '')
        .map((img: string) => {
          // If it's already a full URL, keep it as-is
          if (/^https?:\/\//i.test(img.trim())) {
            return img.trim()
          }
          // Otherwise normalize it
          return normalizeSupabaseUrl(img, 'product-images')
        })
        .filter((url: string) => url && url.trim() !== '')
    }
    
    // If no images array, try image_url
    if (finalImages.length === 0 && post.image_url) {
      const imgUrl = post.image_url.trim()
      if (imgUrl) {
        // If it's already a full URL, keep it as-is
        if (/^https?:\/\//i.test(imgUrl)) {
          finalImages = [imgUrl]
        } else {
          const normalized = normalizeSupabaseUrl(imgUrl, 'product-images')
          if (normalized) {
            finalImages = [normalized]
          }
        }
      }
    }
    
    const normalizedPost = {
      ...post,
      images: finalImages,
      image_url: post.image_url || (finalImages.length > 0 ? finalImages[0] : ''),
    }

    return NextResponse.json(normalizedPost)
  } catch (error) {
    console.error('Error in blog slug GET route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
