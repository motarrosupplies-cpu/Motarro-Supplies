-- Check if custom printing products are being stored correctly

-- 1. Check products in simple_products table with category "custom printing"
SELECT 
  id, 
  name, 
  category, 
  status, 
  created_at 
FROM simple_products 
WHERE category = 'custom printing' 
ORDER BY created_at DESC 
LIMIT 10;

-- 2. Check products in color_only_products table with category "custom printing"
SELECT 
  id, 
  name, 
  category, 
  status, 
  created_at 
FROM color_only_products 
WHERE category = 'custom printing' 
ORDER BY created_at DESC 
LIMIT 10;

-- 3. Check products in size_only_products table with category "custom printing"
SELECT 
  id, 
  name, 
  category, 
  status, 
  created_at 
FROM size_only_products 
WHERE category = 'custom printing' 
ORDER BY created_at DESC 
LIMIT 10;

-- 4. Check products in full_variant_products table with category "custom printing"
SELECT 
  id, 
  name, 
  category, 
  status, 
  created_at 
FROM full_variant_products 
WHERE category = 'custom printing' 
ORDER BY created_at DESC 
LIMIT 10;

-- 5. Check what all_products_unified view returns for "custom printing"
SELECT 
  product_type,
  id, 
  name, 
  category, 
  status, 
  created_at 
FROM all_products_unified 
WHERE category = 'custom printing' 
ORDER BY created_at DESC 
LIMIT 10;

-- 6. Check the main products table (old structure)
SELECT 
  id, 
  name, 
  category, 
  status, 
  created_at 
FROM products 
WHERE category = 'custom printing' 
ORDER BY created_at DESC 
LIMIT 10;

-- 7. Check for any products created in the last hour
SELECT 
  'simple' as type,
  id, 
  name, 
  category, 
  status, 
  created_at 
FROM simple_products 
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;

SELECT 
  'color_only' as type,
  id, 
  name, 
  category, 
  status, 
  created_at 
FROM color_only_products 
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;

SELECT 
  'size_only' as type,
  id, 
  name, 
  category, 
  status, 
  created_at 
FROM size_only_products 
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;

SELECT 
  'full_variant' as type,
  id, 
  name, 
  category, 
  status, 
  created_at 
FROM full_variant_products 
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;

