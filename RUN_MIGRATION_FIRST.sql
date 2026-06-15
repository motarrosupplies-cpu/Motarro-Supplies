-- ============================================
-- COMPLETE SLUG MIGRATION - RUN THIS FIRST
-- ============================================
-- Copy the ENTIRE supabase-slug-migration-complete.sql file
-- OR run these sections one at a time:

-- SECTION 1: Add columns (Lines 1-24)
ALTER TABLE public.simple_products ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.color_only_products ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.size_only_products ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.full_variant_products ADD COLUMN IF NOT EXISTS slug TEXT;

-- SECTION 2: Create indexes (Lines 26-43)
CREATE INDEX IF NOT EXISTS idx_simple_products_slug ON public.simple_products(slug) WHERE slug IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_simple_products_slug_unique ON public.simple_products(slug) WHERE slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_color_only_products_slug ON public.color_only_products(slug) WHERE slug IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_color_only_products_slug_unique ON public.color_only_products(slug) WHERE slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_size_only_products_slug ON public.size_only_products(slug) WHERE slug IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_size_only_products_slug_unique ON public.size_only_products(slug) WHERE slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_full_variant_products_slug ON public.full_variant_products(slug) WHERE slug IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_full_variant_products_slug_unique ON public.full_variant_products(slug) WHERE slug IS NOT NULL;

-- SECTION 3: Create function and generate slugs
-- (Copy lines 45-145 from supabase-slug-migration-complete.sql)

-- SECTION 4: Update view
-- (Copy lines 147-312 from supabase-slug-migration-complete.sql)

