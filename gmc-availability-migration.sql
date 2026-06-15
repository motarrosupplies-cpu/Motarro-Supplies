-- Google Merchant Center Availability & Condition Migration
-- This adds GMC-compliant fields to all optimized product tables
-- Run this in Supabase SQL Editor

-- 1. Add GMC fields to simple_products
ALTER TABLE public.simple_products
  ADD COLUMN IF NOT EXISTS availability text NOT NULL DEFAULT 'in_stock'
    CHECK (availability IN ('in_stock','out_of_stock','preorder','backorder_soon')),
  ADD COLUMN IF NOT EXISTS availability_date timestamptz,
  ADD COLUMN IF NOT EXISTS condition text NOT NULL DEFAULT 'new'
    CHECK (condition IN ('new','refurbished','used')),
  ADD COLUMN IF NOT EXISTS low_stock_threshold integer NOT NULL DEFAULT 5
    CHECK (low_stock_threshold >= 0);

-- 2. Add GMC fields to color_only_products
ALTER TABLE public.color_only_products
  ADD COLUMN IF NOT EXISTS availability text NOT NULL DEFAULT 'in_stock'
    CHECK (availability IN ('in_stock','out_of_stock','preorder','backorder_soon')),
  ADD COLUMN IF NOT EXISTS availability_date timestamptz,
  ADD COLUMN IF NOT EXISTS condition text NOT NULL DEFAULT 'new'
    CHECK (condition IN ('new','refurbished','used')),
  ADD COLUMN IF NOT EXISTS low_stock_threshold integer NOT NULL DEFAULT 5
    CHECK (low_stock_threshold >= 0);

-- 3. Add GMC fields to size_only_products
ALTER TABLE public.size_only_products
  ADD COLUMN IF NOT EXISTS availability text NOT NULL DEFAULT 'in_stock'
    CHECK (availability IN ('in_stock','out_of_stock','preorder','backorder_soon')),
  ADD COLUMN IF NOT EXISTS availability_date timestamptz,
  ADD COLUMN IF NOT EXISTS condition text NOT NULL DEFAULT 'new'
    CHECK (condition IN ('new','refurbished','used')),
  ADD COLUMN IF NOT EXISTS low_stock_threshold integer NOT NULL DEFAULT 5
    CHECK (low_stock_threshold >= 0);

-- 4. Add GMC fields to full_variant_products
ALTER TABLE public.full_variant_products
  ADD COLUMN IF NOT EXISTS availability text NOT NULL DEFAULT 'in_stock'
    CHECK (availability IN ('in_stock','out_of_stock','preorder','backorder_soon')),
  ADD COLUMN IF NOT EXISTS availability_date timestamptz,
  ADD COLUMN IF NOT EXISTS condition text NOT NULL DEFAULT 'new'
    CHECK (condition IN ('new','refurbished','used')),
  ADD COLUMN IF NOT EXISTS low_stock_threshold integer NOT NULL DEFAULT 5
    CHECK (low_stock_threshold >= 0);

-- 5. Backfill availability from existing stock/total_stock
-- Simple products use 'stock' field
UPDATE public.simple_products
SET availability = CASE 
  WHEN COALESCE(stock, 0) > 0 THEN 'in_stock' 
  ELSE 'out_of_stock' 
END
WHERE availability IS NULL OR availability = 'in_stock';

-- Color-only products use 'total_stock' field
UPDATE public.color_only_products
SET availability = CASE 
  WHEN COALESCE(total_stock, 0) > 0 THEN 'in_stock' 
  ELSE 'out_of_stock' 
END
WHERE availability IS NULL OR availability = 'in_stock';

-- Size-only products use 'total_stock' field
UPDATE public.size_only_products
SET availability = CASE 
  WHEN COALESCE(total_stock, 0) > 0 THEN 'in_stock' 
  ELSE 'out_of_stock' 
END
WHERE availability IS NULL OR availability = 'in_stock';

-- Full variant products use 'total_stock' field
UPDATE public.full_variant_products
SET availability = CASE 
  WHEN COALESCE(total_stock, 0) > 0 THEN 'in_stock' 
  ELSE 'out_of_stock' 
END
WHERE availability IS NULL OR availability = 'in_stock';

-- 6. Update the all_products_unified view to include new GMC columns
-- IMPORTANT: Drop the existing view first, then recreate it with the new structure
-- This ensures all product queries return availability, condition, and related fields

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
  sp.created_at,
  sp.updated_at,
  sp.availability,
  sp.availability_date,
  sp.condition,
  sp.low_stock_threshold,
  'simple'::text AS product_type,
  FALSE AS has_color_options,
  FALSE AS has_size_options,
  NULL::jsonb AS colors,
  NULL::jsonb AS sizes
FROM public.simple_products sp
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
  cp.created_at,
  cp.updated_at,
  cp.availability,
  cp.availability_date,
  cp.condition,
  cp.low_stock_threshold,
  'color_only'::text,
  TRUE,
  FALSE,
  cp.colors,
  NULL::jsonb
FROM public.color_only_products cp
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
  spz.created_at,
  spz.updated_at,
  spz.availability,
  spz.availability_date,
  spz.condition,
  spz.low_stock_threshold,
  'size_only'::text,
  FALSE,
  TRUE,
  NULL::jsonb,
  spz.sizes
FROM public.size_only_products spz
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
  fp.created_at,
  fp.updated_at,
  fp.availability,
  fp.availability_date,
  fp.condition,
  fp.low_stock_threshold,
  'full_variant'::text,
  TRUE,
  TRUE,
  fp.colors,
  fp.sizes
FROM public.full_variant_products fp;

-- Verify the changes
SELECT 
  'simple_products' as table_name,
  COUNT(*) as total_products,
  COUNT(CASE WHEN availability = 'in_stock' THEN 1 END) as in_stock,
  COUNT(CASE WHEN availability = 'out_of_stock' THEN 1 END) as out_of_stock,
  COUNT(CASE WHEN condition = 'new' THEN 1 END) as new_condition
FROM public.simple_products
UNION ALL
SELECT 
  'color_only_products' as table_name,
  COUNT(*) as total_products,
  COUNT(CASE WHEN availability = 'in_stock' THEN 1 END) as in_stock,
  COUNT(CASE WHEN availability = 'out_of_stock' THEN 1 END) as out_of_stock,
  COUNT(CASE WHEN condition = 'new' THEN 1 END) as new_condition
FROM public.color_only_products
UNION ALL
SELECT 
  'size_only_products' as table_name,
  COUNT(*) as total_products,
  COUNT(CASE WHEN availability = 'in_stock' THEN 1 END) as in_stock,
  COUNT(CASE WHEN availability = 'out_of_stock' THEN 1 END) as out_of_stock,
  COUNT(CASE WHEN condition = 'new' THEN 1 END) as new_condition
FROM public.size_only_products
UNION ALL
SELECT 
  'full_variant_products' as table_name,
  COUNT(*) as total_products,
  COUNT(CASE WHEN availability = 'in_stock' THEN 1 END) as in_stock,
  COUNT(CASE WHEN availability = 'out_of_stock' THEN 1 END) as out_of_stock,
  COUNT(CASE WHEN condition = 'new' THEN 1 END) as new_condition
FROM public.full_variant_products;

