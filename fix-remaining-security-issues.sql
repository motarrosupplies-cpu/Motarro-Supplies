-- ============================================================================
-- Fix Remaining Supabase Security Advisor Issues
-- This script addresses the remaining 7 errors and 3 function warnings
-- ============================================================================
-- 
-- Remaining Issues:
-- 1. Security Definer View - all_products_unified (still has SECURITY DEFINER)
-- 2. Security Definer View - ready_to_ship_products_view
-- 3. RLS Disabled - order_items
-- 4. RLS Disabled - simple_products
-- 5. RLS Disabled - color_only_products
-- 6. RLS Disabled - size_only_products
-- 7. RLS Disabled - full_variant_products
-- 8. Function Search Path - generate_sku
-- 9. Function Search Path - update_updated_at_column
-- 10. Function Search Path - generate_product_slug (duplicate?)
-- ============================================================================

-- ============================================================================
-- SECTION 1: Fix Remaining Functions with Search Path Issues
-- ============================================================================

-- Fix generate_sku function
CREATE OR REPLACE FUNCTION generate_sku(product_name VARCHAR(255))
RETURNS VARCHAR(100)
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN UPPER(
    SUBSTRING(
      REGEXP_REPLACE(product_name, '[^A-Z0-9]+', '', 'g'),
      1,
      20
    )
  );
END;
$$;

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Fix generate_product_slug - handle all possible signatures
-- There may be multiple versions with different parameter types

-- Version 1: product_category TEXT DEFAULT NULL, product_id TEXT DEFAULT NULL
CREATE OR REPLACE FUNCTION generate_product_slug(product_name TEXT, product_category TEXT DEFAULT NULL, product_id TEXT DEFAULT NULL)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public, pg_temp
AS $$
DECLARE
  slug TEXT;
  base_slug TEXT;
BEGIN
  -- Convert to lowercase
  base_slug := LOWER(TRIM(product_name));
  
  -- Remove special characters, keep only alphanumeric, spaces, and hyphens
  base_slug := REGEXP_REPLACE(base_slug, '[^a-z0-9\s-]', '', 'g');
  
  -- Replace multiple spaces/hyphens with single hyphen
  base_slug := REGEXP_REPLACE(base_slug, '[\s-]+', '-', 'g');
  
  -- Remove leading/trailing hyphens
  base_slug := TRIM(BOTH '-' FROM base_slug);
  
  -- Add category prefix if provided
  IF product_category IS NOT NULL THEN
    slug := LOWER(REGEXP_REPLACE(product_category, '[^a-z0-9]', '-', 'g')) || '-' || base_slug;
  ELSE
    slug := base_slug;
  END IF;
  
  -- Limit to 200 characters
  IF LENGTH(slug) > 200 THEN
    slug := LEFT(slug, 200);
    slug := TRIM(BOTH '-' FROM slug);
  END IF;
  
  RETURN slug;
END;
$$;

-- Version 2: product_category TEXT (not nullable), product_id UUID DEFAULT NULL
-- Drop the old version if it exists with this signature, then recreate with search_path
DROP FUNCTION IF EXISTS generate_product_slug(product_name TEXT, product_category TEXT, product_id UUID);

CREATE OR REPLACE FUNCTION generate_product_slug(product_name TEXT, product_category TEXT, product_id UUID DEFAULT NULL)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public, pg_temp
AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  category_keyword TEXT;
  location_keyword TEXT := 'johannesburg';
  word_count INTEGER;
  counter INTEGER := 0;
  exists_check BOOLEAN;
