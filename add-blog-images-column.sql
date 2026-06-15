-- Add images column to blog_posts table
-- This will store an array of image URLs, just like the products table

-- Add the images column
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

-- Update the image_url to images for existing posts that have image_url
UPDATE blog_posts 
SET images = ARRAY[image_url]
WHERE image_url IS NOT NULL AND image_url != '';

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_images ON blog_posts USING gin(images);

-- Optional: Remove image_url column if you want to use only images array
-- ALTER TABLE blog_posts DROP COLUMN IF EXISTS image_url;
