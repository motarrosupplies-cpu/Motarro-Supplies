-- ============================================
-- COMPREHENSIVE MIGRATION: All Products to Optimized Structure
-- ============================================
-- This script migrates ALL products from the old 'products' table
-- to the optimized tables (simple_products, color_only_products, etc.)
--
-- IMPORTANT: Run this in Supabase SQL Editor
-- BACKUP YOUR DATABASE BEFORE RUNNING THIS SCRIPT
-- ============================================

-- Step 1: Analyze all products and determine their type
CREATE TEMP TABLE IF NOT EXISTS product_analysis AS
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
    COUNT(DISTINCT pv.id) FILTER (WHERE pv.is_active = true OR pv.is_active IS NULL) as variant_count,
    COUNT(DISTINCT CASE WHEN pv.color_name IS NOT NULL AND (pv.is_active = true OR pv.is_active IS NULL) THEN pv.id END) as color_variant_count,
    COUNT(DISTINCT CASE WHEN pv.size IS NOT NULL AND (pv.is_active = true OR pv.is_active IS NULL) THEN pv.id END) as size_variant_count,
    COUNT(DISTINCT CASE WHEN pv.color_name IS NOT NULL AND pv.size IS NOT NULL AND (pv.is_active = true OR pv.is_active IS NULL) THEN pv.id END) as full_variant_count
FROM products p
LEFT JOIN product_variants pv ON p.id = pv.product_id
GROUP BY p.id, p.name, p.description, p.price, p.original_price, p.category, p.stock, p.stock_quantity, 
         p.is_new, p.on_sale, p.status, p.image, p.images, p.image_alt_texts, p.seo_title, p.seo_description, 
         p.seo_keywords, p.seo_slug, p.created_at, p.updated_at, p.has_color_options, p.has_size_options, p.colors, p.sizes;

-- Step 2: Migrate SIMPLE products (no colors, no sizes)
INSERT INTO simple_products (
    id, name, description, price, original_price, category, stock,
    is_new, on_sale, status, image, images, image_alt_texts,
    seo_title, seo_description, seo_keywords, seo_slug,
    created_at, updated_at
)
SELECT 
    id, name, description, price, original_price, category, 
    COALESCE(stock, stock_quantity, 0) as stock,
    COALESCE(is_new, false) as is_new, 
    COALESCE(on_sale, false) as on_sale, 
    COALESCE(status, 'active') as status, 
    image, 
    CASE 
        WHEN images IS NULL THEN '[]'::jsonb
        WHEN images::text LIKE '[%' THEN images::jsonb
        ELSE images::jsonb
    END as images,
    CASE 
        WHEN image_alt_texts IS NULL THEN NULL
        WHEN image_alt_texts = '' THEN NULL
        WHEN image_alt_texts::text LIKE '[%' THEN image_alt_texts::jsonb
        ELSE image_alt_texts::jsonb
    END as image_alt_texts,
    seo_title, seo_description, seo_keywords, seo_slug,
    created_at, updated_at
FROM product_analysis
WHERE 
    -- Simple products: no color options, no size options, and no relevant variants
    (
        (COALESCE(has_color_options, false) = false AND COALESCE(has_size_options, false) = false) OR
        (variant_count = 0) OR
        (color_variant_count = 0 AND size_variant_count = 0)
    )
    -- Don't migrate products that are already in optimized tables
    AND id NOT IN (SELECT id FROM simple_products)
    AND id NOT IN (SELECT id FROM color_only_products)
    AND id NOT IN (SELECT id FROM size_only_products)
    AND id NOT IN (SELECT id FROM full_variant_products)
ON CONFLICT (id) DO NOTHING;