BEGIN
  -- Normalize product name
  base_slug := LOWER(TRIM(product_name));
  
  -- Remove special characters, keep alphanumeric, spaces, and hyphens
  base_slug := REGEXP_REPLACE(base_slug, '[^a-z0-9\s-]', '', 'g');
  
  -- Replace multiple spaces/hyphens with single hyphen
  base_slug := REGEXP_REPLACE(base_slug, '[\s-]+', '-', 'g');
  
  -- Remove leading/trailing hyphens
  base_slug := TRIM(BOTH '-' FROM base_slug);
  
  -- Count words (approximate)
  word_count := array_length(string_to_array(base_slug, '-'), 1);
  
  -- Add category keyword if name is short
  IF word_count < 5 THEN
    category_keyword := CASE 
      WHEN LOWER(product_category) LIKE '%men%' THEN 'mens'
      WHEN LOWER(product_category) LIKE '%women%' OR LOWER(product_category) LIKE '%ladies%' THEN 'ladies'
      WHEN LOWER(product_category) LIKE '%accessor%' THEN 'accessories'
      WHEN LOWER(product_category) LIKE '%custom%print%' THEN 'custom-printing'
      ELSE ''
    END;
    
    IF category_keyword != '' AND base_slug !~ category_keyword THEN
      base_slug := category_keyword || '-' || base_slug;
    END IF;
  END IF;
  
  -- Add location keyword if not present and name is short
  IF word_count < 6 AND base_slug !~ location_keyword THEN
    base_slug := base_slug || '-' || location_keyword;
  END IF;
  
  -- Limit to 200 characters (leaving room for uniqueness suffix)
  IF LENGTH(base_slug) > 200 THEN
    base_slug := LEFT(base_slug, 200);
    base_slug := TRIM(BOTH '-' FROM base_slug);
  END IF;
  
  -- Ensure uniqueness across all product tables
  final_slug := base_slug;
  
  LOOP
    -- Check if slug exists in any table
    exists_check := EXISTS (
      SELECT 1 FROM simple_products WHERE seo_slug = final_slug OR slug = final_slug
      UNION ALL
      SELECT 1 FROM color_only_products WHERE seo_slug = final_slug OR slug = final_slug
      UNION ALL
      SELECT 1 FROM size_only_products WHERE seo_slug = final_slug OR slug = final_slug
      UNION ALL
      SELECT 1 FROM full_variant_products WHERE seo_slug = final_slug OR slug = final_slug
    );
    
    -- If slug doesn't exist or matches current product, return it
    IF NOT exists_check OR (product_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM simple_products WHERE id = product_id AND (seo_slug = final_slug OR slug = final_slug)
      UNION ALL
      SELECT 1 FROM color_only_products WHERE id = product_id AND (seo_slug = final_slug OR slug = final_slug)
      UNION ALL
      SELECT 1 FROM size_only_products WHERE id = product_id AND (seo_slug = final_slug OR slug = final_slug)
      UNION ALL
      SELECT 1 FROM full_variant_products WHERE id = product_id AND (seo_slug = final_slug OR slug = final_slug)
    )) THEN
      EXIT;
    END IF;
    
    -- Append counter to make unique
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
    
    -- Safety check to prevent infinite loop
    IF counter > 100 THEN
      -- Fallback: use first 8 chars of product_id if provided
      IF product_id IS NOT NULL THEN
        final_slug := base_slug || '-' || SUBSTRING(product_id::TEXT, 1, 8);
      ELSE
        final_slug := base_slug || '-' || EXTRACT(EPOCH FROM NOW())::INTEGER;
      END IF;
      EXIT;
    END IF;
  END LOOP;
  
  RETURN final_slug;
END;
$$;

-- ============================================================================
-- SECTION 2: Fix Security Definer Views
-- ============================================================================

