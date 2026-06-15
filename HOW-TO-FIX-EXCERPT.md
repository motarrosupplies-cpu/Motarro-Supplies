# How to Fix the Blog Post Excerpt Issue

## Problem
The excerpt is not rendering on the frontend even though it's stored in the database.

## Diagnosis
Based on the screenshots, it appears the **title** field contains the excerpt text, while the actual title might be missing or in a different field.

## Solution

### Step 1: Check Current Database Values
Run this SQL in Supabase to see what's actually stored:

```sql
SELECT 
  id,
  title,
  excerpt,
  slug,
  created_at
FROM blog_posts
WHERE slug = 'Soap-Box-Derby-2025-Laerskool-Edleen'
OR title LIKE '%Soap Box%'
ORDER BY created_at DESC
LIMIT 1;
```

### Step 2: Fix in Admin Panel

1. **Go to**: `/admin/blog`
2. **Click Edit** on the Soap Box Derby post
3. **Check the fields**:
   - **Title**: Should be "Thrilling Wheels and Sweet Thrills: Laerskool Edleen's Soap Box Derby 2025 Triumph"
   - **Excerpt**: Should be "Thrilled to have powered Laerskool Edleen's Soap Box Derby 2025 with custom Liquorice Allsorts-themed T-shirts for all Grade 1s! Proudly South African fun, creativity, and sweet victories. Thanks for choosing MOTARRO Supplies for your custom prints! #CustomTees #SoapBoxDerby"

4. **If the title field shows the excerpt text**, then:
   - Copy the text from Title field
   - Paste it into the Excerpt field
   - Put the proper title back in the Title field
   - Save

### Step 3: Verify with Browser Console

1. **Open the blog post** on the frontend
2. **Press F12** to open Developer Tools
3. **Go to Console tab**
4. **Look for**: "Fetched blog post data:"
5. **Check** the `excerpt` value - it should contain the text you see in the admin panel

### Step 4: If Still Not Working

If the excerpt is still not showing:

1. **Check browser cache**: Hard refresh with `Ctrl+F5`
2. **Check API Response**: 
   - Go to Network tab in DevTools
   - Find the request to `/api/blog/slug/...`
   - Check the Response - does it contain an `excerpt` field?

3. **Check Database**: The SQL query above will show if excerpt is actually stored

## Expected Result

On the frontend, you should see:
- **Title**: "Thrilling Wheels and Sweet Thrills: Laerskool Edleen's Soap Box Derby 2025 Triumph"
- **Image**: The hero image
- **Excerpt**: "Thrilled to have powered Laerskool Edleen's Soap Box Derby 2025 with custom Liquorice Allsorts-themed T-shirts for all Grade 1s! Proudly South African fun, creativity, and sweet victories. Thanks for choosing MOTARRO Supplies for your custom prints! #CustomTees #SoapBoxDerby"
- **Date**: "August 28, 2025"

## Common Issues

1. **Title and Excerpt swapped in database**: Title contains excerpt, excerpt is empty or in wrong field
2. **Cache issue**: Browser is showing old cached data
3. **API not returning excerpt**: The API might be filtering it out
4. **Empty excerpt in database**: The excerpt field might be empty despite appearing in admin

## Quick Fix SQL (If Needed)

If you need to swap the title and excerpt in the database directly:

```sql
-- First, see current values
SELECT id, title, excerpt 
FROM blog_posts 
WHERE slug = 'Soap-Box-Derby-2025-Laerskool-Edleen';

-- If title contains the excerpt, swap them
-- (ONLY RUN IF YOU KNOW WHAT YOU'RE DOING - BACKUP FIRST)
UPDATE blog_posts
SET 
  title = 'Thrilling Wheels and Sweet Thrills: Laerskool Edleen''s Soap Box Derby 2025 Triumph',
  excerpt = 'Thrilled to have powered Laerskool Edleen''s Soap Box Derby 2025 with custom Liquorice Allsorts-themed T-shirts for all Grade 1s! 🥳 Proudly South African fun, creativity, and sweet victories. Thanks for choosing MOTARRO Supplies for your custom prints! #CustomTees #SoapBoxDerby'
WHERE slug = 'Soap-Box-Derby-2025-Laerskool-Edleen';
```

