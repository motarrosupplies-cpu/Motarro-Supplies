# GA4 Analytics Dashboard Setup Guide

## Overview

This guide will help you set up the comprehensive Google Analytics 4 (GA4) analytics dashboard for your MOTARRO Supplies admin panel. The dashboard displays real-time and historical analytics data with interactive charts and visualizations.

## Prerequisites

- Next.js 14+ application
- Supabase account and project
- Google Analytics 4 property
- Google Cloud Service Account with GA4 API access

## Step 1: Install Dependencies

All required dependencies are already installed:
- `@google-analytics/data` (v5.1.0)
- `recharts` (v2.15.0)
- `@supabase/supabase-js` (v2.49.4)

## Step 2: Set Up Google Analytics 4 API

### 2.1 Create a Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create a new one)
3. Navigate to **IAM & Admin** > **Service Accounts**
4. Click **Create Service Account**
5. Name it (e.g., "GA4 Analytics Service")
6. Click **Create and Continue**
7. Grant it the **Viewer** role (or create a custom role with GA4 read permissions)
8. Click **Done**

### 2.2 Generate Service Account Key

1. Click on the service account you just created
2. Go to the **Keys** tab
3. Click **Add Key** > **Create new key**
4. Choose **JSON** format
5. Download the JSON file

### 2.3 Enable GA4 Data API

1. In Google Cloud Console, go to **APIs & Services** > **Library**
2. Search for "Google Analytics Data API"
3. Click on it and click **Enable**

### 2.4 Grant Access to GA4 Property

