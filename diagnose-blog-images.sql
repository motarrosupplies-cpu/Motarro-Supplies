-- Diagnostic Query: Check Blog Post Images
-- Run this in Supabase SQL Editor to identify image issues

-- Check all blog posts and their image data
SELECT 
  id,
  title,
  slug,
  CASE 
    WHEN images IS NULL THEN 'NULL'
    WHEN images = '{}' THEN 'EMPTY ARRAY'
    WHEN array_length(images, 1) IS NULL THEN 'EMPTY'
    ELSE 'HAS IMAGES: ' || array_length(images, 1)::text
  END as images_status,
  CASE 
    WHEN image_url IS NULL OR image_url = '' THEN 'NO IMAGE_URL'
    ELSE 'HAS IMAGE_URL'
  END as image_url_status,
  image_url,
  images,
  created_at,
  updated_at
FROM blog_posts
WHERE status = 'published'
ORDER BY created_at DESC;

-- Count posts by image status
SELECT 
  CASE 
    WHEN images IS NULL OR images = '{}' OR array_length(images, 1) IS NULL THEN 'NO IMAGES ARRAY'
    ELSE 'HAS IMAGES ARRAY'
  END as images_array_status,
  CASE 
    WHEN image_url IS NULL OR image_url = '' THEN 'NO IMAGE_URL'
    ELSE 'HAS IMAGE_URL'
  END as image_url_status,
  COUNT(*) as count
FROM blog_posts
WHERE status = 'published'
GROUP BY 
  CASE 
    WHEN images IS NULL OR images = '{}' OR array_length(images, 1) IS NULL THEN 'NO IMAGES ARRAY'
    ELSE 'HAS IMAGES ARRAY'
  END,
  CASE 
    WHEN image_url IS NULL OR image_url = '' THEN 'NO IMAGE_URL'
    ELSE 'HAS IMAGE_URL'
  END
ORDER BY count DESC;

-- Sample a few posts to see actual image URLs
SELECT 
  id,
  title,
  slug,
  image_url,
  images,
  array_length(images, 1) as images_count
FROM blog_posts
WHERE status = 'published'
  AND (image_url IS NOT NULL AND image_url != '' OR (images IS NOT NULL AND images != '{}' AND array_length(images, 1) > 0))
ORDER BY created_at DESC
LIMIT 10;

