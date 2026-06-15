import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabaseClient'

export const dynamic = 'force-dynamic'

// GET /api/blog/[id] - Fetch single blog post
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: post, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Blog post not found' }, { status: 404 })
      }
      console.error('Error fetching blog post:', error)
      return NextResponse.json({ error: 'Failed to fetch blog post' }, { status: 500 })
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error('Error in blog GET route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/blog/[id] - Update blog post
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({
        error: 'Server misconfiguration: SUPABASE_SERVICE_ROLE_KEY missing',
      }, { status: 500 })
    }
    console.log('PUT request received for blog post:', params.id)
    const body = await request.json()
    console.log('Request body:', body)
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

    // Check if slug already exists (excluding current post) using admin client to bypass RLS
    const { data: existingPost } = await supabaseAdmin
      .from('blog_posts')
      .select('id')
      .eq('slug', slug)
      .neq('id', params.id)
      .single()

    if (existingPost) {
      return NextResponse.json(
        { error: 'A post with this slug already exists' },
        { status: 409 }
      )
    }

    // Convert publishDate to DATE format if needed
    let formattedPublishDate = publishDate
    if (publishDate) {
      // If it's in ISO format, extract just the date part
      if (publishDate.includes('T')) {
        formattedPublishDate = publishDate.split('T')[0]
      } else if (publishDate.includes(' ')) {
        formattedPublishDate = publishDate.split(' ')[0]
      }
    }

    // Ensure images is a valid array
    let imagesArray: string[] = []
    if (images !== undefined && images !== null) {
      if (Array.isArray(images)) {
        imagesArray = images.filter((img: any) => img && typeof img === 'string' && img.trim() !== '')
      } else if (typeof images === 'string') {
        // Handle case where images might be a single string
        imagesArray = images.trim() ? [images.trim()] : []
      }
    }
    // If images is undefined/null, don't include it in update (preserve existing)
    // Only include images in update if it was explicitly provided
    
    console.log('[Blog API PUT] Images received:', images)
    console.log('[Blog API PUT] Processed images array:', imagesArray)
    console.log('[Blog API PUT] Formatted publish date:', formattedPublishDate)

    const updatedPost: any = {
      title,
      excerpt,
      content,
      slug,
      category: category || 'Printing Techniques',
      author: author || 'MOTARRO Supplies Team',
      publish_date: formattedPublishDate || new Date().toISOString().split('T')[0],
      read_time: readTime || '5 min read',
      tags: tags || [],
      status: status || 'draft',
      featured: featured || false,
      meta_title: metaTitle || title,
      meta_description: metaDescription || excerpt,
      seo_keywords: seoKeywords || [],
      updated_at: new Date().toISOString()
    }
    
    // Only include images if it was explicitly provided (not undefined)
    if (images !== undefined) {
      updatedPost.images = imagesArray
    }

    // Use admin client for update operations to bypass RLS
    console.log('[Blog API PUT] Update data:', updatedPost)
    console.log('[Blog API PUT] Images being saved:', updatedPost.images)
    
    const { data: post, error } = await supabaseAdmin
      .from('blog_posts')
      .update(updatedPost)
      .eq('id', params.id)
      .select()
      .single()
    
    console.log('[Blog API PUT] Update result:', { 
      success: !error, 
      postId: post?.id,
      savedImages: post?.images,
      error: error ? error.message : null 
    })

    if (error) {
      console.error('Error updating blog post:', error)
      return NextResponse.json({ 
        error: 'Failed to update blog post', 
        details: error.message,
        code: error.code 
      }, { status: 500 })
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error('Error in blog PUT route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/blog/[id] - Delete blog post
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({
        error: 'Server misconfiguration: SUPABASE_SERVICE_ROLE_KEY missing',
      }, { status: 500 })
    }

    // Use admin client for delete operations to bypass RLS
    const { error } = await supabaseAdmin
      .from('blog_posts')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Error deleting blog post:', error)
      return NextResponse.json({ error: 'Failed to delete blog post' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Blog post deleted successfully' })
  } catch (error) {
    console.error('Error in blog DELETE route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