1. Go to [Google Analytics](https://analytics.google.com/)
2. Select your GA4 property
3. Go to **Admin** (gear icon) > **Property Access Management**
4. Click **+** to add a user
5. Enter the service account email (from the JSON file: `client_email`)
6. Grant **Viewer** role
7. Click **Add**

### 2.5 Get Your GA4 Property ID

1. In Google Analytics, go to **Admin** > **Property Settings**
2. Copy the **Property ID** (numeric, e.g., `492312743`)
3. Note: This is different from the Measurement ID (G-XXXXXXXXXX)

## Step 3: Set Up Supabase

### 3.1 Run the Migration

Run the Supabase migration to create the analytics cache table:

```sql
-- The migration file is located at: supabase/migrations/add-analytics-cache.sql
```

You can run this via:
- Supabase Dashboard SQL Editor
- Supabase CLI: `supabase db push`
- Or manually copy and paste the SQL

### 3.2 Verify Table Creation

Check that the `analytics_cache` table was created:

```sql
SELECT * FROM analytics_cache LIMIT 1;
```

## Step 4: Configure Environment Variables

Add the following environment variables to your `.env.local` file:

```env
# Google Analytics 4
GA4_PROPERTY_ID=492312743
GOOGLE_APPLICATION_CREDENTIALS_JSON='{"type":"service_account","project_id":"your-project","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"your-service-account@your-project.iam.gserviceaccount.com","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"..."}'

# Supabase (if not already set)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

### Important Notes:

1. **GOOGLE_APPLICATION_CREDENTIALS_JSON**: 
   - Paste the entire contents of the downloaded JSON file
   - Keep it as a single-line JSON string
   - For Vercel, use the environment variable editor (not .env file)

2. **GA4_PROPERTY_ID**: 
   - Use your numeric Property ID (not the Measurement ID)
   - Default is `492312743` (already configured)

## Step 5: Deploy to Vercel

### 5.1 Add Environment Variables in Vercel

1. Go to your Vercel project settings
2. Navigate to **Settings** > **Environment Variables**
3. Add all the environment variables from Step 4
4. Make sure to add them for **Production**, **Preview**, and **Development** environments

### 5.2 Important for Vercel

- The `GOOGLE_APPLICATION_CREDENTIALS_JSON` must be a single-line JSON string
- If your JSON has newlines in the private key, they should be escaped as `\n`
- Vercel has a limit on environment variable size, so ensure the JSON is properly formatted

## Step 6: Verify Setup

### 6.1 Test the Dashboard

1. Navigate to `/admin/analytics` in your application
2. You should see:
   - Real-time visitor count
   - Top pages chart
   - Traffic sources pie chart
   - Session duration trends
   - Bounce rate
   - Top products table
   - Conversions/orders data

### 6.2 Check for Errors

- Open browser console (F12) for client-side errors
- Check Vercel function logs for server-side errors
- Verify Supabase connection in Supabase dashboard

## Step 7: Enable E-commerce Events (Optional)

For the "Top Products Viewed" and "Conversions" features to work, ensure your site tracks:

1. **view_item** event when users view products
2. **purchase** event when orders are completed

Example implementation:

```javascript
// Track product view
gtag('event', 'view_item', {
  'item_name': 'Custom T-Shirt',
  'value': 299.99,
  'currency': 'ZAR'
});

// Track purchase
gtag('event', 'purchase', {
  'transaction_id': 'T12345',
  'value': 299.99,
  'currency': 'ZAR',
  'items': [{
    'item_name': 'Custom T-Shirt',
    'price': 299.99,
    'quantity': 1
  }]
});
```

## Troubleshooting

### Issue: "No analytics data available"

**Possible causes:**
1. GA4 credentials not configured correctly
2. Service account doesn't have access to GA4 property
3. Property ID is incorrect
4. No data in GA4 yet (new property)

**Solutions:**
- Verify `GOOGLE_APPLICATION_CREDENTIALS_JSON` is correctly formatted
- Check service account email has Viewer access in GA4
- Verify `GA4_PROPERTY_ID` matches your GA4 property
- Wait 24-48 hours for data to populate in GA4

### Issue: "Failed to fetch analytics"

**Possible causes:**
1. Network error
2. GA4 API quota exceeded
3. Invalid credentials

**Solutions:**
- Check Vercel function logs
- Verify API is enabled in Google Cloud Console
- Check service account permissions

### Issue: Cache not working

**Possible causes:**
1. Supabase migration not run
2. RLS policies blocking access
3. Service role key not set

**Solutions:**
- Run the migration: `supabase/migrations/add-analytics-cache.sql`
- Check RLS policies in Supabase dashboard
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set

## Features

### Real-Time Metrics
- **Active Users**: Current visitors (cached for 5 minutes)
- **Real-time Sparkline**: Visual trend indicator

### Historical Metrics (Configurable: 7/30/90 days)
- **Top Page Views**: Bar chart of most viewed pages
- **Traffic Sources**: Pie chart showing organic/direct/paid/social traffic
- **Session Duration**: Line chart with daily averages
- **Bounce Rate**: Progress bar with comparison to average
- **Top Products**: Table of most viewed products (e-commerce)
- **Conversions**: Funnel chart showing purchase journey

### Interactive Features
- Date range selector (7/30/90 days)
- Refresh button to force data reload
- Loading states with skeleton loaders
- Error handling with retry functionality
- Mobile-responsive design

## Caching Strategy

- **Real-time data**: 5-minute cache (TTL)
- **Historical data**: 1-hour cache (TTL)
- **Cache stored in**: Supabase `analytics_cache` table
- **Automatic cleanup**: Expired entries are removed on access

## Security

- All GA4 API calls are server-side only
- Supabase RLS policies restrict cache access to admin users
- Service account credentials stored securely in environment variables
- No client-side exposure of API keys or credentials

## Performance

- Parallel data fetching for faster load times
- Efficient caching reduces API calls
- Optimized Recharts rendering
- Mobile-responsive grid layouts

## Support

For issues or questions:
1. Check Vercel function logs
2. Review Supabase logs
3. Verify Google Cloud Console API usage
4. Check browser console for client errors

---

**Status**: ✅ Production Ready

The dashboard is fully functional and ready for production use. All components are tested, responsive, and follow best practices for security and performance.

