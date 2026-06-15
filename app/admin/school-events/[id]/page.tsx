"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Calendar, Users, Package, ExternalLink } from "lucide-react";
import Link from "next/link";

interface EventProduct {
  id: string;
  name: string;
  description?: string;
  basePrice: number;
  imageUrl?: string;
  isActive: boolean;
  variants: EventProductVariant[];
}

interface EventProductVariant {
  id: string;
  size: string;
  color: string;
  additionalPrice: number;
  isActive: boolean;
}

interface SchoolEventOrder {
  id: string;
  orderNumber: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  schoolName: string;
  grade?: string;
  className?: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  paymentMethod?: string;
  createdAt: string;
  items: OrderItem[];
}

interface OrderItem {
  id: string;
  childName: string;
  childAge: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  specialInstructions?: string;
  product: {
    name: string;
  };
  variant?: {
    size: string;
    color: string;
  };
}

interface SchoolEvent {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  eventProducts: EventProduct[];
  orders: SchoolEventOrder[];
  _count?: {
    orders: number;
    eventProducts: number;
  };
}

export default function ViewSchoolEventPage() {
  const params = useParams();
  const [event, setEvent] = useState<SchoolEvent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchEvent(params.id as string);
    }
  }, [params.id]);

  const fetchEvent = async (eventId: string) => {
    try {
      const response = await fetch(`/api/admin/school-events/${eventId}`, {
        cache: "no-store",
      });
      if (response.ok) {
        const data = await response.json();
        setEvent({
          ...data,
          orders: Array.isArray(data.orders) ? data.orders : [],
          eventProducts: Array.isArray(data.eventProducts)
            ? data.eventProducts
            : [],
        });
      }
    } catch (error) {
      console.error('Error fetching event:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800';
      case 'IN_PRODUCTION': return 'bg-purple-100 text-purple-800';
      case 'READY_FOR_PICKUP': return 'bg-green-100 text-green-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'PAID': return 'bg-green-100 text-green-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      case 'REFUNDED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading event details...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
        <Button asChild>
          <Link href="/admin/school-events">Back to Events</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/school-events">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{event.name}</h1>
          <p className="text-muted-foreground">
            View event details, products, and orders
          </p>
        </div>
      </div>

      <div className="flex gap-4">
        <Button asChild>
          <Link href={`/admin/school-events/${event.id}/edit`}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Event
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href={`/admin/school-events/${event.id}/public`}>
            <ExternalLink className="h-4 w-4 mr-2" />
            Public Page
          </Link>
        </Button>
      </div>

      {/* Event Overview */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Event Dates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Start:</span>
                <span className="text-sm font-medium">
                  {new Date(event.startDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">End:</span>
                <span className="text-sm font-medium">
                  {new Date(event.endDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Status:</span>
                <Badge variant={event.isActive ? "default" : "secondary"}>
                  {event.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {event._count?.eventProducts || 0}
              </div>
              <p className="text-sm text-muted-foreground">Available Products</p>
              <Button variant="outline" size="sm" className="mt-3" asChild>
                <Link href={`/admin/school-events/${event.id}/products`}>
                  Manage Products
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {event._count?.orders || 0}
              </div>
              <p className="text-sm text-muted-foreground">Total Orders</p>
              <Button variant="outline" size="sm" className="mt-3" asChild>
                <Link href={`/admin/school-events/${event.id}/orders`}>
                  View Orders
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Event Description */}
      {event.description && (
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{event.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Recent Orders */}
      {(event.orders ?? []).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(event.orders ?? []).slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between border-b pb-2 last:border-b-0">
                  <div>
                    <p className="font-medium">#{order.orderNumber}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.parentName} • {order.schoolName}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                    <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                      {order.paymentStatus}
                    </Badge>
                    <span className="text-sm font-medium">
                      R{order.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
              {(event.orders ?? []).length > 5 && (
                <div className="text-center pt-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/school-events/${event.id}/orders`}>
                      View All Orders
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <Button variant="outline" asChild>
              <Link href={`/admin/school-events/${event.id}/products`}>
                <Package className="h-4 w-4 mr-2" />
                Manage Products
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/admin/school-events/${event.id}/orders`}>
                <Users className="h-4 w-4 mr-2" />
                View Orders
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/admin/school-events/${event.id}/public`}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Public Page
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/admin/school-events/${event.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Event
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
