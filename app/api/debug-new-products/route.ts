import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET() {
  try {
    console.log('=== NEW PRODUCT DEBUG ===');
    
    // Get all products ordered by creation date (newest first)
    const { data: allProducts, error } = await supabase
      .from('products')
      .select('id, name, category, created_at')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    console.log('All products (newest first):', allProducts?.length || 0);
    
    // Filter for Custom Printing products
    const customPrintingProducts = allProducts?.filter(p => p.category === 'Custom Printing') || [];
    console.log('Custom Printing products:', customPrintingProducts.length);
    
    // Get the most recent product
    const mostRecent = allProducts?.[0];
    console.log('Most recent product:', mostRecent);
    
    // Check if there are any very recent products (last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const recentProducts = allProducts?.filter(p => p.created_at > fiveMinutesAgo) || [];
    console.log('Products created in last 5 minutes:', recentProducts.length);
    
    return NextResponse.json({
      success: true,
      totalProducts: allProducts?.length || 0,
      customPrintingCount: customPrintingProducts.length,
      mostRecentProduct: mostRecent,
      recentProducts: recentProducts,
      allProducts: allProducts,
      customPrintingProducts: customPrintingProducts
    });
    
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({
      error: 'Debug failed',
      details: String(error)
    }, { status: 500 });
  }
}
