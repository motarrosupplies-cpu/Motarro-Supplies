-- Bulk Update Product Descriptions
-- This script finds products with short descriptions and generates SEO-friendly descriptions
-- Run this in Supabase SQL Editor

-- ============================================
-- STEP 1: Find Products Needing Descriptions
-- ============================================
-- Run this first to see which products need updates

SELECT 
  'simple_products' as table_name,
  id,
  name,
  category,
  price,
  LENGTH(COALESCE(description, '')) as current_length,
  CASE 
    WHEN LENGTH(COALESCE(description, '')) < 200 THEN 'Needs Update'
    WHEN description ILIKE '%placeholder%' THEN 'Needs Update'
    WHEN description ILIKE '%lorem%' THEN 'Needs Update'
    WHEN description IS NULL OR description = '' THEN 'Needs Update'
    ELSE 'OK'
  END as status,
  COALESCE(description, '') as current_description
FROM simple_products
WHERE status = 'active'
UNION ALL
SELECT 
  'color_only_products',
  id,
  name,
  category,
  price,
  LENGTH(COALESCE(description, '')),
  CASE 
    WHEN LENGTH(COALESCE(description, '')) < 200 THEN 'Needs Update'
    WHEN description ILIKE '%placeholder%' THEN 'Needs Update'
    WHEN description ILIKE '%lorem%' THEN 'Needs Update'
    WHEN description IS NULL OR description = '' THEN 'Needs Update'
    ELSE 'OK'
  END,
  COALESCE(description, '')
FROM color_only_products
WHERE status = 'active'
UNION ALL
SELECT 
  'size_only_products',
  id,
  name,
  category,
  price,
  LENGTH(COALESCE(description, '')),
  CASE 
    WHEN LENGTH(COALESCE(description, '')) < 200 THEN 'Needs Update'
    WHEN description ILIKE '%placeholder%' THEN 'Needs Update'
    WHEN description ILIKE '%lorem%' THEN 'Needs Update'
    WHEN description IS NULL OR description = '' THEN 'Needs Update'
    ELSE 'OK'
  END,
  COALESCE(description, '')
FROM size_only_products
WHERE status = 'active'
UNION ALL
SELECT 
  'full_variant_products',
  id,
  name,
  category,
  price,
  LENGTH(COALESCE(description, '')),
  CASE 
    WHEN LENGTH(COALESCE(description, '')) < 200 THEN 'Needs Update'
    WHEN description ILIKE '%placeholder%' THEN 'Needs Update'
    WHEN description ILIKE '%lorem%' THEN 'Needs Update'
    WHEN description IS NULL OR description = '' THEN 'Needs Update'
    ELSE 'OK'
  END,
  COALESCE(description, '')
FROM full_variant_products
WHERE status = 'active'
ORDER BY current_length ASC, table_name, name;

-- ============================================
-- STEP 2: SQL Function to Generate Descriptions
-- ============================================
-- This function generates SEO-friendly descriptions using SQL

CREATE OR REPLACE FUNCTION generate_seo_description(
  product_name TEXT,
  product_category TEXT,
  product_price DECIMAL,
  has_colors BOOLEAN DEFAULT false,
  has_sizes BOOLEAN DEFAULT false,
  color_count INTEGER DEFAULT 0,
  size_count INTEGER DEFAULT 0
)
RETURNS TEXT AS $$
DECLARE
  desc_text TEXT;
  category_lower TEXT;
  gender_text TEXT;
  variant_text TEXT;
  location_text TEXT := 'Johannesburg';
