"use client";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GoogleCustomerReviewsOptIn } from "@/components/GoogleCustomerReviewsOptIn";
import { trackGa4Purchase } from "@/lib/ga4";
import { trackMetaPurchase } from "@/lib/meta-pixel";

interface ReviewOptInDetails {
  orderId: string;
  email: string;
  deliveryCountry: string;
  estimatedDeliveryDate: string;
  total?: number;
  contentIds?: string[];
  numItems?: number;
}

export default function PayfastReturnContent() {
  const params = useSearchParams();
  const orderIdParam =
    params.get("order_id") ||
    params.get("custom_str1") ||
    params.get("m_payment_id") ||
    "";
  const [optInDetails, setOptInDetails] = useState<ReviewOptInDetails | null>(
    null
  );

  useEffect(() => {
    if (!orderIdParam) return;
    const isUuid =
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
        orderIdParam
      );
    if (!isUuid) return;
    fetch(`/api/orders/${orderIdParam}/review-opt-in`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        setOptInDetails(data);
        if (data.total != null) {
          trackMetaPurchase({
            orderId: data.orderId,
            value: data.total,
            contentIds: data.contentIds ?? [],
            numItems: data.numItems ?? 0,
          });
          trackGa4Purchase({
            transactionId: data.orderId,
            value: data.total,
            items: (data.contentIds ?? []).map((id: string) => ({
              id,
              name: id,
              price: 0,
              quantity: 1,
            })),
          });
        }
      })
      .catch(() => {});
  }, [orderIdParam]);

  return (
    <div className="container mx-auto py-12 max-w-md">
      <h1 className="sr-only">Payment successful – MOTARRO Supplies</h1>
      <Card className="text-center">
        <CardHeader>
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>Thank you for your payment. Your order has been received and is being processed.</p>
          {orderIdParam && (
            <div className="bg-muted p-4 rounded-lg">
              <p className="font-medium">Order Reference: {orderIdParam}</p>
            </div>
          )}
          <p className="text-sm text-muted-foreground">A confirmation email will be sent to you shortly.</p>
          {optInDetails && (
            <GoogleCustomerReviewsOptIn
              orderId={optInDetails.orderId}
              email={optInDetails.email}
              deliveryCountry={optInDetails.deliveryCountry}
              estimatedDeliveryDate={optInDetails.estimatedDeliveryDate}
            />
          )}
        </CardContent>
        <div className="flex justify-center space-x-4 pb-6">
          <Button asChild variant="outline">
            <Link href="/products">Continue Shopping</Link>
          </Button>
          <Button asChild>
            <Link href="/">Return to Home</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
} 