-- Step 3: Migrate COLOR-ONLY products
INSERT INTO color_only_products (
    id, name, description, price, original_price, category, total_stock, colors,
    is_new, on_sale, status, image, images, image_alt_texts,
    seo_title, seo_description, seo_keywords, seo_slug,
    created_at, updated_at
)
SELECT 
    pa.id, pa.name, pa.description, pa.price, pa.original_price, pa.category,
    COALESCE(
        (SELECT SUM(stock_available) FROM product_variants WHERE product_id = pa.id AND (is_active = true OR is_active IS NULL)),
        pa.stock, pa.stock_quantity, 0
    ) as total_stock,
    CASE 
        WHEN pa.colors IS NULL THEN '[]'::jsonb
        WHEN pa.colors::text LIKE '[%' THEN pa.colors::jsonb
        ELSE pa.colors::jsonb
    END as colors,
    COALESCE(pa.is_new, false) as is_new, 
    COALESCE(pa.on_sale, false) as on_sale, 
    COALESCE(pa.status, 'active') as status, 
    pa.image, 
    CASE 
        WHEN pa.images IS NULL THEN '[]'::jsonb
        WHEN pa.images::text LIKE '[%' THEN pa.images::jsonb
        ELSE pa.images::jsonb
    END as images,
    CASE 
        WHEN pa.image_alt_texts IS NULL THEN NULL
        WHEN pa.image_alt_texts = '' THEN NULL
        WHEN pa.image_alt_texts::text LIKE '[%' THEN pa.image_alt_texts::jsonb
        ELSE pa.image_alt_texts::jsonb
    END as image_alt_texts,
    pa.seo_title, pa.seo_description, pa.seo_keywords, pa.seo_slug,
    pa.created_at, pa.updated_at
FROM product_analysis pa
WHERE 
    -- Color-only products: has colors but no sizes
    (
        (COALESCE(pa.has_color_options, false) = true AND COALESCE(pa.has_size_options, false) = false) OR
        (pa.color_variant_count > 0 AND pa.size_variant_count = 0 AND pa.full_variant_count = 0)
    )
    -- Don't migrate products that are already in optimized tables
    AND pa.id NOT IN (SELECT id FROM simple_products)
    AND pa.id NOT IN (SELECT id FROM color_only_products)
    AND pa.id NOT IN (SELECT id FROM size_only_products)
    AND pa.id NOT IN (SELECT id FROM full_variant_products)
ON CONFLICT (id) DO NOTHING;

-- Migrate color variants
INSERT INTO color_variants (
    product_id, color_name, color_value, stock_available, stock_incoming, stock_reserved,
    price_override, is_active, sort_index, created_at, updated_at
)
SELECT 
    pv.product_id, 
    pv.color_name, 
    pv.color_value, 
    COALESCE(pv.stock_available, 0) as stock_available, 
    COALESCE(pv.stock_incoming, 0) as stock_incoming, 
    COALESCE(pv.stock_reserved, 0) as stock_reserved,
    pv.price_override, 
    COALESCE(pv.is_active, true) as is_active,
    COALESCE(pv.sort_index, ROW_NUMBER() OVER (PARTITION BY pv.product_id ORDER BY pv.created_at)) as sort_index,
    COALESCE(pv.created_at, NOW()) as created_at, 
    COALESCE(pv.updated_at, NOW()) as updated_at
FROM product_variants pv
INNER JOIN color_only_products cop ON pv.product_id = cop.id
WHERE pv.color_name IS NOT NULL 
    AND pv.size IS NULL
    AND pv.product_id IN (SELECT id FROM color_only_products WHERE id NOT IN (SELECT product_id FROM color_variants))
ON CONFLICT DO NOTHING;

-- Step 4: Migrate SIZE-ONLY products
INSERT INTO size_only_products (
    id, name, description, price, original_price, category, total_stock, sizes,
    is_new, on_sale, status, image, images, image_alt_texts,
    seo_title, seo_description, seo_keywords, seo_slug,
    created_at, updated_at
)
SELECT 
    pa.id, pa.name, pa.description, pa.price, pa.original_price, pa.category,
    COALESCE(
        (SELECT SUM(stock_available) FROM product_variants WHERE product_id = pa.id AND (is_active = true OR is_active IS NULL)),
        pa.stock, pa.stock_quantity, 0
    ) as total_stock,
    CASE 
        WHEN pa.sizes IS NULL THEN '[]'::jsonb
        WHEN pa.sizes::text LIKE '[%' THEN pa.sizes::jsonb
        ELSE pa.sizes::jsonb
    END as sizes,
    COALESCE(pa.is_new, false) as is_new, 
    COALESCE(pa.on_sale, false) as on_sale, 
    COALESCE(pa.status, 'active') as status, 
    pa.image, 
    CASE 
        WHEN pa.images IS NULL THEN '[]'::jsonb
        WHEN pa.images::text LIKE '[%' THEN pa.images::jsonb
        ELSE pa.images::jsonb
    END as images,
    CASE 
        WHEN pa.image_alt_texts IS NULL THEN NULL
        WHEN pa.image_alt_texts = '' THEN NULL
        WHEN pa.image_alt_texts::text LIKE '[%' THEN pa.image_alt_texts::jsonb
        ELSE pa.image_alt_texts::jsonb
    END as image_alt_texts,
    pa.seo_title, pa.seo_description, pa.seo_keywords, pa.seo_slug,
    pa.created_at, pa.updated_at
