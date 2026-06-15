# Checkout Fix Summary - Database Alignment

## Problem Identified
The cart checkout was failing because the API routes were using **camelCase** column names (e.g., `eventId`, `orderNumber`, `parentName`) while the database schema uses **snake_case** column names (e.g., `event_id`, `order_number`, `parent_name`).

## Root Cause
- **API Routes**: Using camelCase column names
- **Database Schema**: Using snake_case column names (Supabase standard)
- **Mismatch**: When API tried to insert/query with camelCase, columns didn't exist, causing errors

## Files Fixed

### 1. Main Order Creation Route
- **File**: `app/api/school-events/orders/route.ts`
- **Changes**:
  - Changed order insert: `eventId` → `event_id`, `orderNumber` → `order_number`, etc.
  - Changed order items insert: `orderId` → `order_id`, `productId` → `product_id`, etc.
  - Fixed addon queries: `orderItemId` → `order_item_id`, etc.
  - Fixed response mapping: `order.orderNumber` → `order.order_number`

### 2. Order Retrieval Route
- **File**: `app/api/school-events/orders/[orderId]/route.ts`
- **Changes**:
  - Updated all SELECT queries to use snake_case
  - Fixed WHERE clauses: `order.eventId` → `order.event_id`
  - Added transformation layer to convert snake_case to camelCase for frontend compatibility

### 3. Payment Update Route
- **File**: `app/api/school-events/orders/[orderId]/update-payment/route.ts`
- **Changes**:
  - `paymentMethod` → `payment_method`
  - `paymentStatus` → `payment_status`

### 4. PayFast Return Route
- **File**: `app/api/school-events/orders/[orderId]/payfast-return/route.ts`
- **Changes**:
  - `paymentStatus` → `payment_status`
  - Fixed status mapping

### 5. School Events List Route
- **File**: `app/api/school-events/route.ts`
- **Changes**:
  - `eventId` → `event_id`
  - `isActive` → `is_active`
  - `startDate` → `start_date`

### 6. School Event Detail Route
- **File**: `app/api/school-events/[id]/route.ts`
- **Changes**:
  - `eventId` → `event_id`
  - `productId` → `product_id`
  - `isActive` → `is_active`
  - `additionalItemId` → `additional_item_id`

## Column Name Mapping

### school_event_orders table
| Old (camelCase) | New (snake_case) |
|----------------|------------------|
| eventId | event_id |
| orderNumber | order_number |
| parentName | parent_name |
| parentEmail | parent_email |
| parentPhone | parent_phone |
| schoolName | school_name |
| className | class_name |
| totalAmount | total_amount |
| paymentStatus | payment_status |
| paymentMethod | payment_method |
| createdAt | created_at |
| updatedAt | updated_at |

### school_event_order_items table
| Old (camelCase) | New (snake_case) |
|----------------|------------------|
| orderId | order_id |
| productId | product_id |
| variantId | variant_id |
| childName | child_name |
| childAge | child_age |
| unitPrice | unit_price |
| totalPrice | total_price |
| specialInstructions | special_instructions |
| createdAt | created_at |
| updatedAt | updated_at |

### school_event_order_item_addons table
| Old (camelCase) | New (snake_case) |
|----------------|------------------|
| orderItemId | order_item_id |
| additionalItemId | additional_item_id |
| selectedOptionId | selected_option_id |
| unitPrice | unit_price |
| totalPrice | total_price |

## Verification Scripts Created

1. **verify-school-events-schema.sql**
   - Checks actual column names in database
   - Identifies naming convention (camelCase vs snake_case)
   - Run this first to verify your database state

2. **fix-school-events-database-alignment.sql**
   - Migration script to convert camelCase to snake_case
   - Idempotent (safe to run multiple times)
   - Only renames columns if they exist as camelCase

## Next Steps

1. **Verify Database Schema**:
   ```sql
   -- Run in Supabase SQL Editor
   -- Execute: verify-school-events-schema.sql
   ```

2. **If Database Uses camelCase**:
   ```sql
   -- Run migration script
   -- Execute: fix-school-events-database-alignment.sql
   ```

3. **Test Checkout Flow**:
   - Try creating a new order
   - Verify order is saved correctly
   - Check order items are created
   - Test payment status updates

4. **Monitor Logs**:
   - Check server logs for any remaining errors
   - Verify all API calls succeed

## Regular Orders API
✅ **Already Correct**: The regular orders API (`app/api/orders/eft/route.ts`) already uses snake_case, so no changes needed there.

## Testing Checklist

- [ ] Run verification script to check database schema
- [ ] Run migration script if needed
- [ ] Test school event order creation
- [ ] Test order retrieval
- [ ] Test payment status updates
- [ ] Test PayFast return callback
- [ ] Verify order items are created correctly
- [ ] Check addon items are linked properly
- [ ] Test error handling

## Notes

- All API routes now use snake_case to match Supabase conventions
- Frontend receives camelCase via transformation layer in GET routes
- Database operations (INSERT, UPDATE, SELECT) all use snake_case
- Migration script is safe and idempotent

