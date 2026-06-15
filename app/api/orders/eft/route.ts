import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabaseClient";
import { validateOrderItemsStock } from "@/lib/services/stockValidationService";

/** Creates EFT order after validating stock. Order stays pending until payment is confirmed manually; stock is deducted on admin Accept. */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      customerId, 
      items, 
      total, 
      shippingCost, 
      shippingAddress, 
      specialInstructions,
      discountCode,
      discountAmount
    } = body;

    console.log('Creating EFT order with data:', { customerId, items, total, shippingCost });

    // Validate required fields
    if (!customerId || !items || !total) {
      return NextResponse.json(
        { error: 'Missing required order information' },
        { status: 400 }
      );
    }

    // Server-side stock validation: reject before creating order to prevent oversell
    if (supabaseAdmin && Array.isArray(items) && items.length > 0) {
      const stockCheck = await validateOrderItemsStock(supabaseAdmin, items);
      if (!stockCheck.valid) {
        return NextResponse.json(
          { error: stockCheck.message || 'Insufficient stock for one or more items.' },
          { status: 400 }
        );
      }
    }

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Use service role for order writes so RLS does not block
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Server misconfiguration: SUPABASE_SERVICE_ROLE_KEY is required for order creation.' },
        { status: 500 }
      )
    }
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        customer_id: customerId,
        order_number: orderNumber,
        status: 'pending',
        total_amount: total,
        shipping_cost: shippingCost || 0,
        discount_code: discountCode || null,
        discount_amount: discountAmount || 0,
        payment_method: 'eft',
        shipping_address: JSON.stringify(shippingAddress),
        special_instructions: specialInstructions,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      return NextResponse.json(
        { error: `Failed to create order: ${orderError.message}` },
        { status: 500 }
      );
    }

    console.log('Order created successfully:', order);

    // Create order items using Supabase
    const orderItemsData = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.productId,
      product_name: item.name,
      product_image: item.image,
      quantity: item.quantity || 1,
      price_at_time: item.price,
      selected_color_id: item.selectedColorId || null,
      selected_color: item.selectedColor || null,
      selected_size_id: item.selectedSizeId || null,
      selected_size: item.selectedSize || null,
      custom_printing: item.customPrinting ? JSON.stringify(item.customPrinting) : null,
      created_at: new Date().toISOString(),
    }));

    console.log('Inserting order items:', orderItemsData);

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItemsData);

    if (itemsError) {
      console.error('Error creating order items:', itemsError);
      
      // Try to delete the order if items creation fails
      await supabaseAdmin
        .from('orders')
        .delete()
        .eq('id', order.id);
      
      return NextResponse.json(
        { error: `Failed to create order items: ${itemsError.message}` },
        { status: 500 }
      );
    }

    console.log('Order items created successfully');

    // Mark discount code as used if provided
    if (discountCode && supabaseAdmin) {
      try {
        await supabaseAdmin
          .from('newsletter_subscribers')
          .update({ code_used: true })
          .eq('discount_code', discountCode.toUpperCase().trim())
          .eq('code_used', false);
        console.log('Discount code marked as used:', discountCode);
      } catch (error) {
        console.error('Error marking discount code as used:', error);
        // Don't fail the order if discount code update fails
      }
    }

    // Get customer details for email
    const { data: customer, error: customerError } = await supabaseAdmin
      .from('customers')
      .select('first_name, last_name, email, phone')
      .eq('id', customerId)
      .single();

    if (customerError) {
      console.error('Error fetching customer:', customerError);
    }

    // Send confirmation email (optional - don't fail order if email fails)
    if (process.env.GMAIL_APP_PASSWORD && customer) {
      try {
        const nodemailer = (await import("nodemailer")).default;
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: "dartonstaker@gmail.com",
            pass: process.env.GMAIL_APP_PASSWORD,
          },
        });

        // Get product details for email
        const productIds = items.map((item: any) => item.productId);
        const { data: products } = await supabaseAdmin
          .from('products')
          .select('id, name, image')
          .in('id', productIds);

        const productMap = new Map((products || []).map(p => [p.id, p]));

        const orderDate = new Date().toLocaleDateString('en-ZA', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });

        const itemsHtml = items.map((item: any) => {
          const product = productMap.get(item.productId);
          const productName = product?.name || item.name;
          const imageUrl = product?.image || item.image || 'https://via.placeholder.com/64x64?text=Item';
          const variantText = item.selectedColor || item.selectedSize ? 
            ` • ${[item.selectedColor, item.selectedSize].filter(Boolean).join(' • ')}` : '';

          return `
                  <tr>
                    <td style="padding:12px 0; border-top:1px solid #E4E7EC;">
                      <table role="presentation" width="100%">
                        <tr class="stack">
                          <td style="width:64px;" valign="top">
                            <img src="${imageUrl}" width="64" height="64" alt="${productName}" style="border-radius:8px; display:block;">
                          </td>
                          <td valign="top" style="padding-left:12px;">
                            <div style="font-family:Arial,Helvetica,sans-serif; font-size:14px; color:#101828; font-weight:600;">
                              ${productName}${variantText}
                            </div>
                            <div class="muted" style="font-family:Arial,Helvetica,sans-serif; font-size:12px; margin-top:2px;">
                              Qty ${item.quantity}
                            </div>
                            ${item.customPrinting ? `<div class="muted" style="font-family:Arial,Helvetica,sans-serif; font-size:11px; margin-top:4px; font-style:italic;">Custom Printing: ${item.customPrinting.instructions || 'See details'}</div>` : ''}
                          </td>
                          <td valign="top" align="right">
                            <div style="font-family:Arial,Helvetica,sans-serif; font-size:14px; color:#101828; font-weight:600;">
                              R${Number(item.price * item.quantity).toFixed(2)}
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>`;
        }).join('');

        const subtotal = Number(total) - (shippingCost || 0);
        const shipping = shippingCost || 0;
        const tax = 0; // VAT calculated at checkout
        const finalTotal = Number(total);

        const htmlEmail = `<!doctype html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="x-apple-disable-message-reformatting">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>MOTARRO Supplies • Order Confirmation</title>
    <!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]-->
    <style>
      body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
      table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
      img { -ms-interpolation-mode: bicubic; }
      img { border: 0; outline: none; text-decoration: none; }
      table { border-collapse: collapse !important; }
      body { margin: 0; padding: 0; width: 100% !important; height: 100% !important; }
      :root { color-scheme: light dark; supported-color-schemes: light dark; }
      a { color: #0A7C66; text-decoration: none; }
      .btn { background:#0A7C66; color:#ffffff !important; border-radius:6px; padding:12px 18px; display:inline-block; font-weight:600; }
      .muted { color:#667085; }
      .caps { letter-spacing:.5px; text-transform:uppercase; font-size:12px; color:#667085; }
      .total-row td { padding-top:10px; border-top:1px solid #E4E7EC; font-weight:700; }
      @media (prefers-color-scheme: dark) {
        body { background:#0b0b0b !important; }
        .wrapper { background:#111214 !important; }
        .card { background:#151719 !important; }
        .muted, .caps { color:#9aa4af !important; }
        .line { border-color:#24303a !important; }
        .btn { background:#16a085 !important; }
      }
      @media screen and (max-width:600px) {
        .container { width:100% !important; }
        .px { padding-left:16px !important; padding-right:16px !important; }
        .stack td { display:block; width:100% !important; }
        .center { text-align:center !important; }
      }
    </style>
  </head>
  <body style="background:#F2F4F7;">
    <div style="display:none; max-height:0; overflow:hidden; mso-hide:all;">
      Your MOTARRO Supplies order is confirmed. We'll process it once payment is received.
    </div>

    <table role="presentation" width="100%" bgcolor="#F2F4F7">
      <tr>
        <td align="center" class="px" style="padding:24px;">
          <table role="presentation" width="600" class="container wrapper" style="width:600px; background:#ffffff; border-radius:12px; overflow:hidden;">
            <tr>
              <td style="padding:24px 28px;">
                <table role="presentation" width="100%">
                  <tr>
                    <td align="left">
                      <a href="https://www.motarro.co.za" target="_blank" style="display:inline-block;">
                        <img src="https://hkervihhlhktjdxcekhi.supabase.co/storage/v1/object/public/product-images/MOTARRO Supplies-logo.PNG" alt="MOTARRO Supplies" style="display:block; max-width:160px; height:auto;">
                      </a>
                    </td>
                    <td align="right" class="center">
                      <span class="caps">Order Confirmation</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td class="card" style="padding:0 28px 8px 28px;">
                <h1 style="margin:0; font-family:Arial,Helvetica,sans-serif; font-size:24px; line-height:32px; color:#101828;">
                  Thank you, ${customer.first_name}!
                </h1>
                <p style="margin:8px 0 0; font-family:Arial,Helvetica,sans-serif; font-size:14px; line-height:22px; color:#344054;">
                  Your order <strong>#${orderNumber}</strong> has been received on ${orderDate} and is pending payment confirmation.
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:16px 28px;">
                <table role="presentation" width="100%">
                  <tr class="stack">
                    <td valign="top" style="padding:12px 0; width:50%;">
                      <div style="font-family:Arial,Helvetica,sans-serif; font-size:12px; color:#667085;">Shipping Address</div>
                      <div style="font-family:Arial,Helvetica,sans-serif; font-size:14px; color:#101828; margin-top:4px;">
                        ${shippingAddress.street}<br>
                        ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zipCode}<br>
                        ${shippingAddress.country}
                      </div>
                    </td>
                    <td valign="top" style="padding:12px 0; width:50%;">
                      <div style="font-family:Arial,Helvetica,sans-serif; font-size:12px; color:#667085;">Order Summary</div>
                      <div style="font-family:Arial,Helvetica,sans-serif; font-size:14px; color:#101828; margin-top:4px;">
                        Payment: Bank Transfer (EFT)<br>
                        Status: Pending Payment<br>
                        Order: ${orderNumber}
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:8px 28px 0;">
                <table role="presentation" width="100%">
                  <tr>
                    <td colspan="2" style="font-family:Arial,Helvetica,sans-serif; font-weight:700; font-size:14px; color:#101828; padding:8px 0;">
                      Items Ordered
                    </td>
                  </tr>

                  ${itemsHtml}

                  <tr class="total-row">
                    <td align="right" style="padding:6px 0; font-family:Arial,Helvetica,sans-serif; color:#101828;">Subtotal</td>
                    <td align="right" style="padding:6px 0; font-family:Arial,Helvetica,sans-serif; color:#101828;" width="140">R${subtotal.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td align="right" class="muted" style="padding:4px 0; font-family:Arial,Helvetica,sans-serif;">Shipping</td>
                    <td align="right" class="muted" style="padding:4px 0; font-family:Arial,Helvetica,sans-serif;" width="140">R${shipping.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td align="right" class="muted" style="padding:4px 0; font-family:Arial,Helvetica,sans-serif;">VAT (15%)</td>
                    <td align="right" class="muted" style="padding:4px 0; font-family:Arial,Helvetica,sans-serif;" width="140">R${tax.toFixed(2)}</td>
                  </tr>
                  <tr class="total-row">
                    <td align="right" style="padding:10px 0; font-family:Arial,Helvetica,sans-serif; font-size:16px;">Total</td>
                    <td align="right" style="padding:10px 0; font-family:Arial,Helvetica,sans-serif; font-size:16px;" width="140">R${finalTotal.toFixed(2)}</td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:24px 28px 8px;">
                <div style="background:#F9FAFB; border-radius:8px; padding:16px; border-left:4px solid #0A7C66;">
                  <h3 style="margin:0 0 8px; font-family:Arial,Helvetica,sans-serif; font-size:16px; color:#101828;">Payment Instructions</h3>
                  <p style="margin:0; font-family:Arial,Helvetica,sans-serif; font-size:14px; color:#344054;">
                    Please make payment to our bank account using order number <strong>${orderNumber}</strong> as the reference. 
                    We'll process your order once payment is received. Banking details will be sent via WhatsApp shortly.
                  </p>
                </div>
              </td>
            </tr>

            <tr>
              <td style="padding:24px 28px 8px;" align="center">
                <a class="btn" href="https://www.motarro.co.za/products" target="_blank">Continue Shopping</a>
                <div style="height:12px; line-height:12px;">&zwnj;</div>
                <a href="mailto:motarrodotcoza@gmail.com" target="_blank" style="font-family:Arial,Helvetica,sans-serif; font-size:12px;">Contact Support</a>
              </td>
            </tr>

            <tr>
              <td style="padding:12px 28px 28px;">
                <table role="presentation" width="100%">
                  <tr class="stack">
                    <td style="padding:12px 0;">
                      <div style="font-family:Arial,Helvetica,sans-serif; font-size:12px; color:#667085;">
                        Questions? Reply to this email or contact us at <a href="mailto:motarrodotcoza@gmail.com">motarrodotcoza@gmail.com</a>.
                      </div>
                    </td>
                    <td align="right" class="center" style="padding:12px 0;">
                      <a href="https://www.motarro.co.za" target="_blank" style="font-family:Arial,Helvetica,sans-serif; font-size:12px;">Visit MOTARRO Supplies</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <table role="presentation" width="600" class="container" style="width:600px; margin-top:12px;">
            <tr>
              <td align="center" style="padding:12px; font-family:Arial,Helvetica,sans-serif; font-size:12px; color:#667085;">
                © ${new Date().getFullYear()} MOTARRO Supplies • All rights reserved<br>
                South Africa
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
 </html>`;

        await transporter.sendMail({
          from: '"MOTARRO Supplies" <dartonstaker@gmail.com>',
          to: customer.email,
          subject: `Order Confirmation - ${orderNumber}`,
          html: htmlEmail
        });

        // Send notification to admin using mirrored rich HTML
        const adminHeader = `
          <div style="background:#FFF7ED; border-left:4px solid #F97316; padding:12px 16px; margin:0 28px 12px; border-radius:6px;">
            <div style="font-family:Arial,Helvetica,sans-serif; font-size:14px; color:#7C2D12; font-weight:700;">Admin Copy</div>
            <div style="font-family:Arial,Helvetica,sans-serif; font-size:13px; color:#7C2D12;">New EFT order received.</div>
            <div style="font-family:Arial,Helvetica,sans-serif; font-size:13px; color:#7C2D12;">Customer: ${customer.first_name} ${customer.last_name} • ${customer.email} • ${customer.phone}</div>
          </div>`;

        const adminHtml = htmlEmail.replace('<table role="presentation" width="600" class="container wrapper"', `${adminHeader}<table role="presentation" width="600" class="container wrapper"`);

        await transporter.sendMail({
          from: '"MOTARRO Supplies" <dartonstaker@gmail.com>',
          to: "motarrodotcoza@gmail.com",
          subject: `New EFT Order - ${orderNumber}`,
          html: adminHtml
        });

        console.log('Confirmation emails sent successfully');
      } catch (emailError) {
        console.error('Error sending confirmation emails:', emailError);
        // Don't fail the order creation if email fails
      }
    } else {
      console.log('GMAIL_APP_PASSWORD not configured or customer not found, skipping email sending');
    }

    return NextResponse.json({ 
      orderId: order.id,
      orderNumber: orderNumber 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating EFT order:', error);
    return NextResponse.json(
      { error: `Failed to create order: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
