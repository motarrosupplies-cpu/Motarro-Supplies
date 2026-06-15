-- Check the Tumbler product and its stock

-- Find the product
SELECT 
  'simple_products' as table_name,
  id, name, category, stock, status
FROM simple_products 
WHERE id = '2e5eaa78-a7dc-4b6c-8893-8c2845896679';

SELECT 
  'color_only_products' as table_name,
  id, name, category, total_stock, status
FROM color_only_products 
WHERE id = '2e5eaa78-a7dc-4b6c-8893-8c2845896679';

SELECT 
  'size_only_products' as table_name,
  id, name, category, total_stock, status
FROM size_only_products 
WHERE id = '2e5eaa78-a7dc-4b6c-8893-8c2845896679';

SELECT 
  'full_variant_products' as table_name,
  id, name, category, total_stock, status
FROM full_variant_products 
WHERE id = '2e5eaa78-a7dc-4b6c-8893-8c2845896679';

-- Check variants if it's a variant product
SELECT 
  'color_variants' as table_name,
  id, product_id, color_name, stock_available
FROM color_variants 
WHERE product_id = '2e5eaa78-a7dc-4b6c-8893-8c2845896679';

SELECT 
  'size_variants' as table_name,
  id, product_id, size, stock_available
FROM size_variants 
WHERE product_id = '2e5eaa78-a7dc-4b6c-8893-8c2845896679';

SELECT 
  'full_variants' as table_name,
  id, product_id, color_name, size, stock_available
FROM full_variants 
WHERE product_id = '2e5eaa78-a7dc-4b6c-8893-8c2845896679';

-- Check what all_products_unified shows
SELECT 
  product_type,
  id, name, category, total_stock, status
FROM all_products_unified 
WHERE id = '2e5eaa78-a7dc-4b6c-8893-8c2845896679';

