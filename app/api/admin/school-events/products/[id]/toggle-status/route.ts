import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabaseClient";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = supabaseAdmin ?? supabase;
    const body = await request.json();
    const { isActive } = body;

    console.log('Toggling product status:', { id, isActive });

    if (typeof isActive !== 'boolean') {
      return NextResponse.json(
        { error: 'isActive must be a boolean value' },
        { status: 400 }
      );
    }

    // Update the product status using correct camelCase column names
    const { data: product, error } = await db
      .from('event_products')
      .update({ isActive }) // camelCase
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error toggling product status:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      return NextResponse.json(
        { error: `Failed to toggle product status: ${error.message}` },
        { status: 500 }
      );
    }

    console.log('Product status toggled successfully:', product);
    return NextResponse.json(product);
  } catch (error) {
    console.error('Unexpected error toggling product status:', error);
    return NextResponse.json(
      { error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
