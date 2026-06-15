-- Example SQL for Updating Product Descriptions
-- Use this as a template after generating descriptions with the TypeScript templates
-- 
-- IMPORTANT: Replace the description text with your generated description
-- IMPORTANT: Replace the product ID with actual product UUIDs
-- IMPORTANT: Escape single quotes by doubling them (' becomes '')

-- ============================================
-- Example 1: Update Simple Product
-- ============================================
UPDATE public.simple_products
SET 
  description = 'Premium Cotton T-Shirt - Men''s Custom Printed T-Shirt in Johannesburg

Looking for high-quality custom printed t-shirts in Johannesburg? Our Premium Cotton T-Shirt is the perfect choice for individuals, businesses, and events seeking premium custom apparel that combines style, comfort, and durability.

Crafted with attention to detail, this men''s t-shirt features 100% premium cotton fabric that feels soft against your skin while maintaining its shape wash after wash. Whether you''re ordering for a corporate event, sports team, school function, or personal use, this versatile garment delivers exceptional quality at an affordable price point.

Available in multiple stunning colour options, each carefully selected to ensure vibrant, long-lasting prints that won''t fade or crack over time. Our advanced printing techniques, including sublimation and direct-to-garment (DTG) printing, ensure your custom designs, logos, or text appear crisp and professional.

Sizes range from S to 2XL, ensuring the perfect fit for everyone. Our size guide helps you find the perfect fit, and we offer custom sizing options for bulk orders. The relaxed fit design ensures comfort throughout the day, making it ideal for casual wear, team uniforms, promotional events, or branded corporate clothing.

Why Choose Our Custom T-Shirts in Johannesburg?

As a leading custom apparel provider in Johannesburg and across South Africa, we understand the importance of quality, reliability, and fast turnaround times. Our Premium Cotton T-Shirt is manufactured using industry-leading techniques and premium materials, ensuring your investment in custom apparel delivers lasting value.

For businesses in Johannesburg, our custom t-shirts serve as powerful marketing tools. Whether you''re launching a new product, promoting your brand at events, or outfitting your team with professional uniforms, our custom printing services help you make a lasting impression.

Event organisers in Johannesburg trust us for their custom apparel needs. From music festivals and sports tournaments to corporate conferences and school events, our t-shirts are designed to withstand the demands of active wear while maintaining a polished, professional appearance.

Our printing process uses eco-friendly inks and sustainable practices, making this an environmentally conscious choice for businesses and individuals committed to reducing their carbon footprint. The fabric is breathable and moisture-wicking, keeping you comfortable even during extended wear.

Ordering is simple and straightforward. Choose your preferred colour and size, upload your design or logo, and our team will handle the rest. We offer competitive pricing for bulk orders, with free shipping available on orders over a certain threshold. Our production team in Johannesburg ensures fast turnaround times without compromising on quality.

Customer satisfaction is our top priority. We stand behind every product with a satisfaction guarantee, and our customer service team is always ready to assist with any questions or customisation requests.

Experience the difference that quality custom apparel makes. Order your Premium Cotton T-Shirt today and discover why businesses and individuals across Johannesburg and South Africa trust Apparely for their custom printing needs.',
  updated_at = NOW()
WHERE id = 'YOUR-PRODUCT-UUID-HERE'
  AND status = 'active';

-- ============================================
-- Example 2: Update Color-Only Product
-- ============================================
UPDATE public.color_only_products
SET 
  description = 'Your generated description here (300-600 words)...',
  updated_at = NOW()
WHERE id = 'YOUR-PRODUCT-UUID-HERE'
  AND status = 'active';

-- ============================================
-- Example 3: Update Size-Only Product
-- ============================================
UPDATE public.size_only_products
SET 
  description = 'Your generated description here (300-600 words)...',
  updated_at = NOW()
WHERE id = 'YOUR-PRODUCT-UUID-HERE'
  AND status = 'active';

-- ============================================
-- Example 4: Update Full Variant Product
-- ============================================
UPDATE public.full_variant_products
SET 
  description = 'Your generated description here (300-600 words)...',
  updated_at = NOW()
WHERE id = 'YOUR-PRODUCT-UUID-HERE'
  AND status = 'active';

-- ============================================
-- Bulk Update: Find Products Needing Descriptions
-- ============================================
-- Run this first to see which products need updates
SELECT 
  'simple_products' as table_name,
  id,
  name,
  category,
  LENGTH(description) as current_length,
  CASE 
    WHEN LENGTH(description) < 200 THEN 'Needs Update'
    WHEN description ILIKE '%placeholder%' THEN 'Needs Update'
    WHEN description ILIKE '%lorem%' THEN 'Needs Update'
    ELSE 'OK'
  END as status
FROM simple_products
WHERE status = 'active'
UNION ALL
SELECT 
  'color_only_products',
  id,
  name,
  category,
  LENGTH(description),
  CASE 
    WHEN LENGTH(description) < 200 THEN 'Needs Update'
    WHEN description ILIKE '%placeholder%' THEN 'Needs Update'
    WHEN description ILIKE '%lorem%' THEN 'Needs Update'
    ELSE 'OK'
  END
FROM color_only_products
WHERE status = 'active'
UNION ALL
SELECT 
  'size_only_products',
  id,
  name,
  category,
  LENGTH(description),
  CASE 
    WHEN LENGTH(description) < 200 THEN 'Needs Update'
    WHEN description ILIKE '%placeholder%' THEN 'Needs Update'
    WHEN description ILIKE '%lorem%' THEN 'Needs Update'
    ELSE 'OK'
  END
FROM size_only_products
WHERE status = 'active'
UNION ALL
SELECT 
  'full_variant_products',
  id,
  name,
  category,
  LENGTH(description),
  CASE 
    WHEN LENGTH(description) < 200 THEN 'Needs Update'
    WHEN description ILIKE '%placeholder%' THEN 'Needs Update'
    WHEN description ILIKE '%lorem%' THEN 'Needs Update'
    ELSE 'OK'
  END
FROM full_variant_products
WHERE status = 'active'
ORDER BY current_length ASC;

-- ============================================
-- Verification: Check Updated Descriptions
-- ============================================
-- After updating, verify the descriptions
SELECT 
  id,
  name,
  category,
  LENGTH(description) as description_length,
  LEFT(description, 100) || '...' as description_preview
FROM simple_products
WHERE id = 'YOUR-PRODUCT-UUID-HERE'
UNION ALL
SELECT id, name, category, LENGTH(description), LEFT(description, 100) || '...'
FROM color_only_products
WHERE id = 'YOUR-PRODUCT-UUID-HERE'
UNION ALL
SELECT id, name, category, LENGTH(description), LEFT(description, 100) || '...'
FROM size_only_products
WHERE id = 'YOUR-PRODUCT-UUID-HERE'
UNION ALL
SELECT id, name, category, LENGTH(description), LEFT(description, 100) || '...'
FROM full_variant_products
WHERE id = 'YOUR-PRODUCT-UUID-HERE';

