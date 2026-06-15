-- Ready-to-Ship Products Schema for Apparely.co.za (V2 - Fixed)
-- This schema supports pre-made items: tumblers, totes, coasters, keychains, gift sets
-- Run this if the original schema failed

-- Drop existing objects if they exist (be careful - this will delete data!)
-- DROP VIEW IF EXISTS ready_to_ship_products_view CASCADE;
-- DROP TABLE IF EXISTS stock_updates CASCADE;
-- DROP TABLE IF EXISTS flash_sales CASCADE;
-- DROP TABLE IF EXISTS ready_to_ship_bundles CASCADE;
-- DROP TABLE IF EXISTS ready_to_ship_products CASCADE;

-- Main ready-to-ship products table
CREATE TABLE IF NOT EXISTS ready_to_ship_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  short_description TEXT,
  
  -- Pricing
  base_price DECIMAL(10, 2) NOT NULL,
  sale_price DECIMAL(10, 2),
  is_on_sale BOOLEAN DEFAULT false,
  flash_sale_price DECIMAL(10, 2),
  flash_sale_ends_at TIMESTAMPTZ,
  
  -- Stock management
  stock_quantity INTEGER DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 10,
  track_stock BOOLEAN DEFAULT true,
  allow_backorder BOOLEAN DEFAULT false,
  
  -- Product details
  category TEXT NOT NULL, -- 'tumbler', 'tote', 'coaster', 'keychain', 'gift-set'
  tags TEXT[], -- Array of tags for filtering
  sku TEXT UNIQUE,
  barcode TEXT,
  
  -- Images
  primary_image TEXT,
  images TEXT[], -- Array of image URLs
  
  -- Bundle & quantity pricing
  is_bundle_eligible BOOLEAN DEFAULT true,
  bundle_discount_percent DECIMAL(5, 2) DEFAULT 0, -- Discount when in bundle
  quantity_pricing JSONB, -- { "10": 95.00, "25": 85.00, "50": 75.00 }
  
  -- Gift & event specific
  is_gift_item BOOLEAN DEFAULT false,
  is_event_favour BOOLEAN DEFAULT false,
  max_price_for_filter DECIMAL(10, 2), -- For "gifts under R200" filter
  
  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT[],
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'out_of_stock', 'coming_soon')),
  featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  
  -- Timestamps (CRITICAL - must be included)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ready_to_ship_status ON ready_to_ship_products(status);
CREATE INDEX IF NOT EXISTS idx_ready_to_ship_category ON ready_to_ship_products(category);
CREATE INDEX IF NOT EXISTS idx_ready_to_ship_slug ON ready_to_ship_products(slug);
CREATE INDEX IF NOT EXISTS idx_ready_to_ship_featured ON ready_to_ship_products(featured);
CREATE INDEX IF NOT EXISTS idx_ready_to_ship_gift ON ready_to_ship_products(is_gift_item);
CREATE INDEX IF NOT EXISTS idx_ready_to_ship_event ON ready_to_ship_products(is_event_favour);
CREATE INDEX IF NOT EXISTS idx_ready_to_ship_price ON ready_to_ship_products(max_price_for_filter);

-- Bundle products table (for gift sets)
CREATE TABLE IF NOT EXISTS ready_to_ship_bundles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  
  -- Bundle pricing
  base_price DECIMAL(10, 2) NOT NULL,
  sale_price DECIMAL(10, 2),
  bundle_discount_percent DECIMAL(5, 2) DEFAULT 0,
  
  -- Bundle items (JSON array of product IDs and quantities)
  items JSONB NOT NULL, -- [{"product_id": "uuid", "quantity": 1, "name": "Tumbler"}]
  
  -- Images
  primary_image TEXT,
  images TEXT[],
  
  -- Stock (calculated from items)
  stock_quantity INTEGER DEFAULT 0,
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'out_of_stock')),
  featured BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Flash sale campaigns
