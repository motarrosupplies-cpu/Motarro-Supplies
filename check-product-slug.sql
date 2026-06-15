-- Check if a specific product has a slug
-- Replace the UUID with the actual product ID you want to check
SELECT 
  id,
  name,
  slug,
  seo_slug,
  category,
  status
FROM all_products_unified
WHERE id = '39d0e6c2-c93b-4c8e-a559-cc892ab120a4'
  OR slug = '39d0e6c2-c93b-4c8e-a559-cc892ab120a4'
  OR seo_slug = '39d0e6c2-c93b-4c8e-a559-cc892ab120a4';

-- Check how many products are missing slugs
SELECT 
  COUNT(*) as total_products,
  COUNT(slug) as products_with_slug,
  COUNT(seo_slug) as products_with_seo_slug,
  COUNT(*) - COUNT(slug) as products_missing_slug
FROM all_products_unified
WHERE status = 'active';

