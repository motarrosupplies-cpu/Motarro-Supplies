import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabaseClient';
import { z } from 'zod';

// COMPREHENSIVE VALIDATION SCHEMAS
const colorOptionSchema = z.object({
  name: z.string().min(1, 'Color name is required'),
  value: z.string().min(1, 'Color value is required'),
});

const variantSchema = z.object({
  id: z.string().optional(),
  colorName: z.string().nullable(),
  colorValue: z.string().nullable(),
  size: z.string().nullable(),
  stockAvailable: z.number().min(0),
  stockIncoming: z.number().min(0),
  stockReserved: z.number().min(0),
  priceOverride: z.number().nullable(),
  isActive: z.boolean().default(true),
  sortIndex: z.number().optional(),
});

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  price: z.number().min(0, 'Price is required'),
  originalPrice: z.number().optional(),
  category: z.enum(['men', 'women', 'accessories', 'unisex', 'custom printing']),
  description: z.string().min(1, 'Description is required'),
  stock: z.number().min(0, 'Stock is required'),
  isNew: z.boolean().default(true),
  onSale: z.boolean().default(false),
  status: z.enum(['active', 'disabled']).default('active'),
  hasColorOptions: z.boolean().default(false),
  hasSizeOptions: z.boolean().default(false),
  colors: z.array(colorOptionSchema).optional(),
  sizes: z.array(z.string()).optional(),
  images: z.array(z.string()).min(1, 'At least one image is required'),
  imageAltTexts: z.array(z.string().optional()).optional().nullable(),
  variants: z.array(variantSchema).optional(),
  details: z.object({
    material: z.string().optional(),
    fit: z.string().optional(),
    care: z.string().optional(),
    origin: z.string().optional(),
  }).optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.string().optional(),
  seoSlug: z.string().optional(),
});

// UTILITY FUNCTIONS
function parseJsonField(field: any): any[] {
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
}

function createUniqueSlug(name: string, id: string): string {
  const slug = name.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
  return `${slug}-${id.substring(0, 8)}`;
}

// MAIN PRODUCTS API
export async function GET(request: Request) {
  try {
    console.log('=== COMPREHENSIVE PRODUCTS API (OPTIMIZED) ===');
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory');
    const limit = searchParams.get('limit');
    const exclude = searchParams.get('exclude');
    
    const client = supabaseAdmin || supabase;
    
    // FIXED: Fetch from all_products_unified view instead of old products table
    let query = client
      .from('all_products_unified')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (category) {
      query = query.eq('category', category.toLowerCase().trim());
    }
    
    if (subcategory) {
      // Normalize subcategory for matching
      const normalizedSubcategory = subcategory.toLowerCase().trim().replace(/\s+/g, '-');
      query = query.eq('subcategory', normalizedSubcategory);
    }
    
    if (exclude) {
      query = query.neq('id', exclude);
    }
    
    if (limit) {
      query = query.limit(parseInt(limit));
    }
    
    const { data: products, error } = await query;
    
    if (error) {
      console.error('Products fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
    
    // Transform products from unified view
    const transformedProducts = (products || []).map((p: any) => {
      // Helper to parse JSON fields
      const parseJson = (field: any) => {
        if (!field) return [];
        if (Array.isArray(field)) return field;
        try {
          return JSON.parse(field);
        } catch {
          return [];
        }
      };
      
      return {
        id: p.id,
        name: p.name,
        sku: p.sku || null,
        price: p.price,
        originalPrice: p.original_price,
        category: p.category,
        description: p.description,
        // FIXED: Use total_stock from unified view
        stock: p.total_stock || 0,
        isNew: p.is_new,
        onSale: p.on_sale,
        status: p.status,
        image: p.image,
        images: parseJson(p.images),
        hasColorOptions: p.product_type === 'color_only' || p.product_type === 'full_variant',
        hasSizeOptions: p.product_type === 'size_only' || p.product_type === 'full_variant',
        colors: parseJson(p.colors),
        sizes: parseJson(p.sizes),
        imageAltTexts: parseJson(p.image_alt_texts),
        seoTitle: p.seo_title,
        seoDescription: p.seo_description,
        seoKeywords: p.seo_keywords,
        seoSlug: p.seo_slug || p.slug,
        slug: p.slug || p.seo_slug,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      };
    });
    
    return NextResponse.json({
      products: transformedProducts,
      timestamp: new Date().toISOString(),
      count: transformedProducts.length
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
    
  } catch (error) {
    console.error('Products API error:', error);
    return NextResponse.json({ error: 'API error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    console.log('=== PRODUCT CREATION - REDIRECTING TO OPTIMIZED ENDPOINT ===');
    
    const body = await request.json();
    
    // Forward to optimized endpoint which handles the new table structure
    const optimizedResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/products/optimized`, {
      method: 'POST',
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
    console.error('Product creation error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Invalid product data',
        validationErrors: error.errors
      }, { status: 400 });
    }
    
    return NextResponse.json({
      error: 'Failed to create product',
      details: String(error)
    }, { status: 500 });
  }
}
