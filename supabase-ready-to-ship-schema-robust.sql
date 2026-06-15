-- ============================================================================
-- Ready-to-Ship Products Schema - ROBUST VERSION
-- Apparely.co.za - Ready-to-Ship Section
-- ============================================================================
-- This script can be run in sections if needed
-- Each section is independent and handles errors gracefully
-- ============================================================================

-- ============================================================================
-- SECTION 1: Clean Up (Run this first)
-- ============================================================================

-- Drop in correct order to avoid dependency issues
DO $$ 
BEGIN
  -- Drop views
  DROP VIEW IF EXISTS ready_to_ship_products_view CASCADE;
  
  -- Drop triggers
  DROP TRIGGER IF EXISTS update_ready_to_ship_products_updated_at ON ready_to_ship_products;
  DROP TRIGGER IF EXISTS update_ready_to_ship_bundles_updated_at ON ready_to_ship_bundles;
  DROP TRIGGER IF EXISTS update_flash_sales_updated_at ON flash_sales;
  
  -- Drop policies
  DROP POLICY IF EXISTS "Public can view active ready-to-ship products" ON ready_to_ship_products;
  DROP POLICY IF EXISTS "Public can view active bundles" ON ready_to_ship_bundles;
  DROP POLICY IF EXISTS "Public can view active flash sales" ON flash_sales;
  DROP POLICY IF EXISTS "Public can view stock updates" ON stock_updates;
  
  -- Drop tables (CASCADE handles dependencies)
  DROP TABLE IF EXISTS stock_updates CASCADE;
  DROP TABLE IF EXISTS ready_to_ship_bundles CASCADE;
  DROP TABLE IF EXISTS flash_sales CASCADE;
  DROP TABLE IF EXISTS ready_to_ship_products CASCADE;
  
  RAISE NOTICE 'Cleanup completed successfully';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Cleanup completed with warnings (this is OK if tables did not exist)';
END $$;

-- ============================================================================
-- SECTION 2: Create Functions (Before tables that use them)
-- ============================================================================

-- Function to update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Function to calculate bundle stock from items
CREATE OR REPLACE FUNCTION calculate_bundle_stock(bundle_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  min_stock INTEGER := 999999;
  item JSONB;
  product_stock INTEGER;
  item_quantity INTEGER;
BEGIN
  FOR item IN 
    SELECT jsonb_array_elements(items) 
    FROM ready_to_ship_bundles 
    WHERE id = bundle_id
  LOOP
    SELECT stock_quantity INTO product_stock
    FROM ready_to_ship_products
    WHERE id = (item->>'product_id')::UUID;
    
    IF product_stock IS NULL THEN
      RETURN 0;
    END IF;
    
    item_quantity := GREATEST((item->>'quantity')::INTEGER, 1);
    product_stock := product_stock / item_quantity;
    
    IF product_stock < min_stock THEN
      min_stock := product_stock;
    END IF;
  END LOOP;
  
  RETURN COALESCE(min_stock, 0);
END;
$$;

-- ============================================================================
-- SECTION 3: Create Tables (In dependency order)
-- ============================================================================

-- Main ready-to-ship products table
CREATE TABLE ready_to_ship_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  short_description TEXT,
  base_price DECIMAL(10, 2) NOT NULL,
  sale_price DECIMAL(10, 2),
  is_on_sale BOOLEAN DEFAULT false,
  flash_sale_price DECIMAL(10, 2),
  flash_sale_ends_at TIMESTAMPTZ,
  stock_quantity INTEGER DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 10,
  track_stock BOOLEAN DEFAULT true,
  allow_backorder BOOLEAN DEFAULT false,
  category TEXT NOT NULL,
  tags TEXT[],
  sku TEXT UNIQUE,
  barcode TEXT,
  primary_image TEXT,
  images TEXT[],
  is_bundle_eligible BOOLEAN DEFAULT true,
  bundle_discount_percent DECIMAL(5, 2) DEFAULT 0,
  quantity_pricing JSONB,
  is_gift_item BOOLEAN DEFAULT false,
  is_event_favour BOOLEAN DEFAULT false,
  max_price_for_filter DECIMAL(10, 2),
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT[],
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'out_of_stock', 'coming_soon')),
  featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Bundle products table
CREATE TABLE ready_to_ship_bundles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  base_price DECIMAL(10, 2) NOT NULL,
  sale_price DECIMAL(10, 2),
  bundle_discount_percent DECIMAL(5, 2) DEFAULT 0,
  items JSONB NOT NULL,
  primary_image TEXT,
  images TEXT[],
  stock_quantity INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'out_of_stock')),
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Flash sale campaigns
CREATE TABLE flash_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  banner_text TEXT,
  banner_color TEXT DEFAULT '#8B5CF6',
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  discount_percent DECIMAL(5, 2),
  discount_amount DECIMAL(10, 2),
  product_ids UUID[],
  category_filter TEXT[],
  apply_to_all BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Stock updates table (depends on ready_to_ship_products)
