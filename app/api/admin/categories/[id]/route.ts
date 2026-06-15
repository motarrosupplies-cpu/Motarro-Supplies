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

// GET - Fetch single category
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await requireAdminClient()
      .from('product_categories')
      .select('*')
      .eq('id', params.id)
      .single()
    
    if (error) throw error
    
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching category:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) || "Failed to fetch category" },
      { status: 500 }
    )
  }
}

// PUT - Update category
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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
      .update({
        name: name.trim(),
        slug: slug,
        description: description || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error updating category:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) || "Failed to update category" },
      { status: 500 }
    )
  }
}

// DELETE - Delete category
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await requireAdminClient()
      .from('product_categories')
      .delete()
      .eq('id', params.id)
    
    if (error) throw error
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting category:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) || "Failed to delete category" },
      { status: 500 }
    )
  }
}
