-- SIMPLIFIED PRODUCT SYSTEM
-- This replaces the complex multi-table system with a single unified table

-- Create new unified products table
CREATE TABLE products_unified_new (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  category TEXT NOT NULL,
  sku TEXT,
  
  -- Images
  image TEXT,
  images JSONB DEFAULT '[]',
  image_alt_texts JSONB DEFAULT '[]',
  
  -- Product type configuration
  has_colors BOOLEAN DEFAULT false,
  has_sizes BOOLEAN DEFAULT false,
  
  -- Variant data (stored as JSONB arrays)
  colors JSONB DEFAULT '[]',  -- Array of {name, value} objects
  sizes JSONB DEFAULT '[]',   -- Array of size strings
  
  -- All variants stored in one JSONB array
  -- Structure: [{"id": "uuid", "colorName": "White", "colorValue": "#ffffff", "size": "M", "stockAvailable": 47, ...}]
  variants JSONB DEFAULT '[]',
  
  -- Stock fields (calculated from variants)
  total_stock INTEGER DEFAULT 0,  -- Calculated from variants, used for display
  
  -- Options flags
  is_new BOOLEAN DEFAULT false,
  on_sale BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
  
  -- SEO fields
  seo_title TEXT,
  seo_description TEXT,
  seo_keywords TEXT,
  seo_slug TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_products_unified_category ON products_unified_new(category);
CREATE INDEX idx_products_unified_status ON products_unified_new(status);
CREATE INDEX idx_products_unified_sku ON products_unified_new(sku);

-- Function to calculate total stock from variants
CREATE OR REPLACE FUNCTION calculate_product_stock(product_id UUID)
RETURNS INTEGER AS $$
DECLARE
  total_stock INTEGER;
BEGIN
  SELECT COALESCE(
    SUM((variant->>'stockAvailable')::INTEGER),
    0
  ) INTO total_stock
  FROM products_unified_new,
  jsonb_array_elements(variants) AS variant
  WHERE id = product_id
    AND (variant->>'isActive')::BOOLEAN = true;
    
  RETURN total_stock;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-calculate stock on variant changes
CREATE OR REPLACE FUNCTION update_product_total_stock()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products_unified_new
  SET total_stock = COALESCE(
    (SELECT SUM((v->>'stockAvailable')::INTEGER)
     FROM jsonb_array_elements(NEW.variants) AS v
     WHERE (v->>'isActive')::BOOLEAN = true),
    0
  ),
  updated_at = NOW()
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_total_stock
AFTER UPDATE OF variants ON products_unified_new
FOR EACH ROW
EXECUTE FUNCTION update_product_total_stock();

-- Grant permissions
GRANT ALL ON products_unified_new TO anon, authenticated;

-- Note: This is a NEW table. Once you confirm it works, we'll:
-- 1. Migrate data from old tables to this one
-- 2. Update all API routes to use this table
-- 3. Drop old tables

