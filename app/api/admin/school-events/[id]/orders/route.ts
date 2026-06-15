import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabaseClient";

const num = (v: unknown) => {
  if (v == null) return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = supabaseAdmin ?? supabase;

    const { data: ordersRaw, error } = await db
      .from("school_event_orders")
      .select(
        `
        id,
        order_number,
        parent_name,
        parent_email,
        parent_phone,
        school_name,
        grade,
        class_name,
        total_amount,
        status,
        payment_status,
        created_at
      `
      )
      .eq("event_id", id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching event orders:", error);
      return NextResponse.json(
        { error: "Failed to fetch event orders" },
        { status: 500 }
      );
    }

    const ordersWithItems = await Promise.all(
      (ordersRaw || []).map(async (o: Record<string, unknown>) => {
        const orderId = o.id as string;

        const { data: itemsRaw, error: itemsError } = await db
          .from("school_event_order_items")
          .select(
            `
            id,
            product_id,
            variant_id,
            child_name,
            child_age,
            quantity,
            unit_price,
            total_price,
            special_instructions
          `
          )
          .eq("order_id", orderId);

        if (itemsError) {
          console.error("Error fetching order items:", itemsError);
        }

        const itemsWithProductNames = await Promise.all(
          (itemsRaw || []).map(async (item: Record<string, unknown>) => {
            const productId = item.product_id as string;
            const variantId = item.variant_id as string | null;

            const { data: product } = await db
              .from("event_products")
              .select("name")
              .eq("id", productId)
              .single();

            let variantDetails: string | undefined;
            if (variantId) {
              const { data: variant } = await db
                .from("event_product_variants")
                .select("size, color")
                .eq("id", variantId)
                .single();

              if (variant?.size != null || variant?.color != null) {
                variantDetails = `${variant.size ?? ""} - ${variant.color ?? ""}`.trim();
              }
            }

            return {
              id: item.id as string,
              productName: product?.name || "Unknown Product",
              variantDetails,
              childName: (item.child_name as string) || "",
              childAge:
                item.child_age != null ? Number(item.child_age) : undefined,
              quantity: num(item.quantity),
              unitPrice: num(item.unit_price),
              totalPrice: num(item.total_price),
              specialInstructions:
                (item.special_instructions as string) || undefined,
            };
          })
        );

        return {
          id: orderId,
          orderNumber: o.order_number as string,
          parentName: o.parent_name as string,
          parentEmail: o.parent_email as string,
          parentPhone: o.parent_phone as string,
          schoolName: o.school_name as string,
          grade: (o.grade as string) || undefined,
          className: (o.class_name as string) || undefined,
          totalAmount: num(o.total_amount),
          status: o.status as string,
          paymentStatus: o.payment_status as string,
          createdAt: o.created_at as string,
          items: itemsWithProductNames,
        };
      })
    );

    return NextResponse.json(ordersWithItems, {
      headers: {
        "Cache-Control": "private, no-store, max-age=0, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Error fetching event orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch event orders" },
      { status: 500 }
    );
  }
}
