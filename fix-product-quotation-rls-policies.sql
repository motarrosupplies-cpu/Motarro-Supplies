-- Fix RLS Policies for Products and Quotations
-- This script ensures proper Row-Level Security policies are in place
-- to allow admin operations while maintaining security

-- =====================================================
-- 1. PRODUCTS TABLES RLS POLICIES
-- =====================================================

-- Enable RLS on all product tables
ALTER TABLE IF EXISTS simple_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS color_only_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS size_only_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS full_variant_products ENABLE ROW LEVEL SECURITY;

-- Enable RLS on variant tables
ALTER TABLE IF EXISTS color_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS size_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS full_variants ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DO $$
BEGIN
  -- Simple products policies
  DROP POLICY IF EXISTS "Allow all for authenticated" ON simple_products;
  DROP POLICY IF EXISTS "Allow all for anon" ON simple_products;
  DROP POLICY IF EXISTS "Allow read for all" ON simple_products;
  
  -- Color only products policies
  DROP POLICY IF EXISTS "Allow all for authenticated" ON color_only_products;
  DROP POLICY IF EXISTS "Allow all for anon" ON color_only_products;
  DROP POLICY IF EXISTS "Allow read for all" ON color_only_products;
  
  -- Size only products policies
  DROP POLICY IF EXISTS "Allow all for authenticated" ON size_only_products;
  DROP POLICY IF EXISTS "Allow all for anon" ON size_only_products;
  DROP POLICY IF EXISTS "Allow read for all" ON size_only_products;
  
  -- Full variant products policies
  DROP POLICY IF EXISTS "Allow all for authenticated" ON full_variant_products;
  DROP POLICY IF EXISTS "Allow all for anon" ON full_variant_products;
  DROP POLICY IF EXISTS "Allow read for all" ON full_variant_products;
  
  -- Variant tables policies
  DROP POLICY IF EXISTS "Allow all for authenticated" ON color_variants;
  DROP POLICY IF EXISTS "Allow all for anon" ON color_variants;
  DROP POLICY IF EXISTS "Allow read for all" ON color_variants;
  
  DROP POLICY IF EXISTS "Allow all for authenticated" ON size_variants;
  DROP POLICY IF EXISTS "Allow all for anon" ON size_variants;
  DROP POLICY IF EXISTS "Allow read for all" ON size_variants;
  
  DROP POLICY IF EXISTS "Allow all for authenticated" ON full_variants;
  DROP POLICY IF EXISTS "Allow all for anon" ON full_variants;
  DROP POLICY IF EXISTS "Allow read for all" ON full_variants;
END $$;

-- Create permissive policies for product tables (read access for all, write for authenticated)
CREATE POLICY "Allow read for all" ON simple_products
  FOR SELECT USING (true);

CREATE POLICY "Allow write for authenticated" ON simple_products
  FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow read for all" ON color_only_products
  FOR SELECT USING (true);

CREATE POLICY "Allow write for authenticated" ON color_only_products
  FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow read for all" ON size_only_products
  FOR SELECT USING (true);

CREATE POLICY "Allow write for authenticated" ON size_only_products
  FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow read for all" ON full_variant_products
  FOR SELECT USING (true);

CREATE POLICY "Allow write for authenticated" ON full_variant_products
  FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Variant tables policies
CREATE POLICY "Allow read for all" ON color_variants
  FOR SELECT USING (true);

CREATE POLICY "Allow write for authenticated" ON color_variants
  FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow read for all" ON size_variants
  FOR SELECT USING (true);

CREATE POLICY "Allow write for authenticated" ON size_variants
  FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow read for all" ON full_variants
  FOR SELECT USING (true);

CREATE POLICY "Allow write for authenticated" ON full_variants
  FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- =====================================================
-- 2. QUOTATIONS TABLES RLS POLICIES
-- =====================================================

-- Enable RLS on quotations tables
ALTER TABLE IF EXISTS quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS quotation_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$
BEGIN
  DROP POLICY IF EXISTS "Enable all access for authenticated users" ON quotations;
  DROP POLICY IF EXISTS "Enable all access for authenticated users" ON quotation_items;
  DROP POLICY IF EXISTS "Allow all for authenticated" ON quotations;
  DROP POLICY IF EXISTS "Allow all for authenticated" ON quotation_items;
