/**
 * School event orders: PayFast fulfillment (invoice + email) and status-change notifications.
 * Uses supabaseAdmin; order rows use snake_case + quoted invoice columns — see `lib/supabase/schoolEventDb.ts`.
 */
import { supabaseAdmin } from '@/lib/supabaseClient';
import { invoiceService } from '@/lib/services/invoiceService';
import { PDFGenerator } from '@/lib/utils/pdfGenerator';
import {
  normalizeSchoolEventOrderRow,
  normalizeSchoolEventOrderItemRow,
  SCHOOL_EVENT_ORDER_HEADER_SELECT,
  SCHOOL_EVENT_ORDER_ITEM_SELECT,
  type SchoolEventOrderNormalized,
} from '@/lib/supabase/schoolEventDb';

type SchoolOrderRow = SchoolEventOrderNormalized;

function splitParentName(full: string): { firstName: string; lastName: string } {
  const t = (full || '').trim();
  if (!t) return { firstName: 'Customer', lastName: '-' };
  const parts = t.split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: '-' };
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
}

async function loadSchoolOrder(orderId: string): Promise<SchoolOrderRow | null> {
  if (!supabaseAdmin) return null;
  const { data, error } = await supabaseAdmin
    .from('school_event_orders')
    .select(SCHOOL_EVENT_ORDER_HEADER_SELECT)
    .eq('id', orderId)
    .maybeSingle();
  if (error || !data) return null;
  return normalizeSchoolEventOrderRow(data as Record<string, unknown>);
}

async function loadEventName(eventId: string): Promise<string> {
  if (!supabaseAdmin) return 'School event';
  const { data } = await supabaseAdmin.from('school_events').select('name').eq('id', eventId).maybeSingle();
  return (data as { name?: string } | null)?.name || 'School event';
}

export async function sendSchoolEventTransactionalEmail(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  if (!process.env.GMAIL_APP_PASSWORD) return false;
  try {
    const nodemailer = (await import('nodemailer')).default;
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_FROM || 'dartonstaker@gmail.com',
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
    await transporter.sendMail({
      from: '"MOTARRO Supplies School Events" <dartonstaker@gmail.com>',
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });
    return true;
  } catch (e) {
    console.error('[schoolEventAutomation] Email failed:', e);
    return false;
  }
}

function statusEmailBody(status: string, order: SchoolOrderRow, eventName: string): { subject: string; html: string } {
  const num = order.orderNumber;
  const base = `
    <p style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#344054;">
      Order <strong>#${num}</strong> for <strong>${eventName}</strong>.
    </p>`;
  switch (status) {
    case 'CONFIRMED':
      return {
        subject: `Order confirmed – ${num}`,
        html: `<h1 style="font-family:Arial,sans-serif;font-size:20px;">Your order is confirmed</h1>${base}
          <p style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#344054;">We'll keep you updated as it moves through production.</p>`,
      };
    case 'IN_PRODUCTION':
      return {
        subject: `We're printing your order – ${num}`,
        html: `<h1 style="font-family:Arial,sans-serif;font-size:20px;">Your order is in production</h1>${base}
          <p style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#344054;">We're busy printing and preparing your items.</p>`,
      };
    case 'READY_FOR_PICKUP':
      return {
        subject: `Ready for pickup – ${num}`,
        html: `<h1 style="font-family:Arial,sans-serif;font-size:20px;">Your order is ready</h1>${base}
          <p style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#344054;">You can collect your order from the school / collection point as arranged.</p>`,
      };
    case 'COMPLETED':
      return {
        subject: `Order complete – ${num}`,
        html: `<h1 style="font-family:Arial,sans-serif;font-size:20px;">Thank you!</h1>${base}
          <p style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#344054;">Your school event order is complete. We appreciate your support.</p>`,
      };
    default:
      return {
        subject: `Order update – ${num}`,
        html: `<h1 style="font-family:Arial,sans-serif;font-size:20px;">Order update</h1>${base}`,
      };
  }
}

