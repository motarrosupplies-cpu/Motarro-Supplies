-- Clean up duplicate columns in school_events table
-- Run this in your Supabase SQL Editor

-- 1. Remove duplicate columns that were added incorrectly
ALTER TABLE school_events DROP COLUMN IF EXISTS is_active;
ALTER TABLE school_events DROP COLUMN IF EXISTS updated_at;

-- 2. Verify the clean structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'school_events' 
ORDER BY ordinal_position;

-- 3. Insert a sample event using the correct column names
INSERT INTO school_events (name, description, "startDate", "endDate", "isActive") 
SELECT 
    'Sample School Event 2024',
    'This is a sample school event to test the system',
    NOW() + INTERVAL '30 days',
    NOW() + INTERVAL '60 days',
    true
WHERE NOT EXISTS (SELECT 1 FROM school_events LIMIT 1);

-- 4. Disable RLS and grant permissions
ALTER TABLE school_events DISABLE ROW LEVEL SECURITY;
GRANT ALL PRIVILEGES ON TABLE school_events TO authenticated;

-- 5. Final verification
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'school_events';