FROM product_analysis pa
WHERE 
    -- Size-only products: has sizes but no colors
    (
        (COALESCE(pa.has_size_options, false) = true AND COALESCE(pa.has_color_options, false) = false) OR
        (pa.size_variant_count > 0 AND pa.color_variant_count = 0 AND pa.full_variant_count = 0)
    )
    -- Don't migrate products that are already in optimized tables
    AND pa.id NOT IN (SELECT id FROM simple_products)
    AND pa.id NOT IN (SELECT id FROM color_only_products)
    AND pa.id NOT IN (SELECT id FROM size_only_products)
    AND pa.id NOT IN (SELECT id FROM full_variant_products)
ON CONFLICT (id) DO NOTHING;

-- Migrate size variants
INSERT INTO size_variants (
    product_id, size, stock_available, stock_incoming, stock_reserved,
    price_override, is_active, sort_index, created_at, updated_at
)
SELECT 
    pv.product_id, 
    pv.size, 
    COALESCE(pv.stock_available, 0) as stock_available, 
    COALESCE(pv.stock_incoming, 0) as stock_incoming, 
    COALESCE(pv.stock_reserved, 0) as stock_reserved,
    pv.price_override, 
    COALESCE(pv.is_active, true) as is_active,
    COALESCE(pv.sort_index, ROW_NUMBER() OVER (PARTITION BY pv.product_id ORDER BY pv.created_at)) as sort_index,
    COALESCE(pv.created_at, NOW()) as created_at, 
    COALESCE(pv.updated_at, NOW()) as updated_at
FROM product_variants pv
INNER JOIN size_only_products sop ON pv.product_id = sop.id
WHERE pv.size IS NOT NULL 
    AND pv.color_name IS NULL
    AND pv.product_id IN (SELECT id FROM size_only_products WHERE id NOT IN (SELECT product_id FROM size_variants))
ON CONFLICT DO NOTHING;

-- Step 5: Migrate FULL-VARIANT products (both colors and sizes)
INSERT INTO full_variant_products (
    id, name, description, price, original_price, category, total_stock, colors, sizes,
    is_new, on_sale, status, image, images, image_alt_texts,
    seo_title, seo_description, seo_keywords, seo_slug,
    created_at, updated_at
)
SELECT 
    pa.id, pa.name, pa.description, pa.price, pa.original_price, pa.category,
    COALESCE(
        (SELECT SUM(stock_available) FROM product_variants WHERE product_id = pa.id AND (is_active = true OR is_active IS NULL)),
        pa.stock, pa.stock_quantity, 0
    ) as total_stock,
    CASE 
        WHEN pa.colors IS NULL THEN '[]'::jsonb
        WHEN pa.colors::text LIKE '[%' THEN pa.colors::jsonb
        ELSE pa.colors::jsonb
    END as colors,
    CASE 
        WHEN pa.sizes IS NULL THEN '[]'::jsonb
        WHEN pa.sizes::text LIKE '[%' THEN pa.sizes::jsonb
        ELSE pa.sizes::jsonb
    END as sizes,
    COALESCE(pa.is_new, false) as is_new, 
    COALESCE(pa.on_sale, false) as on_sale, 
    COALESCE(pa.status, 'active') as status, 
    pa.image, 
    CASE 
        WHEN pa.images IS NULL THEN '[]'::jsonb
        WHEN pa.images::text LIKE '[%' THEN pa.images::jsonb
        ELSE pa.images::jsonb
    END as images,
    CASE 
        WHEN pa.image_alt_texts IS NULL THEN NULL
        WHEN pa.image_alt_texts = '' THEN NULL
        WHEN pa.image_alt_texts::text LIKE '[%' THEN pa.image_alt_texts::jsonb
        ELSE pa.image_alt_texts::jsonb
    END as image_alt_texts,
    pa.seo_title, pa.seo_description, pa.seo_keywords, pa.seo_slug,
    pa.created_at, pa.updated_at
