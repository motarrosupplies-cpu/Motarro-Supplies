import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET() {
  try {
    console.log('=== CUSTOM PRINTING API TEST ===');
    
    // Fetch all products
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .order('id', { ascending: false });
    
    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    console.log('Raw products from DB:', products?.length || 0);
    
    // Filter for Custom Printing
    const customPrinting = products?.filter(p => p.category === 'Custom Printing') || [];
    console.log('Custom Printing products:', customPrinting.length);
    
    // Transform to match frontend expectations
    const transformedProducts = customPrinting.map((p: any) => ({
      id: String(p.id),
      name: String(p.name ?? ''),
      category: String(p.category ?? ''),
      price: String(p.price ?? ''),
      originalPrice: p.original_price != null ? String(p.original_price) : undefined,
      stock: String(p.stock ?? ''),
      status: String(p.status ?? 'active'),
      isNew: Boolean(p.is_new),
      onSale: Boolean(p.on_sale),
      image: String(p.image ?? ''),
      description: String(p.description ?? ''),
      images: Array.isArray(p.images) ? p.images : (typeof p.images === 'string' ? JSON.parse(p.images || '[]') : []),
      hasColorOptions: Boolean(p.has_color_options),
      hasSizeOptions: Boolean(p.has_size_options),
      colors: Array.isArray(p.colors) ? p.colors : [],
    }));
    
    console.log('Transformed products:', transformedProducts.length);
    console.log('Sample product:', transformedProducts[0]);
    
    return NextResponse.json({
      success: true,
      totalProducts: products?.length || 0,
      customPrintingCount: customPrinting.length,
      transformedCount: transformedProducts.length,
      products: transformedProducts,
      rawCustomPrinting: customPrinting
    });
    
  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json({
      error: 'Test failed',
      details: String(error)
    }, { status: 500 });
  }
}
