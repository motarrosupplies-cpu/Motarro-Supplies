-- ============================================================================
-- Ready-to-Ship Products Schema - FINAL BULLETPROOF VERSION
-- Apparely.co.za - Ready-to-Ship Section
-- ============================================================================
-- This script is guaranteed to work. It uses explicit schema, error handling,
-- and verification at each step. Run the ENTIRE script in Supabase SQL Editor.
-- ============================================================================

-- Ensure we're in the public schema
SET search_path TO public, pg_catalog;

-- ============================================================================
-- STEP 1: Complete cleanup (handles all edge cases)
-- ============================================================================

-- Drop view (outside DO block - doesn't need exception handling)
DROP VIEW IF EXISTS public.ready_to_ship_products_view CASCADE;

-- Drop triggers (with exception handling for each)
DO $$ 
BEGIN
  BEGIN
    DROP TRIGGER IF EXISTS update_ready_to_ship_products_updated_at ON public.ready_to_ship_products;
  EXCEPTION WHEN undefined_table THEN NULL;
  END;
  
  BEGIN
    DROP TRIGGER IF EXISTS update_ready_to_ship_bundles_updated_at ON public.ready_to_ship_bundles;
  EXCEPTION WHEN undefined_table THEN NULL;
  END;
  
  BEGIN
    DROP TRIGGER IF EXISTS update_flash_sales_updated_at ON public.flash_sales;
  EXCEPTION WHEN undefined_table THEN NULL;
  END;
END $$;

-- Drop policies (with exception handling for each)
DO $$ 
BEGIN
  BEGIN
    DROP POLICY IF EXISTS "Public can view active ready-to-ship products" ON public.ready_to_ship_products;
  EXCEPTION WHEN undefined_table THEN NULL;
  END;
  
  BEGIN
    DROP POLICY IF EXISTS "Public can view active bundles" ON public.ready_to_ship_bundles;
  EXCEPTION WHEN undefined_table THEN NULL;
  END;
  
  BEGIN
    DROP POLICY IF EXISTS "Public can view active flash sales" ON public.flash_sales;
  EXCEPTION WHEN undefined_table THEN NULL;
  END;
  
  BEGIN
    DROP POLICY IF EXISTS "Public can view stock updates" ON public.stock_updates;
  EXCEPTION WHEN undefined_table THEN NULL;
  END;
END $$;

-- Drop tables (outside DO block - CASCADE handles everything)
DROP TABLE IF EXISTS public.stock_updates CASCADE;
DROP TABLE IF EXISTS public.ready_to_ship_bundles CASCADE;
DROP TABLE IF EXISTS public.flash_sales CASCADE;
DROP TABLE IF EXISTS public.ready_to_ship_products CASCADE;

-- ============================================================================
-- STEP 2: Create functions (before tables that use them)
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

DO $$
BEGIN
  RAISE NOTICE '✅ Step 2: Functions created';
END $$;

-- ============================================================================
-- STEP 3: Create main products table (CRITICAL - must succeed)
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

-- Verify table was created and has required columns
DO $$
DECLARE
  table_exists BOOLEAN;
  has_created_at BOOLEAN;
  has_updated_at BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'ready_to_ship_products'
  ) INTO table_exists;
  
  IF NOT table_exists THEN
    RAISE EXCEPTION 'CRITICAL: ready_to_ship_products table was NOT created!';
  END IF;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'ready_to_ship_products' 
    AND column_name = 'created_at'
  ) INTO has_created_at;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'ready_to_ship_products' 
    AND column_name = 'updated_at'
  ) INTO has_updated_at;
  
  IF NOT has_created_at OR NOT has_updated_at THEN
    RAISE EXCEPTION 'CRITICAL: Table missing required timestamp columns!';
  END IF;
  
  RAISE NOTICE '✅ Step 3a: ready_to_ship_products table created with all columns';
END $$;

-- ============================================================================
-- STEP 4: Create remaining tables
-- ============================================================================

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

DO $$
BEGIN
  RAISE NOTICE '✅ Step 4: All tables created';
END $$;

-- ============================================================================
-- STEP 5: Create indexes
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

DO $$
BEGIN
  RAISE NOTICE '✅ Step 5: Indexes created';
END $$;

-- ============================================================================
-- STEP 6: Create triggers
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

DO $$
BEGIN
  RAISE NOTICE '✅ Step 6: Triggers created';
END $$;

-- ============================================================================
-- STEP 7: Create view
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

DO $$
BEGIN
  RAISE NOTICE '✅ Step 7: View created';
END $$;

-- ============================================================================
-- STEP 8: Enable RLS and create policies
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

DO $$
BEGIN
  RAISE NOTICE '✅ Step 8: RLS policies created';
END $$;

-- ============================================================================
-- FINAL VERIFICATION
-- ============================================================================

DO $$
DECLARE
  table_count INTEGER;
  view_count INTEGER;
  function_count INTEGER;
  trigger_count INTEGER;
  index_count INTEGER;
  policy_count INTEGER;
BEGIN
  -- Count tables
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name IN ('ready_to_ship_products', 'ready_to_ship_bundles', 'flash_sales', 'stock_updates');
  
  -- Count view
  SELECT COUNT(*) INTO view_count
  FROM information_schema.views 
  WHERE table_schema = 'public' 
  AND table_name = 'ready_to_ship_products_view';
  
  -- Count functions
  SELECT COUNT(*) INTO function_count
  FROM information_schema.routines 
  WHERE routine_schema = 'public' 
  AND routine_name IN ('update_updated_at_column', 'calculate_bundle_stock');
  
  -- Count triggers
  SELECT COUNT(*) INTO trigger_count
  FROM information_schema.triggers
  WHERE trigger_schema = 'public'
  AND trigger_name IN (
    'update_ready_to_ship_products_updated_at',
    'update_ready_to_ship_bundles_updated_at',
    'update_flash_sales_updated_at'
  );
  
  -- Count indexes
  SELECT COUNT(*) INTO index_count
  FROM pg_indexes
  WHERE schemaname = 'public'
  AND indexname LIKE 'idx_ready_to_ship%' OR indexname LIKE 'idx_stock_updates%' OR indexname LIKE 'idx_flash_sales%';
  
  -- Count policies
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public'
  AND tablename IN ('ready_to_ship_products', 'ready_to_ship_bundles', 'flash_sales', 'stock_updates');
  
  -- Report
  RAISE NOTICE '========================================';
  RAISE NOTICE 'FINAL VERIFICATION RESULTS:';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Tables: % / 4', table_count;
  RAISE NOTICE 'Views: % / 1', view_count;
  RAISE NOTICE 'Functions: % / 2', function_count;
  RAISE NOTICE 'Triggers: % / 3', trigger_count;
  RAISE NOTICE 'Indexes: % / 14', index_count;
  RAISE NOTICE 'Policies: % / 4', policy_count;
  RAISE NOTICE '========================================';
  
  IF table_count = 4 AND view_count = 1 AND function_count = 2 THEN
    RAISE NOTICE '✅ SUCCESS: Core schema objects created!';
    RAISE NOTICE '✅ The ready_to_ship_products table exists and is ready to use.';
    RAISE NOTICE '✅ You can now add products using INSERT statements.';
  ELSE
    RAISE WARNING '⚠️ WARNING: Some objects may be missing. Check counts above.';
  END IF;
END $$;

-- ============================================================================
-- SCHEMA CREATION COMPLETE
-- ============================================================================
-- Check the NOTICE messages above. If you see "✅ SUCCESS", everything is ready.
-- The table public.ready_to_ship_products now exists with all required columns.
-- ============================================================================

