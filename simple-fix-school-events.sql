-- Simple fix: Disable RLS on school events tables
-- Run this in Supabase SQL Editor

-- Disable RLS on all school events tables
ALTER TABLE school_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE event_products DISABLE ROW LEVEL SECURITY;
ALTER TABLE event_product_variants DISABLE ROW LEVEL SECURITY;
ALTER TABLE school_event_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE school_event_order_items DISABLE ROW LEVEL SECURITY;

-- Grant all permissions to authenticated users
GRANT ALL ON school_events TO authenticated;
GRANT ALL ON event_products TO authenticated;
GRANT ALL ON event_product_variants TO authenticated;
GRANT ALL ON school_event_orders TO authenticated;
GRANT ALL ON school_event_order_items TO authenticated;

-- Verify RLS is disabled
SELECT 
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('school_events', 'event_products', 'event_product_variants', 'school_event_orders', 'school_event_order_items');






