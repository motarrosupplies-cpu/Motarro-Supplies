"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight, CreditCard, ShieldCheck, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

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
  items: OrderItem[];
  event: {
    name: string;
  };
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

export default function SchoolEventCheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<SchoolEventOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<'payfast' | 'eft'>('payfast');
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (params.orderId) {
      fetchOrder(params.orderId as string);
    }
  }, [params.orderId]);

  const fetchOrder = async (orderId: string) => {
    try {
      const response = await fetch(`/api/school-events/orders/${orderId}`);
      if (response.ok) {
        const data = await response.json();
        setOrder(data);
      }
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!order) return;

    setProcessing(true);

    try {
      if (paymentMethod === 'payfast') {
        // Redirect to PayFast
        const response = await fetch('/api/payments/payfast-initiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            total: order.totalAmount,
            customerId: order.id,
            orderNumber: order.orderNumber,
            customerEmail: order.parentEmail,
            customerName: order.parentName,
            itemName: `School Event Order - ${order.event.name}`,
            customStr1: order.id, // Store order ID for callback
            orderType: 'school-event',
            eventId: order.eventId,
          }),
        });

        if (response.ok) {
          const { url } = await response.json();
          window.location.href = url;
        } else {
          throw new Error('Failed to initiate PayFast payment');
        }
      } else {
        // EFT payment - mark as pending and show bank details
        const response = await fetch(`/api/school-events/orders/${order.id}/update-payment`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            paymentMethod: 'EFT',
            paymentStatus: 'PENDING'
          }),
        });

        if (response.ok) {
          setCompleted(true);
        } else {
          throw new Error('Failed to update payment status');
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="container px-4 py-12 mx-auto bg-lavender">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container px-4 py-12 mx-auto bg-lavender">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
          <p className="mb-6">The order you're looking for doesn't exist.</p>
          <Button asChild>
            <Link href="/school-events">Back to Events</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="container px-4 py-12 mx-auto bg-lavender">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl">Order Submitted Successfully!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Thank you for your order! Your order has been submitted and is being processed.</p>
            <div className="bg-muted p-4 rounded-lg">
              <p className="font-medium">Order #{order.orderNumber}</p>
              <p className="text-sm text-muted-foreground">
                Payment Method: EFT (Bank Transfer)
              </p>
              <p className="text-sm text-muted-foreground">
                We'll send you bank details via email to complete your payment.
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              You'll receive a confirmation email shortly with all the details.
            </p>
          </CardContent>
          <div className="p-6 pt-0 flex justify-center">
            <Button asChild>
              <Link href="/school-events">Return to Events</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container px-4 py-12 mx-auto bg-lavender">
      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/school-events" className="hover:text-foreground">School Events</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">Checkout</span>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Order Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Order Number:</span>
                <Badge variant="outline">{order.orderNumber}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Event:</span>
                <span>{order.event.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Parent:</span>
                <span>{order.parentName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">School:</span>
                <span>{order.schoolName}</span>
              </div>
              {order.grade && (
                <div className="flex justify-between items-center">
                  <span className="font-medium">Grade:</span>
                  <span>{order.grade}</span>
                </div>
              )}
              {order.className && (
                <div className="flex justify-between items-center">
                  <span className="font-medium">Class:</span>
                  <span>{order.className}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-start border-b pb-2">
                    <div>
                      <p className="font-medium">{item.product.name}</p>
                      {item.variant && (
                        <p className="text-sm text-muted-foreground">
                          {item.variant.size} - {item.variant.color}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        {item.childName} (Age: {item.childAge}) x{item.quantity}
                      </p>
                    </div>
                    <span className="font-medium">R{item.totalPrice.toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-lg font-bold">Total:</span>
                  <span className="text-lg font-bold">R{order.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup value={paymentMethod} onValueChange={(value: 'payfast' | 'eft') => setPaymentMethod(value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="payfast" id="payfast" />
                  <Label htmlFor="payfast" className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    PayFast (Credit Card, EFT, etc.)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="eft" id="eft" />
                  <Label htmlFor="eft" className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" />
                    Bank Transfer (EFT)
                  </Label>
                </div>
              </RadioGroup>

              {paymentMethod === 'eft' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Bank Transfer Information</h4>
                  <p className="text-sm text-blue-700">
                    After placing your order, you'll receive an email with our bank account details. 
                    Please include your order number as a reference when making the transfer.
                  </p>
                </div>
              )}

              <Button 
                onClick={handlePayment}
                disabled={processing}
                className="w-full"
                size="lg"
              >
                {processing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    {paymentMethod === 'payfast' ? 'Pay with PayFast' : 'Submit Order'}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Secure Payment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ShieldCheck className="h-4 w-4" />
                <span>Your payment information is secure and encrypted</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
