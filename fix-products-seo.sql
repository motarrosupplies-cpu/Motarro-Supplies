-- Safe migration for products SEO & alt text + variants table and RLS
-- Run this in Supabase SQL Editor

-- 1) Ensure core product columns exist (non-destructive)
DO $$
BEGIN
  -- Simple fields
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'image'
  ) THEN
    ALTER TABLE products ADD COLUMN image TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'original_price'
  ) THEN
    ALTER TABLE products ADD COLUMN original_price DECIMAL(10,2);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'has_color_options'
  ) THEN
    ALTER TABLE products ADD COLUMN has_color_options BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'has_size_options'
  ) THEN
    ALTER TABLE products ADD COLUMN has_size_options BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'on_sale'
  ) THEN
    ALTER TABLE products ADD COLUMN on_sale BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'is_new'
  ) THEN
    ALTER TABLE products ADD COLUMN is_new BOOLEAN DEFAULT false;
  END IF;

  -- Images JSON (stringified in app)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'images'
  ) THEN
    ALTER TABLE products ADD COLUMN images TEXT; -- app stringifies JSON
  END IF;

  -- Optional JSON blobs used by app
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'details'
  ) THEN
    ALTER TABLE products ADD COLUMN details JSONB;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'colors'
  ) THEN
    ALTER TABLE products ADD COLUMN colors JSONB;
  END IF;

  -- SEO fields expected by API
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'seo_title'
  ) THEN
    ALTER TABLE products ADD COLUMN seo_title TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'seo_description'
  ) THEN
    ALTER TABLE products ADD COLUMN seo_description TEXT;
  END IF;

  -- Use TEXT[] for keywords as per API usage
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'seo_keywords'
  ) THEN
    ALTER TABLE products ADD COLUMN seo_keywords TEXT[];
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'seo_slug'
  ) THEN
    ALTER TABLE products ADD COLUMN seo_slug TEXT;
  END IF;

  -- Alt texts: stored as stringified JSON in app
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'image_alt_texts'
  ) THEN
    ALTER TABLE products ADD COLUMN image_alt_texts TEXT;
  END IF;

  -- Timestamps
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE products ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE products ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- Unique index for seo_slug if present and not already unique
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'seo_slug'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'products_seo_slug_key'
    ) THEN
      -- Use unique index only if no conflicting duplicates exist
      BEGIN
        CREATE UNIQUE INDEX products_seo_slug_key ON products((lower(seo_slug)));
      EXCEPTION WHEN others THEN
        -- Skip if duplicates prevent unique index
        NULL;
      END;
    END IF;
  END IF;
END $$;

-- 2) Ensure product_variants table exists with required columns
CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  color_name TEXT,
  color_value TEXT,
  size TEXT,
  sku TEXT,
  price_override DECIMAL(10,2),
  stock_available INTEGER NOT NULL DEFAULT 0,
  stock_incoming INTEGER NOT NULL DEFAULT 0,
  stock_reserved INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_index INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_product_variants_product ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON public.product_variants(sku);

-- 3) Triggers to auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_products_updated_at') THEN
    CREATE TRIGGER update_products_updated_at
      BEFORE UPDATE ON public.products
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_product_variants_updated_at') THEN
    CREATE TRIGGER update_product_variants_updated_at
      BEFORE UPDATE ON public.product_variants
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- 4) RLS + policies to prevent INSERT errors
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

-- Products policies (idempotent create)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Products allow all for authenticated'
  ) THEN
    CREATE POLICY "Products allow all for authenticated" ON public.products
      FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
  END IF;
END $$;

-- Variants policies (idempotent create)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'product_variants' AND policyname = 'Variants allow all for authenticated'
  ) THEN
    CREATE POLICY "Variants allow all for authenticated" ON public.product_variants
      FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
  END IF;
END $$;

-- 5) Grants for authenticated role (covers RPC/anon w/ auth)
GRANT ALL PRIVILEGES ON TABLE public.products TO authenticated;
GRANT ALL PRIVILEGES ON TABLE public.product_variants TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 6) Optional: backfill image from images[0] if empty (safe)
-- UPDATE public.products SET image = COALESCE(image, (jsonb_path_query_first(to_jsonb(images::json), '$[0]')::text))
-- WHERE image IS NULL AND images IS NOT NULL;