-- Fix all_products_unified view (remove SECURITY DEFINER if it exists)
DO $$
BEGIN
  -- Drop and recreate the view without SECURITY DEFINER
  DROP VIEW IF EXISTS public.all_products_unified CASCADE;
  
  -- Recreate with explicit security_invoker (NOT SECURITY DEFINER)
  EXECUTE '
  CREATE VIEW public.all_products_unified
  WITH (security_invoker = true)
  AS
  SELECT
    sp.id,
    sp.name,
    sp.description,
    sp.price,
    sp.original_price,
    sp.category,
    COALESCE(sp.subcategory, NULL) as subcategory,
    sp.status,
    sp.is_new,
    sp.on_sale,
    sp.stock,
    sp.stock AS total_stock,
    sp.image,
    sp.images,
    sp.image_alt_texts,
    sp.seo_title,
    sp.seo_description,
    sp.seo_keywords,
    COALESCE(sp.seo_slug, sp.slug) as seo_slug,
    COALESCE(sp.slug, sp.seo_slug) as slug,
    sp.availability,
    sp.availability_date,
    sp.condition,
    sp.low_stock_threshold,
    sp.created_at,
    sp.updated_at,
    'simple'::text AS product_type,
    FALSE AS has_color_options,
    FALSE AS has_size_options,
    NULL::jsonb AS colors,
    NULL::jsonb AS sizes
  FROM public.simple_products sp
  WHERE sp.status = 'active'
  UNION ALL
  SELECT
    cp.id,
    cp.name,
    cp.description,
    cp.price,
    cp.original_price,
    cp.category,
    COALESCE(cp.subcategory, NULL) as subcategory,
    cp.status,
    cp.is_new,
    cp.on_sale,
    cp.total_stock AS stock,
    cp.total_stock,
    cp.image,
    cp.images,
    cp.image_alt_texts,
    cp.seo_title,
    cp.seo_description,
    cp.seo_keywords,
    COALESCE(cp.seo_slug, cp.slug) as seo_slug,
    COALESCE(cp.slug, cp.seo_slug) as slug,
    cp.availability,
    cp.availability_date,
    cp.condition,
    cp.low_stock_threshold,
    cp.created_at,
    cp.updated_at,
    'color_only'::text,
    TRUE,
    FALSE,
    cp.colors,
    NULL::jsonb
  FROM public.color_only_products cp
  WHERE cp.status = 'active'
  UNION ALL
  SELECT
    spz.id,
    spz.name,
    spz.description,
    spz.price,
    spz.original_price,
    spz.category,
    COALESCE(spz.subcategory, NULL) as subcategory,
    spz.status,
    spz.is_new,
    spz.on_sale,
    spz.total_stock AS stock,
    spz.total_stock,
    spz.image,
    spz.images,
    spz.image_alt_texts,
    spz.seo_title,
    spz.seo_description,
    spz.seo_keywords,
    COALESCE(spz.seo_slug, spz.slug) as seo_slug,
    COALESCE(spz.slug, spz.seo_slug) as slug,
    spz.availability,
    spz.availability_date,
    spz.condition,
    spz.low_stock_threshold,
    spz.created_at,
    spz.updated_at,
    'size_only'::text,
    FALSE,
    TRUE,
    NULL::jsonb,
    spz.sizes
  FROM public.size_only_products spz
  WHERE spz.status = 'active'
  UNION ALL
  SELECT
    fp.id,
    fp.name,
    fp.description,
    fp.price,
    fp.original_price,
    fp.category,
    COALESCE(fp.subcategory, NULL) as subcategory,
    fp.status,
    fp.is_new,
    fp.on_sale,
    fp.total_stock AS stock,
    fp.total_stock,
    fp.image,
    fp.images,
    fp.image_alt_texts,
    fp.seo_title,
    fp.seo_description,
    fp.seo_keywords,
    COALESCE(fp.seo_slug, fp.slug) as seo_slug,
    COALESCE(fp.slug, fp.seo_slug) as slug,
    fp.availability,
    fp.availability_date,
    fp.condition,
    fp.low_stock_threshold,
    fp.created_at,
    fp.updated_at,
    'full_variant'::text,
    TRUE,
    TRUE,
    fp.colors,
    fp.sizes
  FROM public.full_variant_products fp
  WHERE fp.status = ''active'';
  ';
  
  -- Grant permissions
  GRANT SELECT ON public.all_products_unified TO authenticated;
  GRANT SELECT ON public.all_products_unified TO anon;
END $$;

-- Fix ready_to_ship_products_view (remove SECURITY DEFINER if it exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_views 
    WHERE schemaname = 'public' AND viewname = 'ready_to_ship_products_view'
  ) THEN
    -- Drop and recreate without SECURITY DEFINER
    DROP VIEW IF EXISTS public.ready_to_ship_products_view CASCADE;
    
    -- Recreate with explicit security_invoker (NOT SECURITY DEFINER)
    EXECUTE '
    CREATE VIEW public.ready_to_ship_products_view
    WITH (security_invoker = true)
    AS
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
      ELSE ''in_stock''
    END AS stock_status
