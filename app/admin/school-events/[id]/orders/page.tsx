"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowLeft,
  Users,
  Package,
  Calendar,
  Phone,
  Mail,
  Building,
  UserPlus,
} from "lucide-react";
import Link from "next/link";

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
  status:
    | 'PENDING'
    | 'CONFIRMED'
    | 'IN_PRODUCTION'
    | 'READY_FOR_PICKUP'
    | 'COMPLETED'
    | 'CANCELLED';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  createdAt: string;
  items: OrderItem[];
}

interface OrderItem {
  id: string;
  productName: string;
  variantDetails?: string;
  childName: string;
  childAge?: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  specialInstructions?: string;
}

interface OrderDetailAddon {
  id: string;
  additionalItemName: string;
  selectedOptionName?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface OrderDetailItem extends OrderItem {
  addons?: OrderDetailAddon[];
}

interface OrderDetail extends Omit<SchoolEventOrder, "items"> {
  eventId: string;
  paymentMethod?: string;
  notes?: string;
  updatedAt: string;
  items: OrderDetailItem[];
}

interface SchoolEvent {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export default function EventOrdersPage() {
  const params = useParams();
  const { toast } = useToast();
  const [event, setEvent] = useState<SchoolEvent | null>(null);
  const [orders, setOrders] = useState<SchoolEventOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [updatingPayment, setUpdatingPayment] = useState<string | null>(null);
  const [deletingOrder, setDeletingOrder] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailOrder, setDetailOrder] = useState<OrderDetail | null>(null);
  const [consentOrder, setConsentOrder] = useState<SchoolEventOrder | null>(null);
  const [consentChecked, setConsentChecked] = useState(false);
  const [addingCustomerForOrderId, setAddingCustomerForOrderId] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (params.id) {
      fetchEvent();
      fetchOrders();
    }
  }, [params.id]);

  const fetchEvent = async () => {
    try {
      const response = await fetch(`/api/admin/school-events/${params.id}`, {
        cache: "no-store",
      });
      if (response.ok) {
        const data = await response.json();
        setEvent(data);
      }
    } catch (error) {
      console.error('Error fetching event:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch(
        `/api/admin/school-events/${params.id}/orders`,
        { cache: "no-store" }
      );
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingStatus(orderId);
    try {
      const response = await fetch(`/api/admin/school-events/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (response.ok) {
        setOrders(prevOrders =>
          prevOrders.map((order) =>
            order.id === orderId
              ? { ...order, status: newStatus as SchoolEventOrder['status'] }
              : order
          )
        );
        toast({ title: 'Order status updated', description: newStatus.replace(/_/g, ' ') });
        if (detailOrder?.id === orderId) {
          setDetailOrder((d) =>
            d ? { ...d, status: newStatus as SchoolEventOrder['status'] } : d
          );
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error updating order status:', errorData);
        toast({
          title: 'Update failed',
          description: errorData.error || 'Could not update order status',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: 'Update failed',
        description: 'Could not update order status',
        variant: 'destructive',
      });
    } finally {
      setUpdatingStatus(null);
    }
  };

  const updatePaymentStatus = async (orderId: string, newPaymentStatus: string) => {
    setUpdatingPayment(orderId);
    try {
      const response = await fetch(`/api/admin/school-events/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: newPaymentStatus }),
      });

      if (response.ok) {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId
              ? {
                  ...order,
                  paymentStatus: newPaymentStatus as SchoolEventOrder['paymentStatus'],
                }
              : order
          )
        );
        toast({
          title: 'Payment status updated',
          description: newPaymentStatus,
        });
        if (detailOrder?.id === orderId) {
          setDetailOrder((d) =>
            d
              ? {
                  ...d,
                  paymentStatus:
                    newPaymentStatus as SchoolEventOrder['paymentStatus'],
                }
              : d
          );
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast({
          title: 'Update failed',
          description: errorData.error || 'Could not update payment status',
          variant: 'destructive',
        });
      }
    } catch {
      toast({
        title: 'Update failed',
        description: 'Could not update payment status',
        variant: 'destructive',
      });
    } finally {
      setUpdatingPayment(null);
    }
  };

  const submitAddParentToCustomers = async () => {
    if (!consentOrder || !consentChecked || !params.id) return;
    setAddingCustomerForOrderId(consentOrder.id);
    try {
      const response = await fetch(
        `/api/admin/school-events/orders/${consentOrder.id}/add-parent-to-customers`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            consentConfirmed: true,
            eventId: params.id as string,
          }),
        }
      );
      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        toast({
          title:
            data.action === "already_exists"
              ? "Already in Customers"
              : "Added to Customers",
          description: data.message || "You can manage them under Customers.",
        });
        setConsentOrder(null);
        setConsentChecked(false);
      } else {
        toast({
          title: "Could not add customer",
          description: data.error || "Request failed",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Could not add customer",
        description: "Network error",
        variant: "destructive",
      });
    } finally {
      setAddingCustomerForOrderId(null);
    }
  };

  const openOrderDetail = async (orderId: string) => {
    setDetailOpen(true);
    setDetailLoading(true);
    setDetailOrder(null);
    try {
      const response = await fetch(`/api/admin/school-events/orders/${orderId}`, {
        cache: 'no-store',
      });
      if (response.ok) {
        const data = await response.json();
        setDetailOrder(data as OrderDetail);
      } else {
        const err = await response.json().catch(() => ({}));
        toast({
          title: 'Could not load order',
          description: err.error || 'Request failed',
          variant: 'destructive',
        });
        setDetailOpen(false);
      }
    } catch {
      toast({
        title: 'Could not load order',
        description: 'Network error',
        variant: 'destructive',
      });
      setDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const deleteOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      return;
    }

    setDeletingOrder(orderId);
    try {
      const response = await fetch(`/api/admin/school-events/orders/${orderId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setOrders((prevOrders) => prevOrders.filter((order) => order.id !== orderId));
        if (detailOrder?.id === orderId) {
          setDetailOpen(false);
          setDetailOrder(null);
        }
        toast({ title: 'Order deleted', description: 'The order was removed.' });
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error deleting order:', errorData);
        toast({
          title: 'Delete failed',
          description: errorData.error || 'Unknown error',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      toast({
        title: 'Delete failed',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setDeletingOrder(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800';
      case 'IN_PRODUCTION': return 'bg-indigo-100 text-indigo-800';
      case 'READY_FOR_PICKUP': return 'bg-cyan-100 text-cyan-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      case 'REFUNDED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading orders...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-600">Event not found</p>
        </div>
      </div>
    );
  }

  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(order => order.status === 'PENDING').length;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/admin/school-events`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Events
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">View Orders</h1>
            <p className="text-muted-foreground">
              {event.name} - Manage orders from parents
            </p>
          </div>
        </div>
      </div>

      {/* Event Info Card */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">{event.name}</h2>
              <p className="text-muted-foreground">{event.description}</p>
              <div className="flex items-center gap-4 mt-2">
                <Badge variant={event.isActive ? "default" : "secondary"}>
                  {event.isActive ? "Active" : "Inactive"}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Total Orders</span>
            </div>
            <p className="text-2xl font-bold">{totalOrders}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Pending Orders</span>
            </div>
            <p className="text-2xl font-bold text-yellow-600">{pendingOrders}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Total Revenue</span>
            </div>
            <p className="text-2xl font-bold text-green-600">R{totalRevenue.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Orders List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Event Orders ({orders.length})</h3>
        </div>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Orders Yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Orders from parents will appear here once they start placing them.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {orders.map((order) => {
              const rowBusy =
                updatingStatus === order.id ||
                updatingPayment === order.id ||
                deletingOrder === order.id ||
                addingCustomerForOrderId === order.id;
              return (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-end gap-3">
                        <h3 className="text-lg font-semibold">
                          Order #{order.orderNumber}
                        </h3>
                        <div className="flex flex-wrap gap-3">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                              Order
                            </span>
                            <Badge
                              className={getStatusColor(order.status)}
                              title="Fulfillment / production workflow"
                            >
                              {order.status}
                            </Badge>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                              Payment
                            </span>
                            <Badge
                              className={getPaymentStatusColor(
                                order.paymentStatus
                              )}
                              title="Payfast or manual payment state"
                            >
                              {order.paymentStatus}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{order.schoolName}</span>
                        </div>
                        {order.grade && (
                          <span className="text-sm text-muted-foreground">Grade {order.grade}</span>
                        )}
                        {order.className && (
                          <span className="text-sm text-muted-foreground">Class {order.className}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">R{order.totalAmount.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Parent Information + CRM */}
                  <div className="mb-4 grid gap-4 rounded-lg bg-muted/50 p-4 md:grid-cols-3">
                    <div>
                      <h4 className="mb-2 font-medium">Parent Information</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{order.parentName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{order.parentEmail}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{order.parentPhone}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="mb-2 font-medium">Order Details</h4>
                      <div className="space-y-1 text-sm">
                        <p>
                          <span className="font-medium">Items:</span>{" "}
                          {order.items.length}
                        </p>
                        <p>
                          <span className="font-medium">Status:</span>{" "}
                          {order.status}
                        </p>
                        <p>
                          <span className="font-medium">Payment:</span>{" "}
                          {order.paymentStatus}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col justify-between gap-3 border-t border-border pt-4 md:border-l md:border-t-0 md:pl-4 md:pt-0">
                      <p className="text-xs text-muted-foreground">
                        Add this parent to{" "}
                        <Link
                          href="/admin/customers"
                          className="font-medium text-primary underline-offset-4 hover:underline"
                        >
                          Customers
                        </Link>{" "}
                        for future campaigns. Only after you have their
                        permission.
                      </p>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="w-full shrink-0"
                        disabled={rowBusy}
                        onClick={() => {
                          setConsentOrder(order);
                          setConsentChecked(false);
                        }}
                      >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Add to Customers
                      </Button>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-3">
                    <h4 className="font-medium">Order Items:</h4>
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{item.productName}</span>
                            {item.variantDetails && (
                              <Badge variant="outline" className="text-xs">
                                {item.variantDetails}
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            <span>Child: {item.childName}</span>
                            {item.childAge && <span> • Age: {item.childAge}</span>}
                            {item.specialInstructions && (
                              <span> • Note: {item.specialInstructions}</span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">R{item.unitPrice.toFixed(2)} × {item.quantity}</p>
                          <p className="text-lg font-bold text-primary">R{item.totalPrice.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:flex-wrap sm:items-end">
                    <div className="space-y-1">
                      <Label
                        htmlFor={`order-status-${order.id}`}
                        className="text-xs text-muted-foreground"
                      >
                        Order status
                      </Label>
                      <select
                        id={`order-status-${order.id}`}
                        value={order.status}
                        onChange={(e) =>
                          updateOrderStatus(order.id, e.target.value)
                        }
                        disabled={rowBusy}
                        className="min-w-[10rem] rounded border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="IN_PRODUCTION">In production</option>
                        <option value="READY_FOR_PICKUP">Ready for pickup</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <Label
                        htmlFor={`payment-status-${order.id}`}
                        className="text-xs text-muted-foreground"
                      >
                        Payment status
                      </Label>
                      <select
                        id={`payment-status-${order.id}`}
                        value={order.paymentStatus}
                        onChange={(e) =>
                          updatePaymentStatus(order.id, e.target.value)
                        }
                        disabled={rowBusy}
                        className="min-w-[10rem] rounded border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="PAID">Paid</option>
                        <option value="FAILED">Failed</option>
                        <option value="REFUNDED">Refunded</option>
                      </select>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
                      {updatingStatus === order.id && (
                        <span className="text-sm text-muted-foreground">
                          Saving order…
                        </span>
                      )}
                      {updatingPayment === order.id && (
                        <span className="text-sm text-muted-foreground">
                          Saving payment…
                        </span>
                      )}
                      {deletingOrder === order.id && (
                        <span className="text-sm text-muted-foreground">
                          Deleting…
                        </span>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        type="button"
                        onClick={() => openOrderDetail(order.id)}
                        disabled={rowBusy}
                      >
                        View details
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        type="button"
                        onClick={() => deleteOrder(order.id)}
                        disabled={rowBusy}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
            })}
          </div>
        )}
      </div>

      <Dialog
        open={!!consentOrder}
        onOpenChange={(open) => {
          if (!open) {
            setConsentOrder(null);
            setConsentChecked(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add parent to Customers</DialogTitle>
          </DialogHeader>
          {consentOrder && (
            <>
              <p className="text-sm text-muted-foreground">
                Creates or updates a customer for{" "}
                <strong>{consentOrder.parentName}</strong> (
                {consentOrder.parentEmail}
                {consentOrder.parentPhone
                  ? ` · ${consentOrder.parentPhone}`
                  : ""}
                ).
              </p>
              <div className="flex items-start gap-3 rounded-md border p-3">
                <Checkbox
                  id={`consent-${consentOrder.id}`}
                  checked={consentChecked}
                  onCheckedChange={(c) => setConsentChecked(c === true)}
                  className="mt-0.5"
                />
                <label
                  htmlFor={`consent-${consentOrder.id}`}
                  className="cursor-pointer text-sm leading-snug"
                >
                  I confirm this person has agreed to receive marketing
                  communications from MOTARRO Supplies (record consent under POPIA on
                  your side).
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setConsentOrder(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  disabled={
                    !consentChecked ||
                    addingCustomerForOrderId === consentOrder.id
                  }
                  onClick={() => void submitAddParentToCustomers()}
                >
                  {addingCustomerForOrderId === consentOrder.id
                    ? "Saving…"
                    : "Add to Customers"}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open);
          if (!open) setDetailOrder(null);
        }}
      >
        <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {detailOrder
                ? `Order ${detailOrder.orderNumber}`
                : "Order details"}
            </DialogTitle>
          </DialogHeader>
          {detailLoading && (
            <p className="text-sm text-muted-foreground">Loading…</p>
          )}
          {!detailLoading && detailOrder && (
            <div className="space-y-4 text-sm">
              <div className="rounded-lg border bg-muted/40 p-3">
                <p className="font-medium text-foreground">Statuses</p>
                <p className="mt-1 text-muted-foreground">
                  <span className="font-medium text-foreground">Order:</span>{" "}
                  {detailOrder.status} — production / pickup workflow
                </p>
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground">Payment:</span>{" "}
                  {detailOrder.paymentStatus} — Payfast or manual
                </p>
              </div>
              <div>
                <p className="font-medium">Parent</p>
                <p>{detailOrder.parentName}</p>
                <p className="text-muted-foreground">{detailOrder.parentEmail}</p>
                <p className="text-muted-foreground">{detailOrder.parentPhone}</p>
              </div>
              <div>
                <p className="font-medium">School</p>
                <p>{detailOrder.schoolName}</p>
                {(detailOrder.grade || detailOrder.className) && (
                  <p className="text-muted-foreground">
                    {detailOrder.grade && `Grade ${detailOrder.grade}`}
                    {detailOrder.grade && detailOrder.className ? " · " : ""}
                    {detailOrder.className && `Class ${detailOrder.className}`}
                  </p>
                )}
              </div>
              {detailOrder.paymentMethod && (
                <div>
                  <p className="font-medium">Payment method</p>
                  <p className="text-muted-foreground">
                    {detailOrder.paymentMethod}
                  </p>
                </div>
              )}
              {detailOrder.notes && (
                <div>
                  <p className="font-medium">Notes</p>
                  <p className="whitespace-pre-wrap text-muted-foreground">
                    {detailOrder.notes}
                  </p>
                </div>
              )}
              <div>
                <p className="font-medium">Line items</p>
                <ul className="mt-2 space-y-3">
                  {detailOrder.items.map((item) => (
                    <li
                      key={item.id}
                      className="rounded-md border p-3 text-muted-foreground"
                    >
                      <p className="font-medium text-foreground">
                        {item.productName}
                        {item.variantDetails && (
                          <span className="ml-2 font-normal text-muted-foreground">
                            ({item.variantDetails})
                          </span>
                        )}
                      </p>
                      <p>
                        Child: {item.childName}
                        {item.childAge != null && ` · Age ${item.childAge}`}
                      </p>
                      {item.specialInstructions && (
                        <p>Note: {item.specialInstructions}</p>
                      )}
                      <p>
                        R{item.unitPrice.toFixed(2)} × {item.quantity} ={" "}
                        <span className="font-semibold text-foreground">
                          R{item.totalPrice.toFixed(2)}
                        </span>
                      </p>
                      {item.addons && item.addons.length > 0 && (
                        <ul className="mt-2 border-t pt-2 text-xs">
                          {item.addons.map((a) => (
                            <li key={a.id}>
                              + {a.additionalItemName}
                              {a.selectedOptionName &&
                                ` (${a.selectedOptionName})`}{" "}
                              ×{a.quantity} — R{a.totalPrice.toFixed(2)}
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex justify-between border-t pt-2 font-semibold">
                <span>Total</span>
                <span>R{detailOrder.totalAmount.toFixed(2)}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Placed {new Date(detailOrder.createdAt).toLocaleString()}
                {detailOrder.updatedAt !== detailOrder.createdAt && (
                  <>
                    {" "}
                    · Updated{" "}
                    {new Date(detailOrder.updatedAt).toLocaleString()}
                  </>
                )}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
