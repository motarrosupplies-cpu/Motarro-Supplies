-- Find a lost product by ID - Query 1: Products
-- Product ID: b2a91109-c4bf-4223-b059-dd35a7158bce
-- Run this query first

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