CREATE TABLE stock_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES ready_to_ship_products(id) ON DELETE CASCADE,
  quantity_change INTEGER NOT NULL,
  reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- SECTION 4: Create Indexes
-- ============================================================================

CREATE INDEX idx_ready_to_ship_status ON ready_to_ship_products(status);
CREATE INDEX idx_ready_to_ship_category ON ready_to_ship_products(category);
CREATE INDEX idx_ready_to_ship_slug ON ready_to_ship_products(slug);
CREATE INDEX idx_ready_to_ship_featured ON ready_to_ship_products(featured);
CREATE INDEX idx_ready_to_ship_gift ON ready_to_ship_products(is_gift_item);
CREATE INDEX idx_ready_to_ship_event ON ready_to_ship_products(is_event_favour);
CREATE INDEX idx_ready_to_ship_price ON ready_to_ship_products(max_price_for_filter);
CREATE INDEX idx_ready_to_ship_created ON ready_to_ship_products(created_at DESC);
CREATE INDEX idx_ready_to_ship_updated ON ready_to_ship_products(updated_at DESC);
CREATE INDEX idx_stock_updates_product ON stock_updates(product_id);
CREATE INDEX idx_stock_updates_created ON stock_updates(created_at DESC);
CREATE INDEX idx_flash_sales_active ON flash_sales(is_active) WHERE is_active = true;
CREATE INDEX idx_flash_sales_dates ON flash_sales(starts_at, ends_at);

-- ============================================================================
-- SECTION 5: Create Triggers
-- ============================================================================

CREATE TRIGGER update_ready_to_ship_products_updated_at
  BEFORE UPDATE ON ready_to_ship_products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ready_to_ship_bundles_updated_at
  BEFORE UPDATE ON ready_to_ship_bundles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_flash_sales_updated_at
  BEFORE UPDATE ON flash_sales
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SECTION 6: Create View
-- ============================================================================

CREATE VIEW ready_to_ship_products_view AS
SELECT 
  p.*,
  CASE 
    WHEN p.flash_sale_price IS NOT NULL 
         AND p.flash_sale_ends_at IS NOT NULL 
         AND p.flash_sale_ends_at > NOW() 
    THEN p.flash_sale_price
    WHEN p.sale_price IS NOT NULL AND p.is_on_sale = true 
    THEN p.sale_price
    ELSE p.base_price
  END AS current_price,
  CASE 
    WHEN p.flash_sale_price IS NOT NULL 
         AND p.flash_sale_ends_at IS NOT NULL 
         AND p.flash_sale_ends_at > NOW() 
    THEN true
    ELSE false
  END AS is_flash_sale,
  CASE
    WHEN p.stock_quantity <= 0 AND p.allow_backorder = false 
    THEN 'out_of_stock'
    WHEN p.stock_quantity <= p.low_stock_threshold 
    THEN 'low_stock'
    ELSE 'in_stock'
  END AS stock_status
FROM ready_to_ship_products p
WHERE p.status = 'active';

-- ============================================================================
-- SECTION 7: Enable RLS and Create Policies
-- ============================================================================

ALTER TABLE ready_to_ship_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE ready_to_ship_bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE flash_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active ready-to-ship products"
  ON ready_to_ship_products FOR SELECT
  USING (status = 'active');

CREATE POLICY "Public can view active bundles"
  ON ready_to_ship_bundles FOR SELECT
  USING (status = 'active');

CREATE POLICY "Public can view active flash sales"
  ON flash_sales FOR SELECT
  USING (is_active = true AND starts_at <= NOW() AND ends_at >= NOW());

CREATE POLICY "Public can view stock updates"
  ON stock_updates FOR SELECT
  USING (true);

-- ============================================================================
-- VERIFICATION (Run this separately if needed)
-- ============================================================================

-- Uncomment and run separately to verify:
/*
SELECT 'Tables' AS type, COUNT(*) AS count
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND (table_name LIKE 'ready_to_ship%' OR table_name IN ('flash_sales', 'stock_updates'));

SELECT 'View' AS type, COUNT(*) AS count
FROM information_schema.views 
WHERE table_schema = 'public' 
AND table_name = 'ready_to_ship_products_view';

SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_name = 'ready_to_ship_products'
AND column_name IN ('created_at', 'updated_at', 'id', 'name', 'slug')
ORDER BY column_name;
*/

