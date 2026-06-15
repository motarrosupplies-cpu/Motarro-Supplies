import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabaseClient'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Server misconfiguration: SUPABASE_SERVICE_ROLE_KEY missing' },
        { status: 500 }
      )
    }

    const { items } = await request.json()
    
    if (!Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Items array is required' },
        { status: 400 }
      )
    }

    // Update order_index for all items
    for (const item of items) {
      const { error } = await supabaseAdmin
        .from('menu_items')
        .update({ order_index: item.order_index })
        .eq('id', item.id)
      
      if (error) {
        console.error(`Error updating order for item ${item.id}:`, error)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in reorder route:', error)
    return NextResponse.json(
      { error: 'Failed to reorder menu items' },
      { status: 500 }
    )
  }
}