/** After admin changes workflow status — emails parent (not for PENDING/CANCELLED). */
export async function notifySchoolEventOrderStatusChange(
  previousStatus: string | undefined,
  newStatus: string,
  orderId: string
): Promise<void> {
  if (!supabaseAdmin || !newStatus || newStatus === previousStatus) return;
  if (newStatus === 'PENDING' || newStatus === 'CANCELLED') return;

  const order = await loadSchoolOrder(orderId);
  if (!order?.parentEmail) return;

  const eventName = await loadEventName(order.eventId);
  const { subject, html } = statusEmailBody(newStatus, order, eventName);
  await sendSchoolEventTransactionalEmail({
    to: order.parentEmail,
    subject,
    html: `<div style="max-width:560px;margin:0 auto;padding:24px;">${html}
      <p style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#667085;margin-top:24px;">
        Questions? <a href="mailto:motarrodotcoza@gmail.com">motarrodotcoza@gmail.com</a>
      </p></div>`,
  });

  try {
    await sendSchoolEventTransactionalEmail({
      to: 'motarrodotcoza@gmail.com',
      subject: `[Admin] School order ${order.orderNumber} → ${newStatus}`,
      html: `<p>Order ${order.orderNumber} (${order.parentName} / ${order.parentEmail}) is now <strong>${newStatus}</strong>.</p>`,
    });
  } catch {
    /* non-fatal */
  }
}

export interface SchoolEventFulfillmentResult {
  invoiceCreated: boolean;
  emailSent: boolean;
  error?: string;
}

/**
 * Create invoice from school event order line items, link to order, mark paid when payment already received.
 */
export async function createAndSendSchoolEventInvoice(
  orderId: string,
  opts: { markInvoicePaid: boolean }
): Promise<SchoolEventFulfillmentResult> {
  const result: SchoolEventFulfillmentResult = { invoiceCreated: false, emailSent: false };
  if (!supabaseAdmin) {
    result.error = 'supabaseAdmin missing';
    return result;
  }

  const order = await loadSchoolOrder(orderId);
  if (!order) {
    result.error = 'Order not found';
    return result;
  }

  if (order.invoiceId) {
    const emailed = await sendSchoolEventInvoicePdfEmail(orderId);
    result.invoiceCreated = true;
    result.emailSent = emailed;
    return result;
  }

  const { data: itemsRaw, error: itemsErr } = await supabaseAdmin
    .from('school_event_order_items')
    .select(SCHOOL_EVENT_ORDER_ITEM_SELECT)
    .eq('order_id', orderId);

  const items = (itemsRaw || []).map((r) =>
    normalizeSchoolEventOrderItemRow(r as Record<string, unknown>)
  );

  if (itemsErr || !items?.length) {
    result.error = itemsErr?.message || 'No line items';
    return result;
  }

  const productIds = [...new Set(items.map((i) => i.productId))];
  const { data: products } = await supabaseAdmin.from('event_products').select('id, name').in('id', productIds);
  const productNameById = new Map((products || []).map((p: { id: string; name: string }) => [p.id, p.name]));

  const variantIds = [...new Set(items.map((i) => i.variantId).filter(Boolean))] as string[];
  let variantMap = new Map<string, { size: string; color: string }>();
  if (variantIds.length) {
    const { data: vars } = await supabaseAdmin
      .from('event_product_variants')
      .select('id, size, color')
      .in('id', variantIds);
    variantMap = new Map((vars || []).map((v: { id: string; size: string; color: string }) => [v.id, v]));
  }

  const { firstName, lastName } = splitParentName(order.parentName);
  let customerId: string | undefined;
  const { data: existingCust } = await supabaseAdmin
    .from('customers')
    .select('id')
    .eq('email', order.parentEmail)
    .maybeSingle();
  if (existingCust?.id) {
    customerId = existingCust.id as string;
  } else {
    try {
      const customer = await invoiceService.createCustomer({
        firstName,
        lastName,
        email: order.parentEmail,
        phone: order.parentPhone || '',
        source: 'school-event',
      });
      customerId = customer.id;
    } catch (e) {
      result.error = e instanceof Error ? e.message : 'Failed to create customer';
      return result;
    }
  }

  const eventName = await loadEventName(order.eventId);
  const invoiceItems = items.map((row) => {
    const v = row.variantId ? variantMap.get(row.variantId) : undefined;
    const variantBit = v ? ` • ${v.size} / ${v.color}` : '';
    const note = row.specialInstructions ? ` — Note: ${row.specialInstructions}` : '';
    const pname = productNameById.get(row.productId) || 'Item';
    return {
      description: `${pname}${variantBit} (child: ${row.childName})${note}`,
      quantity: row.quantity,
      unitPrice: Number(row.unitPrice),
      total: Number(row.totalPrice),
      productId: row.productId,
    };
  });

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 30);

  let invoice;
  try {
    invoice = await invoiceService.createInvoice({
      customerId: customerId!,
      dueDate,
      items: invoiceItems,
      notes: `School event: ${eventName}. Order ${order.orderNumber} (${order.id}).`,
      terms: opts.markInvoicePaid
        ? 'Payment received — thank you.'
        : 'Thank you for your order.',
    });
  } catch (e) {
    result.error = e instanceof Error ? e.message : 'Invoice create failed';
    return result;
  }

  result.invoiceCreated = true;

  if (opts.markInvoicePaid) {
    try {
      await invoiceService.updateInvoiceStatus(invoice.id, 'PAID');
    } catch (e) {
      console.error('[schoolEventAutomation] updateInvoiceStatus PAID:', e);
    }
  }

  const now = new Date().toISOString();
  await supabaseAdmin
    .from('school_event_orders')
    .update({ invoiceId: invoice.id, updated_at: now })
    .eq('id', orderId);

  const emailed = await sendSchoolEventInvoicePdfEmail(orderId);
  result.emailSent = emailed;
  return result;
}

