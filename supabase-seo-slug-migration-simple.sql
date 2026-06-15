-- SEO Slug Migration - SIMPLIFIED VERSION
-- Run this in Supabase SQL Editor (one section at a time if needed)
-- Copy and paste each section separately if you encounter issues

-- ============================================
-- SECTION 1: Add slug columns to all tables
-- ============================================

-- Simple products
ALTER TABLE public.simple_products
  ADD COLUMN IF NOT EXISTS seo_slug VARCHAR(255);

-- Color-only products
ALTER TABLE public.color_only_products
  ADD COLUMN IF NOT EXISTS seo_slug VARCHAR(255);

-- Size-only products
ALTER TABLE public.size_only_products
  ADD COLUMN IF NOT EXISTS seo_slug VARCHAR(255);

-- Full variant products
ALTER TABLE public.full_variant_products
  ADD COLUMN IF NOT EXISTS seo_slug VARCHAR(255);

-- ============================================
-- SECTION 2: Create indexes for performance
-- ============================================

-- Simple products indexes
CREATE INDEX IF NOT EXISTS idx_simple_products_slug ON public.simple_products(seo_slug) WHERE seo_slug IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_simple_products_slug_unique ON public.simple_products(seo_slug) WHERE seo_slug IS NOT NULL;

-- Color-only products indexes
CREATE INDEX IF NOT EXISTS idx_color_only_products_slug ON public.color_only_products(seo_slug) WHERE seo_slug IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_color_only_products_slug_unique ON public.color_only_products(seo_slug) WHERE seo_slug IS NOT NULL;

-- Size-only products indexes
CREATE INDEX IF NOT EXISTS idx_size_only_products_slug ON public.size_only_products(seo_slug) WHERE seo_slug IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_size_only_products_slug_unique ON public.size_only_products(seo_slug) WHERE seo_slug IS NOT NULL;

-- Full variant products indexes
CREATE INDEX IF NOT EXISTS idx_full_variant_products_slug ON public.full_variant_products(seo_slug) WHERE seo_slug IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_full_variant_products_slug_unique ON public.full_variant_products(seo_slug) WHERE seo_slug IS NOT NULL;

-- ============================================
-- SECTION 3: Create slug generation function
-- ============================================

CREATE OR REPLACE FUNCTION generate_seo_slug(product_name TEXT)
RETURNS TEXT AS $$
DECLARE
  slug TEXT;
BEGIN
  -- Convert to lowercase
  slug := LOWER(product_name);
  
  -- Remove special characters, keep only alphanumeric, spaces, and hyphens
  slug := REGEXP_REPLACE(slug, '[^a-z0-9\s-]', '', 'g');
  
  -- Replace multiple spaces/hyphens with single hyphen
  slug := REGEXP_REPLACE(slug, '[\s-]+', '-', 'g');
  
  -- Remove leading/trailing hyphens
  slug := TRIM(BOTH '-' FROM slug);
  
  -- Limit to 200 characters
  IF LENGTH(slug) > 200 THEN
    slug := LEFT(slug, 200);
    slug := TRIM(BOTH '-' FROM slug);
  END IF;
  
  RETURN slug;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- SECTION 4: Update view to include slug
-- ============================================

-- Drop existing view
DROP VIEW IF EXISTS public.all_products_unified;

-- Recreate view with slug column
CREATE VIEW public.all_products_unified AS
SELECT
  sp.id,
  sp.name,
  sp.description,
  sp.price,
  sp.original_price,
  sp.category,
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
  sp.seo_slug,
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
  cp.seo_slug,
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
  spz.seo_slug,
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
  fp.seo_slug,
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

-- ============================================
-- DONE! 
-- Next: Generate slugs for existing products
-- This will be done via your admin panel or API
-- ============================================

