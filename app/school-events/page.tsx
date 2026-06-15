import Link from "next/link";
import { ChevronRight, Calendar, MapPin, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SEOContent } from "@/components/seo-content";
import { Metadata } from "next";
import { supabase } from "@/lib/supabaseClient";

/** Always read current active events from Supabase (avoid stale prerender with zero rows). */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "School Events – Uniforms & Event Merchandise | MOTARRO Supplies",
  description: "Order custom printed apparel and school uniforms for your child's school events. School uniforms, event merchandise, and custom printed clothing for sports days, graduations, and school functions in Johannesburg.",
  keywords: [
    "school events",
    "school uniforms",
    "school uniform printing",
    "event merchandise",
    "sports team uniforms",
    "graduation apparel",
    "custom printing",
    "sports day",
    "graduation",
    "school apparel",
    "custom t-shirts",
    "school merchandise",
    "event t-shirts",
    "school clothing",
    "fundraiser t-shirts",
    "Johannesburg",
    "Kempton Park"
  ],
  openGraph: {
    title: "School Events | MOTARRO Supplies",
    description: "Order custom printed apparel for your child's school events with professional printing services.",
    url: "https://www.motarro.co.za/school-events"
  },
  alternates: {
    canonical: "/school-events"
  }
}

interface SchoolEvent {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  _count?: {
    orders: number;
    eventProducts: number;
  };
}

export default async function SchoolEventsPage() {
  // Fetch active events from Supabase (using snake_case table name)
  const { data: eventsData, error } = await supabase
    .from('school_events')
    .select(`
      id,
      name,
      description,
      "startDate",
      "endDate",
      "isActive"
    `)
    .eq('isActive', true)
    .order('startDate', { ascending: true })

  if (error) {
    console.error('Error fetching events:', error)
  }

  // Fetch counts for each event separately (Supabase doesn't support relationship counts in select)
  const events: SchoolEvent[] = await Promise.all(
    (eventsData || []).map(async (event) => {
      const [ordersResult, productsResult] = await Promise.all([
        supabase
          .from('school_event_orders')
          .select('id', { count: 'exact', head: true })
          .eq('event_id', event.id),
        supabase
          .from('event_products')
          .select('id', { count: 'exact', head: true })
          .eq('eventId', event.id)
          .eq('isActive', true)
      ])

      return {
        ...event,
        _count: {
          orders: ordersResult.count || 0,
          eventProducts: productsResult.count || 0
        }
      }
    })
  );

  return (
    <div className="container px-4 py-12 mx-auto bg-lavender max-w-full overflow-x-hidden">
      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-8 flex-wrap">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="h-4 w-4 shrink-0" />
        <span className="text-foreground">School Events</span>
      </div>

      <div className="flex flex-col items-center text-center space-y-2 mb-12 w-full">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary break-words overflow-wrap-anywhere px-2">School Events - School Uniforms & Event Merchandise</h1>
        <p className="text-muted-foreground max-w-[800px] break-words px-4">
          Order custom printed apparel, school uniforms, and event merchandise for your child's school events. School uniforms, sports team uniforms, graduation apparel, and custom printed clothing for sports days, graduations, and school functions in Johannesburg.
        </p>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-primary/10 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Calendar className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No Active Events</h2>
          <p className="text-muted-foreground mb-6">
            There are currently no active school events. Check back later for upcoming events.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg leading-tight">{event.name}</CardTitle>
                  <Badge variant="secondary" className="ml-2 flex-shrink-0">
                    Active
                  </Badge>
                </div>
                {event.description && (
                  <p className="text-sm text-muted-foreground mt-2">{event.description}</p>
                )}
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {event._count && (
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{event._count.orders || 0} orders</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ArrowRight className="h-4 w-4" />
                        <span>{event._count.eventProducts || 0} products</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardContent className="pt-0">
                <Button asChild className="w-full">
                  <Link href={`/school-events/${event.id}`}>
                    View Event & Order
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* SEO Content - Collapsible */}
      <SEOContent
        category="School Events"
        features={[
          {
            title: "Event Coordination",
            description: "We work directly with schools to coordinate custom apparel orders for various events including sports days, graduations, and field trips."
          },
          {
            title: "Parent-Friendly Ordering",
            description: "Easy online ordering system that allows parents to place orders for their children's school events with secure payment options."
          },
          {
            title: "Quality Assurance",
            description: "All school event apparel is printed with high-quality materials and designs that meet school standards and requirements."
          }
        ]}
        bottomText="With years of experience in custom printing and a deep understanding of school event requirements, we provide reliable, high-quality solutions that schools and parents trust. Our team works closely with school administrators to ensure smooth coordination."
      />

      <div className="mt-12 p-6 bg-primary/5 rounded-lg">
        <h2 className="text-xl font-bold mb-4">How School Events Work</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="bg-primary/10 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">1</span>
            </div>
            <h3 className="font-semibold mb-2">School Sets Up Event</h3>
            <p className="text-muted-foreground text-sm">
              Schools create events and add products for parents to order
            </p>
          </div>
          <div className="text-center">
            <div className="bg-primary/10 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">2</span>
            </div>
            <h3 className="font-semibold mb-2">Parents Place Orders</h3>
            <p className="text-muted-foreground text-sm">
              Parents browse available products and place orders for their children
            </p>
          </div>
          <div className="text-center">
            <div className="bg-primary/10 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">3</span>
            </div>
            <h3 className="font-semibold mb-2">Place Order</h3>
            <p className="text-muted-foreground text-sm">
              Complete your order with payment and we'll handle the printing and delivery
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}