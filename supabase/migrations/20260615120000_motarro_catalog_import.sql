-- MOTARRO catalogue import columns (run after supabase/motarro-bootstrap.sql)
-- If you have a fresh project, run motarro-bootstrap.sql FIRST, then this file is optional
-- (bootstrap already includes everything below).
ALTER TABLE public.simple_products DROP CONSTRAINT IF EXISTS simple_products_category_check;

ALTER TABLE public.simple_products
  ADD COLUMN IF NOT EXISTS subcategory VARCHAR(100),
  ADD COLUMN IF NOT EXISTS slug VARCHAR(255),
  ADD COLUMN IF NOT EXISTS availability VARCHAR(50) DEFAULT 'in_stock',
  ADD COLUMN IF NOT EXISTS availability_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS condition VARCHAR(50) DEFAULT 'new',
  ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER DEFAULT 5,
  ADD COLUMN IF NOT EXISTS motarro_shopify_id BIGINT,
  ADD COLUMN IF NOT EXISTS motarro_shopify_handle TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_simple_products_motarro_shopify_id
  ON public.simple_products (motarro_shopify_id)
  WHERE motarro_shopify_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_simple_products_seo_slug
  ON public.simple_products (seo_slug)
  WHERE seo_slug IS NOT NULL;

-- Ensure storefront view exists (simple products only is fine for MOTARRO import)
DROP VIEW IF EXISTS public.all_products_unified CASCADE;

CREATE VIEW public.all_products_unified AS
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
WHERE sp.status = 'active';

GRANT SELECT ON public.all_products_unified TO anon, authenticated, service_role;
