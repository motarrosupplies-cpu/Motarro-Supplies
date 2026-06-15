-- ============================================================================
-- Ready-to-Ship Products Schema - BULLETPROOF VERSION
-- Apparely.co.za - Ready-to-Ship Section
-- ============================================================================
-- This script uses explicit schema, error handling, and verification
-- Run this ENTIRE script in Supabase SQL Editor
-- ============================================================================

-- Set search path to ensure we're in the public schema
SET search_path TO public;

-- ============================================================================
-- STEP 1: Clean up existing objects (with explicit schema)
-- ============================================================================

DO $$ 
BEGIN
  -- Drop view
  DROP VIEW IF EXISTS public.ready_to_ship_products_view CASCADE;
  
  -- Drop triggers
  DROP TRIGGER IF EXISTS update_ready_to_ship_products_updated_at ON public.ready_to_ship_products;
  DROP TRIGGER IF EXISTS update_ready_to_ship_bundles_updated_at ON public.ready_to_ship_bundles;
  DROP TRIGGER IF EXISTS update_flash_sales_updated_at ON public.flash_sales;
  
  -- Drop policies
  DROP POLICY IF EXISTS "Public can view active ready-to-ship products" ON public.ready_to_ship_products;
  DROP POLICY IF EXISTS "Public can view active bundles" ON public.ready_to_ship_bundles;
  DROP POLICY IF EXISTS "Public can view active flash sales" ON public.flash_sales;
  DROP POLICY IF EXISTS "Public can view stock updates" ON public.stock_updates;
  
  -- Drop tables (CASCADE removes all dependencies)
  DROP TABLE IF EXISTS public.stock_updates CASCADE;
  DROP TABLE IF EXISTS public.ready_to_ship_bundles CASCADE;
  DROP TABLE IF EXISTS public.flash_sales CASCADE;
  DROP TABLE IF EXISTS public.ready_to_ship_products CASCADE;
  
  RAISE NOTICE 'Step 1: Cleanup completed';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Step 1: Cleanup completed with warnings (this is OK)';
END $$;

-- ============================================================================
-- STEP 2: Create functions
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.calculate_bundle_stock(bundle_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  min_stock INTEGER := 999999;
  item JSONB;
  product_stock INTEGER;
  item_quantity INTEGER;
BEGIN
  FOR item IN 
    SELECT jsonb_array_elements(items) 
    FROM public.ready_to_ship_bundles 
    WHERE id = bundle_id
  LOOP
    SELECT stock_quantity INTO product_stock
    FROM public.ready_to_ship_products
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
-- STEP 3: Create tables (with explicit public schema)
-- ============================================================================

CREATE TABLE public.ready_to_ship_products (
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

-- Verify table was created
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ready_to_ship_products') THEN
    RAISE NOTICE 'Step 3a: ready_to_ship_products table created successfully';
  ELSE
    RAISE EXCEPTION 'Failed to create ready_to_ship_products table';
  END IF;
END $$;

CREATE TABLE public.ready_to_ship_bundles (
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

CREATE TABLE public.flash_sales (
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

CREATE TABLE public.stock_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL,
  quantity_change INTEGER NOT NULL,
  reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT fk_stock_updates_product 
    FOREIGN KEY (product_id) 
    REFERENCES public.ready_to_ship_products(id) 
    ON DELETE CASCADE
);

-- ============================================================================
-- STEP 4: Create indexes
-- ============================================================================

CREATE INDEX idx_ready_to_ship_status ON public.ready_to_ship_products(status);
CREATE INDEX idx_ready_to_ship_category ON public.ready_to_ship_products(category);
CREATE INDEX idx_ready_to_ship_slug ON public.ready_to_ship_products(slug);
CREATE INDEX idx_ready_to_ship_featured ON public.ready_to_ship_products(featured);
CREATE INDEX idx_ready_to_ship_gift ON public.ready_to_ship_products(is_gift_item);
CREATE INDEX idx_ready_to_ship_event ON public.ready_to_ship_products(is_event_favour);
CREATE INDEX idx_ready_to_ship_price ON public.ready_to_ship_products(max_price_for_filter);
CREATE INDEX idx_ready_to_ship_created ON public.ready_to_ship_products(created_at DESC);
CREATE INDEX idx_ready_to_ship_updated ON public.ready_to_ship_products(updated_at DESC);
CREATE INDEX idx_stock_updates_product ON public.stock_updates(product_id);
CREATE INDEX idx_stock_updates_created ON public.stock_updates(created_at DESC);
CREATE INDEX idx_flash_sales_active ON public.flash_sales(is_active) WHERE is_active = true;
CREATE INDEX idx_flash_sales_dates ON public.flash_sales(starts_at, ends_at);

-- ============================================================================
-- STEP 5: Create triggers
-- ============================================================================

CREATE TRIGGER update_ready_to_ship_products_updated_at
  BEFORE UPDATE ON public.ready_to_ship_products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ready_to_ship_bundles_updated_at
  BEFORE UPDATE ON public.ready_to_ship_bundles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_flash_sales_updated_at
  BEFORE UPDATE ON public.flash_sales
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- STEP 6: Create view
-- ============================================================================

CREATE VIEW public.ready_to_ship_products_view AS
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
FROM public.ready_to_ship_products p
WHERE p.status = 'active';

-- ============================================================================
-- STEP 7: Enable RLS and create policies
-- ============================================================================

ALTER TABLE public.ready_to_ship_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ready_to_ship_bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flash_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active ready-to-ship products"
  ON public.ready_to_ship_products FOR SELECT
  USING (status = 'active');

CREATE POLICY "Public can view active bundles"
  ON public.ready_to_ship_bundles FOR SELECT
  USING (status = 'active');

CREATE POLICY "Public can view active flash sales"
  ON public.flash_sales FOR SELECT
  USING (is_active = true AND starts_at <= NOW() AND ends_at >= NOW());

CREATE POLICY "Public can view stock updates"
  ON public.stock_updates FOR SELECT
  USING (true);

-- ============================================================================
-- STEP 8: Final verification
-- ============================================================================

DO $$
DECLARE
  table_count INTEGER;
  view_count INTEGER;
  function_count INTEGER;
BEGIN
  -- Check tables
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name IN ('ready_to_ship_products', 'ready_to_ship_bundles', 'flash_sales', 'stock_updates');
  
  -- Check view
  SELECT COUNT(*) INTO view_count
  FROM information_schema.views 
  WHERE table_schema = 'public' 
  AND table_name = 'ready_to_ship_products_view';
  
  -- Check functions
  SELECT COUNT(*) INTO function_count
  FROM information_schema.routines 
  WHERE routine_schema = 'public' 
  AND routine_name IN ('update_updated_at_column', 'calculate_bundle_stock');
  
  -- Report results
  RAISE NOTICE '========================================';
  RAISE NOTICE 'VERIFICATION RESULTS:';
  RAISE NOTICE 'Tables created: %', table_count;
  RAISE NOTICE 'Views created: %', view_count;
  RAISE NOTICE 'Functions created: %', function_count;
  RAISE NOTICE '========================================';
  
  IF table_count = 4 AND view_count = 1 AND function_count = 2 THEN
    RAISE NOTICE '✅ SUCCESS: All schema objects created successfully!';
  ELSE
    RAISE WARNING '⚠️ WARNING: Some objects may be missing. Check counts above.';
  END IF;
END $$;

-- ============================================================================
-- SCHEMA CREATION COMPLETE
-- ============================================================================
-- Check the NOTICE messages above to verify everything was created.
-- If you see "✅ SUCCESS", the schema is ready to use.
-- ============================================================================

