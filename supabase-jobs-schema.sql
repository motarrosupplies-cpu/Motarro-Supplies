-- ============================================================================
-- Jobs Table Schema - Production Ready
-- Apparely.co.za - Job Management System
-- ============================================================================
-- This script creates the 'jobs' table with RLS policies and triggers.
-- Run the ENTIRE script in Supabase SQL Editor.
-- ============================================================================

-- Ensure we're in the public schema
SET search_path TO public, pg_catalog;

-- ============================================================================
-- STEP 1: Complete cleanup (handles all edge cases)
-- ============================================================================

-- Drop trigger (with exception handling)
DO $$ 
BEGIN
  BEGIN
    DROP TRIGGER IF EXISTS update_jobs_updated_at ON public.jobs;
  EXCEPTION WHEN undefined_table THEN NULL;
  END;
END $$;

-- Drop policies (with exception handling)
DO $$ 
BEGIN
  BEGIN
    DROP POLICY IF EXISTS "Jobs allow all for authenticated users" ON public.jobs;
  EXCEPTION WHEN undefined_table THEN NULL;
  END;
END $$;

-- Drop table (outside DO block - CASCADE handles everything)
DROP TABLE IF EXISTS public.jobs CASCADE;

-- ============================================================================
-- STEP 2: Create function for updated_at trigger (before table that uses it)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ============================================================================
-- STEP 3: Create jobs table
-- ============================================================================

CREATE TABLE public.jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  items TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'artwork', 'proof', 'printing', 'packing', 'done')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- STEP 4: Create indexes for better query performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_jobs_order_number ON public.jobs(order_number);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_due_date ON public.jobs(due_date);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON public.jobs(created_at DESC);

-- ============================================================================
-- STEP 5: Create trigger for updated_at
-- ============================================================================

CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- STEP 6: Enable Row Level Security (RLS)
-- ============================================================================

ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 7: Create RLS policies
-- ============================================================================

-- Policy to allow all operations for authenticated users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'jobs' 
    AND policyname = 'Jobs allow all for authenticated users'
  ) THEN
    CREATE POLICY "Jobs allow all for authenticated users" ON public.jobs
      FOR ALL 
      USING (auth.role() = 'authenticated') 
      WITH CHECK (auth.role() = 'authenticated');
  END IF;
END $$;

-- ============================================================================
-- STEP 8: Grant necessary permissions
-- ============================================================================

GRANT ALL PRIVILEGES ON TABLE public.jobs TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================================================
-- STEP 9: Verification queries (optional - uncomment to test)
-- ============================================================================

-- Verify table exists and has correct structure
-- SELECT 
--   column_name, 
--   data_type, 
--   is_nullable, 
--   column_default
-- FROM information_schema.columns 
-- WHERE table_schema = 'public' 
--   AND table_name = 'jobs'
-- ORDER BY ordinal_position;

-- Verify RLS is enabled
-- SELECT tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE schemaname = 'public' 
--   AND tablename = 'jobs';

-- Verify policy exists
-- SELECT policyname, cmd, qual, with_check
-- FROM pg_policies 
-- WHERE tablename = 'jobs';

-- ============================================================================
-- END OF SCRIPT
-- ============================================================================