FROM public.ready_to_ship_products p
WHERE p.status = ''active'';
    ';
    
    -- Grant permissions
    GRANT SELECT ON public.ready_to_ship_products_view TO authenticated;
    GRANT SELECT ON public.ready_to_ship_products_view TO anon;
  END IF;
END $$;

-- ============================================================================
-- SECTION 3: Enable RLS on Remaining Product Tables
-- ============================================================================

-- Enable RLS on simple_products
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'simple_products') THEN
    ALTER TABLE simple_products ENABLE ROW LEVEL SECURITY;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'simple_products' AND policyname = 'Allow read for all') THEN
      CREATE POLICY "Allow read for all" ON simple_products
        FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'simple_products' AND policyname = 'Allow write for authenticated') THEN
      CREATE POLICY "Allow write for authenticated" ON simple_products
        FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
    END IF;
  END IF;
END $$;

-- Enable RLS on color_only_products
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'color_only_products') THEN
    ALTER TABLE color_only_products ENABLE ROW LEVEL SECURITY;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'color_only_products' AND policyname = 'Allow read for all') THEN
      CREATE POLICY "Allow read for all" ON color_only_products
        FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'color_only_products' AND policyname = 'Allow write for authenticated') THEN
      CREATE POLICY "Allow write for authenticated" ON color_only_products
        FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
    END IF;
  END IF;
END $$;

-- Enable RLS on size_only_products
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'size_only_products') THEN
    ALTER TABLE size_only_products ENABLE ROW LEVEL SECURITY;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'size_only_products' AND policyname = 'Allow read for all') THEN
      CREATE POLICY "Allow read for all" ON size_only_products
        FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'size_only_products' AND policyname = 'Allow write for authenticated') THEN
      CREATE POLICY "Allow write for authenticated" ON size_only_products
        FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
    END IF;
  END IF;
END $$;

-- Enable RLS on full_variant_products
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'full_variant_products') THEN
    ALTER TABLE full_variant_products ENABLE ROW LEVEL SECURITY;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'full_variant_products' AND policyname = 'Allow read for all') THEN
      CREATE POLICY "Allow read for all" ON full_variant_products
        FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'full_variant_products' AND policyname = 'Allow write for authenticated') THEN
      CREATE POLICY "Allow write for authenticated" ON full_variant_products
        FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
    END IF;
  END IF;
END $$;

-- Enable RLS on order_items
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'order_items') THEN
    ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'order_items' AND policyname = 'Allow read for all') THEN
      CREATE POLICY "Allow read for all" ON order_items
        FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'order_items' AND policyname = 'Allow write for authenticated') THEN
      CREATE POLICY "Allow write for authenticated" ON order_items
        FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
    END IF;
  END IF;
END $$;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check RLS status on newly fixed tables
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled,
  CASE 
    WHEN rowsecurity THEN '✅ ENABLED' 
    ELSE '❌ DISABLED' 
  END as status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'simple_products',
    'color_only_products',
    'size_only_products',
    'full_variant_products',
    'order_items'
  )
ORDER BY tablename;

-- Check views don't have SECURITY DEFINER
SELECT 
  schemaname,
  viewname,
  viewowner,
  definition
FROM pg_views
WHERE schemaname = 'public'
  AND viewname IN ('all_products_unified', 'ready_to_ship_products_view')
ORDER BY viewname;

-- Check function search_path settings
SELECT 
  p.proname as function_name,
  CASE 
    WHEN pg_get_functiondef(p.oid) LIKE '%SET search_path%' THEN '✅ HAS search_path'
    ELSE '❌ MISSING search_path'
  END as search_path_status
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proname IN (
    'generate_sku',
    'update_updated_at_column',
    'generate_product_slug'
  )
ORDER BY p.proname;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE 'Remaining security fixes applied successfully!';
  RAISE NOTICE 'All product tables now have RLS enabled.';
  RAISE NOTICE 'All views recreated without SECURITY DEFINER.';
  RAISE NOTICE 'All remaining functions now have SET search_path configured.';
  RAISE NOTICE 'Please verify the results using the queries above.';
  RAISE NOTICE 'Then check Supabase Security Advisor again to confirm all issues are resolved.';
END $$;

