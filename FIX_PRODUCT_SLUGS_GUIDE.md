# Comprehensive Product Slug Fix Guide

## Problem
Some products show slug URLs while others show UUIDs. This is because:
1. Not all products have slugs in the database
2. The unified view might not be up to date
3. Some products might be missing the `slug` column

## Solution
Run the comprehensive fix script to ensure ALL products have slugs.

## Steps

### 1. Run the Fix Script
1. Open Supabase SQL Editor
2. Copy and paste the entire contents of `fix-all-product-slugs-comprehensive.sql`
3. Run the script
4. Wait for completion (2-5 minutes depending on product count)

### 2. What the Script Does
- ✅ Checks current state of all product tables
- ✅ Adds `slug` column if missing
- ✅ Creates/updates slug generation function
- ✅ Generates slugs for ALL products missing them
- ✅ Handles duplicate slugs (adds ID suffix)
- ✅ Creates indexes for performance
- ✅ Recreates unified view with proper slug handling
- ✅ Verifies final state

### 3. Verify Results
After running, check the final output:
- All tables should show `missing_slug = 0`
- Sample slugs should look correct (not UUIDs)

### 4. Test on Site
1. Clear browser cache
2. Visit product listing pages
3. Click on products - all should use slug URLs
4. Check a few product pages - URLs should be slugs, not UUIDs

## If Issues Persist

### Check Specific Product
```sql
-- Check if a specific product has a slug
SELECT id, name, slug, seo_slug, category, status
FROM all_products_unified
WHERE id = 'YOUR-PRODUCT-ID-HERE';
```

### Check for Products Without Slugs
```sql
-- Find products still missing slugs
SELECT id, name, category, product_type
FROM all_products_unified
WHERE slug IS NULL OR slug = '';
```

### Regenerate Slugs for Specific Products
```sql
-- Regenerate slug for a specific product
UPDATE simple_products
SET slug = generate_product_slug(name, category, id::TEXT)
WHERE id = 'YOUR-PRODUCT-ID-HERE';
```

## Notes
- The script handles duplicates by adding a short ID suffix
- All active products will get slugs
- The unified view is recreated to ensure consistency
- Indexes are created for fast slug lookups

