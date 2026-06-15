-- Optimized Product Database Structure
-- This structure separates products into different tables based on their variant configuration
-- to improve performance and save database space

-- 1. SIMPLE PRODUCTS TABLE (No variants - Color: NULL, Size: NULL)
-- This table stores products that don't have any variants
CREATE TABLE IF NOT EXISTS simple_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    category VARCHAR(50) NOT NULL CHECK (category IN ('men', 'women', 'accessories', 'custom printing')),
    stock INTEGER NOT NULL DEFAULT 0,
    is_new BOOLEAN DEFAULT false,
    on_sale BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft', 'disabled')),
    image VARCHAR(500),
    images JSONB DEFAULT '[]',
    image_alt_texts JSONB,
    seo_title VARCHAR(60),
    seo_description VARCHAR(160),
    seo_keywords TEXT,
    seo_slug VARCHAR(255) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. COLOR_ONLY_PRODUCTS TABLE (Color variants only - Size: NULL)
-- This table stores products that only have color variants
CREATE TABLE IF NOT EXISTS color_only_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    category VARCHAR(50) NOT NULL CHECK (category IN ('men', 'women', 'accessories', 'custom printing')),
    total_stock INTEGER NOT NULL DEFAULT 0, -- Sum of all color variants
    colors JSONB NOT NULL, -- Array of color objects
    is_new BOOLEAN DEFAULT false,
    on_sale BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft', 'disabled')),
    image VARCHAR(500),
    images JSONB DEFAULT '[]',
    image_alt_texts JSONB,
    seo_title VARCHAR(60),
    seo_description VARCHAR(160),
    seo_keywords TEXT,
    seo_slug VARCHAR(255) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. SIZE_ONLY_PRODUCTS TABLE (Size variants only - Color: NULL)
-- This table stores products that only have size variants
CREATE TABLE IF NOT EXISTS size_only_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    category VARCHAR(50) NOT NULL CHECK (category IN ('men', 'women', 'accessories', 'custom printing')),
    total_stock INTEGER NOT NULL DEFAULT 0, -- Sum of all size variants
    sizes JSONB NOT NULL, -- Array of size strings
    is_new BOOLEAN DEFAULT false,
    on_sale BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft', 'disabled')),
    image VARCHAR(500),
    images JSONB DEFAULT '[]',
    image_alt_texts JSONB,
    seo_title VARCHAR(60),
    seo_description VARCHAR(160),
    seo_keywords TEXT,
    seo_slug VARCHAR(255) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. FULL_VARIANT_PRODUCTS TABLE (Both color and size variants)
-- This table stores products that have both color and size variants
CREATE TABLE IF NOT EXISTS full_variant_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    category VARCHAR(50) NOT NULL CHECK (category IN ('men', 'women', 'accessories', 'custom printing')),
    total_stock INTEGER NOT NULL DEFAULT 0, -- Sum of all variants
    colors JSONB NOT NULL, -- Array of color objects
    sizes JSONB NOT NULL, -- Array of size strings
    is_new BOOLEAN DEFAULT false,
    on_sale BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft', 'disabled')),
    image VARCHAR(500),
    images JSONB DEFAULT '[]',
    image_alt_texts JSONB,
    seo_title VARCHAR(60),
    seo_description VARCHAR(160),
    seo_keywords TEXT,
    seo_slug VARCHAR(255) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. COLOR_VARIANTS TABLE (For color-only products)
CREATE TABLE IF NOT EXISTS color_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES color_only_products(id) ON DELETE CASCADE,
    color_name VARCHAR(100) NOT NULL,
    color_value VARCHAR(7) NOT NULL, -- Hex color code
    stock_available INTEGER NOT NULL DEFAULT 0,
    stock_incoming INTEGER DEFAULT 0,
    stock_reserved INTEGER DEFAULT 0,
    price_override DECIMAL(10,2),
    is_active BOOLEAN DEFAULT true,
    sort_index INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, color_name, color_value)
);

-- 6. SIZE_VARIANTS TABLE (For size-only products)
CREATE TABLE IF NOT EXISTS size_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES size_only_products(id) ON DELETE CASCADE,
    size VARCHAR(20) NOT NULL,
    stock_available INTEGER NOT NULL DEFAULT 0,
    stock_incoming INTEGER DEFAULT 0,
    stock_reserved INTEGER DEFAULT 0,
    price_override DECIMAL(10,2),
    is_active BOOLEAN DEFAULT true,
    sort_index INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, size)
);

-- 7. FULL_VARIANTS TABLE (For products with both color and size)
CREATE TABLE IF NOT EXISTS full_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES full_variant_products(id) ON DELETE CASCADE,
    color_name VARCHAR(100) NOT NULL,
    color_value VARCHAR(7) NOT NULL, -- Hex color code
    size VARCHAR(20) NOT NULL,
    stock_available INTEGER NOT NULL DEFAULT 0,
    stock_incoming INTEGER DEFAULT 0,
    stock_reserved INTEGER DEFAULT 0,
    price_override DECIMAL(10,2),
    is_active BOOLEAN DEFAULT true,
    sort_index INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, color_name, color_value, size)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_simple_products_category ON simple_products(category);
CREATE INDEX IF NOT EXISTS idx_simple_products_status ON simple_products(status);
CREATE INDEX IF NOT EXISTS idx_simple_products_on_sale ON simple_products(on_sale);
CREATE INDEX IF NOT EXISTS idx_simple_products_is_new ON simple_products(is_new);

