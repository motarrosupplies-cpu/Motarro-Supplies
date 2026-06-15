import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabaseClient';
import { z } from 'zod';

// Simplified validation schema
const productUpdateSchema = z.object({
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
  colors: z.array(z.object({
    name: z.string(),
    value: z.string()
  })).optional(),
  sizes: z.array(z.string()).optional(),
  images: z.array(z.string()).min(1, 'At least one image is required'),
  imageAltTexts: z.array(z.string()).optional(),
  variants: z.array(z.object({
    id: z.string().optional(),
    colorName: z.string().nullable(),
    colorValue: z.string().nullable(),
    size: z.string().nullable(),
    stockAvailable: z.number().min(0),
    stockIncoming: z.number().min(0),
    stockReserved: z.number().min(0),
    priceOverride: z.number().nullable(),
    isActive: z.boolean().default(true),
  })).optional(),
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // Fetch product
    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching product:', error);
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Fetch variants
    const { data: variants, error: vErr } = await supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', id)
      .order('sort_index', { ascending: true });

    if (vErr) {
      console.error('Error fetching variants:', vErr);
      // Don't fail, just log the error
    }

    // Transform data
    const transformedProduct = {
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.original_price,
      category: product.category,
      description: product.description,
      stock: product.stock || product.stock_quantity || 0,
      isNew: product.is_new,
      onSale: product.on_sale,
      status: product.status,
      hasColorOptions: product.has_color_options,
      hasSizeOptions: product.has_size_options,
      image: product.image,
      images: product.images ? (Array.isArray(product.images) ? product.images : JSON.parse(product.images)) : [product.image].filter(Boolean),
      colors: product.colors ? (Array.isArray(product.colors) ? product.colors : JSON.parse(product.colors)) : [],
      sizes: product.sizes ? (Array.isArray(product.sizes) ? product.sizes : JSON.parse(product.sizes)) : [],
      imageAltTexts: product.image_alt_texts ? (Array.isArray(product.image_alt_texts) ? product.image_alt_texts : JSON.parse(product.image_alt_texts)) : [],
      seoTitle: product.seo_title,
      seoDescription: product.seo_description,
      seoKeywords: product.seo_keywords,
      seoSlug: product.seo_slug,
      variants: (variants || []).map(v => ({
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

    // Validate the request
    const validatedData = productUpdateSchema.parse(body);
    console.log('Validated data:', JSON.stringify(validatedData, null, 2));

    // Prepare database data
    const dbData = {
      name: validatedData.name,
      price: validatedData.price,
      original_price: validatedData.originalPrice,
      category: validatedData.category,
      description: validatedData.description,
      stock: validatedData.stock,
      stock_quantity: validatedData.stock, // Keep both for compatibility
      is_new: validatedData.isNew,
      on_sale: validatedData.onSale,
      status: validatedData.status,
      has_color_options: validatedData.hasColorOptions,
      has_size_options: validatedData.hasSizeOptions,
      images: JSON.stringify(validatedData.images),
      image: validatedData.images[0],
      image_alt_texts: validatedData.imageAltTexts ? JSON.stringify(validatedData.imageAltTexts) : null,
      colors: validatedData.colors ? JSON.stringify(validatedData.colors) : null,
      sizes: validatedData.sizes ? JSON.stringify(validatedData.sizes) : null,
    };

    console.log('Database data:', JSON.stringify(dbData, null, 2));

    // Use admin client for better permissions
    const client = supabaseAdmin || supabase;

    // Update the product
    const { data: updatedProduct, error: updateError } = await client
      .from('products')
      .update(dbData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating product:', updateError);
      return NextResponse.json({ 
        error: 'Failed to update product', 
        details: updateError.message 
      }, { status: 500 });
    }

    console.log('Product updated successfully:', updatedProduct);

    // Handle variants if provided
    if (validatedData.variants && validatedData.variants.length > 0) {
      console.log('Updating variants...');
      
      try {
        // Delete existing variants
        const { error: deleteError } = await client
          .from('product_variants')
          .delete()
          .eq('product_id', id);

        if (deleteError) {
          console.error('Error deleting existing variants:', deleteError);
        } else {
          console.log('Existing variants deleted');
        }

        // Insert new variants
        const variantData = validatedData.variants.map((variant, index) => ({
          product_id: id,
          color_name: variant.colorName,
          color_value: variant.colorValue,
          size: variant.size,
          stock_available: variant.stockAvailable,
          stock_incoming: variant.stockIncoming,
          stock_reserved: variant.stockReserved,
          price_override: variant.priceOverride,
          is_active: variant.isActive,
          sort_index: index + 1,
        }));

        const { error: insertError } = await client
          .from('product_variants')
          .insert(variantData);

        if (insertError) {
          console.error('Error inserting variants:', insertError);
          return NextResponse.json({ 
            error: 'Failed to update variants', 
            details: insertError.message 
          }, { status: 500 });
        }

        console.log(`Inserted ${variantData.length} variants`);
      } catch (variantError) {
        console.error('Error handling variants:', variantError);
        return NextResponse.json({ 
          error: 'Failed to update variants', 
          details: String(variantError) 
        }, { status: 500 });
      }
    }

    // Return the updated product
    return NextResponse.json({
      id: updatedProduct.id,
      name: updatedProduct.name,
      price: updatedProduct.price,
      originalPrice: updatedProduct.original_price,
      category: updatedProduct.category,
      description: updatedProduct.description,
      stock: updatedProduct.stock,
      isNew: updatedProduct.is_new,
      onSale: updatedProduct.on_sale,
      status: updatedProduct.status,
      hasColorOptions: updatedProduct.has_color_options,
      hasSizeOptions: updatedProduct.has_size_options,
      image: updatedProduct.image,
      images: updatedProduct.images ? JSON.parse(updatedProduct.images) : [updatedProduct.image],
      colors: updatedProduct.colors ? JSON.parse(updatedProduct.colors) : [],
      sizes: updatedProduct.sizes ? JSON.parse(updatedProduct.sizes) : [],
      imageAltTexts: updatedProduct.image_alt_texts ? JSON.parse(updatedProduct.image_alt_texts) : [],
      seoTitle: updatedProduct.seo_title,
      seoDescription: updatedProduct.seo_description,
      seoKeywords: updatedProduct.seo_keywords,
      seoSlug: updatedProduct.seo_slug,
      updatedAt: updatedProduct.updated_at,
    });

  } catch (error) {
    console.error('Product update error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Invalid product data',
        validationErrors: error.errors
      }, { status: 400 });
    }
    
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

    // Use admin client for deletion
    const client = supabaseAdmin || supabase;

    // Delete variants first
    const { error: variantsError } = await client
      .from('product_variants')
      .delete()
      .eq('product_id', id);

    if (variantsError) {
      console.error('Error deleting variants:', variantsError);
    }

    // Delete the product
    const { error: deleteError } = await client
      .from('products')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting product:', deleteError);
      return NextResponse.json({ 
        error: 'Failed to delete product', 
        details: deleteError.message 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Product deleted successfully' 
    });

  } catch (error) {
    console.error('Product deletion error:', error);
    return NextResponse.json({ 
      error: 'Failed to delete product', 
      details: String(error) 
    }, { status: 500 });
  }
}
