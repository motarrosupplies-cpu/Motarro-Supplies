-- Check for the missing blog post
-- Run this in Supabase SQL Editor

-- Check if the post exists and its status
SELECT 
  id,
  title,
  slug,
  status,
  publish_date,
  created_at,
  updated_at,
  CASE 
    WHEN images IS NULL OR images = '{}' OR array_length(images, 1) IS NULL THEN 'NO IMAGES'
    ELSE 'HAS ' || array_length(images, 1)::text || ' IMAGE(S)'
  END as images_status,
  image_url
FROM blog_posts
WHERE slug LIKE '%moses%' 
   OR slug LIKE '%trippy%'
   OR slug LIKE '%tikbox%'
   OR slug LIKE '%ring%'
   OR title ILIKE '%moses%'
   OR title ILIKE '%trippy%'
   OR title ILIKE '%tikbox%'
ORDER BY created_at DESC;

-- Check all published posts to see what's being returned
SELECT 
  id,
  title,
  slug,
  status,
  publish_date,
  featured
FROM blog_posts
WHERE status = 'published'
ORDER BY publish_date DESC, created_at DESC;

