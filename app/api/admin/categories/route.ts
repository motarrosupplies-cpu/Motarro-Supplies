import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseClient"

function requireAdminClient() {
  if (!supabaseAdmin) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is required for admin category management."
    )
  }
  return supabaseAdmin
}

// GET - Fetch all categories
export async function GET() {
  try {
    const { data, error } = await requireAdminClient()
      .from('product_categories')
      .select('*')
      .order('name', { ascending: true })
    
    if (error) throw error
    
    return NextResponse.json(data || [])
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) || "Failed to fetch categories" },
      { status: 500 }
    )
  }
}

// POST - Create new category
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, description } = body
    
    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      )
    }
    
    // Generate slug from name (lowercase, replace spaces with hyphens)
    const slug = name.trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
      .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    
    const { data, error } = await requireAdminClient()
      .from('product_categories')
      .insert({
        name: name.trim(),
        slug: slug,
        description: description || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error creating category:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) || "Failed to create category" },
      { status: 500 }
    )
  }
}