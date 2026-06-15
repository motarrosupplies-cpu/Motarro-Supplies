-- Verify School Events Order Tables Schema
-- Run this in Supabase SQL Editor to check actual column names
-- This will help identify if database uses snake_case or camelCase

-- =====================================================
-- CHECK school_event_orders TABLE COLUMNS
-- =====================================================
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'school_event_orders' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- =====================================================
-- CHECK school_event_order_items TABLE COLUMNS
-- =====================================================
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'school_event_order_items' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- =====================================================
-- CHECK school_event_order_item_addons TABLE COLUMNS
-- =====================================================
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'school_event_order_item_addons' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- =====================================================
-- SUMMARY: Check for camelCase vs snake_case
-- =====================================================
-- This query will show if columns use camelCase or snake_case
SELECT 
    'school_event_orders' as table_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns 
                     WHERE table_name = 'school_event_orders' 
                     AND column_name = 'eventId') 
        THEN 'camelCase' 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns 
                     WHERE table_name = 'school_event_orders' 
                     AND column_name = 'event_id') 
        THEN 'snake_case'
        ELSE 'unknown'
    END as naming_convention
UNION ALL
SELECT 
    'school_event_order_items' as table_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns 
                     WHERE table_name = 'school_event_order_items' 
                     AND column_name = 'orderId') 
        THEN 'camelCase' 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns 
                     WHERE table_name = 'school_event_order_items' 
                     AND column_name = 'order_id') 
        THEN 'snake_case'
        ELSE 'unknown'
    END as naming_convention;

