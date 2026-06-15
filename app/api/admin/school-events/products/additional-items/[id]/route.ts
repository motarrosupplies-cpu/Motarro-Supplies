import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabaseClient";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = supabaseAdmin ?? supabase;
    const body = await request.json();
    const { name, description, price, category, isActive } = body;

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) {
      const n = typeof price === "number" ? price : parseFloat(String(price));
      if (!Number.isFinite(n)) {
        return NextResponse.json({ error: "Invalid price" }, { status: 400 });
      }
      updateData.price = n;
    }
    if (category !== undefined) updateData.category = category;
    if (isActive !== undefined) updateData.isActive = isActive;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    const { data: row, error } = await db
      .from("event_product_additional_items")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating additional item:", error);
      return NextResponse.json(
        { error: `Failed to update additional item: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(row);
  } catch (error) {
    console.error("Error updating additional item:", error);
    return NextResponse.json(
      { error: "Failed to update additional item" },
      { status: 500 }
    );
  }
}
