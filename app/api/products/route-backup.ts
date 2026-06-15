import { NextResponse } from 'next/server';
import { z } from 'zod';
import { supabase, supabaseAdmin } from '@/lib/supabaseClient';

const colorOptionSchema = z.object({
  name: z.string(),
  value: z.string(),
});

const variantSchema = z.object({
  id: z.string().uuid().optional(),
  productId: z.string().uuid().optional(),
  colorName: z.string().nullable().optional(),
  colorValue: z.string().nullable().optional(),
  size: z.string().nullable().optional(),
  sku: z.string().nullable().optional(),
  priceOverride: z.number().nullable().optional(),
  stockAvailable: z.number().min(0),
  stockIncoming: z.number().min(0),
  stockReserved: z.number().min(0),
  isActive: z.boolean().default(true),
  sortIndex: z.number().nullable().optional(),
});

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  price: z.number().min(0, 'Price is required'),
  originalPrice: z.number().optional(),
  category: z.enum(['men', 'women', 'accessories', 'unisex', 'custom printing']), // FIXED: Use lowercase
  images: z.array(z.string()).min(1, 'At least one image is required'),
  imageAltTexts: z.array(z.string()).optional(), // Alt text for each image
  description: z.string().min(1, 'Description is required'),
  stock: z.number().min(0, 'Stock is required'),
  isNew: z.boolean().default(true),
  onSale: z.boolean().default(false),
  status: z.enum(['active', 'disabled']).default('active'),
  hasColorOptions: z.boolean().default(false),
  hasSizeOptions: z.boolean().default(false),
  colors: z.array(colorOptionSchema).optional(),
  sizes: z.array(z.string()).optional(),
  variants: z.array(variantSchema).optional(),
  // SEO Fields
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.string().optional(),
  seoSlug: z.string().optional(),
});

