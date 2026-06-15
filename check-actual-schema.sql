-- Check the actual column names in event_products table
-- Run this in your Supabase SQL Editor to see the real schema

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'event_products' 
ORDER BY ordinal_position;

-- Also check event_product_variants
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'event_product_variants' 
ORDER BY ordinal_position;
