-- Migration Script: Move existing products to optimized structure
-- This script analyzes existing products and moves them to the appropriate tables

-- Step 1: Create temporary table to analyze existing products
CREATE TEMP TABLE product_analysis AS
SELECT 
    p.id,
    p.name,
    p.description,
    p.price,
    p.original_price,
    p.category,
    p.stock,
    p.stock_quantity,
    p.is_new,
    p.on_sale,
    p.status,
    p.image,
    p.images,
    p.image_alt_texts,
    p.seo_title,
    p.seo_description,
    p.seo_keywords,
    p.seo_slug,
    p.created_at,
    p.updated_at,
    p.has_color_options,
    p.has_size_options,
    p.colors,
    p.sizes,
    -- Count variants to determine product type
    COUNT(pv.id) as variant_count,
    COUNT(CASE WHEN pv.color_name IS NOT NULL THEN 1 END) as color_variant_count,
    COUNT(CASE WHEN pv.size IS NOT NULL THEN 1 END) as size_variant_count,
    COUNT(CASE WHEN pv.color_name IS NOT NULL AND pv.size IS NOT NULL THEN 1 END) as full_variant_count,
    COUNT(CASE WHEN pv.color_name IS NULL AND pv.size IS NULL THEN 1 END) as simple_variant_count
FROM products p
LEFT JOIN product_variants pv ON p.id = pv.product_id AND pv.is_active = true
GROUP BY p.id, p.name, p.description, p.price, p.original_price, p.category, p.stock, p.stock_quantity, 
         p.is_new, p.on_sale, p.status, p.image, p.images, p.image_alt_texts, p.seo_title, p.seo_description, 
         p.seo_keywords, p.seo_slug, p.created_at, p.updated_at, p.has_color_options, p.has_size_options, p.colors, p.sizes;

-- Step 2: Insert simple products (no variants or only simple variants)
INSERT INTO simple_products (
    id, name, description, price, original_price, category, stock, is_new, on_sale, status,
    image, images, image_alt_texts, seo_title, seo_description, seo_keywords, seo_slug,
    created_at, updated_at
)
SELECT 
    id, name, description, price, original_price, category, 
    COALESCE(stock, stock_quantity, 0) as stock,
    is_new, on_sale, status, image, images, 
    CASE 
        WHEN image_alt_texts IS NULL THEN NULL
        WHEN image_alt_texts = '' THEN NULL
        ELSE image_alt_texts::jsonb
    END as image_alt_texts,
    seo_title, seo_description, seo_keywords, seo_slug,
    created_at, updated_at
FROM product_analysis
WHERE 
    (has_color_options = false AND has_size_options = false) OR
    (variant_count = 1 AND simple_variant_count = 1) OR
    (variant_count = 0);

-- Step 3: Insert color-only products
INSERT INTO color_only_products (
    id, name, description, price, original_price, category, total_stock, colors,
    is_new, on_sale, status, image, images, image_alt_texts,
    seo_title, seo_description, seo_keywords, seo_slug,
    created_at, updated_at
)
SELECT 
    pa.id, pa.name, pa.description, pa.price, pa.original_price, pa.category,
    COALESCE(SUM(pv.stock_available), pa.stock, pa.stock_quantity, 0) as total_stock,
    pa.colors,
    pa.is_new, pa.on_sale, pa.status, pa.image, pa.images, 
    CASE 
        WHEN pa.image_alt_texts IS NULL THEN NULL
        WHEN pa.image_alt_texts = '' THEN NULL
        ELSE pa.image_alt_texts::jsonb
    END as image_alt_texts,
    pa.seo_title, pa.seo_description, pa.seo_keywords, pa.seo_slug,
    pa.created_at, pa.updated_at
FROM product_analysis pa
LEFT JOIN product_variants pv ON pa.id = pv.product_id AND pv.is_active = true
WHERE 
    pa.has_color_options = true AND pa.has_size_options = false AND
    pa.color_variant_count > 0 AND pa.size_variant_count = 0
