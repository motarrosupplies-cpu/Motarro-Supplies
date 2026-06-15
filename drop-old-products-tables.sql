-- ============================================
-- DROP OLD PRODUCT TABLES
-- ============================================
-- WARNING: Only run this AFTER verifying all products have been migrated!
-- Make sure you have a backup of your database before running this!
-- ============================================

-- Step 1: Verify no products remain in old tables
-- Run this FIRST to ensure migration was successful
SELECT 
    'Products still in old table' as status,
    COUNT(*) as count
FROM products
WHERE id NOT IN (
    SELECT id FROM simple_products
    UNION
    SELECT id FROM color_only_products
    UNION
    SELECT id FROM size_only_products
    UNION
    SELECT id FROM full_variant_products
);

-- If the above query returns 0, it's safe to proceed

-- Step 2: Drop foreign key constraints that reference product_variants
-- Check for any tables that reference product_variants
-- You may need to drop constraints in other tables first

-- Step 3: Drop the old variant table first (has foreign keys to products)
DROP TABLE IF EXISTS product_variants CASCADE;

-- Step 4: Drop the old products table
DROP TABLE IF EXISTS products CASCADE;

-- Step 5: Verify tables are dropped
SELECT 
    table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN ('products', 'product_variants');

-- Should return no rows if tables were successfully dropped

