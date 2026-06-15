import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabaseClient';

export async function GET() {
  try {
    console.log('=== SIMPLE PRODUCTS API ===');
    
    // Simple query to get products - FIXED TO INCLUDE BOTH STOCK COLUMNS
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, price, category, description, stock, stock_quantity, is_new, on_sale, status, image, images, original_price, has_color_options, has_size_options, colors, sizes, seo_title, seo_description, seo_keywords, seo_slug, image_alt_texts, created_at, updated_at')
      .order('id', { ascending: false });
    
    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({
        error: 'Database error',
        details: error.message
      }, { status: 500 });
    }
    
    console.log('Products found:', products?.length || 0);
    
    // Get variant stock totals for products with variants
    const productIds = products?.map(p => p.id) || [];
    let variantStockTotals: Record<string, number> = {};
    
    if (productIds.length > 0) {
      const { data: variants, error: variantError } = await supabase
        .from('product_variants')
        .select('product_id, stock_available, is_active')
        .in('product_id', productIds)
        .eq('is_active', true);
      
      if (!variantError && variants) {
        variantStockTotals = variants.reduce((acc, variant) => {
          const productId = variant.product_id;
          acc[productId] = (acc[productId] || 0) + (variant.stock_available || 0);
          return acc;
        }, {} as Record<string, number>);
      }
    }
    
    // Enhanced transformation with proper field mapping
    const transformedProducts = (products || []).map((p: any) => {
      // Calculate stock: use variant total if product has variants, otherwise use products table stock
      let calculatedStock = p.stock || p.stock_quantity || 0;
      
      if (p.has_color_options || p.has_size_options) {
        // For products with variants, use the sum of variant stock
        calculatedStock = variantStockTotals[p.id] || 0;
      }
      
      return {
        id: p.id,
        name: p.name,
        price: p.price,
        originalPrice: p.original_price,
        category: p.category,
        description: p.description,
        stock: calculatedStock,
        isNew: p.is_new,
        onSale: p.on_sale,
        status: p.status,
        image: p.image,
        images: p.images ? (Array.isArray(p.images) ? p.images : JSON.parse(p.images)) : [p.image].filter(Boolean),
        hasColorOptions: p.has_color_options,
        hasSizeOptions: p.has_size_options,
        colors: p.colors ? (Array.isArray(p.colors) ? p.colors : JSON.parse(p.colors)) : [],
        sizes: p.sizes ? (Array.isArray(p.sizes) ? p.sizes : JSON.parse(p.sizes)) : [],
        seoTitle: p.seo_title,
        seoDescription: p.seo_description,
        seoKeywords: p.seo_keywords,
        seoSlug: p.seo_slug,
        imageAltTexts: p.image_alt_texts ? (Array.isArray(p.image_alt_texts) ? p.image_alt_texts : JSON.parse(p.image_alt_texts)) : [],
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      };
    });
    
    console.log('Transformed products:', transformedProducts.length);
    
    // Add cache-busting headers to ensure fresh data
    const response = NextResponse.json({
      products: transformedProducts,
      timestamp: new Date().toISOString(),
      count: transformedProducts.length
    });
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');
    
    return response;
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({
      error: 'API error',
      details: String(error)
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    console.log('=== PRODUCT CREATION ===');
    
    const body = await request.json();
    console.log('Request body:', JSON.stringify(body, null, 2));
    
    // Basic validation
    if (!body.name || !body.price || !body.category || !body.description) {
      return NextResponse.json({
        error: 'Missing required fields: name, price, category, description'
      }, { status: 400 });
    }
    
    // Validate category - FIXED: Use lowercase categories
    const validCategories = ['men', 'women', 'accessories', 'unisex', 'custom printing'];
    const categoryToValidate = body.category?.toLowerCase();
    if (!validCategories.includes(categoryToValidate)) {
      return NextResponse.json({
        error: 'Invalid category'
      }, { status: 400 });
    }
    
    // Prepare data for database - FIXED COLUMN MAPPING
    const productData = {
      name: body.name,
      price: parseFloat(body.price),
      category: categoryToValidate, // Use lowercase category
      description: body.description,
      images: body.images || ['https://via.placeholder.com/400x400'],
      image: body.images?.[0] || 'https://via.placeholder.com/400x400',
      stock: parseInt(body.stock) || 0,  // FIXED: Use 'stock' not 'stock_quantity'
      stock_quantity: parseInt(body.stock) || 0,  // Keep both for compatibility
      status: 'active',
      is_new: body.isNew || true,
      on_sale: body.onSale || false,
      has_color_options: body.hasColorOptions || false,
      has_size_options: body.hasSizeOptions || false,
      original_price: body.originalPrice || null,
      // SEO fields
      seo_title: body.seoTitle || null,
      seo_description: body.seoDescription || null,
      seo_keywords: body.seoKeywords || null,
      seo_slug: body.seoSlug || null,
      image_alt_texts: body.imageAltTexts ? JSON.stringify(body.imageAltTexts) : null,
      // Additional fields
      colors: body.colors ? JSON.stringify(body.colors) : null,
      sizes: body.sizes ? JSON.stringify(body.sizes) : null,
    };
    
    console.log('Product data:', JSON.stringify(productData, null, 2));
    
    // Use admin client if available for better permissions
    const client = supabaseAdmin || supabase;
    console.log('Using client:', supabaseAdmin ? 'supabaseAdmin' : 'supabase');
    
    // Insert product
    const { data: created, error } = await client
      .from('products')
      .insert([productData])
      .select()
      .single();
    
    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({
        error: 'Failed to create product',
        details: error.message
      }, { status: 500 });
    }
    
    console.log('Product created:', created);
    
    // AUTOMATICALLY CREATE VARIANTS FOR NEW PRODUCTS
    if (created && (productData.has_color_options || productData.has_size_options)) {
      console.log('Creating variants for new product...');
      
      try {
        const variants = [];
        const colors = productData.colors ? JSON.parse(productData.colors) : [];
        const sizes = productData.sizes ? JSON.parse(productData.sizes) : [];
        
        // Determine color and size lists
        const colorList = productData.has_color_options && colors.length > 0 
          ? colors 
          : [{ name: "Default", value: "#000000" }];
        
        const sizeList = productData.has_size_options 
          ? ["XXS","XS","SML","MED","LAR","XL","2XL","3XL","4XL","5XL"]
          : [null];
        
        // Create variants for all combinations
        for (const color of colorList) {
          for (const size of sizeList) {
            variants.push({
              product_id: created.id,
              color_name: productData.has_color_options ? color.name : null,
              color_value: productData.has_color_options ? color.value : null,
              size: productData.has_size_options ? size : null,
              stock_available: productData.has_size_options 
                ? Math.max(0, Math.floor(productData.stock / sizeList.length))
                : (productData.has_color_options 
                    ? Math.max(0, Math.floor(productData.stock / colorList.length))
                    : productData.stock),
              stock_incoming: 0,
              stock_reserved: 0,
              is_active: true,
              sort_index: variants.length + 1
            });
          }
        }
        
        // Insert variants
        const { error: variantError } = await client
          .from('product_variants')
          .insert(variants);
        
        if (variantError) {
          console.error('Error creating variants:', variantError);
          // Don't fail the request, just log the error
        } else {
          console.log(`Created ${variants.length} variants for product ${created.id}`);
        }
        
      } catch (variantError) {
        console.error('Error in variant creation:', variantError);
        // Don't fail the request, just log the error
      }
    }
    
    // Return response with cache-busting headers
    const response = NextResponse.json({
      success: true,
      product: created,
      timestamp: new Date().toISOString()
    });
    
    // Add cache-busting headers
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
    
  } catch (error) {
    console.error('Product creation error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: String(error)
    }, { status: 500 });
  }
}