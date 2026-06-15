# Blog Image Upload Issue - Diagnosis & Fix

## Problem Summary
Image uploads for blog posts are not being saved to the database. The `images` column shows empty arrays `[]` for most posts, and `image_url` is NULL.

## Codebase Analysis

### 1. Database Schema
- **Table**: `blog_posts`
- **Columns**:
  - `image_url` (TEXT) - Legacy single image URL
  - `images` (TEXT[]) - Array of image URLs (newer approach)
- **Migration**: `add-blog-images-column.sql` adds the `images` column

### 2. Frontend Flow
- **Component**: `app/admin/blog/page.tsx`
  - Uses `ImageUpload` component from `components/admin/image-upload.tsx`
  - Passes `folder="blog"` to upload service
  - Sends `images` array to API on create/update

### 3. Upload Service
- **File**: `lib/upload-service.ts`
  - Uploads to Supabase Storage bucket: `product-images`
  - Uses folder: `blog/` (from `folder="blog"` prop)
  - Returns public URLs

### 4. API Routes
- **POST** `/api/blog/route.ts` - Creates new post
  - Receives: `images` array from request body
  - Saves: `images: images || []`
- **PUT** `/api/blog/[id]/route.ts` - Updates post
  - Receives: `images` array from request body
  - Saves: `images: images || []`

## Root Causes Identified

### Issue 1: Database Column May Not Exist
The `images` column might not exist in the database if the migration hasn't been run.

### Issue 2: Data Type Mismatch
Supabase might be expecting a different format for TEXT[] arrays. The API sends JavaScript arrays, but Supabase might need them in a specific format.

### Issue 3: Empty Array Default
When `images` is undefined or empty, it defaults to `[]`, which might be getting saved as an empty array instead of preserving uploaded images.

### Issue 4: Image URLs Not Normalized
The uploaded URLs might not be in the correct format for storage in the database.

## Fix Strategy

1. **Verify Database Schema**: Ensure `images` column exists
2. **Fix API Data Handling**: Ensure arrays are properly formatted for Supabase
3. **Add Logging**: Add console logs to track image upload flow
4. **Fix Default Values**: Don't overwrite existing images with empty arrays

## Files to Fix

1. `app/api/blog/route.ts` - POST handler
2. `app/api/blog/[id]/route.ts` - PUT handler
3. `add-blog-images-column.sql` - Ensure migration is correct
