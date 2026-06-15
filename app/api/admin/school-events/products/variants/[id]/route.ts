import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabaseClient";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = supabaseAdmin ?? supabase;
    const body = await request.json();
    const { size, color, additionalPrice, isActive } = body;

    const updateData: Record<string, unknown> = {};
    if (size !== undefined) updateData.size = size;
    if (color !== undefined) updateData.color = color;
    if (additionalPrice !== undefined) updateData.additionalPrice = additionalPrice;
    if (isActive !== undefined) updateData.isActive = isActive;

    const { data: variant, error } = await db
      .from('event_product_variants')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating product variant:', error);
      return NextResponse.json(
        { error: 'Failed to update product variant' },
        { status: 500 }
      );
    }

    return NextResponse.json(variant);
  } catch (error) {
    console.error('Error updating product variant:', error);
    return NextResponse.json(
      { error: 'Failed to update product variant' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = supabaseAdmin ?? supabase;

    const { count } = await db
      .from('school_event_order_items')
      .select('*', { count: 'exact', head: true })
      .eq('variant_id', id);

    if (count && count > 0) {
      return NextResponse.json(
        { error: 'Cannot delete variant with existing orders' },
        { status: 400 }
      );
    }

    const { error } = await db
      .from('event_product_variants')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting product variant:', error);
      return NextResponse.json(
        { error: 'Failed to delete product variant' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product variant:', error);
    return NextResponse.json(
      { error: 'Failed to delete product variant' },
      { status: 500 }
    );
  }
}
