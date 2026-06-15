-- Migrate single product from old products table to optimized structure
-- Product ID: b2a91109-c4bf-4223-b059-dd35a7158bce
-- Product: Naruto X Apparely - Sasuke STRTWR

-- Step 1: Check current product type
DO $$
DECLARE
    product_record RECORD;
    product_type TEXT;
    variant_count INTEGER;
    has_colors BOOLEAN;
    has_sizes BOOLEAN;
BEGIN
    -- Get product data
    SELECT 
        p.*,
        COUNT(DISTINCT pv.id) as variant_count,
        COUNT(DISTINCT CASE WHEN pv.color_name IS NOT NULL THEN pv.id END) as color_variant_count,
        COUNT(DISTINCT CASE WHEN pv.size IS NOT NULL THEN pv.id END) as size_variant_count,
        COUNT(DISTINCT CASE WHEN pv.color_name IS NOT NULL AND pv.size IS NOT NULL THEN pv.id END) as full_variant_count
    INTO product_record
    FROM products p
    LEFT JOIN product_variants pv ON p.id = pv.product_id AND (pv.is_active = true OR pv.is_active IS NULL)
    WHERE p.id = 'b2a91109-c4bf-4223-b059-dd35a7158bce'
    GROUP BY p.id;
    
    -- Determine product type
    has_colors := COALESCE(product_record.has_color_options, false) OR COALESCE(product_record.color_variant_count, 0) > 0;
    has_sizes := COALESCE(product_record.has_size_options, false) OR COALESCE(product_record.size_variant_count, 0) > 0;
    
    IF has_colors AND has_sizes THEN
        product_type := 'full_variant';
    ELSIF has_colors THEN
        product_type := 'color_only';
    ELSIF has_sizes THEN
        product_type := 'size_only';
    ELSE
        product_type := 'simple';
    END IF;
    
    RAISE NOTICE 'Product type determined: %, has_colors: %, has_sizes: %', product_type, has_colors, has_sizes;
    
    -- Insert into appropriate table based on type
    IF product_type = 'simple' THEN
        INSERT INTO simple_products (
            id, name, description, price, original_price, category, stock,
            is_new, on_sale, status, image, images, image_alt_texts,
            seo_title, seo_description, seo_keywords, seo_slug,
            created_at, updated_at
        )
        SELECT 
            id, name, description, price, original_price, category,
            COALESCE(stock, stock_quantity, 0) as stock,
            is_new, on_sale, status, image, images,
            CASE 
                WHEN image_alt_texts IS NULL THEN NULL
                WHEN image_alt_texts = '' THEN NULL
                WHEN image_alt_texts::text LIKE '[%' THEN image_alt_texts::jsonb
                ELSE image_alt_texts::jsonb
            END as image_alt_texts,
            seo_title, seo_description, seo_keywords, seo_slug,
            created_at, updated_at
        FROM products
        WHERE id = 'b2a91109-c4bf-4223-b059-dd35a7158bce'
        ON CONFLICT (id) DO NOTHING;
        
    ELSIF product_type = 'color_only' THEN
        INSERT INTO color_only_products (
            id, name, description, price, original_price, category, total_stock, colors,
            is_new, on_sale, status, image, images, image_alt_texts,
            seo_title, seo_description, seo_keywords, seo_slug,
            created_at, updated_at
        )
        SELECT 
            p.id, p.name, p.description, p.price, p.original_price, p.category,
            COALESCE(
                (SELECT SUM(stock_available) FROM product_variants WHERE product_id = p.id AND is_active = true),
                p.stock, p.stock_quantity, 0
            ) as total_stock,
            COALESCE(
                CASE 
                    WHEN p.colors IS NULL THEN NULL
                    WHEN p.colors::text LIKE '[%' THEN p.colors::jsonb
                    ELSE p.colors::jsonb
                END,
                '[]'::jsonb
            ) as colors,
            p.is_new, p.on_sale, p.status, p.image, p.images,
            CASE 
                WHEN p.image_alt_texts IS NULL THEN NULL
                WHEN p.image_alt_texts = '' THEN NULL
                WHEN p.image_alt_texts::text LIKE '[%' THEN p.image_alt_texts::jsonb
                ELSE p.image_alt_texts::jsonb
            END as image_alt_texts,
            p.seo_title, p.seo_description, p.seo_keywords, p.seo_slug,
            p.created_at, p.updated_at
        FROM products p
        WHERE p.id = 'b2a91109-c4bf-4223-b059-dd35a7158bce'
        ON CONFLICT (id) DO NOTHING;
        
        -- Migrate color variants
        INSERT INTO color_variants (
            product_id, color_name, color_value, stock_available, stock_incoming, stock_reserved,
            price_override, is_active, sort_index, created_at, updated_at
        )
        SELECT 
            product_id, color_name, color_value, 
            COALESCE(stock_available, 0), 
            COALESCE(stock_incoming, 0), 
            COALESCE(stock_reserved, 0),
            price_override, 
            COALESCE(is_active, true),
            COALESCE(sort_index, ROW_NUMBER() OVER (ORDER BY created_at)),
            created_at, updated_at
        FROM product_variants
        WHERE product_id = 'b2a91109-c4bf-4223-b059-dd35a7158bce'
        AND color_name IS NOT NULL
        AND size IS NULL
        ON CONFLICT DO NOTHING;
        
    ELSIF product_type = 'size_only' THEN
        INSERT INTO size_only_products (
            id, name, description, price, original_price, category, total_stock, sizes,
            is_new, on_sale, status, image, images, image_alt_texts,
            seo_title, seo_description, seo_keywords, seo_slug,
            created_at, updated_at
        )
        SELECT 
            p.id, p.name, p.description, p.price, p.original_price, p.category,
            COALESCE(
                (SELECT SUM(stock_available) FROM product_variants WHERE product_id = p.id AND is_active = true),
                p.stock, p.stock_quantity, 0
            ) as total_stock,
            COALESCE(
                CASE 
                    WHEN p.sizes IS NULL THEN NULL
                    WHEN p.sizes::text LIKE '[%' THEN p.sizes::jsonb
                    ELSE p.sizes::jsonb
                END,
                '[]'::jsonb
            ) as sizes,
            p.is_new, p.on_sale, p.status, p.image, p.images,
            CASE 
                WHEN p.image_alt_texts IS NULL THEN NULL
                WHEN p.image_alt_texts = '' THEN NULL
                WHEN p.image_alt_texts::text LIKE '[%' THEN p.image_alt_texts::jsonb
                ELSE p.image_alt_texts::jsonb
            END as image_alt_texts,
            p.seo_title, p.seo_description, p.seo_keywords, p.seo_slug,
            p.created_at, p.updated_at
        FROM products p
        WHERE p.id = 'b2a91109-c4bf-4223-b059-dd35a7158bce'
        ON CONFLICT (id) DO NOTHING;
        
        -- Migrate size variants
        INSERT INTO size_variants (
            product_id, size, stock_available, stock_incoming, stock_reserved,
            price_override, is_active, sort_index, created_at, updated_at
        )
        SELECT 
            product_id, size,
            COALESCE(stock_available, 0), 
            COALESCE(stock_incoming, 0), 
            COALESCE(stock_reserved, 0),
            price_override, 
            COALESCE(is_active, true),
            COALESCE(sort_index, ROW_NUMBER() OVER (ORDER BY created_at)),
            created_at, updated_at
        FROM product_variants
        WHERE product_id = 'b2a91109-c4bf-4223-b059-dd35a7158bce'
        AND size IS NOT NULL
        AND color_name IS NULL
        ON CONFLICT DO NOTHING;
        
    ELSIF product_type = 'full_variant' THEN
        INSERT INTO full_variant_products (
            id, name, description, price, original_price, category, total_stock, colors, sizes,
            is_new, on_sale, status, image, images, image_alt_texts,
            seo_title, seo_description, seo_keywords, seo_slug,
            created_at, updated_at
        )
        SELECT 
            p.id, p.name, p.description, p.price, p.original_price, p.category,
            COALESCE(
                (SELECT SUM(stock_available) FROM product_variants WHERE product_id = p.id AND is_active = true),
                p.stock, p.stock_quantity, 0
            ) as total_stock,
            COALESCE(
                CASE 
                    WHEN p.colors IS NULL THEN NULL
                    WHEN p.colors::text LIKE '[%' THEN p.colors::jsonb
                    ELSE p.colors::jsonb
                END,
                '[]'::jsonb
            ) as colors,
            COALESCE(
                CASE 
                    WHEN p.sizes IS NULL THEN NULL
                    WHEN p.sizes::text LIKE '[%' THEN p.sizes::jsonb
                    ELSE p.sizes::jsonb
                END,
                '[]'::jsonb
            ) as sizes,
            p.is_new, p.on_sale, p.status, p.image, p.images,
            CASE 
                WHEN p.image_alt_texts IS NULL THEN NULL
                WHEN p.image_alt_texts = '' THEN NULL
                WHEN p.image_alt_texts::text LIKE '[%' THEN p.image_alt_texts::jsonb
                ELSE p.image_alt_texts::jsonb
            END as image_alt_texts,
            p.seo_title, p.seo_description, p.seo_keywords, p.seo_slug,
            p.created_at, p.updated_at
        FROM products p
        WHERE p.id = 'b2a91109-c4bf-4223-b059-dd35a7158bce'
        ON CONFLICT (id) DO NOTHING;
        
        -- Migrate full variants
        INSERT INTO full_variants (
            product_id, color_name, color_value, size, stock_available, stock_incoming, stock_reserved,
            price_override, is_active, sort_index, created_at, updated_at
        )
        SELECT 
            product_id, color_name, color_value, size,
            COALESCE(stock_available, 0), 
            COALESCE(stock_incoming, 0), 
            COALESCE(stock_reserved, 0),
            price_override, 
            COALESCE(is_active, true),
            COALESCE(sort_index, ROW_NUMBER() OVER (ORDER BY created_at)),
            created_at, updated_at
        FROM product_variants
        WHERE product_id = 'b2a91109-c4bf-4223-b059-dd35a7158bce'
        AND color_name IS NOT NULL
        AND size IS NOT NULL
        ON CONFLICT DO NOTHING;
    END IF;
    
    RAISE NOTICE 'Migration completed successfully for product type: %', product_type;
END $$;

-- Verify migration
SELECT 
    'simple_products' as table_name, id, name, status
FROM simple_products
WHERE id = 'b2a91109-c4bf-4223-b059-dd35a7158bce'

UNION ALL

SELECT 
    'color_only_products' as table_name, id, name, status
FROM color_only_products
WHERE id = 'b2a91109-c4bf-4223-b059-dd35a7158bce'

UNION ALL

SELECT 
    'size_only_products' as table_name, id, name, status
FROM size_only_products
WHERE id = 'b2a91109-c4bf-4223-b059-dd35a7158bce'

UNION ALL

SELECT 
    'full_variant_products' as table_name, id, name, status
FROM full_variant_products
WHERE id = 'b2a91109-c4bf-4223-b059-dd35a7158bce';

