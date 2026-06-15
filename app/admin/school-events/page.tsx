"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Eye, Calendar, Users, Package } from "lucide-react";
import Link from "next/link";

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

export default function SchoolEventsPage() {
  const { toast } = useToast();
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      console.log('Admin: Fetching events...');
      const response = await fetch('/api/admin/school-events', {
        cache: 'no-store',
      });
      console.log('Admin: Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Admin: Received data:', data);
        setEvents(data);
      } else {
        console.error('Admin: Response not ok:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Admin: Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleEventStatus = async (eventId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/school-events/${eventId}/toggle-status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      
      if (response.ok) {
        fetchEvents(); // Refresh the list
      }
    } catch (error) {
      console.error('Error toggling event status:', error);
    }
  };

  const deleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/school-events/${eventId}`, {
        method: 'DELETE',
        cache: 'no-store',
      });

      const body = await response.json().catch(() => ({}));

      if (response.ok) {
        setEvents((prev) => prev.filter((e) => e.id !== eventId));
        await fetchEvents();
        toast({
          title: 'Event deleted',
          description: 'The school event was removed successfully.',
        });
      } else {
        const msg =
          typeof body?.error === 'string'
            ? body.error
            : 'Failed to delete event.';
        toast({
          title: 'Could not delete',
          description: msg,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete event.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">School Events</h1>
        </div>
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded animate-pulse w-1/3"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">School Events</h1>
          <p className="text-muted-foreground">
            Manage school events and their associated products for printing orders
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/school-events/new">
            <Plus className="h-4 w-4 mr-2" />
            New Event
          </Link>
        </Button>
      </div>

      {events.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No events yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first school event to start accepting printing orders from parents.
            </p>
            <Button asChild>
              <Link href="/admin/school-events/new">
                <Plus className="h-4 w-4 mr-2" />
                Create First Event
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {events.map((event) => (
            <Card key={event.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-semibold">{event.name}</h3>
                      <Badge variant={event.isActive ? "default" : "outline"}>
                        {event.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    {event.description && (
                      <p className="text-muted-foreground">{event.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleEventStatus(event.id, event.isActive)}
                    >
                      {event.isActive ? "Deactivate" : "Activate"}
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/school-events/${event.id}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/school-events/${event.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteEvent(event.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Package className="h-4 w-4" />
                    <span>{event._count?.eventProducts || 0} Products</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{event._count?.orders || 0} Orders</span>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/school-events/${event.id}/products`}>
                      Manage Products
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/school-events/${event.id}/orders`}>
                      View Orders
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/school-events/${event.id}`}>
                      Public Page
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
