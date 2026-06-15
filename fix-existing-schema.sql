-- Fix existing school events tables to match Prisma schema
-- Run this in your Supabase SQL Editor AFTER running check-existing-schema.sql

-- 1. Add missing columns to school_events table (if they don't exist)
DO $$ 
BEGIN
    -- Add is_active column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'school_events' AND column_name = 'is_active') THEN
        ALTER TABLE school_events ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
    
    -- Add description column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'school_events' AND column_name = 'description') THEN
        ALTER TABLE school_events ADD COLUMN description TEXT;
    END IF;
    
    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'school_events' AND column_name = 'updated_at') THEN
        ALTER TABLE school_events ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- 2. Add missing columns to event_products table (if they don't exist)
DO $$ 
BEGIN
    -- Add is_active column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'event_products' AND column_name = 'is_active') THEN
        ALTER TABLE event_products ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
    
    -- Add description column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'event_products' AND column_name = 'description') THEN
        ALTER TABLE event_products ADD COLUMN description TEXT;
    END IF;
    
    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'event_products' AND column_name = 'updated_at') THEN
        ALTER TABLE event_products ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    -- Add image_url column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'event_products' AND column_name = 'image_url') THEN
        ALTER TABLE event_products ADD COLUMN image_url TEXT;
    END IF;
END $$;

-- 3. Add missing columns to event_product_variants table (if they don't exist)
DO $$ 
BEGIN
    -- Add is_active column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'event_product_variants' AND column_name = 'is_active') THEN
        ALTER TABLE event_product_variants ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
    
    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'event_product_variants' AND column_name = 'updated_at') THEN
        ALTER TABLE event_product_variants ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    -- Add additional_price column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'event_product_variants' AND column_name = 'additional_price') THEN
        ALTER TABLE event_product_variants ADD COLUMN additional_price DECIMAL(10,2) DEFAULT 0;
    END IF;
END $$;

-- 4. Add missing columns to school_event_orders table (if they don't exist)
DO $$ 
BEGIN
    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'school_event_orders' AND column_name = 'updated_at') THEN
        ALTER TABLE school_event_orders ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    -- Add notes column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'school_event_orders' AND column_name = 'notes') THEN
        ALTER TABLE school_event_orders ADD COLUMN notes TEXT;
    END IF;
    
    -- Add payment_method column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'school_event_orders' AND column_name = 'payment_method') THEN
        ALTER TABLE school_event_orders ADD COLUMN payment_method TEXT;
    END IF;
END $$;

-- 5. Add missing columns to school_event_order_items table (if they don't exist)
DO $$ 
BEGIN
    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'school_event_order_items' AND column_name = 'updated_at') THEN
        ALTER TABLE school_event_order_items ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    -- Add special_instructions column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'school_event_order_items' AND column_name = 'special_instructions') THEN
        ALTER TABLE school_event_order_items ADD COLUMN special_instructions TEXT;
    END IF;
    
    -- Add child_age column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'school_event_order_items' AND column_name = 'child_age') THEN
        ALTER TABLE school_event_order_items ADD COLUMN child_age INTEGER;
    END IF;
END $$;

-- 6. Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 7. Create triggers for updated_at (drop existing ones first to avoid conflicts)
DROP TRIGGER IF EXISTS update_school_events_updated_at ON school_events;
DROP TRIGGER IF EXISTS update_event_products_updated_at ON event_products;
DROP TRIGGER IF EXISTS update_event_product_variants_updated_at ON event_product_variants;
DROP TRIGGER IF EXISTS update_school_event_orders_updated_at ON school_event_orders;
DROP TRIGGER IF EXISTS update_school_event_order_items_updated_at ON school_event_order_items;

CREATE TRIGGER update_school_events_updated_at BEFORE UPDATE ON school_events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_products_updated_at BEFORE UPDATE ON event_products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_product_variants_updated_at BEFORE UPDATE ON event_product_variants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_school_event_orders_updated_at BEFORE UPDATE ON school_event_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_school_event_order_items_updated_at BEFORE UPDATE ON school_event_order_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. Disable RLS on all school events tables
ALTER TABLE school_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE event_products DISABLE ROW LEVEL SECURITY;
ALTER TABLE event_product_variants DISABLE ROW LEVEL SECURITY;
ALTER TABLE school_event_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE school_event_order_items DISABLE ROW LEVEL SECURITY;

-- 9. Grant full permissions to authenticated users
GRANT ALL PRIVILEGES ON TABLE school_events TO authenticated;
GRANT ALL PRIVILEGES ON TABLE event_products TO authenticated;
GRANT ALL PRIVILEGES ON TABLE event_product_variants TO authenticated;
GRANT ALL PRIVILEGES ON TABLE school_event_orders TO authenticated;
GRANT ALL PRIVILEGES ON TABLE school_event_order_items TO authenticated;

-- 10. Grant usage on sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 11. Insert a sample school event for testing (only if table is empty)
INSERT INTO school_events (name, description, start_date, end_date, is_active) 
SELECT 
    'Sample School Event 2024',
    'This is a sample school event to test the system',
    NOW() + INTERVAL '30 days',
    NOW() + INTERVAL '60 days',
    true
WHERE NOT EXISTS (SELECT 1 FROM school_events LIMIT 1);

-- 12. Verify the final structure
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('school_events', 'event_products', 'event_product_variants', 'school_event_orders', 'school_event_order_items')
ORDER BY tablename;
