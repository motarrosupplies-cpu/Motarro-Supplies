// SIMPLIFIED PRODUCT UPDATE API
// This handles the basic logic correctly without overcomplicating things

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';
import { z } from 'zod';

// Simple, clear validation schema
const productUpdateSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().min(0),
  originalPrice: z.number().optional(),
  category: z.string(),
  stock: z.number().min(0), // This is the TOTAL stock
  isNew: z.boolean().optional(),
  onSale: z.boolean().optional(),
  status: z.enum(['active', 'disabled']).optional(),
  hasColorOptions: z.boolean(),
  hasSizeOptions: z.boolean(),
  images: z.array(z.string()).optional(),
  imageAltTexts: z.array(z.string()).optional().nullable(),
  colors: z.array(z.object({
    name: z.string(),
    value: z.string()
  })).optional().nullable(),
  sizes: z.array(z.string()).optional().nullable(),
  variants: z.array(z.object({
    colorName: z.string().nullable().optional(),
    colorValue: z.string().nullable().optional(),
    size: z.string().nullable().optional(),
    stockAvailable: z.number().optional(),
    stockIncoming: z.number().optional(),
    stockReserved: z.number().optional(),
    priceOverride: z.number().nullable().optional(),
    isActive: z.boolean().optional(),
  })).optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.string().optional(),
  seoSlug: z.string().optional(),
});

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    
    console.log('=== SIMPLIFIED PRODUCT UPDATE ===');
    console.log('Product ID:', id);
    console.log('Request body:', JSON.stringify(body, null, 2));

    const client = supabaseAdmin;
    if (!client) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    // Validate input
    const data = productUpdateSchema.parse(body);
    console.log('Validation passed:', data);

    // DETERMINE PRODUCT TYPE BASED ON TOGGLES
    const hasColors = data.hasColorOptions && data.colors && data.colors.length > 0;
    const hasSizes = data.hasSizeOptions && data.sizes && data.sizes.length > 0;
    
    console.log('Product type determination:', {
      hasColorOptions: data.hasColorOptions,
      hasSizeOptions: data.hasSizeOptions,
      hasColors,
      hasSizes,
      colorsCount: data.colors?.length || 0,
      sizesCount: data.sizes?.length || 0
    });

    // PREPARE COMMON DATA
    const commonData = {
      name: data.name,
      description: data.description,
      price: data.price,
      original_price: data.originalPrice,
      category: data.category.toLowerCase(),
      is_new: data.isNew ?? true,
      on_sale: data.onSale ?? false,
      status: data.status ?? 'active',
      image: data.images?.[0] || '',
      images: data.images ? JSON.stringify(data.images) : '[]',
      image_alt_texts: data.imageAltTexts ? JSON.stringify(data.imageAltTexts) : null,
      seo_title: data.seoTitle,
      seo_description: data.seoDescription,
      seo_keywords: data.seoKeywords,
      seo_slug: data.seoSlug,
    };

    // HANDLE DIFFERENT PRODUCT TYPES
    if (!hasColors && !hasSizes) {
      // SIMPLE PRODUCT - No variants, use stock directly
      console.log('Processing as SIMPLE product');
      
      const { data: updatedProduct, error } = await client
        .from('simple_products')
        .update({
          ...commonData,
          stock: data.stock, // Use the total stock directly
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Simple product update error:', error);
        return NextResponse.json({ error: 'Failed to update simple product' }, { status: 500 });
      }

      console.log('Simple product updated successfully');
      return NextResponse.json({
        success: true,
        message: 'Simple product updated successfully',
        productType: 'simple',
        id: updatedProduct.id
      });

    } else if (hasColors && !hasSizes) {
      // COLOR ONLY PRODUCT
      console.log('Processing as COLOR-ONLY product');
      
      const { data: updatedProduct, error } = await client
        .from('color_only_products')
        .update({
          ...commonData,
          total_stock: data.stock, // This is the total, variants will distribute it
          colors: data.colors ? JSON.stringify(data.colors) : '[]',
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Color-only product update error:', error);
        return NextResponse.json({ error: 'Failed to update color-only product' }, { status: 500 });
      }

      // UPDATE COLOR VARIANTS
      if (data.variants && data.variants.length > 0) {
        // Delete existing variants
        await client.from('color_variants').delete().eq('product_id', id);
        
        // Insert new variants
        const colorVariants = data.variants.map((variant, index) => ({
          product_id: id,
          color_name: variant.colorName,
          color_value: variant.colorValue,
          stock_available: variant.stockAvailable || 0,
          stock_incoming: variant.stockIncoming || 0,
          stock_reserved: variant.stockReserved || 0,
          price_override: variant.priceOverride,
          is_active: variant.isActive !== false,
          sort_index: index + 1,
        }));

        const { error: variantError } = await client
          .from('color_variants')
          .insert(colorVariants);

        if (variantError) {
          console.error('Color variants update error:', variantError);
        }
      }

      console.log('Color-only product updated successfully');
      return NextResponse.json({
        success: true,
        message: 'Color-only product updated successfully',
        productType: 'color_only',
        id: updatedProduct.id
      });

    } else if (!hasColors && hasSizes) {
      // SIZE ONLY PRODUCT
      console.log('Processing as SIZE-ONLY product');
      
      const { data: updatedProduct, error } = await client
        .from('size_only_products')
        .update({
          ...commonData,
          total_stock: data.stock,
          sizes: data.sizes ? JSON.stringify(data.sizes) : '[]',
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Size-only product update error:', error);
        return NextResponse.json({ error: 'Failed to update size-only product' }, { status: 500 });
      }

      // UPDATE SIZE VARIANTS
      if (data.variants && data.variants.length > 0) {
        // Delete existing variants
        await client.from('size_variants').delete().eq('product_id', id);
        
        // Insert new variants
        const sizeVariants = data.variants.map((variant, index) => ({
          product_id: id,
          size: variant.size,
          stock_available: variant.stockAvailable || 0,
          stock_incoming: variant.stockIncoming || 0,
          stock_reserved: variant.stockReserved || 0,
          price_override: variant.priceOverride,
          is_active: variant.isActive !== false,
          sort_index: index + 1,
        }));

        const { error: variantError } = await client
          .from('size_variants')
          .insert(sizeVariants);

        if (variantError) {
          console.error('Size variants update error:', variantError);
        }
      }

      console.log('Size-only product updated successfully');
      return NextResponse.json({
        success: true,
        message: 'Size-only product updated successfully',
        productType: 'size_only',
        id: updatedProduct.id
      });

    } else {
      // FULL VARIANT PRODUCT (both colors and sizes)
      console.log('Processing as FULL-VARIANT product');
      
      const { data: updatedProduct, error } = await client
        .from('full_variant_products')
        .update({
          ...commonData,
          total_stock: data.stock,
          colors: data.colors ? JSON.stringify(data.colors) : '[]',
          sizes: data.sizes ? JSON.stringify(data.sizes) : '[]',
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Full variant product update error:', error);
        return NextResponse.json({ error: 'Failed to update full variant product' }, { status: 500 });
      }

      // UPDATE FULL VARIANTS
      if (data.variants && data.variants.length > 0) {
        // Delete existing variants
        await client.from('full_variants').delete().eq('product_id', id);
        
        // Insert new variants
        const fullVariants = data.variants.map((variant, index) => ({
          product_id: id,
          color_name: variant.colorName,
          color_value: variant.colorValue,
          size: variant.size,
          stock_available: variant.stockAvailable || 0,
          stock_incoming: variant.stockIncoming || 0,
          stock_reserved: variant.stockReserved || 0,
          price_override: variant.priceOverride,
          is_active: variant.isActive !== false,
          sort_index: index + 1,
        }));

        const { error: variantError } = await client
          .from('full_variants')
          .insert(fullVariants);

        if (variantError) {
          console.error('Full variants update error:', variantError);
        }
      }

      console.log('Full variant product updated successfully');
      return NextResponse.json({
        success: true,
        message: 'Full variant product updated successfully',
        productType: 'full_variant',
        id: updatedProduct.id
      });
    }

  } catch (error) {
    console.error('Product update error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 });
    }
    return NextResponse.json({ 
      error: 'Failed to update product',
      details: String(error)
    }, { status: 500 });
  }
}
