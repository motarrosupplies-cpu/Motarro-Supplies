-- ============================================================================
-- Ready-to-Ship Products Schema - Complete Production Setup
-- Apparely.co.za - Ready-to-Ship Section
-- ============================================================================
-- This script creates all tables, functions, triggers, views, and indexes
-- Run this ONCE to set up the complete schema
-- Safe to re-run (uses IF NOT EXISTS and DROP IF EXISTS where appropriate)
-- ============================================================================

-- ============================================================================
-- STEP 1: Create Core Tables
-- ============================================================================

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
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

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
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
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
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Real-time stock updates (for live stock counter)
CREATE TABLE IF NOT EXISTS stock_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL,
  quantity_change INTEGER NOT NULL, -- Positive for additions, negative for sales
  reason TEXT, -- 'sale', 'restock', 'adjustment', 'return'
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Foreign key constraint (added after table creation to avoid dependency issues)
  CONSTRAINT fk_stock_updates_product 
    FOREIGN KEY (product_id) 
    REFERENCES ready_to_ship_products(id) 
    ON DELETE CASCADE
);

-- ============================================================================
-- STEP 2: Create Indexes for Performance
-- ============================================================================

-- Indexes for ready_to_ship_products
CREATE INDEX IF NOT EXISTS idx_ready_to_ship_status 
  ON ready_to_ship_products(status);
CREATE INDEX IF NOT EXISTS idx_ready_to_ship_category 
  ON ready_to_ship_products(category);
CREATE INDEX IF NOT EXISTS idx_ready_to_ship_slug 
  ON ready_to_ship_products(slug);
CREATE INDEX IF NOT EXISTS idx_ready_to_ship_featured 
  ON ready_to_ship_products(featured);
CREATE INDEX IF NOT EXISTS idx_ready_to_ship_gift 
  ON ready_to_ship_products(is_gift_item);
CREATE INDEX IF NOT EXISTS idx_ready_to_ship_event 
  ON ready_to_ship_products(is_event_favour);
CREATE INDEX IF NOT EXISTS idx_ready_to_ship_price 
  ON ready_to_ship_products(max_price_for_filter);
CREATE INDEX IF NOT EXISTS idx_ready_to_ship_created 
  ON ready_to_ship_products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ready_to_ship_updated 
  ON ready_to_ship_products(updated_at DESC);

