-- Find a lost product by ID - Query 2: Variants
-- Product ID: b2a91109-c4bf-4223-b059-dd35a7158bce
-- Run this query separately to check for variants
-- All queries return: variant_table, product_id, color_name, color_value, size, stock_available

SELECT 
  'color_variants' as variant_table, 
  product_id, 
  color_name, 
  color_value, 
  NULL as size,
  stock_available
FROM color_variants
WHERE product_id = 'b2a91109-c4bf-4223-b059-dd35a7158bce'

UNION ALL

SELECT 
  'size_variants' as variant_table, 
  product_id, 
  NULL as color_name, 
  NULL as color_value, 
  size,
  stock_available
FROM size_variants
WHERE product_id = 'b2a91109-c4bf-4223-b059-dd35a7158bce'

UNION ALL

SELECT 
  'full_variants' as variant_table, 
  product_id, 
  color_name, 
  color_value, 
  size, 
  stock_available
FROM full_variants
WHERE product_id = 'b2a91109-c4bf-4223-b059-dd35a7158bce';

