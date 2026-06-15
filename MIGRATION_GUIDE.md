# Complete Migration to Optimized Product Tables

## Overview
This guide covers the complete migration from the old `products` and `product_variants` tables to the optimized structure (`simple_products`, `color_only_products`, `size_only_products`, `full_variant_products`).

## Migration Steps

### Step 1: Run Migration Script
Execute `migrate-all-products-to-optimized.sql` in Supabase SQL Editor.

This script will:
- Analyze all products to determine their type (simple, color-only, size-only, or full-variant)
- Migrate products to the appropriate optimized table
- Migrate all variants to the corresponding variant tables
- Verify migration success

### Step 2: Verify Migration
After running the migration script, check the verification query at the end. It should show:
- Total products migrated
- Products by type
- Products still in old table (should be 0)

### Step 3: Test Application
1. Check admin dashboard - all products should be visible
2. Test product creation - should work through optimized endpoints
3. Test product updates - should work correctly
4. Test product deletion - should remove from correct tables

### Step 4: Drop Old Tables (After Verification)
**ONLY after confirming everything works**, run `drop-old-products-tables.sql` to:
- Drop `product_variants` table
- Drop `products` table

**WARNING**: Make sure you have a database backup before dropping tables!

## Codebase Changes

### Updated Files
1. **`app/api/products/route.ts`**
   - POST endpoint now forwards to `/api/products/optimized`

2. **`app/api/products/[id]/route.ts`**
   - GET endpoint already uses optimized tables (no change needed)
   - PUT endpoint now forwards to `/api/products/optimized/[id]`
   - DELETE endpoint now forwards to `/api/products/optimized/[id]`

3. **`components/admin/StockManagement.tsx`**
   - Now uses `all_products_unified` view instead of `products` table
   - Uses `total_stock` instead of `stock`

### Remaining Files (Still Reference Old Tables)
These files may still reference old tables but are backup/legacy files:
- `app/api/products/route-backup.ts`
- `app/api/products/route-OLD.ts`
- `app/api/products/route-new.ts`
- `app/api/products/[id]/route-SIMPLE.ts`
- `app/api/products/[id]/route-COMPREHENSIVE.ts`
- `app/api/products/[id]/route-NEW.ts`

These can be safely deleted after migration is confirmed successful.

## Migration SQL Scripts

### `migrate-all-products-to-optimized.sql`
- Migrates all products from `products` to optimized tables
- Handles variants migration
- Includes verification queries

### `drop-old-products-tables.sql`
- Drops `product_variants` and `products` tables
- Includes safety checks before dropping

## Rollback Plan
If migration fails:
1. Products remain in old `products` table
2. Optimized tables are not affected
3. Codebase still references old tables (via redirects)
4. Simply revert code changes if needed

## Next Steps
1. ✅ Run migration script
2. ✅ Verify all products migrated
3. ✅ Test application functionality
4. ⏳ Drop old tables (after 1-2 weeks of stable operation)
5. ⏳ Delete backup/legacy route files