-- Indexes for stock_updates
CREATE INDEX IF NOT EXISTS idx_stock_updates_product 
  ON stock_updates(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_updates_created 
  ON stock_updates(created_at DESC);

-- Indexes for flash_sales
CREATE INDEX IF NOT EXISTS idx_flash_sales_active 
  ON flash_sales(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_flash_sales_dates 
  ON flash_sales(starts_at, ends_at);

-- ============================================================================
-- STEP 3: Create Functions
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
  -- Loop through each item in the bundle
  FOR item IN 
    SELECT jsonb_array_elements(items) 
    FROM ready_to_ship_bundles 
    WHERE id = bundle_id
  LOOP
    -- Get the product stock
    SELECT stock_quantity INTO product_stock
    FROM ready_to_ship_products
    WHERE id = (item->>'product_id')::UUID;
    
    -- If product doesn't exist, return 0
    IF product_stock IS NULL THEN
      RETURN 0;
    END IF;
    
    -- Get the quantity needed per bundle
    item_quantity := GREATEST((item->>'quantity')::INTEGER, 1);
    
    -- Calculate how many bundles can be made from this product
    product_stock := product_stock / item_quantity;
    
    -- Track the minimum (bottleneck)
    IF product_stock < min_stock THEN
      min_stock := product_stock;
    END IF;
  END LOOP;
  
  RETURN COALESCE(min_stock, 0);
END;
$$;

-- ============================================================================
-- STEP 4: Create Triggers
-- ============================================================================

-- Drop existing triggers if they exist (to avoid conflicts)
DROP TRIGGER IF EXISTS update_ready_to_ship_products_updated_at ON ready_to_ship_products;
DROP TRIGGER IF EXISTS update_ready_to_ship_bundles_updated_at ON ready_to_ship_bundles;
DROP TRIGGER IF EXISTS update_flash_sales_updated_at ON flash_sales;

-- Create triggers for automatic updated_at updates
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
-- STEP 5: Create Views
-- ============================================================================

-- Drop view if it exists (to avoid conflicts)
DROP VIEW IF EXISTS ready_to_ship_products_view;

-- View for active ready-to-ship products with calculated fields
CREATE VIEW ready_to_ship_products_view AS
SELECT 
  p.*,
  -- Calculate current price (flash sale > sale > base)
  CASE 
    WHEN p.flash_sale_price IS NOT NULL 
         AND p.flash_sale_ends_at IS NOT NULL 
         AND p.flash_sale_ends_at > NOW() 
    THEN p.flash_sale_price
    WHEN p.sale_price IS NOT NULL AND p.is_on_sale = true 
    THEN p.sale_price
    ELSE p.base_price
  END AS current_price,
  -- Determine if product is on flash sale
  CASE 
    WHEN p.flash_sale_price IS NOT NULL 
         AND p.flash_sale_ends_at IS NOT NULL 
         AND p.flash_sale_ends_at > NOW() 
    THEN true
    ELSE false
  END AS is_flash_sale,
  -- Calculate stock status
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
-- STEP 6: Add Table Comments (Documentation)
-- ============================================================================

COMMENT ON TABLE ready_to_ship_products IS 
  'Pre-made ready-to-ship products (tumblers, totes, coasters, keychains, gift sets). These are in-stock items that can be shipped immediately without custom printing.';

COMMENT ON TABLE ready_to_ship_bundles IS 
  'Gift sets and bundles of ready-to-ship products. Bundles combine multiple products with automatic discounts.';

COMMENT ON TABLE flash_sales IS 
  'Flash sale campaigns for ready-to-ship products. Supports time-limited discounts with customizable banners.';

COMMENT ON TABLE stock_updates IS 
  'Audit log for stock changes. Tracks all stock movements (sales, restocks, adjustments) for inventory management.';

COMMENT ON FUNCTION update_updated_at_column() IS 
  'Automatically updates the updated_at timestamp when a row is modified. Used by triggers.';

COMMENT ON FUNCTION calculate_bundle_stock(UUID) IS 
  'Calculates available stock for a bundle based on the minimum stock of its component products.';

-- ============================================================================
-- STEP 7: Row Level Security (RLS) - Optional but Recommended
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE ready_to_ship_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE ready_to_ship_bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE flash_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_updates ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access to active products
CREATE POLICY "Public can view active ready-to-ship products"
  ON ready_to_ship_products
  FOR SELECT
  USING (status = 'active');

-- Policy: Allow public read access to active bundles
CREATE POLICY "Public can view active bundles"
  ON ready_to_ship_bundles
  FOR SELECT
  USING (status = 'active');

-- Policy: Allow public read access to active flash sales
CREATE POLICY "Public can view active flash sales"
  ON flash_sales
  FOR SELECT
  USING (is_active = true AND starts_at <= NOW() AND ends_at >= NOW());

-- Policy: Allow public read access to stock updates (for transparency)
CREATE POLICY "Public can view stock updates"
  ON stock_updates
  FOR SELECT
  USING (true);

-- ============================================================================
-- VERIFICATION QUERIES (Optional - Run these to verify setup)
-- ============================================================================

-- Uncomment to verify tables were created:
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- AND table_name LIKE 'ready_to_ship%' OR table_name LIKE 'flash_sales' OR table_name LIKE 'stock_updates';

-- Uncomment to verify indexes were created:
-- SELECT indexname FROM pg_indexes 
-- WHERE tablename LIKE 'ready_to_ship%' OR tablename LIKE 'flash_sales' OR tablename LIKE 'stock_updates';

-- Uncomment to verify functions were created:
-- SELECT routine_name FROM information_schema.routines 
-- WHERE routine_schema = 'public' 
-- AND routine_name IN ('update_updated_at_column', 'calculate_bundle_stock');

-- ============================================================================
-- END OF SCHEMA SETUP
-- ============================================================================

