-- =============================================================================
-- MOTARRO Supplies — Fresh Supabase bootstrap (rebranded site)
-- =============================================================================
-- Run this ENTIRE script in Supabase → SQL Editor on a NEW project.
-- Project: https://supabase.com/dashboard/project/dkxvsitqxxkxtielgpxd/sql/new
--
-- After this succeeds:
--   1. Admin → Products → "Import / Sync Catalogue" (1,127 AU products)
--   2. Verify /products and /admin/menu
--
-- Safe to re-run: uses IF NOT EXISTS / DROP POLICY IF EXISTS throughout.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 0. Extensions & helpers
-- -----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE SEQUENCE IF NOT EXISTS public.invoice_number_seq START 1;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_next_invoice_number()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 'INV-' || LPAD(nextval('public.invoice_number_seq')::text, 6, '0');
$$;

-- -----------------------------------------------------------------------------
-- 1. PRODUCTS (MOTARRO catalogue — simple_products + storefront view)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.simple_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  category VARCHAR(50) NOT NULL,
  subcategory VARCHAR(100),
  stock INTEGER NOT NULL DEFAULT 0,
  is_new BOOLEAN DEFAULT false,
  on_sale BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'active',
  image VARCHAR(500),
  images JSONB DEFAULT '[]'::jsonb,
  image_alt_texts JSONB,
  seo_title VARCHAR(255),
  seo_description VARCHAR(500),
  seo_keywords TEXT,
  seo_slug VARCHAR(255),
  slug VARCHAR(255),
  availability VARCHAR(50) DEFAULT 'in_stock',
  availability_date TIMESTAMPTZ,
  condition VARCHAR(50) DEFAULT 'new',
  low_stock_threshold INTEGER DEFAULT 5,
  motarro_shopify_id BIGINT,
  motarro_shopify_handle TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.simple_products DROP CONSTRAINT IF EXISTS simple_products_category_check;

ALTER TABLE public.simple_products
  ADD COLUMN IF NOT EXISTS subcategory VARCHAR(100),
  ADD COLUMN IF NOT EXISTS slug VARCHAR(255),
  ADD COLUMN IF NOT EXISTS availability VARCHAR(50) DEFAULT 'in_stock',
  ADD COLUMN IF NOT EXISTS availability_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS condition VARCHAR(50) DEFAULT 'new',
  ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER DEFAULT 5,
  ADD COLUMN IF NOT EXISTS motarro_shopify_id BIGINT,
  ADD COLUMN IF NOT EXISTS motarro_shopify_handle TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_simple_products_motarro_shopify_id
  ON public.simple_products (motarro_shopify_id)
  WHERE motarro_shopify_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_simple_products_seo_slug
  ON public.simple_products (seo_slug)
  WHERE seo_slug IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_simple_products_category ON public.simple_products(category);
CREATE INDEX IF NOT EXISTS idx_simple_products_status ON public.simple_products(status);

DROP TRIGGER IF EXISTS update_simple_products_updated_at ON public.simple_products;
CREATE TRIGGER update_simple_products_updated_at
  BEFORE UPDATE ON public.simple_products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP VIEW IF EXISTS public.all_products_unified CASCADE;

CREATE VIEW public.all_products_unified AS
SELECT
  sp.id,
  sp.name,
  sp.description,
  sp.price,
  sp.original_price,
  sp.category,
  sp.subcategory,
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
  COALESCE(sp.seo_slug, sp.slug) AS seo_slug,
  COALESCE(sp.slug, sp.seo_slug) AS slug,
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
WHERE sp.status = 'active';

GRANT SELECT ON public.all_products_unified TO anon, authenticated, service_role;
GRANT ALL ON public.simple_products TO authenticated, service_role;
GRANT SELECT ON public.simple_products TO anon;