BEGIN
  -- Normalize category
  category_lower := LOWER(product_category);
  
  -- Determine gender text
  IF category_lower = 'men' OR category_lower LIKE '%men%' THEN
    gender_text := 'men''s';
  ELSIF category_lower = 'women' OR category_lower LIKE '%women%' OR category_lower LIKE '%ladies%' THEN
    gender_text := 'ladies''';
  ELSE
    gender_text := '';
  END IF;
  
  -- Build variant text
  variant_text := '';
  IF has_colors AND color_count > 0 THEN
    variant_text := variant_text || ' Available in ' || color_count::TEXT || ' stunning colour' || 
                    CASE WHEN color_count > 1 THEN 's' ELSE '' END || '.';
  END IF;
  
  IF has_sizes AND size_count > 0 THEN
    variant_text := variant_text || ' Sizes range from standard to extended sizes, ensuring the perfect fit for everyone.';
  END IF;
  
  -- Build description
  desc_text := product_name || ' - Premium ' || 
               COALESCE(NULLIF(gender_text, ''), 'custom') || ' ' ||
               CASE 
                 WHEN category_lower LIKE '%t-shirt%' OR category_lower LIKE '%tshirt%' THEN 'Custom Printed T-Shirt'
                 WHEN category_lower LIKE '%hoodie%' THEN 'Custom Printed Hoodie'
                 WHEN category_lower LIKE '%cap%' OR category_lower LIKE '%hat%' THEN 'Custom Printed Cap'
                 WHEN category_lower LIKE '%bag%' THEN 'Custom Printed Bag'
                 WHEN category_lower LIKE '%mug%' THEN 'Custom Printed Mug'
                 ELSE 'Custom Printed Apparel'
               END ||
               ' in ' || location_text || E'\n\n' ||
               
               'Looking for high-quality custom printed apparel in ' || location_text || '? Our ' || 
               product_name || ' is the perfect choice for individuals, businesses, and events seeking premium custom apparel that combines style, comfort, and durability.' ||
               E'\n\n' ||
               
               'Crafted with attention to detail, this ' || 
               COALESCE(NULLIF(gender_text, ''), 'premium') || ' ' ||
               CASE 
                 WHEN category_lower LIKE '%t-shirt%' OR category_lower LIKE '%tshirt%' THEN 't-shirt'
                 WHEN category_lower LIKE '%hoodie%' THEN 'hoodie'
                 WHEN category_lower LIKE '%cap%' OR category_lower LIKE '%hat%' THEN 'cap'
                 WHEN category_lower LIKE '%bag%' THEN 'bag'
                 WHEN category_lower LIKE '%mug%' THEN 'mug'
                 ELSE 'apparel'
               END ||
               ' features premium materials that feel comfortable while maintaining its shape wash after wash. Whether you''re ordering for a corporate event, sports team, school function, or personal use, this versatile garment delivers exceptional quality at an affordable price point.' ||
               E'\n\n' ||
               
               variant_text ||
               E'\n\n' ||
               
               'Why Choose Our Custom Apparel in ' || location_text || '?' ||
               E'\n\n' ||
               
               'As a leading custom apparel provider in ' || location_text || ' and across South Africa, we understand the importance of quality, reliability, and fast turnaround times. Our ' || 
               product_name || ' is manufactured using industry-leading techniques and premium materials, ensuring your investment in custom apparel delivers lasting value.' ||
               E'\n\n' ||
               
               'For businesses in ' || location_text || ', our custom apparel serves as powerful marketing tools. Whether you''re launching a new product, promoting your brand at events, or outfitting your team with professional uniforms, our custom printing services help you make a lasting impression.' ||
               E'\n\n' ||
               
               'Event organisers in ' || location_text || ' trust us for their custom apparel needs. From music festivals and sports tournaments to corporate conferences and school events, our products are designed to withstand the demands of active wear while maintaining a polished, professional appearance.' ||
               E'\n\n' ||
               
               'Our printing process uses eco-friendly inks and sustainable practices, making this an environmentally conscious choice for businesses and individuals committed to reducing their carbon footprint. The fabric is breathable and comfortable, keeping you comfortable even during extended wear.' ||
               E'\n\n' ||
               
               'Ordering is simple and straightforward. Choose your preferred options, upload your design or logo, and our team will handle the rest. We offer competitive pricing for bulk orders, with free shipping available on orders over a certain threshold. Our production team in ' || location_text || ' ensures fast turnaround times without compromising on quality.' ||
               E'\n\n' ||
               
               'Customer satisfaction is our top priority. We stand behind every product with a satisfaction guarantee, and our customer service team is always ready to assist with any questions or customisation requests.' ||
               E'\n\n' ||
               
               'Experience the difference that quality custom apparel makes. Order your ' || product_name || ' today and discover why businesses and individuals across ' || location_text || ' and South Africa trust Apparely for their custom printing needs.';
  
  RETURN desc_text;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- STEP 3: Bulk Update Simple Products
-- ============================================
-- Updates all simple products with short descriptions

UPDATE public.simple_products
SET 
  description = generate_seo_description(
    name,
    category,
    price,
    false, -- has_colors
    false, -- has_sizes
    0, -- color_count
    0  -- size_count
  ),
  updated_at = NOW()
WHERE status = 'active'
  AND (
    LENGTH(COALESCE(description, '')) < 200
    OR description ILIKE '%placeholder%'
    OR description ILIKE '%lorem%'
    OR description IS NULL
    OR description = ''
  );

-- ============================================
-- STEP 4: Bulk Update Color-Only Products
-- ============================================
-- Updates all color-only products with short descriptions

UPDATE public.color_only_products
SET 
  description = generate_seo_description(
    name,
    category,
    price,
    true, -- has_colors
    false, -- has_sizes
    COALESCE(jsonb_array_length(colors), 0), -- color_count
    0  -- size_count
  ),
  updated_at = NOW()
WHERE status = 'active'
  AND (
    LENGTH(COALESCE(description, '')) < 200
    OR description ILIKE '%placeholder%'
    OR description ILIKE '%lorem%'
    OR description IS NULL
    OR description = ''
  );

