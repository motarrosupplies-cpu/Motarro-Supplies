-- Fix Blog Images Database Schema and Data
-- Run this in Supabase SQL Editor to ensure images column exists and is properly configured

-- Step 1: Add images column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'blog_posts' AND column_name = 'images'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN images TEXT[] DEFAULT '{}';
    RAISE NOTICE 'Added images column to blog_posts table';
  ELSE
    RAISE NOTICE 'images column already exists';
  END IF;
END $$;

-- Step 2: Create index for better performance (if it doesn't exist)
CREATE INDEX IF NOT EXISTS idx_blog_posts_images ON blog_posts USING gin(images);

-- Step 3: Migrate any existing image_url values to images array
-- Only update posts that have image_url but empty/null images array
UPDATE blog_posts
SET images = ARRAY[image_url]
WHERE (image_url IS NOT NULL AND image_url != '')
  AND (images IS NULL OR images = '{}' OR array_length(images, 1) IS NULL);

-- Step 4: Verify the schema
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'blog_posts' 
  AND column_name IN ('image_url', 'images')
ORDER BY column_name;

-- Step 5: Check current state of blog posts
SELECT 
  id,
  title,
  slug,
  CASE 
    WHEN images IS NULL THEN 'NULL'
    WHEN images = '{}' THEN 'EMPTY ARRAY'
    WHEN array_length(images, 1) IS NULL THEN 'EMPTY'
    ELSE 'HAS ' || array_length(images, 1)::text || ' IMAGE(S)'
  END as images_status,
  CASE 
    WHEN image_url IS NULL OR image_url = '' THEN 'NO IMAGE_URL'
    ELSE 'HAS IMAGE_URL'
  END as image_url_status,
  array_length(images, 1) as images_count
FROM blog_posts
ORDER BY created_at DESC
LIMIT 20;

-- Step 6: Report summary
SELECT 
  COUNT(*) as total_posts,
  COUNT(CASE WHEN images IS NOT NULL AND images != '{}' AND array_length(images, 1) > 0 THEN 1 END) as posts_with_images,
  COUNT(CASE WHEN image_url IS NOT NULL AND image_url != '' THEN 1 END) as posts_with_image_url,
  COUNT(CASE WHEN (images IS NULL OR images = '{}' OR array_length(images, 1) IS NULL) 
               AND (image_url IS NULL OR image_url = '') THEN 1 END) as posts_without_images
FROM blog_posts;
