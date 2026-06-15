import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

/**
 * Public school event + catalog. Column names must match Postgres (camelCase in this project).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: event, error: eventError } = await supabase
      .from("school_events")
      .select(
        `
        id,
        name,
        description,
        "startDate",
        "endDate",
        "isActive",
        "createdAt",
        "updatedAt"
      `
      )
      .eq("id", id)
      .eq("isActive", true)
      .single();

    if (eventError || !event) {
      console.error("Event not found or inactive:", eventError);
      return NextResponse.json(
        { error: "School event not found or inactive" },
        { status: 404 }
      );
    }

    const { data: products, error: productsError } = await supabase
      .from("event_products")
      .select(
        `
        id,
        name,
        description,
        "basePrice",
        "imageUrl",
        "isActive"
      `
      )
      .eq("eventId", id)
      .eq("isActive", true);

    if (productsError) {
      console.error("Error fetching products:", productsError);
    }

    const productsWithVariantsAndItems = await Promise.all(
      (products || []).map(async (product) => {
        const { data: variants, error: variantError } = await supabase
          .from("event_product_variants")
          .select(
            `
            id,
            size,
            color,
            "additionalPrice",
            "isActive"
          `
          )
          .eq("productId", product.id)
          .eq("isActive", true);

        if (variantError) {
          console.error("Error fetching variants:", product.id, variantError);
        }

        const { data: additionalItems, error: itemsError } = await supabase
          .from("event_product_additional_items")
          .select(
            `
            id,
            name,
            description,
            price,
            category,
            "isActive",
            "createdAt",
            "updatedAt"
          `
          )
          .eq("productId", product.id)
          .eq("isActive", true);

        if (itemsError) {
          console.error("Error fetching additional items:", product.id, itemsError);
        }

        const additionalItemsWithOptions = await Promise.all(
          (additionalItems || []).map(async (item) => {
            const { data: options, error: optionsError } = await supabase
              .from("event_product_additional_item_options")
              .select(
                `
                id,
                "optionName",
                "optionValue",
                "priceAdjustment",
                "isActive"
              `
              )
              .eq("additionalItemId", item.id)
              .eq("isActive", true);

            if (optionsError) {
              console.error("Error fetching options:", item.id, optionsError);
            }

            const price = Number(item.price ?? 0);

            return {
              id: item.id,
              name: item.name,
              description: item.description ?? "",
              basePrice: price,
              isRequired: false,
              maxQuantity: 99,
              isActive: item.isActive,
              options: (options || []).map((opt) => ({
                id: opt.id,
                optionName: opt.optionName,
                optionType: opt.optionName || "Option",
                priceAdjustment: Number(opt.priceAdjustment ?? 0),
                optionValue: opt.optionValue,
              })),
            };
          })
        );

        return {
          ...product,
          basePrice: Number(product.basePrice ?? 0),
          variants: (variants || []).map((v) => ({
            ...v,
            additionalPrice: Number(v.additionalPrice ?? 0),
          })),
          additionalItems: additionalItemsWithOptions,
        };
      })
    );

    const transformedEvent = {
      ...event,
      eventProducts: productsWithVariantsAndItems,
    };

    return NextResponse.json(transformedEvent, {
      headers: {
        "Cache-Control": "public, max-age=0, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Error fetching school event:", error);
    return NextResponse.json(
      { error: "Failed to fetch school event" },
      { status: 500 }
    );
  }
}
