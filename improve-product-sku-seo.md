# Improve Product SKU Search Rankings on Google

## Current Situation
Your products don't have SKU support yet. Google showed "STOCAB1M" in search results for LASA Africa, which means someone searched for that SKU. We need to:

1. Add SKU field to products database
2. Create SEO-friendly URLs with SKU
3. Add structured data (JSON-LD) for better search visibility
4. Implement Open Graph and Twitter Card meta tags
5. Add sitemap with SKU-based product URLs

## Implementation Plan

### Phase 1: Database Schema Updates
Add SKU column to products table and create indexes for fast SKU lookups.

### Phase 2: URL Structure
- Current: `/products/[id]`
- New: `/products/[sku]` (more SEO-friendly)
- Fallback: Keep ID-based URLs for legacy products

### Phase 3: Structured Data
Add JSON-LD schema for products with SKU information for rich snippets.

### Phase 4: Meta Tags
Add Open Graph and Twitter Card meta tags with product information.

### Phase 5: Sitemap
Generate dynamic sitemap.xml with all product SKU URLs.

## Files to Modify
1. Database schema SQL files
2. Product API routes (add SKU field)
3. Product detail pages (add SKU to URL structure)
4. Admin forms (add SKU input field)
5. SEO metadata components

## Benefits
- Products will rank when people search by SKU
- Better search result visibility
- Professional product catalog
- Improved CTR from search results
