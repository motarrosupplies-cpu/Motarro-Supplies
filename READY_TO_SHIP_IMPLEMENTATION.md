# Ready-to-Ship Implementation Guide

## Overview
Complete Ready-to-Ship section for www.motarro.co.za with pre-made items (tumblers, totes, coasters, keychains, gift sets) optimized for Christmas 2025 and year-round corporate gifting.

## Files Created

### Database Schema
- **`supabase-ready-to-ship-schema.sql`** - Complete Supabase schema including:
  - `ready_to_ship_products` table
  - `ready_to_ship_bundles` table
  - `flash_sales` table
  - `stock_updates` audit table
  - Views and functions for calculated fields

### API Routes
- **`app/api/ready-to-ship/route.ts`** - GET all ready-to-ship products with filtering
- **`app/api/ready-to-ship/stock/[id]/route.ts`** - Real-time stock counter API
- **`app/api/ready-to-ship/flash-sale/route.ts`** - Active flash sale API

### Pages
- **`app/ready-to-ship/page.tsx`** - Main collection page with hero, bundle builder, and product grid
- **`app/gifts-under-r200/page.tsx`** - Filtered page for affordable gifts
- **`app/corporate-gifts/page.tsx`** - Corporate gifts with quantity pricing table
- **`app/event-favours/page.tsx`** - Event favours and party favours page

### Components
- **`components/ready-to-ship/FlashSaleBanner.tsx`** - Global flash sale banner (added to layout)
- **`components/ready-to-ship/StockCounter.tsx`** - Real-time stock counter component
- **`components/ready-to-ship/BundleBuilder.tsx`** - Interactive bundle builder (3-5 items, auto discounts)

### Navigation Updates
- **`components/navigation-menu.tsx`** - Added Ready-to-Ship menu with subcategories
- **`components/header.tsx`** - Added Ready-to-Ship to mobile menu
- **`app/sitemap.ts`** - Added all new pages to sitemap
- **`lib/sitemap.ts`** - Added all new pages to API sitemap

### Layout Updates
- **`app/layout.tsx`** - Added FlashSaleBanner component (displays globally when active)

## Features

### 1. Bundle Builder
- Select 3-5 items to unlock automatic discounts:
  - 3 items = 10% off
  - 4 items = 15% off
  - 5 items = 20% off
- Visual progress indicator
- Real-time price calculation
- One-click add to cart

### 2. Real-Time Stock Counter
- Polls Supabase every 30 seconds
- Shows stock status: In Stock, Low Stock, Out of Stock
- Color-coded badges
- Updates automatically

### 3. Flash Sale Banner
- Global banner at top of site
- Countdown timer
- Auto-refreshes every minute
- Dismissible
- Customizable colors (defaults to purple theme)

### 4. Quantity Pricing
- JSONB field for flexible pricing tiers
- Displayed on corporate gifts page
- Example: `{"10": 95.00, "25": 85.00, "50": 75.00}`

### 5. Filtering & Categories
- Category filter: tumbler, tote, coaster, keychain, gift-set
- Price filter: gifts under R200
- Gift item filter
- Event favour filter
- Featured products

## Database Setup

1. Run the SQL schema file in Supabase:
```sql
-- Execute: supabase-ready-to-ship-schema.sql
```

2. Sample data structure:
```sql
INSERT INTO ready_to_ship_products (
  name, slug, description, base_price, category, 
  stock_quantity, is_gift_item, is_event_favour,
  max_price_for_filter, primary_image, is_bundle_eligible
) VALUES (
  'Stainless Steel Tumbler 500ml',
  'stainless-steel-tumbler-500ml',
  'Premium double-wall insulated tumbler',
  199.00,
  'tumbler',
  50,
  true,
  true,
  199.00,
  '/images/tumbler.jpg',
  true
);
```

## Usage

### Adding Products
1. Insert into `ready_to_ship_products` table
2. Set `is_gift_item = true` for gift pages
3. Set `is_event_favour = true` for event favours page
4. Set `max_price_for_filter` for "gifts under R200" filter
5. Add `quantity_pricing` JSONB for corporate gifts

### Creating Flash Sales
```sql
INSERT INTO flash_sales (
  title, banner_text, starts_at, ends_at,
  discount_percent, is_active
) VALUES (
  'Christmas Flash Sale',
  '🎄 Up to 30% OFF - Ends Soon!',
  '2025-12-01 00:00:00+02',
  '2025-12-25 23:59:59+02',
  30.00,
  true
);
```

### Bundle Discounts
- Automatically calculated based on selected items
- Discounts defined in `BUNDLE_DISCOUNTS` constant in BundleBuilder component
- Can be adjusted per product via `bundle_discount_percent` field

## SEO Optimization

All pages include:
- Proper metadata and descriptions
- Canonical URLs
- Schema markup ready
- Mobile-responsive design
- Fast loading with Next.js 15

## Styling

- Uses existing Tailwind purple theme (`primary`, `secondary`, `lavender`)
- Consistent with rest of site
- Responsive grid layouts
- Hover effects and transitions

## Next Steps

1. **Run SQL schema** in Supabase dashboard
2. **Add sample products** to test functionality
3. **Create flash sale** for Christmas 2025
4. **Test bundle builder** with 3-5 items
5. **Verify stock counter** updates in real-time
6. **Test navigation** menus on mobile and desktop

## Notes

- Stock counter polls every 30 seconds (adjustable in component)
- Flash sale banner refreshes every 60 seconds
- Bundle builder max is 5 items (configurable)
- All prices include VAT (15%)
- Same-day dispatch messaging for Kempton Park

## Support

For issues or questions:
- Check Supabase logs for API errors
- Verify product status is 'active'
- Ensure stock_quantity is set correctly
- Check flash sale dates are in the future

