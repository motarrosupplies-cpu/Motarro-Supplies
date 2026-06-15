-- ============================================
-- COMPREHENSIVE PRODUCT SLUG FIX
-- This script ensures ALL products have slugs
-- and the unified view is correct
-- ============================================

-- ============================================
-- STEP 1: Check current state
-- ============================================

-- Check if old 'products' table exists and has data
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products') THEN
        RAISE NOTICE 'Old products table exists - checking for data...';
    END IF;
END $$;

-- Count products by table and slug status
SELECT 
  'simple_products' as table_name,
  COUNT(*) as total_products,
  COUNT(slug) as with_slug,
  COUNT(*) - COUNT(slug) as missing_slug,
  COUNT(seo_slug) as with_seo_slug
FROM simple_products
WHERE status = 'active'
UNION ALL
SELECT 
  'color_only_products',
  COUNT(*),
  COUNT(slug),
  COUNT(*) - COUNT(slug),
  COUNT(seo_slug)
FROM color_only_products
WHERE status = 'active'
UNION ALL
SELECT 
  'size_only_products',
  COUNT(*),
  COUNT(slug),
  COUNT(*) - COUNT(slug),
  COUNT(seo_slug)
FROM size_only_products
WHERE status = 'active'
UNION ALL
SELECT 
  'full_variant_products',
  COUNT(*),
  COUNT(slug),
  COUNT(*) - COUNT(slug),
  COUNT(seo_slug)
FROM full_variant_products
WHERE status = 'active';

-- ============================================
-- STEP 2: Ensure slug column exists in all tables
-- ============================================

-- Add slug column if it doesn't exist
DO $$
BEGIN
    -- Simple products
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'simple_products' AND column_name = 'slug'
    ) THEN
        ALTER TABLE simple_products ADD COLUMN slug TEXT;
        RAISE NOTICE 'Added slug column to simple_products';
    END IF;

    -- Color only products
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'color_only_products' AND column_name = 'slug'
    ) THEN
        ALTER TABLE color_only_products ADD COLUMN slug TEXT;
        RAISE NOTICE 'Added slug column to color_only_products';
    END IF;

    -- Size only products
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'size_only_products' AND column_name = 'slug'
    ) THEN
        ALTER TABLE size_only_products ADD COLUMN slug TEXT;
        RAISE NOTICE 'Added slug column to size_only_products';
    END IF;

    -- Full variant products
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'full_variant_products' AND column_name = 'slug'
    ) THEN
        ALTER TABLE full_variant_products ADD COLUMN slug TEXT;
        RAISE NOTICE 'Added slug column to full_variant_products';
    END IF;
END $$;

-- ============================================
-- STEP 3: Create/Update slug generation function
-- ============================================

CREATE OR REPLACE FUNCTION generate_product_slug(product_name TEXT, product_category TEXT DEFAULT NULL, product_id TEXT DEFAULT NULL)
RETURNS TEXT AS $$
DECLARE
  slug TEXT;
  category_keyword TEXT;
BEGIN
  IF product_name IS NULL OR product_name = '' THEN
    RETURN COALESCE(product_id, '');
  END IF;

  -- Convert to lowercase
  slug := LOWER(TRIM(product_name));
  
  -- Remove special characters, keep only alphanumeric, spaces, and hyphens
  slug := REGEXP_REPLACE(slug, '[^a-z0-9\s-]', '', 'g');
  
  -- Replace multiple spaces/hyphens with single hyphen
  slug := REGEXP_REPLACE(slug, '[\s-]+', '-', 'g');
  
  -- Remove leading/trailing hyphens
  slug := TRIM(BOTH '-' FROM slug);
  
  -- Add category keyword if name is short
  IF product_category IS NOT NULL THEN
    category_keyword := '';
    IF LOWER(product_category) LIKE '%men%' THEN
      category_keyword := 'mens';
    ELSIF LOWER(product_category) LIKE '%women%' OR LOWER(product_category) LIKE '%ladies%' THEN
      category_keyword := 'ladies';
    ELSIF LOWER(product_category) LIKE '%accessor%' THEN
      category_keyword := 'accessories';
    ELSIF LOWER(product_category) LIKE '%custom%print%' THEN
      category_keyword := 'custom-printing';
    END IF;

    IF category_keyword != '' AND NOT slug LIKE '%' || category_keyword || '%' THEN
      -- Count words in slug
      IF (SELECT array_length(string_to_array(slug, '-'), 1)) < 5 THEN
        slug := category_keyword || '-' || slug;
      END IF;
    END IF;
  END IF;

  -- Add location keyword if slug is short
  IF (SELECT array_length(string_to_array(slug, '-'), 1)) < 6 AND NOT slug LIKE '%johannesburg%' THEN
    slug := slug || '-johannesburg';
  END IF;
  
  -- Limit to 200 characters
  IF LENGTH(slug) > 200 THEN
    slug := LEFT(slug, 200);
    slug := TRIM(BOTH '-' FROM slug);
  END IF;
  
  -- Fallback to ID if slug is empty
  IF slug IS NULL OR slug = '' THEN
    slug := COALESCE(product_id, '');
  END IF;
  
  RETURN slug;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- STEP 4: Generate slugs for all products missing them
