import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabaseClient';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const client = supabaseAdmin || supabase;
    
    // Fetch product
    const { data: product, error } = await client
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Product fetch error:', error);
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Fetch variants
    const { data: variants, error: vErr } = await client
      .from('product_variants')
      .select('*')
      .eq('product_id', id)
      .order('sort_index', { ascending: true });

    if (vErr) {
      console.error('Variants fetch error:', vErr);
    }

    // Calculate total stock from variants
    const totalStock = (variants || [])
      .filter(v => v.is_active !== false)
      .reduce((sum, v) => sum + (v.stock_available || 0), 0);

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

    // Transform data
    const transformedProduct = {
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.original_price,
      category: product.category,
      description: product.description,
      stock: product.has_color_options || product.has_size_options ? totalStock : (product.stock || product.stock_quantity || 0),
      isNew: product.is_new,
      onSale: product.on_sale,
      status: product.status,
      hasColorOptions: product.has_color_options,
      hasSizeOptions: product.has_size_options,
      image: product.image,
      images: parseJson(product.images),
      colors: parseJson(product.colors),
      sizes: parseJson(product.sizes),
      imageAltTexts: parseJson(product.image_alt_texts),
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
    if (body.variants && Array.isArray(body.variants) && body.variants.length > 0) {
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
        const variantData = body.variants.map((variant: any, index: number) => ({
          product_id: id,
          color_name: variant.colorName || null,
          color_value: variant.colorValue || null,
          size: variant.size || null,
          stock_available: parseInt(variant.stockAvailable) || 0,
          stock_incoming: parseInt(variant.stockIncoming) || 0,
          stock_reserved: parseInt(variant.stockReserved) || 0,
          price_override: variant.priceOverride ? parseFloat(variant.priceOverride) : null,
          is_active: variant.isActive !== false,
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

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Product updated successfully',
      id: updatedProduct.id,
      name: updatedProduct.name,
      updatedAt: updatedProduct.updated_at,
    });

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
