import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET() {
  try {
    console.log("Checking products database state...");
    
    const results: any = {
      tables: {},
      columns: {},
      sample_data: {},
      errors: []
    };

    // Check if products table exists and has expected columns
    try {
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*')
        .limit(1);
      
      if (productsError) {
        results.errors.push(`Products table error: ${productsError.message}`);
      } else {
        results.tables.products = 'exists';
        if (products && products.length > 0) {
          const sampleProduct = products[0];
          results.columns.products = Object.keys(sampleProduct);
          results.sample_data.products = sampleProduct;
        }
      }
    } catch (e) {
      results.errors.push(`Products table check failed: ${e}`);
    }

    // Check if product_variants table exists
    try {
      const { data: variants, error: variantsError } = await supabase
        .from('product_variants')
        .select('*')
        .limit(1);
      
      if (variantsError) {
        if (variantsError.message.includes('relation "product_variants" does not exist')) {
          results.tables.product_variants = 'missing';
          results.errors.push('product_variants table does not exist');
        } else {
          results.errors.push(`Product variants error: ${variantsError.message}`);
        }
      } else {
        results.tables.product_variants = 'exists';
        if (variants && variants.length > 0) {
          results.columns.product_variants = Object.keys(variants[0]);
        }
      }
    } catch (e) {
      results.errors.push(`Product variants check failed: ${e}`);
    }

    // Check specific columns that the API expects
    try {
      const { data: columnCheck, error: columnError } = await supabase
        .from('products')
        .select('has_color_options, has_size_options, on_sale, is_new, original_price, colors, details')
        .limit(1);
      
      if (columnError) {
        results.errors.push(`Column check error: ${columnError.message}`);
      } else {
        results.columns.expected_columns = Object.keys(columnCheck?.[0] || {});
      }
    } catch (e) {
      results.errors.push(`Column check failed: ${e}`);
    }

    console.log("Database check completed:", results);
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...results
    });

  } catch (error) {
    console.error('Database check failed:', error);
    return NextResponse.json({
      success: false,
      error: String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 