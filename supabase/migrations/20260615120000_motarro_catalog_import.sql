-- MOTARRO catalogue import: schema updates for simple_products + unified view

CREATE TABLE IF NOT EXISTS public.simple_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  category VARCHAR(50) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  is_new BOOLEAN DEFAULT false,
  on_sale BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'active',
  image VARCHAR(500),
  images JSONB DEFAULT '[]',
  image_alt_texts JSONB,
  seo_title VARCHAR(60),
  seo_description VARCHAR(160),
  seo_keywords TEXT,
  seo_slug VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Drop legacy apparel-only category constraint (if present)
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
