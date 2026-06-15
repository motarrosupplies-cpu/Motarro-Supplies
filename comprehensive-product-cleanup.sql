-- COMPREHENSIVE PRODUCT CLEANUP SCRIPT
-- This script will clean up your products and variants tables for a fresh start

-- Step 1: Backup existing data (optional - uncomment if you want to keep backups)
-- CREATE TABLE products_backup AS SELECT * FROM products;
-- CREATE TABLE product_variants_backup AS SELECT * FROM product_variants;

-- Step 2: Clean up product_variants table
-- Remove all variants that don't have corresponding products
DELETE FROM product_variants 
WHERE product_id NOT IN (SELECT id FROM products);

-- Step 3: Clean up products table
-- Remove any products that might have invalid data
DELETE FROM products 
WHERE name IS NULL OR name = '' OR price IS NULL OR category IS NULL;

-- Step 4: Ensure all products have proper stock values
UPDATE products 
SET stock = COALESCE(stock, 0),
    stock_quantity = COALESCE(stock_quantity, 0)
WHERE stock IS NULL OR stock_quantity IS NULL;

-- Step 5: Ensure all products have proper SEO fields
UPDATE products 
SET seo_title = COALESCE(seo_title, '-'),
    seo_description = COALESCE(seo_description, '-'),
    seo_keywords = COALESCE(seo_keywords, '-')
WHERE seo_title IS NULL OR seo_description IS NULL OR seo_keywords IS NULL;

-- Step 5b: Fix SEO slugs with unique values
UPDATE products 
SET seo_slug = COALESCE(seo_slug, 'product-' || id)
WHERE seo_slug IS NULL OR seo_slug = '-';

-- Step 6: Ensure all products have proper image fields
UPDATE products 
SET image = COALESCE(image, '/placeholder.svg'),
    images = COALESCE(images, '["/placeholder.svg"]'),
    image_alt_texts = COALESCE(image_alt_texts, '["Product image"]')
WHERE image IS NULL OR images IS NULL OR image_alt_texts IS NULL;

-- Step 7: Ensure all products have proper details field
UPDATE products 
SET details = COALESCE(details, '{"material":"100%Cotton","fit":"Regular","care":"Machine Cold Wash","origin":"Made in South Africa"}')
WHERE details IS NULL;

-- Step 8: Ensure all products have proper boolean fields
UPDATE products 
SET is_new = COALESCE(is_new, true),
    on_sale = COALESCE(on_sale, false),
    has_color_options = COALESCE(has_color_options, false),
    has_size_options = COALESCE(has_size_options, false),
    status = COALESCE(status, 'active')
WHERE is_new IS NULL OR on_sale IS NULL OR has_color_options IS NULL OR has_size_options IS NULL OR status IS NULL;

-- Step 9: Clean up variant data
-- Fix empty color names
UPDATE product_variants 
SET color_name = NULL 
WHERE color_name = '' OR color_name = 'NULL';

-- Fix empty color values
UPDATE product_variants 
SET color_value = NULL 
WHERE color_value = '' OR color_value = 'NULL';

-- Fix empty sizes
UPDATE product_variants 
SET size = NULL 
WHERE size = '' OR size = 'NULL';

-- Fix null stock values
UPDATE product_variants 
SET stock_available = COALESCE(stock_available, 0),
    stock_incoming = COALESCE(stock_incoming, 0),
    stock_reserved = COALESCE(stock_reserved, 0),
    is_active = COALESCE(is_active, true)
WHERE stock_available IS NULL OR stock_incoming IS NULL OR stock_reserved IS NULL OR is_active IS NULL;

-- Step 10: Remove duplicate variants
DELETE FROM product_variants 
WHERE id IN (
    SELECT id FROM (
        SELECT id, ROW_NUMBER() OVER (
            PARTITION BY product_id, color_name, color_value, size 
            ORDER BY created_at DESC
        ) as rn
        FROM product_variants
    ) t WHERE rn > 1
);

-- Step 11: Ensure all products have at least one variant
-- This will create a base variant for products without any variants
INSERT INTO product_variants (product_id, color_name, color_value, size, stock_available, stock_incoming, stock_reserved, is_active, sort_index)
SELECT 
    p.id,
    NULL,
    NULL,
    NULL,
    p.stock,
    0,
    0,
    true,
    1
FROM products p
WHERE p.id NOT IN (SELECT DISTINCT product_id FROM product_variants);

-- Step 12: Update product stock to match variant totals
UPDATE products 
SET stock = (
    SELECT COALESCE(SUM(stock_available), 0) 
    FROM product_variants 
    WHERE product_id = products.id AND is_active = true
)
WHERE has_color_options = true OR has_size_options = true;

-- Step 13: Verify the cleanup
SELECT 
    'PRODUCTS' as table_name,
    COUNT(*) as total_count,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_count,
    COUNT(CASE WHEN has_color_options = true THEN 1 END) as with_colors,
    COUNT(CASE WHEN has_size_options = true THEN 1 END) as with_sizes
FROM products

UNION ALL

SELECT 
    'VARIANTS' as table_name,
    COUNT(*) as total_count,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_count,
    COUNT(CASE WHEN color_name IS NOT NULL THEN 1 END) as with_colors,
    COUNT(CASE WHEN size IS NOT NULL THEN 1 END) as with_sizes
FROM product_variants;

-- Step 14: Show sample data
SELECT 'SAMPLE PRODUCTS' as info;
SELECT id, name, category, stock, has_color_options, has_size_options, status FROM products LIMIT 5;

SELECT 'SAMPLE VARIANTS' as info;
SELECT product_id, color_name, color_value, size, stock_available, is_active FROM product_variants LIMIT 10;
