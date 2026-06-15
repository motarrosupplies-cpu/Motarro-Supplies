-- Generate Slugs for Existing Products
-- Run this AFTER verifying the migration worked
-- This will generate slugs for all products that don't have one yet

-- IMPORTANT: Run the verification queries first to make sure everything is set up correctly

-- ============================================
-- Generate slugs for simple_products
-- ============================================
UPDATE public.simple_products
SET seo_slug = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(name, '[^a-zA-Z0-9\s-]', '', 'g'), '[\s-]+', '-', 'g'))
WHERE (seo_slug IS NULL OR seo_slug = '')
  AND name IS NOT NULL;

-- Clean up any trailing hyphens
UPDATE public.simple_products
SET seo_slug = TRIM(BOTH '-' FROM seo_slug)
WHERE seo_slug LIKE '%-' OR seo_slug LIKE '-%';

-- Limit length to 200 characters
UPDATE public.simple_products
SET seo_slug = LEFT(TRIM(BOTH '-' FROM seo_slug), 200)
WHERE LENGTH(seo_slug) > 200;

-- ============================================
-- Generate slugs for color_only_products
-- ============================================
UPDATE public.color_only_products
SET seo_slug = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(name, '[^a-zA-Z0-9\s-]', '', 'g'), '[\s-]+', '-', 'g'))
WHERE (seo_slug IS NULL OR seo_slug = '')
  AND name IS NOT NULL;

UPDATE public.color_only_products
SET seo_slug = TRIM(BOTH '-' FROM seo_slug)
WHERE seo_slug LIKE '%-' OR seo_slug LIKE '-%';

UPDATE public.color_only_products
SET seo_slug = LEFT(TRIM(BOTH '-' FROM seo_slug), 200)
WHERE LENGTH(seo_slug) > 200;

-- ============================================
-- Generate slugs for size_only_products
-- ============================================
UPDATE public.size_only_products
SET seo_slug = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(name, '[^a-zA-Z0-9\s-]', '', 'g'), '[\s-]+', '-', 'g'))
WHERE (seo_slug IS NULL OR seo_slug = '')
  AND name IS NOT NULL;

UPDATE public.size_only_products
SET seo_slug = TRIM(BOTH '-' FROM seo_slug)
WHERE seo_slug LIKE '%-' OR seo_slug LIKE '-%';

UPDATE public.size_only_products
SET seo_slug = LEFT(TRIM(BOTH '-' FROM seo_slug), 200)
WHERE LENGTH(seo_slug) > 200;

-- ============================================
-- Generate slugs for full_variant_products
-- ============================================
UPDATE public.full_variant_products
SET seo_slug = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(name, '[^a-zA-Z0-9\s-]', '', 'g'), '[\s-]+', '-', 'g'))
WHERE (seo_slug IS NULL OR seo_slug = '')
  AND name IS NOT NULL;

UPDATE public.full_variant_products
SET seo_slug = TRIM(BOTH '-' FROM seo_slug)
WHERE seo_slug LIKE '%-' OR seo_slug LIKE '-%';

UPDATE public.full_variant_products
SET seo_slug = LEFT(TRIM(BOTH '-' FROM seo_slug), 200)
WHERE LENGTH(seo_slug) > 200;

-- ============================================
-- Handle duplicate slugs (add ID suffix if needed)
-- ============================================
-- This is a simple approach - for production, you might want to use the ensure_unique_slug function
-- But this will work for initial setup

-- Simple products - handle duplicates
UPDATE public.simple_products p1
SET seo_slug = p1.seo_slug || '-' || SUBSTRING(p1.id::text, 1, 8)
WHERE EXISTS (
  SELECT 1 FROM public.simple_products p2
  WHERE p2.seo_slug = p1.seo_slug
    AND p2.id != p1.id
    AND p2.id < p1.id  -- Keep first one, update others
);

-- Color-only products - handle duplicates
UPDATE public.color_only_products p1
SET seo_slug = p1.seo_slug || '-' || SUBSTRING(p1.id::text, 1, 8)
WHERE EXISTS (
  SELECT 1 FROM public.color_only_products p2
  WHERE p2.seo_slug = p1.seo_slug
    AND p2.id != p1.id
    AND p2.id < p1.id
);

-- Size-only products - handle duplicates
UPDATE public.size_only_products p1
SET seo_slug = p1.seo_slug || '-' || SUBSTRING(p1.id::text, 1, 8)
WHERE EXISTS (
  SELECT 1 FROM public.size_only_products p2
  WHERE p2.seo_slug = p1.seo_slug
    AND p2.id != p1.id
    AND p2.id < p1.id
);

-- Full variant products - handle duplicates
UPDATE public.full_variant_products p1
SET seo_slug = p1.seo_slug || '-' || SUBSTRING(p1.id::text, 1, 8)
WHERE EXISTS (
  SELECT 1 FROM public.full_variant_products p2
  WHERE p2.seo_slug = p1.seo_slug
    AND p2.id != p1.id
    AND p2.id < p1.id
);

-- ============================================
-- Verify results
-- ============================================
-- Run this to see how many products now have slugs
SELECT 
  'simple_products' as table_name,
  COUNT(*) as total_products,
  COUNT(seo_slug) as products_with_slug,
  COUNT(*) - COUNT(seo_slug) as products_without_slug
FROM public.simple_products
UNION ALL
SELECT 
  'color_only_products',
  COUNT(*),
  COUNT(seo_slug),
  COUNT(*) - COUNT(seo_slug)
FROM public.color_only_products
UNION ALL
SELECT 
  'size_only_products',
  COUNT(*),
  COUNT(seo_slug),
  COUNT(*) - COUNT(seo_slug)
FROM public.size_only_products
UNION ALL
SELECT 
  'full_variant_products',
  COUNT(*),
  COUNT(seo_slug),
  COUNT(*) - COUNT(seo_slug)
FROM public.full_variant_products;

