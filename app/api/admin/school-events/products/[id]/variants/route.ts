import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabaseClient";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = supabaseAdmin ?? supabase;
    const body = await request.json();
    const { size, color, additionalPrice } = body;

    if (!size || !color) {
      return NextResponse.json(
        { error: 'Size and color are required' },
        { status: 400 }
      );
    }

    const { data: variant, error } = await db
      .from('event_product_variants')
      .insert({
        productId: id,
        size,
        color,
        additionalPrice: additionalPrice || 0,
        isActive: true
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating product variant:', error);
      return NextResponse.json(
        { error: 'Failed to create product variant' },
        { status: 500 }
      );
    }

    return NextResponse.json(variant, { status: 201 });
  } catch (error) {
    console.error('Error creating product variant:', error);
    return NextResponse.json(
      { error: 'Failed to create product variant' },
      { status: 500 }
    );
  }
}
