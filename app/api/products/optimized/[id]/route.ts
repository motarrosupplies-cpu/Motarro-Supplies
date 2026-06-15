import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabaseClient';
import { z } from 'zod';
import {
  normalizeSupabaseUrl,
  normalizeSupabaseUrls,
  resolveAvailability,
  sanitizeAvailability,
  sanitizeCondition,
  normalizeAvailabilityDate,
} from '@/lib/utils';
import { generateProductSlug } from '@/lib/product-slug-utils';

// Fixed validation schema that properly handles nullable arrays
const productUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  sku: z.string().optional().nullable(),
  price: z.number().min(0, 'Price must be >= 0'),
  originalPrice: z.number().optional().nullable(),
  category: z.string().min(1, 'Category is required'),
  subcategory: z.string().optional().nullable(),
  images: z.array(z.string()).min(1, 'At least one image is required'),
  imageAltTexts: z.array(z.string().nullable()).optional().nullable().default([]),
  description: z.string().min(1, 'Description is required'),
  stock: z.number().min(0, 'Stock must be >= 0'),
  isNew: z.boolean().default(true),
  onSale: z.boolean().default(false),
  status: z.enum(['active', 'disabled']).default('active'),
  hasColorOptions: z.boolean().default(false),
  hasSizeOptions: z.boolean().default(false),
  colors: z.array(z.object({
    name: z.string(),
    value: z.string()
  })).optional().nullable(),
  sizes: z.array(z.string()).optional().nullable(),
  variants: z.array(z.any()).optional().nullable(),
  details: z.object({
    material: z.string().optional(),
    fit: z.string().optional(),
    care: z.string().optional(),
    origin: z.string().optional(),
  }).optional().nullable(),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  seoKeywords: z.string().optional().nullable(),
  seoSlug: z.string().optional().nullable(),
  availability: z.enum(['in_stock', 'out_of_stock', 'preorder', 'backorder_soon']).optional().nullable(),
  availabilityDate: z.string().optional().nullable(),
  condition: z.enum(['new', 'refurbished', 'used']).optional().nullable(),
  lowStockThreshold: z.number().int().min(0).max(100000).optional().nullable(),
}).superRefine((data, ctx) => {
  if (
    (data.availability === 'preorder' || data.availability === 'backorder_soon') &&
    (!data.availabilityDate || normalizeAvailabilityDate(data.availabilityDate) === null)
  ) {
    ctx.addIssue({
      path: ['availabilityDate'],
      code: z.ZodIssueCode.custom,
      message: 'Availability date is required when product is in preorder or available soon status.',
    });
  }
});

