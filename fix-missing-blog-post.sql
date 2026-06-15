-- Fix the missing blog post
-- This will update the post status to 'published' if it exists but is not published
-- Run this AFTER finding the post with find-missing-blog-post.sql

-- Option 1: If the post exists but status is not 'published', update it
UPDATE blog_posts
SET 
  status = 'published',
  updated_at = NOW()
WHERE slug = 'apparely-steps-into-the-ring-sponsoring-moses-trippy-for-tikbox8-title-challenge'
  AND status != 'published';

-- Option 2: If the post exists but publish_date is in the future, update it
UPDATE blog_posts
SET 
  publish_date = CURRENT_DATE,
  updated_at = NOW()
WHERE slug = 'apparely-steps-into-the-ring-sponsoring-moses-trippy-for-tikbox8-title-challenge'
  AND publish_date > CURRENT_DATE;

-- Option 3: If the post exists but has a different slug, update the slug
-- (Only run this if you found the post with a different slug)
-- UPDATE blog_posts
-- SET 
--   slug = 'apparely-steps-into-the-ring-sponsoring-moses-trippy-for-tikbox8-title-challenge',
--   updated_at = NOW()
-- WHERE id = 'YOUR_POST_ID_HERE';

-- Verify the fix
SELECT 
  id,
  title,
  slug,
  status,
  publish_date,
  featured
FROM blog_posts
WHERE slug = 'apparely-steps-into-the-ring-sponsoring-moses-trippy-for-tikbox8-title-challenge';

