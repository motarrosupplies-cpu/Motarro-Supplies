-- Blog Posts Table Schema
-- Run this SQL in your Supabase SQL editor to create the blog_posts table

CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  category VARCHAR(100) NOT NULL DEFAULT 'Printing Techniques',
  author VARCHAR(100) NOT NULL DEFAULT 'Apparely Team',
  publish_date DATE NOT NULL DEFAULT CURRENT_DATE,
  read_time VARCHAR(50) NOT NULL DEFAULT '5 min read',
  tags TEXT[] DEFAULT '{}',
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  featured BOOLEAN NOT NULL DEFAULT false,
  image_url TEXT,
  meta_title VARCHAR(255),
  meta_description TEXT,
  seo_keywords TEXT[] DEFAULT '{}',
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_featured ON blog_posts(featured);
CREATE INDEX IF NOT EXISTS idx_blog_posts_publish_date ON blog_posts(publish_date);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);

-- Enable Row Level Security (RLS)
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Create policies for secure access
-- Public can read published posts
CREATE POLICY "Public can read published blog posts" ON blog_posts
  FOR SELECT USING (status = 'published');

-- Authenticated users can read all posts (for admin purposes)
CREATE POLICY "Authenticated users can read all blog posts" ON blog_posts
  FOR SELECT USING (auth.role() = 'authenticated');

-- Only authenticated users can insert/update/delete
CREATE POLICY "Authenticated users can insert blog posts" ON blog_posts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update blog posts" ON blog_posts
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete blog posts" ON blog_posts
  FOR DELETE USING (auth.role() = 'authenticated');

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update updated_at
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data
INSERT INTO blog_posts (
  title,
  excerpt,
  content,
  slug,
  category,
  author,
  publish_date,
  read_time,
  tags,
  status,
  featured,
  meta_title,
  meta_description,
  seo_keywords
) VALUES (
  'Top 10 Custom T-Shirt Printing Techniques for 2024',
  'Discover the most innovative and durable printing methods for custom t-shirts that will make your brand stand out...',
  '<h2>1. Direct-to-Garment (DTG) Printing</h2><p>DTG printing has revolutionized the custom apparel industry...</p><h2>2. Screen Printing</h2><p>The traditional favorite, screen printing remains one of the most popular methods...</p>',
  'top-10-custom-tshirt-printing-techniques-2024',
  'Printing Techniques',
  'Apparely Team',
  '2024-01-15',
  '8 min read',
  ARRAY['printing techniques', 'custom t-shirts', 'DTG printing', 'screen printing'],
  'published',
  true,
  'Top 10 Custom T-Shirt Printing Techniques for 2024',
  'Discover the most innovative and durable printing methods for custom t-shirts that will make your brand stand out...',
  ARRAY['custom t-shirt printing', 'printing techniques', 'DTG printing', 'screen printing']
),
(
  'Corporate Branding: How to Choose the Right Apparel for Your Team',
  'Learn the essential factors to consider when selecting corporate uniforms and branded clothing for your business...',
  '<h2>Understanding Corporate Branding</h2><p>Corporate branding through apparel is more than just putting logos on clothing...</p><h2>Choosing the Right Materials</h2><p>The material you choose for corporate apparel affects both comfort and durability...</p>',
  'corporate-branding-choose-right-apparel-team',
  'Corporate Branding',
  'Apparely Team',
  '2024-01-10',
  '6 min read',
  ARRAY['corporate branding', 'team uniforms', 'business apparel', 'brand identity'],
  'published',
  false,
  'Corporate Branding: How to Choose the Right Apparel for Your Team',
  'Learn the essential factors to consider when selecting corporate uniforms and branded clothing for your business...',
  ARRAY['corporate uniforms', 'team branding', 'business apparel', 'brand identity']
),
(
  'Sustainable Fashion: Eco-Friendly Custom Apparel Options',
  'Explore environmentally conscious choices for custom printed clothing that align with your brand values...',
  '<h2>The Rise of Sustainable Fashion</h2><p>Sustainability in fashion is no longer a trend but a necessity...</p><h2>Eco-Friendly Materials</h2><p>From organic cotton to recycled polyester, there are many sustainable options...</p>',
  'sustainable-fashion-eco-friendly-custom-apparel',
  'Sustainability',
  'Apparely Team',
  '2024-01-05',
  '7 min read',
  ARRAY['sustainable fashion', 'eco-friendly', 'organic materials', 'recycled fabrics'],
  'published',
  false,
  'Sustainable Fashion: Eco-Friendly Custom Apparel Options',
  'Explore environmentally conscious choices for custom printed clothing that align with your brand values...',
  ARRAY['sustainable fashion', 'eco-friendly apparel', 'organic cotton', 'recycled materials']
);

-- Grant necessary permissions
GRANT ALL ON blog_posts TO authenticated;
GRANT SELECT ON blog_posts TO anon;
