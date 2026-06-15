-- Fix Category Case Sensitivity Issue
-- This script converts all product categories to lowercase to match frontend queries
-- Run this in Supabase SQL Editor

-- =====================================================
-- STEP 1: CONVERT EXISTING CATEGORIES TO LOWERCASE
-- =====================================================

-- Convert all product categories to lowercase
UPDATE products 
SET category = LOWER(category);

-- Verify the changes
SELECT 
  'CATEGORY CASE FIX' as operation,
  COUNT(*) as total_products,
  COUNT(CASE WHEN category = LOWER(category) THEN 1 END) as lowercase_categories,
  COUNT(CASE WHEN category != LOWER(category) THEN 1 END) as uppercase_categories
FROM products;

-- Show sample of updated categories
SELECT 
  'SAMPLE CATEGORIES' as info,
  category,
  COUNT(*) as product_count
FROM products 
GROUP BY category
ORDER BY category;

-- =====================================================
-- STEP 2: VERIFY CATEGORY VALUES
-- =====================================================

-- Check for any remaining uppercase categories
SELECT 
  'UPPERCASE CHECK' as check_type,
  category,
  COUNT(*) as count
FROM products 
WHERE category != LOWER(category)
GROUP BY category;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
DECLARE
  total_count INTEGER;
  lowercase_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_count FROM products;
  SELECT COUNT(*) INTO lowercase_count FROM products WHERE category = LOWER(category);
  
  RAISE NOTICE '=====================================================';
  RAISE NOTICE 'CATEGORY CASE SENSITIVITY FIX COMPLETED!';
  RAISE NOTICE '=====================================================';
  RAISE NOTICE 'Total products: %', total_count;
  RAISE NOTICE 'Lowercase categories: %', lowercase_count;
  RAISE NOTICE '=====================================================';
  
  IF lowercase_count = total_count THEN
    RAISE NOTICE '✅ SUCCESS: All categories are now lowercase!';
    RAISE NOTICE 'Products should now appear on frontend pages.';
  ELSE
    RAISE NOTICE '❌ WARNING: Some categories may still have issues.';
  END IF;
  
  RAISE NOTICE '=====================================================';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Update product forms to use lowercase categories';
  RAISE NOTICE '2. Update API validation to lowercase';
  RAISE NOTICE '3. Test product creation and display';
  RAISE NOTICE '=====================================================';
END $$;
