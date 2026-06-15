import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET all ready-to-ship products
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const maxPrice = searchParams.get('maxPrice');
    const isGift = searchParams.get('isGift') === 'true';
    const isEventFavour = searchParams.get('isEventFavour') === 'true';
    const featured = searchParams.get('featured') === 'true';
    const inStock = searchParams.get('inStock') === 'true';

    const client = supabaseAdmin || supabase;
    if (!client) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    let query = client
      .from('ready_to_ship_products')
      .select('*')
      .eq('status', 'active');

    // Apply filters
    if (category) {
      query = query.eq('category', category);
    }

    if (maxPrice) {
      query = query.lte('max_price_for_filter', parseFloat(maxPrice));
    }

    if (isGift) {
      query = query.eq('is_gift_item', true);
    }

    if (isEventFavour) {
      query = query.eq('is_event_favour', true);
    }

    if (featured) {
      query = query.eq('featured', true);
    }

    if (inStock) {
      query = query.gt('stock_quantity', 0);
    }

    // Order by featured first, then sort_order, then created_at
    query = query.order('featured', { ascending: false })
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching ready-to-ship products:', error);
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }

    // Calculate current prices and stock status
    const products = (data || []).map((product: any) => {
      const now = new Date();
      const flashSaleEnds = product.flash_sale_ends_at ? new Date(product.flash_sale_ends_at) : null;
      const isFlashSale = product.flash_sale_price && flashSaleEnds && flashSaleEnds > now;

      let currentPrice = product.base_price;
      if (isFlashSale) {
        currentPrice = product.flash_sale_price;
      } else if (product.is_on_sale && product.sale_price) {
        currentPrice = product.sale_price;
      }

      const stockStatus = 
        product.stock_quantity <= 0 && !product.allow_backorder ? 'out_of_stock' :
        product.stock_quantity <= product.low_stock_threshold ? 'low_stock' :
        'in_stock';

      return {
        ...product,
        currentPrice: parseFloat(currentPrice),
        isFlashSale,
        stockStatus,
        discountPercent: product.is_on_sale && product.sale_price 
          ? Math.round(((product.base_price - product.sale_price) / product.base_price) * 100)
          : 0
      };
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error in ready-to-ship API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

