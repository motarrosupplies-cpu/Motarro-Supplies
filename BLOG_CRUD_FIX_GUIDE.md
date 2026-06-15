# Blog CRUD Fix Guide

## Issue Identified
The blog CRUD functionality in your admin panel is not updating data due to incomplete RLS (Row Level Security) policies in your Supabase database.

## Root Cause
The `blog_posts` table has RLS enabled, but the INSERT policy is incomplete in your database schema. This prevents create and update operations from working properly.

## Solution Steps

### 1. Fix RLS Policies in Supabase
Run the SQL script in your Supabase SQL Editor:

```sql
-- Drop existing incomplete policies
DROP POLICY IF EXISTS "Authenticated users can insert blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Authenticated users can update blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Authenticated users can delete blog posts" ON blog_posts;

-- Create proper RLS policies for blog_posts
CREATE POLICY "Authenticated users can insert blog posts" ON blog_posts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update blog posts" ON blog_posts
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete blog posts" ON blog_posts
  FOR DELETE USING (auth.role() = 'authenticated');
```

### 2. Set Up Environment Variables
Create a `.env.local` file in your project root with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

**To get these values:**
1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy the Project URL and anon/public key
4. For the service role key, copy the service_role key (keep this secret!)

### 3. Alternative: Disable RLS (For Testing Only)
If you want to quickly test without authentication, you can temporarily disable RLS:

```sql
ALTER TABLE blog_posts DISABLE ROW LEVEL SECURITY;
```

**⚠️ Warning:** Only use this for testing. Re-enable RLS in production.

### 4. Test the Fix
1. Restart your development server: `npm run dev`
2. Go to your admin panel: `http://localhost:3000/admin/blog`
3. Try creating, editing, or deleting a blog post
4. Check the browser's Network tab for any errors

### 5. Verify Database Changes
Check your Supabase dashboard to confirm that:
- New blog posts are being created
- Updates are being saved
- Deletions are working

## Files Modified
- `lib/supabaseClient.ts` - Added admin client support
- `app/api/blog/route.ts` - Updated to use admin client for operations
- `app/api/blog/[id]/route.ts` - Updated to use admin client for operations
- `fix-blog-posts-rls.sql` - SQL script to fix RLS policies

## Troubleshooting

### If you still have issues:

1. **Check Environment Variables**: Make sure your `.env.local` file is in the project root and has the correct values.

2. **Check Supabase Connection**: Test the connection by running:
   ```bash
   node test-blog-api.js
   ```

3. **Check Browser Console**: Look for any JavaScript errors in the browser console.

4. **Check Network Tab**: Look for failed API requests in the browser's Network tab.

5. **Verify RLS Policies**: Run this query in Supabase SQL Editor to check your policies:
   ```sql
   SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
   FROM pg_policies 
   WHERE tablename = 'blog_posts';
   ```

## Next Steps
After applying these fixes, your blog CRUD functionality should work properly. The admin panel will be able to:
- Create new blog posts
- Update existing blog posts
- Delete blog posts
- All changes will be saved to your Supabase database

If you encounter any issues, check the browser console and network tab for error messages.