function parseImagesField(product: any) {
  const images = product?.images

  if (typeof images === 'string') {
    try {
      const parsed = JSON.parse(images)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }

  if (Array.isArray(images)) {
    return images.filter(Boolean).map(String)
  }

  // For null/undefined or any unexpected type, return an empty array
  return []
}

function parseColorsField(p: any) {
  const colors = p?.colors
  if (typeof colors === 'string') {
    try {
      const parsed = JSON.parse(colors)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }
  return Array.isArray(colors) ? colors : []
}

function parseDetailsField(p: any) {
  const details = p?.details
  if (!details) return null
  if (typeof details === 'string') {
    try { return JSON.parse(details) } catch { return null }
  }
  if (typeof details === 'object') return details
  return null
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

    if (exclude) {
      query = query.neq('id', exclude);
    }

    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const { data: products, error } = await query;
    if (error) throw error;
    
    console.log('Raw products from DB:', products?.length || 0, 'products found');

    // Fetch variant aggregates for all products in one shot
    const ids = (products || []).map((p: any) => p.id);
    let aggregateMap: Record<string, { available: number; incoming: number; reserved: number }> = {};
    if (ids.length > 0) {
      const { data: aggregates, error: aggErr } = await supabase
        .from('product_variants')
        .select('product_id, stock_available, stock_incoming, stock_reserved, is_active, size')
        .in('product_id', ids);
      if (aggErr) throw aggErr;
      // Only include active size variants in totals
      for (const row of aggregates || []) {
        if (row.is_active === false) continue;
        if (row.size === null) continue; // ignore placeholder rows
        const key = row.product_id as string;
        if (!aggregateMap[key]) aggregateMap[key] = { available: 0, incoming: 0, reserved: 0 };
        aggregateMap[key].available += (row.stock_available as number) || 0;
        aggregateMap[key].incoming += (row.stock_incoming as number) || 0;
        aggregateMap[key].reserved += (row.stock_reserved as number) || 0;
      }
    }

    const safeProducts = (products || []).map(p => {
      const agg = aggregateMap[p.id] || { available: 0, incoming: 0, reserved: 0 };
      // If product does not use sizes (legacy/no variants), fall back to its stock column
      const computedStock = agg.available > 0
        ? agg.available
        : (p.has_size_options ? 0 : (Number(p.stock) || 0));
      return {
        ...p,
        stock: computedStock,
        stockAggregateIncoming: agg.incoming,
        stockAggregateReserved: agg.reserved,
        images: parseImagesField(p),
        image: parseImagesField(p)[0] || '',
        imageAltTexts: p.image_alt_texts ? JSON.parse(p.image_alt_texts) : [],
        colors: parseColorsField(p),
        details: parseDetailsField(p),
        hasColorOptions: p.has_color_options ?? false,
        hasSizeOptions: p.has_size_options ?? false,
        isNew: p.is_new ?? false,
        onSale: p.on_sale ?? false,
        seoTitle: p.seo_title,
        seoDescription: p.seo_description,
        seoKeywords: p.seo_keywords,
        seoSlug: p.seo_slug,
      };
    });

    return NextResponse.json(safeProducts);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch products', details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    console.log('=== PRODUCT CREATION DEBUG ===');
    const body = await request.json();
    console.log('Request body:', JSON.stringify(body, null, 2));
    
    const validatedData = productSchema.parse(body);
    console.log('Validated data:', JSON.stringify(validatedData, null, 2));

    // Remove camelCase fields
    const {
      hasColorOptions,
      hasSizeOptions,
      onSale,
      isNew,
      originalPrice,
      variants,
      imageAltTexts,
      seoTitle,
      seoDescription,
      seoKeywords,
      seoSlug,
      ...rest
    } = validatedData;

    // Compose only snake_case fields for DB
    const dbData = {
      ...rest,
      image: validatedData.images[0],
      has_color_options: hasColorOptions,
      has_size_options: hasSizeOptions,
      on_sale: onSale,
      is_new: isNew,
      original_price: originalPrice,
      image_alt_texts: imageAltTexts ? JSON.stringify(imageAltTexts) : null,
      seo_title: seoTitle,
      seo_description: seoDescription,
      seo_keywords: seoKeywords,
      seo_slug: seoSlug,
    };

    console.log('Database data to insert:', JSON.stringify(dbData, null, 2));

    const client = supabaseAdmin || supabase;
    console.log('Using client:', supabaseAdmin ? 'supabaseAdmin' : 'supabase');
    console.log('supabaseAdmin available:', !!supabaseAdmin);
    
    const { data: created, error } = await client
      .from('products')
      .insert([dbData])
      .select()
      .single();
      
    if (error) {
      console.error("Supabase error creating product:", error)
      console.error("Error details:", JSON.stringify(error, null, 2));
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      console.error("Error hint:", error.hint);
      throw error;
    }

    // Insert variants if provided
    if (variants && variants.length > 0) {
      const rows = variants.map(v => ({
        product_id: created.id,
        color_name: v.colorName ?? null,
        color_value: v.colorValue ?? null,
        size: v.size ?? null,
        sku: v.sku ?? null,
        price_override: v.priceOverride ?? null,
        stock_available: v.stockAvailable,
        stock_incoming: v.stockIncoming,
        stock_reserved: v.stockReserved,
        is_active: v.isActive,
        sort_index: v.sortIndex ?? null,
      }));
      
      const { error: vErr } = await client.from('product_variants').insert(rows);
      if (vErr) {
        console.error("Error inserting variants:", vErr)
        throw vErr;
      }
    }

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('Product creation error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid product data' },
        { status: 400 }
      );
    }
    
    // Check for specific database errors
    if (error && typeof error === 'object' && 'message' in error) {
      const errorMessage = error.message as string
      console.error('Database error message:', errorMessage)
      
      // Don't expose internal error details to client
      return NextResponse.json(
        { error: 'Failed to create product', details: (error as any).details ?? errorMessage, code: (error as any).code },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
} 