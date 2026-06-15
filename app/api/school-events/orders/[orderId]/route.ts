import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import {
  normalizeSchoolEventOrderRow,
  normalizeSchoolEventOrderItemRow,
  SCHOOL_EVENT_ORDER_HEADER_SELECT,
  SCHOOL_EVENT_ORDER_ITEM_SELECT,
} from "@/lib/supabase/schoolEventDb";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;

    const { data: orderRow, error: orderError } = await supabase
      .from("school_event_orders")
      .select(SCHOOL_EVENT_ORDER_HEADER_SELECT)
      .eq("id", orderId)
      .single();

    if (orderError || !orderRow) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const order = normalizeSchoolEventOrderRow(orderRow as Record<string, unknown>);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const { data: event, error: eventError } = await supabase
      .from("school_events")
      .select("name")
      .eq("id", order.eventId)
      .single();

    if (eventError) {
      console.error("Error fetching event:", eventError);
    }

    const { data: itemsRaw, error: itemsError } = await supabase
      .from("school_event_order_items")
      .select(SCHOOL_EVENT_ORDER_ITEM_SELECT)
      .eq("order_id", orderId);

    if (itemsError) {
      console.error("Error fetching order items:", itemsError);
    }

    const items = (itemsRaw || []).map((r) =>
      normalizeSchoolEventOrderItemRow(r as Record<string, unknown>)
    );

    const itemsWithDetails = await Promise.all(
      items.map(async (item) => {
        const { data: product, error: productError } = await supabase
          .from("event_products")
          .select("name")
          .eq("id", item.productId)
          .single();

        if (productError) {
          console.error("Error fetching product:", productError);
        }

        let variantDetails: { size: string; color: string } | null = null;
        if (item.variantId) {
          const { data: variant, error: variantError } = await supabase
            .from("event_product_variants")
            .select("size, color")
            .eq("id", item.variantId)
            .single();

          if (!variantError && variant) {
            variantDetails = {
              size: variant.size as string,
              color: variant.color as string,
            };
          }
        }

        return {
          ...item,
          product: {
            name: product?.name || "Unknown Product",
          },
          variant: variantDetails,
        };
      })
    );

    return NextResponse.json({
      id: order.id,
      orderNumber: order.orderNumber,
      parentName: order.parentName,
      parentEmail: order.parentEmail,
      parentPhone: order.parentPhone,
      schoolName: order.schoolName,
      grade: order.grade,
      className: order.className,
      totalAmount: order.totalAmount,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      notes: order.notes,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      eventId: order.eventId,
      event: {
        name: (event as { name?: string } | null)?.name || "Unknown Event",
      },
      items: itemsWithDetails.map((item) => ({
        id: item.id,
        productId: item.productId,
        variantId: item.variantId,
        childName: item.childName,
        childAge: item.childAge,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        specialInstructions: item.specialInstructions,
        product: item.product,
        variant: item.variant,
      })),
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}
