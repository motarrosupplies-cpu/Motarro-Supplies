import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabaseClient'
import { normalizeSupabaseUrl, normalizeSupabaseUrls } from '@/lib/utils'

export const dynamic = 'force-dynamic'

// GET /api/blog - Fetch all blog posts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const featured = searchParams.get('featured')

    let query = supabase
      .from('blog_posts')
      .select('*')

    // Default to published posts if no status is specified
    if (status && status !== 'all') {
      query = query.eq('status', status)
    } else {
      // When no status param or status='all', default to published for public API
      query = query.eq('status', 'published')
    }

    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    if (featured === 'true') {
      query = query.eq('featured', true)
    }

    // Order by publish_date first, then created_at for consistent ordering
    query = query.order('publish_date', { ascending: false })
                 .order('created_at', { ascending: false })

    const { data: posts, error } = await query
    
    // Debug logging
    console.log(`[Blog API] Fetched ${posts?.length || 0} posts with status=${status || 'published'}`)

    if (error) {
      console.error('Error fetching blog posts:', error)
      return NextResponse.json({ error: 'Failed to fetch blog posts' }, { status: 500 })
    }

    const normalizedPosts = (posts || []).map((post: any) => {
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
      
      return {
        ...post,
        images: finalImages,
        image_url: post.image_url || (finalImages.length > 0 ? finalImages[0] : ''),
      }
    })

    return NextResponse.json(normalizedPosts, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    })
  } catch (error) {
    console.error('Error in blog GET route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/blog - Create new blog post
export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({
        error: 'Server misconfiguration: SUPABASE_SERVICE_ROLE_KEY missing',
      }, { status: 500 })
    }
    const body = await request.json()
    const {
      title,
      excerpt,
      content,
      slug,
      category,
      author,
      publishDate,
      readTime,
      tags,
      status,
      featured,
      images,
      metaTitle,
      metaDescription,
      seoKeywords
    } = body

    // Validate required fields
    if (!title || !excerpt || !content || !slug) {
      return NextResponse.json(
        { error: 'Missing required fields: title, excerpt, content, slug' },
        { status: 400 }
      )
    }

    // Check if slug already exists (admin to bypass RLS)
    const { data: existingPost } = await supabaseAdmin
      .from('blog_posts')
      .select('id')
      .eq('slug', slug)
      .single()

    if (existingPost) {
      return NextResponse.json(
        { error: 'A post with this slug already exists' },
        { status: 409 }
      )
    }

    // Ensure images is a valid array
    let imagesArray: string[] = []
    if (images) {
      if (Array.isArray(images)) {
        imagesArray = images.filter((img: any) => img && typeof img === 'string' && img.trim() !== '')
      } else if (typeof images === 'string') {
        // Handle case where images might be a single string
        imagesArray = images.trim() ? [images.trim()] : []
      }
    }
    
    console.log('[Blog API POST] Images received:', images)
    console.log('[Blog API POST] Processed images array:', imagesArray)

    const newPost = {
      title,
      excerpt,
      content,
      slug,
      category: category || 'Printing Techniques',
      author: author || 'MOTARRO Supplies Team',
      publish_date: publishDate || new Date().toISOString().split('T')[0],
      read_time: readTime || '5 min read',
      tags: tags || [],
      status: status || 'draft',
      featured: featured || false,
      images: imagesArray, // Use processed array instead of defaulting to []
      meta_title: metaTitle || title,
      meta_description: metaDescription || excerpt,
      seo_keywords: seoKeywords || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    console.log('[Blog API POST] Inserting post with images:', imagesArray.length, 'image(s)')

    // Use admin client for insert operations to bypass RLS
    const { data: post, error } = await supabaseAdmin
      .from('blog_posts')
      .insert([newPost])
      .select()
      .single()

    if (error) {
      console.error('[Blog API POST] Error creating blog post:', error)
      console.error('[Blog API POST] Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      })
      return NextResponse.json({ 
        error: 'Failed to create blog post', 
        details: error.message,
        code: error.code 
      }, { status: 500 })
    }

    console.log('[Blog API POST] Post created successfully:', {
      id: post?.id,
      title: post?.title,
      imagesCount: post?.images?.length || 0,
      images: post?.images
    })

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    console.error('Error in blog POST route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