GROUP BY pa.id, pa.name, pa.description, pa.price, pa.original_price, pa.category, pa.colors,
         pa.stock, pa.stock_quantity, pa.is_new, pa.on_sale, pa.status, pa.image, pa.images, pa.image_alt_texts,
         pa.seo_title, pa.seo_description, pa.seo_keywords, pa.seo_slug,
         pa.created_at, pa.updated_at;

-- Step 4: Insert size-only products
INSERT INTO size_only_products (
    id, name, description, price, original_price, category, total_stock, sizes,
    is_new, on_sale, status, image, images, image_alt_texts,
    seo_title, seo_description, seo_keywords, seo_slug,
    created_at, updated_at
)
SELECT 
    pa.id, pa.name, pa.description, pa.price, pa.original_price, pa.category,
    COALESCE(SUM(pv.stock_available), pa.stock, pa.stock_quantity, 0) as total_stock,
    pa.sizes,
    pa.is_new, pa.on_sale, pa.status, pa.image, pa.images, 
    CASE 
        WHEN pa.image_alt_texts IS NULL THEN NULL
        WHEN pa.image_alt_texts = '' THEN NULL
        ELSE pa.image_alt_texts::jsonb
    END as image_alt_texts,
    pa.seo_title, pa.seo_description, pa.seo_keywords, pa.seo_slug,
    pa.created_at, pa.updated_at
FROM product_analysis pa
LEFT JOIN product_variants pv ON pa.id = pv.product_id AND pv.is_active = true
WHERE 
    pa.has_color_options = false AND pa.has_size_options = true AND
    pa.size_variant_count > 0 AND pa.color_variant_count = 0
GROUP BY pa.id, pa.name, pa.description, pa.price, pa.original_price, pa.category, pa.sizes,
         pa.stock, pa.stock_quantity, pa.is_new, pa.on_sale, pa.status, pa.image, pa.images, pa.image_alt_texts,
         pa.seo_title, pa.seo_description, pa.seo_keywords, pa.seo_slug,
         pa.created_at, pa.updated_at;

-- Step 5: Insert full variant products
INSERT INTO full_variant_products (
    id, name, description, price, original_price, category, total_stock, colors, sizes,
    is_new, on_sale, status, image, images, image_alt_texts,
    seo_title, seo_description, seo_keywords, seo_slug,
    created_at, updated_at
)
SELECT 
    pa.id, pa.name, pa.description, pa.price, pa.original_price, pa.category,
    COALESCE(SUM(pv.stock_available), pa.stock, pa.stock_quantity, 0) as total_stock,
    pa.colors, pa.sizes,
    pa.is_new, pa.on_sale, pa.status, pa.image, pa.images, 
    CASE 
        WHEN pa.image_alt_texts IS NULL THEN NULL
        WHEN pa.image_alt_texts = '' THEN NULL
        ELSE pa.image_alt_texts::jsonb
    END as image_alt_texts,
    pa.seo_title, pa.seo_description, pa.seo_keywords, pa.seo_slug,
    pa.created_at, pa.updated_at
FROM product_analysis pa
LEFT JOIN product_variants pv ON pa.id = pv.product_id AND pv.is_active = true
WHERE 
    pa.has_color_options = true AND pa.has_size_options = true AND
    pa.full_variant_count > 0
GROUP BY pa.id, pa.name, pa.description, pa.price, pa.original_price, pa.category, pa.colors, pa.sizes,
         pa.stock, pa.stock_quantity, pa.is_new, pa.on_sale, pa.status, pa.image, pa.images, pa.image_alt_texts,
         pa.seo_title, pa.seo_description, pa.seo_keywords, pa.seo_slug,
         pa.created_at, pa.updated_at;

-- Step 6: Migrate color variants
INSERT INTO color_variants (
    product_id, color_name, color_value, stock_available, stock_incoming, stock_reserved,
    price_override, is_active, sort_index, created_at, updated_at
)
SELECT 
    pv.product_id, pv.color_name, pv.color_value, pv.stock_available, pv.stock_incoming, pv.stock_reserved,
    pv.price_override, pv.is_active, pv.sort_index, pv.created_at, pv.updated_at
FROM product_variants pv
INNER JOIN color_only_products cop ON pv.product_id = cop.id
WHERE pv.is_active = true AND pv.color_name IS NOT NULL AND pv.size IS NULL;

