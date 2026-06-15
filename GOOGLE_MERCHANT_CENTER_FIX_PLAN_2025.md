# Google Merchant Center Fix Plan - November 2025

## Current Issues Identified

Based on Google Merchant Center diagnostics, the following issues need to be addressed:

---

## 🔴 CRITICAL ISSUES (Preventing Products from Showing)

### **1. Missing Value [availability] - 17 products (35.4%)**
**Severity:** 🔴 CRITICAL - Prevents products from showing in South Africa

**Current Status:**
- Code has been updated to use `availability` field from database
- However, 17 products still showing "Missing value [availability]"
- Products showing as "Limited" status in Google Merchant Center

**Root Causes:**
1. Products in database may not have `availability` field populated
2. Feed may not be regenerating with new availability logic
3. Some products might have null/undefined availability values
4. Feed cache might need to be cleared

**Fix Plan:**
1. ✅ **Verify database has availability field** - Check if all products in `all_products_unified` have `availability` column
2. ✅ **Backfill missing availability values** - Run SQL to set availability based on stock for any null values
3. ✅ **Ensure feed always includes availability** - Verify `getAvailability()` function always returns a value
4. ✅ **Add validation** - Ensure no product is sent to feed without availability
5. ✅ **Force feed regeneration** - Clear cache and trigger Google to re-fetch feed
6. ✅ **Monitor feed** - Check feed XML output to verify all products have `<g:availability>` tag

**Implementation Steps:**
- [ ] Check database: `SELECT id, name, availability, stock FROM all_products_unified WHERE availability IS NULL`
- [ ] Backfill: Update all products with null availability based on stock
- [ ] Verify feed output: Test `/api/google-merchant` endpoint
- [ ] Add logging: Log any products missing availability
- [ ] Force Google refresh: Request feed re-processing in Merchant Center

---

### **2. Missing Brand Field**
**Severity:** 🔴 CRITICAL - Some products showing missing brand

**Current Status:**
- Code has `<g:brand>MOTARRO Supplies</g:brand>` hardcoded
- But some products in Google Merchant Center show missing brand

**Root Causes:**
1. Feed might have been cached before brand was added
2. Some products might be manually edited in Merchant Center (overriding feed)
3. Brand field might be getting stripped in some cases

**Fix Plan:**
1. ✅ **Verify brand is always included** - Check feed XML output
2. ✅ **Ensure brand is never empty** - Add validation
3. ✅ **Check for manual edits** - Products manually edited in Merchant Center might override feed
4. ✅ **Force feed update** - Regenerate feed and request Google to re-process

**Implementation Steps:**
- [ ] Verify feed: Check XML output includes `<g:brand>MOTARRO Supplies</g:brand>` for all products
- [ ] Add validation: Ensure brand is never null/empty
- [ ] Check Merchant Center: Review manually edited products
- [ ] Force refresh: Request feed re-processing

---

## 🟡 MEDIUM PRIORITY (Affecting Visibility/Ranking)

### **3. Products Showing as "Limited" Status**
**Severity:** 🟡 MEDIUM - Reduces visibility and click potential

**Current Status:**
- Many products showing "Limited" status instead of "Approved"
- "Limited" status reduces visibility in search results

**Root Causes:**
1. Missing required attributes (availability, brand, etc.)
2. Incomplete product data
3. Image quality issues
4. Missing product identifiers (GTIN, MPN, etc.)

**Fix Plan:**
1. ✅ **Add all required attributes** - Ensure all Google-required fields are present
2. ✅ **Add optional but recommended fields** - GTIN, MPN, color, size, material, etc.
3. ✅ **Improve image quality** - Ensure high-resolution images
4. ✅ **Add more product details** - Description, features, etc.

**Implementation Steps:**
- [ ] Add GTIN/MPN fields to database (if available)
- [ ] Add color, size, material attributes
- [ ] Ensure all products have complete descriptions
- [ ] Verify image quality meets Google standards (min 100x100 for non-apparel, 250x250 for apparel)

---

### **4. Low Click Potential / "Available Soon" Status**
**Severity:** 🟡 MEDIUM - Affects product visibility

**Current Status:**
- Many products showing "Low" click potential
- Some showing "Available soon" instead of active

**Root Causes:**
1. Incomplete product data
2. Missing product attributes
3. Low image count (currently 2.1 images per product, should be 3-8)
4. Missing product identifiers

