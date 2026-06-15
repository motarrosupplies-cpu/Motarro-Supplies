-- Enhanced Variants Schema for School Events
-- This replaces the simple variant pricing with a flexible additional items system
-- Updated to match the actual database column naming convention (camelCase + some lowercase)

-- Drop existing tables if they exist (be careful with this in production!)
-- DROP TABLE IF EXISTS event_product_variants CASCADE;

-- Create new enhanced variants table
CREATE TABLE IF NOT EXISTS event_product_variants (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    productId TEXT NOT NULL REFERENCES event_products(id) ON DELETE CASCADE, -- camelCase to match database
    size TEXT NOT NULL,
    color TEXT NOT NULL,
    isActive BOOLEAN DEFAULT true, -- camelCase to match database
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- camelCase to match database
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW() -- camelCase to match database
);

-- Create additional items table (replaces the additionalPrice concept)
CREATE TABLE IF NOT EXISTS event_product_additional_items (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    productId TEXT NOT NULL REFERENCES event_products(id) ON DELETE CASCADE, -- camelCase to match database
    name TEXT NOT NULL, -- e.g., "Cap", "Sticker", "Badge"
    description TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    category TEXT NOT NULL, -- e.g., "accessory", "addon", "upgrade"
    isActive BOOLEAN DEFAULT true, -- camelCase to match database
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- camelCase to match database
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW() -- camelCase to match database
);

-- Create additional item options table (for color/size variations of additional items)
CREATE TABLE IF NOT EXISTS event_product_additional_item_options (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    additionalItemId TEXT NOT NULL REFERENCES event_product_additional_items(id) ON DELETE CASCADE, -- camelCase to match database
    optionName TEXT NOT NULL, -- camelCase to match database
    optionValue TEXT NOT NULL, -- camelCase to match database
    priceAdjustment DECIMAL(10,2) DEFAULT 0, -- camelCase to match database
    isActive BOOLEAN DEFAULT true, -- camelCase to match database
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- camelCase to match database
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW() -- camelCase to match database
);

-- Create variant-additional item combinations table
CREATE TABLE IF NOT EXISTS event_product_variant_addons (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    variantId TEXT NOT NULL REFERENCES event_product_variants(id) ON DELETE CASCADE, -- camelCase to match database
    additionalItemId TEXT NOT NULL REFERENCES event_product_additional_items(id) ON DELETE CASCADE, -- camelCase to match database
    additionalItemOptionId TEXT REFERENCES event_product_additional_item_options(id) ON DELETE SET NULL, -- camelCase to match database
    quantity INTEGER DEFAULT 1,
    isActive BOOLEAN DEFAULT true, -- camelCase to match database
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- camelCase to match database
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW() -- camelCase to match database
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_event_product_variants_product_id ON event_product_variants("productId");
CREATE INDEX IF NOT EXISTS idx_event_product_variants_active ON event_product_variants("isActive");
CREATE INDEX IF NOT EXISTS idx_event_product_additional_items_product_id ON event_product_additional_items("productId");
CREATE INDEX IF NOT EXISTS idx_event_product_additional_items_active ON event_product_additional_items("isActive");
CREATE INDEX IF NOT EXISTS idx_event_product_additional_item_options_item_id ON event_product_additional_item_options("additionalItemId");
CREATE INDEX IF NOT EXISTS idx_event_product_variant_addons_variant_id ON event_product_variant_addons("variantId");
CREATE INDEX IF NOT EXISTS idx_event_product_variant_addons_active ON event_product_variant_addons("isActive");

-- Create updated_at trigger function (if it doesn't exist)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updatedAt
CREATE TRIGGER update_event_product_variants_updated_at 
    BEFORE UPDATE ON event_product_variants FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_product_additional_items_updated_at 
    BEFORE UPDATE ON event_product_additional_items FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_product_additional_item_options_updated_at 
    BEFORE UPDATE ON event_product_additional_item_options FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_product_variant_addons_updated_at 
    BEFORE UPDATE ON event_product_variant_addons FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL PRIVILEGES ON TABLE event_product_variants TO authenticated;
GRANT ALL PRIVILEGES ON TABLE event_product_additional_items TO authenticated;
GRANT ALL PRIVILEGES ON TABLE event_product_additional_item_options TO authenticated;
GRANT ALL PRIVILEGES ON TABLE event_product_variant_addons TO authenticated;

-- Disable RLS for these tables (or create proper policies)
ALTER TABLE event_product_variants DISABLE ROW LEVEL SECURITY;
ALTER TABLE event_product_additional_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE event_product_additional_item_options DISABLE ROW LEVEL SECURITY;
ALTER TABLE event_product_variant_addons DISABLE ROW LEVEL SECURITY;
