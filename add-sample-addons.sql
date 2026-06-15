-- Add sample addons to existing product
-- Replace 'YOUR_PRODUCT_ID' with your actual product ID from the event_products table
-- You can find this by running: SELECT id, name FROM event_products WHERE "isActive" = true;

-- First, let's add a cap addon
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
    'YOUR_PRODUCT_ID', -- Replace with your actual product ID
    'Event Cap',
    'Custom printed cap for the school event',
    50.00,
    true,
    false,
    2,
    1
) ON CONFLICT DO NOTHING;

-- Get the ID of the inserted cap addon
DO $$
DECLARE
    cap_id TEXT;
BEGIN
    SELECT id INTO cap_id 
    FROM event_product_additional_items 
    WHERE name = 'Event Cap' 
    LIMIT 1;
    
    IF cap_id IS NOT NULL THEN
        -- Insert color options for the cap
        INSERT INTO event_product_additional_item_options (
            "additionalItemId",
            "optionName",
            "optionType",
            "priceAdjustment",
            "isActive",
            "sortOrder"
        ) VALUES 
            (cap_id, 'Red', 'color', 0.00, true, 1),
            (cap_id, 'Blue', 'color', 0.00, true, 2),
            (cap_id, 'Green', 'color', 0.00, true, 3),
            (cap_id, 'Black', 'color', 5.00, true, 4), -- Premium color with extra cost
            (cap_id, 'White', 'color', 0.00, true, 5)
        ON CONFLICT DO NOTHING;
        
        RAISE NOTICE 'Created cap addon with ID: % and 5 color options', cap_id;
    END IF;
END $$;

-- Add a badge addon
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
    'YOUR_PRODUCT_ID', -- Replace with your actual product ID
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
    WHERE name = 'Event Badge'
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
