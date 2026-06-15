import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import {
  notifySchoolEventOrderStatusChange,
  ensureSchoolEventInvoiceOnCompleted,
} from "@/lib/services/schoolEventOrderAutomation";

const WORKFLOW_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "IN_PRODUCTION",
  "READY_FOR_PICKUP",
  "COMPLETED",
  "CANCELLED",
] as const;

const PAYMENT_STATUSES = ["PENDING", "PAID", "FAILED", "REFUNDED"] as const;

const ORDER_HEADER_SELECT = `
  id,
  order_number,
  event_id,
  parent_name,
  parent_email,
  parent_phone,
  school_name,
  grade,
  class_name,
  total_amount,
  status,
  payment_status,
  payment_method,
  notes,
  created_at,
  updated_at
`;

const num = (v: unknown) => {
  if (v == null) return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

function mapOrderHeader(row: Record<string, unknown>) {
  return {
    id: row.id as string,
    orderNumber: row.order_number as string,
    eventId: row.event_id as string,
    parentName: row.parent_name as string,
    parentEmail: row.parent_email as string,
    parentPhone: row.parent_phone as string,
    schoolName: row.school_name as string,
    grade: (row.grade as string) || undefined,
    className: (row.class_name as string) || undefined,
    totalAmount: num(row.total_amount),
    status: row.status as string,
    paymentStatus: row.payment_status as string,
    paymentMethod: (row.payment_method as string) || undefined,
    notes: (row.notes as string) || undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const body = await request.json();
    const { status, paymentStatus } = body;

    if (!orderId || typeof orderId !== "string") {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Server misconfigured: SUPABASE_SERVICE_ROLE_KEY required" },
        { status: 503 }
      );
    }

    if (
      status &&
      !WORKFLOW_STATUSES.includes(status as (typeof WORKFLOW_STATUSES)[number])
    ) {
      return NextResponse.json(
        {
          error: `Invalid status. Must be one of: ${WORKFLOW_STATUSES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    if (
      paymentStatus &&
      !PAYMENT_STATUSES.includes(
        paymentStatus as (typeof PAYMENT_STATUSES)[number]
      )
    ) {
      return NextResponse.json(
        {
          error: `Invalid paymentStatus. Must be one of: ${PAYMENT_STATUSES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const { data: prevRow } = await supabaseAdmin
      .from("school_event_orders")
      .select("status")
      .eq("id", orderId)
      .maybeSingle();

    const prevStatus = (prevRow as { status?: string } | null)?.status;

    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (status !== undefined) updatePayload.status = status;
    if (paymentStatus !== undefined)
      updatePayload.payment_status = paymentStatus;

    const { data: row, error } = await supabaseAdmin
      .from("school_event_orders")
      .update(updatePayload)
      .eq("id", orderId)
      .select(ORDER_HEADER_SELECT)
      .single();

    if (error || !row) {
      console.error("Supabase error updating order status:", error);
      return NextResponse.json(
        { error: `Database error: ${error?.message ?? "Update failed"}` },
        { status: 500 }
      );
    }

    if (typeof status === "string" && status !== prevStatus) {
      void notifySchoolEventOrderStatusChange(
        prevStatus,
        status,
        orderId
      ).catch((e) => console.error("[admin school order] status notify:", e));
    }

    if (status === "COMPLETED") {
      void ensureSchoolEventInvoiceOnCompleted(orderId).catch((e) =>
        console.error("[admin school order] invoice on complete:", e)
      );
    }

    return NextResponse.json(mapOrderHeader(row as Record<string, unknown>));
  } catch (error) {
    console.error("Error updating order status:", error);
    return NextResponse.json(
      {
        error: `Server error: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Server misconfigured: SUPABASE_SERVICE_ROLE_KEY required" },
        { status: 503 }
      );
    }

    const { data: orderRow, error } = await supabaseAdmin
      .from("school_event_orders")
      .select(ORDER_HEADER_SELECT)
      .eq("id", orderId)
      .single();

    if (error || !orderRow) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const o = orderRow as Record<string, unknown>;
    const oid = o.id as string;

    const { data: itemsRaw, error: itemsError } = await supabaseAdmin
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
      .eq("order_id", oid);

    if (itemsError) {
      console.error("Error fetching order items:", itemsError);
    }

    const itemsWithDetails = await Promise.all(
      (itemsRaw || []).map(async (item: Record<string, unknown>) => {
        const itemId = item.id as string;
        const productId = item.product_id as string;
        const variantId = item.variant_id as string | null;

        const { data: product } = await supabaseAdmin
          .from("event_products")
          .select("name")
          .eq("id", productId)
          .single();

        let variantDetails: string | undefined;
        if (variantId) {
          const { data: variant } = await supabaseAdmin
            .from("event_product_variants")
            .select("size, color")
            .eq("id", variantId)
            .single();

          if (variant?.size != null || variant?.color != null) {
            variantDetails = `${variant.size ?? ""} - ${variant.color ?? ""}`.trim();
          }
        }

        const { data: addonsRaw } = await supabaseAdmin
          .from("school_event_order_item_addons")
          .select(
            `
            id,
            additional_item_id,
            selected_option_id,
            quantity,
            unit_price,
            total_price
          `
          )
          .eq("order_item_id", itemId);

        const addons = await Promise.all(
          (addonsRaw || []).map(async (a: Record<string, unknown>) => {
            const aid = a.additional_item_id as string;
            const optId = a.selected_option_id as string | null;

            const { data: addName } = await supabaseAdmin
              .from("event_product_additional_items")
              .select("name")
              .eq("id", aid)
              .maybeSingle();

            let selectedOptionName: string | undefined;
            if (optId) {
              const { data: opt } = await supabaseAdmin
                .from("event_product_additional_item_options")
                .select("optionName")
                .eq("id", optId)
                .maybeSingle();
              selectedOptionName = (opt as { optionName?: string } | null)
                ?.optionName;
            }

            return {
              id: a.id as string,
              additionalItemName: addName?.name || "Add-on",
              selectedOptionName,
              quantity: num(a.quantity),
              unitPrice: num(a.unit_price),
              totalPrice: num(a.total_price),
            };
          })
        );

        return {
          id: itemId,
          productName: product?.name || "Unknown product",
          variantDetails,
          childName: (item.child_name as string) || "",
          childAge:
            item.child_age != null ? Number(item.child_age) : undefined,
          quantity: num(item.quantity),
          unitPrice: num(item.unit_price),
          totalPrice: num(item.total_price),
          specialInstructions:
            (item.special_instructions as string) || undefined,
          addons,
        };
      })
    );

    return NextResponse.json({
      ...mapOrderHeader(o),
      items: itemsWithDetails,
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;

    if (!orderId || typeof orderId !== "string") {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Server misconfigured: SUPABASE_SERVICE_ROLE_KEY required" },
        { status: 503 }
      );
    }

    const { data: itemRows, error: itemListErr } = await supabaseAdmin
      .from("school_event_order_items")
      .select("id")
      .eq("order_id", orderId);

    if (itemListErr) {
      console.error("Error listing order items:", itemListErr);
      return NextResponse.json(
        { error: `Failed to delete order items: ${itemListErr.message}` },
        { status: 500 }
      );
    }

    const itemIds = (itemRows || []).map((r: { id: string }) => r.id);
    if (itemIds.length > 0) {
      const { error: addonsError } = await supabaseAdmin
        .from("school_event_order_item_addons")
        .delete()
        .in("order_item_id", itemIds);

      if (addonsError) {
        console.error("Error deleting addons:", addonsError);
        return NextResponse.json(
          { error: `Failed to delete addons: ${addonsError.message}` },
          { status: 500 }
        );
      }
    }

    const { error: orderItemsError } = await supabaseAdmin
      .from("school_event_order_items")
      .delete()
      .eq("order_id", orderId);

    if (orderItemsError) {
      console.error("Error deleting order items:", orderItemsError);
      return NextResponse.json(
        { error: `Failed to delete order items: ${orderItemsError.message}` },
        { status: 500 }
      );
    }

    const { error: orderError } = await supabaseAdmin
      .from("school_event_orders")
      .delete()
      .eq("id", orderId);

    if (orderError) {
      console.error("Error deleting order:", orderError);
      return NextResponse.json(
        { error: `Failed to delete order: ${orderError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting order:", error);
    return NextResponse.json(
      {
        error: `Server error: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 }
    );
  }
}
