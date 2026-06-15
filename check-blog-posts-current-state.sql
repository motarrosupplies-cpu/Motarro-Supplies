-- Check current state of blog posts
-- This will help diagnose date and excerpt issues

-- Count total posts
SELECT COUNT(*) as total_posts FROM blog_posts;

-- Check for null or empty excerpts
SELECT COUNT(*) as posts_with_empty_excerpts 
FROM blog_posts 
WHERE excerpt IS NULL OR excerpt = '';

-- Check for null dates
SELECT COUNT(*) as posts_with_null_dates 
FROM blog_posts 
WHERE publish_date IS NULL;

-- Show recent posts with their dates and excerpts
SELECT 
  title,
  CASE 
    WHEN excerpt IS NULL OR excerpt = '' THEN '❌ No Excerpt'
    ELSE '✅ Has Excerpt'
  END as excerpt_status,
  publish_date,
  CASE 
    WHEN publish_date IS NULL THEN '❌ No Date'
    ELSE '✅ Has Date'
  END as date_status,
  status,
  created_at
FROM blog_posts
ORDER BY created_at DESC
LIMIT 10;

