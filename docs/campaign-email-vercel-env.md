# Campaign email — environment variables (Vercel + MOTARRO Supplies Gmail)

Campaign sends use **Gmail SMTP**. These variables apply to **marketing campaigns** only (not invoice mail, unless you reuse `GMAIL_APP_PASSWORD` as fallback).

## Variables to set in Vercel

| Variable | Required? | Example | Purpose |
|----------|-------------|---------|---------|
| `CAMPAIGN_FROM_EMAIL` | Optional | `motarrodotcoza@gmail.com` | Address recipients see in **From** (default in code: `motarrodotcoza@gmail.com`) |
| `CAMPAIGN_FROM_NAME` | Optional | `MOTARRO Supplies` | Display name next to the address (default: `MOTARRO Supplies`) |
| `CAMPAIGN_REPLY_TO` | Optional | `motarrodotcoza@gmail.com` | Where **Reply** goes if different from From (defaults to `CAMPAIGN_FROM_EMAIL`) |
| `CAMPAIGN_GMAIL_USER` | **Recommended** | `motarrodotcoza@gmail.com` | Google account used to **sign in** to SMTP (must own the App Password). If you omit this but set `CAMPAIGN_GMAIL_APP_PASSWORD`, the app uses **`CAMPAIGN_FROM_EMAIL`** as the SMTP login so it matches the MOTARRO Supplies inbox. |
| `CAMPAIGN_GMAIL_APP_PASSWORD` | **Recommended** | *(16-char app password)* | App Password for **MOTARRO Supplies** Gmail (not the invoice account, unless you want the same) |

**Fallback (if campaign-specific vars are missing):**

- Password: `GMAIL_APP_PASSWORD`
- SMTP login user: `GMAIL_FROM`, then `dartonstaker@gmail.com`

**Important:** Gmail will show **From** as the **SMTP login account** if it does not match the address you put in `from`. So the App Password must belong to the same inbox as **From**. Either set **`CAMPAIGN_GMAIL_USER`** = `motarrodotcoza@gmail.com`, or leave it blank and set **`CAMPAIGN_GMAIL_APP_PASSWORD`** (MOTARRO Supplies) + **`CAMPAIGN_FROM_EMAIL`** = `motarrodotcoza@gmail.com` so the code logs in as that address automatically.

If you only use **`GMAIL_APP_PASSWORD`** (invoice / personal Gmail), login stays that account and **From** will appear as that address even if `CAMPAIGN_FROM_EMAIL` is MOTARRO Supplies — unless you add **Send mail as** in Google for the MOTARRO Supplies address.

---

## 1. Create a Google “App password” (MOTARRO Supplies Gmail)

App Passwords only work if **2-Step Verification** is on for that Google account.

1. Sign in to **motarrodotcoza@gmail.com** in a browser.
2. Open **Google Account** → **Security**:  
   https://myaccount.google.com/security  
3. Under **How you sign in to Google**, ensure **2-Step Verification** is **On**.  
   - If it is off, turn it on and complete the phone/authenticator setup.
4. After 2-Step is on, go to **App passwords**:  
   https://myaccount.google.com/apppasswords  
   - Or: **Security** → **2-Step Verification** → scroll to **App passwords**.
5. **Select app** → *Mail* (or *Other* and type `Vercel MOTARRO Supplies campaigns`).
6. **Select device** → *Other* → name it e.g. `Vercel production`.
7. Click **Generate**. Google shows a **16-character password** (often shown in groups of 4).  
   **Copy it once** — you cannot see it again. Store it in a password manager.
8. In Vercel, paste that value into **`CAMPAIGN_GMAIL_APP_PASSWORD`** (no spaces).

**If “App passwords” is missing:** 2-Step Verification is not fully enabled, or the account is a Workspace account where an admin disabled app passwords.

---

## 2. Add variables in Vercel

1. Open https://vercel.com → your **MOTARRO Supplies** project (**motarro-co-za** or similar).
2. **Settings** → **Environment Variables**.
3. Add each variable for **Production** (and **Preview** / **Development** if you send test campaigns from those).

**Recommended set for MOTARRO Supplies Gmail only:**

| Name | Value |
|------|--------|
| `CAMPAIGN_GMAIL_USER` | `motarrodotcoza@gmail.com` |
| `CAMPAIGN_GMAIL_APP_PASSWORD` | *(the 16-character app password)* |
| `CAMPAIGN_FROM_EMAIL` | `motarrodotcoza@gmail.com` |
| `CAMPAIGN_FROM_NAME` | `MOTARRO Supplies` |
| `CAMPAIGN_REPLY_TO` | `motarrodotcoza@gmail.com` *(optional if same as From)* |

4. Click **Save** for each.
5. **Redeploy** the latest production deployment (**Deployments** → … on latest → **Redeploy**) so new env values load on the server.

---

## 3. From still shows the wrong Gmail after setting vars?

Next.js can **inline `process.env.FOO` at build time**. If `CAMPAIGN_*` was missing during the **first** Vercel build, those values could stay empty at runtime and the app falls back to **`GMAIL_FROM`** (e.g. dartonstaker). This repo reads campaign keys with **dynamic `process.env[key]`** so runtime Vercel values always apply.

After changing campaign env vars, do a **Redeploy** (optionally **without** build cache once) so the new server bundle is deployed.

In **Vercel → Deployment → Functions → Logs**, a send logs: `[email-campaign] SMTP login: … From: …` — confirm SMTP login is `motarrodotcoza@gmail.com`.

---

## 4. Quick checklist

- [ ] 2-Step Verification on **motarrodotcoza@gmail.com**
- [ ] App password created and stored securely
- [ ] `CAMPAIGN_GMAIL_USER` + `CAMPAIGN_GMAIL_APP_PASSWORD` set in Vercel
- [ ] `CAMPAIGN_FROM_EMAIL` / `CAMPAIGN_FROM_NAME` / `CAMPAIGN_REPLY_TO` set (or rely on defaults for email/name)
- [ ] Production **redeploy** after changing env vars

---

## 5. Reference in code

- `lib/campaignMailConfig.ts` — reads these variables and builds SMTP + From headers.
