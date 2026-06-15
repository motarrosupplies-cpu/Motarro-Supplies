# Checkout API Exception Fix

## Issues Identified

1. **Content Security Policy (CSP) Blocking Payfast**
   - The CSP `connect-src` directive didn't include `https://www.payfast.co.za`
   - This blocked redirects to Payfast payment gateway
   - Fixed by adding Payfast domains to CSP

2. **Service Worker Interfering with Checkout**
   - Service worker was potentially caching or interfering with checkout API calls
   - Fixed by excluding checkout/payment/order APIs from service worker handling

3. **CSP Form Action Restriction**
   - Form submissions to Payfast were potentially blocked
   - Fixed by adding Payfast to `form-action` directive

## Changes Made

### 1. `next.config.mjs`
- Added `https://www.payfast.co.za` and `https://*.payfast.co.za` to `connect-src` CSP directive
- Added Payfast domains to `form-action` CSP directive

### 2. `public/sw.js`
- Added exclusions for checkout, payment, and order API endpoints
- Service worker now skips these endpoints entirely
- Improved error handling to prevent service worker from blocking legitimate requests
- Added better error recovery for failed network requests

## Testing

After deploying these changes:
1. Clear browser cache and service worker
2. Test adding items to cart
3. Test checkout flow with Payfast
4. Verify redirect to Payfast works
5. Check browser console for any remaining CSP violations

## Browser Cache Clear Instructions

Users experiencing issues should:
1. Open browser DevTools (F12)
2. Go to Application tab
3. Click "Clear storage"
4. Check "Service Workers" and "Cache storage"
5. Click "Clear site data"
6. Refresh the page