CREATE INDEX IF NOT EXISTS idx_color_only_products_category ON color_only_products(category);
CREATE INDEX IF NOT EXISTS idx_color_only_products_status ON color_only_products(status);
CREATE INDEX IF NOT EXISTS idx_color_only_products_on_sale ON color_only_products(on_sale);
CREATE INDEX IF NOT EXISTS idx_color_only_products_is_new ON color_only_products(is_new);

CREATE INDEX IF NOT EXISTS idx_size_only_products_category ON size_only_products(category);
CREATE INDEX IF NOT EXISTS idx_size_only_products_status ON size_only_products(status);
CREATE INDEX IF NOT EXISTS idx_size_only_products_on_sale ON size_only_products(on_sale);
CREATE INDEX IF NOT EXISTS idx_size_only_products_is_new ON size_only_products(is_new);

CREATE INDEX IF NOT EXISTS idx_full_variant_products_category ON full_variant_products(category);
CREATE INDEX IF NOT EXISTS idx_full_variant_products_status ON full_variant_products(status);
CREATE INDEX IF NOT EXISTS idx_full_variant_products_on_sale ON full_variant_products(on_sale);
CREATE INDEX IF NOT EXISTS idx_full_variant_products_is_new ON full_variant_products(is_new);

-- Create indexes for variant tables
CREATE INDEX IF NOT EXISTS idx_color_variants_product_id ON color_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_color_variants_active ON color_variants(is_active);

CREATE INDEX IF NOT EXISTS idx_size_variants_product_id ON size_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_size_variants_active ON size_variants(is_active);

CREATE INDEX IF NOT EXISTS idx_full_variants_product_id ON full_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_full_variants_active ON full_variants(is_active);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables (drop first if they exist)
DROP TRIGGER IF EXISTS update_simple_products_updated_at ON simple_products;
DROP TRIGGER IF EXISTS update_color_only_products_updated_at ON color_only_products;
DROP TRIGGER IF EXISTS update_size_only_products_updated_at ON size_only_products;
DROP TRIGGER IF EXISTS update_full_variant_products_updated_at ON full_variant_products;
DROP TRIGGER IF EXISTS update_color_variants_updated_at ON color_variants;
DROP TRIGGER IF EXISTS update_size_variants_updated_at ON size_variants;
DROP TRIGGER IF EXISTS update_full_variants_updated_at ON full_variants;

CREATE TRIGGER update_simple_products_updated_at BEFORE UPDATE ON simple_products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_color_only_products_updated_at BEFORE UPDATE ON color_only_products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_size_only_products_updated_at BEFORE UPDATE ON size_only_products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_full_variant_products_updated_at BEFORE UPDATE ON full_variant_products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_color_variants_updated_at BEFORE UPDATE ON color_variants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_size_variants_updated_at BEFORE UPDATE ON size_variants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_full_variants_updated_at BEFORE UPDATE ON full_variants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create a unified view for easy querying across all product types
CREATE OR REPLACE VIEW all_products_unified AS
SELECT 
    'simple' as product_type,
    id,
    name,
    description,
    price,
    original_price,
    category,
    stock as total_stock,
    is_new,
    on_sale,
    status,
    image,
    images,
    image_alt_texts,
    seo_title,
    seo_description,
    seo_keywords,
    seo_slug,
    created_at,
    updated_at,
    NULL::JSONB as colors,
    NULL::JSONB as sizes
FROM simple_products
WHERE status = 'active'

UNION ALL

SELECT 
    'color_only' as product_type,
    id,
    name,
    description,
    price,
    original_price,
    category,
    total_stock,
    is_new,
    on_sale,
    status,
    image,
    images,
    image_alt_texts,
    seo_title,
    seo_description,
    seo_keywords,
    seo_slug,
    created_at,
    updated_at,
    colors,
    NULL::JSONB as sizes
FROM color_only_products
WHERE status = 'active'

UNION ALL

SELECT 
    'size_only' as product_type,
    id,
    name,
    description,
    price,
    original_price,
    category,
    total_stock,
    is_new,
    on_sale,
    status,
    image,
    images,
    image_alt_texts,
    seo_title,
    seo_description,
    seo_keywords,
    seo_slug,
    created_at,
    updated_at,
    NULL::JSONB as colors,
    sizes
FROM size_only_products
WHERE status = 'active'

UNION ALL

SELECT 
    'full_variant' as product_type,
    id,
    name,
    description,
    price,
    original_price,
    category,
    total_stock,
    is_new,
    on_sale,
    status,
    image,
    images,
    image_alt_texts,
    seo_title,
    seo_description,
    seo_keywords,
    seo_slug,
    created_at,
    updated_at,
    colors,
    sizes
FROM full_variant_products
WHERE status = 'active';

-- Grant permissions
GRANT ALL ON simple_products TO anon, authenticated;
GRANT ALL ON color_only_products TO anon, authenticated;
GRANT ALL ON size_only_products TO anon, authenticated;
GRANT ALL ON full_variant_products TO anon, authenticated;
GRANT ALL ON color_variants TO anon, authenticated;
GRANT ALL ON size_variants TO anon, authenticated;
GRANT ALL ON full_variants TO anon, authenticated;
GRANT SELECT ON all_products_unified TO anon, authenticated;
