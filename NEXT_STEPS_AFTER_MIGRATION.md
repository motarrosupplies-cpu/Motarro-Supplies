# Next Steps After SQL Migration

## ✅ Step 1: Verify Migration (Do This First)

1. **Open Supabase SQL Editor**
2. **Run verification queries** from `verify-slug-migration.sql`
   - Copy each query one at a time
   - Check that all results show success

**Expected Results:**
- ✅ All 4 tables should show `seo_slug` column
- ✅ 8 indexes should be created (2 per table)
- ✅ `generate_seo_slug` function should exist
- ✅ `all_products_unified` view should include `seo_slug` column

---

## ✅ Step 2: Generate Slugs for Existing Products

1. **Open `generate-product-slugs.sql`**
2. **Copy the entire file** (all sections)
3. **Paste into Supabase SQL Editor**
4. **Run it**
5. **Check the verification query at the end** - should show 0 products without slugs

**What This Does:**
- Generates SEO-friendly slugs from product names
- Handles duplicates by adding ID suffix
- Cleans up special characters and formatting

**Example:**
- Product: "Premium Cotton T-Shirt" → slug: `premium-cotton-t-shirt`
- Product: "Men's Hoodie (Black)" → slug: `mens-hoodie-black`

---

## ✅ Step 3: Add Schema Components to Pages

### 3.1 Add Organization Schema to Root Layout

**File:** `app/layout.tsx`

Add this import at the top:
```tsx
import { OrganizationSchema } from '@/components/seo/organization-schema';
```

Add this inside the `<body>` tag (before `{children}`):
```tsx
<OrganizationSchema />
```

### 3.2 Add Product Schema to Product Pages

**File:** `app/products/[id]/page.tsx`

Add this import:
```tsx
import { ProductSchema } from '@/components/seo/product-schema';
```

Add this inside the component (after product data is loaded):
```tsx
{product && (
  <ProductSchema 
    product={product}
    baseUrl="https://www.motarro.co.za"
    availability={availabilityUrl}
    condition={conditionUrl}
  />
)}
```

### 3.3 Add Breadcrumb Schema

**File:** Create `components/breadcrumbs.tsx` (new file)

```tsx
import { BreadcrumbSchema } from '@/components/seo/breadcrumb-schema';
import Link from 'next/link';

interface BreadcrumbItem {
  name: string;
  url: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <>
      <BreadcrumbSchema items={items} />
      <nav aria-label="Breadcrumb" className="mb-4">
        <ol className="flex items-center space-x-2 text-sm">
          {items.map((item, index) => (
            <li key={index} className="flex items-center">
              {index > 0 && <span className="mx-2">/</span>}
              {index === items.length - 1 ? (
                <span className="text-gray-600">{item.name}</span>
              ) : (
                <Link href={item.url} className="text-primary hover:underline">
                  {item.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
```

Then use it on pages:
```tsx
<Breadcrumbs items={[
  { name: 'Home', url: '/' },
  { name: 'Products', url: '/products' },
  { name: product.name, url: `/products/${product.slug}` }
]} />
```

---

## ✅ Step 4: Test Slug URLs

1. **Check a product in your database:**
   ```sql
   SELECT id, name, seo_slug 
   FROM all_products_unified 
   LIMIT 5;
   ```

2. **Visit the product page using the slug:**
   - Old URL: `https://www.motarro.co.za/products/a890ec76-...` (UUID)
   - New URL: `https://www.motarro.co.za/products/premium-cotton-t-shirt` (slug)
   
   **Note:** The current route still uses `[id]` but supports both UUID and slug lookups, so both URLs will work!

3. **Verify canonical URL in page source:**
   - View page source
   - Look for `<link rel="canonical" href="...">`
   - Should show slug URL if product has a slug

---

## ✅ Step 5: Update Product Creation/Edit Forms

Make sure your admin panel generates slugs when creating/editing products:

**Example code to add to your product form:**
```tsx
import { generateProductSlug } from '@/lib/slug-utils';

// When product name changes
const handleNameChange = (name: string) => {
  const slug = generateProductSlug(
    name,
    category,
    hasColors,
    hasSizes,
    'johannesburg' // optional location
  );
  setFormData({ ...formData, name, seo_slug: slug });
};
```

---

## ✅ Step 6: Create More Location Pages

Use the template at `app/custom-t-shirt-printing-johannesburg/page.tsx` to create:

1. `/branded-corporate-clothing-johannesburg/page.tsx`
2. `/sublimation-printing-johannesburg/page.tsx`
3. `/custom-apparel-kempton-park/page.tsx`
4. `/custom-printing-randburg/page.tsx`
5. `/corporate-uniforms-johannesburg/page.tsx`
6. `/event-merchandise-johannesburg/page.tsx`

**Quick Copy Template:**
- Copy `app/custom-t-shirt-printing-johannesburg/page.tsx`
- Change the title, description, and content
- Update the URL in metadata
- Update location-specific content

---

## ✅ Step 7: Monitor & Verify

### Check Sitemap
Visit: `https://www.motarro.co.za/sitemap.xml`
- Should list all products with slug URLs
- Should include all location pages

### Check Robots.txt
Visit: `https://www.motarro.co.za/robots.txt`
- Should reference sitemap
- Should allow all public pages

### Test Schema Markup
Use Google's Rich Results Test:
- https://search.google.com/test/rich-results
- Enter a product page URL
- Should show Product schema with offers, reviews, etc.

---

## 📊 Expected Results

After completing these steps:

✅ **Technical SEO:** 55 → 85/100
- ✅ Slug-based URLs
- ✅ Dynamic sitemap
- ✅ Schema markup
- ✅ Robots.txt optimized

✅ **On-Page SEO:** 35 → 60/100
- ✅ Unique meta tags
- ✅ Proper heading hierarchy (next step)
- ✅ Rich product descriptions (use templates)

✅ **Local SEO:** 25 → 60/100
- ✅ Location pages created
- ✅ LocalBusiness schema
- ✅ NAP consistency

**Overall SEO Score:** 28 → **65/100** (after these steps)

---

## 🚀 Priority Order

1. ✅ **Verify migration** (5 min)
2. ✅ **Generate product slugs** (5 min)
3. ✅ **Add schema components** (30 min)
4. ✅ **Test slug URLs** (10 min)
5. ⏳ **Create location pages** (2-3 hours)
6. ⏳ **Update product descriptions** (ongoing)
7. ⏳ **Fix heading hierarchy** (1 hour)
8. ⏳ **Optimize images** (2 hours)

---

## 💡 Pro Tips

- **Slug Generation:** The SQL script generates basic slugs. For better SEO, manually review and improve high-value product slugs.
- **Schema Testing:** Use Google's Rich Results Test regularly to catch schema errors early.
- **Sitemap Updates:** The sitemap auto-updates, but you can manually trigger a re-crawl in Google Search Console.
- **Location Pages:** Don't just copy-paste - customize content for each location to avoid duplicate content penalties.

---

## 🆘 Need Help?

If you encounter issues:
1. Check `HOW_TO_RUN_SQL_MIGRATION.md` for troubleshooting
2. Verify all SQL queries ran successfully
3. Check browser console for JavaScript errors
4. Verify Supabase connection is working

---

**Next:** Start with Step 1 (verification), then Step 2 (generate slugs). These are the most critical!

