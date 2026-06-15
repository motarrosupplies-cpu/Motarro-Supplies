-- Fix RLS policies for blog_posts table
-- This script should be run in Supabase SQL Editor

-- First, let's check the current policies
-- You can run this to see what policies exist:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
-- FROM pg_policies 
-- WHERE tablename = 'blog_posts';

-- Drop existing incomplete policies
DROP POLICY IF EXISTS "Authenticated users can insert blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Authenticated users can update blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Authenticated users can delete blog posts" ON blog_posts;

-- Create proper RLS policies for blog_posts
-- Allow authenticated users to insert blog posts
CREATE POLICY "Authenticated users can insert blog posts" ON blog_posts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update blog posts
CREATE POLICY "Authenticated users can update blog posts" ON blog_posts
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete blog posts
CREATE POLICY "Authenticated users can delete blog posts" ON blog_posts
  FOR DELETE USING (auth.role() = 'authenticated');

-- Alternative: If you want to allow all operations for authenticated users without restrictions
-- You can use these policies instead:

-- CREATE POLICY "Allow all operations for authenticated users" ON blog_posts
--   FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- If you're still having issues, you can temporarily disable RLS for testing:
-- ALTER TABLE blog_posts DISABLE ROW LEVEL SECURITY;

-- And grant full permissions to authenticated users:
-- GRANT ALL PRIVILEGES ON TABLE blog_posts TO authenticated;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- IMPORTANT: Make sure your environment variables are set up correctly
-- You need to create a .env.local file with:
-- NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
-- NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

-- If you're using the service role key for admin operations, also add:
-- SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
