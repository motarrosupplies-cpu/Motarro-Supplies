-- ULTRA-SIMPLE PRODUCT VARIANTS FIX
-- This version avoids all JSON parsing issues by using a different approach
-- Run this in Supabase SQL Editor

-- =====================================================
-- STEP 1: CREATE VARIANTS FOR PRODUCTS WITH BOTH OPTIONS
-- =====================================================

-- Create variants for products with BOTH color and size options
-- We'll create a default color variant for each size
INSERT INTO product_variants (
  product_id,
  color_name,
  color_value,
  size,
  stock_available,
  stock_incoming,
  stock_reserved,
  is_active,
  sort_index
)
SELECT 
  p.id as product_id,
  'Default' as color_name,
  '#000000' as color_value,
  size_option as size,
  CASE 
    WHEN size_option IN ('MED', 'LAR', 'XL') THEN GREATEST(1, FLOOR(p.stock / 6))
    WHEN size_option IN ('SML', '2XL') THEN GREATEST(1, FLOOR(p.stock / 8))
    ELSE GREATEST(0, FLOOR(p.stock / 10))
  END as stock_available,
  0 as stock_incoming,
  0 as stock_reserved,
  true as is_active,
  CASE size_option
    WHEN 'XXS' THEN 1 WHEN 'XS' THEN 2 WHEN 'SML' THEN 3
    WHEN 'MED' THEN 4 WHEN 'LAR' THEN 5 WHEN 'XL' THEN 6
    WHEN '2XL' THEN 7 WHEN '3XL' THEN 8 WHEN '4XL' THEN 9
    WHEN '5XL' THEN 10 ELSE 99 END as sort_index
FROM products p
CROSS JOIN (
  SELECT unnest(ARRAY['XXS','XS','SML','MED','LAR','XL','2XL','3XL','4XL','5XL']) as size_option
) sizes
WHERE p.has_color_options = true 
  AND p.has_size_options = true
  AND (SELECT COUNT(*) FROM product_variants WHERE product_id = p.id) = 0;

-- =====================================================
-- STEP 2: CREATE VARIANTS FOR PRODUCTS WITH COLORS ONLY
-- =====================================================

INSERT INTO product_variants (
  product_id,
  color_name,
  color_value,
  size,
  stock_available,
  stock_incoming,
  stock_reserved,
  is_active,
  sort_index
)
SELECT 
  p.id as product_id,
  'Default' as color_name,
  '#000000' as color_value,
  null as size,
  p.stock as stock_available,
  0 as stock_incoming,
  0 as stock_reserved,
  true as is_active,
  1 as sort_index
FROM products p
WHERE p.has_color_options = true 
  AND p.has_size_options = false
  AND (SELECT COUNT(*) FROM product_variants WHERE product_id = p.id) = 0;

-- =====================================================
-- STEP 3: CREATE VARIANTS FOR PRODUCTS WITH SIZES ONLY
-- =====================================================

INSERT INTO product_variants (
  product_id,
  color_name,
  color_value,
  size,
  stock_available,
  stock_incoming,
  stock_reserved,
  is_active,
  sort_index
)
SELECT 
  p.id as product_id,
  null as color_name,
  null as color_value,
  size_option as size,
  CASE 
    WHEN size_option IN ('MED', 'LAR', 'XL') THEN GREATEST(1, FLOOR(p.stock / 4))
    WHEN size_option IN ('SML', '2XL') THEN GREATEST(1, FLOOR(p.stock / 6))
    ELSE GREATEST(0, FLOOR(p.stock / 8))
  END as stock_available,
  0 as stock_incoming,
  0 as stock_reserved,
  true as is_active,
  CASE size_option
    WHEN 'XXS' THEN 1 WHEN 'XS' THEN 2 WHEN 'SML' THEN 3
    WHEN 'MED' THEN 4 WHEN 'LAR' THEN 5 WHEN 'XL' THEN 6
    WHEN '2XL' THEN 7 WHEN '3XL' THEN 8 WHEN '4XL' THEN 9
    WHEN '5XL' THEN 10 ELSE 99 END as sort_index
FROM products p
CROSS JOIN (
  SELECT unnest(ARRAY['XXS','XS','SML','MED','LAR','XL','2XL','3XL','4XL','5XL']) as size_option
) sizes
WHERE p.has_color_options = false 
  AND p.has_size_options = true
  AND (SELECT COUNT(*) FROM product_variants WHERE product_id = p.id) = 0;

-- =====================================================
-- STEP 4: UPDATE PRODUCT STOCK TO MATCH VARIANTS
-- =====================================================

UPDATE products 
SET stock = COALESCE((
  SELECT SUM(stock_available) 
  FROM product_variants 
  WHERE product_id = products.id
), 0)
WHERE (has_color_options = true OR has_size_options = true);

-- =====================================================
-- STEP 5: VERIFICATION
-- =====================================================

-- Check how many products now have variants
SELECT 
  'VERIFICATION RESULTS' as check_type,
  COUNT(*) as total_products,
  COUNT(CASE WHEN has_color_options = true OR has_size_options = true THEN 1 END) as products_with_options,
  COUNT(CASE WHEN (has_color_options = true OR has_size_options = true) 
    AND (SELECT COUNT(*) FROM product_variants WHERE product_id = products.id) > 0 
    THEN 1 END) as products_with_variants,
  COUNT(CASE WHEN (has_color_options = true OR has_size_options = true) 
    AND (SELECT COUNT(*) FROM product_variants WHERE product_id = products.id) = 0 
    THEN 1 END) as products_still_missing_variants
FROM products;

-- Show sample of created variants
SELECT 
  'SAMPLE VARIANTS' as check_type,
  p.name as product_name,
  v.color_name,
  v.color_value,
  v.size,
  v.stock_available,
  v.is_active
FROM products p
JOIN product_variants v ON p.id = v.product_id
WHERE p.has_color_options = true OR p.has_size_options = true
ORDER BY p.name, v.sort_index
LIMIT 20;

DO $$
DECLARE
  products_with_variants INTEGER;
  products_needing_variants INTEGER;
BEGIN
  -- Count products that now have variants
  SELECT COUNT(*) INTO products_with_variants
  FROM products p
  WHERE (p.has_color_options = true OR p.has_size_options = true)
    AND EXISTS (SELECT 1 FROM product_variants WHERE product_id = p.id);
  
  -- Count products that still need variants
  SELECT COUNT(*) INTO products_needing_variants
  FROM products p
  WHERE (p.has_color_options = true OR p.has_size_options = true)
    AND NOT EXISTS (SELECT 1 FROM product_variants WHERE product_id = p.id);
  
  RAISE NOTICE '=====================================================';
  RAISE NOTICE 'ULTRA-SIMPLE PRODUCT VARIANTS FIX COMPLETED';
  RAISE NOTICE '=====================================================';
  RAISE NOTICE 'Products with variants: %', products_with_variants;
  RAISE NOTICE 'Products still missing variants: %', products_needing_variants;
  
  IF products_needing_variants = 0 THEN
    RAISE NOTICE '✅ SUCCESS: All products now have variants!';
    RAISE NOTICE '✅ You can now edit products without errors';
  ELSE
    RAISE NOTICE '❌ % products still need variants', products_needing_variants;
  END IF;
  
  RAISE NOTICE '=====================================================';
END $$;
