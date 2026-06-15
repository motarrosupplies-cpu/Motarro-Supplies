-- Verification Queries - Run these to confirm migration worked
-- Copy and paste each query separately in Supabase SQL Editor

-- 1. Check if seo_slug columns exist in all tables
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name IN ('simple_products', 'color_only_products', 'size_only_products', 'full_variant_products')
  AND column_name = 'seo_slug'
ORDER BY table_name;

-- 2. Check if indexes were created
SELECT 
  tablename,
  indexname
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname LIKE '%slug%'
ORDER BY tablename, indexname;

-- 3. Check if function exists
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'generate_seo_slug';

-- 4. Check if view includes seo_slug
SELECT 
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'all_products_unified'
  AND column_name = 'seo_slug';

-- 5. Count products without slugs (these need slug generation)
SELECT 
  'simple_products' as table_name,
  COUNT(*) as products_without_slug
FROM public.simple_products
WHERE seo_slug IS NULL OR seo_slug = ''
UNION ALL
SELECT 
  'color_only_products',
  COUNT(*)
FROM public.color_only_products
WHERE seo_slug IS NULL OR seo_slug = ''
UNION ALL
SELECT 
  'size_only_products',
  COUNT(*)
FROM public.size_only_products
WHERE seo_slug IS NULL OR seo_slug = ''
UNION ALL
SELECT 
  'full_variant_products',
  COUNT(*)
FROM public.full_variant_products
WHERE seo_slug IS NULL OR seo_slug = '';