FROM product_analysis pa
WHERE 
    -- Full-variant products: has both colors and sizes
    (
        (COALESCE(pa.has_color_options, false) = true AND COALESCE(pa.has_size_options, false) = true) OR
        (pa.full_variant_count > 0) OR
        (pa.color_variant_count > 0 AND pa.size_variant_count > 0)
    )
    -- Don't migrate products that are already in optimized tables
    AND pa.id NOT IN (SELECT id FROM simple_products)
    AND pa.id NOT IN (SELECT id FROM color_only_products)
    AND pa.id NOT IN (SELECT id FROM size_only_products)
    AND pa.id NOT IN (SELECT id FROM full_variant_products)
ON CONFLICT (id) DO NOTHING;

-- Migrate full variants
INSERT INTO full_variants (
    product_id, color_name, color_value, size, stock_available, stock_incoming, stock_reserved,
    price_override, is_active, sort_index, created_at, updated_at
)
SELECT 
    pv.product_id, 
    pv.color_name, 
    pv.color_value, 
    pv.size, 
    COALESCE(pv.stock_available, 0) as stock_available, 
    COALESCE(pv.stock_incoming, 0) as stock_incoming, 
    COALESCE(pv.stock_reserved, 0) as stock_reserved,
    pv.price_override, 
    COALESCE(pv.is_active, true) as is_active,
    COALESCE(pv.sort_index, ROW_NUMBER() OVER (PARTITION BY pv.product_id ORDER BY pv.created_at)) as sort_index,
    COALESCE(pv.created_at, NOW()) as created_at, 
    COALESCE(pv.updated_at, NOW()) as updated_at
FROM product_variants pv
INNER JOIN full_variant_products fvp ON pv.product_id = fvp.id
WHERE pv.color_name IS NOT NULL 
    AND pv.size IS NOT NULL
    AND pv.product_id IN (SELECT id FROM full_variant_products WHERE id NOT IN (SELECT product_id FROM full_variants))
ON CONFLICT DO NOTHING;

-- Step 6: Verification - Check migration results
SELECT 
    'Simple Products' as table_name,
    COUNT(*) as product_count
FROM simple_products
WHERE id IN (SELECT id FROM products)

UNION ALL

SELECT 
    'Color-Only Products' as table_name,
    COUNT(*) as product_count
FROM color_only_products
WHERE id IN (SELECT id FROM products)

UNION ALL

SELECT 
    'Size-Only Products' as table_name,
    COUNT(*) as product_count
FROM size_only_products
WHERE id IN (SELECT id FROM products)

UNION ALL

SELECT 
    'Full-Variant Products' as table_name,
    COUNT(*) as product_count
FROM full_variant_products
WHERE id IN (SELECT id FROM products)

UNION ALL

SELECT 
    'Total Migrated' as table_name,
    (
        (SELECT COUNT(*) FROM simple_products WHERE id IN (SELECT id FROM products)) +
        (SELECT COUNT(*) FROM color_only_products WHERE id IN (SELECT id FROM products)) +
        (SELECT COUNT(*) FROM size_only_products WHERE id IN (SELECT id FROM products)) +
        (SELECT COUNT(*) FROM full_variant_products WHERE id IN (SELECT id FROM products))
    ) as product_count

UNION ALL

SELECT 
    'Products Still in Old Table' as table_name,
    COUNT(*) as product_count
FROM products
WHERE id NOT IN (
    SELECT id FROM simple_products
    UNION
    SELECT id FROM color_only_products
    UNION
    SELECT id FROM size_only_products
    UNION
    SELECT id FROM full_variant_products
);

-- Step 7: Cleanup temp table
DROP TABLE IF EXISTS product_analysis;

