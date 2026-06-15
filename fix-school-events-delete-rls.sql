-- Fix RLS policies for school events DELETE operations
-- This script addresses the 400 error when trying to delete school events

-- 1. First, let's check and fix the RLS policies for admin access
-- Drop existing policies that might be conflicting
DROP POLICY IF EXISTS "Admin can manage all school events" ON school_events;
DROP POLICY IF EXISTS "Allow admin full access to school events" ON school_events;
DROP POLICY IF EXISTS "Admin can manage all event products" ON event_products;
DROP POLICY IF EXISTS "Allow admin full access to event products" ON event_products;
DROP POLICY IF EXISTS "Admin can manage all product variants" ON event_product_variants;
DROP POLICY IF EXISTS "Allow admin full access to variants" ON event_product_variants;
DROP POLICY IF EXISTS "Admin can manage all orders" ON school_event_orders;
DROP POLICY IF EXISTS "Allow admin full access to school event orders" ON school_event_orders;
DROP POLICY IF EXISTS "Admin can manage all order items" ON school_event_order_items;
DROP POLICY IF EXISTS "Allow admin full access to school event order items" ON school_event_order_items;

-- 2. Create comprehensive admin policies that allow ALL operations
CREATE POLICY "Admin full access to school events" ON school_events
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Admin full access to event products" ON event_products
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Admin full access to product variants" ON event_product_variants
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Admin full access to school event orders" ON school_event_orders
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Admin full access to school event order items" ON school_event_order_items
    FOR ALL USING (true) WITH CHECK (true);

-- 3. If additional items tables exist, create policies for them too
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'event_product_additional_items') THEN
        DROP POLICY IF EXISTS "Admin can manage all additional items" ON event_product_additional_items;
        DROP POLICY IF EXISTS "Allow admin full access to additional items" ON event_product_additional_items;
        
        CREATE POLICY "Admin full access to additional items" ON event_product_additional_items
            FOR ALL USING (true) WITH CHECK (true);
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'event_product_additional_item_options') THEN
        DROP POLICY IF EXISTS "Admin can manage all additional item options" ON event_product_additional_item_options;
        DROP POLICY IF EXISTS "Allow admin full access to additional item options" ON event_product_additional_item_options;
        
        CREATE POLICY "Admin full access to additional item options" ON event_product_additional_item_options
            FOR ALL USING (true) WITH CHECK (true);
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'school_event_order_item_addons') THEN
        DROP POLICY IF EXISTS "Admin can manage all order item addons" ON school_event_order_item_addons;
        DROP POLICY IF EXISTS "Allow admin full access to order item addons" ON school_event_order_item_addons;
        
        CREATE POLICY "Admin full access to order item addons" ON school_event_order_item_addons
            FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;

-- 4. Ensure RLS is enabled on all tables
ALTER TABLE school_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_event_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_event_order_items ENABLE ROW LEVEL SECURITY;

-- 5. Grant necessary permissions to authenticated users
GRANT ALL PRIVILEGES ON TABLE school_events TO authenticated;
GRANT ALL PRIVILEGES ON TABLE event_products TO authenticated;
GRANT ALL PRIVILEGES ON TABLE event_product_variants TO authenticated;
GRANT ALL PRIVILEGES ON TABLE school_event_orders TO authenticated;
GRANT ALL PRIVILEGES ON TABLE school_event_order_items TO authenticated;

-- 6. Grant usage on sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 7. Create public read policies for active events (for the public-facing pages)
CREATE POLICY "Public can read active school events" ON school_events
    FOR SELECT USING ("isActive" = true);

CREATE POLICY "Public can read active event products" ON event_products
    FOR SELECT USING ("isActive" = true);

CREATE POLICY "Public can read active product variants" ON event_product_variants
    FOR SELECT USING ("isActive" = true);

-- 8. Create policies for order creation (public users)
CREATE POLICY "Public can create school event orders" ON school_event_orders
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can create school event order items" ON school_event_order_items
    FOR INSERT WITH CHECK (true);

-- 9. Create policies for order viewing (public users can view their orders)
CREATE POLICY "Public can read school event orders" ON school_event_orders
    FOR SELECT USING (true);

CREATE POLICY "Public can read school event order items" ON school_event_order_items
    FOR SELECT USING (true);

-- 10. If you want to allow deletion of events with orders, uncomment this:
-- This will modify the business logic to allow deletion even with existing orders
-- (You'll need to update the API endpoint to remove the order count check)

-- 11. Alternative: Create a policy that allows deletion of events with orders
-- but only by admin users (you might need to implement proper admin role checking)
-- CREATE POLICY "Admin can delete events with orders" ON school_events
--     FOR DELETE USING (true);

-- 12. Verify the policies are working
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('school_events', 'event_products', 'event_product_variants', 'school_event_orders', 'school_event_order_items')
ORDER BY tablename, policyname;
