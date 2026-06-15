-- Simple fix: Disable RLS temporarily for testing
-- Run this in your Supabase SQL Editor

-- 1. Disable RLS completely (for testing only)
ALTER TABLE blog_posts DISABLE ROW LEVEL SECURITY;

-- 2. Grant all permissions to authenticated users
GRANT ALL PRIVILEGES ON TABLE blog_posts TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 3. Verify the change
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'blog_posts';

-- This should show rowsecurity = false
-- Now test your blog CRUD functionality

-- 4. When you're ready for production, re-enable RLS with this:
/*
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Then create a simple policy:
CREATE POLICY "Allow all operations for authenticated users" ON blog_posts
  FOR ALL USING (true) WITH CHECK (true);
*/
