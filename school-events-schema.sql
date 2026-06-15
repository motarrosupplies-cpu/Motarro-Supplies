-- School Events Printing System Schema
-- Run this SQL in your Supabase SQL editor

-- Create School Events table
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

-- Create Event Products table
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

-- Create Event Product Variants table
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

-- Create School Event Orders table
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

-- Create School Event Order Items table
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

-- Create indexes for better performance
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

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_school_events_updated_at BEFORE UPDATE ON school_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_event_products_updated_at BEFORE UPDATE ON event_products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_event_product_variants_updated_at BEFORE UPDATE ON event_product_variants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_school_event_orders_updated_at BEFORE UPDATE ON school_event_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_school_event_order_items_updated_at BEFORE UPDATE ON school_event_order_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE school_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_event_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_event_order_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public read access to active events and products
CREATE POLICY "Public can view active school events" ON school_events
    FOR SELECT USING (is_active = true);

CREATE POLICY "Public can view active event products" ON event_products
    FOR SELECT USING (is_active = true);

CREATE POLICY "Public can view active product variants" ON event_product_variants
    FOR SELECT USING (is_active = true);

-- Create RLS policies for authenticated users to create orders
CREATE POLICY "Authenticated users can create orders" ON school_event_orders
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can create order items" ON school_event_order_items
    FOR INSERT WITH CHECK (true);

-- Create RLS policies for admin access (you may need to adjust this based on your auth setup)
CREATE POLICY "Admin can manage all school events" ON school_events
    FOR ALL USING (true);

CREATE POLICY "Admin can manage all event products" ON event_products
    FOR ALL USING (true);

CREATE POLICY "Admin can manage all product variants" ON event_product_variants
    FOR ALL USING (true);

CREATE POLICY "Admin can manage all orders" ON school_event_orders
    FOR ALL USING (true);

CREATE POLICY "Admin can manage all order items" ON school_event_order_items
    FOR ALL USING (true);

-- Insert some sample data for testing
INSERT INTO school_events (name, description, start_date, end_date, is_active) VALUES
('Soap Box Derby 2024', 'Annual soap box derby competition with custom printed t-shirts', '2024-09-01', '2024-09-30', true),
('Choral Verse Competition', 'School choral verse competition with event hoodies', '2024-10-01', '2024-10-31', true)
ON CONFLICT DO NOTHING;

-- Insert sample products for the first event
INSERT INTO event_products (event_id, name, description, base_price, is_active) VALUES
((SELECT id FROM school_events WHERE name = 'Soap Box Derby 2024' LIMIT 1), 'Event T-Shirt', 'Custom printed t-shirt for the event', 89.99, true),
((SELECT id FROM school_events WHERE name = 'Soap Box Derby 2024' LIMIT 1), 'Event Hoodie', 'Custom printed hoodie for the event', 149.99, true)
ON CONFLICT DO NOTHING;

-- Insert sample variants for the first product
INSERT INTO event_product_variants (product_id, size, color, additional_price, is_active) VALUES
((SELECT id FROM event_products WHERE name = 'Event T-Shirt' LIMIT 1), 'S', 'White', 0.00, true),
((SELECT id FROM event_products WHERE name = 'Event T-Shirt' LIMIT 1), 'M', 'White', 0.00, true),
((SELECT id FROM event_products WHERE name = 'Event T-Shirt' LIMIT 1), 'L', 'White', 0.00, true),
((SELECT id FROM event_products WHERE name = 'Event T-Shirt' LIMIT 1), 'XL', 'White', 5.00, true),
((SELECT id FROM event_products WHERE name = 'Event T-Shirt' LIMIT 1), 'S', 'Black', 10.00, true),
((SELECT id FROM event_products WHERE name = 'Event T-Shirt' LIMIT 1), 'M', 'Black', 10.00, true),
((SELECT id FROM event_products WHERE name = 'Event T-Shirt' LIMIT 1), 'L', 'Black', 10.00, true),
((SELECT id FROM event_products WHERE name = 'Event T-Shirt' LIMIT 1), 'XL', 'Black', 15.00, true)
ON CONFLICT DO NOTHING;

-- Insert sample variants for the second product
INSERT INTO event_product_variants (product_id, size, color, additional_price, is_active) VALUES
((SELECT id FROM event_products WHERE name = 'Event Hoodie' LIMIT 1), 'S', 'Navy', 0.00, true),
((SELECT id FROM event_products WHERE name = 'Event Hoodie' LIMIT 1), 'M', 'Navy', 0.00, true),
((SELECT id FROM event_products WHERE name = 'Event Hoodie' LIMIT 1), 'L', 'Navy', 0.00, true),
((SELECT id FROM event_products WHERE name = 'Event Hoodie' LIMIT 1), 'XL', 'Navy', 10.00, true),
((SELECT id FROM event_products WHERE name = 'Event Hoodie' LIMIT 1), 'S', 'Grey', 5.00, true),
((SELECT id FROM event_products WHERE name = 'Event Hoodie' LIMIT 1), 'M', 'Grey', 5.00, true),
((SELECT id FROM event_products WHERE name = 'Event Hoodie' LIMIT 1), 'L', 'Grey', 5.00, true),
((SELECT id FROM event_products WHERE name = 'Event Hoodie' LIMIT 1), 'XL', 'Grey', 15.00, true)
ON CONFLICT DO NOTHING;

-- Insert sample products for the second event
INSERT INTO event_products (event_id, name, description, base_price, is_active) VALUES
((SELECT id FROM school_events WHERE name = 'Choral Verse Competition' LIMIT 1), 'Competition T-Shirt', 'Custom printed t-shirt for the choral verse competition', 79.99, true),
((SELECT id FROM school_events WHERE name = 'Choral Verse Competition' LIMIT 1), 'Competition Polo', 'Custom printed polo shirt for the competition', 99.99, true)
ON CONFLICT DO NOTHING;

-- Insert sample variants for the choral verse products
INSERT INTO event_product_variants (product_id, size, color, additional_price, is_active) VALUES
((SELECT id FROM event_products WHERE name = 'Competition T-Shirt' LIMIT 1), 'S', 'White', 0.00, true),
((SELECT id FROM event_products WHERE name = 'Competition T-Shirt' LIMIT 1), 'M', 'White', 0.00, true),
((SELECT id FROM event_products WHERE name = 'Competition T-Shirt' LIMIT 1), 'L', 'White', 0.00, true),
((SELECT id FROM event_products WHERE name = 'Competition T-Shirt' LIMIT 1), 'XL', 'White', 5.00, true),
((SELECT id FROM event_products WHERE name = 'Competition Polo' LIMIT 1), 'S', 'Navy', 0.00, true),
((SELECT id FROM event_products WHERE name = 'Competition Polo' LIMIT 1), 'M', 'Navy', 0.00, true),
((SELECT id FROM event_products WHERE name = 'Competition Polo' LIMIT 1), 'L', 'Navy', 0.00, true),
((SELECT id FROM event_products WHERE name = 'Competition Polo' LIMIT 1), 'XL', 'Navy', 10.00, true)
ON CONFLICT DO NOTHING;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
