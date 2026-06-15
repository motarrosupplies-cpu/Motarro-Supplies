# Update Product Descriptions - Complete Guide

## Step 1: Generate Product Descriptions

Run the generator script to fetch all products and create SEO-optimized descriptions:

```bash
npx tsx scripts/generate-product-descriptions-seo.ts
```

This will:
- Fetch all active products from your live API
- Generate unique 300-600 word descriptions for each product
- Include Johannesburg local SEO keywords
- Create 4-6 FAQs per product
- Save to `product-descriptions-seo-complete.json`

## Step 2: Review the Output

Check the generated JSON file:
- `product-descriptions-seo-complete.json` - Contains all descriptions and FAQs

## Step 3: Update Database

Run the update script to apply descriptions to your database:

```bash
npx tsx scripts/update-product-descriptions.ts
```

This script will:
- Read descriptions from the JSON file
- Find each product by slug
- Update the description field in the database
- Save FAQs to a separate file for later use
- Show a summary of successful/failed updates

## Manual Update (Alternative)

If you prefer to update manually via SQL, you can use the generated JSON to create UPDATE statements.

## Files Created

1. `product-descriptions-seo-complete.json` - All product descriptions and FAQs
2. `product-faqs.json` - FAQs extracted for schema markup implementation
3. `scripts/update-product-descriptions.ts` - Database update script

## Notes

- The update script uses the `all_products_unified` view to find products
- It updates the appropriate table based on product type
- FAQs are saved separately for future FAQPage schema implementation
- All descriptions include Johannesburg local SEO keywords

