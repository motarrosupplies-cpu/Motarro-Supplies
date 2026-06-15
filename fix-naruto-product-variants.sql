-- Fix Missing Variants for Naruto Product
-- This script creates the missing variants for products that have color/size options but no variants

-- First, let's check which products need variants
SELECT 
  'PRODUCTS NEEDING VARIANTS' as check_type,
  id,
  name,
  category,
  has_color_options,
  has_size_options,
  colors,
  (SELECT COUNT(*) FROM product_variants WHERE product_id = p.id) as variant_count
FROM products p
WHERE (has_color_options = true OR has_size_options = true)
  AND (SELECT COUNT(*) FROM product_variants WHERE product_id = p.id) = 0;

-- Create variants for Naruto product specifically
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
)
SELECT 
  'fb256bff-77e7-4d33-8e6b-71d122421aab' as product_id,
  'Black' as color_name,
  '#000000' as color_value,
  size_option as size,
  CASE 
    WHEN size_option = 'LAR' THEN 5
    WHEN size_option = 'XL' THEN 5
    WHEN size_option = '2XL' THEN 5
    ELSE 0
  END as stock_available,
  0 as stock_incoming,
  0 as stock_reserved,
  true as is_active,
  row_number() OVER (ORDER BY 
    CASE size_option
      WHEN 'XXS' THEN 1
      WHEN 'XS' THEN 2
      WHEN 'SML' THEN 3
      WHEN 'MED' THEN 4
      WHEN 'LAR' THEN 5
      WHEN 'XL' THEN 6
      WHEN '2XL' THEN 7
      WHEN '3XL' THEN 8
      WHEN '4XL' THEN 9
      WHEN '5XL' THEN 10
      ELSE 99
    END
  ) as sort_index
FROM (
  SELECT unnest(ARRAY['XXS','XS','SML','MED','LAR','XL','2XL','3XL','4XL','5XL']) as size_option
) sizes
WHERE NOT EXISTS (
  SELECT 1 FROM product_variants 
  WHERE product_id = 'fb256bff-77e7-4d33-8e6b-71d122421aab'
);

-- Verify the variants were created
SELECT 
  'CREATED VARIANTS' as check_type,
  id,
  product_id,
  color_name,
  color_value,
  size,
  stock_available,
  is_active,
  sort_index
FROM product_variants 
WHERE product_id = 'fb256bff-77e7-4d33-8e6b-71d122421aab'
ORDER BY sort_index;

-- Update the product's stock to match the variants
UPDATE products 
SET stock = (
  SELECT COALESCE(SUM(stock_available), 0) 
  FROM product_variants 
  WHERE product_id = 'fb256bff-77e7-4d33-8e6b-71d122421aab'
)
WHERE id = 'fb256bff-77e7-4d33-8e6b-71d122421aab';

-- Final verification
SELECT 
  'FINAL CHECK' as check_type,
  p.id,
  p.name,
  p.stock as product_stock,
  COUNT(v.id) as variant_count,
  SUM(v.stock_available) as total_variant_stock
FROM products p
LEFT JOIN product_variants v ON p.id = v.product_id
WHERE p.id = 'fb256bff-77e7-4d33-8e6b-71d122421aab'
GROUP BY p.id, p.name, p.stock;
