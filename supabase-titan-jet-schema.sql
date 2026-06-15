-- Titan Jet WooCommerce catalog: synced products + markup rules
-- Run in Supabase SQL editor

CREATE TABLE IF NOT EXISTS public.titan_jet_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wc_product_id INTEGER NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  sku TEXT,
  name TEXT NOT NULL,
  description TEXT,
  short_description TEXT,
  category TEXT,
  categories JSONB NOT NULL DEFAULT '[]'::jsonb,
  brand TEXT,
  image TEXT,
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  attributes JSONB NOT NULL DEFAULT '[]'::jsonb,
  variants JSONB NOT NULL DEFAULT '[]'::jsonb,
  min_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  max_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total_stock INTEGER NOT NULL DEFAULT 0,
  in_stock BOOLEAN NOT NULL DEFAULT false,
  product_type TEXT NOT NULL DEFAULT 'simple',
  store_section TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
  synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_titan_jet_products_category ON public.titan_jet_products (category);
CREATE INDEX IF NOT EXISTS idx_titan_jet_products_brand ON public.titan_jet_products (brand);
CREATE INDEX IF NOT EXISTS idx_titan_jet_products_in_stock ON public.titan_jet_products (in_stock);
CREATE INDEX IF NOT EXISTS idx_titan_jet_products_store_section ON public.titan_jet_products (store_section);
CREATE INDEX IF NOT EXISTS idx_titan_jet_products_name_search ON public.titan_jet_products USING gin (to_tsvector('english', coalesce(name, '') || ' ' || coalesce(sku, '') || ' ' || coalesce(brand, '')));

CREATE TABLE IF NOT EXISTS public.titan_jet_markup_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_type TEXT NOT NULL CHECK (rule_type IN ('global', 'category', 'brand')),
  rule_value TEXT,
  markup_percent NUMERIC(8, 2) NOT NULL DEFAULT 0 CHECK (markup_percent >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (rule_type, rule_value)
);

CREATE TABLE IF NOT EXISTS public.titan_jet_sync_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status TEXT NOT NULL CHECK (status IN ('running', 'success', 'failed')),
  product_count INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at TIMESTAMPTZ
);

ALTER TABLE public.titan_jet_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.titan_jet_markup_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.titan_jet_sync_runs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read titan jet products" ON public.titan_jet_products;
CREATE POLICY "Public read titan jet products" ON public.titan_jet_products
  FOR SELECT USING (status = 'active');

DROP POLICY IF EXISTS "Public read titan jet markup" ON public.titan_jet_markup_rules;
CREATE POLICY "Public read titan jet markup" ON public.titan_jet_markup_rules
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role manages titan jet products" ON public.titan_jet_products;
CREATE POLICY "Service role manages titan jet products" ON public.titan_jet_products
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role manages titan jet markup" ON public.titan_jet_markup_rules;
CREATE POLICY "Service role manages titan jet markup" ON public.titan_jet_markup_rules
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role manages titan jet sync runs" ON public.titan_jet_sync_runs;
CREATE POLICY "Service role manages titan jet sync runs" ON public.titan_jet_sync_runs
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

GRANT SELECT ON public.titan_jet_products TO anon, authenticated;
GRANT SELECT ON public.titan_jet_markup_rules TO anon, authenticated;

INSERT INTO public.titan_jet_markup_rules (rule_type, rule_value, markup_percent)
VALUES ('global', NULL, 0)
ON CONFLICT (rule_type, rule_value) DO NOTHING;
