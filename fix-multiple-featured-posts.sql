-- Fix Multiple Featured Posts Issue
-- This script ensures only ONE post is featured at a time
-- It will keep the most recent published post as featured and unfeature all others

-- Step 1: Find all featured posts
SELECT 
  id,
  title,
  slug,
  featured,
  publish_date,
  status,
  created_at
FROM blog_posts
WHERE featured = true
ORDER BY publish_date DESC, created_at DESC;

-- Step 2: Keep only the most recent published post as featured
-- Unfeature all other posts
WITH most_recent_featured AS (
  SELECT id
  FROM blog_posts
  WHERE featured = true 
    AND status = 'published'
  ORDER BY publish_date DESC, created_at DESC
  LIMIT 1
)
UPDATE blog_posts
SET 
  featured = false,
  updated_at = NOW()
WHERE featured = true
  AND id NOT IN (SELECT id FROM most_recent_featured);

-- Step 3: Verify the fix
SELECT 
  id,
  title,
  slug,
  featured,
  publish_date,
  status
FROM blog_posts
WHERE featured = true
ORDER BY publish_date DESC;

-- Expected result: Only ONE post should have featured = true

