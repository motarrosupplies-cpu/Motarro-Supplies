-- Check product data in old products table
-- Product ID: b2a91109-c4bf-4223-b059-dd35a7158bce

SELECT 
  id,
  name,
  price,
  category,
  description,
  stock,
  has_color_options,
  has_size_options,
  colors,
  sizes,
  images,
  image,
  status,
  is_new,
  on_sale,
  seo_title,
  seo_description,
  seo_keywords,
  seo_slug,
  created_at,
  updated_at
FROM products
WHERE id = 'b2a91109-c4bf-4223-b059-dd35a7158bce';

-- Check if it has variants in the old product_variants table
SELECT 
  id,
  product_id,
  color_name,
  color_value,
  size,
  stock_available,
  stock_incoming,
  stock_reserved,
  price_override,
  is_active
FROM product_variants
WHERE product_id = 'b2a91109-c4bf-4223-b059-dd35a7158bce'
ORDER BY created_at;

