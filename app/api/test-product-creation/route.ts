import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabaseClient';

export async function POST(request: Request) {
  try {
    console.log('=== PRODUCT CREATION TEST DEBUG ===');
    
    // Test basic connection first
    const { data: testData, error: testError } = await supabase
      .from('products')
      .select('id, name, category')
      .limit(1);
    
    if (testError) {
      console.error('Database connection test failed:', testError);
      return NextResponse.json({
        success: false,
        error: 'Database connection failed',
        details: testError
      }, { status: 500 });
    }
    
    console.log('Database connection test passed');
    
    // Test the request body
    const body = await request.json();
    console.log('Request body received:', JSON.stringify(body, null, 2));
    
    // Test a simple product creation
    const testProduct = {
      name: 'Test Product',
      price: 100,
      category: 'Custom Printing',
      images: ['https://example.com/image.jpg'],
      description: 'Test description',
      stock: 10,
      is_new: true,
      on_sale: false,
      status: 'active',
      has_color_options: false,
      has_size_options: false,
    };
    
    console.log('Attempting to create test product:', testProduct);
    
    const client = supabaseAdmin || supabase;
    console.log('Using client:', supabaseAdmin ? 'supabaseAdmin' : 'supabase');
    
    const { data: created, error: createError } = await client
      .from('products')
      .insert([testProduct])
      .select()
      .single();
    
    if (createError) {
      console.error('Product creation test failed:', createError);
      return NextResponse.json({
        success: false,
        error: 'Product creation test failed',
        details: createError,
        testProduct: testProduct
      }, { status: 500 });
    }
    
    console.log('Test product created successfully:', created);
    
    // Clean up test product
    await client.from('products').delete().eq('id', created.id);
    
    return NextResponse.json({
      success: true,
      message: 'Product creation test passed',
      testProduct: created
    });
    
  } catch (error) {
    console.error('Product creation test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      details: String(error)
    }, { status: 500 });
  }
}