**Fix Plan:**
1. ✅ **Increase image count** - Add more product images (target 4-6 images per product)
2. ✅ **Add product attributes** - Color, size, material, pattern, etc.
3. ✅ **Improve descriptions** - More detailed, keyword-rich descriptions
4. ✅ **Add product identifiers** - GTIN, MPN where available

**Implementation Steps:**
- [ ] Ensure all products have at least 3-4 images
- [ ] Add color/size attributes to feed
- [ ] Enhance product descriptions
- [ ] Add GTIN/MPN if available

---

## 🟢 LOW PRIORITY (Store-Level Settings)

### **5. Invalid Logo Issues**
**Severity:** 🟢 LOW - Store branding, doesn't affect product visibility

**Issues:**
- Invalid rectangular logo
- Invalid square logo

**Requirements:**
- **Rectangular logo:** 2:1 aspect ratio, 1000x500px to 2000x1000px, SVG/PNG/WebP, max 5MB
- **Square logo:** 1:1 aspect ratio, 500x500px to 2000x2000px, SVG/PNG/WebP, max 5MB
- Must be viewable at small scale (mobile)

**Fix Plan:**
1. ✅ **Create compliant logos** - Design logos meeting Google specifications
2. ✅ **Upload to Merchant Center** - Replace invalid logos
3. ✅ **Test visibility** - Ensure logos are clear at small sizes

**Implementation Steps:**
- [ ] Design/create rectangular logo (2:1 ratio, 1000x500px minimum)
- [ ] Design/create square logo (1:1 ratio, 500x500px minimum)
- [ ] Upload to Google Merchant Center > Settings > Store details
- [ ] Verify logos display correctly

---

### **6. Store Quality Issues**
**Severity:** 🟢 LOW - Affects store ranking, not product visibility

**Issues:**
- Return cost: Incomplete (needs setup)
- Store rating: Incomplete (needs to opt in to Google Customer Reviews)
- Images per offer: Fair (2.1 images, target 3-8)
- High resolution images: Good (21%)

**Fix Plan:**
1. ✅ **Set up return cost** - Configure return shipping costs in Merchant Center
2. ✅ **Opt in to Google Customer Reviews** - Enable review program
3. ✅ **Increase image count** - Already covered in Issue #4
4. ✅ **Improve image resolution** - Ensure all images meet minimum size requirements

**Implementation Steps:**
- [ ] Configure return shipping costs in Merchant Center > Shipping and returns
- [ ] Opt in to Google Customer Reviews program
- [ ] Increase product images (covered in Issue #4)
- [ ] Verify all images meet resolution requirements

---

## Implementation Priority

### Phase 1: Critical Fixes (Do First)
1. ✅ Fix Missing Value [availability] - 17 products
2. ✅ Fix Missing Brand Field
3. ✅ Verify feed regeneration

### Phase 2: Visibility Improvements
4. ✅ Add more product images (target 4-6 per product)
5. ✅ Add product attributes (color, size, material)
6. ✅ Improve product descriptions
7. ✅ Add GTIN/MPN if available

### Phase 3: Store-Level Improvements
8. ✅ Fix logo issues
9. ✅ Set up return cost
10. ✅ Opt in to Google Customer Reviews

---

## Testing & Verification

After each fix:
1. ✅ **Test feed endpoint** - Verify `/api/google-merchant` returns valid XML
2. ✅ **Check feed in browser** - View raw XML output
3. ✅ **Validate XML** - Use Google's feed validator
4. ✅ **Request feed refresh** - In Merchant Center, request feed re-processing
5. ✅ **Monitor diagnostics** - Check Google Merchant Center for resolved issues
6. ✅ **Wait 24-48 hours** - Google needs time to process feed updates

---

## Success Metrics

- ✅ Zero products with "Missing value [availability]"
- ✅ Zero products with missing brand
- ✅ All products showing "Approved" status (not "Limited")
- ✅ Click potential improved from "Low" to "Good" or better
- ✅ Store quality score improved
- ✅ All logos valid and uploaded

---

## Notes

- Feed URL: `https://www.motarro.co.za/api/google-merchant`
- Feed updates may take 24-48 hours to reflect in Google Merchant Center
- Some products manually edited in Merchant Center may override feed data
- Always test feed XML output before requesting Google to re-process

