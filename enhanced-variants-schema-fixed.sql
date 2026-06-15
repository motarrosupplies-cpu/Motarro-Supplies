-- Enhanced Variants Schema for School Events - Fixed Version
-- This fixes the trigger function column reference issues

-- Step 1: Create the enhanced variants table
CREATE TABLE IF NOT EXISTS event_product_variants (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "productId" TEXT NOT NULL,
    size TEXT NOT NULL,
    color TEXT NOT NULL,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Create additional items table
CREATE TABLE IF NOT EXISTS event_product_additional_items (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "productId" TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    category TEXT NOT NULL,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Create additional item options table
CREATE TABLE IF NOT EXISTS event_product_additional_item_options (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "additionalItemId" TEXT NOT NULL,
    "optionName" TEXT NOT NULL,
    "optionValue" TEXT NOT NULL,
    "priceAdjustment" DECIMAL(10,2) DEFAULT 0,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Create variant-addon combinations table
CREATE TABLE IF NOT EXISTS event_product_variant_addons (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "variantId" TEXT NOT NULL,
    "additionalItemId" TEXT NOT NULL,
    "additionalItemOptionId" TEXT,
    quantity INTEGER DEFAULT 1,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 5: Add foreign key constraints (after tables are created)
ALTER TABLE event_product_variants 
ADD CONSTRAINT fk_event_product_variants_product 
FOREIGN KEY ("productId") REFERENCES event_products(id) ON DELETE CASCADE;

ALTER TABLE event_product_additional_items 
ADD CONSTRAINT fk_event_product_additional_items_product 
FOREIGN KEY ("productId") REFERENCES event_products(id) ON DELETE CASCADE;

ALTER TABLE event_product_additional_item_options 
ADD CONSTRAINT fk_event_product_additional_item_options_item 
FOREIGN KEY ("additionalItemId") REFERENCES event_product_additional_items(id) ON DELETE CASCADE;

ALTER TABLE event_product_variant_addons 
ADD CONSTRAINT fk_event_product_variant_addons_variant 
FOREIGN KEY ("variantId") REFERENCES event_product_variants(id) ON DELETE CASCADE;

ALTER TABLE event_product_variant_addons 
ADD CONSTRAINT fk_event_product_variant_addons_item 
FOREIGN KEY ("additionalItemId") REFERENCES event_product_additional_items(id) ON DELETE CASCADE;

ALTER TABLE event_product_variant_addons 
ADD CONSTRAINT fk_event_product_variant_addons_option 
FOREIGN KEY ("additionalItemOptionId") REFERENCES event_product_additional_item_options(id) ON DELETE SET NULL;

-- Step 6: Create indexes
CREATE INDEX IF NOT EXISTS idx_event_product_variants_product_id ON event_product_variants("productId");
CREATE INDEX IF NOT EXISTS idx_event_product_variants_active ON event_product_variants("isActive");
CREATE INDEX IF NOT EXISTS idx_event_product_additional_items_product_id ON event_product_additional_items("productId");
CREATE INDEX IF NOT EXISTS idx_event_product_additional_items_active ON event_product_additional_items("isActive");
CREATE INDEX IF NOT EXISTS idx_event_product_additional_item_options_item_id ON event_product_additional_item_options("additionalItemId");
CREATE INDEX IF NOT EXISTS idx_event_product_variant_addons_variant_id ON event_product_variant_addons("variantId");
CREATE INDEX IF NOT EXISTS idx_event_product_variant_addons_active ON event_product_variant_addons("isActive");

-- Step 7: Grant permissions
GRANT ALL PRIVILEGES ON TABLE event_product_variants TO authenticated;
GRANT ALL PRIVILEGES ON TABLE event_product_additional_items TO authenticated;
GRANT ALL PRIVILEGES ON TABLE event_product_additional_item_options TO authenticated;
GRANT ALL PRIVILEGES ON TABLE event_product_variant_addons TO authenticated;

-- Step 8: Disable RLS
ALTER TABLE event_product_variants DISABLE ROW LEVEL SECURITY;
ALTER TABLE event_product_additional_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE event_product_additional_item_options DISABLE ROW LEVEL SECURITY;
ALTER TABLE event_product_variant_addons DISABLE ROW LEVEL SECURITY;
