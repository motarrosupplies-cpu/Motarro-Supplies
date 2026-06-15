# PayFast passphrase setup

The IPN (Instant Transaction Notification) verifies PayFast callbacks using an MD5 signature. To do that, your app must use the **same passphrase** as configured in your PayFast merchant account.

## Why it matters

- **Without a passphrase**: In production, the IPN returns `400` and does not process payments (to prevent replay and forgery).
- **With the correct passphrase**: PayFast signs each request with it; we verify the signature and only then mark the order as paid and run fulfillment.

You already have `PAYFAST_MERCHANT_ID` and `PAYFAST_MERCHANT_KEY`. You need to add **`PAYFAST_PASSPHRASE`** as well.

---

## Step 1: Get or set the passphrase in PayFast

1. Log in to the **PayFast Merchant Dashboard**: https://www.payfast.co.za/
2. Go to **Integration** (or **Settings** → **Integration**).
3. Find **Secure passphrase** (or **Security** / **Signature**).
4. Either:
   - **If you already use a passphrase**: Copy that value (you’ll put it in Vercel in Step 2).
   - **If you don’t have one yet**: Set a strong passphrase (e.g. a long random string). Save it in PayFast and **copy it** for Step 2.

Important: The value in your app’s `PAYFAST_PASSPHRASE` must be **exactly** the same as in PayFast (same case, no extra spaces).

---

## Step 2: Add it in Vercel

1. Open your project on **Vercel** → **Settings** → **Environment Variables**.
2. Click **Add** (or **Add New**).
3. Set:
   - **Name**: `PAYFAST_PASSPHRASE`
   - **Value**: the passphrase from Step 1 (paste it; you can mask it so it’s hidden in the UI).
   - **Environments**: at least **Production** (and Preview if you test PayFast there).
4. Save.

Redeploy the app (or wait for the next deploy) so the new variable is available at runtime.

---

## Step 3: Local development

For local testing (e.g. with ngrok and PayFast sandbox), add to your `.env.local`:

```env
PAYFAST_PASSPHRASE=your_passphrase_here
```

Use the same value as in PayFast (sandbox uses the same passphrase setting).

---

## Summary

| Variable              | Where it’s used | You have it |
|-----------------------|-----------------|------------|
| `PAYFAST_MERCHANT_ID` | PayFast redirect URL (payfast-initiate) | Yes |
| `PAYFAST_MERCHANT_KEY` | PayFast redirect URL (payfast-initiate) | Yes |
| `PAYFAST_PASSPHRASE`  | IPN signature verification (payfast-ipn) | **Add this** |

After adding `PAYFAST_PASSPHRASE` in PayFast and in Vercel (and redeploying), production ITN callbacks will be verified and orders will move to paid and fulfillment as intended.
