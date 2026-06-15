import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabaseClient";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { isActive } = await request.json();
    const db = supabaseAdmin ?? supabase;

    const { data: event, error } = await db
      .from('school_events')
      .update({ isActive })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error toggling event status:', error);
      return NextResponse.json(
        { error: 'Failed to toggle event status' },
        { status: 500 }
      );
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error('Error toggling event status:', error);
    return NextResponse.json(
      { error: 'Failed to toggle event status' },
      { status: 500 }
    );
  }
}
