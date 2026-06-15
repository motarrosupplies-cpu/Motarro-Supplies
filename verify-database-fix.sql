-- Database Verification Script
-- This script checks if all required columns exist in the products table
-- Run this to confirm the fix was successful

-- =====================================================
-- CHECK PRODUCTS TABLE COLUMNS
-- =====================================================

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- =====================================================
-- CHECK IF PRODUCT_VARIANTS TABLE EXISTS
-- =====================================================

SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_name IN ('products', 'product_variants')
  AND table_schema = 'public';

-- =====================================================
-- CHECK REQUIRED COLUMNS EXIST
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
  -- Check each required column
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
  
  -- Report results
  IF array_length(missing_columns, 1) IS NULL THEN
    RAISE NOTICE '✅ SUCCESS: All required columns exist in products table!';
  ELSE
    RAISE NOTICE '❌ MISSING COLUMNS: %', array_to_string(missing_columns, ', ');
  END IF;
END $$;

-- =====================================================
-- CHECK RLS POLICIES
-- =====================================================

SELECT 
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename IN ('products', 'product_variants')
ORDER BY tablename, policyname;

-- =====================================================
-- CHECK SAMPLE DATA
-- =====================================================

SELECT 
  id,
  name,
  category,
  stock,
  stock_quantity,
  has_color_options,
  has_size_options,
  is_new,
  on_sale
FROM products 
LIMIT 5;

-- =====================================================
-- FINAL STATUS CHECK
-- =====================================================

DO $$
DECLARE
  products_count INTEGER;
  variants_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO products_count FROM products;
  SELECT COUNT(*) INTO variants_count FROM product_variants;
  
  RAISE NOTICE '=====================================================';
  RAISE NOTICE 'DATABASE VERIFICATION COMPLETE';
  RAISE NOTICE '=====================================================';
  RAISE NOTICE 'Products table: % rows', products_count;
  RAISE NOTICE 'Product variants table: % rows', variants_count;
  RAISE NOTICE '=====================================================';
  RAISE NOTICE 'If you see all required columns above,';
  RAISE NOTICE 'your product creation should now work!';
  RAISE NOTICE '=====================================================';
END $$;
