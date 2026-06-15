-- ============================================================================
-- Fix Security Definer View Errors (Supabase Security Advisor)
-- Run this in Supabase SQL Editor to clear the 2 "Security Definer View" errors
-- ============================================================================
--
-- These views run with the INVOKER's permissions (not the definer's), so RLS
-- and permissions apply to the user querying the view. No privilege escalation.
--
-- After running: refresh Security Advisor to confirm errors are resolved.
-- ============================================================================

-- ============================================================================
-- 1. all_products_unified
-- ============================================================================
DROP VIEW IF EXISTS public.all_products_unified CASCADE;

CREATE VIEW public.all_products_unified
  WITH (security_invoker = on)
AS
SELECT
  sp.id,
  sp.name,
  sp.description,
  sp.price,
  sp.original_price,
  sp.category,
  sp.subcategory,
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
  COALESCE(sp.seo_slug, sp.slug) AS seo_slug,
  COALESCE(sp.slug, sp.seo_slug) AS slug,
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
  cp.subcategory,
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
  COALESCE(cp.seo_slug, cp.slug) AS seo_slug,
  COALESCE(cp.slug, cp.seo_slug) AS slug,
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
  spz.subcategory,
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
  COALESCE(spz.seo_slug, spz.slug) AS seo_slug,
  COALESCE(spz.slug, spz.seo_slug) AS slug,
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
  fp.subcategory,
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
  COALESCE(fp.seo_slug, fp.slug) AS seo_slug,
  COALESCE(fp.slug, fp.seo_slug) AS slug,
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

GRANT SELECT ON public.all_products_unified TO authenticated;
GRANT SELECT ON public.all_products_unified TO anon;

-- ============================================================================
-- 2. ready_to_ship_products_view
-- ============================================================================
DROP VIEW IF EXISTS public.ready_to_ship_products_view CASCADE;

CREATE VIEW public.ready_to_ship_products_view
  WITH (security_invoker = on)
AS
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

GRANT SELECT ON public.ready_to_ship_products_view TO authenticated;
GRANT SELECT ON public.ready_to_ship_products_view TO anon;

-- ============================================================================
-- Done
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE 'Views recreated with security_invoker = on. Refresh Security Advisor to confirm.';
END $$;
