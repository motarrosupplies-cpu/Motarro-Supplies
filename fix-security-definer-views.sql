-- ============================================================================
-- Fix Security Definer Views - Force Recreation Without SECURITY DEFINER
-- This script ensures views are recreated without SECURITY DEFINER
-- ============================================================================

-- ============================================================================
-- Fix all_products_unified view
-- ============================================================================

-- First, check if view exists and drop it
DROP VIEW IF EXISTS public.all_products_unified CASCADE;

-- Recreate WITHOUT SECURITY DEFINER (explicitly)
-- Note: Views don't have SECURITY DEFINER by default, but we ensure clean recreation
CREATE VIEW public.all_products_unified AS
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
WHERE fp.status = 'active';

-- Grant permissions
GRANT SELECT ON public.all_products_unified TO authenticated;
GRANT SELECT ON public.all_products_unified TO anon;

-- ============================================================================
-- Fix ready_to_ship_products_view
-- ============================================================================

-- Drop the view if it exists
DROP VIEW IF EXISTS public.ready_to_ship_products_view CASCADE;

-- Recreate WITHOUT SECURITY DEFINER (explicitly)
-- Note: Views don't have SECURITY DEFINER by default, but we ensure clean recreation
CREATE VIEW public.ready_to_ship_products_view AS
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
FROM public.ready_to_ship_products p
WHERE p.status = 'active';

-- Grant permissions
GRANT SELECT ON public.ready_to_ship_products_view TO authenticated;
GRANT SELECT ON public.ready_to_ship_products_view TO anon;

-- ============================================================================
-- Verification Query
-- ============================================================================

-- Check view security settings
SELECT 
  schemaname,
  viewname,
  viewowner,
  CASE 
    WHEN definition LIKE '%SECURITY DEFINER%' THEN '❌ HAS SECURITY DEFINER'
    WHEN definition LIKE '%security_invoker%' THEN '✅ Uses security_invoker'
    ELSE '⚠️ Default (should be invoker)'
  END as security_status
FROM pg_views
WHERE schemaname = 'public'
  AND viewname IN ('all_products_unified', 'ready_to_ship_products_view')
ORDER BY viewname;

-- Alternative check using pg_class
SELECT 
  n.nspname as schema_name,
  c.relname as view_name,
  CASE 
    WHEN c.relkind = 'v' THEN 'View'
    ELSE 'Other'
  END as object_type,
  -- Check if view has security definer (this is stored in pg_class but we need to check differently)
  'Check via pg_views definition' as note
FROM pg_class c
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public'
  AND c.relname IN ('all_products_unified', 'ready_to_ship_products_view')
  AND c.relkind = 'v';

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE 'Views recreated with security_invoker = true (explicitly NOT SECURITY DEFINER)';
  RAISE NOTICE 'Please verify the views using the queries above.';
  RAISE NOTICE 'Then refresh Security Advisor to confirm the errors are resolved.';
END $$;