-- Step 7: Migrate size variants
INSERT INTO size_variants (
    product_id, size, stock_available, stock_incoming, stock_reserved,
    price_override, is_active, sort_index, created_at, updated_at
)
SELECT 
    pv.product_id, pv.size, pv.stock_available, pv.stock_incoming, pv.stock_reserved,
    pv.price_override, pv.is_active, pv.sort_index, pv.created_at, pv.updated_at
FROM product_variants pv
INNER JOIN size_only_products sop ON pv.product_id = sop.id
WHERE pv.is_active = true AND pv.size IS NOT NULL AND pv.color_name IS NULL;

-- Step 8: Migrate full variants
INSERT INTO full_variants (
    product_id, color_name, color_value, size, stock_available, stock_incoming, stock_reserved,
    price_override, is_active, sort_index, created_at, updated_at
)
SELECT 
    pv.product_id, pv.color_name, pv.color_value, pv.size, pv.stock_available, pv.stock_incoming, pv.stock_reserved,
    pv.price_override, pv.is_active, pv.sort_index, pv.created_at, pv.updated_at
FROM product_variants pv
INNER JOIN full_variant_products fvp ON pv.product_id = fvp.id
WHERE pv.is_active = true AND pv.color_name IS NOT NULL AND pv.size IS NOT NULL;

-- Step 9: Create simple variants for simple products (single base variant)
INSERT INTO simple_products (id, name, description, price, original_price, category, stock, is_new, on_sale, status, image, images, image_alt_texts, seo_title, seo_description, seo_keywords, seo_slug, created_at, updated_at)
SELECT 
    pa.id, pa.name, pa.description, pa.price, pa.original_price, pa.category,
    COALESCE(SUM(pv.stock_available), pa.stock, pa.stock_quantity, 0) as stock,
    pa.is_new, pa.on_sale, pa.status, pa.image, pa.images, 
    CASE 
        WHEN pa.image_alt_texts IS NULL THEN NULL
        WHEN pa.image_alt_texts = '' THEN NULL
        ELSE pa.image_alt_texts::jsonb
    END as image_alt_texts,
    pa.seo_title, pa.seo_description, pa.seo_keywords, pa.seo_slug,
    pa.created_at, pa.updated_at
FROM product_analysis pa
LEFT JOIN product_variants pv ON pa.id = pv.product_id AND pv.is_active = true
WHERE 
    pa.has_color_options = true AND pa.has_size_options = false AND
    pa.color_variant_count = 0 AND pa.size_variant_count = 0 AND pa.simple_variant_count > 0
GROUP BY pa.id, pa.name, pa.description, pa.price, pa.original_price, pa.category,
         pa.stock, pa.stock_quantity, pa.is_new, pa.on_sale, pa.status, pa.image, pa.images, pa.image_alt_texts,
         pa.seo_title, pa.seo_description, pa.seo_keywords, pa.seo_slug,
         pa.created_at, pa.updated_at;

-- Step 10: Verification queries
-- Check migration results
SELECT 'Simple Products' as table_name, COUNT(*) as count FROM simple_products
UNION ALL
SELECT 'Color Only Products', COUNT(*) FROM color_only_products
UNION ALL
SELECT 'Size Only Products', COUNT(*) FROM size_only_products
UNION ALL
SELECT 'Full Variant Products', COUNT(*) FROM full_variant_products
UNION ALL
SELECT 'Color Variants', COUNT(*) FROM color_variants
UNION ALL
SELECT 'Size Variants', COUNT(*) FROM size_variants
UNION ALL
SELECT 'Full Variants', COUNT(*) FROM full_variants;

-- Show sample data from each table
SELECT 'Simple Products Sample' as info, id, name, stock FROM simple_products LIMIT 3;
SELECT 'Color Only Products Sample' as info, id, name, total_stock FROM color_only_products LIMIT 3;
SELECT 'Size Only Products Sample' as info, id, name, total_stock FROM size_only_products LIMIT 3;
SELECT 'Full Variant Products Sample' as info, id, name, total_stock FROM full_variant_products LIMIT 3;