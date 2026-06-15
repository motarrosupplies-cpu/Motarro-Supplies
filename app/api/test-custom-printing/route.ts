import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabaseClient';

export async function GET() {
  try {
    console.log('=== CUSTOM PRINTING API TEST ===');
    
    // Test basic connection
    const { data: allProducts, error: allError } = await supabase
      .from('products')
      .select('id, name, category')
      .order('id', { ascending: false });
    
    if (allError) {
      console.error('Error fetching all products:', allError);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch products',
        details: allError
      }, { status: 500 });
    }
    
    console.log('All products:', allProducts);
    
    // Test Custom Printing filter
    const { data: customPrinting, error: customError } = await supabase
      .from('products')
      .select('id, name, category')
      .eq('category', 'Custom Printing')
      .order('id', { ascending: false });
    
    if (customError) {
      console.error('Error fetching Custom Printing products:', customError);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch Custom Printing products',
        details: customError
      }, { status: 500 });
    }
    
    console.log('Custom Printing products:', customPrinting);
    
    return NextResponse.json({
      success: true,
      allProducts: allProducts || [],
      customPrintingProducts: customPrinting || [],
      counts: {
        total: allProducts?.length || 0,
        customPrinting: customPrinting?.length || 0
      }
    });
    
  } catch (error) {
    console.error('Custom Printing test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      details: String(error)
    }, { status: 500 });
  }
}
