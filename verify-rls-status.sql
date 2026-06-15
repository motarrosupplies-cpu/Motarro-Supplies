-- ============================================================================
-- Verify RLS Status After Security Fixes
-- Run this to confirm RLS is enabled on all tables
-- ============================================================================

-- Check RLS status on all tables
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled,
  CASE 
    WHEN rowsecurity THEN '✅ ENABLED' 
    ELSE '❌ DISABLED' 
  END as status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'menu_items',
    'menu_category_mapping',
    'product_images',
    'product_colors',
    'product_sizes',
    'product_categories',
    'color_variants',
    'size_variants',
    'full_variants',
    'orders',
    'eft_bank_details'
  )
ORDER BY tablename;

-- Summary count
SELECT 
  COUNT(*) FILTER (WHERE rowsecurity = true) as tables_with_rls_enabled,
  COUNT(*) FILTER (WHERE rowsecurity = false) as tables_with_rls_disabled,
  COUNT(*) as total_tables
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'menu_items',
    'menu_category_mapping',
    'product_images',
    'product_colors',
    'product_sizes',
    'product_categories',
    'color_variants',
    'size_variants',
    'full_variants',
    'orders',
    'eft_bank_details'
  );

-- Check if tables have both RLS enabled AND policies
SELECT 
  t.tablename,
  t.rowsecurity as rls_enabled,
  COUNT(p.policyname) as policy_count,
  CASE 
    WHEN t.rowsecurity = true AND COUNT(p.policyname) > 0 THEN '✅ GOOD'
    WHEN t.rowsecurity = true AND COUNT(p.policyname) = 0 THEN '⚠️ RLS ENABLED BUT NO POLICIES'
    WHEN t.rowsecurity = false AND COUNT(p.policyname) > 0 THEN '❌ POLICIES EXIST BUT RLS DISABLED'
    ELSE '❌ NO RLS, NO POLICIES'
  END as status
FROM pg_tables t
LEFT JOIN pg_policies p ON t.tablename = p.tablename AND t.schemaname = p.schemaname
WHERE t.schemaname = 'public'
  AND t.tablename IN (
    'menu_items',
    'menu_category_mapping',
    'product_images',
    'product_colors',
    'product_sizes',
    'product_categories',
    'color_variants',
    'size_variants',
    'full_variants',
    'orders',
    'eft_bank_details'
  )
GROUP BY t.tablename, t.rowsecurity
ORDER BY t.tablename;

