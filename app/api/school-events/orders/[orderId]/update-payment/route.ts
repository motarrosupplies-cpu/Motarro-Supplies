import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import {
  normalizeSchoolEventOrderRow,
  schoolEventOrderPaymentUpdatePayload,
  SCHOOL_EVENT_ORDER_HEADER_SELECT,
} from "@/lib/supabase/schoolEventDb";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const { paymentMethod, paymentStatus } = await request.json();

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Server misconfigured" },
        { status: 503 }
      );
    }

    const patch = schoolEventOrderPaymentUpdatePayload({
      paymentMethod,
      paymentStatus,
    });

    if (Object.keys(patch).length === 0) {
      return NextResponse.json(
        { error: "Nothing to update" },
        { status: 400 }
      );
    }

    const { data: row, error } = await supabaseAdmin
      .from("school_event_orders")
      .update({
        ...patch,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .select(SCHOOL_EVENT_ORDER_HEADER_SELECT)
      .single();

    if (error) {
      console.error("Error updating payment status:", error);
      return NextResponse.json(
        { error: "Failed to update payment status" },
        { status: 500 }
      );
    }

    const normalized = normalizeSchoolEventOrderRow(row as Record<string, unknown>);
    return NextResponse.json(normalized ?? row);
  } catch (error) {
    console.error("Error updating payment status:", error);
    return NextResponse.json(
      { error: "Failed to update payment status" },
      { status: 500 }
    );
  }
}
