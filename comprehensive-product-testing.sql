-- COMPREHENSIVE PRODUCT VARIANT TESTING SCRIPT
-- This script will test all product variant scenarios and identify issues

-- =====================================================
-- STEP 1: CHECK CURRENT PRODUCT STATE
-- =====================================================

-- Check all products and their current configuration
SELECT 
  'CURRENT PRODUCTS' as test_type,
  p.id,
  p.name,
  p.category,
  p.stock,
  p.stock_quantity,
  p.has_color_options,
  p.has_size_options,
  p.colors,
  p.sizes,
  COUNT(pv.id) as variant_count,
  CASE 
    WHEN p.has_color_options = false AND p.has_size_options = false THEN 'SIMPLE'
    WHEN p.has_color_options = true AND p.has_size_options = false THEN 'COLOR_ONLY'
    WHEN p.has_color_options = false AND p.has_size_options = true THEN 'SIZE_ONLY'
    WHEN p.has_color_options = true AND p.has_size_options = true THEN 'FULL_VARIANT'
  END as product_type
FROM products p
LEFT JOIN product_variants pv ON p.id = pv.product_id AND pv.is_active = true
GROUP BY p.id, p.name, p.category, p.stock, p.stock_quantity, p.has_color_options, p.has_size_options, p.colors, p.sizes
ORDER BY p.created_at DESC;

-- =====================================================
-- STEP 2: CHECK UNIFIED VIEW STATE
-- =====================================================

-- Check if unified view exists and works
SELECT 
  'UNIFIED VIEW CHECK' as test_type,
  COUNT(*) as total_products,
  COUNT(CASE WHEN product_type = 'simple' THEN 1 END) as simple_count,
  COUNT(CASE WHEN product_type = 'color_only' THEN 1 END) as color_only_count,
  COUNT(CASE WHEN product_type = 'size_only' THEN 1 END) as size_only_count,
  COUNT(CASE WHEN product_type = 'full_variant' THEN 1 END) as full_variant_count
FROM all_products_unified;

-- =====================================================
-- STEP 3: CHECK OPTIMIZED TABLES STATE
-- =====================================================

-- Check simple_products table
SELECT 
  'SIMPLE PRODUCTS TABLE' as test_type,
  COUNT(*) as count,
  SUM(stock) as total_stock
FROM simple_products;

-- Check color_only_products table
SELECT 
  'COLOR ONLY PRODUCTS TABLE' as test_type,
  COUNT(*) as count,
  SUM(total_stock) as total_stock
FROM color_only_products;

-- Check size_only_products table
SELECT 
  'SIZE ONLY PRODUCTS TABLE' as test_type,
  COUNT(*) as count,
  SUM(total_stock) as total_stock
FROM size_only_products;

-- Check full_variant_products table
SELECT 
  'FULL VARIANT PRODUCTS TABLE' as test_type,
  COUNT(*) as count,
  SUM(total_stock) as total_stock
FROM full_variant_products;

-- =====================================================
-- STEP 4: CHECK VARIANT TABLES STATE
-- =====================================================

-- Check color_variants table
SELECT 
  'COLOR VARIANTS TABLE' as test_type,
  COUNT(*) as count,
  SUM(stock_available) as total_stock
FROM color_variants WHERE is_active = true;

-- Check size_variants table
SELECT 
  'SIZE VARIANTS TABLE' as test_type,
  COUNT(*) as count,
  SUM(stock_available) as total_stock
FROM size_variants WHERE is_active = true;

-- Check full_variants table
SELECT 
  'FULL VARIANTS TABLE' as test_type,
  COUNT(*) as count,
  SUM(stock_available) as total_stock
FROM full_variants WHERE is_active = true;

-- Check old product_variants table
SELECT 
  'OLD PRODUCT VARIANTS TABLE' as test_type,
  COUNT(*) as count,
  SUM(stock_available) as total_stock
FROM product_variants WHERE is_active = true;

-- =====================================================
-- STEP 5: IDENTIFY INCONSISTENCIES
-- =====================================================

-- Find products with mismatched stock vs variants
SELECT 
  'STOCK MISMATCH CHECK' as test_type,
  p.id,
  p.name,
  p.stock as main_stock,
  p.stock_quantity as main_stock_quantity,
  SUM(pv.stock_available) as variant_total,
  CASE 
    WHEN p.stock != SUM(pv.stock_available) THEN 'MISMATCH'
    ELSE 'MATCH'
  END as status
FROM products p
LEFT JOIN product_variants pv ON p.id = pv.product_id AND pv.is_active = true
WHERE p.has_color_options = true OR p.has_size_options = true
GROUP BY p.id, p.name, p.stock, p.stock_quantity
HAVING p.stock != SUM(pv.stock_available) OR SUM(pv.stock_available) IS NULL;

-- =====================================================
-- STEP 6: TEST DATA INTEGRITY
-- =====================================================

-- Check for products with color/size options but no variants
SELECT 
  'MISSING VARIANTS CHECK' as test_type,
  p.id,
  p.name,
  p.has_color_options,
  p.has_size_options,
  COUNT(pv.id) as variant_count
FROM products p
LEFT JOIN product_variants pv ON p.id = pv.product_id AND pv.is_active = true
WHERE (p.has_color_options = true OR p.has_size_options = true)
GROUP BY p.id, p.name, p.has_color_options, p.has_size_options
HAVING COUNT(pv.id) = 0;

-- Check for products with variants but no color/size options
SELECT 
  'UNNECESSARY VARIANTS CHECK' as test_type,
  p.id,
  p.name,
  p.has_color_options,
  p.has_size_options,
  COUNT(pv.id) as variant_count
FROM products p
INNER JOIN product_variants pv ON p.id = pv.product_id AND pv.is_active = true
WHERE p.has_color_options = false AND p.has_size_options = false
GROUP BY p.id, p.name, p.has_color_options, p.has_size_options;
