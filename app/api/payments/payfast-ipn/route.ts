import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseClient'
import crypto from 'crypto'
import { runOrderFulfillment } from '@/lib/services/orderFulfillmentService'
import { runSchoolEventPayfastFulfillment } from '@/lib/services/schoolEventOrderAutomation'

export const dynamic = 'force-dynamic'

const PAYFAST_IPN_PARAM_ORDER = [
  'merchant_id',
  'merchant_key',
  'return_url',
  'cancel_url',
  'notify_url',
  'name_first',
  'name_last',
  'email_address',
  'm_payment_id',
  'amount',
  'item_name',
  'item_description',
  'custom_str1',
  'custom_str2',
  'custom_str3',
  'custom_str4',
  'custom_str5',
  'custom_int1',
  'custom_int2',
  'custom_int3',
  'custom_int4',
  'custom_int5',
  'payment_status',
  'signature',
]

function looksLikeShopOrderUuid(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
}

function buildSignatureString(params: Record<string, string>, passphrase: string): string {
  const parts: string[] = []
  for (const key of PAYFAST_IPN_PARAM_ORDER) {
    const value = params[key]
    if (value !== undefined && value !== '' && key !== 'signature') {
      parts.push(`${key}=${encodeURIComponent(value).replace(/%20/g, '+')}`)
    }
  }
  if (passphrase) {
    parts.push(`passphrase=${encodeURIComponent(passphrase).replace(/%20/g, '+')}`)
  }
  return parts.join('&')
}