-- -----------------------------------------------------------------------------
-- 2. NAVIGATION & CATEGORIES (admin menu + storefront /api/menu)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label VARCHAR(255) NOT NULL,
  href VARCHAR(500),
  parent_id UUID REFERENCES public.menu_items(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_header BOOLEAN DEFAULT false,
  icon VARCHAR(100),
  description TEXT,
  filter_keywords TEXT,
  meta_title VARCHAR(255),
  meta_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.menu_items
  ADD COLUMN IF NOT EXISTS filter_keywords TEXT;

CREATE TABLE IF NOT EXISTS public.product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  parent_id UUID REFERENCES public.product_categories(id) ON DELETE CASCADE,
  level INTEGER NOT NULL DEFAULT 0,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  image_url TEXT,
  meta_title VARCHAR(255),
  meta_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.menu_category_mapping (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id UUID NOT NULL REFERENCES public.menu_items(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.product_categories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(menu_item_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_menu_items_parent_id ON public.menu_items(parent_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_active ON public.menu_items(is_active);
CREATE INDEX IF NOT EXISTS idx_product_categories_slug ON public.product_categories(slug);

DROP TRIGGER IF EXISTS update_menu_items_updated_at ON public.menu_items;
CREATE TRIGGER update_menu_items_updated_at
  BEFORE UPDATE ON public.menu_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_product_categories_updated_at ON public.product_categories;
CREATE TRIGGER update_product_categories_updated_at
  BEFORE UPDATE ON public.product_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- MOTARRO category seed (only if empty)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.product_categories LIMIT 1) THEN
    INSERT INTO public.product_categories (name, slug, description, level, order_index) VALUES
      ('Plastic', 'plastic', 'Plastic stationery and craft supplies', 0, 1),
      ('Paper & Stationery', 'paper', 'Paper products and everyday stationery', 0, 2),
      ('Wooden', 'wooden', 'Wooden letters and craft pieces', 0, 3),
      ('Metal', 'metal', 'Metal stationery and office supplies', 0, 4),
      ('Acrylic', 'acrylic', 'Acrylic craft sheets and materials', 0, 5),
      ('Tiles', 'tiles', 'Taxitiles and decorative craft tiles', 0, 6),
      ('Foam & Craft', 'foam-craft', 'EVA foam, felt, and soft craft materials', 0, 7),
      ('Art Supplies', 'art-supplies', 'Crayons, clay, paint, and art materials', 0, 8);
  END IF;
END $$;

-- MOTARRO navigation seed (only if empty — code falls back to static menu if legacy items detected)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.menu_items LIMIT 1) THEN
    INSERT INTO public.menu_items (label, href, level, order_index, is_header, is_active, description) VALUES
      ('All Products', '/products', 0, 1, false, true, 'Full MOTARRO catalogue'),
      ('Plastic', '/shop/plastic', 0, 2, false, true, 'Plastic stationery'),
      ('Paper & Stationery', '/shop/paper', 0, 3, false, true, 'Paper and stationery'),
      ('Wooden', '/shop/wooden', 0, 4, false, true, 'Wooden craft supplies'),
      ('Metal', '/shop/metal', 0, 5, false, true, 'Metal stationery'),
      ('Acrylic', '/shop/acrylic', 0, 6, false, true, 'Acrylic craft materials'),
      ('Tiles', '/shop/tiles', 0, 7, false, true, 'Taxitiles and tiles'),
      ('Foam & Craft', '/shop/foam-craft', 0, 8, false, true, 'EVA foam and craft materials'),
      ('Art Supplies', '/shop/art-supplies', 0, 9, false, true, 'Art and classroom supplies'),
      ('Blog', '/blog', 0, 10, false, true, NULL);
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 3. BLOG
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  category VARCHAR(100) NOT NULL DEFAULT 'Stationery & Craft',
  author VARCHAR(100) NOT NULL DEFAULT 'MOTARRO Supplies',
  publish_date DATE NOT NULL DEFAULT CURRENT_DATE,
  read_time VARCHAR(50) NOT NULL DEFAULT '5 min read',
  tags TEXT[] DEFAULT '{}',
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  featured BOOLEAN NOT NULL DEFAULT false,
  image_url TEXT,
  meta_title VARCHAR(255),
  meta_description TEXT,
  seo_keywords TEXT[] DEFAULT '{}',
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);

DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON public.blog_posts;
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

GRANT SELECT ON public.blog_posts TO anon, authenticated;
GRANT ALL ON public.blog_posts TO authenticated, service_role;

-- -----------------------------------------------------------------------------
-- 4. CUSTOMERS & CHECKOUT
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  company TEXT,
  vat_number TEXT,
  source TEXT DEFAULT 'website',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
  street TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  country TEXT DEFAULT 'South Africa',
  UNIQUE(customer_id)
);

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  order_number TEXT UNIQUE,
  status TEXT DEFAULT 'pending',
  total_amount DECIMAL(10,2) NOT NULL,
  shipping_cost DECIMAL(10,2) DEFAULT 0,
  discount_code TEXT,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  payment_method TEXT,
  shipping_address TEXT,
  special_instructions TEXT,
  invoice_id UUID,
  invoice_email_sent BOOLEAN DEFAULT false,
  stock_deducted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id TEXT,
  product_name TEXT NOT NULL,
  product_image TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  price_at_time DECIMAL(10,2) NOT NULL,
  selected_color_id TEXT,
  selected_color TEXT,
  selected_size_id TEXT,
  selected_size TEXT,
  custom_printing TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL,
  payment_gateway TEXT NOT NULL DEFAULT 'payfast',
  external_id TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed'
    CHECK (status IN ('pending', 'completed', 'failed', 'cancelled', 'refunded')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(external_id)
);

CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);

-- -----------------------------------------------------------------------------
-- 5. INVOICING (admin invoicing module)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT NOT NULL UNIQUE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
  order_id UUID,
  issue_date TIMESTAMPTZ DEFAULT NOW(),
  due_date TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'DRAFT'
    CHECK (status IN ('DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED')),
  subtotal DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  include_vat BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  terms TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  product_image TEXT,
  product_id TEXT
);

