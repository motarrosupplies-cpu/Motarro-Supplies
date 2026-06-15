-- Fix blog_posts table to ensure excerpt and date are properly handled
-- This migration ensures that the excerpt field is properly stored and that dates are handled correctly

-- Check if excerpt column exists and has proper constraints
DO $$ 
BEGIN
  -- Ensure excerpt is NOT NULL with a default value if empty
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'blog_posts' AND column_name = 'excerpt') THEN
    ALTER TABLE blog_posts 
    ALTER COLUMN excerpt SET NOT NULL,
    ALTER COLUMN excerpt SET DEFAULT '';
  END IF;
END $$;

-- Ensure publish_date is properly formatted as DATE
DO $$ 
BEGIN
  -- Check if publish_date column exists
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'blog_posts' AND column_name = 'publish_date') THEN
    -- Update any invalid dates to current date
    UPDATE blog_posts 
    SET publish_date = CURRENT_DATE 
    WHERE publish_date IS NULL;
    
    -- Ensure the column is NOT NULL
    ALTER TABLE blog_posts 
    ALTER COLUMN publish_date SET NOT NULL,
    ALTER COLUMN publish_date SET DEFAULT CURRENT_DATE;
  END IF;
END $$;

-- Verify the data
SELECT 
  id,
  title,
  LEFT(excerpt, 50) as excerpt_preview,
  publish_date,
  status,
  created_at,
  updated_at
FROM blog_posts
ORDER BY created_at DESC
LIMIT 5;

-- Report
DO $$ 
DECLARE
  null_excerpts INTEGER;
  null_dates INTEGER;
  total_posts INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_posts FROM blog_posts;
  SELECT COUNT(*) INTO null_excerpts FROM blog_posts WHERE excerpt IS NULL OR excerpt = '';
  SELECT COUNT(*) INTO null_dates FROM blog_posts WHERE publish_date IS NULL;
  
  RAISE NOTICE 'Total blog posts: %', total_posts;
  RAISE NOTICE 'Posts with empty excerpts: %', null_excerpts;
  RAISE NOTICE 'Posts with null dates: %', null_dates;
END $$;

