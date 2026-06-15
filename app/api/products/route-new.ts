import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabaseClient';

export async function POST(request: Request) {
  try {
    console.log('=== SIMPLE PRODUCT CREATION ===');
    
    // Get the request body
    const body = await request.json();
    console.log('Raw request body:', JSON.stringify(body, null, 2));
    
    // Basic validation - only require essential fields
    if (!body.name || !body.price || !body.category || !body.description) {
      return NextResponse.json({
        error: 'Missing required fields: name, price, category, description'
      }, { status: 400 });
    }
    
    // Prepare minimal data for database
    const productData = {
      name: body.name,
      price: parseFloat(body.price),
      category: body.category,
      description: body.description,
      images: body.images || ['https://via.placeholder.com/400x400'],
      image: body.images?.[0] || 'https://via.placeholder.com/400x400',
      stock: parseInt(body.stock) || 0,
      status: 'active',
      is_new: body.isNew || true,
      on_sale: body.onSale || false,
      has_color_options: body.hasColorOptions || false,
      has_size_options: body.hasSizeOptions || false,
      original_price: body.originalPrice || null,
      image_alt_texts: body.imageAltTexts ? JSON.stringify(body.imageAltTexts) : null,
      seo_title: body.seoTitle || null,
      seo_description: body.seoDescription || null,
      seo_keywords: body.seoKeywords || null,
      seo_slug: body.seoSlug || null,
    };
    
    console.log('Prepared product data:', JSON.stringify(productData, null, 2));
    
    // Use admin client if available, otherwise regular client
    const client = supabaseAdmin || supabase;
    console.log('Using client:', supabaseAdmin ? 'supabaseAdmin' : 'supabase');
    
    // Insert the product
    const { data: created, error } = await client
      .from('products')
      .insert([productData])
      .select()
      .single();
    
    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({
        error: 'Failed to create product',
        details: error.message,
        code: error.code,
        hint: error.hint
      }, { status: 500 });
    }
    
    console.log('Product created successfully:', created);
    
    // Handle variants if provided
    if (body.variants && Array.isArray(body.variants) && body.variants.length > 0) {
      console.log('Processing variants:', body.variants.length);
      
      const variantData = body.variants.map((variant: any) => ({
        product_id: created.id,
        color_name: variant.colorName || null,
        color_value: variant.colorValue || null,
        size: variant.size || null,
        sku: variant.sku || null,
        price_override: variant.priceOverride || null,
        stock_available: variant.stockAvailable || 0,
        stock_incoming: variant.stockIncoming || 0,
        stock_reserved: variant.stockReserved || 0,
        is_active: variant.isActive !== false,
        sort_index: variant.sortIndex || null,
      }));
      
      const { error: variantError } = await client
        .from('product_variants')
        .insert(variantData);
      
      if (variantError) {
        console.error('Variant error:', variantError);
        // Don't fail the whole operation for variant errors
      } else {
        console.log('Variants created successfully');
      }
    }
    
    return NextResponse.json({
      success: true,
      product: created,
      message: 'Product created successfully'
    }, { status: 201 });
    
  } catch (error) {
    console.error('Product creation error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    console.log('=== PRODUCTS GET REQUEST ===');
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = searchParams.get('limit');
    const exclude = searchParams.get('exclude');
    
    console.log('Query params:', { category, limit, exclude });

    let query = supabase
      .from('products')
      .select('*')
      .order('id', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    if (limit) {
      query = query.limit(parseInt(limit));
    }

    if (exclude) {
      query = query.neq('id', exclude);
    }

    const { data: products, error } = await query;
    
    if (error) {
      console.error('Database error:', error);
      throw error;
    }
    
    console.log('Raw products from DB:', products?.length || 0, 'products found');
    
    // Transform products to camelCase for frontend
    const safeProducts = (Array.isArray(products) ? products : []).map((p: any) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      originalPrice: p.original_price,
      category: p.category,
      images: parseImagesField(p),
      image: p.image,
      description: p.description,
      stock: p.stock,
      isNew: p.is_new,
      onSale: p.on_sale,
      status: p.status,
      hasColorOptions: p.has_color_options,
      hasSizeOptions: p.has_size_options,
      colors: p.colors ? JSON.parse(p.colors) : [],
      sizes: p.sizes ? JSON.parse(p.sizes) : [],
      seoTitle: p.seo_title,
      seoDescription: p.seo_description,
      seoKeywords: p.seo_keywords,
      seoSlug: p.seo_slug,
      imageAltTexts: p.image_alt_texts ? JSON.parse(p.image_alt_texts) : [],
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    }));
    
    console.log('Processed products:', safeProducts.length);
    console.log('Products by category:', safeProducts.reduce((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>));
    
    return NextResponse.json(safeProducts);
  } catch (error) {
    console.error('Products fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products', details: String(error) },
      { status: 500 }
    );
  }
}

function parseImagesField(product: any) {
  const images = product?.images
    ? Array.isArray(product.images)
      ? product.images
      : JSON.parse(product.images || '[]')
    : [];
  
  return images.length > 0 ? images : [product?.image || 'https://via.placeholder.com/400x400'];
}
