-- Check actual column names in school_event_orders table
-- Run this to see exactly what columns exist

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'school_event_orders' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

