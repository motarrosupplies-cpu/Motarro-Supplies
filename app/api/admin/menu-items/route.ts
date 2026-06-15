import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseClient"
import { describeSupabaseAdminKeyError } from "@/lib/supabase-env"

export async function GET() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Server misconfiguration: SUPABASE_SERVICE_ROLE_KEY is required for admin menu management. Set it in Vercel and locally." },
        { status: 500 }
      )
    }
    const { data, error } = await supabaseAdmin
      .from('menu_items')
      .select('*')
      .order('level', { ascending: true })
      .order('order_index', { ascending: true })
    
    if (error) {
      console.error("Error fetching menu items:", error)
      
      // Check if it's a table doesn't exist error
      if (error.message.includes('relation "menu_items" does not exist')) {
        console.log("menu_items table doesn't exist yet, returning empty array")
        return NextResponse.json([])
      }
      
      // Check if it's an RLS or permission error
      if (error.message.includes('permission denied') || error.message.includes('row-level security')) {
        console.error("RLS or permission denied on menu_items:", error.message)
        return NextResponse.json({
          error: "Database permission error on menu_items. Ensure SUPABASE_SERVICE_ROLE_KEY is set for admin."
        }, { status: 403 })
      }
      
      if (
        error.message.toLowerCase().includes('invalid api key') ||
        error.message.toLowerCase().includes('invalid jwt')
      ) {
        return NextResponse.json(
          { error: describeSupabaseAdminKeyError(error.message) },
          { status: 500 }
        )
      }

      throw error
    }
    
    // For now, return the basic data without category mapping
    // We can enhance this later once the relationships are properly established
    return NextResponse.json(data || [])
  } catch (error) {
    console.error("Error fetching menu items:", error)
    
    // Return a more specific error message
    const rawMessage = error instanceof Error ? error.message : String(error)
    const errorMessage =
      rawMessage.toLowerCase().includes('invalid api key') ||
      rawMessage.toLowerCase().includes('invalid jwt')
        ? describeSupabaseAdminKeyError(rawMessage)
        : rawMessage
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        {
          error:
            "Server misconfiguration: SUPABASE_SERVICE_ROLE_KEY is required for admin menu management. Set it in Vercel and locally.",
        },
        { status: 500 }
      );
    }
    const body = await request.json()
    
    const { label, href, parent_id, order_index, level, is_header, description, filter_keywords } = body
    
    if (!label) {
      return NextResponse.json(
        { error: "Label is required" },
        { status: 400 }
      )
    }
    
    const { data, error } = await supabaseAdmin
      .from('menu_items')
      .insert([{ 
        label, 
        href: href || null, 
        parent_id: parent_id || null, 
        order_index: order_index || 0,
        level: level || 0,
        is_header: is_header || false,
        description: description || null,
        filter_keywords: filter_keywords || null
      }])
      .select()
      .single()
    
    if (error) {
      console.error("Supabase error creating menu item:", error)
      
      // Check if it's a table doesn't exist error
      if (error.message.includes('relation "menu_items" does not exist')) {
        return NextResponse.json({
          error: "Menu items table doesn't exist yet. Please run the database migration first."
        }, { status: 400 })
      }
      
      // Check if it's a foreign key constraint error
      if (error.message.includes('foreign key constraint')) {
        return NextResponse.json({
          error: "Invalid parent menu item reference"
        }, { status: 400 })
      }
      
      throw error
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error("Unexpected error creating menu item:", error)
    
    // Don't expose internal error details to client
    return NextResponse.json(
      { error: "Failed to create menu item" },
      { status: 500 }
    )
  }
} 