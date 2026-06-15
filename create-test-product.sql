-- SIMPLIFIED PRODUCT CREATION TEST
-- This script creates a test product with proper variants

-- Step 1: Create a test product
INSERT INTO products (
  name,
  price,
  category,
  description,
  stock,
  stock_quantity,
  is_new,
  on_sale,
  status,
  has_color_options,
  has_size_options,
  image,
  images,
  image_alt_texts,
  seo_title,
  seo_description,
  seo_keywords,
  seo_slug,
  colors,
  sizes
) VALUES (
  'Test Product - Simple',
  100,
  'men',
  'A simple test product',
  10,
  10,
  true,
  false,
  'active',
  true,
  true,
  'https://via.placeholder.com/400x400',
  '["https://via.placeholder.com/400x400"]',
  '["Test product image"]',
  'Test Product',
  'A simple test product',
  'test, product',
  'test-product',
  '[{"name":"Black","value":"#000000"}]',
  '["SML","MED","LAR","XL"]'
);

-- Step 2: Get the product ID
-- (You'll need to run this separately to get the ID)
-- SELECT id FROM products WHERE name = 'Test Product - Simple' ORDER BY created_at DESC LIMIT 1;

-- Step 3: Create variants for the test product
-- Replace 'PRODUCT_ID_HERE' with the actual product ID from step 2
INSERT INTO product_variants (
  product_id,
  color_name,
  color_value,
  size,
  stock_available,
  stock_incoming,
  stock_reserved,
  is_active,
  sort_index
) VALUES 
  ('PRODUCT_ID_HERE', 'Black', '#000000', 'SML', 2, 0, 0, true, 1),
  ('PRODUCT_ID_HERE', 'Black', '#000000', 'MED', 3, 0, 0, true, 2),
  ('PRODUCT_ID_HERE', 'Black', '#000000', 'LAR', 3, 0, 0, true, 3),
  ('PRODUCT_ID_HERE', 'Black', '#000000', 'XL', 2, 0, 0, true, 4);

-- Step 4: Verify the product and variants
SELECT 
  p.id,
  p.name,
  p.stock,
  p.has_color_options,
  p.has_size_options,
  COUNT(pv.id) as variant_count
FROM products p
LEFT JOIN product_variants pv ON p.id = pv.product_id
WHERE p.name = 'Test Product - Simple'
GROUP BY p.id, p.name, p.stock, p.has_color_options, p.has_size_options;

-- Step 5: Show variant details
SELECT 
  pv.id,
  pv.product_id,
  pv.color_name,
  pv.color_value,
  pv.size,
  pv.stock_available,
  pv.is_active
FROM product_variants pv
JOIN products p ON pv.product_id = p.id
WHERE p.name = 'Test Product - Simple'
ORDER BY pv.sort_index;
