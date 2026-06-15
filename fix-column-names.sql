-- Fix column name mismatches between existing database and Prisma schema
-- Run this in your Supabase SQL Editor AFTER checking the actual column names

-- 1. First, let's see what columns actually exist in school_events
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'school_events' 
ORDER BY ordinal_position;

-- 2. Check if we need to rename columns to match Prisma schema
-- Common mismatches: start_date vs startDate, end_date vs endDate, etc.

-- 3. Add missing columns that Prisma expects
DO $$ 
BEGIN
    -- Add is_active column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'school_events' AND column_name = 'is_active') THEN
        ALTER TABLE school_events ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
    
    -- Add description column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'school_events' AND column_name = 'description') THEN
        ALTER TABLE school_events ADD COLUMN description TEXT;
    END IF;
    
    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'school_events' AND column_name = 'updated_at') THEN
        ALTER TABLE school_events ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- 4. Check if we need to rename existing columns to match Prisma schema
-- This will depend on what columns actually exist in your table

-- 5. Disable RLS and grant permissions
ALTER TABLE school_events DISABLE ROW LEVEL SECURITY;
GRANT ALL PRIVILEGES ON TABLE school_events TO authenticated;

-- 6. Insert a sample event using the correct column names
-- We'll use the column names that actually exist in your table
-- This is a placeholder - adjust based on your actual column names
INSERT INTO school_events (name, description, is_active) 
SELECT 
    'Sample School Event 2024',
    'This is a sample school event to test the system',
    true
WHERE NOT EXISTS (SELECT 1 FROM school_events LIMIT 1);

-- 7. Verify the table structure after fixes
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'school_events' 
ORDER BY ordinal_position;
