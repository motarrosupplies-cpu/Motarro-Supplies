# reCAPTCHA v3 Testing Guide

## Quick Test Checklist

### 1. **Visual Check - Form Loads Correctly**
- ✅ Visit `https://www.motarro.co.za/contact`
- ✅ Contact form should display normally
- ✅ No visible reCAPTCHA badge (v3 is invisible)
- ✅ Form fields work as expected

### 2. **Browser Console Check**

Open browser DevTools (F12) → Console tab, and check for:

**✅ Success indicators:**
- No errors related to `grecaptcha` or reCAPTCHA
- Form submission should work without errors

**❌ Error indicators:**
- `grecaptcha is not defined` → Script not loading
- `Failed to execute 'execute'` → Site key issue
- CSP errors related to `google.com` → CSP configuration issue

### 3. **Network Tab Verification**

1. Open DevTools → Network tab
2. Filter by "recaptcha" or "google"
3. Submit the contact form
4. Look for:
   - ✅ Request to `https://www.google.com/recaptcha/api.js?render=YOUR_SITE_KEY`
   - ✅ Request to `https://www.google.com/recaptcha/api2/anchor?...` (token generation)
   - ✅ POST request to `/api/contact` with `g-recaptcha-response` in payload

### 4. **Test Form Submission**

**Test Case 1: Valid Submission**
1. Fill out the form with valid data
2. Submit the form
3. ✅ Should see "Message sent successfully!" message
4. ✅ Check your email inbox (motarrodotcoza@gmail.com) for the contact form submission

**Test Case 2: Honeypot Test (Bot Detection)**
1. Open DevTools → Elements tab
2. Find the hidden honeypot field (`#website-url`)
3. Manually fill it with any value using the console:
   ```javascript
   document.getElementById('website-url').value = 'test';
   ```
4. Submit the form
5. ✅ Should appear to succeed but NO email should be sent (silent fail)

**Test Case 3: Low reCAPTCHA Score (Suspicious Activity)**
- This is harder to test manually, but you can check server logs
- If score < 0.5, submission is blocked silently

### 5. **Server-Side Verification**

Check your deployment logs (Vercel Dashboard → Functions → `/api/contact`):

**✅ Success logs:**
```
reCAPTCHA verification passed with score: 0.9
```

**❌ Failure logs:**
```
reCAPTCHA verification failed: [error details]
reCAPTCHA score too low: 0.3
Bot detected: Honeypot field was filled
```

### 6. **Manual Console Test**

Run this in browser console on the contact page:

```javascript
// Check if reCAPTCHA is loaded
if (window.grecaptcha) {
  console.log('✅ reCAPTCHA loaded');
  
  // Test token generation
  window.grecaptcha.ready(async () => {
    try {
      const token = await window.grecaptcha.execute('YOUR_SITE_KEY', {
        action: 'test'
      });
      console.log('✅ Token generated:', token.substring(0, 20) + '...');
    } catch (error) {
      console.error('❌ Token generation failed:', error);
    }
  });
} else {
  console.error('❌ reCAPTCHA not loaded');
}
```

### 7. **Check Environment Variable**

Verify the variable is set correctly:

**In Vercel:**
1. Go to Project Settings → Environment Variables
2. Verify `NEXT_PUBLIC_RECAPTCHA_SITE` exists and has your site key
3. Verify `RECAPTCHA_SECRET_KEY` exists and has your secret key

**Quick test in browser console:**
```javascript
// This should show your site key (it's public, safe to log)
console.log('Site Key:', process.env.NEXT_PUBLIC_RECAPTCHA_SITE || 'NOT SET');
```

### 8. **reCAPTCHA Admin Dashboard**

1. Go to https://www.google.com/recaptcha/admin
2. Select your site
3. Check the "Statistics" tab
4. ✅ You should see requests coming in when the form is submitted
5. ✅ Check the score distribution (should see scores > 0.5 for legitimate users)

## Common Issues & Solutions

### Issue: "grecaptcha is not defined"
**Solution:** 
- Check CSP allows `https://www.google.com` in `script-src`
- Verify environment variable `NEXT_PUBLIC_RECAPTCHA_SITE` is set
- Check browser console for script loading errors

### Issue: Form submits but no email received
**Possible causes:**
- reCAPTCHA score too low (check logs)
- Honeypot field filled (check logs)
- Gmail SMTP issue (check `GMAIL_APP_PASSWORD` env var)

### Issue: CSP errors in console
**Solution:**
- Verify `next.config.mjs` has correct CSP settings
- Check that `https://www.google.com` and `https://www.gstatic.com` are allowed

## Expected Behavior Summary

✅ **Working correctly:**
- Form loads without errors
- Form submission succeeds
- Email is received
- No visible reCAPTCHA badge
- Console shows no errors
- Network tab shows reCAPTCHA requests

❌ **Not working:**
- Console errors about grecaptcha
- Form submission fails
- No email received (and no error message)
- CSP errors in console
- reCAPTCHA requests blocked in Network tab

## Production Monitoring

After deployment, monitor:
1. **Email delivery rate** - Should match legitimate form submissions
2. **reCAPTCHA dashboard** - Check score distribution
3. **Server logs** - Watch for verification failures
4. **Spam reduction** - Compare before/after spam submission rates

