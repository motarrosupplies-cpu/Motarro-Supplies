-- Check existing menu items in the database
SELECT id, label, href, order_index, level, is_active, is_header, created_at
FROM menu_items
ORDER BY order_index;

-- Check specifically for School Events and Blog
SELECT id, label, href, order_index, is_active 
FROM menu_items 
WHERE label IN ('School Events', 'Blog');
