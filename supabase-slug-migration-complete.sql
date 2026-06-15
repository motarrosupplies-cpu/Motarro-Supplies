-- Complete Slug Migration for Product URLs
-- Run this in Supabase SQL Editor
-- This adds slug support and generates slugs for all existing products

-- ============================================
-- STEP 1: Add slug column to all product tables
-- ============================================

-- Simple products
ALTER TABLE public.simple_products
  ADD COLUMN IF NOT EXISTS slug TEXT;

-- Color-only products
ALTER TABLE public.color_only_products
  ADD COLUMN IF NOT EXISTS slug TEXT;

-- Size-only products
ALTER TABLE public.size_only_products
  ADD COLUMN IF NOT EXISTS slug TEXT;

-- Full variant products
ALTER TABLE public.full_variant_products
  ADD COLUMN IF NOT EXISTS slug TEXT;

-- ============================================
-- STEP 2: Create indexes for fast lookups
-- ============================================

-- Simple products indexes
CREATE INDEX IF NOT EXISTS idx_simple_products_slug ON public.simple_products(slug) WHERE slug IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_simple_products_slug_unique ON public.simple_products(slug) WHERE slug IS NOT NULL;

-- Color-only products indexes
CREATE INDEX IF NOT EXISTS idx_color_only_products_slug ON public.color_only_products(slug) WHERE slug IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_color_only_products_slug_unique ON public.color_only_products(slug) WHERE slug IS NOT NULL;

-- Size-only products indexes
CREATE INDEX IF NOT EXISTS idx_size_only_products_slug ON public.size_only_products(slug) WHERE slug IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_size_only_products_slug_unique ON public.size_only_products(slug) WHERE slug IS NOT NULL;

-- Full variant products indexes
CREATE INDEX IF NOT EXISTS idx_full_variant_products_slug ON public.full_variant_products(slug) WHERE slug IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_full_variant_products_slug_unique ON public.full_variant_products(slug) WHERE slug IS NOT NULL;

-- ============================================
-- STEP 3: Create slug generation function
-- ============================================

CREATE OR REPLACE FUNCTION generate_product_slug(
  product_name TEXT,
  product_category TEXT,
  product_id UUID DEFAULT NULL
)
RETURNS TEXT AS $$
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
    SELECT EXISTS(
      SELECT 1 FROM public.simple_products WHERE slug = final_slug AND (product_id IS NULL OR id != product_id)
      UNION ALL
      SELECT 1 FROM public.color_only_products WHERE slug = final_slug AND (product_id IS NULL OR id != product_id)
      UNION ALL
      SELECT 1 FROM public.size_only_products WHERE slug = final_slug AND (product_id IS NULL OR id != product_id)
      UNION ALL
      SELECT 1 FROM public.full_variant_products WHERE slug = final_slug AND (product_id IS NULL OR id != product_id)
    ) INTO exists_check;
    
    -- If slug doesn't exist, we're done
    EXIT WHEN NOT exists_check;
    
    -- Otherwise, add counter suffix
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
    
    -- Safety check
    IF counter > 1000 THEN
      -- Use first 8 chars of UUID as fallback
      final_slug := base_slug || '-' || SUBSTRING(product_id::TEXT, 1, 8);
      EXIT;
    END IF;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- STEP 4: Generate slugs for existing products
-- ============================================

-- Simple products
UPDATE public.simple_products
SET slug = generate_product_slug(name, category, id)
WHERE slug IS NULL OR slug = ''
  AND status = 'active'
  AND name IS NOT NULL;

-- Color-only products
UPDATE public.color_only_products
SET slug = generate_product_slug(name, category, id)
WHERE slug IS NULL OR slug = ''
  AND status = 'active'
  AND name IS NOT NULL;

-- Size-only products
UPDATE public.size_only_products
SET slug = generate_product_slug(name, category, id)
WHERE slug IS NULL OR slug = ''
  AND status = 'active'
  AND name IS NOT NULL;

-- Full variant products
UPDATE public.full_variant_products
SET slug = generate_product_slug(name, category, id)
WHERE slug IS NULL OR slug = ''
  AND status = 'active'
  AND name IS NOT NULL;

-- ============================================
-- STEP 5: Update all_products_unified view to include slug
-- ============================================

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

-- ============================================
-- STEP 6: Verify migration
-- ============================================

-- Check how many products have slugs
SELECT 
  'simple_products' as table_name,
  COUNT(*) as total,
  COUNT(slug) as with_slug,
  COUNT(*) - COUNT(slug) as without_slug
FROM simple_products
WHERE status = 'active'
UNION ALL
SELECT 
  'color_only_products',
  COUNT(*),
  COUNT(slug),
  COUNT(*) - COUNT(slug)
FROM color_only_products
WHERE status = 'active'
UNION ALL
SELECT 
  'size_only_products',
  COUNT(*),
  COUNT(slug),
  COUNT(*) - COUNT(slug)
FROM size_only_products
WHERE status = 'active'
UNION ALL
SELECT 
  'full_variant_products',
  COUNT(*),
  COUNT(slug),
  COUNT(*) - COUNT(slug)
FROM full_variant_products
WHERE status = 'active';

-- View sample slugs
SELECT 
  'simple_products' as table_name,
  name,
  slug,
  category
FROM simple_products
WHERE status = 'active' AND slug IS NOT NULL
LIMIT 5
UNION ALL
SELECT 
  'color_only_products' as table_name,
  name,
  slug,
  category
FROM color_only_products
WHERE status = 'active' AND slug IS NOT NULL
LIMIT 5
UNION ALL
SELECT 
  'size_only_products' as table_name,
  name,
  slug,
  category
FROM size_only_products
WHERE status = 'active' AND slug IS NOT NULL
LIMIT 5
UNION ALL
SELECT 
  'full_variant_products' as table_name,
  name,
  slug,
  category
FROM full_variant_products
WHERE status = 'active' AND slug IS NOT NULL
LIMIT 5;

