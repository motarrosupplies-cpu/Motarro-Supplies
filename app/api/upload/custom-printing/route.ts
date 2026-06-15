import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseClient'

const BUCKET = 'product-images'
const FOLDER = 'custom-printing'
const MAX_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']

export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Server misconfiguration: SUPABASE_SERVICE_ROLE_KEY is required for custom printing uploads.' },
        { status: 500 }
      )
    }

    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    if (!files?.length) {
      return NextResponse.json(
        { error: 'No files provided. Use form field "files" for one or more files.' },
        { status: 400 }
      )
    }

    const results: { url: string; filename: string; size: number }[] = []

    for (const file of files) {
      if (!file || !(file instanceof File)) continue
      if (file.size > MAX_SIZE) {
        return NextResponse.json(
          { error: `File ${file.name} exceeds 10MB limit.` },
          { status: 400 }
        )
      }
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `Invalid type for ${file.name}. Allowed: JPEG, PNG, GIF, WebP.` },
          { status: 400 }
        )
      }

      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`
      const filePath = `${FOLDER}/${fileName}`

      const bytes = await file.arrayBuffer()
      const { error } = await supabaseAdmin.storage
        .from(BUCKET)
        .upload(filePath, bytes, {
          cacheControl: '2592000',
          upsert: false,
          contentType: file.type,
        })

      if (error) {
        console.error('[Upload Custom Printing] Supabase error:', error)
        return NextResponse.json(
          { error: `Upload failed: ${error.message}` },
          { status: 500 }
        )
      }

      const { data: urlData } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(filePath)
      results.push({
        url: urlData.publicUrl,
        filename: fileName,
        size: file.size,
      })
    }

    return NextResponse.json({ urls: results.map((r) => r.url), results })
  } catch (err) {
    console.error('[Upload Custom Printing] Error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Upload failed' },
      { status: 500 }
    )
  }
}
