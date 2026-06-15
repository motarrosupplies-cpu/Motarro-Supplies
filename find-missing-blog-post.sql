-- Find the missing blog post about Moses Trippy / TikBox8
-- Run this in Supabase SQL Editor

-- Search for the post by slug or title keywords
SELECT 
  id,
  title,
  slug,
  status,
  publish_date,
  created_at,
  updated_at,
  featured,
  category,
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
   OR slug LIKE '%sponsor%'
   OR title ILIKE '%moses%'
   OR title ILIKE '%trippy%'
   OR title ILIKE '%tikbox%'
   OR title ILIKE '%ring%'
   OR title ILIKE '%sponsor%'
ORDER BY created_at DESC;

-- Also check for the exact slug
SELECT 
  id,
  title,
  slug,
  status,
  publish_date
FROM blog_posts
WHERE slug = 'apparely-steps-into-the-ring-sponsoring-moses-trippy-for-tikbox8-title-challenge';

-- Check all published posts to see what's being returned
SELECT 
  id,
  title,
  slug,
  status,
  publish_date,
  featured,
  created_at
FROM blog_posts
WHERE status = 'published'
ORDER BY publish_date DESC, created_at DESC;

