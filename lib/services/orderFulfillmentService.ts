/**
 * Post-payment order fulfillment: invoice creation, stock deduction, invoice email.
 * Called from PayFast IPN after marking order as paid. Failures in email do not roll back order/invoice.
 */
import { supabaseAdmin } from '@/lib/supabaseClient';
import { invoiceService } from '@/lib/services/invoiceService';
import { PDFGenerator } from '@/lib/utils/pdfGenerator';

export interface FulfillmentResult {
  invoiceCreated: boolean;
  stockDeducted: boolean;
  emailSent: boolean;
  error?: string;
}

/**
 * Create invoice from order and link to order (order_id, invoice_id). Updates order status to 'invoiced'.
 * Uses supabaseAdmin so it works from IPN (no user session).
 */
export async function createInvoiceFromOrder(orderId: string): Promise<{ invoiceId: string; invoiceNumber: string } | null> {
  if (!supabaseAdmin) return null;
  const { data: orderRow, error: orderErr } = await supabaseAdmin.from('orders').select('*').eq('id', orderId).single();
  if (orderErr || !orderRow) return null;
  const customer = await (await import('@/lib/services/customerService')).customerService.getCustomerById(orderRow.customer_id);
  if (!customer) return null;
  const { data: orderItems, error: itemsErr } = await supabaseAdmin.from('order_items').select('*').eq('order_id', orderId);
  if (itemsErr || !orderItems?.length) return null;

  const invoiceItems = orderItems.map((item: any) => ({
    description: item.product_name || item.description || '',
    quantity: item.quantity,
    unitPrice: Number(item.price_at_time),
    total: item.quantity * Number(item.price_at_time),
    productId: item.product_id,
  }));

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 30);
  const invoiceData = {
    customerId: orderRow.customer_id,
    dueDate,
    items: invoiceItems,
    notes: `Generated from Order ${orderId}`,
    terms: 'Payment received. Thank you for your order.',
  };

  const invoice = await invoiceService.createInvoice(invoiceData);
  if (!invoice) return null;

  await supabaseAdmin.from('invoices').update({ order_id: orderId, updated_at: new Date().toISOString() }).eq('id', invoice.id);
  await supabaseAdmin.from('orders').update({
    invoice_id: invoice.id,
    status: 'invoiced',
    updated_at: new Date().toISOString(),
  }).eq('id', orderId);

  return { invoiceId: invoice.id, invoiceNumber: invoice.invoiceNumber };
}

/**
 * Deduct stock for each order item by product_id. Logs to stock_updates with order_id. Sets order.stock_deducted = true.
 * Enforces non-negative stock; throws if any line would go negative.
 */
export async function deductStockFromOrder(orderId: string): Promise<void> {
  if (!supabaseAdmin) throw new Error('supabaseAdmin required');
  const { data: items } = await supabaseAdmin.from('order_items').select('*').eq('order_id', orderId);
  if (!items || items.length === 0) return;

  for (const item of items) {
    const productId = item.product_id;
    const qty = Number(item.quantity) || 0;
    if (qty <= 0) continue;

    let previousStock = 0;
    let newStock = 0;
    let productName = item.product_name || productId;
    let updated = false;

    const tryProducts = await supabaseAdmin.from('products').select('id, name, stock').eq('id', productId).maybeSingle();
    if (tryProducts.data) {
      previousStock = Math.max(0, Number(tryProducts.data.stock) ?? 0);
      newStock = previousStock - qty;
      if (newStock < 0) throw new Error(`Insufficient stock for product ${tryProducts.data.name}: requested ${qty}, available ${previousStock}`);
      const { error } = await supabaseAdmin.from('products').update({ stock: newStock }).eq('id', productId);
      if (error) throw new Error(`Failed to update stock for product ${productId}: ${error.message}`);
      productName = tryProducts.data.name || productName;
      updated = true;
    }

    if (!updated) {
      const { data: simple } = await supabaseAdmin.from('simple_products').select('id, name, stock').eq('id', productId).maybeSingle();
      if (simple) {
        previousStock = Math.max(0, Number(simple.stock) ?? 0);
        newStock = previousStock - qty;
        if (newStock < 0) throw new Error(`Insufficient stock for product ${simple.name}: requested ${qty}, available ${previousStock}`);
        const { error } = await supabaseAdmin.from('simple_products').update({ stock: newStock }).eq('id', productId);
        if (error) throw new Error(`Failed to update stock for simple product ${productId}: ${error.message}`);
        productName = simple.name || productName;
        updated = true;
      }
    }

    if (!updated) {
      const { data: variants } = await supabaseAdmin.from('full_variants').select('id, product_id, stock_available').eq('product_id', productId);
      if (variants && variants.length > 0) {
        const variant = item.selected_color_id || item.selected_size_id
          ? variants.find((v: any) => v.id === item.selected_color_id || v.id === item.selected_size_id) || variants[0]
          : variants[0];
        previousStock = Math.max(0, Number(variant.stock_available) ?? 0);
        newStock = previousStock - qty;
        if (newStock < 0) throw new Error(`Insufficient variant stock for product ${productId}: requested ${qty}, available ${previousStock}`);
        const { error } = await supabaseAdmin.from('full_variants').update({ stock_available: newStock }).eq('id', variant.id).select();
        if (error) throw new Error(`Failed to update variant stock: ${error.message}`);
        const { data: prod } = await supabaseAdmin.from('full_variant_products').select('name').eq('id', productId).maybeSingle();
        productName = (prod && prod.name) || productName;
        updated = true;
      }
    }

    await supabaseAdmin.from('stock_updates').insert({
      product_id: productId,
      product_name: productName,
      quantity_sold: qty,
      previous_stock: previousStock,
      new_stock: newStock,
      order_id: orderId,
      date: new Date().toISOString(),
    });
  }

  await supabaseAdmin.from('orders').update({ stock_deducted: true, updated_at: new Date().toISOString() }).eq('id', orderId);
}

