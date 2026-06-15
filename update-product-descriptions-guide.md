# Product Description Update Guide

## Overview
This guide helps you update product descriptions using the templates in `lib/product-description-templates.ts`.

---

## Method 1: Update via Admin Panel (Recommended)

### Step 1: Generate Description
1. Open your product in the admin panel
2. Use the description generator:

```typescript
import { generateProductDescription } from '@/lib/product-description-templates';

const description = generateProductDescription({
  productName: "Premium Cotton T-Shirt",
  category: "men", // or "women", "accessories", "custom printing"
  price: 299.99,
  colors: ["White", "Black", "Navy"], // Optional
  sizes: ["S", "M", "L", "XL"], // Optional
  material: "100% premium cotton", // Optional
  location: "Johannesburg"
});
```

### Step 2: Copy Generated Description
- Copy the generated description (300-600 words)
- Paste into the product's description field in admin panel
- Save the product

---

## Method 2: Update via SQL (Bulk Update)

### Step 1: Get Product Data
Run this SQL to see products that need descriptions:

```sql
-- Get products with short or placeholder descriptions
SELECT 
  id,
  name,
  category,
  price,
  description,
  LENGTH(description) as desc_length,
  colors,
  sizes,
  CASE 
    WHEN table_name = 'simple_products' THEN 'simple_products'
    WHEN table_name = 'color_only_products' THEN 'color_only_products'
    WHEN table_name = 'size_only_products' THEN 'size_only_products'
    WHEN table_name = 'full_variant_products' THEN 'full_variant_products'
  END as table_name
FROM (
  SELECT 'simple_products' as table_name, id, name, category, price, description, colors, sizes
  FROM simple_products
  WHERE status = 'active'
  UNION ALL
  SELECT 'color_only_products', id, name, category, price, description, colors, NULL
  FROM color_only_products
  WHERE status = 'active'
  UNION ALL
  SELECT 'size_only_products', id, name, category, price, description, NULL, sizes
  FROM size_only_products
  WHERE status = 'active'
  UNION ALL
  SELECT 'full_variant_products', id, name, category, price, description, colors, sizes
  FROM full_variant_products
  WHERE status = 'active'
) all_products
WHERE LENGTH(description) < 200  -- Short descriptions
   OR description ILIKE '%placeholder%'
   OR description ILIKE '%lorem%'
ORDER BY desc_length ASC
LIMIT 10;
```

### Step 2: Generate Descriptions
For each product, use the template to generate a description, then update:

```sql
-- Example: Update a product description
UPDATE public.simple_products
SET description = 'Your generated 300-600 word description here...',
    updated_at = NOW()
WHERE id = 'product-uuid-here';
```

---

## Method 3: Use the Script (For Developers)

### Run the TypeScript Script
```bash
# In your project root
npx tsx scripts/generate-product-descriptions.ts
```

This will generate descriptions that you can then copy to your admin panel.

---

## Template Selection

The generator automatically selects the right template based on product type:

- **T-Shirts** → `generateTShirtDescription()`
- **Hoodies** → `generateHoodieDescription()`
- **Accessories** (caps, bags, mugs) → `generateAccessoryDescription()`
- **Corporate/Workwear** → `generateCorporateDescription()`
- **Event/Sports** → `generateEventDescription()`

---

## Best Practices

1. **Length**: Aim for 300-600 words per product
2. **Keywords**: Include location (Johannesburg, South Africa) naturally
3. **Uniqueness**: Each description should be unique - don't copy-paste
4. **Features**: Mention material, colors, sizes, benefits
5. **Location**: Always include "Johannesburg" or "South Africa" for local SEO

---

## Quick Start: Update 5 Products

1. Pick 5 best-selling products
2. For each product:
   - Note: Name, Category, Price, Colors, Sizes, Material
   - Generate description using template
   - Update in admin panel
3. Test the updated product pages
4. Repeat for remaining products

---

## Example Product Description

**Product:** Premium Cotton T-Shirt (Men's)
**Category:** men
**Price:** R299.99
**Colors:** White, Black, Navy
**Sizes:** S, M, L, XL, 2XL

**Generated Description:**
```
Premium Cotton T-Shirt - Men's Custom Printed T-Shirt in Johannesburg

Looking for high-quality custom printed t-shirts in Johannesburg? Our Premium Cotton T-Shirt is the perfect choice for individuals, businesses, and events seeking premium custom apparel that combines style, comfort, and durability.

Crafted with attention to detail, this men's t-shirt features 100% premium cotton fabric that feels soft against your skin while maintaining its shape wash after wash. Whether you're ordering for a corporate event, sports team, school function, or personal use, this versatile garment delivers exceptional quality at an affordable price point.

Available in 3 stunning colours: White, Black, Navy. Each colour option is carefully selected to ensure vibrant, long-lasting prints that won't fade or crack over time. Our advanced printing techniques, including sublimation and direct-to-garment (DTG) printing, ensure your custom designs, logos, or text appear crisp and professional.

Sizes range from S to 2XL, ensuring the perfect fit for everyone. Our size guide helps you find the perfect fit, and we offer custom sizing options for bulk orders. The relaxed fit design ensures comfort throughout the day, making it ideal for casual wear, team uniforms, promotional events, or branded corporate clothing.

Why Choose Our Custom T-Shirts in Johannesburg?

As a leading custom apparel provider in Johannesburg and across South Africa, we understand the importance of quality, reliability, and fast turnaround times. Our Premium Cotton T-Shirt is manufactured using industry-leading techniques and premium materials, ensuring your investment in custom apparel delivers lasting value.

For businesses in Johannesburg, our custom t-shirts serve as powerful marketing tools. Whether you're launching a new product, promoting your brand at events, or outfitting your team with professional uniforms, our custom printing services help you make a lasting impression.

Event organisers in Johannesburg trust us for their custom apparel needs. From music festivals and sports tournaments to corporate conferences and school events, our t-shirts are designed to withstand the demands of active wear while maintaining a polished, professional appearance.

Our printing process uses eco-friendly inks and sustainable practices, making this an environmentally conscious choice for businesses and individuals committed to reducing their carbon footprint. The fabric is breathable and moisture-wicking, keeping you comfortable even during extended wear.

Ordering is simple and straightforward. Choose your preferred colour and size, upload your design or logo, and our team will handle the rest. We offer competitive pricing for bulk orders, with free shipping available on orders over a certain threshold. Our production team in Johannesburg ensures fast turnaround times without compromising on quality.

Customer satisfaction is our top priority. We stand behind every product with a satisfaction guarantee, and our customer service team is always ready to assist with any questions or customisation requests.

Experience the difference that quality custom apparel makes. Order your Premium Cotton T-Shirt today and discover why businesses and individuals across Johannesburg and South Africa trust MOTARRO Supplies for their custom printing needs.
```

---

## Next Steps

1. ✅ Update 5-10 product descriptions this week
2. ✅ Test updated product pages
3. ✅ Monitor SEO improvements in Search Console
4. ✅ Continue updating remaining products

---

**Note:** Descriptions should be unique for each product. Use the templates as a starting point, but customize them for each specific product.

