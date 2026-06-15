-- Sample data for school events addons system
-- This will create a cap addon with color options for testing

-- First, make sure you have a product to attach the addon to
-- You'll need to replace 'YOUR_PRODUCT_ID' with an actual product ID from your event_products table

-- Insert a sample additional item (cap)
INSERT INTO event_product_additional_items (
    "productId",
    name,
    description,
    "basePrice",
    "isActive",
    "isRequired",
    "maxQuantity",
    "sortOrder"
) VALUES (
    'YOUR_PRODUCT_ID', -- Replace with actual product ID
    'Event Cap',
    'Custom printed cap for the school event',
    50.00,
    true,
    false,
    2,
    1
) ON CONFLICT DO NOTHING;

-- Get the ID of the inserted additional item
DO $$
DECLARE
    addon_id TEXT;
BEGIN
    SELECT id INTO addon_id 
    FROM event_product_additional_items 
    WHERE name = 'Event Cap' AND "productId" = 'YOUR_PRODUCT_ID'
    LIMIT 1;
    
    IF addon_id IS NOT NULL THEN
        -- Insert color options for the cap
        INSERT INTO event_product_additional_item_options (
            "additionalItemId",
            "optionName",
            "optionType",
            "priceAdjustment",
            "isActive",
            "sortOrder"
        ) VALUES 
            (addon_id, 'Red', 'color', 0.00, true, 1),
            (addon_id, 'Blue', 'color', 0.00, true, 2),
            (addon_id, 'Green', 'color', 0.00, true, 3),
            (addon_id, 'Black', 'color', 5.00, true, 4), -- Premium color with extra cost
            (addon_id, 'White', 'color', 0.00, true, 5)
        ON CONFLICT DO NOTHING;
        
        RAISE NOTICE 'Created cap addon with ID: % and 5 color options', addon_id;
    END IF;
END $$;

-- Insert another sample addon (badge)
INSERT INTO event_product_additional_items (
    "productId",
    name,
    description,
    "basePrice",
    "isActive",
    "isRequired",
    "maxQuantity",
    "sortOrder"
) VALUES (
    'YOUR_PRODUCT_ID', -- Replace with actual product ID
    'Event Badge',
    'Custom printed badge for the school event',
    15.00,
    true,
    true, -- This one is required
    1,
    2
) ON CONFLICT DO NOTHING;

-- Get the ID of the badge addon and add options
DO $$
DECLARE
    badge_id TEXT;
BEGIN
    SELECT id INTO badge_id 
    FROM event_product_additional_items 
    WHERE name = 'Event Badge' AND "productId" = 'YOUR_PRODUCT_ID'
    LIMIT 1;
    
    IF badge_id IS NOT NULL THEN
        -- Insert badge options
        INSERT INTO event_product_additional_item_options (
            "additionalItemId",
            "optionName",
            "optionType",
            "priceAdjustment",
            "isActive",
            "sortOrder"
        ) VALUES 
            (badge_id, 'Standard', 'style', 0.00, true, 1),
            (badge_id, 'Premium', 'style', 10.00, true, 2), -- Premium style with extra cost
            (badge_id, 'Glow-in-the-dark', 'style', 15.00, true, 3) -- Special effect with extra cost
        ON CONFLICT DO NOTHING;
        
        RAISE NOTICE 'Created badge addon with ID: % and 3 style options', badge_id;
    END IF;
END $$;
