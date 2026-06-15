import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET() {
  try {
    console.log('=== DEBUG CUSTOM PRINTING DISPLAY ===');
    
    // Test 1: Direct database query
    const { data: dbProducts, error: dbError } = await supabase
      .from('products')
      .select('id, name, category, price, status')
      .eq('category', 'Custom Printing')
      .order('id', { ascending: false });
    
    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }
    
    console.log('Direct DB query - Custom Printing products:', dbProducts?.length || 0);
    console.log('Sample DB product:', dbProducts?.[0]);
    
    // Test 2: API endpoint call
    const apiResponse = await fetch('https://www.motarro.co.za/api/products');
    const apiData = await apiResponse.json();
    
    console.log('API response status:', apiResponse.status);
    console.log('API data length:', apiData.length);
    
    const apiCustomPrinting = apiData.filter((p: any) => p.category === 'Custom Printing');
    console.log('API Custom Printing count:', apiCustomPrinting.length);
    console.log('Sample API product:', apiCustomPrinting[0]);
    
    // Test 3: Check for exact category match
    const exactMatch = apiData.filter((p: any) => p.category === 'Custom Printing');
    const caseInsensitiveMatch = apiData.filter((p: any) => 
      p.category && p.category.toLowerCase() === 'custom printing'
    );
    
    console.log('Exact match count:', exactMatch.length);
    console.log('Case insensitive match count:', caseInsensitiveMatch.length);
    
    // Test 4: Check all categories
    const allCategories = [...new Set(apiData.map((p: any) => p.category))];
    console.log('All categories in API:', allCategories);
    
    return NextResponse.json({
      success: true,
      debug: {
        directDbCount: dbProducts?.length || 0,
        directDbSample: dbProducts?.[0],
        apiTotalCount: apiData.length,
        apiCustomPrintingCount: apiCustomPrinting.length,
        apiSample: apiCustomPrinting[0],
        exactMatchCount: exactMatch.length,
        caseInsensitiveMatchCount: caseInsensitiveMatch.length,
        allCategories: allCategories,
        apiResponseStatus: apiResponse.status
      }
    });
    
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({
      error: 'Debug failed',
      details: String(error)
    }, { status: 500 });
  }
}