export async function sendSchoolEventInvoicePdfEmail(orderId: string): Promise<boolean> {
  if (!supabaseAdmin || !process.env.GMAIL_APP_PASSWORD) return false;

  const order = await loadSchoolOrder(orderId);
  if (!order?.invoiceId || !order.parentEmail) return false;

  try {
    const invoice = await invoiceService.getInvoice(order.invoiceId);
    if (!invoice) return false;

    const pdfGen = new PDFGenerator();
    const doc = await pdfGen.generateInvoicePDF(invoice);
    const pdfBase64 = doc.output('datauristring').split(',')[1];
    if (!pdfBase64) throw new Error('PDF output failed');

    const nodemailer = (await import('nodemailer')).default;
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_FROM || 'dartonstaker@gmail.com',
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: '"MOTARRO Supplies School Events" <dartonstaker@gmail.com>',
      to: order.parentEmail,
      subject: `Your invoice ${invoice.invoiceNumber} – MOTARRO Supplies`,
      html: `<p style="font-family:Arial,sans-serif;font-size:14px;">Please find invoice <strong>${invoice.invoiceNumber}</strong> attached for school event order <strong>${order.orderNumber}</strong>.</p>`,
      attachments: [
        {
          filename: `invoice-${invoice.invoiceNumber}.pdf`,
          content: Buffer.from(pdfBase64, 'base64'),
          contentType: 'application/pdf',
        },
      ],
    });

    await supabaseAdmin
      .from('school_event_orders')
      .update({
        invoiceEmailSent: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    return true;
  } catch (e) {
    console.error('[schoolEventAutomation] Invoice PDF email failed:', e);
    await supabaseAdmin
      .from('school_event_orders')
      .update({
        invoiceEmailSent: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);
    return false;
  }
}

/** PayFast ITN: mark paid, confirm, invoice + email. Idempotent if invoice already linked. */
export async function runSchoolEventPayfastFulfillment(orderId: string, paidAmount: number): Promise<SchoolEventFulfillmentResult> {
  if (!supabaseAdmin) {
    return { invoiceCreated: false, emailSent: false, error: 'supabaseAdmin missing' };
  }

  const order = await loadSchoolOrder(orderId);
  if (!order) return { invoiceCreated: false, emailSent: false, error: 'Order not found' };

  const total = Number(order.totalAmount);
  if (paidAmount > 0 && total > 0 && Math.abs(paidAmount - total) > 0.05) {
    console.warn('[schoolEventAutomation] PayFast amount vs order total mismatch', { paidAmount, total, orderId });
  }

  const now = new Date().toISOString();
  await supabaseAdmin
    .from('school_event_orders')
    .update({
      payment_status: 'PAID',
      payment_method: 'payfast',
      status: 'CONFIRMED',
      updated_at: now,
    })
    .eq('id', orderId);

  const fulfillment = await createAndSendSchoolEventInvoice(orderId, { markInvoicePaid: true });

  try {
    await sendSchoolEventTransactionalEmail({
      to: 'motarrodotcoza@gmail.com',
      subject: `[Admin] PayFast paid — ${order.orderNumber}`,
      html: `<p>School event order <strong>${order.orderNumber}</strong> paid via PayFast. Invoice: ${fulfillment.invoiceCreated ? 'created' : 'n/a'}.</p>`,
    });
  } catch {
    /* ignore */
  }

  return fulfillment;
}

/**
 * When order reaches COMPLETED: ensure invoice exists and is emailed (covers EFT and edge cases).
 */
export async function ensureSchoolEventInvoiceOnCompleted(orderId: string): Promise<void> {
  const order = await loadSchoolOrder(orderId);
  if (!order) return;
  const paid = order.paymentStatus === 'PAID';
  await createAndSendSchoolEventInvoice(orderId, { markInvoicePaid: paid });
}
