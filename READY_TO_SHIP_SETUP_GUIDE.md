# Ready-to-Ship Schema Setup Guide

## Complete Production Schema

The file `supabase-ready-to-ship-schema-complete.sql` is a **production-ready, comprehensive schema** that:

✅ Creates all tables from scratch  
✅ Handles all dependencies correctly  
✅ Includes proper indexes for performance  
✅ Sets up triggers for automatic timestamp updates  
✅ Creates views for calculated fields  
✅ Includes Row Level Security (RLS) policies  
✅ Safe to re-run (uses IF NOT EXISTS)  
✅ Fully documented with comments  

## How to Run

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**

### Step 2: Copy and Paste
1. Open `supabase-ready-to-ship-schema-complete.sql`
2. Copy the entire file
3. Paste into the SQL Editor

### Step 3: Execute
1. Click **Run** (or press Ctrl+Enter)
2. Wait for completion
3. You should see "Success. No rows returned"

### Step 4: Verify (Optional)
Run these queries to verify everything was created:

```sql
-- Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND (table_name LIKE 'ready_to_ship%' 
     OR table_name = 'flash_sales' 
     OR table_name = 'stock_updates');

-- Check view exists
SELECT table_name 
FROM information_schema.views 
WHERE table_schema = 'public' 
AND table_name = 'ready_to_ship_products_view';
```

## What Gets Created

### Tables
1. **ready_to_ship_products** - Main products table
2. **ready_to_ship_bundles** - Gift sets and bundles
3. **flash_sales** - Flash sale campaigns
4. **stock_updates** - Stock audit log

### Functions
1. **update_updated_at_column()** - Auto-updates timestamps
2. **calculate_bundle_stock(UUID)** - Calculates bundle availability

### Triggers
- Auto-update `updated_at` on all tables when rows are modified

### Views
- **ready_to_ship_products_view** - Pre-calculated fields (current_price, is_flash_sale, stock_status)

### Indexes
- Performance indexes on all frequently queried columns
- Composite indexes for common query patterns

### Security
- Row Level Security (RLS) enabled
- Public read policies for active products
- Admin-only write access (via Supabase auth)

## Adding Sample Data

After running the schema, you can add test products:

```sql
INSERT INTO ready_to_ship_products (
  name, slug, description, base_price, category, 
  stock_quantity, is_gift_item, is_event_favour,
  max_price_for_filter, primary_image, is_bundle_eligible,
  status
) VALUES 
(
  'Stainless Steel Tumbler 500ml',
  'stainless-steel-tumbler-500ml',
  'Premium double-wall insulated tumbler. Keeps drinks hot or cold for hours.',
  199.00,
  'tumbler',
  50,
  true,
  true,
  199.00,
  '/images/tumbler.jpg',
  true,
  'active'
),
(
  'Canvas Tote Bag',
  'canvas-tote-bag',
  'Eco-friendly canvas tote with logo space. Perfect for shopping or events.',
  89.00,
  'tote',
  100,
  true,
  true,
  89.00,
  '/images/tote.jpg',
  true,
  'active'
),
(
  'Cork Coaster Set (4pc)',
  'cork-coaster-set',
  'Set of 4 natural cork coasters. Absorbent and eco-friendly.',
  45.00,
  'coaster',
  200,
  true,
  true,
  45.00,
  '/images/coasters.jpg',
  true,
  'active'
),
(
  'Custom Keychain',
  'custom-keychain',
  'Durable metal keychain with custom engraving space.',
  35.00,
  'keychain',
  150,
  true,
  true,
  35.00,
  '/images/keychain.jpg',
  true,
  'active'
);
```

## Creating a Flash Sale

```sql
INSERT INTO flash_sales (
  title,
  description,
  banner_text,
  banner_color,
  starts_at,
  ends_at,
  discount_percent,
  is_active
) VALUES (
  'Christmas 2025 Flash Sale',
  'Huge discounts on all ready-to-ship items',
  '🎄 Up to 30% OFF - Ends Dec 25!',
  '#8B5CF6',
  '2025-12-01 00:00:00+02',
  '2025-12-25 23:59:59+02',
  30.00,
  true
);
```

## Troubleshooting

### Error: "relation does not exist"
- **Cause**: Tables weren't created
- **Fix**: Run the complete schema file from the beginning

### Error: "column does not exist"
- **Cause**: Table exists but is missing columns
- **Fix**: Drop the table and re-run the schema:
  ```sql
  DROP TABLE IF EXISTS ready_to_ship_products CASCADE;
  -- Then re-run the complete schema
  ```

### Error: "function does not exist"
- **Cause**: Functions weren't created
- **Fix**: Re-run the schema (functions section will recreate them)

### Error: "permission denied"
- **Cause**: RLS policies blocking access
- **Fix**: Check RLS policies or temporarily disable RLS:
  ```sql
  ALTER TABLE ready_to_ship_products DISABLE ROW LEVEL SECURITY;
  ```

## Next Steps

1. ✅ Run the schema
2. ✅ Add sample products
3. ✅ Test the API routes (`/api/ready-to-ship`)
4. ✅ Create a flash sale
5. ✅ Test the bundle builder
6. ✅ Verify stock counter updates

## Support

If you encounter issues:
1. Check Supabase logs in the dashboard
2. Verify all tables exist using the verification queries
3. Check that foreign key constraints are properly set up
4. Ensure RLS policies allow your operations

The schema is designed to be **idempotent** - you can run it multiple times safely.

