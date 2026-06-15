# Guide: Restore Missing Blog Post

## Problem
The blog post with slug `motarro-steps-into-the-ring-sponsoring-moses-trippy-for-tikbox8-title-challenge` is not appearing on the blog listing page.

## Most Likely Causes
1. **Status is not 'published'** - Post exists but is set to 'draft' or 'archived'
2. **Publish date is in the future** - Post won't show until the publish date
3. **Post was deleted** - Post no longer exists in database
4. **Slug mismatch** - Post exists but with a slightly different slug

## Solution

### Step 1: Run the Diagnostic Query
Run `find-missing-blog-post.sql` in Supabase SQL Editor to:
- Find the post by slug or title keywords
- Check its current status
- Check its publish_date
- See all published posts

### Step 2: Run the Fix Script
Run `restore-missing-blog-post.sql` in Supabase SQL Editor. This script will:
- ✅ Find the post if it exists
- ✅ Update status to 'published' if it's not
- ✅ Fix publish_date if it's in the future
- ✅ Set publish_date to today if it's null
- ✅ Show verification results

### Step 3: Verify
After running the fix script:
1. Check the verification query results
2. Refresh your blog page at `/blog`
3. The post should now appear in the listing

## If Post Doesn't Exist

If the post doesn't exist in the database, you'll need to:
1. Check if it was deleted (check Supabase logs)
2. Recreate it from the admin dashboard at `/admin/blog`
3. Or provide the post content and I can create a SQL script to insert it

## Quick Fix (If You Know the Post ID)

If you know the post's ID, you can run this quick fix:

```sql
UPDATE blog_posts
SET 
  status = 'published',
  publish_date = CURRENT_DATE,
  updated_at = NOW()
WHERE id = 'YOUR_POST_ID_HERE';
```

## After Fixing

The post should now:
- ✅ Appear on `/blog` listing page
- ✅ Be accessible at `/blog/motarro-steps-into-the-ring-sponsoring-moses-trippy-for-tikbox8-title-challenge`
- ✅ Be included in the sitemap
- ✅ Show up in search results

