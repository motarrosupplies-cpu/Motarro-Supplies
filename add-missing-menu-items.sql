-- Add missing menu items (School Events and Blog) to match header menu
-- This ensures the admin menu management matches the actual header menu

-- Check and insert School Events if it doesn't exist
INSERT INTO menu_items (label, href, order_index, level, is_active, is_header, description, created_at, updated_at)
SELECT 
  'School Events', 
  '/school-events',
  6,
  0,
  true,
  false,
  'Browse school event products',
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM menu_items WHERE label = 'School Events'
);

-- Check and insert Blog if it doesn't exist
INSERT INTO menu_items (label, href, order_index, level, is_active, is_header, description, created_at, updated_at)
SELECT 
  'Blog', 
  '/blog',
  7,
  0,
  true,
  false,
  'Read our latest articles and tips',
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM menu_items WHERE label = 'Blog'
);

-- Verify the insertions
SELECT id, label, href, order_index, is_active 
FROM menu_items 
WHERE label IN ('School Events', 'Blog')
ORDER BY order_index;
