import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";

/**
 * Optional server hook if PayFast is configured to POST here.
 * Source of truth for payment remains ITN (/api/payments/payfast-ipn).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, paymentStatus, transactionId } = body;

    console.log('Payfast return for order:', { orderId, paymentStatus, transactionId });

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const { error: updateError } = await supabaseAdmin
      .from('school_event_orders')
      .update({
        payment_status: paymentStatus === 'COMPLETE' ? 'PAID' : 'FAILED',
        status: paymentStatus === 'COMPLETE' ? 'CONFIRMED' : 'PENDING',
        payment_method: 'payfast',
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('Error updating order payment status:', updateError);
      return NextResponse.json(
        { error: 'Failed to update order status' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      redirectUrl: `/school-events/checkout/${orderId}?status=success`
    });

  } catch (error) {
    console.error('Error processing Payfast return:', error);
    return NextResponse.json(
      { error: 'Failed to process payment return' },
      { status: 500 }
    );
  }
}
