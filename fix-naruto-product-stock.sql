-- Quick Fix: Add Stock to Naruto Product
-- Run this in Supabase SQL Editor

-- Add stock to the Naruto product
UPDATE products 
SET stock = 10, stock_quantity = 10 
WHERE name LIKE '%Naruto%' OR name LIKE '%Sasuke%';

-- Verify the update
SELECT 
  'NARUTO STOCK UPDATE' as operation,
  name,
  stock,
  stock_quantity,
  category,
  status
FROM products 
WHERE name LIKE '%Naruto%' OR name LIKE '%Sasuke%';

-- Check all men's products with stock
SELECT 
  'MEN PRODUCTS WITH STOCK' as check_type,
  name,
  stock,
  CASE 
    WHEN stock > 0 THEN 'IN STOCK'
    WHEN stock = 0 THEN 'OUT OF STOCK'
    ELSE 'UNKNOWN'
  END as stock_status
FROM products 
WHERE category = 'men' 
  AND status = 'active'
ORDER BY stock DESC;

DO $$
BEGIN
  RAISE NOTICE '=====================================================';
  RAISE NOTICE 'NARUTO PRODUCT STOCK FIX COMPLETED!';
  RAISE NOTICE '=====================================================';
  RAISE NOTICE 'The Naruto product should now appear on the frontend';
  RAISE NOTICE 'with "In Stock" status.';
  RAISE NOTICE '=====================================================';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Refresh your men''s page';
  RAISE NOTICE '2. Check if Naruto product appears';
  RAISE NOTICE '3. Verify it shows "In Stock"';
  RAISE NOTICE '=====================================================';
END $$;
