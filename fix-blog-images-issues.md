# Blog Images Not Displaying - Issue Analysis & Fixes

## Identified Issues

### Issue 1: Default Bucket Mismatch
- The `normalizeSupabaseUrls` function uses `defaultBucket = "product-images"` 
- Blog images might be in a different bucket or already be full URLs
- Older posts might have images in `image_url` only, not in `images` array

### Issue 2: Incomplete Image Normalization
- API routes normalize `images` array but might miss edge cases
- Older posts with only `image_url` might not be properly handled
- Images stored as JSON strings instead of arrays

### Issue 3: Missing Fallback Logic
- Frontend checks `post.images` but doesn't fallback to `post.image_url` properly
- Empty arrays or null values aren't handled gracefully

## Solutions

### Fix 1: Update API Routes to Better Handle Older Posts
- Improve normalization to handle both `image_url` and `images` array
- Add fallback logic for older posts
- Better handling of different image URL formats

### Fix 2: Create Migration Script
- Migrate `image_url` to `images` array for older posts
- Normalize all image URLs to consistent format
- Handle edge cases (null, empty, JSON strings)

### Fix 3: Improve Frontend Image Display
- Add better fallback logic
- Handle both `images` array and `image_url`
- Better error handling for broken images

