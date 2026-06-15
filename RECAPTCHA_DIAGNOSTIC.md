# reCAPTCHA Diagnostic Guide

## Quick Diagnosis Steps

### 1. Check Environment Variable is Set

**In Browser Console (on contact page):**
```javascript
// This will show if the env var is set (it's public, safe to check)
console.log('Site Key:', process.env.NEXT_PUBLIC_RECAPTCHA_SITE || 'NOT SET');
```

**Expected:** Should show your actual site key (starts with `6L...`)

**If shows "NOT SET" or "REPLACE_WITH_YOUR_SITE_KEY":**
- Go to Vercel Dashboard → Project Settings → Environment Variables
- Verify `NEXT_PUBLIC_RECAPTCHA_SITE` exists
- Make sure it's set for **Production** environment
- Redeploy after adding/updating

### 2. Check if Script is Loading

**In Browser Console:**
```javascript
// Check if script tag exists
const script = document.querySelector('script[src*="recaptcha"]');
console.log('reCAPTCHA script tag:', script ? 'Found' : 'NOT FOUND');
if (script) console.log('Script src:', script.src);
```

**In Network Tab:**
1. Open DevTools → Network
2. Filter by "recaptcha"
3. Reload the page
4. Should see request to `https://www.google.com/recaptcha/api.js?render=YOUR_SITE_KEY`

### 3. Check if grecaptcha is Available

**In Browser Console:**
```javascript
// Check if grecaptcha object exists
console.log('grecaptcha available:', typeof window.grecaptcha !== 'undefined');
if (window.grecaptcha) {
  console.log('✅ reCAPTCHA is loaded');
} else {
  console.error('❌ reCAPTCHA is NOT loaded');
}
```

### 4. Test Token Generation

**In Browser Console (on contact page):**
```javascript
// Replace with your actual site key
const siteKey = 'YOUR_SITE_KEY_HERE';

if (window.grecaptcha) {
  window.grecaptcha.ready(async () => {
    try {
      const token = await window.grecaptcha.execute(siteKey, {
        action: 'test'
      });
      console.log('✅ Token generated:', token.substring(0, 30) + '...');
    } catch (error) {
      console.error('❌ Token generation failed:', error);
    }
  });
} else {
  console.error('❌ grecaptcha not available');
}
```

## Common Issues & Solutions

### Issue: "NOT SET" or "REPLACE_WITH_YOUR_SITE_KEY"

**Solution:**
1. Go to Vercel → Project Settings → Environment Variables
2. Add `NEXT_PUBLIC_RECAPTCHA_SITE` with your site key
3. Make sure it's enabled for **Production**
4. **Redeploy** the site (environment variables require redeploy)

### Issue: Script not loading in Network tab

**Possible causes:**
1. Environment variable not set → Script tag not rendered
2. CSP blocking → Check console for CSP errors
3. Invalid site key → Check reCAPTCHA admin dashboard

**Solution:**
- Verify env var is set and redeployed
- Check CSP allows `https://www.google.com` in `script-src`
- Verify site key is correct in reCAPTCHA admin

### Issue: grecaptcha is undefined

**Possible causes:**
1. Script failed to load
2. Script loaded but not ready yet
3. CSP blocking script execution

**Solution:**
- Wait a few seconds after page load, then check again
- Check Network tab for script loading errors
- Check Console for CSP violations

### Issue: CSP errors for reCAPTCHA

**Solution:**
- Verify `next.config.mjs` has been updated and deployed
- Check that `https://www.google.com` and `https://www.gstatic.com` are in:
  - `script-src`
  - `connect-src`
- Also verify `https://www.google.com/recaptcha` is in `connect-src`

## What the Console Should Show (When Working)

✅ **Success indicators:**
```
✅ reCAPTCHA loaded and ready
✅ reCAPTCHA script loaded successfully
✅ reCAPTCHA token generated
```

❌ **Error indicators:**
```
⚠️ reCAPTCHA Site Key not configured...
❌ Failed to load reCAPTCHA script
❌ reCAPTCHA execution error
❌ grecaptcha not available
```

## After Fixing - Test Form Submission

1. Fill out and submit the contact form
2. Check console for:
   - `✅ reCAPTCHA token generated`
3. Check Network tab → Filter "contact"
4. Verify POST to `/api/contact` includes `g-recaptcha-response` in payload
5. Check email arrives (if backend verification passes)

## Still Not Working?

1. **Clear browser cache** and hard refresh (Ctrl+Shift+R)
2. **Check Vercel deployment logs** for build errors
3. **Verify site key** in reCAPTCHA admin dashboard
4. **Test in incognito mode** to rule out extensions
5. **Check reCAPTCHA admin** → Statistics tab for requests

