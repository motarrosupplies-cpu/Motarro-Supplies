# Google Merchant Center – Local Inventory / Free Local Listings

This project exposes a **local inventory feed** that Google Merchant Center can fetch to show your products and stock in **Free Local Listings**.

## Feed URL (for “Enter a link to your file”)

Use this URL in Merchant Center when adding local inventory from a file:

- **Production:** `https://www.motarro.co.za/api/google-merchant/local-inventory?v=5`
- **Local:** `http://localhost:3000/api/google-merchant/local-inventory`

Google will fetch this URL on the schedule you set (e.g. every 24 hours).

## Setup in Google Merchant Center

1. **Product data**
   - Ensure your **product feed** is set up (e.g. `https://www.motarro.co.za/api/google-merchant`).
   - In Merchant Center → **Settings** → **Data sources**, enable the product data source for **local and online stores** (or “Use product data for local and online stores”).

2. **Add local inventory**
   - Go to **Products** → **Feeds** (or the “Add local inventory” flow).
   - Choose **“Enter a link to your file”**.
   - Enter: `https://www.motarro.co.za/api/google-merchant/local-inventory?v=5`.
   - Set the schedule (e.g. daily at 12:00 AM).
   - Optionally add authentication if the URL is not public.

3. **Store code (fix “Invalid store code”)**
   - The feed’s store code must **exactly match** (case-sensitive) the store code in **Google Business Profile**.
   - **Find or set your store code:**
     1. Go to [business.google.com](https://business.google.com) and sign in.
     2. Select your **MOTARRO Supplies** location.
     3. Open the **⋮ (More)** menu → **Business Profile settings** → **Advanced settings**.
     4. Find **Store code**. If it’s empty or wrong, click the **pencil (Edit)** next to it.
     5. Enter a unique code (e.g. `motarro-za` or `APPARELY-ZA`). Use only letters/numbers, 1–64 characters. Google recommends including your brand (e.g. `motarro-za`).
     6. Click **Save**.
   - **Use that same value in the feed:** The feed default is `16947522768377102701` (MOTARRO Supplies.co.za store in Merchant Center → Businesses). To use a different store, set env var: `GOOGLE_MERCHANT_STORE_CODE=<store code>`.
   - After changing the store code in Business Profile or in env, wait for the next feed fetch (or trigger a re-fetch in Merchant Center); sync can take up to 24 hours.

## Feed contents

The feed is a **tab-separated (TSV)** file with one row per product:

- **id** – Product ID (matches the product feed).
- **store_code** – Your store identifier (must match Business Profile).
- **availability** – `in_stock`, `limited_availability`, `on_display_to_order`, or `out_of_stock`.
- **price** – Regular price in ZAR.
- **sale_price** – Sale price in ZAR when the product is on sale.
- **sale_price_effective_date** – When the sale price applies (optional).
- **quantity** – Stock quantity.

Active **native**, **Kevro**, and **Titan Jet** products are included when they also pass the primary product feed checks (title, description, HTTPS image, price &gt; 0). This prevents GMC orphan items that show “Title pending or missing”.

## Troubleshooting

- **Title pending / missing image:** Use one primary product feed only: `https://www.motarro.co.za/api/google-merchant`. Remove any duplicate supplemental product feeds that upload the same `titan-jet-*` IDs.
- **Item uploaded through multiple feeds:** Delete extra product data sources in Merchant Center → Products → Feeds. Keep one primary feed and one local inventory supplemental feed.
- **Products not showing:** Confirm the product feed is enabled for local and that product IDs in the local inventory feed match the product feed (`titan-jet-{wc_product_id}`).
- **Store code errors:** Ensure the feed’s store code matches Merchant Center (default: `16947522768377102701` for MOTARRO Supplies.co.za). Override with `GOOGLE_MERCHANT_STORE_CODE` if you use a different store.
- **Feed not updating:** The route is cached for 1 hour; Google’s fetch schedule may take up to 24 hours to reflect changes.
