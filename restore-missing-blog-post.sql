-- Restore Missing Blog Post: Moses Trippy / TikBox8
-- This script will find and fix the missing blog post
-- Run this in Supabase SQL Editor

-- Step 1: Check if the post exists with the exact slug
DO $$
DECLARE
  post_exists BOOLEAN;
  post_id UUID;
  current_status TEXT;
  current_publish_date DATE;
BEGIN
  -- Check if post exists
  SELECT EXISTS(
    SELECT 1 FROM blog_posts 
    WHERE slug = 'apparely-steps-into-the-ring-sponsoring-moses-trippy-for-tikbox8-title-challenge'
  ) INTO post_exists;
  
  IF post_exists THEN
    -- Get post details
    SELECT id, status, publish_date 
    INTO post_id, current_status, current_publish_date
    FROM blog_posts 
    WHERE slug = 'apparely-steps-into-the-ring-sponsoring-moses-trippy-for-tikbox8-title-challenge';
    
    RAISE NOTICE 'Post found with ID: %, Status: %, Publish Date: %', post_id, current_status, current_publish_date;
    
    -- Fix status if not published
    IF current_status != 'published' THEN
      UPDATE blog_posts
      SET 
        status = 'published',
        updated_at = NOW()
      WHERE id = post_id;
      RAISE NOTICE 'Updated status from % to published', current_status;
    END IF;
    
    -- Fix publish_date if in the future
    IF current_publish_date > CURRENT_DATE THEN
      UPDATE blog_posts
      SET 
        publish_date = CURRENT_DATE,
        updated_at = NOW()
      WHERE id = post_id;
      RAISE NOTICE 'Updated publish_date from % to %', current_publish_date, CURRENT_DATE;
    END IF;
    
    -- If publish_date is null, set it to today
    IF current_publish_date IS NULL THEN
      UPDATE blog_posts
      SET 
        publish_date = CURRENT_DATE,
        updated_at = NOW()
      WHERE id = post_id;
      RAISE NOTICE 'Set publish_date to %', CURRENT_DATE;
    END IF;
    
  ELSE
    RAISE NOTICE 'Post not found with exact slug. Searching for similar posts...';
    
    -- Try to find by partial match
    SELECT id, slug, status, publish_date
    INTO post_id, current_status, current_publish_date, current_status
    FROM blog_posts
    WHERE slug LIKE '%moses%' 
       OR slug LIKE '%trippy%'
       OR slug LIKE '%tikbox%'
       OR slug LIKE '%ring%'
       OR title ILIKE '%moses%'
       OR title ILIKE '%trippy%'
       OR title ILIKE '%tikbox%'
    ORDER BY created_at DESC
    LIMIT 1;
    
    IF post_id IS NOT NULL THEN
      RAISE NOTICE 'Found similar post with slug: %, ID: %, Status: %', current_status, post_id, current_status;
      RAISE NOTICE 'You may need to update the slug manually or check if this is the correct post.';
    ELSE
      RAISE NOTICE 'No similar post found. The post may need to be recreated.';
    END IF;
  END IF;
END $$;

-- Step 2: Verify the fix
SELECT 
  id,
  title,
  slug,
  status,
  publish_date,
  featured,
  created_at,
  updated_at
FROM blog_posts
WHERE slug = 'apparely-steps-into-the-ring-sponsoring-moses-trippy-for-tikbox8-title-challenge'
   OR slug LIKE '%moses%'
   OR slug LIKE '%trippy%'
   OR slug LIKE '%tikbox%'
ORDER BY created_at DESC
LIMIT 5;

-- Step 3: Show all published posts to confirm it appears
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

