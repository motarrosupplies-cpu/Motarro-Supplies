# Phase 3: Store-Level Improvements Guide

## Overview
These improvements are done directly in Google Merchant Center and don't require code changes. They improve store quality score and overall visibility.

---

## 1. Fix Invalid Logo Issues

### Requirements:

**Rectangular Logo:**
- Aspect ratio: 2:1 (width:height)
- Size: 1000x500px to 2000x1000px
- Format: SVG, PNG, or WebP
- Max file size: 5MB
- Must be viewable at small scale (mobile)

**Square Logo:**
- Aspect ratio: 1:1 (width:height)
- Size: 500x500px to 2000x2000px
- Format: SVG, PNG, or WebP
- Max file size: 5MB
- Must be viewable at small scale (mobile)

### Steps:
1. **Create/Design Logos:**
   - Design rectangular logo (2:1 ratio) - recommended: 1200x600px
   - Design square logo (1:1 ratio) - recommended: 1000x1000px
   - Ensure logos are clear and readable at small sizes
   - Export as PNG or WebP (SVG preferred for scalability)

2. **Upload to Merchant Center:**
   - Go to **Settings** → **Store details**
   - Find "Store logo" section
   - Upload rectangular logo
   - Upload square logo
   - Save changes

3. **Verify:**
   - Check that logos display correctly
   - Test visibility at small sizes
   - Wait 24-48 hours for Google to process

---

## 2. Set Up Return Cost

### Current Status:
- Return cost: **Incomplete** (needs setup)
- This affects store quality score

### Steps:
1. Go to **Products & store** → **Shipping and returns**
2. Click **Edit** on return settings
3. Configure return shipping costs:
   - **Free returns**: Set if you offer free return shipping
   - **Paid returns**: Set return shipping cost (e.g., R50.00)
   - **No returns**: If you don't accept returns, clearly state this
4. Set return window (e.g., 30 days, 60 days)
5. Save changes

### Best Practice:
- Offer at least 30-day return window
- Free returns improve store quality score significantly
- Clear return policy improves customer trust

---

## 3. Opt In to Google Customer Reviews

### Current Status:
- Store rating: **Incomplete** (needs to opt in)

### Benefits:
- Improves store quality score
- Builds customer trust
- Shows ratings in Google Shopping results
- Can improve click-through rates

### Steps:
1. Go to **Products & store** → **Store quality**
2. Find "Store rating" section
3. Click **"Opt in to Google Customer Reviews"** or **"View Program"**
4. Follow the setup wizard:
   - Review program terms
   - Accept participation
   - Configure review collection settings
5. Add review badge to your website (optional but recommended)
6. Save changes

### Implementation on Website:
- Google will provide a badge code
- Add to checkout completion page
- Customers can leave reviews after purchase
- Reviews appear in Google Shopping results

---

## 4. Improve Image Quality & Count

### Current Status:
- High resolution images: **Good (21%)**
- Images per offer: **Fair (2.1 images)** - Target: 3-8 images

### Requirements:
- **Non-apparel**: Minimum 100x100 pixels
- **Apparel**: Minimum 250x250 pixels
- **Maximum**: 64 megapixels per image
- **File size**: Maximum 16MB per image
- **Format**: JPG, PNG, GIF, WebP, BMP

### Action Items:
1. **Review Product Images:**
   - Check all products have at least 3-4 images
   - Ensure images meet minimum size requirements
   - Verify images are high quality and clear

2. **Add More Images:**
   - For each product, add:
     - Front view
     - Back view
     - Detail/close-up shots
     - Lifestyle/context images (if available)
   - Target: 4-6 images per product

3. **Update Products:**
   - Add images through admin panel
   - Ensure images are uploaded to Supabase storage
   - Verify images appear in feed

### Code Already Handles:
- ✅ Feed automatically includes up to 10 additional images
- ✅ Images are validated for format and HTTPS
- ✅ Primary image is always included

**What You Need to Do:**
- Upload more images to products through admin panel
- Ensure images meet Google's size requirements
- Feed will automatically include them

---

## 5. Monitor Store Quality Score

### Current Status:
- Overall quality: **Good**
- Shipping experience: **Good**
- Return experience: **Good**
- Browsing experience: **Good** (High res images), **Fair** (Images per offer)

### How to Monitor:
1. Go to **Products & store** → **Store quality**
2. Check overall quality score
3. Review individual metrics:
   - Shipping experience
   - Return experience
   - Browsing experience
   - Store rating
4. Address any "Incomplete" or "Low" ratings

### Target Metrics:
- Overall quality: **Great** or **Exceptional**
- All individual metrics: **Good** or better
- Store rating: **Active** (with reviews)

---

## Implementation Checklist

### Immediate Actions (Do First):
- [ ] Create and upload compliant logos (rectangular + square)
- [ ] Set up return cost and return window
- [ ] Opt in to Google Customer Reviews

### Ongoing Improvements:
- [ ] Add more images to products (target 4-6 per product)
- [ ] Ensure all images meet size requirements
- [ ] Monitor store quality score weekly
- [ ] Respond to customer reviews (if applicable)

### Verification:
- [ ] Logos show as valid in Merchant Center
- [ ] Return cost shows as "Complete"
- [ ] Store rating shows as "Active"
- [ ] Image count per product increases
- [ ] Store quality score improves

---

## Expected Timeline

- **Logos**: 1-2 hours (design + upload)
- **Return Cost**: 15 minutes (configuration)
- **Customer Reviews**: 30 minutes (setup)
- **Image Improvements**: Ongoing (as products are updated)
- **Results Visible**: 24-48 hours after changes

---

## Success Metrics

✅ All logos valid and uploaded
✅ Return cost: Complete
✅ Store rating: Active
✅ Images per offer: 3-4+ (up from 2.1)
✅ High resolution images: 80%+ (up from 21%)
✅ Store quality score: Great or Exceptional
✅ All metrics showing "Good" or better

---

## Notes

- Store-level improvements don't require code changes
- Changes take 24-48 hours to reflect in Merchant Center
- Monitor store quality score regularly
- Customer reviews take time to accumulate
- Image improvements are ongoing as you add more product images

