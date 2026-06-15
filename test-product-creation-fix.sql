-- COMPREHENSIVE TEST SCRIPT FOR PRODUCT CREATION & CACHE FIX
-- Run this after applying the main fix to verify everything works

-- =====================================================
-- TEST 1: VERIFY STOCK COLUMN SYNC
-- =====================================================

SELECT 
  'STOCK SYNC TEST' as test_name,
  COUNT(*) as total_products,
  COUNT(CASE WHEN stock = stock_quantity THEN 1 END) as synced_products,
  COUNT(CASE WHEN stock != stock_quantity THEN 1 END) as mismatched_products
FROM products;

-- =====================================================
-- TEST 2: VERIFY REQUIRED COLUMNS EXIST
-- =====================================================

DO $$
DECLARE
  missing_columns TEXT[] := ARRAY[]::TEXT[];
  required_columns TEXT[] := ARRAY[
    'stock', 'image', 'images', 'has_color_options', 
    'has_size_options', 'colors', 'details', 'seo_title', 
    'seo_description', 'seo_keywords', 'seo_slug', 'image_alt_texts'
  ];
  col TEXT;
BEGIN
  FOREACH col IN ARRAY required_columns
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'products' 
        AND column_name = col 
        AND table_schema = 'public'
    ) THEN
      missing_columns := array_append(missing_columns, col);
    END IF;
  END LOOP;
  
  IF array_length(missing_columns, 1) IS NULL THEN
    RAISE NOTICE '✅ COLUMN TEST PASSED: All required columns exist!';
  ELSE
    RAISE NOTICE '❌ COLUMN TEST FAILED: Missing columns: %', array_to_string(missing_columns, ', ');
  END IF;
END $$;

-- =====================================================
-- TEST 3: VERIFY RLS POLICIES
-- =====================================================

SELECT 
  'RLS POLICIES TEST' as test_name,
  tablename,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename IN ('products', 'product_variants')
GROUP BY tablename;

-- =====================================================
-- TEST 4: VERIFY TRIGGERS EXIST
-- =====================================================

SELECT 
  'TRIGGERS TEST' as test_name,
  tgname as trigger_name,
  tgrelid::regclass as table_name
FROM pg_trigger 
WHERE tgname IN ('update_products_updated_at', 'update_product_variants_updated_at', 'sync_stock_trigger')
ORDER BY tgname;

-- =====================================================
-- TEST 5: VERIFY SAMPLE DATA INTEGRITY
-- =====================================================

SELECT 
  'DATA INTEGRITY TEST' as test_name,
  id,
  name,
  category,
  stock,
  stock_quantity,
  CASE 
    WHEN stock = stock_quantity THEN 'SYNCED ✓'
    ELSE 'MISMATCH ✗'
  END as sync_status,
  CASE 
    WHEN stock > 0 THEN 'HAS STOCK ✓'
    ELSE 'NO STOCK ✗'
  END as stock_status
FROM products 
ORDER BY created_at DESC
LIMIT 5;

-- =====================================================
-- TEST 6: VERIFY PRODUCT_VARIANTS TABLE
-- =====================================================

SELECT 
  'VARIANTS TABLE TEST' as test_name,
  COUNT(*) as variant_count,
  COUNT(DISTINCT product_id) as products_with_variants
FROM product_variants;

-- =====================================================
-- TEST 7: VERIFY PERMISSIONS
-- =====================================================

SELECT 
  'PERMISSIONS TEST' as test_name,
  table_name,
  privilege_type,
  grantee
FROM information_schema.table_privileges 
WHERE table_name IN ('products', 'product_variants')
  AND grantee IN ('authenticated', 'anon')
ORDER BY table_name, grantee, privilege_type;

-- =====================================================
-- FINAL TEST SUMMARY
-- =====================================================

DO $$
DECLARE
  products_count INTEGER;
  variants_count INTEGER;
  synced_count INTEGER;
  total_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO products_count FROM products;
  SELECT COUNT(*) INTO variants_count FROM product_variants;
  SELECT COUNT(*) INTO synced_count FROM products WHERE stock = stock_quantity;
  SELECT COUNT(*) INTO total_count FROM products;
  
  RAISE NOTICE '=====================================================';
  RAISE NOTICE 'COMPREHENSIVE TEST RESULTS';
  RAISE NOTICE '=====================================================';
  RAISE NOTICE 'Products table: % rows', products_count;
  RAISE NOTICE 'Product variants table: % rows', variants_count;
  RAISE NOTICE 'Stock columns synced: %/% (%.1f%%)', 
    synced_count, total_count, 
    CASE WHEN total_count > 0 THEN (synced_count::float / total_count * 100) ELSE 0 END;
  RAISE NOTICE '=====================================================';
  
  IF synced_count = total_count AND total_count > 0 THEN
    RAISE NOTICE '✅ ALL TESTS PASSED - PRODUCT CREATION SHOULD WORK!';
  ELSE
    RAISE NOTICE '❌ SOME TESTS FAILED - CHECK ABOVE RESULTS';
  END IF;
  
  RAISE NOTICE '=====================================================';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Test product creation in admin dashboard';
  RAISE NOTICE '2. Verify products appear on frontend';
  RAISE NOTICE '3. Check cache invalidation works';
  RAISE NOTICE '=====================================================';
END $$;

