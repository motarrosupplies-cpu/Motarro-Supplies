import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET() {
  try {
    console.log('=== DATABASE SCHEMA TEST ===');
    
    // Test 1: Check if we can connect to products table
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .limit(3);
    
    if (error) {
      console.error('Database connection error:', error);
      return NextResponse.json({
        success: false,
        error: 'Database connection failed',
        details: error
      }, { status: 500 });
    }
    
    console.log('Database connection successful');
    console.log('Sample products:', products);
    
    // Test 2: Check column names by examining a product
    if (products && products.length > 0) {
      const sampleProduct = products[0];
      console.log('Sample product keys:', Object.keys(sampleProduct));
      
      return NextResponse.json({
        success: true,
        message: 'Database connection successful',
        totalProducts: products.length,
        sampleProduct: sampleProduct,
        availableColumns: Object.keys(sampleProduct),
        hasStockColumn: 'stock' in sampleProduct,
        hasStockQuantityColumn: 'stock_quantity' in sampleProduct,
        stockValue: sampleProduct.stock,
        stockQuantityValue: sampleProduct.stock_quantity
      });
    } else {
      return NextResponse.json({
        success: true,
        message: 'Database connected but no products found',
        totalProducts: 0
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
