import { NextRequest, NextResponse } from "next/server";
import { orderService } from "@/lib/services/orderService";
import { customerService } from "@/lib/services/customerService";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;
    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    const order = await orderService.getOrderById(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const customer = await customerService.getCustomerById(order.customerId);
    if (!customer || !customer.email) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    const created = order.createdAt ? new Date(order.createdAt) : new Date();
    const estimatedDeliveryDate = (() => {
      const d = new Date(created);
      d.setDate(d.getDate() + 7);
      return d.toISOString().slice(0, 10);
    })();

    const orderItems = await orderService.getOrderItems(orderId);

    return NextResponse.json({
      orderId: order.id,
      email: customer.email,
      deliveryCountry: "ZA",
      estimatedDeliveryDate,
      total: order.totalAmount,
      contentIds: orderItems.map((item) => item.product_id as string),
      numItems: orderItems.reduce(
        (sum, item) => sum + (item.quantity || 1),
        0
      ),
    });
  } catch (error) {
    console.error("Review opt-in details error:", error);
    return NextResponse.json(
      { error: "Failed to load opt-in details" },
      { status: 500 }
    );
  }
}
