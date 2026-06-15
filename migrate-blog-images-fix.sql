-- Migration Script: Fix Blog Post Images
-- This script migrates image_url to images array for older blog posts
-- Run this in Supabase SQL Editor

-- Step 1: Update posts that have image_url but empty/null images array
UPDATE blog_posts
SET images = ARRAY[image_url]
WHERE (image_url IS NOT NULL AND image_url != '')
  AND (images IS NULL OR images = '{}' OR array_length(images, 1) IS NULL)
  AND status = 'published';

-- Step 2: Handle posts where images might be stored as JSON string
-- (This handles edge cases where images might have been stored incorrectly)
UPDATE blog_posts
SET images = CASE
  WHEN images IS NULL OR images = '{}' THEN 
    CASE 
      WHEN image_url IS NOT NULL AND image_url != '' THEN ARRAY[image_url]
      ELSE '{}'::TEXT[]
    END
  ELSE images
END
WHERE status = 'published';

-- Step 3: Verify the migration
SELECT 
  id,
  title,
  slug,
  CASE 
    WHEN images IS NULL OR images = '{}' OR array_length(images, 1) IS NULL THEN 'NO IMAGES'
    ELSE 'HAS ' || array_length(images, 1)::text || ' IMAGE(S)'
  END as images_status,
  CASE 
    WHEN image_url IS NULL OR image_url = '' THEN 'NO IMAGE_URL'
    ELSE 'HAS IMAGE_URL'
  END as image_url_status
FROM blog_posts
WHERE status = 'published'
ORDER BY created_at DESC
LIMIT 20;

-- Step 4: Count fixed posts
SELECT 
  COUNT(*) as total_posts,
  COUNT(CASE WHEN images IS NOT NULL AND images != '{}' AND array_length(images, 1) > 0 THEN 1 END) as posts_with_images,
  COUNT(CASE WHEN image_url IS NOT NULL AND image_url != '' THEN 1 END) as posts_with_image_url
FROM blog_posts
WHERE status = 'published';

