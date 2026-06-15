import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabaseClient';
import { normalizeSupabaseUrl, normalizeSupabaseUrls } from '@/lib/utils';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!params.id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // FIXED: Search across all optimized tables
    // Use supabaseAdmin (service role) if available, otherwise fall back to regular supabase client
    const client = supabaseAdmin || supabase;
    
    // Try to find product in any optimized table
    let product: any = null;
    let productType = 'simple';
    let variantTable = null;

    const tables = [
      { table: 'simple_products', type: 'simple', variantTable: null },
      { table: 'color_only_products', type: 'color_only', variantTable: 'color_variants' },
      { table: 'size_only_products', type: 'size_only', variantTable: 'size_variants' },
      { table: 'full_variant_products', type: 'full_variant', variantTable: 'full_variants' }
    ];

    for (const { table, type, variantTable: vt } of tables) {
      const { data, error } = await client
        .from(table)
        .select('*')
        .eq('id', params.id)
        .single();

      if (!error && data) {
        product = data;
        productType = type;
        variantTable = vt;
        break;
      }
    }

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Fetch variants for this product if applicable
    let detailedVariants: any[] = [];
    if (variantTable) {
      const { data: variantData, error: vErr } = await client
        .from(variantTable)
        .select('*')
        .eq('product_id', params.id)
        .eq('is_active', true);
      
      if (!vErr && variantData) {
        detailedVariants = variantData;
      }
    }

    // Parse JSON fields safely
    const parseJson = (field: any) => {
      if (Array.isArray(field)) return field;
      if (typeof field === 'string') {
        try {
          const parsed = JSON.parse(field);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      }
      return [];
    };

    // Normalize image URLs
    const parsedImages = parseJson(product.images);
    const normalizedImages = normalizeSupabaseUrls(parsedImages, 'product-images');
    const normalizedImage = normalizeSupabaseUrl(product.image || normalizedImages[0] || '', 'product-images');

    // Transform data from optimized tables
    const transformedProduct = {
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.original_price,
      category: product.category,
      description: product.description,
      // FIXED: Use total_stock for variant products, stock for simple products
      stock: product.total_stock || product.stock || 0,
      isNew: product.is_new,
      onSale: product.on_sale,
      status: product.status,
      hasColorOptions: productType === 'color_only' || productType === 'full_variant',
      hasSizeOptions: productType === 'size_only' || productType === 'full_variant',
      image: normalizedImage,
      images: normalizedImages,
      colors: parseJson(product.colors),
      sizes: parseJson(product.sizes),
      imageAltTexts: parseJson(product.image_alt_texts),
      seoTitle: product.seo_title,
      seoDescription: product.seo_description,
      seoKeywords: product.seo_keywords,
      seoSlug: product.seo_slug,
      variants: detailedVariants.map(v => ({
        id: v.id,
        productId: v.product_id,
        colorName: v.color_name,
        colorValue: v.color_value,
        size: v.size,
        stockAvailable: v.stock_available,
        stockIncoming: v.stock_incoming,
        stockReserved: v.stock_reserved,
        priceOverride: v.price_override,
        isActive: v.is_active,
        sortIndex: v.sort_index,
      })),
      createdAt: product.created_at,
      updatedAt: product.updated_at,
    };

    return NextResponse.json(transformedProduct);
  } catch (error) {
    console.error('Product fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const body = await request.json();
    console.log('Product update request:', JSON.stringify(body, null, 2));

    const client = supabaseAdmin || supabase;

    // Basic validation
    if (!body.name || !body.price || !body.category || !body.description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Prepare database data
    const dbData = {
      name: body.name,
      price: parseFloat(body.price),
      original_price: body.originalPrice ? parseFloat(body.originalPrice) : null,
      category: body.category,
      description: body.description,
      stock: parseInt(body.stock) || 0,
      stock_quantity: parseInt(body.stock) || 0,
      is_new: body.isNew !== false,
      on_sale: body.onSale === true,
      status: body.status || 'active',
      has_color_options: body.hasColorOptions === true,
      has_size_options: body.hasSizeOptions === true,
      images: body.images ? JSON.stringify(body.images) : '[]',
      image: body.images?.[0] || '',
      image_alt_texts: body.imageAltTexts ? JSON.stringify(body.imageAltTexts) : null,
      colors: body.colors ? JSON.stringify(body.colors) : null,
      sizes: body.sizes ? JSON.stringify(body.sizes) : null,
      seo_title: body.seoTitle || null,
      seo_description: body.seoDescription || null,
      seo_keywords: body.seoKeywords || null,
      seo_slug: body.seoSlug || null,
    };

    console.log('Database data:', JSON.stringify(dbData, null, 2));

    // Forward to optimized endpoint which handles the new table structure
    console.log('=== PRODUCT UPDATE - REDIRECTING TO OPTIMIZED ENDPOINT ===');
    
    const optimizedResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/products/optimized/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    const data = await optimizedResponse.json();
    
    if (!optimizedResponse.ok) {
      return NextResponse.json(data, { status: optimizedResponse.status });
    }
    
    return NextResponse.json(data);

  } catch (error) {
    console.error('Product update error:', error);
    return NextResponse.json({
      error: 'Failed to update product',
      details: String(error)
    }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // Forward to optimized endpoint which handles deletion from all optimized tables
    console.log('=== PRODUCT DELETE - REDIRECTING TO OPTIMIZED ENDPOINT ===');
    
    const optimizedResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/products/optimized/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const data = await optimizedResponse.json();
    
    if (!optimizedResponse.ok) {
      return NextResponse.json(data, { status: optimizedResponse.status });
    }
    
    return NextResponse.json(data);

  } catch (error) {
    console.error('Product deletion error:', error);
    return NextResponse.json({ 
      error: 'Failed to delete product', 
      details: String(error) 
    }, { status: 500 });
  }
}