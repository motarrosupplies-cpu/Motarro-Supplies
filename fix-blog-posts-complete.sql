-- Complete fix for blog_posts table issues
-- Run this in your Supabase SQL Editor

-- 1. First, let's check the current state of the table and policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'blog_posts';

-- 2. Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Public can read published blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Authenticated users can read all blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Authenticated users can insert blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Authenticated users can update blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Authenticated users can delete blog posts" ON blog_posts;

-- 3. Temporarily disable RLS to ensure we can make changes
ALTER TABLE blog_posts DISABLE ROW LEVEL SECURITY;

-- 4. Grant all necessary permissions to authenticated users
GRANT ALL PRIVILEGES ON TABLE blog_posts TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 5. Re-enable RLS
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- 6. Create comprehensive RLS policies
-- Allow public to read published posts
CREATE POLICY "Public can read published blog posts" ON blog_posts
  FOR SELECT USING (status = 'published');

-- Allow authenticated users to read all posts (for admin)
CREATE POLICY "Authenticated users can read all blog posts" ON blog_posts
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert posts
CREATE POLICY "Authenticated users can insert blog posts" ON blog_posts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update posts
CREATE POLICY "Authenticated users can update blog posts" ON blog_posts
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete posts
CREATE POLICY "Authenticated users can delete blog posts" ON blog_posts
  FOR DELETE USING (auth.role() = 'authenticated');

-- 7. Alternative: If the above doesn't work, use this more permissive policy
-- (Uncomment the lines below if you still have issues)
/*
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON blog_posts;
CREATE POLICY "Allow all operations for authenticated users" ON blog_posts
  FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
*/

-- 8. Check if the updated_at trigger exists and create it if needed
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON blog_posts;

-- Create the trigger
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 9. Verify the table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'blog_posts'
ORDER BY ordinal_position;

-- 10. Test the policies by checking if they exist
SELECT policyname, cmd, roles, qual, with_check
FROM pg_policies
WHERE tablename = 'blog_posts';

-- 11. If you're still having issues, you can temporarily disable RLS completely
-- (Only use this for testing - re-enable RLS in production)
/*
ALTER TABLE blog_posts DISABLE ROW LEVEL SECURITY;
*/

-- 12. Check for any constraints that might be causing issues
SELECT conname, contype, confrelid::regclass, conkey, confkey
FROM pg_constraint
WHERE conrelid = 'blog_posts'::regclass;
