import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabaseClient";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = supabaseAdmin ?? supabase;

    const { data: event, error } = await db
      .from('school_events')
      .select(`
        id,
        name,
        description,
        "startDate",
        "endDate",
        "isActive",
        "createdAt",
        "updatedAt"
      `)
      .eq('id', id)
      .single();

    if (error || !event) {
      return NextResponse.json(
        { error: 'School event not found' },
        { status: 404 }
      );
    }

    const { count: productCount } = await db
      .from('event_products')
      .select('*', { count: 'exact', head: true })
      .eq('eventId', id);

    const { count: orderCount } = await db
      .from('school_event_orders')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', id);

    const { data: recentOrdersRaw } = await db
      .from('school_event_orders')
      .select(
        `
        id,
        order_number,
        parent_name,
        school_name,
        total_amount,
        status,
        payment_status,
        created_at
      `
      )
      .eq('event_id', id)
      .order('created_at', { ascending: false })
      .limit(10);

    const orders = (recentOrdersRaw || []).map((o: Record<string, unknown>) => ({
      id: o.id as string,
      orderNumber: o.order_number as string,
      parentName: o.parent_name as string,
      schoolName: o.school_name as string,
      totalAmount: Number(o.total_amount ?? 0),
      status: o.status as string,
      paymentStatus: o.payment_status as string,
      createdAt: o.created_at as string,
      items: [] as unknown[],
    }));

    return NextResponse.json(
      {
        ...event,
        orders,
        _count: {
          orders: orderCount ?? 0,
          eventProducts: productCount ?? 0,
        },
      },
      {
        headers: {
          'Cache-Control': 'private, no-store, max-age=0, must-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching school event:', error);
    return NextResponse.json(
      { error: 'Failed to fetch school event' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = supabaseAdmin ?? supabase;
    const body = await request.json();
    const { name, description, startDate, endDate, isActive } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (endDate !== undefined) updateData.endDate = new Date(endDate);
    if (isActive !== undefined) updateData.isActive = isActive;

    const { data: event, error } = await db
      .from('school_events')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update school event' },
        { status: 500 }
      );
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error('Error updating school event:', error);
    return NextResponse.json(
      { error: 'Failed to update school event' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = supabaseAdmin ?? supabase;

    // DB column is event_id (snake_case); count must match for guard + messaging
    const { count, error: countError } = await db
      .from('school_event_orders')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', id);

    if (countError) {
      console.error('Admin school-events DELETE: order count failed:', countError);
      return NextResponse.json(
        { error: 'Failed to check orders for this event' },
        { status: 500 }
      );
    }

    if (count != null && count > 0) {
      return NextResponse.json(
        { error: 'Cannot delete event with existing orders' },
        { status: 400 }
      );
    }

    const { data: deletedRows, error } = await db
      .from('school_events')
      .delete()
      .eq('id', id)
      .select('id');

    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete school event' },
        { status: 500 }
      );
    }

    if (!deletedRows?.length) {
      return NextResponse.json(
        { error: 'School event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting school event:', error);
    return NextResponse.json(
      { error: 'Failed to delete school event' },
      { status: 500 }
    );
  }
}
