-- Fix RLS policies for school events tables
-- This script should be run in Supabase SQL Editor

-- First, disable RLS temporarily to allow admin operations
ALTER TABLE school_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE event_products DISABLE ROW LEVEL SECURITY;
ALTER TABLE event_product_variants DISABLE ROW LEVEL SECURITY;
ALTER TABLE school_event_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE school_event_order_items DISABLE ROW LEVEL SECURITY;

-- Grant full permissions to authenticated users (including admin)
GRANT ALL PRIVILEGES ON TABLE school_events TO authenticated;
GRANT ALL PRIVILEGES ON TABLE event_products TO authenticated;
GRANT ALL PRIVILEGES ON TABLE event_product_variants TO authenticated;
GRANT ALL PRIVILEGES ON TABLE school_event_orders TO authenticated;
GRANT ALL PRIVILEGES ON TABLE school_event_order_items TO authenticated;

-- Grant usage on sequences (for auto-incrementing IDs)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- If you want to re-enable RLS later with proper policies, uncomment these:
-- ALTER TABLE school_events ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE event_products ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE event_product_variants ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE school_event_orders ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE school_event_order_items ENABLE ROW LEVEL SECURITY;

-- Create more permissive policies (uncomment if re-enabling RLS)
-- CREATE POLICY "Allow all operations for authenticated users" ON school_events
--     FOR ALL USING (true) WITH CHECK (true);

-- CREATE POLICY "Allow all operations for authenticated users" ON event_products
--     FOR ALL USING (true) WITH CHECK (true);

-- CREATE POLICY "Allow all operations for authenticated users" ON event_product_variants
--     FOR ALL USING (true) WITH CHECK (true);

-- CREATE POLICY "Allow all operations for authenticated users" ON school_event_orders
--     FOR ALL USING (true) WITH CHECK (true);

-- CREATE POLICY "Allow all operations for authenticated users" ON school_event_order_items
--     FOR ALL USING (true) WITH CHECK (true);

-- Verify the changes
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('school_events', 'event_products', 'event_product_variants', 'school_event_orders', 'school_event_order_items')
ORDER BY tablename;
