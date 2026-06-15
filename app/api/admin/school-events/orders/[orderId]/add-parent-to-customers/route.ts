import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { invoiceService } from "@/lib/services/invoiceService";
import {
  normalizeSchoolEventOrderRow,
  SCHOOL_EVENT_ORDER_HEADER_SELECT,
} from "@/lib/supabase/schoolEventDb";

function splitParentName(full: string): { firstName: string; lastName: string } {
  const t = (full || "").trim();
  if (!t) return { firstName: "Parent", lastName: "-" };
  const parts = t.split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: "-" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

/**
 * Adds school-event order parent to `customers` for CRM / future campaigns.
 * Requires explicit consent flag from admin UI (record-keeping only; legal compliance is your process).
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const body = await request.json().catch(() => ({}));
    const { consentConfirmed, eventId } = body as {
      consentConfirmed?: boolean;
      eventId?: string;
    };

    if (!orderId || typeof orderId !== "string") {
      return NextResponse.json({ error: "Invalid order" }, { status: 400 });
    }

    if (!consentConfirmed) {
      return NextResponse.json(
        { error: "Marketing consent confirmation is required" },
        { status: 400 }
      );
    }

    if (!eventId || typeof eventId !== "string") {
      return NextResponse.json({ error: "eventId is required" }, { status: 400 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Server misconfigured: SUPABASE_SERVICE_ROLE_KEY required" },
        { status: 503 }
      );
    }

    const { data: row, error: fetchErr } = await supabaseAdmin
      .from("school_event_orders")
      .select(SCHOOL_EVENT_ORDER_HEADER_SELECT)
      .eq("id", orderId)
      .maybeSingle();

    if (fetchErr || !row) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const order = normalizeSchoolEventOrderRow(row as Record<string, unknown>);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.eventId !== eventId) {
      return NextResponse.json({ error: "Order does not belong to this event" }, { status: 403 });
    }

    const emailRaw = order.parentEmail?.trim();
    if (!emailRaw) {
      return NextResponse.json(
        { error: "Order has no parent email" },
        { status: 400 }
      );
    }

    const { firstName, lastName } = splitParentName(order.parentName);
    const phone = order.parentPhone?.trim() || "";

    const { data: existing, error: findErr } = await supabaseAdmin
      .from("customers")
      .select("id, phone")
      .ilike("email", emailRaw)
      .maybeSingle();

    if (findErr) {
      console.error("[add-parent-to-customers] lookup:", findErr);
      return NextResponse.json(
        { error: "Failed to look up customer" },
        { status: 500 }
      );
    }

    if (existing?.id) {
      const ex = existing as { id: string; phone?: string | null };
      if (phone && ex.phone !== phone) {
        await supabaseAdmin
          .from("customers")
          .update({
            phone,
            updated_at: new Date().toISOString(),
          })
          .eq("id", ex.id);
      }
      return NextResponse.json({
        ok: true,
        action: "already_exists" as const,
        customerId: ex.id,
        message:
          "This email is already in Customers. Phone was updated if it changed.",
      });
    }

    const customer = await invoiceService.createCustomer({
      firstName,
      lastName,
      email: emailRaw,
      phone: phone || undefined,
      source: "school-event-order",
    });

    return NextResponse.json({
      ok: true,
      action: "created" as const,
      customerId: customer.id,
      message: "Parent added to Customers.",
    });
  } catch (e) {
    console.error("[add-parent-to-customers]", e);
    const msg = e instanceof Error ? e.message : "Failed to add customer";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
