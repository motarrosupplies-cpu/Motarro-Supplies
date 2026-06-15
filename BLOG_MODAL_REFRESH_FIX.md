# Blog Modal Refresh & Image Upload Fix

## Issues Fixed

### 1. Modal Random Refresh
**Problem**: The blog post create/edit modal was refreshing randomly when:
- Switching tabs within the form
- Updating form fields
- Dialog state changes

**Root Causes**:
- Dialog's `onOpenChange` was resetting state immediately
- Form re-renders were causing ImageUpload component to reset
- State wasn't being preserved during tab switches

**Fixes Applied**:
1. **Dialog State Management**: Modified `onOpenChange` handlers to only reset state when dialog is actually closed (not just re-rendering)
2. **Conditional Rendering**: Added conditional rendering of BlogPostForm to prevent unnecessary re-renders
3. **State Preservation**: Added delays before resetting state to allow form submission to complete

### 2. Image Upload Persistence
**Problem**: Uploaded images were being lost when:
- Switching tabs
- Form re-rendering
- Modal refreshing

**Root Causes**:
- ImageUpload component's useEffect was resetting images on every initialImages change
- Key prop was causing component remounts
- State wasn't being preserved in parent component

**Fixes Applied**:
1. **Smart Image Preservation**: Updated ImageUpload useEffect to:
   - Only update from initialImages if current images array is empty
   - Preserve uploaded images even when form re-renders
   - Only update if new data has more images (server data loaded)
2. **Stable Keys**: Updated ImageUpload key to include image count to prevent unnecessary remounts
3. **Parent State**: Ensured editingPost.images is properly preserved in parent component

## Code Changes

### app/admin/blog/page.tsx

1. **Dialog onOpenChange Handlers**:
   ```typescript
   onOpenChange={(open) => {
     if (!open) {
       setTimeout(() => {
         setEditingPost({})
         setIsCreateDialogOpen(false)
       }, 100)
     } else {
       setIsCreateDialogOpen(true)
     }
   }}
   ```

2. **Conditional Form Rendering**:
   ```typescript
   {isCreateDialogOpen && (
     <BlogPostForm ... />
   )}
   ```

3. **ImageUpload Key**:
   ```typescript
   key={isEdit && post.id ? `edit-${post.id}-${post.images?.length || 0}` : `create-${post.images?.length || 0}`}
   ```

### components/admin/image-upload.tsx

1. **Smart Image Preservation Logic**:
   - Only updates from initialImages if current images array is empty
   - Preserves uploaded images during re-renders
   - Only updates if new data has more images than current

2. **Enhanced Logging**:
   - Added console logs to track image preservation decisions
   - Logs when images are preserved vs updated

### app/admin/blog/page.tsx - BlogPostForm

1. **State Initialization**:
   - Tags and keywords initialize from post data
   - Preserves user input during re-renders

2. **Tabs Key**:
   - Added stable key to Tabs component to prevent unnecessary remounts

## Testing Checklist

- [ ] Create new post, upload images, switch tabs - images should persist
- [ ] Create new post, upload images, update fields - images should persist
- [ ] Edit existing post, add images, switch tabs - images should persist
- [ ] Edit existing post, remove images, switch tabs - changes should persist
- [ ] Close modal without saving - state should reset
- [ ] Submit form with images - images should be saved to database

## Expected Behavior

1. **Image Upload**:
   - Upload images → Images appear immediately
   - Switch tabs → Images remain visible
   - Update other fields → Images remain visible
   - Submit form → Images saved to database

2. **Modal Behavior**:
   - Opening modal → Form loads with empty/default state
   - Switching tabs → Form state preserved
   - Closing modal → State resets after delay
   - Submitting form → State resets after successful submission

## Troubleshooting

### Images Still Disappearing

1. **Check Browser Console**:
   - Look for `[ImageUpload]` logs
   - Check if images are being preserved or reset

2. **Check Form State**:
   - Look for `[BlogPostForm]` logs
   - Verify `editingPost.images` is being updated

3. **Check Dialog State**:
   - Verify dialog isn't closing/reopening unexpectedly
   - Check if `onOpenChange` is being called incorrectly

### Modal Still Refreshing

1. **Check React DevTools**:
   - Look for unnecessary re-renders
   - Check component mount/unmount cycles

2. **Check State Updates**:
   - Verify `editingPost` state is stable
   - Check if parent component is re-rendering unnecessarily