-- ============================================
-- STEP 5: Bulk Update Size-Only Products
-- ============================================
-- Updates all size-only products with short descriptions

UPDATE public.size_only_products
SET 
  description = generate_seo_description(
    name,
    category,
    price,
    false, -- has_colors
    true, -- has_sizes
    0, -- color_count
    COALESCE(jsonb_array_length(sizes), 0)  -- size_count
  ),
  updated_at = NOW()
WHERE status = 'active'
  AND (
    LENGTH(COALESCE(description, '')) < 200
    OR description ILIKE '%placeholder%'
    OR description ILIKE '%lorem%'
    OR description IS NULL
    OR description = ''
  );

-- ============================================
-- STEP 6: Bulk Update Full Variant Products
-- ============================================
-- Updates all full variant products with short descriptions

UPDATE public.full_variant_products
SET 
  description = generate_seo_description(
    name,
    category,
    price,
    true, -- has_colors
    true, -- has_sizes
    COALESCE(jsonb_array_length(colors), 0), -- color_count
    COALESCE(jsonb_array_length(sizes), 0)  -- size_count
  ),
  updated_at = NOW()
WHERE status = 'active'
  AND (
    LENGTH(COALESCE(description, '')) < 200
    OR description ILIKE '%placeholder%'
    OR description ILIKE '%lorem%'
    OR description IS NULL
    OR description = ''
  );

-- ============================================
-- STEP 7: Verify Updates
-- ============================================
-- Run this to see how many products were updated

SELECT 
  'simple_products' as table_name,
  COUNT(*) as total_products,
  COUNT(CASE WHEN LENGTH(COALESCE(description, '')) >= 300 THEN 1 END) as products_with_good_descriptions,
  COUNT(CASE WHEN LENGTH(COALESCE(description, '')) < 300 THEN 1 END) as products_needing_updates,
  AVG(LENGTH(COALESCE(description, '')))::INTEGER as avg_description_length
FROM simple_products
WHERE status = 'active'
UNION ALL
SELECT 
  'color_only_products',
  COUNT(*),
  COUNT(CASE WHEN LENGTH(COALESCE(description, '')) >= 300 THEN 1 END),
  COUNT(CASE WHEN LENGTH(COALESCE(description, '')) < 300 THEN 1 END),
  AVG(LENGTH(COALESCE(description, '')))::INTEGER
FROM color_only_products
WHERE status = 'active'
UNION ALL
SELECT 
  'size_only_products',
  COUNT(*),
  COUNT(CASE WHEN LENGTH(COALESCE(description, '')) >= 300 THEN 1 END),
  COUNT(CASE WHEN LENGTH(COALESCE(description, '')) < 300 THEN 1 END),
  AVG(LENGTH(COALESCE(description, '')))::INTEGER
FROM size_only_products
WHERE status = 'active'
UNION ALL
SELECT 
  'full_variant_products',
  COUNT(*),
  COUNT(CASE WHEN LENGTH(COALESCE(description, '')) >= 300 THEN 1 END),
  COUNT(CASE WHEN LENGTH(COALESCE(description, '')) < 300 THEN 1 END),
  AVG(LENGTH(COALESCE(description, '')))::INTEGER
FROM full_variant_products
WHERE status = 'active';

-- ============================================
-- STEP 8: Sample Updated Descriptions
-- ============================================
-- View a few updated descriptions to verify quality

SELECT 
  'simple_products' as table_name,
  id,
  name,
  category,
  LENGTH(description) as description_length,
  LEFT(description, 150) || '...' as description_preview
FROM simple_products
WHERE status = 'active'
  AND LENGTH(COALESCE(description, '')) >= 300
ORDER BY updated_at DESC
LIMIT 3
UNION ALL
SELECT 
  'color_only_products',
  id,
  name,
  category,
  LENGTH(description),
  LEFT(description, 150) || '...'
FROM color_only_products
WHERE status = 'active'
  AND LENGTH(COALESCE(description, '')) >= 300
ORDER BY updated_at DESC
LIMIT 3
UNION ALL
SELECT 
  'size_only_products',
  id,
  name,
  category,
  LENGTH(description),
  LEFT(description, 150) || '...'
FROM size_only_products
WHERE status = 'active'
  AND LENGTH(COALESCE(description, '')) >= 300
ORDER BY updated_at DESC
LIMIT 3
UNION ALL
SELECT 
  'full_variant_products',
  id,
  name,
  category,
  LENGTH(description),
  LEFT(description, 150) || '...'
FROM full_variant_products
WHERE status = 'active'
  AND LENGTH(COALESCE(description, '')) >= 300
ORDER BY updated_at DESC
LIMIT 3;

