import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET() {
  try {
    console.log('=== DEBUG PRODUCTS CACHE ===');
    
    // Get all products from database
    const { data: dbProducts, error: dbError } = await supabase
      .from('products')
      .select('id, name, category, created_at')
      .order('created_at', { ascending: false });
    
    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json({ error: 'Database error', details: dbError.message }, { status: 500 });
    }
    
    console.log('Database products count:', dbProducts?.length || 0);
    console.log('Database products:', dbProducts);
    
    // Check for "Test" product specifically
    const testProduct = dbProducts?.find(p => p.name === 'Test');
    console.log('Test product in database:', testProduct);
    
    // Get Custom Printing products
    const customPrintingProducts = dbProducts?.filter(p => p.category === 'Custom Printing') || [];
    console.log('Custom Printing products count:', customPrintingProducts.length);
    console.log('Custom Printing products:', customPrintingProducts);
    
    return NextResponse.json({
      success: true,
      totalProducts: dbProducts?.length || 0,
      customPrintingCount: customPrintingProducts.length,
      testProduct: testProduct,
      customPrintingProducts: customPrintingProducts,
      allProducts: dbProducts
    });
    
  } catch (error) {
    console.error('Debug products cache error:', error);
    return NextResponse.json(
      { error: 'Failed to debug products cache', details: String(error) },
      { status: 500 }
    );
  }
}
