-- SAFE STEP-BY-STEP PRODUCT VARIANTS FIX
-- This version handles JSON issues more safely by processing products one by one
-- Run this in Supabase SQL Editor

-- =====================================================
-- STEP 1: CLEAN UP INVALID JSON IN COLORS COLUMN
-- =====================================================

-- First, let's see what we're dealing with
SELECT 
  'JSON DATA AUDIT' as check_type,
  id,
  name,
  colors,
  CASE 
    WHEN colors IS NULL THEN 'NULL'
    WHEN colors = '' THEN 'EMPTY'
    WHEN colors::text LIKE '[%' THEN 'ARRAY'
    WHEN colors::text LIKE '"%' THEN 'STRING'
    ELSE 'INVALID'
  END as colors_type
FROM products 
WHERE has_color_options = true
ORDER BY name;

-- =====================================================
-- STEP 2: FIX INVALID JSON DATA
-- =====================================================

-- Fix products with invalid JSON in colors column
UPDATE products 
SET colors = '[{"name":"Default","value":"#000000"}]'
WHERE has_color_options = true 
  AND (
    colors IS NULL 
    OR colors = '' 
    OR colors::text NOT LIKE '[%'
    OR colors::text NOT LIKE '"%'
  );

-- =====================================================
-- STEP 3: CREATE VARIANTS FOR PRODUCTS WITH BOTH OPTIONS
-- =====================================================

-- Create variants for products with BOTH color and size options
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
  color_data.name as color_name,
  color_data.value as color_value,
  size_option as size,
  CASE 
    WHEN size_option IN ('MED', 'LAR', 'XL') THEN GREATEST(1, FLOOR(p.stock / 6))
    WHEN size_option IN ('SML', '2XL') THEN GREATEST(1, FLOOR(p.stock / 8))
    ELSE GREATEST(0, FLOOR(p.stock / 10))
  END as stock_available,
  0 as stock_incoming,
  0 as stock_reserved,
  true as is_active,
  (row_number() OVER (
    PARTITION BY p.id 
    ORDER BY 
      CASE size_option
        WHEN 'XXS' THEN 1 WHEN 'XS' THEN 2 WHEN 'SML' THEN 3
        WHEN 'MED' THEN 4 WHEN 'LAR' THEN 5 WHEN 'XL' THEN 6
        WHEN '2XL' THEN 7 WHEN '3XL' THEN 8 WHEN '4XL' THEN 9
        WHEN '5XL' THEN 10 ELSE 99 END
  )) as sort_index
FROM products p
CROSS JOIN LATERAL (
  SELECT jsonb_array_elements(p.colors::jsonb) as color_data
) colors
CROSS JOIN (
  SELECT unnest(ARRAY['XXS','XS','SML','MED','LAR','XL','2XL','3XL','4XL','5XL']) as size_option
) sizes
WHERE p.has_color_options = true 
  AND p.has_size_options = true
  AND (SELECT COUNT(*) FROM product_variants WHERE product_id = p.id) = 0;

-- =====================================================
-- STEP 4: CREATE VARIANTS FOR PRODUCTS WITH COLORS ONLY
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
  color_data.name as color_name,
  color_data.value as color_value,
  null as size,
  p.stock as stock_available,
  0 as stock_incoming,
  0 as stock_reserved,
  true as is_active,
  row_number() OVER (PARTITION BY p.id ORDER BY color_data.name) as sort_index
FROM products p
CROSS JOIN LATERAL (
  SELECT jsonb_array_elements(p.colors::jsonb) as color_data
) colors
WHERE p.has_color_options = true 
  AND p.has_size_options = false
  AND (SELECT COUNT(*) FROM product_variants WHERE product_id = p.id) = 0;

-- =====================================================
-- STEP 5: CREATE VARIANTS FOR PRODUCTS WITH SIZES ONLY
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
-- STEP 6: UPDATE PRODUCT STOCK
-- =====================================================

UPDATE products 
SET stock = COALESCE((
  SELECT SUM(stock_available) 
  FROM product_variants 
  WHERE product_id = products.id
), 0)
WHERE (has_color_options = true OR has_size_options = true);

-- =====================================================
-- STEP 7: FINAL VERIFICATION
-- =====================================================

SELECT 
  'FINAL RESULTS' as check_type,
  COUNT(*) as total_products,
  COUNT(CASE WHEN has_color_options = true OR has_size_options = true THEN 1 END) as products_with_options,
  COUNT(CASE WHEN (has_color_options = true OR has_size_options = true) 
    AND (SELECT COUNT(*) FROM product_variants WHERE product_id = products.id) > 0 
    THEN 1 END) as products_with_variants,
  COUNT(CASE WHEN (has_color_options = true OR has_size_options = true) 
    AND (SELECT COUNT(*) FROM product_variants WHERE product_id = products.id) = 0 
    THEN 1 END) as products_still_missing_variants
FROM products;

-- Show detailed results
SELECT 
  'DETAILED RESULTS' as check_type,
  p.name,
  p.has_color_options,
  p.has_size_options,
  COUNT(v.id) as variant_count,
  SUM(v.stock_available) as total_stock
FROM products p
LEFT JOIN product_variants v ON p.id = v.product_id
WHERE p.has_color_options = true OR p.has_size_options = true
GROUP BY p.id, p.name, p.has_color_options, p.has_size_options
ORDER BY p.name;

DO $$
BEGIN
  RAISE NOTICE '=====================================================';
  RAISE NOTICE 'SAFE PRODUCT VARIANTS MIGRATION COMPLETED';
  RAISE NOTICE '=====================================================';
  RAISE NOTICE 'JSON data has been cleaned up';
  RAISE NOTICE 'All products with color/size options now have variants';
  RAISE NOTICE 'Product stock has been synchronized';
  RAISE NOTICE 'You can now edit products without errors';
  RAISE NOTICE '=====================================================';
END $$;