CREATE TABLE IF NOT EXISTS flash_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  banner_text TEXT, -- Text for flash sale banner
  banner_color TEXT DEFAULT '#8B5CF6', -- Purple theme
  
  -- Sale timing
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  
  -- Discount settings
  discount_percent DECIMAL(5, 2),
  discount_amount DECIMAL(10, 2),
  
  -- Product targeting
  product_ids UUID[], -- Specific products
  category_filter TEXT[], -- Categories to include
  apply_to_all BOOLEAN DEFAULT false,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Real-time stock updates (for live stock counter)
CREATE TABLE IF NOT EXISTS stock_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES ready_to_ship_products(id) ON DELETE CASCADE,
  quantity_change INTEGER NOT NULL, -- Positive for additions, negative for sales
  reason TEXT, -- 'sale', 'restock', 'adjustment', 'return'
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for stock updates
CREATE INDEX IF NOT EXISTS idx_stock_updates_product ON stock_updates(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_updates_created ON stock_updates(created_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_ready_to_ship_products_updated_at ON ready_to_ship_products;
CREATE TRIGGER update_ready_to_ship_products_updated_at
  BEFORE UPDATE ON ready_to_ship_products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ready_to_ship_bundles_updated_at ON ready_to_ship_bundles;
CREATE TRIGGER update_ready_to_ship_bundles_updated_at
  BEFORE UPDATE ON ready_to_ship_bundles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_flash_sales_updated_at ON flash_sales;
CREATE TRIGGER update_flash_sales_updated_at
  BEFORE UPDATE ON flash_sales
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate bundle stock from items
CREATE OR REPLACE FUNCTION calculate_bundle_stock(bundle_id UUID)
RETURNS INTEGER AS $$
DECLARE
  min_stock INTEGER := 999999;
  item JSONB;
  product_stock INTEGER;
BEGIN
  FOR item IN SELECT jsonb_array_elements(items) FROM ready_to_ship_bundles WHERE id = bundle_id
  LOOP
    SELECT stock_quantity INTO product_stock
    FROM ready_to_ship_products
    WHERE id = (item->>'product_id')::UUID;
    
    IF product_stock IS NULL THEN
      RETURN 0;
    END IF;
    
    -- Calculate how many bundles can be made from this product
    product_stock := product_stock / GREATEST((item->>'quantity')::INTEGER, 1);
    
    IF product_stock < min_stock THEN
      min_stock := product_stock;
    END IF;
  END LOOP;
  
  RETURN COALESCE(min_stock, 0);
END;
$$ LANGUAGE plpgsql;

-- View for active ready-to-ship products with calculated fields
-- DROP the view first to avoid conflicts
DROP VIEW IF EXISTS ready_to_ship_products_view;

CREATE VIEW ready_to_ship_products_view AS
SELECT 
  p.*,
  CASE 
    WHEN p.flash_sale_price IS NOT NULL AND p.flash_sale_ends_at > NOW() THEN p.flash_sale_price
    WHEN p.sale_price IS NOT NULL AND p.is_on_sale THEN p.sale_price
    ELSE p.base_price
  END AS current_price,
  CASE 
    WHEN p.flash_sale_price IS NOT NULL AND p.flash_sale_ends_at > NOW() THEN true
    ELSE false
  END AS is_flash_sale,
  CASE
    WHEN p.stock_quantity <= 0 AND NOT p.allow_backorder THEN 'out_of_stock'
    WHEN p.stock_quantity <= p.low_stock_threshold THEN 'low_stock'
    ELSE 'in_stock'
  END AS stock_status
FROM ready_to_ship_products p
WHERE p.status = 'active';

-- Comments
COMMENT ON TABLE ready_to_ship_products IS 'Pre-made ready-to-ship products (tumblers, totes, coasters, keychains, gift sets)';
COMMENT ON TABLE ready_to_ship_bundles IS 'Gift sets and bundles of ready-to-ship products';
COMMENT ON TABLE flash_sales IS 'Flash sale campaigns for ready-to-ship products';
COMMENT ON TABLE stock_updates IS 'Audit log for stock changes';

