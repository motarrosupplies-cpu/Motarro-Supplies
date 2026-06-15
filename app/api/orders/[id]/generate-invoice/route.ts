import { NextRequest, NextResponse } from 'next/server';
import { orderService } from '@/lib/services/orderService';
import { invoiceService } from '@/lib/services/invoiceService';
import { customerService } from '@/lib/services/customerService';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id;
    
    // Get the order
    const order = await orderService.getOrderById(orderId);
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Get the customer
    const customer = await customerService.getCustomerById(order.customerId);
    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Get order items
    const orderItems = await orderService.getOrderItems(orderId);
    
    // Convert order items to invoice items
    const invoiceItems = orderItems.map(item => ({
      description: item.product_name,
      quantity: item.quantity,
      unitPrice: item.price_at_time,
      total: item.quantity * item.price_at_time,
    }));

    // Set due date to 30 days from now
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    // Create invoice data
    const invoiceData = {
      customerId: order.customerId,
      dueDate,
      items: invoiceItems,
      notes: `Generated from Order #${orderId}`,
      terms: 'Payment due within 30 days',
    };

    // Create the invoice
    const invoice = await invoiceService.createInvoice(invoiceData);

    // Update order status to indicate invoice was generated
    await orderService.updateOrderStatus(orderId, 'invoiced');

    return NextResponse.json({
      success: true,
      invoice: {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        total: invoice.total,
      },
      message: `Invoice ${invoice.invoiceNumber} generated successfully from order ${orderId}`,
    });

  } catch (error) {
    console.error('Error generating invoice from order:', error);
    return NextResponse.json(
      { error: 'Failed to generate invoice' },
      { status: 500 }
    );
  }
} 