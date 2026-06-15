# Google Merchant Center Feed Refresh Steps

## Current Status ✅
- All products have `availability` field set (26 in_stock, 4 out_of_stock)
- Feed XML includes `<g:availability>` and `<g:brand>` tags correctly
- Feed URL: `https://www.motarro.co.za/api/google-merchant`

## Steps to Refresh Feed in Google Merchant Center

### Step 1: Access Feed Settings
1. Log in to [Google Merchant Center](https://merchants.google.com)
2. Navigate to **Products & store** → **Products** → **Feeds**
3. Find your feed (should be named something like "MOTARRO Supplies Product Feed" or similar)
4. Click on the feed name to open feed settings

### Step 2: Verify Feed URL
1. Check that the feed URL is set to: `https://www.motarro.co.za/api/google-merchant`
2. Verify the fetch schedule (should be daily or as needed)
3. If the URL is incorrect, click **Edit** and update it

### Step 3: Force Feed Refresh
**Option A: Manual Fetch (Recommended)**
1. In the feed details page, click **Fetch now** or **Refresh** button
2. Wait for the fetch to complete (usually takes 1-5 minutes)
3. Check the fetch status - should show "Success"

**Option B: Request Re-processing**
1. Go to **Products & store** → **Products** → **Diagnostics**
2. Find products with "Missing value [availability]" issues
3. Click on the issue to view details
4. Click **Request review** or **Fix issues** button
5. Google will re-process the feed within 24-48 hours

### Step 4: Verify Feed Processing
1. After fetch completes, go to **Products & store** → **Products**
2. Check product count - should match your active products
3. Go to **Diagnostics** and check for errors
4. The "Missing value [availability]" errors should disappear after processing

### Step 5: Monitor Results
1. Wait 24-48 hours for Google to fully process the feed
2. Check **Diagnostics** again to confirm issues are resolved
3. Products should change from "Limited" to "Approved" status
4. Click potential should improve from "Low" to "Good" or better

## Troubleshooting

### If Feed Still Shows Errors:
1. **Clear Browser Cache** - Sometimes cached feed is shown
2. **Check Feed XML Directly** - Visit `https://www.motarro.co.za/api/google-merchant` in browser
3. **Validate XML** - Use Google's Feed Validator tool
4. **Check Feed Schedule** - Ensure feed is set to fetch regularly (daily recommended)
5. **Wait for Processing** - Google can take 24-48 hours to fully process updates

### If Products Still Show "Limited":
1. Check that all required fields are present in feed
2. Verify images meet Google's requirements (min 100x100 for non-apparel, 250x250 for apparel)
3. Ensure product descriptions are complete
4. Add more product images (target 3-4 minimum)

## Expected Timeline
- **Immediate**: Feed fetch completes (1-5 minutes)
- **1-2 hours**: Feed processing begins
- **24-48 hours**: All products updated, diagnostics refreshed
- **3-7 days**: Full indexing and status changes visible

## Success Indicators
✅ Feed fetch shows "Success" status
✅ Product count matches active products
✅ No "Missing value [availability]" errors in Diagnostics
✅ Products show "Approved" status (not "Limited")
✅ Click potential improves

