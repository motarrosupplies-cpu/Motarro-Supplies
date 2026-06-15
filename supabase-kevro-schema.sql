-- Kevro supplier feed: synced catalog + per-category/brand markup rules
-- Run in Supabase SQL editor

CREATE TABLE IF NOT EXISTS public.kevro_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stock_header_id INTEGER NOT NULL UNIQUE,
  stock_code TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  type TEXT,
  brand TEXT,
  image TEXT,
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  colors JSONB NOT NULL DEFAULT '[]'::jsonb,
  sizes JSONB NOT NULL DEFAULT '[]'::jsonb,
  variants JSONB NOT NULL DEFAULT '[]'::jsonb,
  min_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  max_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total_stock INTEGER NOT NULL DEFAULT 0,
  in_stock BOOLEAN NOT NULL DEFAULT false,
  garment_type TEXT,
  gender TEXT,
  store_section TEXT,
  subcategory_slug TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
  synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add new columns on existing installs BEFORE creating indexes on them
ALTER TABLE public.kevro_products ADD COLUMN IF NOT EXISTS store_section TEXT;
ALTER TABLE public.kevro_products ADD COLUMN IF NOT EXISTS subcategory_slug TEXT;

CREATE INDEX IF NOT EXISTS idx_kevro_products_category ON public.kevro_products (category);
CREATE INDEX IF NOT EXISTS idx_kevro_products_brand ON public.kevro_products (brand);
CREATE INDEX IF NOT EXISTS idx_kevro_products_in_stock ON public.kevro_products (in_stock);
CREATE INDEX IF NOT EXISTS idx_kevro_products_store_section ON public.kevro_products (store_section);
CREATE INDEX IF NOT EXISTS idx_kevro_products_subcategory_slug ON public.kevro_products (subcategory_slug);
CREATE INDEX IF NOT EXISTS idx_kevro_products_name_search ON public.kevro_products USING gin (to_tsvector('english', coalesce(name, '') || ' ' || coalesce(stock_code, '') || ' ' || coalesce(brand, '')));

CREATE TABLE IF NOT EXISTS public.kevro_markup_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_type TEXT NOT NULL CHECK (rule_type IN ('global', 'category', 'brand')),
  rule_value TEXT,
  markup_percent NUMERIC(8, 2) NOT NULL DEFAULT 0 CHECK (markup_percent >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (rule_type, rule_value)
);

CREATE TABLE IF NOT EXISTS public.kevro_sync_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status TEXT NOT NULL CHECK (status IN ('running', 'success', 'failed')),
  product_count INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at TIMESTAMPTZ
);

ALTER TABLE public.kevro_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kevro_markup_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kevro_sync_runs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read kevro products" ON public.kevro_products;
CREATE POLICY "Public read kevro products" ON public.kevro_products
  FOR SELECT USING (status = 'active');

DROP POLICY IF EXISTS "Public read kevro markup" ON public.kevro_markup_rules;
CREATE POLICY "Public read kevro markup" ON public.kevro_markup_rules
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role manages kevro products" ON public.kevro_products;
CREATE POLICY "Service role manages kevro products" ON public.kevro_products
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role manages kevro markup" ON public.kevro_markup_rules;
CREATE POLICY "Service role manages kevro markup" ON public.kevro_markup_rules
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role manages kevro sync runs" ON public.kevro_sync_runs;
CREATE POLICY "Service role manages kevro sync runs" ON public.kevro_sync_runs
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

INSERT INTO public.kevro_markup_rules (rule_type, rule_value, markup_percent)
VALUES ('global', NULL, 0)
ON CONFLICT (rule_type, rule_value) DO NOTHING;