END $$;

-- Create policies for quotations
CREATE POLICY "Allow all for authenticated" ON quotations
  FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated" ON quotation_items
  FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- =====================================================
-- 3. INVOICES TABLES RLS POLICIES (for completeness)
-- =====================================================

-- Enable RLS on invoices tables
ALTER TABLE IF EXISTS invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS invoice_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$
BEGIN
  DROP POLICY IF EXISTS "Enable all access for authenticated users" ON invoices;
  DROP POLICY IF EXISTS "Enable all access for authenticated users" ON invoice_items;
  DROP POLICY IF EXISTS "Allow all for authenticated" ON invoices;
  DROP POLICY IF EXISTS "Allow all for authenticated" ON invoice_items;
END $$;

-- Create policies for invoices
CREATE POLICY "Allow all for authenticated" ON invoices
  FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated" ON invoice_items
  FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- =====================================================
-- 4. CUSTOMERS AND ADDRESSES RLS POLICIES
-- =====================================================

-- Enable RLS on customers and addresses
ALTER TABLE IF EXISTS customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS addresses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$
BEGIN
  DROP POLICY IF EXISTS "Enable all access for authenticated users" ON customers;
  DROP POLICY IF EXISTS "Enable all access for authenticated users" ON addresses;
  DROP POLICY IF EXISTS "Allow all for authenticated" ON customers;
  DROP POLICY IF EXISTS "Allow all for authenticated" ON addresses;
END $$;

-- Create policies for customers and addresses
CREATE POLICY "Allow all for authenticated" ON customers
  FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated" ON addresses
  FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- =====================================================
-- 5. GRANT PERMISSIONS
-- =====================================================

-- Grant necessary permissions to authenticated role
GRANT ALL ON TABLE simple_products TO authenticated;
GRANT ALL ON TABLE color_only_products TO authenticated;
GRANT ALL ON TABLE size_only_products TO authenticated;
GRANT ALL ON TABLE full_variant_products TO authenticated;
GRANT ALL ON TABLE color_variants TO authenticated;
GRANT ALL ON TABLE size_variants TO authenticated;
GRANT ALL ON TABLE full_variants TO authenticated;

GRANT ALL ON TABLE quotations TO authenticated;
GRANT ALL ON TABLE quotation_items TO authenticated;
GRANT ALL ON TABLE invoices TO authenticated;
GRANT ALL ON TABLE invoice_items TO authenticated;
GRANT ALL ON TABLE customers TO authenticated;
GRANT ALL ON TABLE addresses TO authenticated;

-- Grant SELECT permissions to anon role for product views (for frontend)
GRANT SELECT ON TABLE simple_products TO anon;
GRANT SELECT ON TABLE color_only_products TO anon;
GRANT SELECT ON TABLE size_only_products TO anon;
GRANT SELECT ON TABLE full_variant_products TO anon;
GRANT SELECT ON TABLE color_variants TO anon;
GRANT SELECT ON TABLE size_variants TO anon;
GRANT SELECT ON TABLE full_variants TO anon;

-- Grant usage on sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =====================================================
-- 6. VERIFY ALL_PRODUCTS_UNIFIED VIEW ACCESS
-- =====================================================

-- Ensure the view is accessible
GRANT SELECT ON all_products_unified TO authenticated;
GRANT SELECT ON all_products_unified TO anon;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check RLS status on all tables
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'simple_products',
    'color_only_products',
    'size_only_products',
    'full_variant_products',
    'color_variants',
    'size_variants',
    'full_variants',
    'quotations',
    'quotation_items',
    'invoices',
    'invoice_items',
    'customers',
    'addresses'
  )
ORDER BY tablename;

-- Check policies on all tables
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'simple_products',
    'color_only_products',
    'size_only_products',
    'full_variant_products',
    'color_variants',
    'size_variants',
    'full_variants',
    'quotations',
    'quotation_items',
    'invoices',
    'invoice_items',
    'customers',
    'addresses'
  )
ORDER BY tablename, policyname;

