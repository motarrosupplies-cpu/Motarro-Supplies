import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseClient"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Server misconfiguration: SUPABASE_SERVICE_ROLE_KEY is required for admin menu management." },
        { status: 500 }
      )
    }
    const { data, error } = await supabaseAdmin
      .from('menu_items')
      .select('*')
      .eq('id', params.id)
      .single()
    
    if (error) throw error
    
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching menu item:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) || "Failed to fetch menu item" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Server misconfiguration: SUPABASE_SERVICE_ROLE_KEY is required for admin menu management." },
        { status: 500 }
      )
    }
    const body = await request.json()
    const { label, href, parent_id, order_index, level, is_header, description, is_active, filter_keywords } = body
    
    if (!label) {
      return NextResponse.json(
        { error: "Label is required" },
        { status: 400 }
      )
    }
    
    const updateData: any = { 
      label,
      href: href || null,
      parent_id: parent_id || null,
      updated_at: new Date().toISOString()
    }
    
    // Only update these fields if they're provided
    if (order_index !== undefined) updateData.order_index = order_index
    if (level !== undefined) updateData.level = level
    if (is_header !== undefined) updateData.is_header = is_header
    if (description !== undefined) updateData.description = description
    if (is_active !== undefined) updateData.is_active = is_active
    if (filter_keywords !== undefined) updateData.filter_keywords = filter_keywords || null
    
    const { data, error } = await supabaseAdmin
      .from('menu_items')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error updating menu item:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) || "Failed to update menu item" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Server misconfiguration: SUPABASE_SERVICE_ROLE_KEY is required for admin menu management." },
        { status: 500 }
      )
    }
    const { error } = await supabaseAdmin
      .from('menu_items')
      .delete()
      .eq('id', params.id)
    
    if (error) throw error
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting menu item:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) || "Failed to delete menu item" },
      { status: 500 }
    )
  }
} 