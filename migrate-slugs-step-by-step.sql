-- ============================================
-- STEP-BY-STEP SLUG MIGRATION
-- Run each section one at a time in order
-- ============================================

-- ============================================
-- STEP 1: Add slug columns to all tables
-- ============================================
-- Run this first

ALTER TABLE public.simple_products ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.color_only_products ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.size_only_products ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.full_variant_products ADD COLUMN IF NOT EXISTS slug TEXT;

-- ============================================
-- STEP 2: Create indexes
-- ============================================
-- Run this after Step 1

CREATE INDEX IF NOT EXISTS idx_simple_products_slug ON public.simple_products(slug) WHERE slug IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_simple_products_slug_unique ON public.simple_products(slug) WHERE slug IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_color_only_products_slug ON public.color_only_products(slug) WHERE slug IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_color_only_products_slug_unique ON public.color_only_products(slug) WHERE slug IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_size_only_products_slug ON public.size_only_products(slug) WHERE slug IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_size_only_products_slug_unique ON public.size_only_products(slug) WHERE slug IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_full_variant_products_slug ON public.full_variant_products(slug) WHERE slug IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_full_variant_products_slug_unique ON public.full_variant_products(slug) WHERE slug IS NOT NULL;

-- ============================================
-- STEP 3: Create slug generation function
-- ============================================
-- Run this after Step 2

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
-- Run this after Step 3

UPDATE public.simple_products
SET slug = generate_product_slug(name, category, id)
WHERE slug IS NULL OR slug = ''
  AND status = 'active'
  AND name IS NOT NULL;

UPDATE public.color_only_products
SET slug = generate_product_slug(name, category, id)
WHERE slug IS NULL OR slug = ''
  AND status = 'active'
  AND name IS NOT NULL;

UPDATE public.size_only_products
SET slug = generate_product_slug(name, category, id)
WHERE slug IS NULL OR slug = ''
  AND status = 'active'
  AND name IS NOT NULL;

UPDATE public.full_variant_products
SET slug = generate_product_slug(name, category, id)
WHERE slug IS NULL OR slug = ''
  AND status = 'active'
  AND name IS NOT NULL;

-- ============================================
-- STEP 5: Verify slugs were created
-- ============================================
-- Run this after Step 4 to check results

SELECT 
  'simple_products' as table_name,
  COUNT(*) as total,
  COUNT(slug) as with_slug
FROM simple_products
WHERE status = 'active'
UNION ALL
SELECT 
  'color_only_products',
  COUNT(*),
  COUNT(slug)
FROM color_only_products
WHERE status = 'active'
UNION ALL
SELECT 
  'size_only_products',
  COUNT(*),
  COUNT(slug)
FROM size_only_products
WHERE status = 'active'
UNION ALL
SELECT 
  'full_variant_products',
  COUNT(*),
  COUNT(slug)
FROM full_variant_products
WHERE status = 'active';

