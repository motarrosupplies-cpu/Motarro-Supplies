import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET real-time stock for a product
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const client = supabaseAdmin || supabase;
    if (!client) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    const { data, error } = await client
      .from('ready_to_ship_products')
      .select('stock_quantity, low_stock_threshold, allow_backorder, status')
      .eq('id', params.id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const stockStatus = 
      data.stock_quantity <= 0 && !data.allow_backorder ? 'out_of_stock' :
      data.stock_quantity <= data.low_stock_threshold ? 'low_stock' :
      'in_stock';

    return NextResponse.json({
      stockQuantity: data.stock_quantity,
      stockStatus,
      lowStockThreshold: data.low_stock_threshold,
      allowBackorder: data.allow_backorder,
      status: data.status
    });
  } catch (error) {
    console.error('Error fetching stock:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

