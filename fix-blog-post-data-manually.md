# Fix Blog Post Data Manually

## Problem
The excerpt text is currently stored in the `title` field instead of the `excerpt` field.

Based on your console log:
- `excerpt`: "Thrilled to have powered Laerskool Edleen's Soap Box Derby 2025..." ✅ EXISTS
- `title`: Appears to be the same as excerpt ❌ SHOULD BE DIFFERENT

## Solution

### Option 1: Fix via Admin Panel (Recommended)

1. Go to `/admin/blog`
2. Click "Edit" on the Soap Box Derby post
3. Go to the "Content" tab
4. You should see:
   - **Title field**: Shows the long excerpt text
   - **Excerpt field**: May be empty or show title
5. **Swap them**:
   - Copy the text from Title field
   - Paste into Excerpt field
   - Put proper title "Thrilling Wheels and Sweet Thrills: Laerskool Edleen's Soap Box Derby 2025 Triumph" in Title field
6. Click "Update"

### Option 2: Fix via SQL (Advanced)

If you prefer to fix via SQL:

```sql
-- First check current values
SELECT id, title, excerpt 
FROM blog_posts 
WHERE slug = 'Soap-Box-Derby-2025-Laerskool-Edleen';

-- Then update (BE CAREFUL - BACKUP FIRST)
UPDATE blog_posts
SET 
  title = 'Thrilling Wheels and Sweet Thrills: Laerskool Edleen''s Soap Box Derby 2025 Triumph',
  excerpt = 'Thrilled to have powered Laerskool Edleen''s Soap Box Derby 2025 with custom Liquorice Allsorts-themed T-shirts for all Grade 1s! 🥳 Proudly South African fun, creativity, and sweet victories. Thanks for choosing MOTARRO Supplies for your custom prints! #CustomTees #SoapBoxDerby'
WHERE slug = 'Soap-Box-Derby-2025-Laerskool-Edleen';
```

## Why This Happened

Looking at the structure, it appears when you created/edited this post, the excerpt text was accidentally pasted into the Title field instead of the Excerpt field. The frontend is correctly rendering:
- Line 188: Shows `{post.title}` 
- Line 225: Shows `{post.excerpt}`

So the issue is the **data itself**, not the rendering code.

## After Fix

Once you fix the data:
1. Hard refresh the page (Ctrl+F5)
2. You should see:
   - **Large Title**: "Thrilling Wheels and Sweet Thrills..."
   - **Paragraph Below**: "Thrilled to have powered Laerskool Edleen's..."
3. Both should display correctly!

