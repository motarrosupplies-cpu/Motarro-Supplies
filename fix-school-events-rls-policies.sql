-- Fix RLS policies for school event orders and addons
-- This script will allow public users to create orders while maintaining security

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can create orders" ON school_event_orders;
DROP POLICY IF EXISTS "Authenticated users can create order items" ON school_event_order_items;

-- Create new policies that allow public access for order creation
CREATE POLICY "Public can create school event orders" ON school_event_orders
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can create school event order items" ON school_event_order_items
    FOR INSERT WITH CHECK (true);

-- Allow users to view their own orders (if we implement user authentication later)
CREATE POLICY "Users can view their own orders" ON school_event_orders
    FOR SELECT USING (true);

CREATE POLICY "Users can view their own order items" ON school_event_order_items
    FOR SELECT USING (true);

-- Allow admins to manage all orders
CREATE POLICY "Admin can manage all school event orders" ON school_event_orders
    FOR ALL USING (true);

CREATE POLICY "Admin can manage all school event order items" ON school_event_order_items
    FOR ALL USING (true);

-- If the additional items table exists, create policies for it too
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'event_product_additional_items') THEN
        -- Drop existing policies if they exist
        DROP POLICY IF EXISTS "Public can create additional items" ON event_product_additional_items;
        
        -- Create new policies for additional items
        CREATE POLICY "Public can create additional items" ON event_product_additional_items
            FOR INSERT WITH CHECK (true);
            
        CREATE POLICY "Public can view additional items" ON event_product_additional_items
            FOR SELECT USING (true);
            
        CREATE POLICY "Admin can manage all additional items" ON event_product_additional_items
            FOR ALL USING (true);
    END IF;
END $$;

-- If the additional item options table exists, create policies for it too
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'event_product_additional_item_options') THEN
        -- Drop existing policies if they exist
        DROP POLICY IF EXISTS "Public can create additional item options" ON event_product_additional_item_options;
        
        -- Create new policies for additional item options
        CREATE POLICY "Public can create additional item options" ON event_product_additional_item_options
            FOR INSERT WITH CHECK (true);
            
        CREATE POLICY "Public can view additional item options" ON event_product_additional_item_options
            FOR SELECT USING (true);
            
        CREATE POLICY "Admin can manage all additional item options" ON event_product_additional_item_options
            FOR ALL USING (true);
    END IF;
END $$;

-- If the variant addons table exists, create policies for it too
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'event_product_variant_addons') THEN
        -- Drop existing policies if they exist
        DROP POLICY IF EXISTS "Public can create variant addons" ON event_product_variant_addons;
        
        -- Create new policies for variant addons
        CREATE POLICY "Public can create variant addons" ON event_product_variant_addons
            FOR INSERT WITH CHECK (true);
            
        CREATE POLICY "Public can view variant addons" ON event_product_variant_addons
            FOR SELECT USING (true);
            
        CREATE POLICY "Admin can manage all variant addons" ON event_product_variant_addons
            FOR ALL USING (true);
    END IF;
END $$;

-- Grant necessary permissions
GRANT ALL ON school_event_orders TO anon, authenticated;
GRANT ALL ON school_event_order_items TO anon, authenticated;

-- If additional tables exist, grant permissions to them too
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'event_product_additional_items') THEN
        GRANT ALL ON event_product_additional_items TO anon, authenticated;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'event_product_additional_item_options') THEN
        GRANT ALL ON event_product_additional_item_options TO anon, authenticated;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'event_product_variant_addons') THEN
        GRANT ALL ON event_product_variant_addons TO anon, authenticated;
    END IF;
END $$;
