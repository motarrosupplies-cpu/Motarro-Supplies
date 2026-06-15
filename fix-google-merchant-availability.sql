-- Fix Google Merchant Center Availability Issues
-- Run this in Supabase SQL Editor to ensure all products have availability set

-- 1. Check for products with missing or null availability
SELECT 
  'simple_products' as table_name,
  COUNT(*) as total_products,
  COUNT(CASE WHEN availability IS NULL THEN 1 END) as null_availability,
  COUNT(CASE WHEN availability = '' THEN 1 END) as empty_availability
FROM public.simple_products
WHERE status = 'active'
UNION ALL
SELECT 
  'color_only_products' as table_name,
  COUNT(*) as total_products,
  COUNT(CASE WHEN availability IS NULL THEN 1 END) as null_availability,
  COUNT(CASE WHEN availability = '' THEN 1 END) as empty_availability
FROM public.color_only_products
WHERE status = 'active'
UNION ALL
SELECT 
  'size_only_products' as table_name,
  COUNT(*) as total_products,
  COUNT(CASE WHEN availability IS NULL THEN 1 END) as null_availability,
  COUNT(CASE WHEN availability = '' THEN 1 END) as empty_availability
FROM public.size_only_products
WHERE status = 'active'
UNION ALL
SELECT 
  'full_variant_products' as table_name,
  COUNT(*) as total_products,
  COUNT(CASE WHEN availability IS NULL THEN 1 END) as null_availability,
  COUNT(CASE WHEN availability = '' THEN 1 END) as empty_availability
FROM public.full_variant_products
WHERE status = 'active';

-- 2. Backfill availability for simple_products (use stock field)
UPDATE public.simple_products
SET availability = CASE 
  WHEN COALESCE(stock, 0) > 0 THEN 'in_stock' 
  ELSE 'out_of_stock' 
END
WHERE status = 'active' 
  AND (availability IS NULL OR availability = '' OR availability NOT IN ('in_stock', 'out_of_stock', 'preorder', 'backorder_soon'));

-- 3. Backfill availability for color_only_products (use total_stock field)
UPDATE public.color_only_products
SET availability = CASE 
  WHEN COALESCE(total_stock, 0) > 0 THEN 'in_stock' 
  ELSE 'out_of_stock' 
END
WHERE status = 'active' 
  AND (availability IS NULL OR availability = '' OR availability NOT IN ('in_stock', 'out_of_stock', 'preorder', 'backorder_soon'));

-- 4. Backfill availability for size_only_products (use total_stock field)
UPDATE public.size_only_products
SET availability = CASE 
  WHEN COALESCE(total_stock, 0) > 0 THEN 'in_stock' 
  ELSE 'out_of_stock' 
END
WHERE status = 'active' 
  AND (availability IS NULL OR availability = '' OR availability NOT IN ('in_stock', 'out_of_stock', 'preorder', 'backorder_soon'));

-- 5. Backfill availability for full_variant_products (use total_stock field)
UPDATE public.full_variant_products
SET availability = CASE 
  WHEN COALESCE(total_stock, 0) > 0 THEN 'in_stock' 
  ELSE 'out_of_stock' 
END
WHERE status = 'active' 
  AND (availability IS NULL OR availability = '' OR availability NOT IN ('in_stock', 'out_of_stock', 'preorder', 'backorder_soon'));

-- 6. Verify all active products now have valid availability
SELECT 
  'Verification: All active products should have valid availability' as check_name,
  COUNT(*) as products_with_valid_availability
FROM (
  SELECT id, availability FROM public.simple_products WHERE status = 'active'
  UNION ALL
  SELECT id, availability FROM public.color_only_products WHERE status = 'active'
  UNION ALL
  SELECT id, availability FROM public.size_only_products WHERE status = 'active'
  UNION ALL
  SELECT id, availability FROM public.full_variant_products WHERE status = 'active'
) all_products
WHERE availability IN ('in_stock', 'out_of_stock', 'preorder', 'backorder_soon');

-- 7. Check for any remaining issues
SELECT 
  'Remaining issues' as check_name,
  COUNT(*) as products_with_invalid_availability
FROM (
  SELECT id, availability FROM public.simple_products WHERE status = 'active'
  UNION ALL
  SELECT id, availability FROM public.color_only_products WHERE status = 'active'
  UNION ALL
  SELECT id, availability FROM public.size_only_products WHERE status = 'active'
  UNION ALL
  SELECT id, availability FROM public.full_variant_products WHERE status = 'active'
) all_products
WHERE availability IS NULL 
   OR availability = '' 
   OR availability NOT IN ('in_stock', 'out_of_stock', 'preorder', 'backorder_soon');

-- 8. Show availability distribution
SELECT 
  availability,
  COUNT(*) as product_count
FROM (
  SELECT availability FROM public.simple_products WHERE status = 'active'
  UNION ALL
  SELECT availability FROM public.color_only_products WHERE status = 'active'
  UNION ALL
  SELECT availability FROM public.size_only_products WHERE status = 'active'
  UNION ALL
  SELECT availability FROM public.full_variant_products WHERE status = 'active'
) all_products
GROUP BY availability
ORDER BY product_count DESC;

