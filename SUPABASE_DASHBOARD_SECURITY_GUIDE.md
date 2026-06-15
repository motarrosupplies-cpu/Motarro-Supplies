# Supabase Dashboard Security – OTP, Leaked Passwords & Postgres

This guide walks you through fixing the three Security Advisor items that must be configured in the **Supabase Dashboard** (not via SQL).

---

## 1. OTP expiry (auth_otp_long_expiry)

**Issue:** OTP expiry is set to more than 1 hour. Supabase recommends **3600 seconds (1 hour) or lower**.

### Steps

1. Open **[Supabase Dashboard](https://supabase.com/dashboard)** and select your project (e.g. **NextJs Login Dash MOTARRO Supplies**).
2. In the left sidebar, go to **Authentication**.
3. Open **Providers** (or **Auth** → **Providers**).
4. Click the **Email** provider to open its settings.
5. Find the **“OTP expiry”** (or **“Magic link / OTP expiry”**) setting.  
   It may be in seconds or in a subsection like **Rate limits** or **Email OTP**.  
   If you don’t see it under Email, try **Authentication** → **Rate limits** and look for OTP/email-link expiry.
6. Set the value to **3600** (1 hour in seconds) or lower (e.g. **900** = 15 minutes, **3600** = 1 hour).
7. Save / **Update** the provider.

**Direct links (replace `PROJECT_REF` with your project ref, e.g. `hkervihhlhktjdxcekhi`):**

- Auth providers: `https://supabase.com/dashboard/project/PROJECT_REF/auth/providers`
- Auth rate limits (OTP settings may be here): `https://supabase.com/dashboard/project/PROJECT_REF/auth/rate-limits`

After saving, refresh **Security Advisor**; the **auth_otp_long_expiry** warning should clear once the value is ≤ 3600 seconds.

---

## 2. Leaked password protection (auth_leaked_password_protection)

**Issue:** Leaked password protection (HaveIBeenPwned) is disabled. Enabling it blocks passwords that appear in known breaches.

**Note:** This is available on **Pro Plan and above**. On Free tier the option may be missing or limited.

### Steps

1. In the Supabase Dashboard, select your project.
2. Go to **Authentication** → **Providers** (or **Auth** → **Providers**).
3. Open the **Email** provider.
4. Scroll to the **Password** or **Security** section.
5. Enable **“Prevent the use of leaked passwords”** (or **“Leaked password protection”** / **“HaveIBeenPwned”**).
6. Save / **Update** the provider.

**Optional (same area):**

- Set **minimum password length** to at least **8**.
- Require **digits, lowercase, uppercase, and symbols** for new passwords.

**Direct link:**

- `https://supabase.com/dashboard/project/PROJECT_REF/auth/providers`  
  Then open **Email** and look for password/security options.

If you’re on **Free** and don’t see the option, you’ll need to upgrade to **Pro** to enable leaked password protection. After enabling, refresh **Security Advisor** to clear the **auth_leaked_password_protection** warning.

---

## 3. Postgres upgrade (vulnerable_postgres_version)

**Issue:** Your Postgres version (e.g. `supabase-postgres-15.8.1.085`) has security patches available. Upgrading applies those patches.

### Steps

1. In the Supabase Dashboard, select your project.
2. Go to **Project Settings** (gear icon in the left sidebar or in the header).
3. Open **Infrastructure** (or **Database** → **Infrastructure**).
4. Find the **“Upgrade project”** or **“Postgres version”** / **“Upgrade Postgres”** section.
5. Click **“Upgrade project”** (or the equivalent button to upgrade Postgres).
6. Follow the on-screen steps (e.g. choose a maintenance window, confirm).
7. Wait for the upgrade to finish (Supabase will apply security patches; downtime depends on size and method).

**Direct link:**

- `https://supabase.com/dashboard/project/PROJECT_REF/settings/infrastructure`

**Notes:**

- Prefer **in-place upgrade** when offered (faster, ~100 MB/s).
- If the project was **paused**, **Restore project** can also bring you onto a newer Postgres version (typical on Free tier).
- After the upgrade, refresh **Security Advisor**; the **vulnerable_postgres_version** warning should clear once you’re on a patched version.

---

## Quick reference

| Warning                         | Where in Dashboard                                      | Action                                              |
|---------------------------------|---------------------------------------------------------|-----------------------------------------------------|
| **auth_otp_long_expiry**        | Authentication → Providers → Email                     | Set OTP expiry to **3600** seconds (1 h) or lower   |
| **auth_leaked_password_protection** | Authentication → Providers → Email (password/security) | Enable **“Prevent use of leaked passwords”** (Pro) |
| **vulnerable_postgres_version** | Project Settings → Infrastructure                      | Click **“Upgrade project”** / upgrade Postgres     |

Replace `PROJECT_REF` in the links with your project reference ID (e.g. from the URL: `supabase.com/dashboard/project/hkervihhlhktjdxcekhi/...` → `PROJECT_REF` = `hkervihhlhktjdxcekhi`).
