// Optimized Product API Structure
// This API uses the new optimized table structure for better performance

import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabaseClient';
import {
  normalizeSupabaseUrl,
  normalizeSupabaseUrls,
  resolveAvailability,
  sanitizeCondition,
  sanitizeAvailability,
  normalizeAvailabilityDate,
} from '@/lib/utils';
import { generateProductSlug } from '@/lib/product-slug-utils';

// Product type definitions
interface SimpleProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  stock: number;
  isNew: boolean;
  onSale: boolean;
  status: string;
  image: string;
  images: string[];
  imageAltTexts?: string[];
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  seoSlug?: string;
  createdAt: string;
  updatedAt: string;
  productType: 'simple';
}

interface ColorOnlyProduct extends Omit<SimpleProduct, 'stock' | 'productType'> {
  totalStock: number;
  colors: Array<{ name: string; value: string }>;
  productType: 'color_only';
}

interface SizeOnlyProduct extends Omit<SimpleProduct, 'stock' | 'productType'> {
  totalStock: number;
  sizes: string[];
  productType: 'size_only';
}

interface FullVariantProduct extends Omit<SimpleProduct, 'stock' | 'productType'> {
  totalStock: number;
  colors: Array<{ name: string; value: string }>;
  sizes: string[];
  productType: 'full_variant';
}

type OptimizedProduct = SimpleProduct | ColorOnlyProduct | SizeOnlyProduct | FullVariantProduct;