/**
 * Generate invoice PDF and send to customer. On failure sets order.invoice_email_sent = false (do not throw).
 */
export async function sendInvoiceEmailForOrder(orderId: string): Promise<boolean> {
  if (!supabaseAdmin) return false;
  const { data: order } = await supabaseAdmin.from('orders').select('invoice_id, customer_id').eq('id', orderId).single();
  if (!order || !order.invoice_id) {
    console.warn('[orderFulfillment] No invoice_id on order', orderId);
    return false;
  }
  const invoice = await invoiceService.getInvoice(order.invoice_id);
  if (!invoice) return false;
  const customer = await (await import('@/lib/services/customerService')).customerService.getCustomerById(order.customer_id);
  if (!customer?.email) {
    await supabaseAdmin.from('orders').update({ invoice_email_sent: false }).eq('id', orderId);
    return false;
  }

  try {
    const pdfGen = new PDFGenerator();
    const doc = await pdfGen.generateInvoicePDF(invoice);
    const pdfBase64 = doc.output('datauristring').split(',')[1];
    if (!pdfBase64) throw new Error('PDF output failed');

    const nodemailer = (await import('nodemailer')).default;
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_FROM || 'dartonstaker@gmail.com',
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
    await transporter.sendMail({
      from: '"MOTARRO Supplies" <dartonstaker@gmail.com>',
      to: customer.email,
      subject: `Your Invoice ${invoice.invoiceNumber} – MOTARRO Supplies`,
      html: `Your payment has been received. Please find your invoice ${invoice.invoiceNumber} attached.`,
      attachments: [{ filename: `invoice-${invoice.invoiceNumber}.pdf`, content: Buffer.from(pdfBase64, 'base64'), contentType: 'application/pdf' }],
    });

    await supabaseAdmin.from('orders').update({ invoice_email_sent: true, updated_at: new Date().toISOString() }).eq('id', orderId);
    return true;
  } catch (err) {
    console.error('[orderFulfillment] Invoice email failed:', err);
    await supabaseAdmin.from('orders').update({ invoice_email_sent: false, updated_at: new Date().toISOString() }).eq('id', orderId);
    return false;
  }
}

/**
 * Run full fulfillment after payment: create invoice, deduct stock, send invoice email.
 * Email failure does not roll back order or invoice; order is marked for resend.
 */
export async function runOrderFulfillment(orderId: string): Promise<FulfillmentResult> {
  const result: FulfillmentResult = { invoiceCreated: false, stockDeducted: false, emailSent: false };

  try {
    const inv = await createInvoiceFromOrder(orderId);
    result.invoiceCreated = !!inv;
    if (!inv) {
      result.error = 'Failed to create invoice';
      return result;
    }

    try {
      await deductStockFromOrder(orderId);
      result.stockDeducted = true;
    } catch (e) {
      result.error = e instanceof Error ? e.message : 'Stock deduction failed';
      console.error('[orderFulfillment] Stock deduction failed:', e);
      return result;
    }

    if (process.env.GMAIL_APP_PASSWORD) {
      result.emailSent = await sendInvoiceEmailForOrder(orderId);
    }
  } catch (e) {
    result.error = e instanceof Error ? e.message : String(e);
    console.error('[orderFulfillment] Error:', e);
  }
  return result;
}
