// FIXED PRODUCT UPDATE API - Handles validation errors properly
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';
import { z } from 'zod';

// Fixed validation schema that properly handles nullable arrays
const productUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  price: z.number().min(0, 'Price must be >= 0'),
  originalPrice: z.number().optional().nullable(),
  category: z.string().min(1, 'Category is required'),
  images: z.array(z.string()).min(1, 'At least one image is required'),
  imageAltTexts: z.array(z.string().optional()).optional().nullable(),
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
});

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    
    console.log('=== FIXED PRODUCT UPDATE ===');
    console.log('Product ID:', id);
    console.log('Request body:', JSON.stringify(body, null, 2));

    const client = supabaseAdmin;
    if (!client) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    // Validate input with proper error handling
    let data: any;
    try {
      data = productUpdateSchema.parse(body);
      console.log('✅ Validation passed:', data);
    } catch (validationError) {
      console.error('❌ Validation failed:', validationError);
      if (validationError instanceof z.ZodError) {
        const friendlyErrors = validationError.errors.map(error => ({
          field: error.path.join('.'),
          message: error.message,
          received: error.received
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

    // Determine product type based on toggles
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

    // Prepare common data
    const commonData = {
      name: data.name,
      description: data.description,
      price: data.price,
      original_price: data.originalPrice || null,
      category: data.category.toLowerCase(),
      is_new: data.isNew ?? true,
      on_sale: data.onSale ?? false,
      status: data.status ?? 'active',
      image: data.images?.[0] || '',
      images: data.images ? JSON.stringify(data.images) : '[]',
      image_alt_texts: data.imageAltTexts ? JSON.stringify(data.imageAltTexts) : null,
      seo_title: data.seoTitle || null,
      seo_description: data.seoDescription || null,
      seo_keywords: data.seoKeywords || null,
      seo_slug: data.seoSlug || null,
    };

    // Handle different product types
    if (!hasColors && !hasSizes) {
      // SIMPLE PRODUCT - No variants
      console.log('Processing as SIMPLE product');
      
      const { data: updatedProduct, error } = await client
        .from('simple_products')
        .update({
          ...commonData,
          stock: data.stock,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Simple product update error:', error);
        return NextResponse.json({ error: 'Failed to update simple product' }, { status: 500 });
      }

      return NextResponse.json({ 
        success: true, 
        product: updatedProduct,
        type: 'simple'
      });

    } else if (hasColors && !hasSizes) {
      // COLOR ONLY PRODUCT
      console.log('Processing as COLOR ONLY product');
      
      const { data: updatedProduct, error } = await client
        .from('color_only_products')
        .update({
          ...commonData,
          total_stock: data.stock,
          colors: JSON.stringify(data.colors),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Color only product update error:', error);
        return NextResponse.json({ error: 'Failed to update color only product' }, { status: 500 });
      }

      return NextResponse.json({ 
        success: true, 
        product: updatedProduct,
        type: 'color_only'
      });

    } else if (!hasColors && hasSizes) {
      // SIZE ONLY PRODUCT
      console.log('Processing as SIZE ONLY product');
      
      const { data: updatedProduct, error } = await client
        .from('size_only_products')
        .update({
          ...commonData,
          total_stock: data.stock,
          sizes: JSON.stringify(data.sizes),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Size only product update error:', error);
        return NextResponse.json({ error: 'Failed to update size only product' }, { status: 500 });
      }

      return NextResponse.json({ 
        success: true, 
        product: updatedProduct,
        type: 'size_only'
      });

    } else {
      // FULL VARIANT PRODUCT
      console.log('Processing as FULL VARIANT product');
      
      const { data: updatedProduct, error } = await client
        .from('full_variant_products')
        .update({
          ...commonData,
          total_stock: data.stock,
          colors: JSON.stringify(data.colors),
          sizes: JSON.stringify(data.sizes),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Full variant product update error:', error);
        return NextResponse.json({ error: 'Failed to update full variant product' }, { status: 500 });
      }

      return NextResponse.json({ 
        success: true, 
        product: updatedProduct,
        type: 'full_variant'
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
