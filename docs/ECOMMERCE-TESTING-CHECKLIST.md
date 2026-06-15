# Ecommerce Purchase Pipeline – Testing Checklist

Use this checklist to verify the full purchase flow and safeguards after deploying the pipeline hardening (PayFast, orders, invoices, stock).

## 1. Add to cart

- [ ] Add a product (simple, no variants): quantity is capped at available stock.
- [ ] Add a product with size/color variants: quantity is capped per variant.
- [ ] Cart count and total update correctly.
- [ ] Variant/size/color are reflected in the cart line.

## 2. Cart quantity

- [ ] Increase quantity: cannot exceed available stock.
- [ ] Decrease quantity and remove item: cart updates correctly.

## 3. Checkout

- [ ] From cart or header, "Proceed to Checkout" goes to `/checkout`.
- [ ] Submit with **PayFast**: redirects to PayFast; order is created with status `pending`.
- [ ] Submit with **EFT**: order is created, confirmation email received, cart cleared.

## 4. Successful PayFast payment

- [ ] Complete payment on PayFast (use sandbox if available).
- [ ] ITN is received: order status becomes `paid`.
- [ ] One invoice is created and linked to the order (`invoices.order_id`, `orders.invoice_id`).
- [ ] Invoice number is unique and in format `INV-XXXXXX`.
- [ ] Stock is decreased by order quantities; `stock_updates` has rows with `order_id`.
- [ ] Invoice PDF is generated and emailed to the customer (if GMAIL_APP_PASSWORD is set).
- [ ] Second ITN (duplicate) for the same payment: no duplicate invoice, no double stock deduction; response 200.

## 5. Failed / cancelled payment

- [ ] PayFast returns non-COMPLETE (e.g. FAILED): order remains `pending`; no invoice, no stock change.
- [ ] User returns from PayFast cancel URL: order still `pending`; no invoice, no stock deduction.

## 6. Duplicate ITN

- [ ] Send the same COMPLETE ITN twice (e.g. replay body to `/api/payments/payfast-ipn`): second time no duplicate invoice, no double stock deduction; handler returns 200 (idempotent).

## 7. Out-of-stock

- [ ] Cart has quantity 5 for a product with stock 2; proceed to checkout with PayFast or EFT: request rejected with message like "Insufficient stock for …"; no order created.

## 8. Invoice PDF

- [ ] After a successful PayFast payment, open the invoice (admin or from DB): PDF generated from that invoice is consistent and downloadable.

## 9. Invoice email

- [ ] After payment, customer receives one invoice email with PDF attached.
- [ ] If send fails (e.g. wrong SMTP): order and invoice still exist; `orders.invoice_email_sent` is false (or similar) for retry.

## 10. Stock deduction

- [ ] Quantities deducted match `order_items`; no negative stock unless explicitly allowed.
- [ ] Each deduction is logged in `stock_updates` with `order_id` for traceability.

## 11. Admin Accept (idempotent)

- [ ] For an order already fulfilled by PayFast (`stock_deducted = true`): "Accept" only updates status to `accepted`; no second stock deduction.
- [ ] For an EFT (or legacy) order without `stock_deducted`: "Accept" deducts stock and updates status.

## 12. Security

- [ ] In production, IPN with invalid or missing signature returns 400 when `PAYFAST_PASSPHRASE` is set.
- [ ] Return URL is not used for payment verification; only ITN updates order to `paid`.

---

**Notes**

- Run the schema migration `supabase-ecommerce-pipeline-migration.sql` before testing (payments table, orders/invoices/stock_updates columns, invoice sequence).
- For PayFast use sandbox credentials and sandbox ITN where possible.
- EFT path does not auto-deduct stock; stock is deducted on admin "Accept" unless you add auto-deduction for EFT in a follow-up.
