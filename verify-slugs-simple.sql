-- Simple verification query to check if slugs were generated
-- Run this after the main migration to verify results

-- Check how many products have slugs
SELECT 
  'simple_products' as table_name,
  COUNT(*) as total,
  COUNT(slug) as with_slug,
  COUNT(*) - COUNT(slug) as without_slug
FROM simple_products
WHERE status = 'active'
UNION ALL
SELECT 
  'color_only_products',
  COUNT(*),
  COUNT(slug),
  COUNT(*) - COUNT(slug)
FROM color_only_products
WHERE status = 'active'
UNION ALL
SELECT 
  'size_only_products',
  COUNT(*),
  COUNT(slug),
  COUNT(*) - COUNT(slug)
FROM size_only_products
WHERE status = 'active'
UNION ALL
SELECT 
  'full_variant_products',
  COUNT(*),
  COUNT(slug),
  COUNT(*) - COUNT(slug)
FROM full_variant_products
WHERE status = 'active';

-- View sample slugs (all columns match)
SELECT 
  'simple_products' as table_name,
  name,
  slug,
  category
FROM simple_products
WHERE status = 'active' AND slug IS NOT NULL
LIMIT 5
UNION ALL
SELECT 
  'color_only_products' as table_name,
  name,
  slug,
  category
FROM color_only_products
WHERE status = 'active' AND slug IS NOT NULL
LIMIT 5
UNION ALL
SELECT 
  'size_only_products' as table_name,
  name,
  slug,
  category
FROM size_only_products
WHERE status = 'active' AND slug IS NOT NULL
LIMIT 5
UNION ALL
SELECT 
  'full_variant_products' as table_name,
  name,
  slug,
  category
FROM full_variant_products
WHERE status = 'active' AND slug IS NOT NULL
LIMIT 5;