// PUT endpoint for updating products - Works with current products table
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    
    console.log('=== FIXED PRODUCT UPDATE (CURRENT TABLE) ===');
    console.log('Product ID:', id);
    console.log('Request body:', JSON.stringify(body, null, 2));

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'SUPABASE_SERVICE_ROLE_KEY is required for product updates.' },
        { status: 500 }
      );
    }
    const client = supabaseAdmin;

    // Validate input with proper error handling
    let data: any;
    try {
      data = productUpdateSchema.parse(body);
      console.log('✅ Validation passed:', data);
      data.images = normalizeSupabaseUrls(data.images, 'product-images');
      data.imageAltTexts = Array.isArray(data.imageAltTexts)
        ? data.imageAltTexts.filter(
            (alt: unknown) =>
              typeof alt === 'string' && alt.trim().length > 0,
          )
        : [];
    } catch (validationError) {
      console.error('❌ Validation failed:', validationError);
      if (validationError instanceof z.ZodError) {
        const friendlyErrors = validationError.errors.map(error => ({
          field: error.path.join('.'),
          message: error.message,
          received: (error as any).received || 'undefined'
        }));
        
        return NextResponse.json({ 
          error: 'Validation error', 
          message: 'Please check the following fields:',
          details: friendlyErrors,
          receivedData: body
        }, { status: 400 });
      }
      throw validationError;
    }

    // CRITICAL: Determine TARGET product type from REQUEST DATA (not existing product)
    const hasColors = data.hasColorOptions && data.colors && data.colors.length > 0;
    const hasSizes = data.hasSizeOptions && data.sizes && data.sizes.length > 0;
    
    let targetType: string;
    if (hasColors && hasSizes) {
      targetType = 'full_variant';
    } else if (hasColors) {
      targetType = 'color_only';
    } else if (hasSizes) {
      targetType = 'size_only';
    } else {
      targetType = 'simple';
    }
    
    console.log('=== PRODUCT TYPE DETERMINATION ===');
    console.log('Target type (from request):', targetType);
    console.log('Has colors:', hasColors, 'Has sizes:', hasSizes);
    console.log('Colors count:', data.colors?.length || 0);
    console.log('Sizes count:', data.sizes?.length || 0);
    console.log('Variants count:', data.variants?.length || 0);

    // Find existing product and its current type
    let existingProduct: any = null;
    let existingType: string | null = null;
    
    const tables = [
      { table: 'simple_products', type: 'simple' },
      { table: 'color_only_products', type: 'color_only' },
      { table: 'size_only_products', type: 'size_only' },
      { table: 'full_variant_products', type: 'full_variant' }
    ];

    for (const { table, type } of tables) {
      const { data: productData, error } = await client
        .from(table)
        .select('*')
        .eq('id', id)
        .single();

      if (!error && productData) {
        existingProduct = productData;
        existingType = type;
        console.log(`Found existing product in ${table} with type ${type}`);
        break;
      }
    }

    if (!existingProduct) {
      console.error('Product not found in any optimized table');
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Common update data (applies to all product types)
    // NOTE: SKU column may not exist in all optimized tables, so we'll add it conditionally
    const availability = sanitizeAvailability(data.availability, data.stock);
    const condition = sanitizeCondition(data.condition);
    const availabilityDate =
      availability === 'preorder' || availability === 'backorder_soon'
        ? normalizeAvailabilityDate(data.availabilityDate)
        : null;
    const existingLowStock =
      typeof existingProduct.low_stock_threshold === 'number' && !Number.isNaN(existingProduct.low_stock_threshold)
        ? existingProduct.low_stock_threshold
        : 5;
    const lowStockThreshold =
      typeof data.lowStockThreshold === 'number' && !Number.isNaN(data.lowStockThreshold)
        ? data.lowStockThreshold
        : existingLowStock;

    // Auto-generate SEO slug if not provided
    let seoSlug = data.seoSlug;
    if (!seoSlug || seoSlug.trim() === '') {
      seoSlug = generateProductSlug(
        data.name,
        data.category || '',
        params.id,
        true // include location
      );
    }

    // Normalize status to lowercase so all_products_unified view (WHERE status = 'active') matches
    const rawStatus = (data.status ?? 'active').toString().toLowerCase().trim();
    const normalizedStatus = rawStatus === 'disabled' ? 'disabled' : 'active';
    const commonData: any = {
      name: data.name,
      description: data.description,
      price: data.price,
      original_price: data.originalPrice || null,
      category: (data.category || '').toLowerCase().trim(),
      subcategory: data.subcategory ? (data.subcategory || '').toLowerCase().trim() : null,
      is_new: data.isNew ?? true,
      on_sale: data.onSale ?? false,
      status: normalizedStatus,
      image: data.images?.[0] || '',
      images: data.images ? JSON.stringify(data.images) : '[]',
      image_alt_texts: data.imageAltTexts ? JSON.stringify(data.imageAltTexts) : null,
      seo_title: data.seoTitle || null,
      seo_description: data.seoDescription || null,
      seo_keywords: data.seoKeywords || null,
      seo_slug: seoSlug,
      availability,
      availability_date: availabilityDate,
      condition,
      low_stock_threshold: lowStockThreshold,
      updated_at: new Date().toISOString(),
    };
    
    // Add SKU only if provided (some tables may not have this column, but we'll try)
    // If the table doesn't have SKU, the insert will fail and we'll handle it
    if (data.sku !== null && data.sku !== undefined && data.sku !== '') {
      commonData.sku = data.sku;
    }

    // Handle product type migration or update
    if (existingType !== targetType) {
      console.log(`🔄 MIGRATION REQUIRED: ${existingType} → ${targetType}`);
      
      // CRITICAL: Don't delete old data until new data is successfully inserted
      // This prevents "Product not found" errors if migration fails
      
      // Prepare insert data for new table
      const newTableMap: Record<string, string> = {
        'simple': 'simple_products',
        'color_only': 'color_only_products',
        'size_only': 'size_only_products',
        'full_variant': 'full_variant_products'
      };
      
      let insertData: any = { 
        ...commonData, 
        id: existingProduct.id, 
        created_at: existingProduct.created_at 
      };
      
      // Remove SKU temporarily - we'll add it back only if insert succeeds
      // This avoids errors if SKU column doesn't exist in target table
      const skuValue = insertData.sku;
      delete insertData.sku;
      
      if (targetType === 'simple') {
        // Simple products: use stock field
        insertData.stock = data.stock || 0;
      } else {
        // Variant products: calculate total_stock from variants
        const totalStock = data.variants?.reduce((sum: number, v: any) => sum + (Number(v.stockAvailable) || 0), 0) || data.stock || 0;
        insertData.total_stock = totalStock;
        
        if (targetType === 'color_only') {
          insertData.colors = data.colors ? JSON.stringify(data.colors) : '[]';
        } else if (targetType === 'size_only') {
          insertData.sizes = data.sizes ? JSON.stringify(data.sizes) : '[]';
        } else if (targetType === 'full_variant') {
          insertData.colors = data.colors ? JSON.stringify(data.colors) : '[]';
          insertData.sizes = data.sizes ? JSON.stringify(data.sizes) : '[]';
        }
      }
      
      // Try to insert SKU - if it fails, retry without it
      let insertWithSku = skuValue ? { ...insertData, sku: skuValue } : insertData;
      
      let insertResult = await client
        .from(newTableMap[targetType])
        .insert(insertWithSku)
        .select()
        .single();
      
      // If insert failed due to SKU column, retry without SKU
      if (insertResult.error && insertResult.error.message?.includes('sku')) {
        console.warn('⚠️ SKU column not found in target table, retrying without SKU');
        insertResult = await client
          .from(newTableMap[targetType])
          .insert(insertData)
          .select()
          .single();
      }
      
      if (insertResult.error) {
        console.error('❌ Migration insert error:', insertResult.error);
        console.error('❌ Failed to insert product into', newTableMap[targetType]);
        // CRITICAL: Don't delete old product if insert failed
        return NextResponse.json({ 
          error: 'Failed to migrate product', 
          details: insertResult.error.message,
          message: 'Product migration failed. Original product data preserved.'
        }, { status: 500 });
      }
      
      // CRITICAL: Verify the insert actually succeeded
      if (!insertResult.data || !insertResult.data.id) {
        console.error('❌ Insert appeared to succeed but no data returned');
        return NextResponse.json({ 
          error: 'Migration insert verification failed', 
          details: 'Product was not successfully inserted',
          message: 'Product migration failed. Original product data preserved.'
        }, { status: 500 });
      }
      
      console.log(`✅ Product successfully inserted into ${newTableMap[targetType]} with ID: ${insertResult.data.id}`);
      
      // Verify the product exists before deleting old data
      const { data: verifyProduct, error: verifyError } = await client
        .from(newTableMap[targetType])
        .select('id, name')
        .eq('id', id)
        .single();
      
      if (verifyError || !verifyProduct) {
        console.error('❌ Verification failed: Product not found after insert');
        return NextResponse.json({ 
          error: 'Migration verification failed', 
          details: 'Product was inserted but cannot be verified',
          message: 'Product migration failed. Original product data preserved.'
        }, { status: 500 });
      }
      
      console.log(`✅ Verified product exists in ${newTableMap[targetType]}`);
      
      // NOW safe to delete old data (product successfully inserted AND verified)
      
      // Delete variants from old variant table
      let oldVariantTable: string | null = null;
      switch (existingType) {
        case 'color_only':
          oldVariantTable = 'color_variants';
          break;
        case 'size_only':
          oldVariantTable = 'size_variants';
          break;
        case 'full_variant':
          oldVariantTable = 'full_variants';
          break;
      }
      
      if (oldVariantTable) {
        await client.from(oldVariantTable).delete().eq('product_id', id);
        console.log(`Deleted variants from old table: ${oldVariantTable}`);
      }
      
      // Delete product from old table
      const oldTableMap: Record<string, string> = {
        'simple': 'simple_products',
        'color_only': 'color_only_products',
        'size_only': 'size_only_products',
        'full_variant': 'full_variant_products'
      };
      
      await client.from(oldTableMap[existingType!]).delete().eq('id', id);
      console.log(`Deleted product from old table: ${oldTableMap[existingType!]}`);
      
      // Insert variants into new variant table
      if (data.variants && data.variants.length > 0 && targetType !== 'simple') {
        let newVariantTable: string;
        switch (targetType) {
          case 'color_only':
            newVariantTable = 'color_variants';
            break;
          case 'size_only':
            newVariantTable = 'size_variants';
            break;
          case 'full_variant':
            newVariantTable = 'full_variants';
            break;
          default:
            newVariantTable = '';
        }
        
        if (newVariantTable) {
          let variantData: any[];
          if (targetType === 'color_only') {
            variantData = data.variants.map((v: any, i: number) => ({
              product_id: id,
              color_name: v.colorName || null,
              color_value: v.colorValue || null,
              stock_available: Number(v.stockAvailable) || 0,
              stock_incoming: Number(v.stockIncoming) || 0,
              stock_reserved: Number(v.stockReserved) || 0,
              price_override: v.priceOverride ? Number(v.priceOverride) : null,
              is_active: v.isActive !== false,
              sort_index: i + 1,
            }));
          } else if (targetType === 'size_only') {
            variantData = data.variants.map((v: any, i: number) => ({
              product_id: id,
              size: v.size || null,
              stock_available: Number(v.stockAvailable) || 0,
              stock_incoming: Number(v.stockIncoming) || 0,
              stock_reserved: Number(v.stockReserved) || 0,
              price_override: v.priceOverride ? Number(v.priceOverride) : null,
              is_active: v.isActive !== false,
              sort_index: i + 1,
            }));
          } else {
            variantData = data.variants.map((v: any, i: number) => ({
              product_id: id,
              color_name: v.colorName || null,
              color_value: v.colorValue || null,
              size: v.size || null,
              stock_available: Number(v.stockAvailable) || 0,
              stock_incoming: Number(v.stockIncoming) || 0,
              stock_reserved: Number(v.stockReserved) || 0,
              price_override: v.priceOverride ? Number(v.priceOverride) : null,
              is_active: v.isActive !== false,
              sort_index: i + 1,
            }));
          }
          
          if (variantData.length > 0) {
            const { error: variantError } = await client
              .from(newVariantTable)
              .insert(variantData);
            
            if (variantError) {
              console.error('Variant insert error:', variantError);
            } else {
              console.log(`✅ Inserted ${variantData.length} variants into ${newVariantTable}`);
            }
          }
        }
      }
      
      return NextResponse.json({ 
        success: true, 
        product: insertResult.data,
        message: `Product migrated from ${existingType} to ${targetType}`
      });
      
    } else {
      // Same type - just update
      console.log(`✅ Same type update: ${targetType}`);
      
      let updateData = { ...commonData };
      
      // Remove SKU if it was added to commonData (handle it separately)
      const skuValue = updateData.sku;
      delete updateData.sku;
      
      if (targetType === 'simple') {
        // Simple products: use stock field
        updateData.stock = data.stock || 0;
      } else {
        // Variant products: calculate total_stock from variants
        const totalStock = data.variants?.reduce((sum: number, v: any) => sum + (Number(v.stockAvailable) || 0), 0) || data.stock || 0;
        updateData.total_stock = totalStock;
        
        if (targetType === 'color_only') {
          updateData.colors = data.colors ? JSON.stringify(data.colors) : '[]';
        } else if (targetType === 'size_only') {
          updateData.sizes = data.sizes ? JSON.stringify(data.sizes) : '[]';
        } else if (targetType === 'full_variant') {
          updateData.colors = data.colors ? JSON.stringify(data.colors) : '[]';
          updateData.sizes = data.sizes ? JSON.stringify(data.sizes) : '[]';
        }
      }
      
      // Try update with SKU first, then without if it fails
      let updateWithSku = skuValue ? { ...updateData, sku: skuValue } : updateData;
      
      let updateResult = await client
        .from(tables.find(t => t.type === targetType)!.table)
        .update(updateWithSku)
        .eq('id', id)
        .select()
        .single();
      
      // If update failed due to SKU column, retry without SKU
      if (updateResult.error && updateResult.error.message?.includes('sku')) {
        console.warn('⚠️ SKU column not found in table, retrying update without SKU');
        updateResult = await client
          .from(tables.find(t => t.type === targetType)!.table)
          .update(updateData)
          .eq('id', id)
          .select()
          .single();
      }
      
      const { data: updatedProduct, error: updateError } = updateResult;
      
      if (updateError) {
        console.error('Product update error:', updateError);
        return NextResponse.json({ 
          error: 'Failed to update product', 
          details: updateError.message 
        }, { status: 500 });
      }
      
      // Handle variants
      if (targetType !== 'simple' && data.variants && data.variants.length > 0) {
        let variantTable: string;
        switch (targetType) {
          case 'color_only':
            variantTable = 'color_variants';
            break;
          case 'size_only':
            variantTable = 'size_variants';
            break;
          case 'full_variant':
            variantTable = 'full_variants';
            break;
          default:
            variantTable = '';
        }
        
        if (variantTable) {
          // Delete existing variants
          await client.from(variantTable).delete().eq('product_id', id);
          
          // Insert new variants
          let variantData: any[];
          if (targetType === 'color_only') {
            variantData = data.variants.map((v: any, i: number) => ({
              product_id: id,
              color_name: v.colorName || null,
              color_value: v.colorValue || null,
              stock_available: Number(v.stockAvailable) || 0,
              stock_incoming: Number(v.stockIncoming) || 0,
              stock_reserved: Number(v.stockReserved) || 0,
              price_override: v.priceOverride ? Number(v.priceOverride) : null,
              is_active: v.isActive !== false,
              sort_index: i + 1,
            }));
          } else if (targetType === 'size_only') {
            variantData = data.variants.map((v: any, i: number) => ({
              product_id: id,
              size: v.size || null,
              stock_available: Number(v.stockAvailable) || 0,
              stock_incoming: Number(v.stockIncoming) || 0,
              stock_reserved: Number(v.stockReserved) || 0,
              price_override: v.priceOverride ? Number(v.priceOverride) : null,
              is_active: v.isActive !== false,
              sort_index: i + 1,
            }));
          } else {
            variantData = data.variants.map((v: any, i: number) => ({
              product_id: id,
              color_name: v.colorName || null,
              color_value: v.colorValue || null,
              size: v.size || null,
              stock_available: Number(v.stockAvailable) || 0,
              stock_incoming: Number(v.stockIncoming) || 0,
              stock_reserved: Number(v.stockReserved) || 0,
              price_override: v.priceOverride ? Number(v.priceOverride) : null,
              is_active: v.isActive !== false,
              sort_index: i + 1,
            }));
          }
          
          if (variantData.length > 0) {
            const { error: variantError } = await client
              .from(variantTable)
              .insert(variantData);
            
            if (variantError) {
              console.error('Variant update error:', variantError);
            } else {
              console.log(`✅ Updated ${variantData.length} variants in ${variantTable}`);
              
              // Recalculate total_stock after variant update
              const recalculatedTotalStock = variantData.reduce((sum, v) => sum + (Number(v.stock_available) || 0), 0);
              await client
                .from(tables.find(t => t.type === targetType)!.table)
                .update({ total_stock: recalculatedTotalStock })
                .eq('id', id);
              console.log(`✅ Recalculated total_stock: ${recalculatedTotalStock}`);
            }
          }
        }
      } else if (targetType === 'simple') {
        // For simple products, ensure no variants exist
        // Delete from all variant tables (safety measure)
        await Promise.all([
          client.from('color_variants').delete().eq('product_id', id),
          client.from('size_variants').delete().eq('product_id', id),
          client.from('full_variants').delete().eq('product_id', id),
        ]);
      }
      
      return NextResponse.json({ 
        success: true, 
        product: updatedProduct,
        message: 'Product updated successfully'
      });
    }

  } catch (error) {
    console.error('Unexpected error in product update:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET endpoint for individual products - Works with current products table
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const client = supabaseAdmin ?? supabase;
    if (!client) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    console.log('=== FETCHING PRODUCT FROM OPTIMIZED TABLES ===');
    console.log('Product Identifier (ID/Slug/SKU):', id);

    // Import UUID check utility
    const { isUUID } = await import('@/lib/product-slug-utils');
    const isId = isUUID(id);

    // Try to find product in any optimized table
    // Strategy: Try slug first (if not UUID), then ID, then SKU
    let product: any = null;
    let productType = 'simple';
    let variantTable = null;

    const tables = [
      { table: 'simple_products', type: 'simple', variantTable: null },
      { table: 'color_only_products', type: 'color_only', variantTable: 'color_variants' },
      { table: 'size_only_products', type: 'size_only', variantTable: 'size_variants' },
      { table: 'full_variant_products', type: 'full_variant', variantTable: 'full_variants' }
    ];

    // Strategy 1: Try slug lookup first (if not UUID)
    if (!isId) {
      console.log('Trying slug lookup...');
      for (const { table, type, variantTable: vt } of tables) {
        const { data, error } = await client
          .from(table)
          .select('*')
          .or(`slug.eq.${id},seo_slug.eq.${id}`)
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
          .eq('id', id)
          .eq('status', 'active')
          .maybeSingle();

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
          .eq('sku', id)
          .eq('status', 'active')
          .maybeSingle();

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
      console.error('Product not found in any optimized table (by ID or SKU)');
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Check if product is active - return 404 if inactive
    if (product.status !== 'active') {
      console.error('Product found but is not active:', product.id);
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    console.log('✅ Product found:', product.name);
    console.log('📦 Product type:', productType);

    // Fetch variants for this product if applicable
    // Use the actual product.id (not the id param which might be SKU)
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

    console.log(`✅ Found ${variants.length} variants`);

    // Helper function to safely parse JSON
    const parseJson = (value: any) => {
      if (!value) return [];
      if (Array.isArray(value)) return value;
      try {
        return JSON.parse(value);
      } catch {
        return [];
      }
    };

    const normalizedImages = normalizeSupabaseUrls(
      parseJson(product.images),
      'product-images',
    );
    const normalizedImageAltTexts = parseJson(product.image_alt_texts);
    const normalizedColors = parseJson(product.colors);
    const normalizedSizes = parseJson(product.sizes);

    // Calculate stock correctly based on product type
    let calculatedStock: number;
    if (productType === 'simple') {
      // Simple products: use stock field directly
      calculatedStock = Number(product.stock) || 0;
    } else {
      // Variant products: use total_stock if available, otherwise calculate from variants
      if (product.total_stock !== null && product.total_stock !== undefined) {
        calculatedStock = Number(product.total_stock);
      } else if (variants.length > 0) {
        // Calculate from variants
        calculatedStock = variants.reduce((sum, v) => sum + (Number(v.stock_available) || 0), 0);
      } else {
        calculatedStock = 0;
      }
    }
    
    // Transform product data to match frontend expectations
    const transformedProduct = {
      id: product.id,
      name: product.name,
      sku: product.sku || null,
      price: product.price,
      originalPrice: product.original_price,
      category: product.category,
      description: product.description,
      // Use calculated stock value
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
      // Handle individual detail fields
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

    console.log('✅ Product transformed successfully');
    console.log('🔍 Returning product with variants:', {
      productId: transformedProduct.id,
      sku: transformedProduct.sku,
      hasColorOptions: transformedProduct.hasColorOptions,
      hasSizeOptions: transformedProduct.hasSizeOptions,
      colorsCount: transformedProduct.colors?.length || 0,
      sizesCount: transformedProduct.sizes?.length || 0,
      variantsCount: transformedProduct.variants?.length || 0,
      variants: transformedProduct.variants
    });

    return NextResponse.json(transformedProduct);

  } catch (error) {
    console.error('Product fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

// DELETE endpoint for products - Works with optimized tables
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'SUPABASE_SERVICE_ROLE_KEY is required for product deletion.' },
        { status: 500 }
      );
    }
    const client = supabaseAdmin;

    console.log('=== DELETING PRODUCT FROM OPTIMIZED TABLES ===');
    console.log('Product ID:', id);

    // First, determine which table the product is in
    const { data: existingProduct, error: fetchError } = await client
      .from('all_products_unified')
      .select('product_type')
      .eq('id', id)
      .single();

    if (fetchError || !existingProduct) {
      console.error('Error fetching existing product:', fetchError);
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    console.log('Product type:', existingProduct.product_type);

    // Delete variants first based on product type
    let variantTable;
    switch (existingProduct.product_type) {
      case 'color_only':
        variantTable = 'color_variants';
        break;
      case 'size_only':
        variantTable = 'size_variants';
        break;
      case 'full_variant':
        variantTable = 'full_variants';
        break;
      default:
        variantTable = null;
    }

    if (variantTable) {
      const { error: variantDeleteError } = await client
        .from(variantTable)
        .delete()
        .eq('product_id', id);

      if (variantDeleteError) {
        console.error('Error deleting variants:', variantDeleteError);
      } else {
        console.log(`Deleted variants from ${variantTable}`);
      }
    }

    // Delete the product from the correct table
    let deleteQuery;
    switch (existingProduct.product_type) {
      case 'simple':
        deleteQuery = client.from('simple_products');
        break;
      case 'color_only':
        deleteQuery = client.from('color_only_products');
        break;
      case 'size_only':
        deleteQuery = client.from('size_only_products');
        break;
      case 'full_variant':
        deleteQuery = client.from('full_variant_products');
        break;
      default:
        return NextResponse.json({ error: 'Invalid product type' }, { status: 400 });
    }

    const { error: deleteError } = await deleteQuery
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Product delete error:', deleteError);
      return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
    }

    console.log('✅ Product deleted successfully from', existingProduct.product_type, 'table');

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
      deletedFrom: existingProduct.product_type
    });

  } catch (error) {
    console.error('Product deletion error:', error);
    return NextResponse.json({ 
      error: 'Failed to delete product',
      details: String(error)
    }, { status: 500 });
  }
}