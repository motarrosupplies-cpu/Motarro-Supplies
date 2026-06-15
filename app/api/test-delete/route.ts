import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabaseClient';

export async function GET() {
  try {
    console.log('=== DELETE TEST DEBUG ===');
    
    // Test product ID from the screenshot
    const testProductId = '7ea720bc-f056-4b01-92d9-6906746654f8';
    
    // Test 1: Check if product exists
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('id, name, category')
      .eq('id', testProductId)
      .single();
    
    if (fetchError) {
      console.error('Product fetch error:', fetchError);
      return NextResponse.json({
        success: false,
        error: 'Product not found',
        details: fetchError
      }, { status: 404 });
    }
    
    console.log('Product found:', product);
    
    // Test 2: Check variants
    const { data: variants, error: variantsError } = await supabase
      .from('product_variants')
      .select('id, product_id')
      .eq('product_id', testProductId);
    
    console.log('Variants found:', variants?.length || 0);
    if (variantsError) {
      console.error('Variants fetch error:', variantsError);
    }
    
    // Test 3: Test delete with regular client
    console.log('Testing delete with regular supabase client...');
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('id', testProductId);
    
    if (deleteError) {
      console.error('Delete error with regular client:', deleteError);
      
      // Test 4: Test delete with admin client
      if (supabaseAdmin) {
        console.log('Testing delete with admin client...');
        const { error: adminDeleteError } = await supabaseAdmin
          .from('products')
          .delete()
          .eq('id', testProductId);
        
        if (adminDeleteError) {
          console.error('Delete error with admin client:', adminDeleteError);
          return NextResponse.json({
            success: false,
            error: 'Delete failed with both clients',
            regularClientError: deleteError,
            adminClientError: adminDeleteError,
            product: product,
            variants: variants
          }, { status: 500 });
        } else {
          console.log('Delete successful with admin client');
          return NextResponse.json({
            success: true,
            message: 'Delete successful with admin client',
            product: product,
            variants: variants
          });
        }
      } else {
        return NextResponse.json({
          success: false,
          error: 'Delete failed with regular client, no admin client available',
          regularClientError: deleteError,
          product: product,
          variants: variants
        }, { status: 500 });
      }
    } else {
      console.log('Delete successful with regular client');
      return NextResponse.json({
        success: true,
        message: 'Delete successful with regular client',
        product: product,
        variants: variants
      });
    }
    
  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      details: String(error)
    }, { status: 500 });
  }
}
