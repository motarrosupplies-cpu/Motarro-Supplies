# Checkout flow

## Overview

- **Cart** → Checkout page (customer details, shipping, discount, payment method) → EFT or PayFast.
- **EFT**: Form submit → `POST /api/orders/eft` → creates order + order_items (service role), sends “Order received” email.
- **PayFast**: “Pay with PayFast” → `POST /api/payments/payfast-initiate` → creates order + order_items (service role), returns PayFast URL with `custom_str1 = order.id` → user pays → PayFast POSTs to ` /api/payments/payfast-ipn` → IPN verifies, sets order status to `paid`, sends “Payment received” email.

## Environment

- `SUPABASE_SERVICE_ROLE_KEY`: required for order creation (EFT and PayFast initiate).
- `GMAIL_APP_PASSWORD` (and optional `GMAIL_FROM`): for order confirmation emails.
- `PAYFAST_MERCHANT_ID`, `PAYFAST_MERCHANT_KEY`, `PAYFAST_PASSPHRASE`: for PayFast; passphrase used for IPN signature verification.

## Shared order creation

- `lib/services/orderCreationHelper.ts`: `createOrderInDb(payload)` creates one order and its order_items using `supabaseAdmin`. Used by EFT route and PayFast initiate.

## Adding another payment method

- Create order with `createOrderInDb` (status `pending` or `paid` as appropriate).
- Trigger “order received” email (reuse EFT email logic or a shared email helper keyed by `orderId`).
