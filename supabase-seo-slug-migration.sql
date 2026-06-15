-- SEO Slug Migration - Add slug support to all product tables
-- Run this in Supabase SQL Editor

-- 1. Ensure seo_slug column exists and add indexes
-- Simple products
ALTER TABLE public.simple_products
  ADD COLUMN IF NOT EXISTS seo_slug VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_simple_products_slug ON public.simple_products(seo_slug) WHERE seo_slug IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_simple_products_slug_unique ON public.simple_products(seo_slug) WHERE seo_slug IS NOT NULL;

-- Color-only products
ALTER TABLE public.color_only_products
  ADD COLUMN IF NOT EXISTS seo_slug VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_color_only_products_slug ON public.color_only_products(seo_slug) WHERE seo_slug IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_color_only_products_slug_unique ON public.color_only_products(seo_slug) WHERE seo_slug IS NOT NULL;

-- Size-only products
ALTER TABLE public.size_only_products
  ADD COLUMN IF NOT EXISTS seo_slug VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_size_only_products_slug ON public.size_only_products(seo_slug) WHERE seo_slug IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_size_only_products_slug_unique ON public.size_only_products(seo_slug) WHERE seo_slug IS NOT NULL;

-- Full variant products
ALTER TABLE public.full_variant_products
  ADD COLUMN IF NOT EXISTS seo_slug VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_full_variant_products_slug ON public.full_variant_products(seo_slug) WHERE seo_slug IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_full_variant_products_slug_unique ON public.full_variant_products(seo_slug) WHERE seo_slug IS NOT NULL;

-- 2. Function to generate SEO-friendly slug from product name
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
  
  -- Limit to 200 characters (leaving room for uniqueness suffix)
  IF LENGTH(slug) > 200 THEN
    slug := LEFT(slug, 200);
    slug := TRIM(BOTH '-' FROM slug);
  END IF;
  
  RETURN slug;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 3. Function to ensure unique slug (adds suffix if needed)
CREATE OR REPLACE FUNCTION ensure_unique_slug(
  base_slug TEXT,
  table_name TEXT,
  exclude_id UUID DEFAULT NULL
)
RETURNS TEXT AS $$
DECLARE
  final_slug TEXT;
  counter INTEGER := 0;
  exists_check BOOLEAN;
BEGIN
  final_slug := base_slug;
  
  LOOP
    -- Check if slug exists in the specified table
    CASE table_name
      WHEN 'simple_products' THEN
        SELECT EXISTS(SELECT 1 FROM public.simple_products WHERE seo_slug = final_slug AND (exclude_id IS NULL OR id != exclude_id)) INTO exists_check;
      WHEN 'color_only_products' THEN
        SELECT EXISTS(SELECT 1 FROM public.color_only_products WHERE seo_slug = final_slug AND (exclude_id IS NULL OR id != exclude_id)) INTO exists_check;
      WHEN 'size_only_products' THEN
        SELECT EXISTS(SELECT 1 FROM public.size_only_products WHERE seo_slug = final_slug AND (exclude_id IS NULL OR id != exclude_id)) INTO exists_check;
      WHEN 'full_variant_products' THEN
        SELECT EXISTS(SELECT 1 FROM public.full_variant_products WHERE seo_slug = final_slug AND (exclude_id IS NULL OR id != exclude_id)) INTO exists_check;
      ELSE
        exists_check := FALSE;
    END CASE;
    
    -- If slug doesn't exist, we're done
    EXIT WHEN NOT exists_check;
    
    -- Otherwise, add counter suffix
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
    
    -- Safety check to prevent infinite loop
    IF counter > 1000 THEN
      final_slug := base_slug || '-' || gen_random_uuid()::TEXT;
      EXIT;
    END IF;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- 4. Update all_products_unified view to include slug
DROP VIEW IF EXISTS public.all_products_unified;

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

-- 5. Generate slugs for existing products (run this after slug generation is implemented in code)
-- This will be done via API/Admin panel, but here's the SQL pattern:
-- UPDATE public.simple_products
-- SET seo_slug = ensure_unique_slug(generate_seo_slug(name), 'simple_products', id)
-- WHERE seo_slug IS NULL OR seo_slug = '';

-- Note: Actual slug generation should be done via application code to ensure consistency
-- This SQL provides the database structure and helper functions