CREATE TABLE IF NOT EXISTS public.quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_number TEXT NOT NULL UNIQUE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
  issue_date TIMESTAMPTZ DEFAULT NOW(),
  expiry_date TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'DRAFT'
    CHECK (status IN ('DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'CONVERTED')),
  subtotal DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  include_vat BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  terms TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.quotation_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id UUID REFERENCES public.quotations(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  product_image TEXT,
  product_id TEXT
);

CREATE TABLE IF NOT EXISTS public.stock_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID,
  product_name TEXT,
  quantity_sold INTEGER,
  previous_stock INTEGER,
  new_stock INTEGER,
  invoice_id UUID,
  order_id UUID,
  date TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS order_id UUID;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS include_vat BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.quotations ADD COLUMN IF NOT EXISTS include_vat BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS invoice_id UUID;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS invoice_email_sent BOOLEAN DEFAULT false;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS stock_deducted BOOLEAN DEFAULT false;
ALTER TABLE public.stock_updates ADD COLUMN IF NOT EXISTS order_id UUID;

-- -----------------------------------------------------------------------------
-- 6. NEWSLETTER (popup + discount codes)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  discount_code TEXT,
  discount_percent INTEGER DEFAULT 10,
  code_expires_at TIMESTAMPTZ,
  code_used BOOLEAN DEFAULT false,
  code_used_at TIMESTAMPTZ,
  source TEXT DEFAULT 'website',
  is_active BOOLEAN DEFAULT true,
  email_sent BOOLEAN DEFAULT false,
  email_sent_at TIMESTAMPTZ,
  unsubscribed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_newsletter_email ON public.newsletter_subscribers(email);

-- -----------------------------------------------------------------------------
-- 7. ROW LEVEL SECURITY
-- -----------------------------------------------------------------------------
ALTER TABLE public.simple_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_category_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Storefront: public read products
DROP POLICY IF EXISTS "motarro_anon_select_simple_products" ON public.simple_products;
CREATE POLICY "motarro_anon_select_simple_products"
  ON public.simple_products FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "motarro_auth_all_simple_products" ON public.simple_products;
CREATE POLICY "motarro_auth_all_simple_products"
  ON public.simple_products FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Menu: public read active items
DROP POLICY IF EXISTS "Allow public read active menu" ON public.menu_items;
CREATE POLICY "Allow public read active menu"
  ON public.menu_items FOR SELECT TO anon, authenticated USING (is_active = true);

DROP POLICY IF EXISTS "Authenticated users manage menu_items" ON public.menu_items;
CREATE POLICY "Authenticated users manage menu_items"
  ON public.menu_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Categories
DROP POLICY IF EXISTS "Allow read for all" ON public.product_categories;
CREATE POLICY "Allow read for all"
  ON public.product_categories FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated users manage product_categories" ON public.product_categories;
CREATE POLICY "Authenticated users manage product_categories"
  ON public.product_categories FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read menu_category_mapping" ON public.menu_category_mapping;
CREATE POLICY "Allow public read menu_category_mapping"
  ON public.menu_category_mapping FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated users manage menu_category_mapping" ON public.menu_category_mapping;
CREATE POLICY "Authenticated users manage menu_category_mapping"
  ON public.menu_category_mapping FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Blog: published posts public
DROP POLICY IF EXISTS "Public can read published blog posts" ON public.blog_posts;
CREATE POLICY "Public can read published blog posts"
  ON public.blog_posts FOR SELECT TO anon USING (status = 'published');

DROP POLICY IF EXISTS "Authenticated users can read all blog posts" ON public.blog_posts;
CREATE POLICY "Authenticated users can read all blog posts"
  ON public.blog_posts FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated users manage blog posts" ON public.blog_posts;
CREATE POLICY "Authenticated users manage blog posts"
  ON public.blog_posts FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Admin / checkout tables: authenticated users (server uses service_role and bypasses RLS)
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'customers', 'addresses', 'orders', 'order_items', 'payments',
    'invoices', 'invoice_items', 'quotations', 'quotation_items', 'stock_updates'
  ]
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "motarro_auth_all_%I" ON public.%I', t, t);
    EXECUTE format(
      'CREATE POLICY "motarro_auth_all_%I" ON public.%I FOR ALL TO authenticated USING (true) WITH CHECK (true)',
      t, t
    );
  END LOOP;
END $$;

-- Newsletter signup from storefront
DROP POLICY IF EXISTS "Allow public newsletter signups" ON public.newsletter_subscribers;
CREATE POLICY "Allow public newsletter signups"
  ON public.newsletter_subscribers FOR INSERT TO anon, authenticated
  WITH CHECK (email IS NOT NULL AND trim(email) <> '');

DROP POLICY IF EXISTS "motarro_auth_all_newsletter" ON public.newsletter_subscribers;
CREATE POLICY "motarro_auth_all_newsletter"
  ON public.newsletter_subscribers FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- -----------------------------------------------------------------------------
-- 8. Done
-- -----------------------------------------------------------------------------
DO $$
BEGIN
  RAISE NOTICE 'MOTARRO bootstrap complete. Next: Admin → Products → Import / Sync Catalogue';
END $$;
