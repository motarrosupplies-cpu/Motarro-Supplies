import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabaseClient";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = supabaseAdmin ?? supabase;

    const { data: products, error } = await db
      .from('event_products')
      .select(`
        id,
        name,
        description,
        "basePrice",
        "imageUrl",
        "isActive",
        "createdAt",
        "updatedAt"
      `)
      .eq('eventId', id) // Fixed: using eventId (camelCase) as per Prisma schema
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('Error fetching event products:', error);
      return NextResponse.json(
        { error: 'Failed to fetch event products' },
        { status: 500 }
      );
    }

    // Get variants and additional items for each product
    const productsWithVariantsAndItems = await Promise.all(
      (products || []).map(async (product) => {
        // Get variants from the old system
        const { data: variants, error: variantError } = await db
          .from('event_product_variants')
          .select(`
            id,
            size,
            color,
            "additionalPrice",
            "isActive"
          `)
          .eq('productId', product.id);

        if (variantError) {
          console.error('Error fetching variants:', variantError);
        }

        // Get additional items from the new system
        const { data: additionalItems, error: itemsError } = await db
          .from('event_product_additional_items')
          .select(`
            id,
            name,
            description,
            price,
            category,
            "isActive",
            "createdAt",
            "updatedAt"
          `)
          .eq('productId', product.id);

        if (itemsError) {
          console.error('Error fetching additional items:', itemsError);
        }

        return {
          ...product,
          variants: variants || [],
          additionalItems: additionalItems || []
        };
      })
    );

    return NextResponse.json(productsWithVariantsAndItems, {
      headers: {
        'Cache-Control': 'private, no-store, max-age=0, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Error fetching event products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event products' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = supabaseAdmin ?? supabase;
    const body = await request.json();
    const { name, description, basePrice, imageUrl, variants } = body;

    console.log('Creating product with data:', { id, name, description, basePrice, imageUrl, variants });

    if (!name || !basePrice) {
      return NextResponse.json(
        { error: 'Name and base price are required' },
        { status: 400 }
      );
    }

    // Create the event product - using correct camelCase column names from Prisma schema
    const productData = {
      eventId: id, // Fixed: using eventId (camelCase) as per Prisma schema
      name,
      description: description || '',
      basePrice: parseFloat(basePrice), // Fixed: using basePrice (camelCase) as per Prisma schema
      imageUrl: imageUrl || null, // Fixed: using imageUrl (camelCase) as per Prisma schema
      isActive: true // Fixed: using isActive (camelCase) as per Prisma schema
    };

    console.log('Inserting product data:', productData);

    const { data: product, error } = await db
      .from('event_products')
      .insert(productData)
      .select()
      .single();

    if (error) {
      console.error('Error creating event product:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      return NextResponse.json(
        { error: `Failed to create event product: ${error.message}` },
        { status: 500 }
      );
    }

    console.log('Product created successfully:', product);

    // Create variants if provided - using correct camelCase column names from Prisma schema
    if (variants && variants.length > 0) {
      const variantData = variants.map((variant: any) => ({
        productId: product.id,
        size: variant.size,
        color: variant.color,
        additionalPrice: parseFloat(
          variant.additionalPrice != null ? String(variant.additionalPrice) : '0'
        ),
        isActive: variant.isActive !== false,
      }));

      console.log('Inserting variants data:', variantData);

      const { error: variantError } = await db
        .from('event_product_variants')
        .insert(variantData);

      if (variantError) {
        console.error('Error creating product variants:', variantError);
        console.error('Variant error details:', {
          code: variantError.code,
          message: variantError.message,
          details: variantError.details,
          hint: variantError.hint
        });
        // Note: We don't fail the entire request if variants fail, just log the error
      } else {
        console.log('Variants created successfully');
      }
    }

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Unexpected error creating event product:', error);
    return NextResponse.json(
      { error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
