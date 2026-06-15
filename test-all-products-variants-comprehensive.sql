-- COMPREHENSIVE PRODUCT VARIANTS TEST
-- This script tests all scenarios to ensure the fix works permanently

-- =====================================================
-- TEST 1: CHECK ALL PRODUCTS HAVE PROPER VARIANTS
-- =====================================================

SELECT 
  'PRODUCT VARIANT AUDIT' as test_type,
  p.id,
  p.name,
  p.has_color_options,
  p.has_size_options,
  CASE 
    WHEN p.has_color_options = true AND p.has_size_options = true THEN 'BOTH'
    WHEN p.has_color_options = true AND p.has_size_options = false THEN 'COLORS_ONLY'
    WHEN p.has_color_options = false AND p.has_size_options = true THEN 'SIZES_ONLY'
    ELSE 'NONE'
  END as option_type,
  COUNT(v.id) as variant_count,
  SUM(v.stock_available) as total_stock_in_variants,
  p.stock as product_stock,
  CASE 
    WHEN (p.has_color_options = true OR p.has_size_options = true) AND COUNT(v.id) = 0 THEN 'MISSING_VARIANTS'
    WHEN (p.has_color_options = true OR p.has_size_options = true) AND COUNT(v.id) > 0 THEN 'HAS_VARIANTS'
    WHEN p.has_color_options = false AND p.has_size_options = false THEN 'NO_VARIANTS_NEEDED'
    ELSE 'UNKNOWN'
  END as status
FROM products p
LEFT JOIN product_variants v ON p.id = v.product_id
GROUP BY p.id, p.name, p.has_color_options, p.has_size_options, p.stock
ORDER BY 
  CASE 
    WHEN (p.has_color_options = true OR p.has_size_options = true) AND COUNT(v.id) = 0 THEN 1
    ELSE 2
  END,
  p.name;

-- =====================================================
-- TEST 2: CHECK STOCK CONSISTENCY
-- =====================================================

SELECT 
  'STOCK CONSISTENCY CHECK' as test_type,
  COUNT(*) as total_products,
  COUNT(CASE WHEN ABS(p.stock - COALESCE(variant_stock.total, 0)) <= 1 THEN 1 END) as consistent_stock,
  COUNT(CASE WHEN ABS(p.stock - COALESCE(variant_stock.total, 0)) > 1 THEN 1 END) as inconsistent_stock
FROM products p
LEFT JOIN (
  SELECT 
    product_id, 
    SUM(stock_available) as total
  FROM product_variants 
  GROUP BY product_id
) variant_stock ON p.id = variant_stock.product_id
WHERE p.has_color_options = true OR p.has_size_options = true;

-- =====================================================
-- TEST 3: SAMPLE VARIANT STRUCTURE
-- =====================================================

SELECT 
  'SAMPLE VARIANT STRUCTURE' as test_type,
  p.name as product_name,
  v.color_name,
  v.color_value,
  v.size,
  v.stock_available,
  v.is_active,
  v.sort_index
FROM products p
JOIN product_variants v ON p.id = v.product_id
WHERE p.has_color_options = true OR p.has_size_options = true
ORDER BY p.name, v.sort_index
LIMIT 20;

-- =====================================================
-- TEST 4: VALIDATE SPECIFIC SCENARIOS
-- =====================================================

-- Test products with both color and size options
SELECT 
  'BOTH_OPTIONS_TEST' as test_type,
  p.name,
  COUNT(DISTINCT v.color_name) as unique_colors,
  COUNT(DISTINCT v.size) as unique_sizes,
  COUNT(v.id) as total_variants,
  CASE 
    WHEN COUNT(DISTINCT v.color_name) > 0 AND COUNT(DISTINCT v.size) > 0 THEN 'PASS'
    ELSE 'FAIL'
  END as test_result
FROM products p
JOIN product_variants v ON p.id = v.product_id
WHERE p.has_color_options = true AND p.has_size_options = true
GROUP BY p.id, p.name
ORDER BY p.name;

-- Test products with colors only
SELECT 
  'COLORS_ONLY_TEST' as test_type,
  p.name,
  COUNT(DISTINCT v.color_name) as unique_colors,
  COUNT(DISTINCT v.size) as unique_sizes,
  COUNT(v.id) as total_variants,
  CASE 
    WHEN COUNT(DISTINCT v.color_name) > 0 AND COUNT(DISTINCT v.size) = 0 THEN 'PASS'
    ELSE 'FAIL'
  END as test_result
FROM products p
JOIN product_variants v ON p.id = v.product_id
WHERE p.has_color_options = true AND p.has_size_options = false
GROUP BY p.id, p.name
ORDER BY p.name;

-- Test products with sizes only
SELECT 
  'SIZES_ONLY_TEST' as test_type,
  p.name,
  COUNT(DISTINCT v.color_name) as unique_colors,
  COUNT(DISTINCT v.size) as unique_sizes,
  COUNT(v.id) as total_variants,
  CASE 
    WHEN COUNT(DISTINCT v.color_name) = 0 AND COUNT(DISTINCT v.size) > 0 THEN 'PASS'
    ELSE 'FAIL'
  END as test_result
FROM products p
JOIN product_variants v ON p.id = v.product_id
WHERE p.has_color_options = false AND p.has_size_options = true
GROUP BY p.id, p.name
ORDER BY p.name;

-- =====================================================
-- FINAL SUMMARY
-- =====================================================

DO $$
DECLARE
  total_products INTEGER;
  products_with_options INTEGER;
  products_with_variants INTEGER;
  products_missing_variants INTEGER;
BEGIN
  -- Count total products
  SELECT COUNT(*) INTO total_products FROM products;
  
  -- Count products with color/size options
  SELECT COUNT(*) INTO products_with_options 
  FROM products 
  WHERE has_color_options = true OR has_size_options = true;
  
  -- Count products with variants
  SELECT COUNT(*) INTO products_with_variants
  FROM products p
  WHERE (p.has_color_options = true OR p.has_size_options = true)
    AND EXISTS (SELECT 1 FROM product_variants WHERE product_id = p.id);
  
  -- Count products missing variants
  products_missing_variants := products_with_options - products_with_variants;
  
  RAISE NOTICE '=====================================================';
  RAISE NOTICE 'COMPREHENSIVE PRODUCT VARIANTS TEST RESULTS';
  RAISE NOTICE '=====================================================';
  RAISE NOTICE 'Total products: %', total_products;
  RAISE NOTICE 'Products with color/size options: %', products_with_options;
  RAISE NOTICE 'Products with variants: %', products_with_variants;
  RAISE NOTICE 'Products missing variants: %', products_missing_variants;
  RAISE NOTICE '=====================================================';
  
  IF products_missing_variants = 0 THEN
    RAISE NOTICE '✅ ALL PRODUCTS HAVE PROPER VARIANTS';
    RAISE NOTICE '✅ PERMANENT FIX IS WORKING';
  ELSE
    RAISE NOTICE '❌ % PRODUCTS STILL MISSING VARIANTS', products_missing_variants;
    RAISE NOTICE '❌ RUN THE MIGRATION SCRIPT AGAIN';
  END IF;
  
  RAISE NOTICE '=====================================================';
END $$;
