-- Apply RLS policies after tables are created
-- Run this AFTER running create-addon-tables-first.sql

-- First, drop existing RLS policies if they exist
DROP POLICY IF EXISTS "Public can create school event orders" ON school_event_orders;
DROP POLICY IF EXISTS "Public can view school event orders" ON school_event_orders;
DROP POLICY IF EXISTS "Admin can manage all school event orders" ON school_event_orders;

DROP POLICY IF EXISTS "Public can create school event order items" ON school_event_order_items;
DROP POLICY IF EXISTS "Public can view school event order items" ON school_event_order_items;
DROP POLICY IF EXISTS "Admin can manage all school event order items" ON school_event_order_items;

DROP POLICY IF EXISTS "Public can view active additional items" ON event_product_additional_items;
DROP POLICY IF EXISTS "Public can create order item addons" ON school_event_order_item_addons;
DROP POLICY IF EXISTS "Public can view order item addons" ON school_event_order_item_addons;
DROP POLICY IF EXISTS "Admin can manage all additional items" ON event_product_additional_items;
DROP POLICY IF EXISTS "Admin can manage all additional item options" ON event_product_additional_item_options;
DROP POLICY IF EXISTS "Admin can manage all variant addons" ON event_product_variant_addons;
DROP POLICY IF EXISTS "Admin can manage all order item addons" ON school_event_order_item_addons;

-- Create new RLS policies for school event orders
CREATE POLICY "Public can create school event orders" ON school_event_orders
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can view school event orders" ON school_event_orders
    FOR SELECT USING (true);

CREATE POLICY "Admin can manage all school event orders" ON school_event_orders
    FOR ALL USING (true);

-- Create new RLS policies for school event order items
CREATE POLICY "Public can create school event order items" ON school_event_order_items
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can view school event order items" ON school_event_order_items
    FOR SELECT USING (true);

CREATE POLICY "Admin can manage all school event order items" ON school_event_order_items
    FOR ALL USING (true);

-- Create new RLS policies for additional items (using correct camelCase column names)
CREATE POLICY "Public can view active additional items" ON event_product_additional_items
    FOR SELECT USING ("isActive" = true);

CREATE POLICY "Public can create order item addons" ON school_event_order_item_addons
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can view order item addons" ON school_event_order_item_addons
    FOR SELECT USING (true);

CREATE POLICY "Admin can manage all additional items" ON event_product_additional_items
    FOR ALL USING (true);

CREATE POLICY "Admin can manage all additional item options" ON event_product_additional_item_options
    FOR ALL USING (true);

CREATE POLICY "Admin can manage all variant addons" ON event_product_variant_addons
    FOR ALL USING (true);

CREATE POLICY "Admin can manage all order item addons" ON school_event_order_item_addons
    FOR ALL USING (true);
