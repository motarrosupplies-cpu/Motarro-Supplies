/**
 * Enhanced GET endpoint with slug support
 * This file shows the changes needed to support slug lookups
 * The actual route.ts file should be updated with these changes
 */

import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabaseClient';
import { isUUID } from '@/lib/product-slug-utils';
import {
  normalizeSupabaseUrl,
  normalizeSupabaseUrls,
  resolveAvailability,
  sanitizeCondition,
} from '@/lib/utils';

// This is the enhanced GET function that supports both slug and ID
// Add this to your existing route.ts file

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const identifier = params.id;
    
    if (!identifier) {
      return NextResponse.json({ error: 'Product identifier is required' }, { status: 400 });
    }

    const client = supabaseAdmin ?? supabase;
    if (!client) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    console.log('=== FETCHING PRODUCT (Slug/ID Support) ===');
    console.log('Identifier:', identifier);
    console.log('Is UUID:', isUUID(identifier));

    let product: any = null;
    let productType = 'simple';
    let variantTable = null;

    const tables = [
      { table: 'simple_products', type: 'simple', variantTable: null },
      { table: 'color_only_products', type: 'color_only', variantTable: 'color_variants' },
      { table: 'size_only_products', type: 'size_only', variantTable: 'size_variants' },
      { table: 'full_variant_products', type: 'full_variant', variantTable: 'full_variants' }
    ];

    // Determine lookup strategy
    const isId = isUUID(identifier);

    // Strategy 1: Try slug lookup first (if not UUID)
    if (!isId) {
      console.log('Trying slug lookup...');
      for (const { table, type, variantTable: vt } of tables) {
        const { data, error } = await client
          .from(table)
          .select('*')
          .or(`slug.eq.${identifier},seo_slug.eq.${identifier}`)
          .eq('status', 'active')
          .maybeSingle();

        if (!error && data) {
          product = data;
          productType = type;
          variantTable = vt;
          console.log(`✅ Product found in ${table} by slug`);
          break;
        }
      }
    }

    // Strategy 2: Try ID lookup (if UUID or slug lookup failed)
    if (!product) {
      console.log('Trying ID lookup...');
      for (const { table, type, variantTable: vt } of tables) {
        const { data, error } = await client
          .from(table)
          .select('*')
          .eq('id', identifier)
          .eq('status', 'active')
          .single();

        if (!error && data) {
          product = data;
          productType = type;
          variantTable = vt;
          console.log(`✅ Product found in ${table} by ID`);
          break;
        }
      }
    }

    // Strategy 3: Try SKU lookup as last resort
    if (!product) {
      console.log('Trying SKU lookup...');
      for (const { table, type, variantTable: vt } of tables) {
        const { data, error } = await client
          .from(table)
          .select('*')
          .eq('sku', identifier)
          .eq('status', 'active')
          .single();

        if (!error && data) {
          product = data;
          productType = type;
          variantTable = vt;
          console.log(`✅ Product found in ${table} by SKU`);
          break;
        }
      }
    }

    if (!product) {
      console.error('Product not found by slug, ID, or SKU');
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (product.status !== 'active') {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Fetch variants if applicable
    let variants: any[] = [];
    if (variantTable) {
      const { data: variantData, error: variantError } = await client
        .from(variantTable)
        .select('*')
        .eq('product_id', product.id)
        .eq('is_active', true)
        .order('sort_index');
      
      if (!variantError && variantData) {
        variants = variantData;
      }
    }

    // Parse JSON fields
    const parseJson = (value: any) => {
      if (!value) return [];
      if (Array.isArray(value)) return value;
      try {
        return JSON.parse(value);
      } catch {
        return [];
      }
    };

    const normalizedImages = normalizeSupabaseUrls(parseJson(product.images), 'product-images');
    const normalizedImageAltTexts = parseJson(product.image_alt_texts);
    const normalizedColors = parseJson(product.colors);
    const normalizedSizes = parseJson(product.sizes);

    // Calculate stock
    let calculatedStock: number;
    if (productType === 'simple') {
      calculatedStock = Number(product.stock) || 0;
    } else {
      if (product.total_stock !== null && product.total_stock !== undefined) {
        calculatedStock = Number(product.total_stock);
      } else if (variants.length > 0) {
        calculatedStock = variants.reduce((sum, v) => sum + (Number(v.stock_available) || 0), 0);
      } else {
        calculatedStock = 0;
      }
    }

    // Transform product data
    const transformedProduct = {
      id: product.id,
      name: product.name,
      sku: product.sku || null,
      price: product.price,
      originalPrice: product.original_price,
      category: product.category,
      description: product.description,
      stock: calculatedStock,
      totalStock: calculatedStock,
      isNew: product.is_new,
      onSale: product.on_sale,
      status: product.status,
      hasColorOptions: productType === 'color_only' || productType === 'full_variant',
      hasSizeOptions: productType === 'size_only' || productType === 'full_variant',
      image: normalizeSupabaseUrl(product.image || normalizedImages[0] || ''),
      images: normalizedImages,
      imageAltTexts: normalizedImageAltTexts,
      colors: normalizedColors,
      sizes: normalizedSizes,
      availability: resolveAvailability(product.availability, calculatedStock),
      availabilityDate: product.availability_date ?? null,
      condition: sanitizeCondition(product.condition),
      lowStockThreshold: typeof product.low_stock_threshold === 'number' && !Number.isNaN(product.low_stock_threshold)
        ? product.low_stock_threshold
        : null,
      details: {
        material: product.material || '',
        fit: product.fit || '',
        care: product.care || '',
        origin: product.origin || '',
      },
      seoTitle: product.seo_title,
      seoDescription: product.seo_description,
      seoKeywords: product.seo_keywords,
      seoSlug: product.seo_slug || product.slug,
      slug: product.slug || product.seo_slug,
      variants: variants.map(v => ({
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

