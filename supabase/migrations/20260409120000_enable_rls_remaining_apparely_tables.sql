-- ============================================================================
-- Enable RLS on public tables that still have it disabled (rls_disabled_in_public)
-- ============================================================================
--
-- Important:
-- - Supabase Storage (product images, files) is NOT this: bucket policies are separate.
--   This migration only affects Postgres tables; it does not delete or move assets.
-- - The service role (SUPABASE_SERVICE_ROLE_KEY) bypasses RLS, so server routes using
--   supabaseAdmin keep working.
-- - For each table: ENABLE RLS, then add policies ONLY if the table has zero policies
--   (avoids clashing with policies you already created manually).
--
-- Before running: optionally run supabase/diagnostics/list_public_tables_without_rls.sql
-- After running: Dashboard → Advisors → refresh; smoke-test storefront, admin, checkout,
--   school events, newsletter unsubscribe, QR redirect, Pinterest feed.
--
-- If menu breaks for anonymous users, ensure you also applied:
--   supabase/migrations/20250131000000_menu_rls_public_read.sql
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1) Catalog / storefront tables: anon can SELECT; logged-in admin can do all
--    (matches Pinterest / public pages using anon key + admin UI using auth)
-- ---------------------------------------------------------------------------
DO $p$
DECLARE
  t text;
  polcount int;
  catalog_tables text[] := ARRAY[
    'simple_products',
    'color_only_products',
    'size_only_products',
    'full_variant_products',
    'products',
    'product_variants',
    'ready_to_ship_products',
    'ready_to_ship_bundles',
    'flash_sales'
  ];
BEGIN
  FOREACH t IN ARRAY catalog_tables
  LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = t
    ) THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
      SELECT COUNT(*) INTO polcount FROM pg_policies WHERE schemaname = 'public' AND tablename = t;
      IF polcount = 0 THEN
        EXECUTE format(
          'CREATE POLICY "apparely_anon_select_%I" ON public.%I FOR SELECT TO anon USING (true)',
          t, t
        );
        EXECUTE format(
          'CREATE POLICY "apparely_auth_all_%I" ON public.%I FOR ALL TO authenticated USING (true) WITH CHECK (true)',
          t, t
        );
      END IF;
    END IF;
  END LOOP;
END $p$;

-- ---------------------------------------------------------------------------
-- 2) Sensitive / admin-only via logged-in user: no anon policies
--    (PayFast IPN / order APIs use service role and bypass RLS)
-- ---------------------------------------------------------------------------
DO $p$
DECLARE
  t text;
  polcount int;
  sensitive_tables text[] := ARRAY[
    'customers',
    'addresses',
    'invoices',
    'invoice_items',
    'quotations',
    'quotation_items',
    'credit_notes',
    'credit_note_items',
    'payments',
    'order_items',
    'jobs',
    'stock_updates'
  ];
BEGIN
  FOREACH t IN ARRAY sensitive_tables
  LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = t
    ) THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
      SELECT COUNT(*) INTO polcount FROM pg_policies WHERE schemaname = 'public' AND tablename = t;
      IF polcount = 0 THEN
        EXECUTE format(
          'CREATE POLICY "apparely_auth_all_%I" ON public.%I FOR ALL TO authenticated USING (true) WITH CHECK (true)',
          t, t
        );
      END IF;
    END IF;
  END LOOP;
END $p$;

-- ---------------------------------------------------------------------------
-- 3) Newsletter: public signup + unsubscribe route uses anon SELECT/UPDATE
-- ---------------------------------------------------------------------------
DO $p$
DECLARE
  polcount int;
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'newsletter_subscribers'
  ) THEN
    ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
    SELECT COUNT(*) INTO polcount FROM pg_policies WHERE schemaname = 'public' AND tablename = 'newsletter_subscribers';
    IF polcount = 0 THEN
      CREATE POLICY "apparely_newsletter_insert_public"
        ON public.newsletter_subscribers
        FOR INSERT
        TO anon, authenticated
        WITH CHECK (email IS NOT NULL AND trim(email) <> '');
      CREATE POLICY "apparely_newsletter_anon_select"
        ON public.newsletter_subscribers
        FOR SELECT
        TO anon
        USING (true);
      CREATE POLICY "apparely_newsletter_anon_update"
        ON public.newsletter_subscribers
        FOR UPDATE
        TO anon
        USING (true)
        WITH CHECK (true);
      CREATE POLICY "apparely_newsletter_auth_all"
        ON public.newsletter_subscribers
        FOR ALL
        TO authenticated
        USING (true)
        WITH CHECK (true);
    END IF;
  END IF;
