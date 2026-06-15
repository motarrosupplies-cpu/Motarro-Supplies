import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabaseClient";

export async function GET() {
  try {
    const db = supabaseAdmin ?? supabase;
    if (!supabaseAdmin) {
      console.warn(
        'Admin school-events GET: SUPABASE_SERVICE_ROLE_KEY missing; using anon client (RLS may hide rows or counts)'
      );
    }

    console.log('Admin: Fetching events via Supabase...');

    // Fetch events with proper column mapping (service role: must match POST — anon RLS often hides admin rows/counts)
    const { data: events, error } = await db
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
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('Admin: Supabase error:', error);
      throw error;
    }

    console.log('Admin: Found events:', events);
    console.log('Admin: Events count:', events?.length || 0);

    // Get counts for each event
    const eventsWithCounts = await Promise.all(
      (events || []).map(async (event) => {
        try {
          const [ordersResult, productsResult] = await Promise.all([
            db
              .from('school_event_orders')
              .select('id', { count: 'exact' })
              .eq('event_id', event.id),
            db
              .from('event_products')
              .select('id', { count: 'exact' })
              .eq('eventId', event.id)
          ]);

          return {
            ...event,
            _count: {
              orders: ordersResult.count || 0,
              eventProducts: productsResult.count || 0
            }
          };
        } catch (countError) {
          console.error(`Admin: Error counting for event ${event.id}:`, countError);
          return {
            ...event,
            _count: {
              orders: 0,
              eventProducts: 0
            }
          };
        }
      })
    );

    console.log('Admin: Events with counts:', eventsWithCounts);
    return NextResponse.json(eventsWithCounts, {
      headers: {
        'Cache-Control': 'private, no-store, max-age=0, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Error fetching school events via Supabase:', error);
    return NextResponse.json(
      { error: 'Failed to fetch school events' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description, startDate, endDate } = await request.json();

    // Validate required fields
    if (!name || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Name, start date, and end date are required' },
        { status: 400 }
      );
    }

    const ymd = (raw: string) => {
      const m = /^(\d{4}-\d{2}-\d{2})/.exec(String(raw).trim());
      return m ? m[1] : null;
    };
    const startDay = ymd(startDate);
    const endDay = ymd(endDate);
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return NextResponse.json({ error: 'Invalid start or end date' }, { status: 400 });
    }
    // Prefer YYYY-MM-DD from the form so single-day events and timezones stay correct
    if (startDay && endDay && endDay < startDay) {
      return NextResponse.json(
        { error: 'End date cannot be before start date' },
        { status: 400 }
      );
    }
    if (!startDay || !endDay) {
      const s = start.toISOString().slice(0, 10);
      const e = end.toISOString().slice(0, 10);
      if (e < s) {
        return NextResponse.json(
          { error: 'End date cannot be before start date' },
          { status: 400 }
        );
      }
    }

    const db = supabaseAdmin ?? supabase;
    if (!supabaseAdmin) {
      console.warn(
        'Admin school-events POST: SUPABASE_SERVICE_ROLE_KEY missing; using anon client (RLS may block inserts)'
      );
    }

    const { data: event, error } = await db
      .from('school_events')
      .insert({
        name,
        description,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        isActive: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating school event:', error);
      throw error;
    }

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('Error creating school event via Supabase:', error);
    
    let errorMessage = 'Failed to create school event';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}
