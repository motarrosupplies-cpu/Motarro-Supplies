import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventId, parentInfo, orderItems, totalAmount } = body;

    // Validate required fields
    if (!eventId || !parentInfo || !orderItems || !totalAmount) {
      return NextResponse.json(
        { error: 'Missing required order information' },
        { status: 400 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        {
          error:
            "Server misconfigured: SUPABASE_SERVICE_ROLE_KEY is required to create orders",
        },
        { status: 503 }
      );
    }

    const db = supabaseAdmin;

    // Generate unique order number
    const orderNumber = `SE-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create the order using Supabase
    const { data: order, error: orderError } = await db
      .from('school_event_orders')
      .insert({
        event_id: eventId,
        order_number: orderNumber,
        parent_name: parentInfo.name,
        parent_email: parentInfo.email,
        parent_phone: parentInfo.phone,
        school_name: parentInfo.schoolName,
        grade: parentInfo.grade || null,
        class_name: parentInfo.className || null,
        total_amount: totalAmount,
        status: 'PENDING',
        payment_status: 'PENDING',
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
    const orderItemsData = orderItems.map((item: any) => ({
      order_id: order.id,
      product_id: item.productId,
      variant_id: item.variantId ?? null,
      child_name: item.childName,
      child_age: item.childAge ?? null,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      total_price: item.totalPrice,
      special_instructions: item.specialInstructions || null,
    }));

    console.log('Inserting order items:', orderItemsData);

    const { error: itemsError } = await db
      .from('school_event_order_items')
      .insert(orderItemsData);

    if (itemsError) {
      console.error('Error creating order items:', itemsError);
      
      // Try to delete the order if items creation fails
      await db.from('school_event_orders').delete().eq('id', order.id);
      
      return NextResponse.json(
        { error: `Failed to create order items: ${itemsError.message}` },
        { status: 500 }
      );
    }

    console.log('Order items created successfully');

    // Create additional item addons for each order item
    if (orderItems.some(item => item.selectedAddons && item.selectedAddons.length > 0)) {
      try {
        // Get the created order items to link addons
        const { data: createdOrderItems, error: fetchError } = await db
          .from('school_event_order_items')
          .select('id, product_id, child_name')
          .eq('order_id', order.id);

        if (fetchError) {
          console.error('Error fetching order items for addons:', fetchError);
        } else {
          const addonData = [];
          
          for (const item of orderItems) {
            if (item.selectedAddons && item.selectedAddons.length > 0) {
              // Find the corresponding order item ID
              const orderItem = createdOrderItems?.find(
                (oi: { product_id: string; child_name: string }) =>
                  oi.product_id === item.productId && oi.child_name === item.childName
              );
              
              if (orderItem) {
                for (const addon of item.selectedAddons) {
                  addonData.push({
                    order_item_id: orderItem.id,
                    additional_item_id: addon.additionalItemId,
                    selected_option_id: addon.selectedOptionId || null,
                    quantity: addon.quantity,
                    unit_price: addon.unitPrice,
                    total_price: addon.totalPrice,
                  });
                }
              }
            }
          }

          if (addonData.length > 0) {
            console.log('Creating additional item addons:', addonData);
            
            const { error: addonError } = await db
              .from('school_event_order_item_addons')
              .insert(addonData);
            
            if (addonError) {
              console.error('Error creating addon items:', addonError);
            } else {
              console.log('Additional item addons created successfully');
            }
          }
        }
      } catch (addonError) {
        console.error('Error creating addon items:', addonError);
        // Don't fail the order if addons fail - just log the error
      }
    }

    // Send confirmation email (optional - don't fail order if email fails)
    if (process.env.GMAIL_APP_PASSWORD) {
      try {
        const nodemailer = (await import("nodemailer")).default;
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: "dartonstaker@gmail.com",
            pass: process.env.GMAIL_APP_PASSWORD,
          },
        });

        // Build rich HTML email (LASA-style) with live order data
        const productIds = orderItems.map((item: any) => item.productId);
        const { data: products } = await db
          .from('event_products')
          .select('id, name, imageUrl')
          .in('id', productIds);

        const variantIds = orderItems
          .map((item: any) => item.variantId)
          .filter(Boolean);
        const { data: variants } = await db
          .from('event_product_variants')
          .select('id, size, color')
          .in('id', variantIds as string[]);

        const productMap = new Map((products || []).map(p => [p.id, p]));
        const variantMap = new Map((variants || []).map(v => [v.id, v]));

        const orderDate = new Date().toLocaleDateString('en-ZA', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });

        const itemsHtml = orderItems.map((item: any) => {
          const product = productMap.get(item.productId);
          const variant = item.variantId ? variantMap.get(item.variantId) : null;
          const productName = product?.name || 'Item';
          const variantText = variant ? ` • ${variant.size} • ${variant.color}` : '';
          const imageUrl = product?.imageUrl || 'https://via.placeholder.com/64x64?text=Item';

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
                              Child: ${item.childName} • Qty ${item.quantity}
                            </div>
                            ${item.specialInstructions ? `<div class="muted" style="font-family:Arial,Helvetica,sans-serif; font-size:11px; margin-top:4px; font-style:italic;">Note: ${item.specialInstructions}</div>` : ''}
                          </td>
                          <td valign="top" align="right">
                            <div style="font-family:Arial,Helvetica,sans-serif; font-size:14px; color:#101828; font-weight:600;">
                              R${Number(item.totalPrice).toFixed(2)}
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>`;
        }).join('');

        const subtotal = Number(totalAmount);
        const shipping = 0;
        const tax = 0;
        const finalTotal = Number(totalAmount);

        const htmlEmail = `<!doctype html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="x-apple-disable-message-reformatting">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>MOTARRO Supplies • School Event Order Confirmation</title>
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
      Your MOTARRO Supplies school event order is confirmed. We'll let you know when it's ready for pickup.
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
                  Thank you, ${parentInfo.name}!
                </h1>
                <p style="margin:8px 0 0; font-family:Arial,Helvetica,sans-serif; font-size:14px; line-height:22px; color:#344054;">
                  Your school event order <strong>#${orderNumber}</strong> has been received on ${orderDate} and is now being prepared.
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:16px 28px;">
                <table role="presentation" width="100%">
                  <tr class="stack">
                    <td valign="top" style="padding:12px 0; width:50%;">
                      <div style="font-family:Arial,Helvetica,sans-serif; font-size:12px; color:#667085;">School Information</div>
                      <div style="font-family:Arial,Helvetica,sans-serif; font-size:14px; color:#101828; margin-top:4px;">
                        ${parentInfo.schoolName}<br>
                        ${parentInfo.grade ? `Grade: ${parentInfo.grade}` : ''}<br>
                        ${parentInfo.className ? `Class: ${parentInfo.className}` : ''}
                      </div>
                    </td>
                    <td valign="top" style="padding:12px 0; width:50%;">
                      <div style="font-family:Arial,Helvetica,sans-serif; font-size:12px; color:#667085;">Order Summary</div>
                      <div style="font-family:Arial,Helvetica,sans-serif; font-size:14px; color:#101828; margin-top:4px;">
                        Payment: Bank Transfer<br>
                        Delivery: School Pickup<br>
                        Status: Pending Confirmation
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
                    Please make payment to our bank account. We'll send you the banking details via WhatsApp to ${parentInfo.phone} within the next few minutes.
                  </p>
                </div>
              </td>
            </tr>

            <tr>
              <td style="padding:24px 28px 8px;" align="center">
                <a class="btn" href="https://www.motarro.co.za/school-events" target="_blank">View School Events</a>
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
          from: '"MOTARRO Supplies School Events" <dartonstaker@gmail.com>',
          to: parentInfo.email,
          subject: `Order Confirmation - ${orderNumber}`,
          html: htmlEmail
        });

        // Send notification to admin using mirrored rich HTML
        const adminHeader = `
          <div style="background:#FFF7ED; border-left:4px solid #F97316; padding:12px 16px; margin:0 28px 12px; border-radius:6px;">
            <div style="font-family:Arial,Helvetica,sans-serif; font-size:14px; color:#7C2D12; font-weight:700;">Admin Copy</div>
            <div style="font-family:Arial,Helvetica,sans-serif; font-size:13px; color:#7C2D12;">New school event order received.</div>
            <div style="font-family:Arial,Helvetica,sans-serif; font-size:13px; color:#7C2D12;">Parent: ${parentInfo.name} • ${parentInfo.email} • ${parentInfo.phone}</div>
          </div>`;

        const adminHtml = htmlEmail.replace('<table role="presentation" width="600" class="container wrapper"', `${adminHeader}<table role="presentation" width="600" class="container wrapper"`);

        await transporter.sendMail({
          from: '"MOTARRO Supplies School Events" <dartonstaker@gmail.com>',
          to: "motarrodotcoza@gmail.com",
          subject: `New School Event Order - ${orderNumber}`,
          html: adminHtml
        });

        console.log('Confirmation emails sent successfully');
      } catch (emailError) {
        console.error('Error sending confirmation emails:', emailError);
        // Don't fail the order creation if email fails
      }
    } else {
      console.log('GMAIL_APP_PASSWORD not configured, skipping email sending');
    }

    return NextResponse.json({
      orderId: order.id,
      orderNumber,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating school event order:', error);
    return NextResponse.json(
      { error: `Failed to create order: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
