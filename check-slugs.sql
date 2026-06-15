-- SIMPLE QUERY TO CHECK IF SLUGS EXIST
-- Copy everything below this line and paste into Supabase SQL Editor

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

