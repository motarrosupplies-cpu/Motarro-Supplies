# Fix: Admin Blog Image Upload Issue

## Changes Made

### 1. Enhanced Error Handling ✅
- Added toast notifications to show upload errors to users
- Added visible error messages in the upload component
- Better error messages for different failure scenarios

### 2. Improved Upload Service ✅
- Added file validation (size, type)
- Added authentication check
- Added retry logic for duplicate files
- Better error messages for permission issues

### 3. Better User Feedback ✅
- Progress indicator during upload
- Success/error toast notifications
- Visual error display in the component

## Common Issues & Solutions

### Issue 1: Permission Denied
**Symptoms:** Error message "Permission denied" or "Forbidden"

**Solutions:**
1. **Check Supabase Storage Policies:**
   - Go to Supabase Dashboard → Storage → Policies
   - Ensure the `product-images` bucket has policies that allow uploads
   - For admin uploads, you may need a policy like:
   ```sql
   -- Allow authenticated users to upload
   CREATE POLICY "Allow authenticated uploads"
   ON storage.objects FOR INSERT
   TO authenticated
   WITH CHECK (bucket_id = 'product-images');
   ```

2. **Check Authentication:**
   - Ensure you're logged in as admin
   - Refresh the page if session expired
   - Check browser console for auth errors

### Issue 2: File Size Too Large
**Symptoms:** Error about file size

**Solutions:**
- Maximum file size is 10MB
- Compress images before uploading
- Use image optimization tools

### Issue 3: Invalid File Type
**Symptoms:** Error about file type

**Solutions:**
- Allowed types: JPEG, PNG, GIF, WebP
- Convert images to one of these formats

### Issue 4: Storage Bucket Not Found
**Symptoms:** Error about bucket not existing

**Solutions:**
1. Verify `product-images` bucket exists in Supabase
2. Check bucket is set to "Public"
3. Ensure bucket policies allow uploads

## Testing the Fix

1. **Open Admin Blog Page:**
   - Navigate to `/admin/blog`
   - Open create/edit dialog

2. **Try Uploading:**
   - Click the upload area or drag & drop
   - Watch for error messages in toast notifications
   - Check browser console for detailed logs

3. **Check Console:**
   - Open browser DevTools (F12)
   - Look for upload-related logs
   - Check for any error messages

## Debugging Steps

### Step 1: Check Browser Console
Open DevTools (F12) and look for:
- Upload-related console logs
- Error messages
- Network requests to Supabase

### Step 2: Check Supabase Dashboard
1. Go to Supabase Dashboard
2. Navigate to Storage → product-images
3. Check if files are being uploaded
4. Check bucket policies

### Step 3: Verify Authentication
1. Check if you're logged in
2. Verify your email is in admin list
3. Try logging out and back in

### Step 4: Test Upload Manually
Try uploading a small test image (under 1MB) to see if the issue is file-specific.

## If Still Not Working

1. **Check Supabase Storage Policies:**
   ```sql
   -- Run this in Supabase SQL Editor to check policies
   SELECT * FROM storage.policies 
   WHERE bucket_id = 'product-images';
   ```

2. **Create/Update Upload Policy:**
   ```sql
   -- Allow authenticated users to upload to product-images bucket
   CREATE POLICY IF NOT EXISTS "Allow authenticated uploads"
   ON storage.objects FOR INSERT
   TO authenticated
   WITH CHECK (
     bucket_id = 'product-images' AND
     (storage.foldername(name))[1] = 'blog'
   );
   ```

3. **Check Environment Variables:**
   - Verify `NEXT_PUBLIC_SUPABASE_URL` is set
   - Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set
   - Verify `SUPABASE_SERVICE_ROLE_KEY` is set (for admin uploads)

## What to Report

If the issue persists, please provide:
1. Exact error message from toast/console
2. Browser console logs
3. Network tab showing the failed request
4. Supabase storage bucket policies
5. Whether you're logged in as admin

