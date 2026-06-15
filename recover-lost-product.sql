-- Recovery script for lost product: b2a91109-c4bf-4223-b059-dd35a7158bce
-- This script checks various sources to try to recover the product

-- ============================================
-- Check if product exists in all_products_unified view
-- ============================================
SELECT 'all_products_unified view' as source, id, name, product_type, category, price, status
FROM all_products_unified
WHERE id = 'b2a91109-c4bf-4223-b059-dd35a7158bce';

-- ============================================
-- Check recent product activity (if you have audit logs)
-- ============================================
-- Note: This assumes you might have a products_audit or similar table
-- Uncomment if you have audit logging enabled

-- SELECT * FROM products_audit
-- WHERE product_id = 'b2a91109-c4bf-4223-b059-dd35a7158bce'
-- ORDER BY created_at DESC
-- LIMIT 10;

-- ============================================
-- Check if product might be in a different state
-- Search by name pattern (if you remember part of the name)
-- ============================================
-- Replace 'Naruto' or product name pattern below:
-- SELECT 'simple_products' as table_name, id, name, status
-- FROM simple_products
-- WHERE LOWER(name) LIKE '%naruto%' OR LOWER(name) LIKE '%product_name_pattern%'
-- 
-- UNION ALL
-- 
-- SELECT 'color_only_products' as table_name, id, name, status
-- FROM color_only_products
-- WHERE LOWER(name) LIKE '%naruto%' OR LOWER(name) LIKE '%product_name_pattern%'
-- 
-- UNION ALL
-- 
-- SELECT 'size_only_products' as table_name, id, name, status
-- FROM size_only_products
-- WHERE LOWER(name) LIKE '%naruto%' OR LOWER(name) LIKE '%product_name_pattern%'
-- 
-- UNION ALL
-- 
-- SELECT 'full_variant_products' as table_name, id, name, status
-- FROM full_variant_products
-- WHERE LOWER(name) LIKE '%naruto%' OR LOWER(name) LIKE '%product_name_pattern%';

