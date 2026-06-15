-- Check and activate existing menu items
-- This will show all menu items and update inactive ones

-- First, check what exists
SELECT id, label, href, order_index, level, is_active, is_header 
FROM menu_items 
ORDER BY order_index;

-- If School Events or Blog exist but are inactive, activate them
UPDATE menu_items 
SET is_active = true, updated_at = NOW()
WHERE label IN ('School Events', 'Blog') AND is_active = false;

-- Check the updated state
SELECT id, label, href, order_index, is_active 
FROM menu_items 
WHERE label IN ('School Events', 'Blog');
