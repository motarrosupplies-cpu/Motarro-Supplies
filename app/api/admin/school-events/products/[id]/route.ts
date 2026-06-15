import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabaseClient";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = supabaseAdmin ?? supabase;

    const { data, error } = await db
      .from('event_products')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'Event product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching event product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event product' },
      { status: 500 }
    );
  }
}

// Update product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = supabaseAdmin ?? supabase;
    const body = await request.json();
    const { name, description, basePrice, imageUrl, isActive } = body;

    console.log('Updating product with data:', { id, name, description, basePrice, imageUrl, isActive });

    if (!name || !basePrice) {
      return NextResponse.json(
        { error: 'Name and base price are required' },
        { status: 400 }
      );
    }

    // Update the event product using correct camelCase column names
    const updateData = {
      name,
      description: description || '',
      basePrice: parseFloat(basePrice), // camelCase
      imageUrl: imageUrl || null, // camelCase
      isActive: isActive !== false // camelCase
    };

    console.log('Updating product data:', updateData);

    const { data: product, error } = await db
      .from('event_products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating event product:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      return NextResponse.json(
        { error: `Failed to update event product: ${error.message}` },
        { status: 500 }
      );
    }

    console.log('Product updated successfully:', product);
    return NextResponse.json(product);
  } catch (error) {
    console.error('Unexpected error updating event product:', error);
    return NextResponse.json(
      { error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

// Delete product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = supabaseAdmin ?? supabase;

    console.log('Deleting product:', id);

    // Delete the event product
    const { error } = await db
      .from('event_products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting event product:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      return NextResponse.json(
        { error: `Failed to delete event product: ${error.message}` },
        { status: 500 }
      );
    }

    console.log('Product deleted successfully');
    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Unexpected error deleting event product:', error);
    return NextResponse.json(
      { error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
