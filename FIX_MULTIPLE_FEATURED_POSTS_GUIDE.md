# Fix: Multiple Featured Posts Issue

## Problem
Multiple blog posts are marked as `featured = true`, causing only one to display while others are hidden from the listing.

## Root Cause
The blog listing page uses `.find()` which only returns the first featured post. If multiple posts are featured:
- Only the first one shows in the featured section
- All other featured posts are filtered out from the regular posts grid
- This causes posts to "disappear" from the listing

## Solution

### Option 1: Fix Database (Recommended)
Run `fix-multiple-featured-posts.sql` in Supabase SQL Editor. This will:
- ✅ Find all featured posts
- ✅ Keep only the most recent published post as featured
- ✅ Unfeature all other posts
- ✅ Verify the fix

### Option 2: Frontend Fix (Already Applied)
The frontend code has been updated to:
- ✅ Show the most recent featured post (by publish_date)
- ✅ Include other featured posts in the regular grid (not hidden)
- ✅ Handle multiple featured posts gracefully

## How to Use

1. **Run the SQL Script:**
   ```sql
   -- Run: fix-multiple-featured-posts.sql
   ```
   This ensures only one post is featured at a time.

2. **Or Manually Fix in Admin:**
   - Go to `/admin/blog`
   - Find posts with featured checkbox checked
   - Uncheck all except the one you want featured
   - Save changes

3. **Verify:**
   - Check `/blog` page
   - Only one post should appear in the featured section
   - All other posts should appear in the regular grid

## Best Practice
- Only feature ONE post at a time
- Feature the most recent or most important post
- Unfeature old featured posts when featuring new ones

