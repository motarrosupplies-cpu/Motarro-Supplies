-- CREATE TEST PRODUCTS FOR SYSTEMATIC TESTING
-- This script creates test products for each variant scenario

-- =====================================================
-- STEP 1: CLEAN UP EXISTING TEST PRODUCTS
-- =====================================================

-- Delete existing test products
DELETE FROM product_variants WHERE product_id IN (
  SELECT id FROM products WHERE name LIKE 'TEST_%'
);
DELETE FROM products WHERE name LIKE 'TEST_%';

-- =====================================================
-- STEP 2: CREATE SIMPLE PRODUCT (NO VARIANTS)
-- =====================================================

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
  'TEST_SIMPLE_PRODUCT',
  50.00,
  'men',
  'A simple test product with no variants',
  25,
  25,
  true,
  false,
  'active',
  false,
  false,
  'https://via.placeholder.com/400x400',
  '["https://via.placeholder.com/400x400"]',
  '["Simple test product"]',
  'Test Simple Product',
  'A simple test product with no variants',
  'test, simple',
  'test-simple-product',
  null,
  null
);

-- =====================================================
-- STEP 3: CREATE COLOR-ONLY PRODUCT
-- =====================================================

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
  'TEST_COLOR_ONLY_PRODUCT',
  75.00,
  'women',
  'A test product with color variants only',
  30,
  30,
  true,
  true,
  'active',
  true,
  false,
  'https://via.placeholder.com/400x400',
  '["https://via.placeholder.com/400x400"]',
  '["Color only test product"]',
  'Test Color Only Product',
  'A test product with color variants only',
  'test, color, variants',
  'test-color-only-product',
  '[{"name":"Black","value":"#000000"},{"name":"White","value":"#FFFFFF"},{"name":"Red","value":"#FF0000"}]',
  null
);

-- Get the color-only product ID and create variants
DO $$
DECLARE
    color_product_id UUID;
BEGIN
    SELECT id INTO color_product_id FROM products WHERE name = 'TEST_COLOR_ONLY_PRODUCT';
    
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
      (color_product_id, 'Black', '#000000', null, 10, 0, 0, true, 1),
      (color_product_id, 'White', '#FFFFFF', null, 10, 0, 0, true, 2),
      (color_product_id, 'Red', '#FF0000', null, 10, 0, 0, true, 3);
END $$;

-- =====================================================
-- STEP 4: CREATE SIZE-ONLY PRODUCT
-- =====================================================

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
  'TEST_SIZE_ONLY_PRODUCT',
  60.00,
  'accessories',
  'A test product with size variants only',
  20,
  20,
  false,
  false,
  'active',
  false,
  true,
  'https://via.placeholder.com/400x400',
  '["https://via.placeholder.com/400x400"]',
  '["Size only test product"]',
  'Test Size Only Product',
  'A test product with size variants only',
  'test, size, variants',
  'test-size-only-product',
  null,
  '["SML","MED","LAR","XL"]'
);

-- Get the size-only product ID and create variants
DO $$
DECLARE
    size_product_id UUID;
BEGIN
    SELECT id INTO size_product_id FROM products WHERE name = 'TEST_SIZE_ONLY_PRODUCT';
    
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
      (size_product_id, null, null, 'SML', 5, 0, 0, true, 1),
      (size_product_id, null, null, 'MED', 5, 0, 0, true, 2),
      (size_product_id, null, null, 'LAR', 5, 0, 0, true, 3),
      (size_product_id, null, null, 'XL', 5, 0, 0, true, 4);
END $$;

-- =====================================================
-- STEP 5: CREATE FULL VARIANT PRODUCT (COLOR + SIZE)
-- =====================================================

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
  'TEST_FULL_VARIANT_PRODUCT',
  100.00,
  'men',
  'A test product with both color and size variants',
  24,
  24,
  true,
  true,
  'active',
  true,
  true,
  'https://via.placeholder.com/400x400',
  '["https://via.placeholder.com/400x400"]',
  '["Full variant test product"]',
  'Test Full Variant Product',
  'A test product with both color and size variants',
  'test, color, size, variants',
  'test-full-variant-product',
  '[{"name":"Black","value":"#000000"},{"name":"Blue","value":"#0000FF"}]',
  '["SML","MED","LAR"]'
);

-- Get the full variant product ID and create variants
DO $$
DECLARE
    full_product_id UUID;
BEGIN
    SELECT id INTO full_product_id FROM products WHERE name = 'TEST_FULL_VARIANT_PRODUCT';
    
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
      -- Black variants
      (full_product_id, 'Black', '#000000', 'SML', 4, 0, 0, true, 1),
      (full_product_id, 'Black', '#000000', 'MED', 4, 0, 0, true, 2),
      (full_product_id, 'Black', '#000000', 'LAR', 4, 0, 0, true, 3),
      -- Blue variants
      (full_product_id, 'Blue', '#0000FF', 'SML', 4, 0, 0, true, 4),
      (full_product_id, 'Blue', '#0000FF', 'MED', 4, 0, 0, true, 5),
      (full_product_id, 'Blue', '#0000FF', 'LAR', 4, 0, 0, true, 6);
END $$;

-- =====================================================
-- STEP 6: VERIFY TEST PRODUCTS CREATED
-- =====================================================

SELECT 
  'TEST PRODUCTS CREATED' as test_type,
  p.name,
  p.category,
  p.stock,
  p.has_color_options,
  p.has_size_options,
  COUNT(pv.id) as variant_count,
  SUM(pv.stock_available) as variant_total_stock
FROM products p
LEFT JOIN product_variants pv ON p.id = pv.product_id AND pv.is_active = true
WHERE p.name LIKE 'TEST_%'
GROUP BY p.id, p.name, p.category, p.stock, p.has_color_options, p.has_size_options
ORDER BY p.name;
