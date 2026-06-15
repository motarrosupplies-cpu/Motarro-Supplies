-- Debug Product Display Issue
-- This script checks if the specific product is being fetched correctly
-- Run this in Supabase SQL Editor

-- =====================================================
-- STEP 1: CHECK THE SPECIFIC PRODUCT
-- =====================================================

-- Check the Naruto product specifically
SELECT 
  'NARUTO PRODUCT CHECK' as check_type,
  id,
  name,
  category,
  status,
  stock,
  stock_quantity,
  CASE 
    WHEN stock = stock_quantity THEN 'SYNCED ✓'
    ELSE 'MISMATCH ✗'
  END as sync_status
FROM products 
WHERE name LIKE '%Naruto%' OR name LIKE '%Sasuke%';

-- =====================================================
-- STEP 2: CHECK ALL MEN'S PRODUCTS
-- =====================================================

-- Check all men's products
SELECT 
  'MEN PRODUCTS CHECK' as check_type,
  id,
  name,
  category,
  status,
  stock,
  stock_quantity,
  CASE 
    WHEN stock = 0 THEN 'OUT OF STOCK'
    WHEN stock > 0 THEN 'IN STOCK'
    ELSE 'UNKNOWN'
  END as stock_status
FROM products 
WHERE category = 'men' 
  AND status = 'active'
ORDER BY id DESC;

-- =====================================================
-- STEP 3: CHECK PRODUCT COUNT BY CATEGORY
-- =====================================================

-- Count products by category and status
SELECT 
  'CATEGORY COUNT CHECK' as check_type,
  category,
  status,
  COUNT(*) as product_count,
  COUNT(CASE WHEN stock > 0 THEN 1 END) as in_stock_count,
  COUNT(CASE WHEN stock = 0 THEN 1 END) as out_of_stock_count
FROM products 
GROUP BY category, status
ORDER BY category, status;

-- =====================================================
-- STEP 4: CHECK FOR ANY FILTERING ISSUES
-- =====================================================

-- Check if there are any products that might be filtered out
SELECT 
  'FILTERING CHECK' as check_type,
  'Total Products' as description,
  COUNT(*) as count
FROM products
UNION ALL
SELECT 
  'FILTERING CHECK',
  'Active Products',
  COUNT(*)
FROM products 
WHERE status = 'active'
UNION ALL
SELECT 
  'FILTERING CHECK',
  'Men Category',
  COUNT(*)
FROM products 
WHERE category = 'men'
UNION ALL
SELECT 
  'FILTERING CHECK',
  'Active Men Products',
  COUNT(*)
FROM products 
WHERE category = 'men' AND status = 'active';

-- =====================================================
-- STEP 5: VERIFY STOCK COLUMN VALUES
-- =====================================================

-- Check stock column values for men's products
SELECT 
  'STOCK VALUES CHECK' as check_type,
  name,
  stock,
  stock_quantity,
  CASE 
    WHEN stock IS NULL THEN 'NULL'
    WHEN stock = 0 THEN 'ZERO'
    WHEN stock > 0 THEN 'POSITIVE'
    ELSE 'OTHER'
  END as stock_type
FROM products 
WHERE category = 'men' 
  AND status = 'active'
ORDER BY stock DESC;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
DECLARE
  naruto_count INTEGER;
  men_active_count INTEGER;
  men_total_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO naruto_count FROM products WHERE name LIKE '%Naruto%';
  SELECT COUNT(*) INTO men_active_count FROM products WHERE category = 'men' AND status = 'active';
  SELECT COUNT(*) INTO men_total_count FROM products WHERE category = 'men';
  
  RAISE NOTICE '=====================================================';
  RAISE NOTICE 'PRODUCT DISPLAY DEBUG COMPLETE';
  RAISE NOTICE '=====================================================';
  RAISE NOTICE 'Naruto products found: %', naruto_count;
  RAISE NOTICE 'Men active products: %', men_active_count;
  RAISE NOTICE 'Men total products: %', men_total_count;
  RAISE NOTICE '=====================================================';
  
  IF naruto_count > 0 THEN
    RAISE NOTICE '✅ Naruto product exists in database';
  ELSE
    RAISE NOTICE '❌ Naruto product NOT found in database';
  END IF;
  
  IF men_active_count > 0 THEN
    RAISE NOTICE '✅ Men active products exist';
  ELSE
    RAISE NOTICE '❌ No active men products found';
  END IF;
  
  RAISE NOTICE '=====================================================';
  RAISE NOTICE 'Check the results above to identify the issue';
  RAISE NOTICE '=====================================================';
END $$;
