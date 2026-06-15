-- Complete School Events System Restoration
-- Run this in your Supabase SQL Editor to restore full functionality

-- 1. Create School Events table
CREATE TABLE IF NOT EXISTS school_events (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    description TEXT,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Event Products table
CREATE TABLE IF NOT EXISTS event_products (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    event_id TEXT NOT NULL REFERENCES school_events(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    base_price DECIMAL(10,2) NOT NULL,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Event Product Variants table
CREATE TABLE IF NOT EXISTS event_product_variants (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    product_id TEXT NOT NULL REFERENCES event_products(id) ON DELETE CASCADE,
    size TEXT NOT NULL,
    color TEXT NOT NULL,
    additional_price DECIMAL(10,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create School Event Orders table
CREATE TABLE IF NOT EXISTS school_event_orders (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    event_id TEXT NOT NULL REFERENCES school_events(id) ON DELETE CASCADE,
    order_number TEXT UNIQUE NOT NULL,
    parent_name TEXT NOT NULL,
    parent_email TEXT NOT NULL,
    parent_phone TEXT NOT NULL,
    school_name TEXT NOT NULL,
    grade TEXT,
    class_name TEXT,
    total_amount DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'IN_PRODUCTION', 'READY_FOR_PICKUP', 'COMPLETED', 'CANCELLED')),
    payment_status TEXT DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'PAID', 'FAILED', 'REFUNDED')),
    payment_method TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create School Event Order Items table
CREATE TABLE IF NOT EXISTS school_event_order_items (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    order_id TEXT NOT NULL REFERENCES school_event_orders(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL REFERENCES event_products(id) ON DELETE CASCADE,
    variant_id TEXT REFERENCES event_product_variants(id) ON DELETE SET NULL,
    child_name TEXT NOT NULL,
    child_age INTEGER,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    special_instructions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_school_events_active ON school_events(is_active);
CREATE INDEX IF NOT EXISTS idx_school_events_dates ON school_events(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_event_products_event_id ON event_products(event_id);
CREATE INDEX IF NOT EXISTS idx_event_products_active ON event_products(is_active);
CREATE INDEX IF NOT EXISTS idx_event_product_variants_product_id ON event_product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_event_product_variants_active ON event_product_variants(is_active);
CREATE INDEX IF NOT EXISTS idx_school_event_orders_event_id ON school_event_orders(event_id);
CREATE INDEX IF NOT EXISTS idx_school_event_orders_order_number ON school_event_orders(order_number);
CREATE INDEX IF NOT EXISTS idx_school_event_orders_status ON school_event_orders(status);
CREATE INDEX IF NOT EXISTS idx_school_event_orders_payment_status ON school_event_orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_school_event_order_items_order_id ON school_event_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_school_event_order_items_product_id ON school_event_order_items(product_id);

-- 7. Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 8. Create triggers for updated_at
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

-- 9. Disable RLS temporarily to allow admin operations
ALTER TABLE school_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE event_products DISABLE ROW LEVEL SECURITY;
ALTER TABLE event_product_variants DISABLE ROW LEVEL SECURITY;
ALTER TABLE school_event_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE school_event_order_items DISABLE ROW LEVEL SECURITY;

-- 10. Grant full permissions to authenticated users (including admin)
GRANT ALL PRIVILEGES ON TABLE school_events TO authenticated;
GRANT ALL PRIVILEGES ON TABLE event_products TO authenticated;
GRANT ALL PRIVILEGES ON TABLE event_product_variants TO authenticated;
GRANT ALL PRIVILEGES ON TABLE school_event_orders TO authenticated;
GRANT ALL PRIVILEGES ON TABLE school_event_order_items TO authenticated;

-- 11. Grant usage on sequences (for auto-incrementing IDs)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 12. Insert a sample school event for testing
INSERT INTO school_events (name, description, start_date, end_date, is_active) 
VALUES (
    'Sample School Event 2024',
    'This is a sample school event to test the system',
    NOW() + INTERVAL '30 days',
    NOW() + INTERVAL '60 days',
    true
) ON CONFLICT DO NOTHING;

-- 13. Verify all tables were created successfully
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('school_events', 'event_products', 'event_product_variants', 'school_event_orders', 'school_event_order_items')
ORDER BY tablename;
