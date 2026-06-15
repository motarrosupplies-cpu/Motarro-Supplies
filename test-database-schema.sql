-- Check if all required columns exist in products table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;

-- Check if product_variants table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'product_variants';

-- Check if product_variants has required columns
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'product_variants' 
ORDER BY ordinal_position;

-- Test insert a simple product
INSERT INTO products (
  name, 
  price, 
  category, 
  description, 
  images, 
  image, 
  stock, 
  status, 
  is_new, 
  on_sale, 
  has_color_options, 
  has_size_options
) VALUES (
  'Test Product', 
  100.00, 
  'Custom Printing', 
  'Test description', 
  '["https://via.placeholder.com/400x400"]', 
  'https://via.placeholder.com/400x400', 
  10, 
  'active', 
  true, 
  false, 
  false, 
  false
) RETURNING id, name, category;
