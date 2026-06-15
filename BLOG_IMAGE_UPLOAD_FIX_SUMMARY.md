# Blog Image Upload Fix - Summary

## Issues Identified

1. **API Route Issues**:
   - Images array was defaulting to `[]` even when images were uploaded
   - No validation or filtering of invalid image URLs
   - Insufficient logging to track image upload flow

2. **Database Schema**:
   - `images` column (TEXT[]) may not exist in all database instances
   - Migration script needed to ensure column exists

3. **Frontend State Management**:
   - Images might not be properly preserved when updating posts
   - No logging to track when images are uploaded vs when they're saved

## Fixes Applied

### 1. API Routes (`app/api/blog/route.ts` and `app/api/blog/[id]/route.ts`)

**POST Route (Create)**:
- Added proper array validation and filtering
- Filters out empty/invalid image URLs
- Handles both array and string inputs
- Added comprehensive logging

**PUT Route (Update)**:
- Only updates `images` field if explicitly provided (doesn't overwrite with empty array)
- Preserves existing images if `images` is undefined
- Added proper array validation
- Added comprehensive logging

### 2. Frontend (`app/admin/blog/page.tsx`)

**Create Post**:
- Added logging to track images being sent to API
- Ensures images array is properly passed

**Update Post**:
- Fixed logic to preserve existing images when updating
- Only updates images if new images are explicitly provided
- Added logging to track image updates

**ImageUpload Component Integration**:
- Added logging when images change
- Ensures images are properly passed to parent component

### 3. Database Migration (`fix-blog-images-database.sql`)

- Ensures `images` column exists
- Creates index for performance
- Migrates existing `image_url` values to `images` array
- Provides diagnostic queries to verify state

## Next Steps

### 1. Run Database Migration

Execute the SQL script in Supabase SQL Editor:
```sql
-- Run: fix-blog-images-database.sql
```

This will:
- Add `images` column if it doesn't exist
- Create index for performance
- Migrate existing `image_url` values
- Show diagnostic information

### 2. Test Image Upload

1. **Create New Post**:
   - Go to `/admin/blog`
   - Click "Create New Post"
   - Upload images using the ImageUpload component
   - Fill in required fields and submit
   - Check browser console for logs
   - Verify images are saved in database

2. **Update Existing Post**:
   - Edit an existing post
   - Upload new images or remove existing ones
   - Save changes
   - Verify images are updated correctly

3. **Check Database**:
   - Go to Supabase Dashboard
   - Check `blog_posts` table
   - Verify `images` column has the uploaded URLs
   - Run diagnostic query from migration script

### 3. Monitor Logs

Check browser console and server logs for:
- `[Blog Admin]` - Frontend image handling
- `[ImageUpload]` - Image upload component
- `[Blog API POST]` - Create post API
- `[Blog API PUT]` - Update post API

## Expected Behavior

### When Creating a Post:
1. User uploads images → Images uploaded to Supabase Storage
2. ImageUpload component calls `onImagesChange` with URLs
3. URLs stored in `editingPost.images`
4. On submit, images array sent to API
5. API validates and filters images
6. Images saved to database `images` column (TEXT[])

### When Updating a Post:
1. Existing images loaded from database
2. User can add/remove images
3. If images are changed, new array sent to API
4. If images are not changed, existing images preserved
5. API only updates `images` field if explicitly provided

## Troubleshooting

### Images Not Saving

1. **Check Database Column**:
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'blog_posts' AND column_name = 'images';
   ```
   - Should return `images | ARRAY`

2. **Check Browser Console**:
   - Look for `[Blog Admin]` and `[ImageUpload]` logs
   - Verify images are being passed correctly

3. **Check Server Logs**:
   - Look for `[Blog API POST]` or `[Blog API PUT]` logs
   - Verify images are being received and processed

4. **Check Supabase Storage**:
   - Verify files are uploaded to `product-images/blog/` folder
   - Check bucket policies allow uploads

### Images Showing as Empty Array

1. **Run Database Migration**: Ensure `images` column exists
2. **Check API Logs**: Verify images are being received
3. **Check Image URLs**: Ensure URLs are valid and accessible
4. **Check RLS Policies**: Ensure authenticated users can update posts

## Files Modified

1. `app/api/blog/route.ts` - POST handler for creating posts
2. `app/api/blog/[id]/route.ts` - PUT handler for updating posts
3. `app/admin/blog/page.tsx` - Frontend blog management
4. `components/admin/image-upload.tsx` - Image upload component
5. `fix-blog-images-database.sql` - Database migration script (NEW)

## Testing Checklist

- [ ] Run database migration script
- [ ] Create new post with images
- [ ] Verify images saved in database
- [ ] Update existing post with new images
- [ ] Verify images updated in database
- [ ] Remove images from post
- [ ] Verify images removed in database
- [ ] Check browser console for errors
- [ ] Check server logs for errors
- [ ] Verify images display correctly on frontend
