import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabaseClient";

// GET - Fetch all additional items for a product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = supabaseAdmin ?? supabase;

    const { data: additionalItems, error } = await db
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
      .eq('productId', id)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching additional items:', error);
      return NextResponse.json(
        { error: 'Failed to fetch additional items' },
        { status: 500 }
      );
    }

    const itemsWithOptions = await Promise.all(
      (additionalItems || []).map(async (item) => {
        const { data: options, error: optionsError } = await db
          .from('event_product_additional_item_options')
          .select(`
            id,
            "optionName",
            "optionValue",
            "priceAdjustment",
            "isActive"
          `)
          .eq('additionalItemId', item.id)
          .order('optionName', { ascending: true });

        if (optionsError) {
          console.error('Error fetching options:', optionsError);
        }

        return {
          ...item,
          options: options || []
        };
      })
    );

    return NextResponse.json(itemsWithOptions);
  } catch (error) {
    console.error('Error fetching additional items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch additional items' },
      { status: 500 }
    );
  }
}

// POST - Create a new additional item
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = supabaseAdmin ?? supabase;
    const { name, description, price, category, options } = await request.json();

    if (!name || !price || !category) {
      return NextResponse.json(
        { error: 'Name, price, and category are required' },
        { status: 400 }
      );
    }

    const { data: additionalItem, error } = await db
      .from('event_product_additional_items')
      .insert({
        productId: id,
        name,
        description: description || '',
        price: parseFloat(price),
        category,
        isActive: true
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating additional item:', error);
      return NextResponse.json(
        { error: 'Failed to create additional item' },
        { status: 500 }
      );
    }

    if (options && options.length > 0) {
      const optionData = options.map((opt: any) => ({
        additionalItemId: additionalItem.id,
        optionName: opt.optionName,
        optionValue: opt.optionValue,
        priceAdjustment: parseFloat(opt.priceAdjustment || 0),
        isActive: true
      }));

      const { error: optionsError } = await db
        .from('event_product_additional_item_options')
        .insert(optionData);

      if (optionsError) {
        console.error('Error creating options:', optionsError);
      }
    }

    return NextResponse.json(additionalItem, { status: 201 });
  } catch (error) {
    console.error('Error creating additional item:', error);
    return NextResponse.json(
      { error: 'Failed to create additional item' },
      { status: 500 }
    );
  }
}
