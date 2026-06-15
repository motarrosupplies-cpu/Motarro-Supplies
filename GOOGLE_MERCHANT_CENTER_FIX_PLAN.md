# Google Merchant Center Feed Fix Plan

## Current Issues Analysis

### **1. Invalid Image Encoding [image_link]** - 18 products (58.1%)
**Severity:** Prevents products from showing in South Africa

**Root Causes:**
- Feed is querying from old `products` table instead of `all_products_unified`
- Images stored as JSON strings/arrays need proper parsing
- Image URLs may contain characters that need XML encoding
- No validation that image URLs are accessible or in correct format (JPG, PNG, GIF)
- Supabase storage URLs might need special handling
- No handling for products with no images (placeholder.jpg might not exist)

**Current Code Issues:**
```typescript
const imageLink = Array.isArray(product.images) && product.images.length > 0
  ? product.images[0]
  : 'https://www.motarro.co.za/placeholder.jpg';
```
- Assumes `product.images` is already an array (may be JSON string)
- Placeholder URL uses `www.` subdomain (should be `www.motarro.co.za`)
- Placeholder may not exist, causing 404 errors

---

### **2. Invalid Real Number [shipping_weight]** - Multiple products
**Severity:** Limits visibility in South Africa

**Root Causes:**
- Shipping weight is hardcoded to `0.5` for all products
- Format might not be correctly parsed by Google
- Need to ensure it's a valid decimal number

**Current Code:**
```xml
<g:shipping_weight>
  <g:value>0.5</g:value>
  <g:unit>kg</g:unit>
</g:shipping_weight>
```
- Hardcoded value (should be dynamic or at least validated)
- Format looks correct, but Google might reject if not properly formatted

---

### **3. Missing Value [availability]** - 1 product (3.2%)
**Severity:** Prevents product from showing

**Root Causes:**
- Stock value might be null/undefined for some products
- Logic `product.stock > 0` fails if stock is null

**Current Code:**
```typescript
<g:availability>${product.stock > 0 ? 'in stock' : 'out of stock'}</g:availability>
```
- No null/undefined check
- Should default to 'out of stock' if stock is missing

---

## Implementation Plan

### **Phase 1: Database & Data Source Fix**
1. ✅ Update feed to query from `all_products_unified` view (matching other API routes)
2. ✅ Map product fields correctly from unified view schema
3. ✅ Handle `total_stock` field from unified view

### **Phase 2: Image Encoding Fix**
1. ✅ Create helper function to parse images from JSON/array format
2. ✅ Validate image URLs are accessible and in accepted formats (JPG, PNG, GIF, WEBP)
3. ✅ Properly encode image URLs for XML (URL encoding, not just XML escaping)
4. ✅ Use fallback image if no valid images found
5. ✅ Ensure image URLs use correct domain (`www.motarro.co.za` not `www.motarro.co.za`)
6. ✅ Handle Supabase storage URLs correctly
7. ✅ Add `additional_image_link` support for products with multiple images

### **Phase 3: Shipping Weight Fix**
1. ✅ Create helper function to validate shipping weight
2. ✅ Ensure value is a valid decimal number (0.0 to 9999.9)
3. ✅ Use dynamic weight if available, otherwise use safe default
4. ✅ Format as string with proper decimal precision

### **Phase 4: Availability Fix**
1. ✅ Add null/undefined checks for stock
2. ✅ Default to 'out of stock' if stock is missing
3. ✅ Handle edge cases (stock = 0, stock = null, stock = undefined)
4. ✅ Ensure always outputs valid Google Merchant Center value

### **Phase 5: Additional Improvements**
1. ✅ Fix domain consistency (remove www subdomain)
2. ✅ Add proper error handling and logging
3. ✅ Add product filtering (only include products with valid images)
4. ✅ Add content-type headers for XML response
5. ✅ Improve XML structure and validation

---

## Technical Implementation Details

### **Image URL Validation Requirements:**
- ✅ Must be HTTPS (Google requirement)
- ✅ Must be accessible (return 200 status)
- ✅ Accepted formats: JPG, JPEG, PNG, GIF, WEBP, BMP
- ✅ Minimum size: 100x100 pixels (Google requirement)
- ✅ Maximum size: 64 megapixels
- ✅ Must be properly URL-encoded for XML

### **Shipping Weight Requirements:**
- ✅ Must be a positive real number
- ✅ Value: 0.0 to 9999.9
- ✅ Unit: kg, lb, oz, or g
- ✅ Must use decimal point (not comma)

### **Availability Requirements:**
- ✅ Valid values: 'in stock', 'out of stock', 'preorder', 'backorder'
- ✅ Required attribute (cannot be missing)
- ✅ Must accurately reflect product stock status

---

## Files to Update

1. **`app/api/google-merchant/route.ts`** - Main feed implementation
   - Update database query to use `all_products_unified`
   - Add image validation and parsing
   - Fix shipping weight
   - Fix availability
   - Improve error handling

---

## Testing Checklist

- [ ] Feed generates valid XML
- [ ] All products have valid image URLs
- [ ] Image URLs are accessible and in correct format
- [ ] Shipping weight is valid for all products
- [ ] Availability is present for all products
- [ ] Feed can be fetched via `GET /api/google-merchant`
- [ ] Feed validates in Google Merchant Center
- [ ] No "Invalid image encoding" errors
- [ ] No "Invalid real number [shipping_weight]" errors
- [ ] No "Missing value [availability]" errors

---

## Expected Results

After implementation:
- ✅ 0 "Invalid image encoding" errors (down from 18)
- ✅ 0 "Invalid real number [shipping_weight]" errors
- ✅ 0 "Missing value [availability]" errors
- ✅ All 31 products should be approved and showing in South Africa
- ✅ Improved product visibility in Google Shopping

---

## Next Steps After Fix

1. Submit updated feed to Google Merchant Center
2. Request re-crawl of feed
3. Monitor for errors in Merchant Center dashboard
4. Verify products appear in Google Shopping results
5. Track performance improvements