-- ============================================

-- Simple products
UPDATE simple_products
SET slug = generate_product_slug(name, category, id::TEXT)
WHERE (slug IS NULL OR slug = '')
  AND status = 'active'
  AND name IS NOT NULL
  AND name != '';

-- Color only products
UPDATE color_only_products
SET slug = generate_product_slug(name, category, id::TEXT)
WHERE (slug IS NULL OR slug = '')
  AND status = 'active'
  AND name IS NOT NULL
  AND name != '';

-- Size only products
UPDATE size_only_products
SET slug = generate_product_slug(name, category, id::TEXT)
WHERE (slug IS NULL OR slug = '')
  AND status = 'active'
  AND name IS NOT NULL
  AND name != '';

-- Full variant products
UPDATE full_variant_products
SET slug = generate_product_slug(name, category, id::TEXT)
WHERE (slug IS NULL OR slug = '')
  AND status = 'active'
  AND name IS NOT NULL
  AND name != '';

-- ============================================
-- STEP 5: Handle duplicate slugs (add ID suffix)
-- ============================================

-- Simple products - fix duplicates
UPDATE simple_products sp1
SET slug = slug || '-' || SUBSTRING(sp1.id::TEXT, 1, 8)
WHERE EXISTS (
  SELECT 1 FROM simple_products sp2
  WHERE sp2.slug = sp1.slug
    AND sp2.id != sp1.id
    AND sp2.status = 'active'
)
AND sp1.status = 'active';

-- Color only products - fix duplicates
UPDATE color_only_products cp1
SET slug = slug || '-' || SUBSTRING(cp1.id::TEXT, 1, 8)
WHERE EXISTS (
  SELECT 1 FROM color_only_products cp2
  WHERE cp2.slug = cp1.slug
    AND cp2.id != cp1.id
    AND cp2.status = 'active'
)
AND cp1.status = 'active';

-- Size only products - fix duplicates
UPDATE size_only_products spz1
SET slug = slug || '-' || SUBSTRING(spz1.id::TEXT, 1, 8)
WHERE EXISTS (
  SELECT 1 FROM size_only_products spz2
  WHERE spz2.slug = spz1.slug
    AND spz2.id != spz1.id
    AND spz2.status = 'active'
)
AND spz1.status = 'active';

-- Full variant products - fix duplicates
UPDATE full_variant_products fp1
SET slug = slug || '-' || SUBSTRING(fp1.id::TEXT, 1, 8)
WHERE EXISTS (
  SELECT 1 FROM full_variant_products fp2
  WHERE fp2.slug = fp1.slug
    AND fp2.id != fp1.id
    AND fp2.status = 'active'
)
AND fp1.status = 'active';

-- ============================================
-- STEP 6: Create indexes for performance
-- ============================================

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_simple_products_slug ON simple_products(slug) WHERE slug IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_simple_products_slug_unique ON simple_products(slug) WHERE slug IS NOT NULL AND status = 'active';

CREATE INDEX IF NOT EXISTS idx_color_only_products_slug ON color_only_products(slug) WHERE slug IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_color_only_products_slug_unique ON color_only_products(slug) WHERE slug IS NOT NULL AND status = 'active';

CREATE INDEX IF NOT EXISTS idx_size_only_products_slug ON size_only_products(slug) WHERE slug IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_size_only_products_slug_unique ON size_only_products(slug) WHERE slug IS NOT NULL AND status = 'active';

CREATE INDEX IF NOT EXISTS idx_full_variant_products_slug ON full_variant_products(slug) WHERE slug IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_full_variant_products_slug_unique ON full_variant_products(slug) WHERE slug IS NOT NULL AND status = 'active';

-- ============================================
-- STEP 7: Recreate unified view with proper slug handling
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

-- Grant permissions
GRANT SELECT ON all_products_unified TO anon, authenticated;

-- ============================================
-- STEP 8: Verify final state
-- ============================================

-- Final count check
SELECT 
  'FINAL CHECK - simple_products' as table_name,
  COUNT(*) as total_products,
  COUNT(slug) as with_slug,
  COUNT(*) - COUNT(slug) as missing_slug
FROM simple_products
WHERE status = 'active'
UNION ALL
SELECT 
  'FINAL CHECK - color_only_products',
  COUNT(*),
  COUNT(slug),
  COUNT(*) - COUNT(slug)
FROM color_only_products
WHERE status = 'active'
UNION ALL
SELECT 
  'FINAL CHECK - size_only_products',
  COUNT(*),
  COUNT(slug),
  COUNT(*) - COUNT(slug)
FROM size_only_products
WHERE status = 'active'
UNION ALL
SELECT 
  'FINAL CHECK - full_variant_products',
  COUNT(*),
  COUNT(slug),
  COUNT(*) - COUNT(slug)
FROM full_variant_products
WHERE status = 'active'
UNION ALL
SELECT 
  'FINAL CHECK - all_products_unified',
  COUNT(*),
  COUNT(slug),
  COUNT(*) - COUNT(slug)
FROM all_products_unified;

-- Sample slugs from unified view
SELECT 
  id,
  name,
  slug,
  seo_slug,
  product_type,
  category
FROM all_products_unified
WHERE slug IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;

