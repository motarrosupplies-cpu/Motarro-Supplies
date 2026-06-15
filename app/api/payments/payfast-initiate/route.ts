import { NextResponse } from 'next/server';
import { createOrderInDb } from '@/lib/services/orderCreationHelper';
import { validateOrderItemsStock } from '@/lib/services/stockValidationService';
import { supabaseAdmin } from '@/lib/supabaseClient';

/** Initiates PayFast payment. Validates stock server-side, creates order (pending), returns redirect URL. */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const merchant_id = process.env.PAYFAST_MERCHANT_ID || '';
    const merchant_key = process.env.PAYFAST_MERCHANT_KEY || '';
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.motarro.co.za';
    const isSchoolEvent = body.orderType === 'school-event';

    const total = Number(body.total);
    if (Number.isNaN(total) || total <= 0) {
      return NextResponse.json({ error: 'Invalid order total' }, { status: 400 });
    }
    const customerEmail = body.customerEmail ?? body?.shippingAddress?.email ?? '';
    if (!customerEmail || typeof customerEmail !== 'string' || !customerEmail.includes('@')) {
      return NextResponse.json({ error: 'Valid customer email is required for Payfast' }, { status: 400 });
    }

    let customStr1 = body.customStr1 || '';

    // For regular checkout: validate stock then create order so IPN can mark it paid
    if (!isSchoolEvent && body.customerId && body.items && Array.isArray(body.items)) {
      // Server-side stock validation: reject before creating order to prevent oversell
      if (supabaseAdmin) {
        const stockCheck = await validateOrderItemsStock(supabaseAdmin, body.items);
        if (!stockCheck.valid) {
          return NextResponse.json(
            { error: stockCheck.message || 'Insufficient stock for one or more items.' },
            { status: 400 }
          );
        }
      }
      try {
        const { order } = await createOrderInDb({
          customerId: body.customerId,
          items: body.items,
          total: body.total,
          shippingCost: body.shippingCost,
          paymentMethod: 'payfast',
          shippingAddress: body.shippingAddress || {},
          specialInstructions: body.specialInstructions,
          discountCode: body.discountCode,
          discountAmount: body.discountAmount,
          status: 'pending',
        });
        customStr1 = order.id;
      } catch (err) {
        console.error('PayFast initiate: create order failed', err);
        return NextResponse.json(
          { error: err instanceof Error ? err.message : 'Failed to create order' },
          { status: 500 }
        );
      }
    }

    const return_url = isSchoolEvent
      ? `${baseUrl}/school-events/checkout/${body.customerId}?status=success`
      : `${baseUrl}/payfast/return`;
    const cancel_url = isSchoolEvent
      ? `${baseUrl}/school-events/${body.eventId}`
      : `${baseUrl}/checkout`;
    const notify_url = `${baseUrl}/api/payments/payfast-ipn`;

    const amount = total.toFixed(2);
    const item_name = body.itemName || `Order for ${body.customerId}`;
    const m_payment_id = (body.customerId || 'guest') + '-' + Date.now();

    const params = new URLSearchParams([
      ['merchant_id', merchant_id],
      ['merchant_key', merchant_key],
      ['return_url', return_url],
      ['cancel_url', cancel_url],
      ['notify_url', notify_url],
      ['amount', amount],
      ['item_name', item_name],
      ['m_payment_id', m_payment_id],
      ['email_address', customerEmail],
      ['custom_str1', customStr1],
    ]);
    if (isSchoolEvent) {
      params.set('custom_str2', 'school-event');
    }
    const url = `https://www.payfast.co.za/eng/process?${params.toString()}`;
    return NextResponse.json({ url });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Payment initiation failed' },
      { status: 400 }
    );
  }
} 