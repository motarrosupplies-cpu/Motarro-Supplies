-- Find a lost product by ID
-- Product ID: b2a91109-c4bf-4223-b059-dd35a7158bce

-- ============================================
-- QUERY 1: Search all product tables
-- ============================================
SELECT 'simple_products' as table_name, id, name, created_at, updated_at, status
FROM simple_products
WHERE id = 'b2a91109-c4bf-4223-b059-dd35a7158bce'

UNION ALL

SELECT 'color_only_products' as table_name, id, name, created_at, updated_at, status
FROM color_only_products
WHERE id = 'b2a91109-c4bf-4223-b059-dd35a7158bce'

UNION ALL

SELECT 'size_only_products' as table_name, id, name, created_at, updated_at, status
FROM size_only_products
WHERE id = 'b2a91109-c4bf-4223-b059-dd35a7158bce'

UNION ALL

SELECT 'full_variant_products' as table_name, id, name, created_at, updated_at, status
FROM full_variant_products
WHERE id = 'b2a91109-c4bf-4223-b059-dd35a7158bce'

UNION ALL

SELECT 'products' as table_name, id, name, created_at, updated_at, status
FROM products
WHERE id = 'b2a91109-c4bf-4223-b059-dd35a7158bce';

-- ============================================
-- QUERY 2: Check if variants exist
-- Run this separately if needed
-- ============================================
SELECT 'color_variants' as variant_table, product_id, color_name, color_value, stock_available
FROM color_variants
WHERE product_id = 'b2a91109-c4bf-4223-b059-dd35a7158bce'

UNION ALL

SELECT 'size_variants' as variant_table, product_id, size, stock_available
FROM size_variants
WHERE product_id = 'b2a91109-c4bf-4223-b059-dd35a7158bce'

UNION ALL

SELECT 'full_variants' as variant_table, product_id, color_name, color_value, size, stock_available
FROM full_variants
WHERE product_id = 'b2a91109-c4bf-4223-b059-dd35a7158bce';