// GET /api/products/optimized - Fetch all products using optimized structure
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory');
    const onSale = searchParams.get('onSale');
    const isNew = searchParams.get('isNew');
    const limit = searchParams.get('limit');
    /** Single source of truth: filter=store (exclude custom printing) | filter=custom-printing (only custom printing) */
    const filter = searchParams.get('filter');
    
    const client = supabaseAdmin || supabase;
    
    // Build query for unified view
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
    
    // API-level filtering: no manual SQL needed for Products vs Custom-Products
    if (filter === 'store') {
      query = query.neq('category', 'custom printing');
    } else if (filter === 'custom-printing') {
      query = query.eq('category', 'custom printing');
    }
    
    if (onSale === 'true') {
      query = query.eq('on_sale', true);
    }
    
    if (isNew === 'true') {
      query = query.eq('is_new', true);
    }
    
    if (limit) {
      query = query.limit(parseInt(limit));
    }
    
    const { data: products, error } = await query;
    
    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
    
    const parseJsonArray = (value: any) => {
      if (!value) return [];
      if (Array.isArray(value)) return value;
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return value ? [value] : [];
        }
      }
      return [];
    };

    const transformedProducts = (products || []).map((p: any) => {
      const parsedImages = parseJsonArray(p.images);
      const normalizedImages = normalizeSupabaseUrls(parsedImages);
      const normalizedImage = normalizeSupabaseUrl(
        p.image || normalizedImages[0] || ''
      );
      const parsedAltTexts = parseJsonArray(p.image_alt_texts);
      const stockValue = Number(p.total_stock ?? p.stock ?? 0);
      const availability = resolveAvailability(p.availability, stockValue);
      const condition = sanitizeCondition(p.condition);
      const availabilityDate = p.availability_date ?? null;
      const lowStockThreshold =
        typeof p.low_stock_threshold === 'number' && !Number.isNaN(p.low_stock_threshold)
          ? p.low_stock_threshold
          : null;

      const baseProduct = {
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        originalPrice: p.original_price,
        category: p.category,
        isNew: p.is_new,
        onSale: p.on_sale,
        status: p.status,
        image: normalizedImage,
        images: normalizedImages,
        imageAltTexts: parsedAltTexts,
        seoTitle: p.seo_title,
        seoDescription: p.seo_description,
        seoKeywords: p.seo_keywords,
        seoSlug: p.seo_slug || p.slug,
        slug: p.slug || p.seo_slug,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
        availability,
        availabilityDate,
        condition,
        lowStockThreshold,
      };
      
      switch (p.product_type) {
        case 'simple':
          return {
            ...baseProduct,
            stock: stockValue,
            totalStock: stockValue,
            productType: 'simple' as const,
          };
          
        case 'color_only':
          return {
            ...baseProduct,
            stock: stockValue, // FIXED: Use 'stock' instead of 'totalStock'
            totalStock: stockValue,
            colors: p.colors ? (Array.isArray(p.colors) ? p.colors : JSON.parse(p.colors)) : [],
            productType: 'color_only' as const,
          };
          
        case 'size_only':
          return {
            ...baseProduct,
            stock: stockValue, // FIXED: Use 'stock' instead of 'totalStock'
            totalStock: stockValue,
            sizes: p.sizes ? (Array.isArray(p.sizes) ? p.sizes : JSON.parse(p.sizes)) : [],
            productType: 'size_only' as const,
          };
          
        case 'full_variant':
          return {
            ...baseProduct,
            stock: stockValue, // FIXED: Use 'stock' instead of 'totalStock'
            totalStock: stockValue,
            colors: p.colors ? (Array.isArray(p.colors) ? p.colors : JSON.parse(p.colors)) : [],
            sizes: p.sizes ? (Array.isArray(p.sizes) ? p.sizes : JSON.parse(p.sizes)) : [],
            productType: 'full_variant' as const,
          };
          
        default:
          return {
            ...baseProduct,
            stock: stockValue,
            totalStock: stockValue,
            productType: 'simple' as const,
          };
      }
    });
    
    return NextResponse.json({
      products: transformedProducts,
      count: transformedProducts.length,
      filters: {
        category,
        onSale: onSale === 'true',
        isNew: isNew === 'true',
        limit: limit ? parseInt(limit) : null,
      }
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
    
  } catch (error) {
    console.error('Products fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

// POST /api/products/optimized - Create new product using optimized structure
export async function POST(request: Request) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'SUPABASE_SERVICE_ROLE_KEY is required for product creation.' },
        { status: 500 }
      );
    }
    const body = await request.json();
    console.log('Product creation request:', JSON.stringify(body, null, 2));

    const client = supabaseAdmin;
    const hasColors = body.hasColorOptions && Array.isArray(body.colors) && body.colors.length > 0;
    const hasSizes = body.hasSizeOptions && Array.isArray(body.sizes) && body.sizes.length > 0;

    const rawVariants = Array.isArray(body.variants) ? body.variants : [];

    type NormalizedVariant = {
      colorName: string | null;
      colorValue: string | null;
      size: string | null;
      stockAvailable: number;
      stockIncoming: number;
      stockReserved: number;
      priceOverride: number | null;
      isActive: boolean;
      sortIndex: number;
    };

    const normalizedVariants: NormalizedVariant[] = rawVariants.map(
      (variant: any, index: number): NormalizedVariant => ({
      colorName: variant?.colorName ?? null,
      colorValue: variant?.colorValue ?? null,
      size: variant?.size ?? null,
      stockAvailable: Number(variant?.stockAvailable) || 0,
      stockIncoming: Number(variant?.stockIncoming) || 0,
      stockReserved: Number(variant?.stockReserved) || 0,
      priceOverride:
        variant?.priceOverride === null || variant?.priceOverride === undefined
          ? null
          : Number(variant.priceOverride),
      isActive: variant?.isActive !== false,
      sortIndex: typeof variant?.sortIndex === 'number' ? variant.sortIndex : index + 1,
      })
    );

    const totalStockFromVariants = normalizedVariants.reduce(
      (sum: number, variant: any) => sum + variant.stockAvailable,
      0
    );

    const fallbackStock = Number(body.stock) || 0;
    const totalStock =
      hasColors || hasSizes
        ? totalStockFromVariants > 0
          ? totalStockFromVariants
          : fallbackStock
        : fallbackStock;

    const availability = sanitizeAvailability(body.availability, totalStock);
    const condition = sanitizeCondition(body.condition);
    const availabilityDate =
      availability === 'preorder' || availability === 'backorder_soon'
        ? normalizeAvailabilityDate(body.availabilityDate)
        : null;
    const lowStockThreshold =
      typeof body.lowStockThreshold === 'number' && !Number.isNaN(body.lowStockThreshold)
        ? body.lowStockThreshold
        : null;

    // Auto-generate SEO slug if not provided
    let seoSlug = body.seoSlug;
    if (!seoSlug || seoSlug.trim() === '') {
      seoSlug = generateProductSlug(
        body.name,
        body.category || '',
        undefined, // productId not available yet, will update after creation if needed
        true // include location
      );
    }

    const baseProductData = {
      name: body.name,
      description: body.description,
      price: parseFloat(body.price),
      original_price: body.originalPrice ? parseFloat(body.originalPrice) : null,
      category: (body.category || '').toLowerCase(),
      subcategory: body.subcategory ? (body.subcategory || '').toLowerCase() : null,
      is_new: body.isNew !== false,
      on_sale: body.onSale === true,
      // CRITICAL FIX: Always set status to lowercase 'active' for frontend visibility
      // The all_products_unified view filters by WHERE status = 'active' (exact match required)
      status: 'active', // Force to 'active' - never use body.status to avoid case/typo issues
      image: body.images?.[0] || '',
      images: body.images ? JSON.stringify(body.images) : '[]',
      image_alt_texts: body.imageAltTexts ? JSON.stringify(body.imageAltTexts) : null,
      seo_title: body.seoTitle || null,
      seo_description: body.seoDescription || null,
      seo_keywords: body.seoKeywords || null,
      seo_slug: seoSlug,
      availability,
      availability_date: availabilityDate,
      condition,
      low_stock_threshold: lowStockThreshold ?? 5,
    };

    // Log status to help debug
    const productTypeLabel = `${hasColors ? 'color' : ''}${hasSizes ? 'size' : ''}${!hasColors && !hasSizes ? 'simple' : ''}`.trim() || 'simple';
    console.log(`📦 Creating ${productTypeLabel} product with status: '${baseProductData.status}', category: '${baseProductData.category}'`);

    const distributeStock = (count: number, stock: number) => {
      if (count <= 0) return [];
      const base = Math.floor(stock / count);
      const remainder = stock % count;
      return Array.from({ length: count }, (_, idx) => base + (idx < remainder ? 1 : 0));
    };

    let productId: string;
    let productType: string;

    if (!hasColors && !hasSizes) {
      productType = 'simple';
      const { data: product, error } = await client
        .from('simple_products')
        .insert({
          ...baseProductData,
          stock: totalStock,
        })
        .select()
        .single();

      if (error) throw error;
      productId = product.id;
    } else if (hasColors && !hasSizes) {
      productType = 'color_only';
      const { data: product, error } = await client
        .from('color_only_products')
        .insert({
          ...baseProductData,
          total_stock: totalStock,
          colors: JSON.stringify(body.colors),
        })
        .select()
        .single();

      if (error) throw error;
      productId = product.id;

      const colorList = Array.isArray(body.colors) ? body.colors : [];
      let variantsToInsert: any[];

      if (normalizedVariants.length > 0) {
        variantsToInsert = normalizedVariants.map((variant, index) => ({
          product_id: productId,
          color_name: variant.colorName ?? colorList[index]?.name ?? null,
          color_value: variant.colorValue ?? colorList[index]?.value ?? null,
          stock_available: variant.stockAvailable,
          stock_incoming: variant.stockIncoming,
          stock_reserved: variant.stockReserved,
          price_override: variant.priceOverride,
          is_active: variant.isActive,
          sort_index: variant.sortIndex ?? index + 1,
        }));
      } else {
        const stockSlices = distributeStock(colorList.length, totalStock);
        variantsToInsert = colorList.map((color: any, index: number) => ({
          product_id: productId,
          color_name: color.name,
          color_value: color.value,
          stock_available: stockSlices[index] ?? 0,
          stock_incoming: 0,
          stock_reserved: 0,
          price_override: null,
          is_active: true,
          sort_index: index + 1,
        }));
      }

      if (variantsToInsert.length > 0) {
        const { error: variantError } = await client
          .from('color_variants')
          .insert(variantsToInsert);
        if (variantError) {
          console.error('❌ Error creating color variants:', variantError);
          // Rollback: Delete the product if variant creation fails
          await client.from('color_only_products').delete().eq('id', productId);
          throw new Error(`Failed to create color variants: ${variantError.message}`);
        }
        console.log(`✅ Created ${variantsToInsert.length} color variants for product ${productId}`);
      }
    } else if (!hasColors && hasSizes) {
      productType = 'size_only';
      const { data: product, error } = await client
        .from('size_only_products')
        .insert({
          ...baseProductData,
          total_stock: totalStock,
          sizes: JSON.stringify(body.sizes),
        })
        .select()
        .single();

      if (error) throw error;
      productId = product.id;

      const sizeList = Array.isArray(body.sizes) ? body.sizes : [];
      let variantsToInsert: any[];

      if (normalizedVariants.length > 0) {
        variantsToInsert = normalizedVariants.map((variant, index) => ({
          product_id: productId,
          size: variant.size ?? sizeList[index] ?? null,
          stock_available: variant.stockAvailable,
          stock_incoming: variant.stockIncoming,
          stock_reserved: variant.stockReserved,
          price_override: variant.priceOverride,
          is_active: variant.isActive,
          sort_index: variant.sortIndex ?? index + 1,
        }));
      } else {
        const stockSlices = distributeStock(sizeList.length, totalStock);
        variantsToInsert = sizeList.map((size: string, index: number) => ({
          product_id: productId,
          size,
          stock_available: stockSlices[index] ?? 0,
          stock_incoming: 0,
          stock_reserved: 0,
          price_override: null,
          is_active: true,
          sort_index: index + 1,
        }));
      }

      if (variantsToInsert.length > 0) {
        const { error: variantError } = await client
          .from('size_variants')
          .insert(variantsToInsert);
        if (variantError) {
          console.error('❌ Error creating size variants:', variantError);
          // Rollback: Delete the product if variant creation fails
          await client.from('size_only_products').delete().eq('id', productId);
          throw new Error(`Failed to create size variants: ${variantError.message}`);
        }
        console.log(`✅ Created ${variantsToInsert.length} size variants for product ${productId}`);
      }
    } else {
      productType = 'full_variant';
      const { data: product, error } = await client
        .from('full_variant_products')
        .insert({
          ...baseProductData,
          total_stock: totalStock,
          colors: JSON.stringify(body.colors),
          sizes: JSON.stringify(body.sizes),
        })
        .select()
        .single();

      if (error) throw error;
      productId = product.id;

      const colorList = Array.isArray(body.colors) ? body.colors : [];
      const sizeList = Array.isArray(body.sizes) ? body.sizes : [];
      let variantsToInsert: any[] = [];

      if (normalizedVariants.length > 0) {
        variantsToInsert = normalizedVariants.map((variant, index) => ({
          product_id: productId,
          color_name: variant.colorName ?? null,
          color_value: variant.colorValue ?? null,
          size: variant.size ?? null,
          stock_available: variant.stockAvailable,
          stock_incoming: variant.stockIncoming,
          stock_reserved: variant.stockReserved,
          price_override: variant.priceOverride,
          is_active: variant.isActive,
          sort_index: variant.sortIndex ?? index + 1,
        }));
      } else if (colorList.length > 0 && sizeList.length > 0) {
        const comboCount = colorList.length * sizeList.length;
        const stockSlices = distributeStock(comboCount, totalStock);
        let sliceIndex = 0;

        for (const color of colorList) {
          for (const size of sizeList) {
            variantsToInsert.push({
              product_id: productId,
              color_name: color.name,
              color_value: color.value,
              size,
              stock_available: stockSlices[sliceIndex] ?? 0,
              stock_incoming: 0,
              stock_reserved: 0,
              price_override: null,
              is_active: true,
              sort_index: sliceIndex + 1,
            });
            sliceIndex += 1;
          }
        }
      }

      if (variantsToInsert.length > 0) {
        const { error: variantError } = await client
          .from('full_variants')
          .insert(variantsToInsert);
        if (variantError) {
          console.error('❌ Error creating full variants:', variantError);
          // Rollback: Delete the product if variant creation fails
          await client.from('full_variant_products').delete().eq('id', productId);
          throw new Error(`Failed to create full variants: ${variantError.message}`);
        }
        console.log(`✅ Created ${variantsToInsert.length} full variants for product ${productId}`);
      }
    }

    // CRITICAL: Verify product appears in unified view immediately after creation
    // This helps diagnose why products might not show on frontend
    // Retry verification up to 3 times with small delay to handle view refresh
    let verifyProduct: any = null;
    let verifyError: any = null;
    const maxRetries = 3;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const { data, error } = await client
        .from('all_products_unified')
        .select('id, name, status, category, product_type')
        .eq('id', productId)
        .single();
      
      if (!error && data) {
        verifyProduct = data;
        verifyError = null;
        break;
      }
      
      verifyError = error;
      
      // Wait 100ms before retry (except on last attempt)
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    if (verifyError || !verifyProduct) {
      console.error('❌ CRITICAL: Product created but NOT found in all_products_unified view!', {
        productId,
        error: verifyError,
        status: baseProductData.status,
        category: baseProductData.category,
        productType,
        attempts: maxRetries
      });
      // Don't fail the request, but log the issue for debugging
    } else {
      console.log('✅ Product verified in all_products_unified view:', {
        id: verifyProduct.id,
        name: verifyProduct.name,
        status: verifyProduct.status,
        category: verifyProduct.category,
        productType: verifyProduct.product_type
      });
      
      // Double-check status matches
      if (verifyProduct.status !== 'active') {
        console.error('⚠️ WARNING: Product status in view is not "active":', verifyProduct.status);
        // Attempt to fix the status
        try {
          const updateTable = productType === 'simple' ? 'simple_products' :
                            productType === 'color_only' ? 'color_only_products' :
                            productType === 'size_only' ? 'size_only_products' :
                            'full_variant_products';
          await client
            .from(updateTable)
            .update({ status: 'active' })
            .eq('id', productId);
          console.log('✅ Fixed product status to "active"');
        } catch (fixError) {
          console.error('❌ Failed to fix product status:', fixError);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Product created successfully',
      id: productId,
      productType,
      createdAt: new Date().toISOString(),
      verifiedInView: !!verifyProduct,
    });

  } catch (error: any) {
    console.error('❌ Product creation error:', error);
    console.error('Error details:', {
      message: error?.message,
      code: error?.code,
      hint: error?.hint,
      details: error?.details
    });
    
    // Return detailed error information for debugging
    return NextResponse.json({
      error: 'Failed to create product',
      details: error?.message || String(error),
      code: error?.code,
      hint: error?.hint
    }, { status: 500 });
  }
}