/**
 * PayFast ITN (Instant Transaction Notification). Only source of truth for payment success.
 * Handles shop `orders` and school `school_event_orders` (custom_str1 = order row id).
 */
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || ''
    let params: Record<string, string> = {}

    if (contentType.includes('application/x-www-form-urlencoded')) {
      const text = await request.text()
      const search = new URLSearchParams(text)
      search.forEach((value, key) => {
        params[key] = value
      })
    } else {
      const body = await request.json()
      params = typeof body === 'object' && body !== null ? (body as Record<string, string>) : {}
    }

    const paymentStatus = params.payment_status
    const customStr1 = params.custom_str1
    const signature = params.signature
    const mPaymentId = params.m_payment_id || ''
    const amount = params.amount ? parseFloat(params.amount) : 0
    const passphrase = process.env.PAYFAST_PASSPHRASE || ''

    if (!customStr1) {
      console.warn('[PayFast IPN] Missing custom_str1 (order id)')
      return new NextResponse('', { status: 200 })
    }

    if (paymentStatus !== 'COMPLETE') {
      console.log('[PayFast IPN] Ignoring non-COMPLETE status:', paymentStatus)
      return new NextResponse('', { status: 200 })
    }

    const isProduction = process.env.NODE_ENV === 'production'
    if (isProduction && !passphrase) {
      console.error('[PayFast IPN] PAYFAST_PASSPHRASE required in production')
      return new NextResponse('', { status: 400 })
    }
    if (signature && passphrase) {
      const expected = crypto
        .createHash('md5')
        .update(buildSignatureString(params, passphrase))
        .digest('hex')
      if (expected !== signature) {
        console.error('[PayFast IPN] Signature mismatch')
        return new NextResponse('', { status: 400 })
      }
    }

    if (!supabaseAdmin) {
      console.error('[PayFast IPN] SUPABASE_SERVICE_ROLE_KEY missing')
      return new NextResponse('', { status: 500 })
    }

    if (mPaymentId) {
      const { data: existingPayment } = await supabaseAdmin
        .from('payments')
        .select('id, status')
        .eq('external_id', mPaymentId)
        .maybeSingle()
      if (existingPayment && existingPayment.status === 'completed') {
        console.log('[PayFast IPN] Duplicate ITN ignored, payment already recorded:', mPaymentId)
        return new NextResponse('', { status: 200 })
      }
    }

    // --- School event order ---
    const { data: schoolOrder } = await supabaseAdmin
      .from('school_event_orders')
      .select('id, payment_status')
      .eq('id', customStr1)
      .maybeSingle()

    if (schoolOrder) {
      if ((schoolOrder as { payment_status?: string }).payment_status === 'PAID') {
        return new NextResponse('', { status: 200 })
      }

      if (mPaymentId) {
        const { error: payErr } = await supabaseAdmin.from('payments').insert({
          order_id: null,
          school_event_order_id: customStr1,
          payment_gateway: 'payfast',
          external_id: mPaymentId,
          amount,
          status: 'completed',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        if (payErr) {
          if (payErr.code === '23505') {
            console.log('[PayFast IPN] Duplicate payment row (race), ignoring:', mPaymentId)
            return new NextResponse('', { status: 200 })
          }
          console.error('[PayFast IPN] School event payment insert failed:', payErr)
          if (payErr.message?.includes('school_event_order_id') || payErr.code === '42703') {
            console.error(
              '[PayFast IPN] Apply migration supabase/migrations/20260410120000_payments_school_event_invoice_link.sql'
            )
          }
          return new NextResponse('', { status: 500 })
        }
      } else {
        console.warn('[PayFast IPN] School event ITN missing m_payment_id; continuing fulfillment')
      }

      try {
        const fulfillment = await runSchoolEventPayfastFulfillment(customStr1, amount)
        console.log('[PayFast IPN] School event fulfillment:', fulfillment)
        if (fulfillment.error) console.error('[PayFast IPN] School fulfillment error:', fulfillment.error)
      } catch (fulfillErr) {
        console.error('[PayFast IPN] School fulfillment threw:', fulfillErr)
      }

      return new NextResponse('', { status: 200 })
    }

    // --- Shop order (UUID ids only; school orders use cuid text) ---
    if (!looksLikeShopOrderUuid(customStr1)) {
      console.warn('[PayFast IPN] No matching school order and id is not a shop UUID:', customStr1)
      return new NextResponse('', { status: 200 })
    }

    const { data: order, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', customStr1)
      .eq('status', 'pending')
      .single()

    if (fetchError || !order) {
      console.warn('[PayFast IPN] No pending shop order for id:', customStr1, fetchError?.message)
      return new NextResponse('', { status: 200 })
    }

    if (mPaymentId) {
      const { error: payErr } = await supabaseAdmin.from('payments').insert({
        order_id: customStr1,
        payment_gateway: 'payfast',
        external_id: mPaymentId,
        amount,
        status: 'completed',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      if (payErr) {
        if (payErr.code === '23505') {
          console.log('[PayFast IPN] Duplicate payment row (race), ignoring:', mPaymentId)
          return new NextResponse('', { status: 200 })
        }
        console.error('[PayFast IPN] Failed to insert payment:', payErr)
        return new NextResponse('', { status: 500 })
      }
    }

    const { error: orderError } = await supabaseAdmin
      .from('orders')
      .update({ status: 'paid', updated_at: new Date().toISOString() })
      .eq('id', customStr1)
      .eq('status', 'pending')

    if (orderError) {
      console.error('[PayFast IPN] Update order failed:', orderError)
      return new NextResponse('', { status: 500 })
    }

    try {
      const fulfillment = await runOrderFulfillment(order.id)
      console.log('[PayFast IPN] Fulfillment:', fulfillment)
      if (fulfillment.error) console.error('[PayFast IPN] Fulfillment error:', fulfillment.error)
    } catch (fulfillErr) {
      console.error('[PayFast IPN] Fulfillment threw:', fulfillErr)
    }

    const customerId = order.customer_id
    const { data: customer } = await supabaseAdmin
      .from('customers')
      .select('first_name, last_name, email, phone')
      .eq('id', customerId)
      .single()

    if (process.env.GMAIL_APP_PASSWORD && customer) {
      try {
        const { data: orderItems } = await supabaseAdmin
          .from('order_items')
          .select('*')
          .eq('order_id', order.id)

        const shippingAddress =
          typeof order.shipping_address === 'string'
            ? JSON.parse(order.shipping_address || '{}')
            : order.shipping_address || {}
        const orderNumber = String(order.order_number || `ORD-${order.id.slice(0, 8).toUpperCase()}`)
        const orderDate = new Date(order.created_at).toLocaleDateString('en-ZA', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })

        const itemsHtml = (orderItems || []).map(
          (item: any) => `
          <tr>
            <td style="padding:12px 0; border-top:1px solid #E4E7EC;">
              <table role="presentation" width="100%">
                <tr class="stack">
                  <td style="width:64px;" valign="top">
                    <img src="${item.product_image || 'https://via.placeholder.com/64x64?text=Item'}" width="64" height="64" alt="${item.product_name}" style="border-radius:8px; display:block;">
                  </td>
                  <td valign="top" style="padding-left:12px;">
                    <div style="font-family:Arial,Helvetica,sans-serif; font-size:14px; color:#101828; font-weight:600;">
                      ${item.product_name}${item.selected_color || item.selected_size ? ` • ${[item.selected_color, item.selected_size].filter(Boolean).join(' • ')}` : ''}
                    </div>
                    <div class="muted" style="font-family:Arial,Helvetica,sans-serif; font-size:12px; margin-top:2px;">Qty ${item.quantity}</div>
                  </td>
                  <td valign="top" align="right">
                    <div style="font-family:Arial,Helvetica,sans-serif; font-size:14px; color:#101828; font-weight:600;">
                      R${Number(item.price_at_time * item.quantity).toFixed(2)}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>`
        ).join('')

        const total = Number(order.total_amount)
        const shipping = Number(order.shipping_cost) || 0
        const subtotal = total - shipping

        const htmlEmail = `<!doctype html>
<html><head><meta charset="utf-8"><title>MOTARRO Supplies • Payment Received</title></head>
<body style="background:#F2F4F7; margin:0; padding:24px;">
  <table role="presentation" width="100%" style="max-width:600px; margin:0 auto; background:#fff; border-radius:12px;">
    <tr><td style="padding:24px;">
      <h1 style="margin:0; font-size:24px; color:#101828;">Thank you, ${customer.first_name}!</h1>
      <p style="margin:8px 0 0; font-size:14px; color:#344054;">Your payment has been received. Order <strong>#${orderNumber}</strong> is confirmed (${orderDate}).</p>
      <p style="margin:16px 0 0; font-size:14px; color:#344054;">Shipping: ${shippingAddress.street || ''}, ${shippingAddress.city || ''} ${shippingAddress.state || ''} ${shippingAddress.zipCode || ''}, ${shippingAddress.country || 'South Africa'}.</p>
      <table role="presentation" width="100%" style="margin-top:16px;">
        ${itemsHtml}
        <tr><td align="right" style="padding:8px 0;">Subtotal</td><td align="right" width="120">R${subtotal.toFixed(2)}</td></tr>
        <tr><td align="right" style="padding:4px 0;">Shipping</td><td align="right" width="120">R${shipping.toFixed(2)}</td></tr>
        <tr><td align="right" style="padding:10px 0; font-weight:700;">Total</td><td align="right" width="120">R${total.toFixed(2)}</td></tr>
      </table>
      <p style="margin:24px 0 0; font-size:12px; color:#667085;">Questions? Contact <a href="mailto:motarrodotcoza@gmail.com">motarrodotcoza@gmail.com</a></p>
    </td></tr>
  </table>
</body></html>`

        const nodemailer = (await import('nodemailer')).default
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.GMAIL_FROM || 'dartonstaker@gmail.com',
            pass: process.env.GMAIL_APP_PASSWORD,
          },
        })
        await transporter.sendMail({
          from: '"MOTARRO Supplies" <dartonstaker@gmail.com>',
          to: customer.email,
          subject: `Payment Received - Order #${orderNumber}`,
          html: htmlEmail,
        })
        console.log('[PayFast IPN] Confirmation email sent to', customer.email)
      } catch (emailErr) {
        console.error('[PayFast IPN] Email failed:', emailErr)
      }
    }

    return new NextResponse('', { status: 200 })
  } catch (err) {
    console.error('[PayFast IPN] Error:', err)
    return new NextResponse('', { status: 500 })
  }
}
