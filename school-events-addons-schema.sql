-- School Events Addons and Accessories Schema
-- This creates tables for additional items like caps, badges, etc. with color options

-- Create Additional Items table (e.g., caps, badges, stickers)
CREATE TABLE IF NOT EXISTS event_product_additional_items (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "productId" TEXT NOT NULL REFERENCES event_products(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    "basePrice" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "isActive" BOOLEAN DEFAULT true,
    "isRequired" BOOLEAN DEFAULT false, -- Whether this addon is mandatory
    "maxQuantity" INTEGER DEFAULT 1, -- Maximum quantity allowed per order
    "sortOrder" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Additional Item Options table (e.g., colors for caps)
CREATE TABLE IF NOT EXISTS event_product_additional_item_options (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "additionalItemId" TEXT NOT NULL REFERENCES event_product_additional_items(id) ON DELETE CASCADE,
    "optionName" TEXT NOT NULL, -- e.g., "Red", "Blue", "Green"
    "optionType" TEXT NOT NULL DEFAULT 'color', -- 'color', 'size', 'style', etc.
    "priceAdjustment" DECIMAL(10,2) DEFAULT 0.00, -- Additional cost for this option
    "isActive" BOOLEAN DEFAULT true,
    "sortOrder" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Variant Addons table (links variants to additional items)
CREATE TABLE IF NOT EXISTS event_product_variant_addons (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "variantId" TEXT NOT NULL REFERENCES event_product_variants(id) ON DELETE CASCADE,
    "additionalItemId" TEXT NOT NULL REFERENCES event_product_additional_items(id) ON DELETE CASCADE,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE("variantId", "additionalItemId")
);

-- Create Order Item Addons table (stores selected addons for each order item)
CREATE TABLE IF NOT EXISTS school_event_order_item_addons (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "orderItemId" TEXT NOT NULL REFERENCES school_event_order_items(id) ON DELETE CASCADE,
    "additionalItemId" TEXT NOT NULL REFERENCES event_product_additional_items(id) ON DELETE CASCADE,
    "selectedOptionId" TEXT REFERENCES event_product_additional_item_options(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "totalPrice" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_event_product_additional_items_product_id ON event_product_additional_items("productId");
CREATE INDEX IF NOT EXISTS idx_event_product_additional_items_active ON event_product_additional_items("isActive");
CREATE INDEX IF NOT EXISTS idx_event_product_additional_item_options_item_id ON event_product_additional_item_options("additionalItemId");
CREATE INDEX IF NOT EXISTS idx_event_product_additional_item_options_active ON event_product_additional_item_options("isActive");
CREATE INDEX IF NOT EXISTS idx_event_product_variant_addons_variant_id ON event_product_variant_addons("variantId");
CREATE INDEX IF NOT EXISTS idx_event_product_variant_addons_item_id ON event_product_variant_addons("additionalItemId");
CREATE INDEX IF NOT EXISTS idx_school_event_order_item_addons_order_item_id ON school_event_order_item_addons("orderItemId");

-- Create triggers for updated_at
CREATE TRIGGER update_event_product_additional_items_updated_at 
    BEFORE UPDATE ON event_product_additional_items 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_product_additional_item_options_updated_at 
    BEFORE UPDATE ON event_product_additional_item_options 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_product_variant_addons_updated_at 
    BEFORE UPDATE ON event_product_variant_addons 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_school_event_order_item_addons_updated_at 
    BEFORE UPDATE ON school_event_order_item_addons 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE event_product_additional_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_product_additional_item_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_product_variant_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_event_order_item_addons ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public read access
CREATE POLICY "Public can view active additional items" ON event_product_additional_items
    FOR SELECT USING ("isActive" = true);

CREATE POLICY "Public can view active additional item options" ON event_product_additional_item_options
    FOR SELECT USING ("isActive" = true);

CREATE POLICY "Public can view active variant addons" ON event_product_variant_addons
    FOR SELECT USING ("isActive" = true);

-- Create RLS policies for order creation
CREATE POLICY "Public can create order item addons" ON school_event_order_item_addons
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can view order item addons" ON school_event_order_item_addons
    FOR SELECT USING (true);

-- Create RLS policies for admin access
CREATE POLICY "Admin can manage all additional items" ON event_product_additional_items
    FOR ALL USING (true);

CREATE POLICY "Admin can manage all additional item options" ON event_product_additional_item_options
    FOR ALL USING (true);

CREATE POLICY "Admin can manage all variant addons" ON event_product_variant_addons
    FOR ALL USING (true);

CREATE POLICY "Admin can manage all order item addons" ON school_event_order_item_addons
    FOR ALL USING (true);

-- Grant permissions
GRANT ALL ON event_product_additional_items TO anon, authenticated;
GRANT ALL ON event_product_additional_item_options TO anon, authenticated;
GRANT ALL ON event_product_variant_addons TO anon, authenticated;
GRANT ALL ON school_event_order_item_addons TO anon, authenticated;
