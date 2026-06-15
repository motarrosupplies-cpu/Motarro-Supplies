-- Add SKU field to products table for SEO and product identification
-- This will allow products to be searchable by SKU on Google

-- Add SKU column to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS sku VARCHAR(100);

-- Create unique index for SKU for fast lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_sku ON products(sku);

-- Create index for slug (if not exists) for SEO-friendly URLs
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);

-- For products table with variants
ALTER TABLE color_variants
ADD COLUMN IF NOT EXISTS sku VARCHAR(100);

ALTER TABLE size_variants
ADD COLUMN IF NOT EXISTS sku VARCHAR(100);

ALTER TABLE full_variants
ADD COLUMN IF NOT EXISTS sku VARCHAR(100);

-- Create indexes for variant SKUs
CREATE INDEX IF NOT EXISTS idx_color_variants_sku ON color_variants(sku);
CREATE INDEX IF NOT EXISTS idx_size_variants_sku ON size_variants(sku);
CREATE INDEX IF NOT EXISTS idx_full_variants_sku ON full_variants(sku);

-- Function to auto-generate SKU from product name
CREATE OR REPLACE FUNCTION generate_sku(product_name VARCHAR(255))
RETURNS VARCHAR(100) AS $$
BEGIN
  RETURN UPPER(
    SUBSTRING(
      REGEXP_REPLACE(product_name, '[^A-Z0-9]+', '', 'g'),
      1,
      20
    )
  );
END;
$$ LANGUAGE plpgsql;

-- Optional: Auto-generate SKUs for existing products that don't have one
UPDATE products 
SET sku = generate_sku(name) 
WHERE sku IS NULL OR sku = '';

-- Display current products with SKUs
SELECT id, name, slug, sku, category, price, created_at
FROM products
ORDER BY created_at DESC
LIMIT 10;
