-- Fix Category Constraint Issue
-- This script addresses the check constraint that's preventing lowercase categories
-- Run this in Supabase SQL Editor

-- =====================================================
-- STEP 1: CHECK EXISTING CONSTRAINTS
-- =====================================================

-- Check what constraints exist on the products table
SELECT 
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'products'::regclass
ORDER BY conname;

-- =====================================================
-- STEP 2: DROP THE PROBLEMATIC CONSTRAINT
-- =====================================================

-- Drop the category check constraint that's causing the issue
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_category_check;

-- =====================================================
-- STEP 3: CONVERT CATEGORIES TO LOWERCASE
-- =====================================================

-- Now convert all categories to lowercase
UPDATE products 
SET category = LOWER(category);

-- =====================================================
-- STEP 4: CREATE NEW CONSTRAINT WITH LOWERCASE VALUES
-- =====================================================

-- Create a new constraint that allows lowercase categories
ALTER TABLE products 
ADD CONSTRAINT products_category_check 
CHECK (category IN ('men', 'women', 'accessories', 'unisex', 'custom printing'));

-- =====================================================
-- STEP 5: VERIFY THE FIX
-- =====================================================

-- Check that all categories are now lowercase
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
  RAISE NOTICE 'CATEGORY CONSTRAINT FIX COMPLETED!';
  RAISE NOTICE '=====================================================';
  RAISE NOTICE 'Total products: %', total_count;
  RAISE NOTICE 'Lowercase categories: %', lowercase_count;
  RAISE NOTICE '=====================================================';
  
  IF lowercase_count = total_count THEN
    RAISE NOTICE '✅ SUCCESS: All categories are now lowercase!';
    RAISE NOTICE 'Products should now appear on frontend pages.';
    RAISE NOTICE 'Constraint updated to allow lowercase categories.';
  ELSE
    RAISE NOTICE '❌ WARNING: Some categories may still have issues.';
  END IF;
  
  RAISE NOTICE '=====================================================';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Test product creation in admin dashboard';
  RAISE NOTICE '2. Verify products appear on frontend pages';
  RAISE NOTICE '3. Check all category pages work correctly';
  RAISE NOTICE '=====================================================';
END $$;
