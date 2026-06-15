-- Check existing table structure to identify schema mismatches
-- Run this in your Supabase SQL Editor

-- 1. Check the structure of existing school_events table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'school_events' 
ORDER BY ordinal_position;

-- 2. Check the structure of existing event_products table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'event_products' 
ORDER BY ordinal_position;

-- 3. Check the structure of existing event_product_variants table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'event_product_variants' 
ORDER BY ordinal_position;

-- 4. Check the structure of existing school_event_orders table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'school_event_orders' 
ORDER BY ordinal_position;

-- 5. Check the structure of existing school_event_order_items table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'school_event_order_items' 
ORDER BY ordinal_position;

-- 6. Check if any tables are missing
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('school_events', 'event_products', 'event_product_variants', 'school_event_orders', 'school_event_order_items')
ORDER BY tablename;
