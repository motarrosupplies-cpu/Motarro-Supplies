import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

// Public API endpoint for school events - using Supabase instead of Prisma
export async function GET() {
  try {
    console.log('Public: Fetching active school events via Supabase...');
    
    const { data: events, error } = await supabase
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
      .eq('isActive', true)
      .order('startDate', { ascending: true });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch school events', details: error.message },
        { status: 500 }
      );
    }

    console.log('Public: Received active events:', events);
    
    // Get counts for each event
    const eventsWithCounts = await Promise.all(
      events?.map(async (event) => {
        // Count products for this event
        const { count: productCount } = await supabase
          .from('event_products')
          .select('*', { count: 'exact', head: true })
          .eq('eventId', event.id)
          .eq('isActive', true);

        // Count orders for this event
        const { count: orderCount } = await supabase
          .from('school_event_orders')
          .select('*', { count: 'exact', head: true })
          .eq('event_id', event.id);

        return {
          id: event.id,
          name: event.name,
          description: event.description,
          startDate: event.startDate,
          endDate: event.endDate,
          isActive: event.isActive,
          createdAt: event.createdAt,
          updatedAt: event.updatedAt,
          _count: {
            eventProducts: productCount || 0,
            orders: orderCount || 0
          }
        };
      }) || []
    );

        return NextResponse.json(eventsWithCounts, {
          headers: {
            'Cache-Control': 'public, max-age=0, must-revalidate',
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