END $p$;

-- ---------------------------------------------------------------------------
-- 4) QR codes: public redirect + scan tracking uses anon; admin uses auth/service
-- ---------------------------------------------------------------------------
DO $p$
DECLARE
  polcount int;
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'qr_codes'
  ) THEN
    ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;
    SELECT COUNT(*) INTO polcount FROM pg_policies WHERE schemaname = 'public' AND tablename = 'qr_codes';
    IF polcount = 0 THEN
      CREATE POLICY "apparely_qr_anon_select"
        ON public.qr_codes
        FOR SELECT
        TO anon
        USING (true);
      CREATE POLICY "apparely_qr_anon_update"
        ON public.qr_codes
        FOR UPDATE
        TO anon
        USING (true)
        WITH CHECK (true);
      CREATE POLICY "apparely_qr_auth_all"
        ON public.qr_codes
        FOR ALL
        TO authenticated
        USING (true)
        WITH CHECK (true);
    END IF;
  END IF;
END $p$;

DO $p$
DECLARE
  polcount int;
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'qr_code_scans'
  ) THEN
    ALTER TABLE public.qr_code_scans ENABLE ROW LEVEL SECURITY;
    SELECT COUNT(*) INTO polcount FROM pg_policies WHERE schemaname = 'public' AND tablename = 'qr_code_scans';
    IF polcount = 0 THEN
      CREATE POLICY "apparely_qr_scans_anon_insert"
        ON public.qr_code_scans
        FOR INSERT
        TO anon
        WITH CHECK (id IS NOT NULL);
      CREATE POLICY "apparely_qr_scans_auth_all"
        ON public.qr_code_scans
        FOR ALL
        TO authenticated
        USING (true)
        WITH CHECK (true);
    END IF;
  END IF;
END $p$;

-- ---------------------------------------------------------------------------
-- 5) Blog (if table was created without the policies from blog-posts-schema.sql)
-- ---------------------------------------------------------------------------
DO $p$
DECLARE
  polcount int;
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'blog_posts'
  ) THEN
    ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
    SELECT COUNT(*) INTO polcount FROM pg_policies WHERE schemaname = 'public' AND tablename = 'blog_posts';
    IF polcount = 0 THEN
      CREATE POLICY "apparely_blog_anon_published"
        ON public.blog_posts
        FOR SELECT
        TO anon
        USING (status = 'published');
      CREATE POLICY "apparely_blog_auth_select"
        ON public.blog_posts
        FOR SELECT
        TO authenticated
        USING (true);
      CREATE POLICY "apparely_blog_auth_insert"
        ON public.blog_posts
        FOR INSERT
        TO authenticated
        WITH CHECK (true);
      CREATE POLICY "apparely_blog_auth_update"
        ON public.blog_posts
        FOR UPDATE
        TO authenticated
        USING (true)
        WITH CHECK (true);
      CREATE POLICY "apparely_blog_auth_delete"
        ON public.blog_posts
        FOR DELETE
        TO authenticated
        USING (true);
    END IF;
  END IF;
END $p$;

-- ---------------------------------------------------------------------------
-- 6) School event add-on tables (sometimes deployed with RLS disabled)
--    CamelCase column names must match your DB (see school-events-addons-schema.sql)
-- ---------------------------------------------------------------------------
DO $p$
DECLARE
  polcount int;
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'event_product_variant_addons'
  ) THEN
    ALTER TABLE public.event_product_variant_addons ENABLE ROW LEVEL SECURITY;
    SELECT COUNT(*) INTO polcount FROM pg_policies WHERE schemaname = 'public' AND tablename = 'event_product_variant_addons';
    IF polcount = 0 THEN
      CREATE POLICY "apparely_variant_addons_anon_select"
        ON public.event_product_variant_addons
        FOR SELECT
        TO anon
        USING ("isActive" = true);
      CREATE POLICY "apparely_variant_addons_auth_all"
        ON public.event_product_variant_addons
        FOR ALL
        TO authenticated
        USING (true)
        WITH CHECK (true);
    END IF;
  END IF;
END $p$;

-- ============================================================================
-- Optional verification (uncomment to run)
-- ============================================================================
-- SELECT tablename, rowsecurity
-- FROM pg_tables
-- WHERE schemaname = 'public'
--   AND tablename IN (
--     'simple_products', 'products', 'newsletter_subscribers', 'qr_codes',
--     'event_product_variant_addons'
--   )
-- ORDER BY tablename;
