-- Check the actual content and excerpt stored in the blog post
-- This will help us see if there's a date embedded in the content

SELECT 
  id,
  slug,
  title,
  excerpt,
  publish_date,
  LEFT(content, 500) as content_preview,
  created_at,
  updated_at
FROM blog_posts
WHERE slug LIKE '%soap%' OR slug LIKE '%edleen%'
ORDER BY created_at DESC
LIMIT 5;

-- Also check for any dates embedded in the content
SELECT 
  id,
  title,
  publish_date,
  CASE 
    WHEN content LIKE '%Posted on%' THEN 'Content has embedded date'
    WHEN content LIKE '%August%' THEN 'Content mentions August'
    ELSE 'No obvious date in content'
  END as content_date_check
FROM blog_posts
WHERE slug LIKE '%soap%' OR slug LIKE '%edleen%'
ORDER BY created_at DESC
LIMIT 5;

