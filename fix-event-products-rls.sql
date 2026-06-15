-- Fix RLS policies for event_products table to allow product creation
-- Run this in your Supabase SQL Editor

-- Option 1: Disable RLS temporarily (simplest fix)
ALTER TABLE event_products DISABLE ROW LEVEL SECURITY;
ALTER TABLE event_product_variants DISABLE ROW LEVEL SECURITY;

-- Grant full permissions to authenticated users
GRANT ALL PRIVILEGES ON TABLE event_products TO authenticated;
GRANT ALL PRIVILEGES ON TABLE event_product_variants TO authenticated;

-- Grant usage on sequences (for auto-incrementing IDs)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Option 2: If you prefer to keep RLS enabled, use these policies instead
-- (Uncomment the lines below and comment out Option 1 above)

-- ALTER TABLE event_products ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE event_product_variants ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Allow authenticated users to manage event products" ON event_products
--     FOR ALL USING (true) WITH CHECK (true);

-- CREATE POLICY "Allow authenticated users to manage product variants" ON event_product_variants
--     FOR ALL USING (true) WITH CHECK (true);

-- Verify the changes
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('event_products', 'event_product_variants')
ORDER BY tablename;
